# Panduan Hapus Produk User di Server Remote

Panduan ini dipakai kalau ada produk asing, produk demo, atau produk yang mengganggu muncul di marketplace dan kamu ingin tracking lalu hapus sendiri dari server.

# SEMUA STEP INI DILAKUKAN DI TERMINAL SSH

## 1. Login ke server

```bash
ssh student05@38.47.180.195
```

## 2. Masuk ke folder backend Laravel

```bash
cd /var/www/student05
```

## 3. Lihat konfigurasi database dari `.env`

```bash
grep -E '^DB_(DATABASE|USERNAME|PASSWORD)=' .env
```

Contoh hasil:

```env
DB_DATABASE=db_student05
DB_USERNAME=mysql_student05
DB_PASSWORD=isi_password_database
```

## 4. Masuk ke MySQL

```bash
mysql -uDB_USERNAME -pDB_PASSWORD -D DB_DATABASE
```

Contoh:

```bash
mysql -umysql_student05 -pisi_password_database -D db_student05
```

## 5. Cari produk yang ingin dihapus

Kalau ingin cari berdasarkan nama:

```sql
SELECT id, name, user_id, category_id, price
FROM products
WHERE name LIKE '%iphone%';
```

Kalau ingin cari nama yang persis:

```sql
SELECT id, name, user_id, category_id, price
FROM products
WHERE name = 'laptop gaming mahal';
```

## 6. Cek siapa pemilik produk itu

```sql
SELECT
  p.id AS product_id,
  p.name AS product_name,
  p.user_id,
  u.name AS owner_name,
  u.email AS owner_email,
  u.role
FROM products p
LEFT JOIN users u ON u.id = p.user_id
WHERE p.id = 322;
```

Ganti `322` dengan `id` produk yang kamu temukan.

## 7. Backup dulu kalau perlu

Kalau takut salah hapus, export dulu database:

```bash
mysqldump -uDB_USERNAME -pDB_PASSWORD DB_DATABASE products users > backup-sebelum-hapus.sql
```

## 8. Hapus satu produk berdasarkan `id`

```sql
DELETE FROM products
WHERE id = 322;
```

Lalu cek apakah benar-benar hilang:

```sql
SELECT id, name, user_id
FROM products
WHERE id = 322;
```

Kalau hasilnya kosong, berarti produk sudah terhapus.

## 9. Hapus semua produk milik satu user

Lihat dulu daftar produknya:

```sql
SELECT id, name
FROM products
WHERE user_id = 1
ORDER BY id;
```

Kalau sudah yakin:

```sql
DELETE FROM products
WHERE user_id = 1;
```

Verifikasi:

```sql
SELECT COUNT(*) AS product_count
FROM products
WHERE user_id = 1;
```

## 10. Hapus user-nya juga kalau memang perlu

Sebelum hapus user, hapus token login-nya dulu:

```sql
DELETE FROM personal_access_tokens
WHERE tokenable_type = 'App\\Models\\User'
  AND tokenable_id = 1;
```

Lalu hapus user:

```sql
DELETE FROM users
WHERE id = 1;
```

Verifikasi:

```sql
SELECT id, name, email
FROM users
WHERE id = 1;
```

## 11. Cek dari API apakah produk masih muncul

Keluar dari MySQL kalau perlu:

```sql
exit
```

Cek lewat API lokal di server:

```bash
curl "http://127.0.0.1/api/products?search=laptop%20gaming%20mahal"
```

Atau cek lewat API publik:

```bash
curl "http://38.47.180.195/student05/api/products?search=laptop%20gaming%20mahal&t=123"
```

Tambahkan parameter `t=123` atau angka lain supaya tidak kena cache lama.

## 12. Pola aman yang wajib diikuti

1. `SELECT` dulu sebelum `DELETE`.
2. Hapus pakai `id`, bukan cuma nama, supaya tidak salah target.
3. Kalau mau hapus massal, cek dulu jumlah datanya.
4. Verifikasi dari database dan dari API.
5. Kalau ragu, backup dulu sebelum hapus.

## Query cepat yang paling sering dipakai

Cari produk:

```sql
SELECT id, name, user_id
FROM products
WHERE name LIKE '%kata_kunci%';
```

Cek pemilik:

```sql
SELECT u.id, u.name, u.email
FROM users u
JOIN products p ON p.user_id = u.id
WHERE p.id = ID_PRODUK;
```

Hapus satu produk:

```sql
DELETE FROM products
WHERE id = ID_PRODUK;
```

Hapus semua produk milik user:

```sql
DELETE FROM products
WHERE user_id = ID_USER;
```
