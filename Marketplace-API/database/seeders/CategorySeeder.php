<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Elektronik',           'description' => 'Gadget, laptop, HP, dan perangkat elektronik lainnya'],
            ['name' => 'Fashion',              'description' => 'Pakaian, sepatu, tas, dan aksesoris fashion'],
            ['name' => 'Makanan & Minuman',    'description' => 'Produk makanan, minuman, dan camilan'],
            ['name' => 'Peralatan Rumah',      'description' => 'Furnitur, dekorasi, dan peralatan rumah tangga'],
            ['name' => 'Olahraga',             'description' => 'Perlengkapan dan pakaian olahraga'],
            ['name' => 'Buku & Pendidikan',    'description' => 'Buku, alat tulis, dan perlengkapan belajar'],
            ['name' => 'Kecantikan & Kesehatan', 'description' => 'Skincare, kosmetik, dan produk kesehatan'],
            ['name' => 'Otomotif',             'description' => 'Aksesoris dan spare part kendaraan'],
        ];

        foreach ($categories as $cat) {
            DB::table('categories')->insertOrIgnore([
                'name'        => $cat['name'],
                'slug'        => Str::slug($cat['name']),
                'description' => $cat['description'],
                'created_at'  => now(),
                'updated_at'  => now(),
            ]);
        }
    }
}
