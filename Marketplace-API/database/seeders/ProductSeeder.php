<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $seller = DB::table('users')->where('email', 'donojomi@gmail.com')->first();
        if (!$seller) {
            $sellerId = DB::table('users')->insertGetId([
                'name'       => 'Demo Seller',
                'email'      => 'seller@demo.com',
                'password'   => Hash::make('password'),
                'role'       => 'seller',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } else {
            $sellerId = $seller->id;
        }

        // Produk ditambahkan manual via UI
    }
}
