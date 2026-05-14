# ZFlux — Marketplace App

Aplikasi marketplace full-stack dengan fitur jual beli produk, sistem order dengan pembayaran Midtrans, manajemen produk untuk seller, keranjang belanja, dan autentikasi berbasis role.

---

## Tampilan Aplikasi

| Halaman | Deskripsi |
|---|---|
| Home | Daftar produk dengan search, filter kategori, dan pagination |
| Detail Produk | Informasi lengkap produk beserta tombol edit/hapus untuk seller |
| Produk Saya | Dashboard seller untuk kelola produk |
| Tambah / Edit Produk | Form input produk dengan upload gambar |
| Login / Register | Autentikasi dengan pemilihan role (seller / buyer) |
| Keranjang | Manajemen item belanja |
| Checkout | Konfirmasi pesanan dan input alamat pengiriman via peta |
| Order Pending | Halaman status pesanan setelah checkout |
| Profil | Data pengguna dan pengaturan akun |

---

## Arsitektur Sistem

```
┌─────────────────────────┐        HTTPS         ┌──────────────────────────┐
│   FRONTEND (Vercel)     │ ──────────────────→  │   BACKEND (VPS)          │
│   React 19 + Vite       │   Cloudflare Tunnel   │   Laravel 13 + Sanctum   │
└─────────────────────────┘                       └──────────────────────────┘
                                                           │
                                                           ▼
                                                  ┌──────────────────┐
                                                  │   MySQL Database  │
                                                  │   users           │
                                                  │   products        │
                                                  │   categories      │
                                                  │   orders          │
                                                  │   order_items     │
                                                  └──────────────────┘
                                                           │
                                                           ▼
                                                  ┌──────────────────┐
                                                  │   Midtrans        │
                                                  │   Payment Gateway │
                                                  └──────────────────┘
```

---

## Teknologi

### Frontend
- **React 19** + **Vite 8** — SPA framework
- **React Router v7** — client-side routing
- **Axios** — HTTP client dengan interceptor
- **Context API** — state management (auth, cart, address)
- **Tailwind CSS v4** — utility-first styling
- **Leaflet / React Leaflet** — peta interaktif untuk input alamat
- **Anime.js** — animasi UI
- **Lucide React** — ikon

### Backend
- **Laravel 13** — REST API
- **Laravel Sanctum** — autentikasi Bearer Token
- **Midtrans PHP SDK** — payment gateway (Snap)
- **MySQL** — database relasional
- **PHP 8.3**

### Deployment
- **Vercel** — hosting frontend (HTTPS otomatis)
- **VPS (Ubuntu 22.04)** — hosting backend
- **Cloudflare Tunnel** — HTTPS bridge ke VPS

---

## Struktur Project

```
marketplace-app/
├── marketplace-react/              # Frontend React
│   ├── src/
│   │   ├── api/
│   │   │   └── axiosClient.js          # Axios instance + interceptor
│   │   ├── components/
│   │   │   ├── AddressModal.jsx        # Modal input alamat via peta Leaflet
│   │   │   ├── Navbar.jsx              # Navigasi utama
│   │   │   ├── Pagination.jsx          # Paginasi
│   │   │   ├── ProductCard.jsx         # Kartu produk
│   │   │   ├── ProtectedRoute.jsx      # Guard halaman protected
│   │   │   └── ZFluxLogo.jsx           # Logo aplikasi
│   │   ├── context/
│   │   │   ├── AddressContext.jsx      # State alamat pengiriman global
│   │   │   ├── AuthContext.jsx         # State autentikasi global
│   │   │   └── CartContext.jsx         # State keranjang belanja
│   │   ├── hooks/
│   │   │   └── useAnime.js             # Hook animasi Anime.js
│   │   ├── pages/
│   │   │   ├── Cart.jsx                # Halaman keranjang
│   │   │   ├── Checkout.jsx            # Konfirmasi pesanan + alamat
│   │   │   ├── Home.jsx                # Halaman utama
│   │   │   ├── Login.jsx               # Halaman login
│   │   │   ├── MyProducts.jsx          # Dashboard produk seller
│   │   │   ├── OrderPending.jsx        # Status pesanan setelah checkout
│   │   │   ├── ProductDetail.jsx       # Detail produk
│   │   │   ├── ProductForm.jsx         # Form tambah / edit produk
│   │   │   ├── Profile.jsx             # Profil pengguna
│   │   │   └── Register.jsx            # Halaman register
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── public/
│   ├── index.html
│   ├── vite.config.js
│   ├── eslint.config.js
│   └── vercel.json
│
└── marketplace-api/                # Backend Laravel
    ├── app/
    │   ├── Http/Controllers/Api/
    │   │   ├── AuthController.php      # Register, Login, Logout
    │   │   ├── CategoryController.php  # CRUD kategori
    │   │   ├── OrderController.php     # Buat order, detail order, webhook Midtrans
    │   │   └── ProductController.php   # CRUD produk
    │   └── Models/
    │       ├── Category.php
    │       ├── Order.php
    │       ├── OrderItem.php
    │       ├── Product.php
    │       └── User.php
    ├── database/
    │   ├── migrations/
    │   └── seeders/
    │       ├── CategorySeeder.php
    │       └── DatabaseSeeder.php
    └── routes/
        └── api.php                     # Definisi endpoint API
```

---

## API Endpoints

### Publik (tanpa token)
| Method | Endpoint | Deskripsi |
|---|---|---|
| POST | `/api/register` | Daftar akun baru |
| POST | `/api/login` | Login |
| GET | `/api/products` | Daftar semua produk |
| GET | `/api/products/{id}` | Detail produk |
| GET | `/api/categories` | Daftar kategori |
| GET | `/api/categories/{id}` | Detail kategori |
| POST | `/api/midtrans/notification` | Webhook notifikasi Midtrans |

### Protected (butuh Bearer Token)
| Method | Endpoint | Deskripsi |
|---|---|---|
| POST | `/api/logout` | Logout |
| POST | `/api/products` | Tambah produk (seller) |
| PUT | `/api/products/{id}` | Edit produk (owner) |
| DELETE | `/api/products/{id}` | Hapus produk (owner) |
| POST | `/api/categories` | Tambah kategori |
| PUT | `/api/categories/{id}` | Edit kategori |
| DELETE | `/api/categories/{id}` | Hapus kategori |
| POST | `/api/orders` | Buat pesanan baru |
| GET | `/api/orders/{id}` | Detail pesanan |

---

## Sistem Autentikasi

Aplikasi menggunakan **Laravel Sanctum** dengan alur:

1. User login → backend membuat token dan mengembalikannya
2. Token disimpan di `localStorage` browser
3. Setiap request ke API otomatis menyertakan header:
   ```
   Authorization: Bearer <token>
   ```
4. Jika token expired atau tidak valid (401) → user otomatis diarahkan ke halaman login

---

## Sistem Pembayaran

Menggunakan **Midtrans Snap** untuk payment gateway:

1. User checkout → frontend kirim order ke backend
2. Backend buat transaksi di Midtrans → dapat `snap_token`
3. Frontend buka popup Midtrans Snap dengan token tersebut
4. Midtrans kirim notifikasi pembayaran ke `/api/midtrans/notification`
5. Backend update status order sesuai notifikasi

---

## Sistem Role

| Role | Akses |
|---|---|
| **buyer** | Browse produk, tambah ke keranjang, checkout, lihat status pesanan |
| **seller** | Semua akses buyer + tambah, edit, hapus produk milik sendiri |

Proteksi berlapis:
- **Frontend** — halaman seller diredirect jika role bukan seller
- **Backend** — setiap endpoint validasi role dan kepemilikan produk

---

## Database Schema

```
users
  id, name, email, password, role (seller|buyer), timestamps

categories
  id, name, slug, description, timestamps

products
  id, user_id (FK), category_id (FK), name, slug,
  description, price, stock, file_url (LONGTEXT), timestamps

orders
  id, user_id (FK), snap_token, status, shipping_address,
  total_amount, timestamps

order_items
  id, order_id (FK), product_id (FK), product_name,
  product_image, quantity, price, timestamps
```

---

## Alur Penggunaan

### Sebagai Buyer
1. Register akun → pilih role **buyer**
2. Browse produk di halaman Home
3. Filter berdasarkan kategori atau gunakan search
4. Klik produk untuk melihat detail
5. Tambah ke keranjang
6. Buka keranjang → Checkout
7. Input alamat pengiriman via peta
8. Selesaikan pembayaran di popup Midtrans

### Sebagai Seller
1. Register akun → pilih role **seller**
2. Klik **"Produk Saya"** di navbar
3. Klik **"+ Tambah Produk"** untuk input produk baru
4. Isi nama, kategori, harga, stok, deskripsi, dan gambar produk
5. Klik **Edit** atau **Hapus** untuk kelola produk yang sudah ada

---

## Instalasi Lokal

### Prerequisites
- Node.js 18+
- PHP 8.3+
- Composer
- MySQL

### Frontend
```bash
cd marketplace-react
npm install
cp .env.example .env
# Isi VITE_API_URL dengan URL backend lokal
npm run dev
```

### Backend
```bash
cd marketplace-api
composer install
cp .env.example .env
# Isi DB_DATABASE, DB_USERNAME, DB_PASSWORD
# Isi MIDTRANS_SERVER_KEY dan MIDTRANS_CLIENT_KEY
php artisan key:generate
php artisan migrate
php artisan db:seed
php artisan serve
```

---

## Deployment

### Frontend (Vercel)
1. Push ke GitHub
2. Import repo di Vercel
3. Set Root Directory ke `marketplace-react`
4. Set environment variable `VITE_API_URL` ke URL backend

### Backend (VPS)
1. Upload file ke `/var/www/student05/`
2. Konfigurasi `.env` dengan kredensial database dan Midtrans
3. Jalankan `php artisan migrate` dan `php artisan db:seed`
4. Aktifkan Cloudflare Tunnel untuk HTTPS:
   ```bash
   ./cloudflared tunnel --url http://38.47.180.195
   ```

---

## Dibuat Oleh

**Saifudin Reza** — Bootcamp Full-Stack Web Development

> Stack: React · Laravel · MySQL · Midtrans · Vercel · VPS
