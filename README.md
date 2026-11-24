# Jualan Kopi Gayo

Website katalog kopi Gayo + dashboard admin, dibuat dengan HTML, CSS, dan JavaScript murni
(tanpa framework, tanpa build step). Bisa dibuka langsung dari `file://` maupun di-hosting statis.

**Demo online:** https://kopigayo.vercel.app · **Admin:** https://kopigayo.vercel.app/admin.html

## Login admin (demo)

| Field | Nilai |
| --- | --- |
| Username | `admin` |
| Password | `admin` |

Kredensial demo ini publik dan tidak aman untuk produksi. Password tidak disimpan sebagai teks di kode —
`js/security.js` hanya menyimpan hash SHA-256 iteratif 2.000x dengan salt.

## Menjalankan lokal

```bash
python3 -m http.server 3000
# buka http://localhost:3000 dan http://localhost:3000/admin.html
```

Atau buka `index.html` langsung di browser (semua aset relatif, tanpa modul ES).

## Struktur

```
index.html        Halaman pelanggan (hero, katalog, cerita, galeri, keranjang, privasi)
admin.html        Login + shell dashboard
css/style.css     Gaya halaman pelanggan
css/admin.css     Gaya dashboard
js/security.js    Hash password, rate limit login, sesi bertimer, sanitasi, audit log
js/data.js        Data awal (8 produk, 4 kategori, pengaturan)
js/store.js       Lapisan data localStorage (produk, kategori, pesanan, keranjang)
js/catalog.js     Filter, keranjang, checkout WhatsApp, modal, lightbox
js/admin.js       Login, routing, CRUD produk/kategori/stok, pesanan, laporan, pengaturan
assets/photos/    Foto produk, hero, cerita, galeri
assets/           Logo & ilustrasi SVG
SECURITY.md       Pemetaan checklist keamanan UMKM + batasan
vercel.json       cleanUrls + header keamanan (CSP, HSTS, anti-framing)
```

## Keamanan

Ringkasan: hash password + salt, rate limit 5 percobaan / 10 menit (kunci 5 → 15 → 60 menit),
sesi kedaluwarsa otomatis 30 menit idle / 8 jam absolut, CSP tanpa inline script, sanitasi input,
dan audit log 90 hari. Detail lengkap dan batasannya ada di [SECURITY.md](SECURITY.md).

**Batas penting:** ini demo statis. Data tersimpan di `localStorage` masing-masing browser, jadi pesanan
pelanggan tidak masuk ke dashboard admin di perangkat lain, dan otentikasi belum bisa dipercaya sepenuhnya
tanpa backend.

## Foto

Semua foto di `assets/photos/` berasal dari Wikimedia Commons dengan lisensi **CC0** atau **public domain**
(tidak wajib atribusi):

| Berkas | Sumber |
| --- | --- |
| `hero.jpg`, `story.jpg` | *Pruned and well maintained coffee trees in Takengon Aceh*, *Coffee Plantation in Takengon Aceh* (public domain) |
| `product-01…05.jpg` | Unsplash via Wikimedia Commons (CC0) |
| `product-06.jpg` | *Two cups of iced coffee at Coast Cafe, Worthing* (CC0) |
| `product-07.jpg` | *Brewing Single Serving Pour Over Coffee* — Wikimedia Commons, **CC BY-SA 4.0** (atribusi wajib bila dipakai ulang) |
| `product-08.jpg` | *Coffee mug and biscuit* via Wikimedia Commons (CC0) |
| `gallery-01…04.jpg` | Unsplash via Wikimedia Commons (CC0) |

## Deploy

Repo terhubung ke Vercel (project `wannn/kopigayo`). Setiap push ke `main` otomatis dideploy ulang.
Pengaturan yang benar: Framework Preset **Other**, Build Command kosong, Output Directory kosong.
