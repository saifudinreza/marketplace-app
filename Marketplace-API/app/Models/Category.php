<?php

namespace App\Models;


use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    protected $fillable = ['name', 'slug', 'description'];

    // Relasi: satu kategori PUNYA BANYAK produk
    // Analogi: satu rak "UI Design" bisa punya banyak produk di dalamnya
    public function products()
    {
        return $this->hasMany(Product::class);
    }
}
