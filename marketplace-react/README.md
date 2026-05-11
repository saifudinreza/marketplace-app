# ZFlux Marketplace

Full-stack marketplace app built with React + Vite (frontend) and Laravel (backend), with Midtrans Snap payment integration.

## Live Demo

**Frontend:** https://marketplace-app-ten-rosy.vercel.app  
**Backend API:** http://38.47.180.195/student05/api

---

## Midtrans Sandbox Test Credentials

Payment environment: **Sandbox** (no real money charged)

### Test Card (Credit/Debit)
| Field | Value |
|-------|-------|
| Card Number | `4811 1111 1111 1114` |
| Expiry | `01/25` (any future date) |
| CVV | `123` |
| OTP/3DS | `112233` |

### GoPay / QRIS
- Klik **Pay with GoPay** → pilih **Simulator**
- Klik tombol **Pay** di simulator untuk mensimulasikan pembayaran berhasil

### Virtual Account (BCA, BNI, BRI, Mandiri, dll)
- Setelah muncul nomor VA, pembayaran otomatis dianggap **pending**
- Untuk simulate success: gunakan Midtrans Simulator di dashboard sandbox Midtrans

### COD (Bayar di Tempat)
- Tidak memerlukan proses pembayaran, langsung confirmed

### Status Transaksi
| Status | Keterangan |
|--------|-----------|
| `pending` | Menunggu pembayaran |
| `paid` | Pembayaran berhasil |
| `failed` | Pembayaran ditolak |
| `cancelled` | Order dibatalkan / expired |

---

## Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, React Router v6
- **Backend:** Laravel 11, MySQL
- **Payment:** Midtrans Snap
- **Deployment:** Vercel (frontend), Ubuntu VPS (backend)

## Local Development

```bash
# Frontend
cd marketplace-react
npm install
npm run dev

# Backend
cd marketplace-api
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

Set `.env` frontend:
```
VITE_API_URL=http://localhost:8000/api
VITE_MIDTRANS_CLIENT_KEY=Mid-client-pcF0FNaFededAYBg
VITE_MIDTRANS_IS_PRODUCTION=false
```
