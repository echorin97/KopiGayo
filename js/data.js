/* =========================================================
   Jualan Kopi Gayo — Data awal (seed)
   Semua data demo berada di satu tempat agar mudah diganti
   dengan data dari backend (MySQL/PostgreSQL) nantinya.
   ========================================================= */
(function () {
  'use strict';

  var categories = [
    { id: 'cat-biji', name: 'Biji Kopi', description: 'Biji kopi sangrai utuh, digiling sesuai kebutuhan.' },
    { id: 'cat-bubuk', name: 'Kopi Bubuk', description: 'Kopi bubuk siap seduh untuk harian.' },
    { id: 'cat-specialty', name: 'Kopi Specialty', description: 'Lot terbatas dengan proses khusus.' },
    { id: 'cat-lain', name: 'Produk Lainnya', description: 'Cold brew, drip bag, dan paket oleh-oleh.' }
  ];

  var products = [
    {
      id: 'p-01',
      name: 'Arabica Gayo Premium',
      categoryId: 'cat-biji',
      price: 95000,
      weight: '250 g',
      stock: 42,
      origin: 'Aceh Tengah',
      process: 'Full Washed',
      roast: 'Medium',
      flavor: 'Cokelat hitam, jeruk manis, keasaman seimbang',
      description: 'Biji Arabica dari kebun dataran tinggi Gayo, disangrai sedang agar rasa cokelat dan buahnya seimbang. Cocok untuk V60, Aeropress, maupun espresso.',
      image: 'assets/photos/product-01.jpg',
      active: true,
      createdAt: '2026-01-12T08:00:00.000Z'
    },
    {
      id: 'p-02',
      name: 'Arabica Gayo Wine Process',
      categoryId: 'cat-specialty',
      price: 135000,
      weight: '250 g',
      stock: 18,
      origin: 'Bener Meriah',
      process: 'Wine Process',
      roast: 'Light',
      flavor: 'Anggur merah, buah beri, floral',
      description: 'Fermentasi terkontrol menghasilkan aroma wine yang khas. Lot terbatas dari kebun mitra di Bener Meriah.',
      image: 'assets/photos/product-02.jpg',
      active: true,
      createdAt: '2026-02-02T08:00:00.000Z'
    },
    {
      id: 'p-03',
      name: 'Kopi Bubuk Gayo Klasik',
      categoryId: 'cat-bubuk',
      price: 65000,
      weight: '200 g',
      stock: 60,
      origin: 'Aceh Tengah',
      process: 'Semi Washed',
      roast: 'Medium Dark',
      flavor: 'Cokelat pekat, rempah, body tebal',
      description: 'Kopi bubuk harian dengan body tebal dan rasa cokelat pekat. Nikmat diseduh dengan tubruk atau moka pot.',
      image: 'assets/photos/product-03.jpg',
      active: true,
      createdAt: '2026-01-20T08:00:00.000Z'
    },
    {
      id: 'p-04',
      name: 'Robusta Gayo Biji',
      categoryId: 'cat-biji',
      price: 70000,
      weight: '250 g',
      stock: 0,
      origin: 'Gayo Lues',
      process: 'Natural',
      roast: 'Dark',
      flavor: 'Kacang panggang, tembakau, pahit manis',
      description: 'Robusta dengan body kuat dan aroma kacang panggang. Stok sedang kosong dan akan tersedia kembali setelah panen berikutnya.',
      image: 'assets/photos/product-04.jpg',
      active: true,
      createdAt: '2026-01-28T08:00:00.000Z'
    },
    {
      id: 'p-05',
      name: 'Arabica Gayo Honey Process',
      categoryId: 'cat-specialty',
      price: 125000,
      weight: '250 g',
      stock: 12,
      origin: 'Bener Meriah',
      process: 'Honey Process',
      roast: 'Medium Light',
      flavor: 'Madu, karamel, apel',
      description: 'Proses honey memberi manis alami seperti madu dan karamel. Disarankan diseduh manual brew.',
      image: 'assets/photos/product-05.jpg',
      active: true,
      createdAt: '2026-02-18T08:00:00.000Z'
    },
    {
      id: 'p-06',
      name: 'Gayo Cold Brew Concentrate',
      categoryId: 'cat-lain',
      price: 85000,
      weight: '500 ml',
      stock: 20,
      origin: 'Aceh Tengah',
      process: 'Cold Extraction',
      roast: 'Medium',
      flavor: 'Cokelat susu, manis rendah, segar',
      description: 'Konsentrat cold brew hasil ekstraksi 18 jam. Campur dengan air atau susu sesuai selera, simpan di lemari pendingin.',
      image: 'assets/photos/product-06.jpg',
      active: true,
      createdAt: '2026-03-05T08:00:00.000Z'
    },
    {
      id: 'p-07',
      name: 'Drip Coffee Bag Gayo',
      categoryId: 'cat-lain',
      price: 75000,
      weight: '10 sachet',
      stock: 48,
      origin: 'Aceh Tengah',
      process: 'Full Washed',
      roast: 'Medium',
      flavor: 'Jeruk, karamel, teh hitam',
      description: 'Kopi praktis dalam kantong drip. Cukup tuang air panas, nikmati kopi Gayo di mana saja.',
      image: 'assets/photos/product-07.jpg',
      active: true,
      createdAt: '2026-03-12T08:00:00.000Z'
    },
    {
      id: 'p-08',
      name: 'Paket Oleh-oleh Kopi Gayo',
      categoryId: 'cat-lain',
      price: 185000,
      weight: '2 x 200 g',
      stock: 8,
      origin: 'Aceh Tengah',
      process: 'Assorted',
      roast: 'Medium',
      flavor: 'Cokelat, rempah, buah kering',
      description: 'Paket berisi dua kemasan kopi pilihan dalam kotak oleh-oleh. Cocok untuk hadiah.',
      image: 'assets/photos/product-08.jpg',
      active: true,
      createdAt: '2026-04-01T08:00:00.000Z'
    }
  ];

  var settings = {
    storeName: 'Jualan Kopi Gayo',
    tagline: 'Kopi Arabika Gayo pilihan, disangrai segar dari dataran tinggi Aceh.',
    description: 'Jualan Kopi Gayo menghadirkan kopi dari kebun-kebun kecil di dataran tinggi Gayo, Aceh. Biji dipilih, disangrai, dan dikemas dalam batch kecil agar rasa yang sampai ke cangkir Anda tetap segar.',
    whatsapp: '6281234567890',
    address: 'Jl. Takengon–Bireuen No. 12, Takengon, Aceh Tengah, Aceh 24511',
    email: 'halo@jualankopigayo.id',
    logo: 'assets/logo.svg',
    shipping: 'Gratis ongkir untuk pembelian di atas Rp 250.000. Pengiriman 1–3 hari kerja ke seluruh Indonesia melalui JNE, J&T, atau SiCepat.',
    openHours: 'Senin–Sabtu, 08.00–17.00 WIB'
  };

  window.KG_SEED = {
    version: 1,
    categories: categories,
    products: products,
    settings: settings
  };
})();
