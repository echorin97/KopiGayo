# Keamanan — Jualan Kopi Gayo

Dokumen ini memetakan *Daftar Periksa Keamanan Minimum UMKM* ke implementasi nyata di repo ini,
sekaligus menjelaskan batasannya secara jujur.

## Ringkasan status

| Kontrol | Implementasi di repo | Prioritas | Status |
| --- | --- | --- | --- |
| Autentikasi & rate limiting | Password tidak disimpan sebagai teks; verifikasi hash SHA-256 iteratif 2.000x + salt (`js/security.js`). Login dikunci 5 menit setelah 5 percobaan gagal dalam 10 menit, lalu 15 menit, lalu 60 menit. Sesi bertimer (idle 30 menit, absolut 8 jam) + audit log. | Tinggi | Sebagian — lihat batasan |
| MFA admin | Belum ada. MFA yang benar butuh server (TOTP/WebAuthn) karena rahasia tidak boleh ada di browser. | Tinggi | **Belum** |
| HTTPS | Vercel menyediakan TLS otomatis. `vercel.json` menambahkan HSTS `max-age=63072000; includeSubDomains; preload`. | Tinggi | Ya |
| `.gitignore` | `.env`, `.env.*`, `*.pem`, `*.key`, `secrets.json`, `node_modules/` diabaikan. | Tinggi | Ya |
| Validasi input & OWASP | Semua input disanitasi (`sanitizeText`, `sanitizeMultiline`), output di-escape (`escapeHtml`), URL gambar difilter (`safeImageUrl` hanya `assets/`, `http(s)`, atau data URL gambar), unggahan dibatasi tipe gambar & 3 MB, angka di-clamp. | Tinggi | Ya (sisi klien) |
| XSS / header keamanan | CSP ketat (`script-src 'self'`, tanpa inline script), `X-Content-Type-Options`, `X-Frame-Options: DENY`, `frame-ancestors 'none'`, `Referrer-Policy`, `Permissions-Policy`. | Tinggi | Ya |
| Kontrol akses & isolasi | Dashboard menolak tampil tanpa sesi valid; routing `#/...` dijaga; dev/prod terpisah di Vercel (preview vs production). | Sedang | Sebagian |
| Dependensi | Nol dependensi runtime (HTML/CSS/JS murni), sehingga permukaan CVE sangat kecil. Tidak ada `package.json`/bundler. | Sedang | Ya |
| Log | Audit log 200 entri terakhir, retensi 90 hari (`kg_activity_log`), ditampilkan di Pengaturan → Keamanan & Log Aktivitas. | Sedang | Ya (lokal) |
| Backup | Ekspor CSV laporan penjualan. Data produk/pesanan masih di localStorage, belum ada backup terjadwal. | Sedang | Sebagian |
| Kebijakan privasi | Bagian "Kebijakan Privasi" di halaman pelanggan + tombol hapus data browser. | Rendah | Ya |

## Batasan penting (baca sebelum dipakai toko sungguhan)

Situs ini adalah **demo statis tanpa backend**. Karena itu:

1. **Otentikasi tidak bisa dipercaya sepenuhnya.** Hash password dan rate limiting berjalan di browser,
   sehingga penyerang yang mengunduh `js/security.js` bisa melewatinya. Ini hanya menaikkan biaya serangan
   sepele, bukan menggantikan otentikasi server.
2. **Data tidak terisolasi antar pengunjung.** Produk, pesanan, dan pengaturan tersimpan di
   `localStorage` masing-masing browser. Pesanan pelanggan tidak pernah sampai ke dashboard admin di perangkat lain.
3. **Belum ada MFA, session server, atau RBAC.** Kredensial demo (`admin` / `admin`) tertulis di README
   karena situs ini publik; ganti dengan backend sebelum dipakai berjualan.
4. **Header keamanan hanya aktif di Vercel**, bukan saat file dibuka via `file://`.

## Langkah menuju produksi

1. Pindahkan autentikasi ke server: POST `/api/login`, verifikasi dengan Argon2id/bcrypt, cookie
   `HttpOnly; Secure; SameSite=Lax`, session di server, rate limit per IP + per akun.
2. Tambahkan MFA (TOTP atau WebAuthn) untuk akun admin.
3. Pindahkan produk/pesanan ke database (D1/Postgres/MySQL) dengan query berparameter.
4. Batasi akses dashboard dengan middleware server, bukan hanya JavaScript di browser.
5. Aktifkan backup terjadwal + retensi log di server.

## Verifikasi cepat

```bash
# hash & sanitasi
node -e "global.window=global; require('./js/security.js'); \
  console.log(KGSecurity.verifyCredentials('admin','admin'), \
              KGSecurity.verifyCredentials('admin','salah'), \
              KGSecurity.safeImageUrl('javascript:alert(1)'))"

# header produksi (setelah deploy)
curl -sI https://kopigayo.vercel.app | grep -iE 'content-security|strict-transport|x-frame|x-content'
```

Melaporkan celah: buka issue pribadi di repo, jangan menulis kredensial di issue publik.
