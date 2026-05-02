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
            $this->command->warn('User donojomi@gmail.com tidak ditemukan. Jalankan seeder setelah register.');
            return;
        }
        $sellerId = $seller->id;

        $cats = DB::table('categories')->pluck('id', 'name');

        $products = [
            // Elektronik
            ['cat' => 'Elektronik', 'name' => 'iPhone 15 Pro Max 256GB',       'price' => 21999000, 'desc' => 'Smartphone flagship Apple dengan chip A17 Pro, kamera 48MP, dan layar Super Retina XDR 6.7 inci.'],
            ['cat' => 'Elektronik', 'name' => 'Samsung Galaxy Tab S9 FE',       'price' => 7499000,  'desc' => 'Tablet Android premium layar 10.9 inci, prosesor Exynos 1380, baterai 8000mAh tahan lama.'],
            ['cat' => 'Elektronik', 'name' => 'Laptop ASUS VivoBook 14 OLED',   'price' => 10999000, 'desc' => 'Laptop tipis layar OLED 14 inci, Intel Core i5-13500H, RAM 16GB, SSD 512GB, ringan 1.4kg.'],
            ['cat' => 'Elektronik', 'name' => 'TWS Sony WF-1000XM5',            'price' => 3499000,  'desc' => 'True wireless earbuds noise cancelling terbaik, baterai 8 jam, suara hi-res audio premium.'],
            ['cat' => 'Elektronik', 'name' => 'Smart TV LG 55" 4K OLED',        'price' => 14999000, 'desc' => 'TV OLED 55 inci 4K dengan teknologi AI ThinQ, Dolby Vision IQ, dan webOS 23 smart platform.'],

            // Fashion
            ['cat' => 'Fashion', 'name' => 'Kemeja Batik Pria Premium Kawung',  'price' => 285000,  'desc' => 'Kemeja batik motif kawung premium bahan katun halus, cocok untuk formal maupun acara kasual.'],
            ['cat' => 'Fashion', 'name' => 'Sepatu Sneakers Canvas Pria',        'price' => 450000,  'desc' => 'Sepatu sneakers stylish sol tebal, bahan canvas berkualitas, tersedia ukuran 38-45.'],
            ['cat' => 'Fashion', 'name' => 'Tas Selempang Wanita Kulit PU',      'price' => 320000,  'desc' => 'Tas selempang wanita elegan kulit PU premium, multi-pocket, cocok untuk aktivitas sehari-hari.'],
            ['cat' => 'Fashion', 'name' => 'Dress Floral Wanita Rayon',          'price' => 199000,  'desc' => 'Dress floral cantik bahan rayon adem, model A-line yang fleksibel untuk berbagai kesempatan.'],
            ['cat' => 'Fashion', 'name' => 'Hoodie Oversize Unisex Fleece',      'price' => 175000,  'desc' => 'Hoodie oversize hangat bahan fleece premium, 10+ pilihan warna, ukuran S-XXL tersedia.'],

            // Makanan & Minuman
            ['cat' => 'Makanan & Minuman', 'name' => 'Kopi Arabica Gayo Single Origin 250g', 'price' => 85000,  'desc' => 'Kopi arabica asli Gayo Aceh, medium roast, rasa fruity dan floral yang khas. Tersedia bubuk/biji.'],
            ['cat' => 'Makanan & Minuman', 'name' => 'Kurma Medjool Premium 500g',           'price' => 120000, 'desc' => 'Kurma Medjool impor berkualitas premium, manis alami, kaya serat, cocok untuk cemilan sehat.'],
            ['cat' => 'Makanan & Minuman', 'name' => 'Matcha Ceremonial Grade 100g',         'price' => 95000,  'desc' => 'Teh hijau matcha ceremonial grade asal Jepang, warna hijau cerah, rasa umami kuat dan segar.'],
            ['cat' => 'Makanan & Minuman', 'name' => 'Keripik Tempe Malang 200g',            'price' => 22000,  'desc' => 'Keripik tempe renyah khas Malang, tanpa pengawet. Tersedia rasa original, pedas, dan balado.'],
            ['cat' => 'Makanan & Minuman', 'name' => 'Madu Hutan Asli Kalimantan 500ml',     'price' => 150000, 'desc' => 'Madu hutan murni dari lebah liar Kalimantan, tanpa campuran gula, kaya enzim dan antioksidan.'],

            // Peralatan Rumah
            ['cat' => 'Peralatan Rumah', 'name' => 'Rice Cooker Miyako 1.8L',           'price' => 299000, 'desc' => 'Magic com kapasitas 1.8 liter, teknologi keep warm 24 jam, anti lengket, hemat listrik.'],
            ['cat' => 'Peralatan Rumah', 'name' => 'Set Peralatan Makan Keramik 6pcs',  'price' => 185000, 'desc' => 'Set peralatan makan keramik premium 6 pcs, motif Nordic minimalis, food grade & dishwasher safe.'],
            ['cat' => 'Peralatan Rumah', 'name' => 'Blender Philips Pro 5000W',          'price' => 899000, 'desc' => 'Blender powerful dengan 2 jar (2L + 1L), pisau titanium, 5 program otomatis, mudah dibersihkan.'],
            ['cat' => 'Peralatan Rumah', 'name' => 'Lampu LED Philips 14W Warm White',   'price' => 35000,  'desc' => 'Lampu LED 14W setara 120W, hemat energi 80%, umur pemakaian 15.000 jam, cahaya hangat.'],
            ['cat' => 'Peralatan Rumah', 'name' => 'Rak Sepatu Lipat 5 Susun',           'price' => 145000, 'desc' => 'Rak sepatu lipat 5 susun bahan besi anti karat, mudah dipasang, kapasitas 10 pasang sepatu.'],

            // Olahraga
            ['cat' => 'Olahraga', 'name' => 'Dumbbell Set Adjustable 20kg',    'price' => 750000, 'desc' => 'Set dumbbell adjustable 20kg (2x10kg) iron dengan handle anti slip, cocok untuk home gym.'],
            ['cat' => 'Olahraga', 'name' => 'Sepatu Lari Nike Revolution 6',   'price' => 849000, 'desc' => 'Sepatu lari Nike Revolution 6 bantalan foam React, breathable mesh, bobot ringan hanya 260g.'],
            ['cat' => 'Olahraga', 'name' => 'Yoga Mat Premium Anti Slip 6mm',  'price' => 189000, 'desc' => 'Matras yoga 6mm premium anti slip, bahan TPE ramah lingkungan, ukuran 183x61cm, include tali.'],
            ['cat' => 'Olahraga', 'name' => 'Jump Rope Speed Skipping Rope',   'price' => 85000,  'desc' => 'Tali skipping speed rope bearing ganda, kecepatan tinggi, handle aluminium anti slip + penghitung.'],
            ['cat' => 'Olahraga', 'name' => 'Gym Bag 30L Waterproof',          'price' => 245000, 'desc' => 'Tas gym 30 liter waterproof, kompartemen sepatu terpisah, bahan polyester 600D kuat dan ringan.'],

            // Buku & Pendidikan
            ['cat' => 'Buku & Pendidikan', 'name' => 'Atomic Habits - James Clear',            'price' => 98000,  'desc' => 'Buku best-seller internasional tentang cara membangun kebiasaan baik dan menghilangkan kebiasaan buruk.'],
            ['cat' => 'Buku & Pendidikan', 'name' => 'Set Alat Tulis Premium 24pcs',           'price' => 75000,  'desc' => 'Set alat tulis lengkap 24 pcs: pensil, pulpen, stabilo, penggaris, penghapus dalam wadah rapi.'],
            ['cat' => 'Buku & Pendidikan', 'name' => 'Matematika SMA XII Kurikulum Merdeka',   'price' => 65000,  'desc' => 'Buku pelajaran matematika SMA kelas XII kurikulum Merdeka 2024, lengkap dengan soal latihan.'],
            ['cat' => 'Buku & Pendidikan', 'name' => 'KBBI Edisi V Hard Cover',                'price' => 120000, 'desc' => 'Kamus Besar Bahasa Indonesia edisi kelima, hard cover, lebih dari 100.000 entri kata terlengkap.'],
            ['cat' => 'Buku & Pendidikan', 'name' => 'Flash Card Bahasa Inggris 200 Kosakata', 'price' => 45000,  'desc' => 'Flash card kosakata bahasa Inggris 200 kartu bergambar, cocok untuk belajar anak SD dan SMP.'],

            // Kecantikan & Kesehatan
            ['cat' => 'Kecantikan & Kesehatan', 'name' => 'Serum Vitamin C 20% Wardah',            'price' => 89000, 'desc' => 'Serum vitamin C 20% mencerahkan kulit, anti aging, tekstur ringan cepat meresap, sudah BPOM RI.'],
            ['cat' => 'Kecantikan & Kesehatan', 'name' => 'Sunscreen SPF 50+ PA++++ Emina',        'price' => 45000, 'desc' => 'Sunscreen SPF 50+ formula ringan tidak lengket, perlindungan UVA & UVB, cocok kulit berminyak.'],
            ['cat' => 'Kecantikan & Kesehatan', 'name' => 'Masker Clay Purifying 50ml',             'price' => 55000, 'desc' => 'Masker clay purifying membersihkan pori-pori, mengontrol minyak, kandungan kaolin dan activated charcoal.'],
            ['cat' => 'Kecantikan & Kesehatan', 'name' => 'Vitamin C 1000mg Effervescent 10 Tab',  'price' => 28000, 'desc' => 'Suplemen vitamin C 1000mg effervescent rasa jeruk, meningkatkan imunitas dan antioksidan kuat.'],
            ['cat' => 'Kecantikan & Kesehatan', 'name' => 'Hand Body Lotion Vaseline 400ml',       'price' => 42000, 'desc' => 'Losion tubuh Vaseline Healthy Bright 400ml, formula niacinamide + vitamin B3, mencerahkan dalam 2 minggu.'],

            // Otomotif
            ['cat' => 'Otomotif', 'name' => 'Helm Full Face INK CL MAX',               'price' => 550000, 'desc' => 'Helm full face SNI DOT ECE R22.06, visor anti gores, ventilasi maksimal, berat ringan 1.35kg.'],
            ['cat' => 'Otomotif', 'name' => 'Aki Kering GS Astra 12V 5Ah',             'price' => 285000, 'desc' => 'Aki kering motor GS Astra 12V 5Ah, maintenance free, tahan lama, cocok motor bebek dan matic.'],
            ['cat' => 'Otomotif', 'name' => 'Karpet Mobil Toyota Avanza Premium',      'price' => 450000, 'desc' => 'Karpet dasar mobil Toyota Avanza bahan premium anti slip, waterproof, 5 baris full set lengkap.'],
            ['cat' => 'Otomotif', 'name' => 'Oli Mesin Shell Helix HX7 5W-40 4L',     'price' => 195000, 'desc' => 'Oli mesin Shell Helix HX7 5W-40 semi synthetic 4 liter, pelumas premium untuk mesin bensin.'],
            ['cat' => 'Otomotif', 'name' => 'Pengharum Mobil Vent Clip Vanilla',       'price' => 25000,  'desc' => 'Pengharum mobil clip AC aroma vanilla tahan lama hingga 30 hari, tidak mengandung alkohol.'],
        ];

        foreach ($products as $p) {
            $catId = $cats[$p['cat']] ?? null;
            if (!$catId) continue;

            DB::table('products')->insertOrIgnore([
                'user_id'     => $sellerId,
                'category_id' => $catId,
                'name'        => $p['name'],
                'slug'        => Str::slug($p['name']) . '-' . Str::random(6),
                'description' => $p['desc'],
                'price'       => $p['price'],
                'file_url'    => '',
                'created_at'  => now(),
                'updated_at'  => now(),
            ]);
        }

        $this->command->info('40 produk berhasil ditambahkan untuk ' . $seller->email . '. Tambahkan URL gambar via menu Edit Produk.');
    }
}
