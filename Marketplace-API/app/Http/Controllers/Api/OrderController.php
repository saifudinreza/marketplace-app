<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class OrderController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'items'                    => 'required|array|min:1',
            'items.*.product_id'       => 'required|exists:products,id',
            'items.*.qty'              => 'required|integer|min:1',
            'shipping_address'         => 'required|array',
            'shipping_carrier'         => 'required|string',
            'shipping_service'         => 'required|string',
            'shipping_cost'            => 'required|numeric|min:0',
            'payment_method'           => 'required|string',
        ]);

        return DB::transaction(function () use ($request) {
            // Resolve products and check stock
            $resolvedItems = [];
            foreach ($request->items as $item) {
                $product = Product::lockForUpdate()->findOrFail($item['product_id']);
                if ($product->stock < $item['qty']) {
                    return response()->json([
                        'message' => "Stok {$product->name} tidak mencukupi (tersisa {$product->stock})",
                    ], 422);
                }
                $resolvedItems[] = [
                    'product'       => $product,
                    'qty'           => $item['qty'],
                    'product_name'  => $product->name,
                    'product_image' => $product->file_url ?? '',
                    'price'         => (float) $product->price,
                    'subtotal'      => (float) $product->price * $item['qty'],
                ];
            }

            // Calculate costs
            $subtotal       = collect($resolvedItems)->sum('subtotal');
            $shippingCost   = (float) $request->shipping_cost;
            $insuranceCost  = round(max(500, $subtotal * 0.002) / 100) * 100;
            $protectionCost = 2000;
            $total          = $subtotal + $shippingCost + $insuranceCost + $protectionCost;

            $orderNumber = 'ZFX' . now()->format('YmdHis') . rand(100, 999);

            $order = Order::create([
                'user_id'          => auth()->id(),
                'order_number'     => $orderNumber,
                'status'           => 'pending',
                'shipping_address' => $request->shipping_address,
                'shipping_carrier' => $request->shipping_carrier,
                'shipping_service' => $request->shipping_service,
                'shipping_cost'    => $shippingCost,
                'insurance_cost'   => $insuranceCost,
                'protection_cost'  => $protectionCost,
                'subtotal'         => $subtotal,
                'total_amount'     => $total,
                'payment_method'   => $request->payment_method,
                'payment_due_at'   => now()->addDay(),
            ]);

            // Create items & reduce stock
            foreach ($resolvedItems as $item) {
                $order->items()->create([
                    'product_id'    => $item['product']->id,
                    'product_name'  => $item['product_name'],
                    'product_image' => $item['product_image'],
                    'price'         => $item['price'],
                    'qty'           => $item['qty'],
                    'subtotal'      => $item['subtotal'],
                ]);
                $item['product']->decrement('stock', $item['qty']);
            }

            // Midtrans Snap token
            $snapToken = null;
            if ($request->payment_method !== 'cod') {
                try {
                    \Midtrans\Config::$serverKey    = config('services.midtrans.server_key');
                    \Midtrans\Config::$isProduction = config('services.midtrans.is_production', false);
                    \Midtrans\Config::$isSanitized  = true;
                    \Midtrans\Config::$is3ds        = true;

                    $midtransItems = array_map(fn($i) => [
                        'id'       => (string) $i['product']->id,
                        'price'    => (int) $i['price'],
                        'quantity' => $i['qty'],
                        'name'     => mb_substr($i['product_name'], 0, 50),
                    ], $resolvedItems);

                    $midtransItems[] = ['id' => 'shipping',   'price' => (int) $shippingCost,   'quantity' => 1, 'name' => 'Ongkos Kirim'];
                    $midtransItems[] = ['id' => 'insurance',  'price' => (int) $insuranceCost,  'quantity' => 1, 'name' => 'Asuransi Pengiriman'];
                    $midtransItems[] = ['id' => 'protection', 'price' => (int) $protectionCost, 'quantity' => 1, 'name' => 'Biaya Proteksi'];

                    $user = auth()->user();
                    $params = [
                        'transaction_details' => [
                            'order_id'     => $orderNumber,
                            'gross_amount' => (int) $total,
                        ],
                        'customer_details' => [
                            'first_name' => $user->name,
                            'email'      => $user->email,
                        ],
                        'item_details' => $midtransItems,
                        'enabled_payments' => $this->getMidtransPaymentMethods($request->payment_method),
                    ];

                    $snapToken = \Midtrans\Snap::getSnapToken($params);
                    $order->update(['midtrans_snap_token' => $snapToken]);
                } catch (\Exception $e) {
                    Log::error('Midtrans error: ' . $e->getMessage());
                }
            }

            return response()->json([
                'message' => 'Order berhasil dibuat',
                'data'    => [
                    'order_id'       => $order->id,
                    'order_number'   => $order->order_number,
                    'status'         => $order->status,
                    'snap_token'     => $snapToken,
                    'payment_method' => $order->payment_method,
                    'payment_due_at' => $order->payment_due_at,
                    'subtotal'       => $order->subtotal,
                    'shipping_cost'  => $order->shipping_cost,
                    'insurance_cost' => $order->insurance_cost,
                    'protection_cost'=> $order->protection_cost,
                    'total_amount'   => $order->total_amount,
                ],
            ], 201);
        });
    }

    public function show(Order $order)
    {
        if ($order->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json([
            'data' => array_merge($order->load('items')->toArray(), [
                'snap_token' => $order->midtrans_snap_token,
            ]),
        ]);
    }

    // Midtrans webhook — no auth
    public function notification(Request $request)
    {
        try {
            \Midtrans\Config::$serverKey    = config('services.midtrans.server_key');
            \Midtrans\Config::$isProduction = config('services.midtrans.is_production', false);

            $notif  = new \Midtrans\Notification();
            $status = $notif->transaction_status;
            $order  = Order::where('order_number', $notif->order_id)->first();

            if (!$order) return response()->json(['message' => 'Not found'], 404);

            if (in_array($status, ['capture', 'settlement'])) {
                $order->update(['status' => 'paid', 'paid_at' => now()]);
            } elseif ($status === 'pending') {
                $order->update(['status' => 'pending']);
            } elseif (in_array($status, ['deny', 'expire', 'cancel'])) {
                // Restore stock
                foreach ($order->items as $item) {
                    if ($item->product_id) {
                        Product::where('id', $item->product_id)->increment('stock', $item->qty);
                    }
                }
                $order->update(['status' => 'cancelled']);
            }
        } catch (\Exception $e) {
            Log::error('Midtrans notification error: ' . $e->getMessage());
        }

        return response()->json(['message' => 'OK']);
    }

    private function getMidtransPaymentMethods(string $method): array
    {
        $walletMap = [
            'gopay' => ['gopay'],
            'ovo'   => ['other_qris'],
            'dana'  => ['other_qris'],
            'qris'  => ['other_qris'],
        ];
        $vaMap = [
            'va_bca'     => ['bca_va'],
            'va_bni'     => ['bni_va'],
            'va_bri'     => ['bri_va'],
            'va_mandiri' => ['echannel'],
            'va_cimb'    => ['cimb_va'],
            'va_permata' => ['permata_va'],
            'va_bsi'     => ['other_va'],
            'va_btn'     => ['other_va'],
            'va_danamon' => ['other_va'],
        ];

        if (isset($walletMap[$method])) return $walletMap[$method];
        if (isset($vaMap[$method]))    return $vaMap[$method];

        // Default: semua metode tersedia
        return ['credit_card', 'cimb_va', 'bca_va', 'bni_va', 'bri_va',
                'echannel', 'permata_va', 'other_va', 'gopay', 'other_qris',
                'indomaret', 'alfamart'];
    }
}
