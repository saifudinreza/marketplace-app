<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        'user_id',
        'category_id',
        'name',
        'slug',
        'description',
        'price',
        'file_url',
    ];

    // Relasi: produk ini MILIK SATU user (seller)
    // Analogi: setiap produk punya satu pemilik toko
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Relasi: produk ini masuk SATU kategori
    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}
