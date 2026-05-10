<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    protected $fillable = [
        'order_id', 'product_id', 'product_name', 'product_image',
        'price', 'qty', 'subtotal',
    ];

    protected $casts = [
        'price'    => 'float',
        'subtotal' => 'float',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
