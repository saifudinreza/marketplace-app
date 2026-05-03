# ZFlux — Marketplace App

Aplikasi marketplace full-stack dengan fitur jual beli produk, manajemen produk untuk seller, keranjang belanja, dan sistem autentikasi berbasis role.

---

## Tampilan Aplikasi

| Halaman | Deskripsi |
|---|---|
| Home | Daftar produk dengan search, filter kategori, dan pagination |
| Detail Produk | Informasi lengkap produk beserta tombol edit/hapus untuk seller |
| Produk Saya | Dashboard seller untuk kelola produk |
| Tambah / Edit Produk | Form input produk dengan validasi |
| Login / Register | Autentikasi dengan pemilihan role (seller / buyer) |
| Keranjang | Manajemen item belanja |

---

## Arsitektur Sistem

```
┌─────────────────────────┐        HTTPS         ┌──────────────────────────┐
│   FRONTEND (Vercel)     │ ──────────────────→  │   BACKEND (VPS)          │
│   React + Vite          │   Cloudflare Tunnel   │   Laravel 13 + Sanctum   │
└─────────────────────────┘                       └──────────────────────────┘
                                                           │
                                                           ▼
                                                  ┌──────────────────┐
                                                  │   MySQL Database  │
                                                  │   users           │
                                                  │   products        │
                                                  │   categories      │
                                                  └──────────────────┘
```

---

## Teknologi

### Frontend
- **React 18** + **Vite** — SPA framework
- **React Router v6** — client-side routing
- **Axios** — HTTP client dengan interceptor
- **Context API** — state management (auth & cart)
- **CSS Custom Properties** — design system

### Backend
- **Laravel 13** — REST API
- **Laravel Sanctum** — autentikasi Bearer Token
- **MySQL** — database relasional
- **PHP 8.4**

### Deployment
- **Vercel** — hosting frontend (HTTPS otomatis)
- **VPS (Ubuntu 22.04)** — hosting backend
- **Cloudflare Tunnel** — HTTPS bridge ke VPS

---

## Struktur Project

```
marketplace-app/
├── marketplace-react/          # Frontend React
│   ├── src/
│   │   ├── api/
│   │   │   └── axiosClient.js      # Axios instance + interceptor
│   │   ├── components/
│   │   │   ├── Navbar.jsx          # Navigasi utama
│   │   │   ├── ProductCard.jsx     # Kartu produk
│   │   │   ├── Pagination.jsx      # Paginasi
│   │   │   └── ProtectedRoute.jsx  # Guard halaman protected
│   │   ├── context/
│   │   │   ├── AuthContext.jsx     # State autentikasi global
│   │   │   └── CartContext.jsx     # State keranjang belanja
│   │   ├── pages/
│   │   │   ├── Home.jsx            # Halaman utama
│   │   │   ├── Login.jsx           # Halaman login
│   │   │   ├── Register.jsx        # Halaman register
│   │   │   ├── ProductDetail.jsx   # Detail produk
│   │   │   ├── ProductForm.jsx     # Form tambah / edit produk
│   │   │   ├── MyProducts.jsx      # Dashboard produk seller
│   │   │   ├── Cart.jsx            # Halaman keranjang
│   │   │   └── Profile.jsx         # Profil pengguna
│   │   └── hooks/
│   │       └── useAnime.js         # Hook animasi
│   └── .env.production             # URL API untuk production
│
└── marketplace-api/            # Backend Laravel
    ├── app/
    │   ├── Http/Controllers/Api/
    │   │   ├── AuthController.php      # Register, Login, Logout
    │   │   ├── ProductController.php   # CRUD produk
    │   │   └── CategoryController.php  # CRUD kategori
    │   └── Models/
    │       ├── User.php
    │       ├── Product.php
    │       └── Category.php
    ├── database/
    │   ├── migrations/             # Skema database
    │   └── seeders/
    │       ├── CategorySeeder.php  # Data awal kategori
    │       └── ProductSeeder.php   # Data awal produk
    └── routes/
        └── api.php                 # Definisi endpoint API
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

### Protected (butuh Bearer Token)
| Method | Endpoint | Deskripsi |
|---|---|---|
| POST | `/api/logout` | Logout |
| POST | `/api/products` | Tambah produk (seller) |
| PUT | `/api/products/{id}` | Edit produk (owner) |
| DELETE | `/api/products/{id}` | Hapus produk (owner) |

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

## Sistem Role

| Role | Akses |
|---|---|
| **buyer** | Browse produk, tambah ke keranjang, lihat detail |
| **seller** | Semua akses buyer + tambah, edit, hapus produk milik sendiri |

Proteksi berlapis:
- **Frontend** — halaman seller diredirect jika role bukan seller
- **Backend** — setiap endpoint validasi role dan kepemilikan produk

---

## Alur Penggunaan

### Sebagai Buyer
1. Register akun → pilih role **buyer**
2. Browse produk di halaman Home
3. Filter berdasarkan kategori atau gunakan search
4. Klik produk untuk melihat detail
5. Tambah ke keranjang

### Sebagai Seller
1. Register akun → pilih role **seller**
2. Klik **"Produk Saya"** di navbar
3. Klik **"+ Tambah Produk"** untuk input produk baru
4. Isi nama, kategori, harga, deskripsi, dan URL gambar
5. Klik **Edit** atau **Hapus** untuk kelola produk yang sudah ada

---

## Instalasi Lokal

### Prerequisites
- Node.js 18+
- PHP 8.2+
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
2. Konfigurasi `.env` dengan kredensial database
3. Jalankan `php artisan migrate` dan `php artisan db:seed`
4. Aktifkan Cloudflare Tunnel untuk HTTPS:
   ```bash
   ./cloudflared tunnel --url http://38.47.180.195
   ```

---

## Database Schema

```
users
  id, name, email, password, role (seller|buyer), timestamps

categories
  id, name, slug, description, timestamps

products
  id, user_id (FK), category_id (FK), name, slug,
  description, price, file_url, timestamps
```

---

## Dibuat Oleh

**Saifudin Reza** — Bootcamp Full-Stack Web Development

> Stack: React · Laravel · MySQL · Vercel · VPS
