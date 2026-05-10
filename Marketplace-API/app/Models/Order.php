<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'user_id', 'order_number', 'status',
        'shipping_address', 'shipping_carrier', 'shipping_service', 'shipping_cost',
        'insurance_cost', 'protection_cost', 'subtotal', 'total_amount',
        'payment_method', 'payment_code', 'payment_due_at',
        'midtrans_snap_token', 'midtrans_transaction_id', 'paid_at',
    ];

    protected $casts = [
        'shipping_address' => 'array',
        'payment_due_at'   => 'datetime',
        'paid_at'          => 'datetime',
        'shipping_cost'    => 'float',
        'insurance_cost'   => 'float',
        'protection_cost'  => 'float',
        'subtotal'         => 'float',
        'total_amount'     => 'float',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }
}
