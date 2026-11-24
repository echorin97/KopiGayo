/* =========================================================
   Jualan Kopi Gayo — Lapisan penyimpanan (localStorage)
   CATATAN: localStorage hanya tersimpan di browser ini.
   Bukan database bersama. Untuk produksi gunakan backend.
   ========================================================= */
(function () {
  'use strict';

  var KEYS = {
    products: 'kg_products',
    categories: 'kg_categories',
    orders: 'kg_orders',
    settings: 'kg_settings',
    cart: 'kg_cart',
    seeded: 'kg_seeded'
  };

  var ORDER_STATUS = {
    menunggu: { label: 'Menunggu konfirmasi', tone: 'warning' },
    diproses: { label: 'Diproses', tone: 'info' },
    dikirim: { label: 'Dikirim', tone: 'info' },
    selesai: { label: 'Selesai', tone: 'success' },
    dibatalkan: { label: 'Dibatalkan', tone: 'danger' }
  };

  var STATUS_ORDER = ['menunggu', 'diproses', 'dikirim', 'selesai', 'dibatalkan'];

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function getItem(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (err) {
      return null;
    }
  }

  function setItem(key, value) {
    try {
      window.localStorage.setItem(key, value);
      return true;
    } catch (err) {
      return false;
    }
  }

  function read(key, fallback) {
    var raw = getItem(key);
    if (raw === null || raw === '') return fallback;
    try {
      var parsed = JSON.parse(raw);
      return parsed === null || parsed === undefined ? fallback : parsed;
    } catch (err) {
      return fallback;
    }
  }

  function write(key, value) {
    var ok = setItem(key, JSON.stringify(value));
    if (!ok) {
      throw new Error('Penyimpanan browser penuh. Hapus beberapa gambar produk lalu coba lagi.');
    }
    window.dispatchEvent(new CustomEvent('kg:store', { detail: { key: key } }));
  }

  /* Menyiapkan data awal hanya jika belum ada. Tidak pernah menimpa data admin. */
  function seed() {
    var seeded = getItem(KEYS.seeded);
    if (!seeded) {
      if (getItem(KEYS.products) === null) write(KEYS.products, clone(window.KG_SEED.products));
      if (getItem(KEYS.categories) === null) write(KEYS.categories, clone(window.KG_SEED.categories));
      if (getItem(KEYS.settings) === null) write(KEYS.settings, clone(window.KG_SEED.settings));
      if (getItem(KEYS.orders) === null) write(KEYS.orders, []);
      setItem(KEYS.seeded, '1');
    } else {
      if (getItem(KEYS.products) === null) write(KEYS.products, clone(window.KG_SEED.products));
      if (getItem(KEYS.categories) === null) write(KEYS.categories, clone(window.KG_SEED.categories));
      if (getItem(KEYS.settings) === null) write(KEYS.settings, clone(window.KG_SEED.settings));
      if (getItem(KEYS.orders) === null) write(KEYS.orders, []);
    }
    migrateSettings();
  }

  function migrateSettings() {
    var stored = read(KEYS.settings, {});
    var merged = Object.assign({}, window.KG_SEED.settings, stored);
    /* lengkapi kunci baru tanpa menimpa nilai admin */
    Object.keys(window.KG_SEED.settings).forEach(function (key) {
      if (merged[key] === undefined) merged[key] = window.KG_SEED.settings[key];
    });
    setItem(KEYS.settings, JSON.stringify(merged));
  }

  /* ---------- Produk ---------- */
  function getProducts() {
    var list = read(KEYS.products, []);
    return Array.isArray(list) ? list : [];
  }

  function saveProducts(list) {
    write(KEYS.products, list);
  }

  function getProduct(id) {
    return getProducts().filter(function (p) { return p.id === id; })[0] || null;
  }

  function addProduct(data) {
    var list = getProducts();
    var product = normaliseProduct(data);
    product.id = nextProductId(list);
    product.createdAt = new Date().toISOString();
    list.unshift(product);
    saveProducts(list);
    return product;
  }

  function updateProduct(id, data) {
    var list = getProducts();
    var index = -1;
    list.forEach(function (p, i) { if (p.id === id) index = i; });
    if (index < 0) return null;
    var merged = normaliseProduct(Object.assign({}, list[index], data));
    merged.id = id;
    merged.createdAt = list[index].createdAt;
    list[index] = merged;
    saveProducts(list);
    return merged;
  }

  function deleteProduct(id) {
    var list = getProducts().filter(function (p) { return p.id !== id; });
    saveProducts(list);
    var cart = getCart().filter(function (item) { return item.id !== id; });
    saveCart(cart);
  }

  function normaliseProduct(data) {
    return {
      id: data.id || '',
      name: String(data.name || '').trim(),
      categoryId: data.categoryId || '',
      price: Math.max(0, Math.round(Number(data.price) || 0)),
      weight: String(data.weight || '').trim(),
      stock: Math.max(0, Math.floor(Number(data.stock) || 0)),
      origin: String(data.origin || '').trim(),
      process: String(data.process || '').trim(),
      roast: String(data.roast || '').trim(),
      flavor: String(data.flavor || '').trim(),
      description: String(data.description || '').trim(),
      image: String(data.image || '').trim() || 'assets/product-arabica-premium.svg',
      active: data.active !== false,
      createdAt: data.createdAt || new Date().toISOString()
    };
  }

  function nextProductId(list) {
    var max = 0;
    list.forEach(function (p) {
      var num = parseInt(String(p.id).replace(/[^0-9]/g, ''), 10);
      if (!isNaN(num) && num > max) max = num;
    });
    var candidate;
    do {
      max += 1;
      candidate = 'p-' + String(max).padStart(2, '0');
    } while (list.some(function (p) { return p.id === candidate; }));
    return candidate;
  }

  /* ---------- Kategori ---------- */
  function getCategories() {
    var list = read(KEYS.categories, []);
    return Array.isArray(list) ? list : [];
  }

  function saveCategories(list) {
    write(KEYS.categories, list);
  }

  function addCategory(data) {
    var list = getCategories();
    var name = String(data.name || '').trim();
    var category = {
      id: 'cat-' + Date.now().toString(36),
      name: name,
      description: String(data.description || '').trim()
    };
    list.push(category);
    saveCategories(list);
    return category;
  }

  function updateCategory(id, data) {
    var list = getCategories();
    var found = null;
    list.forEach(function (cat) {
      if (cat.id === id) {
        cat.name = String(data.name || cat.name).trim();
        cat.description = String(data.description || '').trim();
        found = cat;
      }
    });
    if (found) saveCategories(list);
    return found;
  }

  function deleteCategory(id) {
    saveCategories(getCategories().filter(function (cat) { return cat.id !== id; }));
  }

  function categoryName(id) {
    var cat = getCategories().filter(function (c) { return c.id === id; })[0];
    return cat ? cat.name : 'Tanpa kategori';
  }

  /* ---------- Keranjang ---------- */
  function getCart() {
    var list = read(KEYS.cart, []);
    return Array.isArray(list) ? list : [];
  }

  function saveCart(list) {
    write(KEYS.cart, list);
  }

  function addToCart(id, qty) {
    var product = getProduct(id);
    if (!product) return { ok: false, message: 'Produk tidak ditemukan.' };
    if (product.stock <= 0) return { ok: false, message: 'Stok produk ini sedang habis.' };
    var cart = getCart();
    var line = cart.filter(function (item) { return item.id === id; })[0];
    var amount = Math.max(1, Math.floor(Number(qty) || 1));
    var current = line ? line.qty : 0;
    if (current + amount > product.stock) {
      return { ok: false, message: 'Jumlah melebihi stok tersedia (' + product.stock + ').' };
    }
    if (line) line.qty = current + amount;
    else cart.push({ id: id, qty: amount });
    saveCart(cart);
    return { ok: true, message: product.name + ' ditambahkan ke keranjang.' };
  }

  function setCartQty(id, qty) {
    var cart = getCart();
    var product = getProduct(id);
    var max = product ? product.stock : 0;
    var amount = Math.floor(Number(qty) || 0);
    if (amount <= 0 || max <= 0) {
      saveCart(cart.filter(function (item) { return item.id !== id; }));
      return;
    }
    cart.forEach(function (item) {
      if (item.id === id) item.qty = Math.min(amount, max);
    });
    saveCart(cart);
  }

  function removeFromCart(id) {
    saveCart(getCart().filter(function (item) { return item.id !== id; }));
  }

  function clearCart() {
    saveCart([]);
  }

  function cartDetails() {
    return getCart().map(function (item) {
      var product = getProduct(item.id);
      return { product: product, qty: item.qty, subtotal: product ? product.price * item.qty : 0 };
    }).filter(function (item) { return item.product; });
  }

  /* ---------- Pesanan ---------- */
  function getOrders() {
    var list = read(KEYS.orders, []);
    return Array.isArray(list) ? list : [];
  }

  function saveOrders(list) {
    write(KEYS.orders, list);
  }

  function addOrder(order) {
    var list = getOrders();
    var now = new Date();
    var stamp = now.getFullYear() + String(now.getMonth() + 1).padStart(2, '0') + String(now.getDate()).padStart(2, '0');
    var seq = list.filter(function (o) { return String(o.id).indexOf('INV-' + stamp) === 0; }).length + 1;
    var record = Object.assign({}, order, {
      id: 'INV-' + stamp + '-' + String(seq).padStart(3, '0'),
      createdAt: now.toISOString(),
      status: 'menunggu',
      source: 'whatsapp'
    });
    list.unshift(record);
    saveOrders(list);
    return record;
  }

  function updateOrderStatus(id, status) {
    if (STATUS_ORDER.indexOf(status) < 0) return null;
    var list = getOrders();
    var found = null;
    list.forEach(function (order) {
      if (order.id === id) {
        order.status = status;
        order.updatedAt = new Date().toISOString();
        found = order;
      }
    });
    if (found) saveOrders(list);
    return found;
  }

  function completedOrders() {
    return getOrders().filter(function (o) { return o.status === 'selesai'; });
  }

  /* ---------- Pengaturan ---------- */
  function getSettings() {
    return Object.assign({}, window.KG_SEED.settings, read(KEYS.settings, {}));
  }

  function saveSettings(data) {
    var merged = Object.assign({}, getSettings(), data);
    write(KEYS.settings, merged);
    return merged;
  }

  /* ---------- Utilitas ---------- */
  function formatRupiah(value) {
    return 'Rp ' + Math.round(Number(value) || 0).toLocaleString('id-ID');
  }

  function formatNumber(value) {
    return (Number(value) || 0).toLocaleString('id-ID');
  }

  function formatDate(iso, withTime) {
    if (!iso) return '—';
    var date = new Date(iso);
    if (isNaN(date.getTime())) return '—';
    var text = date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    if (withTime) {
      text += ', ' + date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    }
    return text;
  }

  function statusLabel(status) {
    return (ORDER_STATUS[status] || { label: status }).label;
  }

  function statusTone(status) {
    return (ORDER_STATUS[status] || { tone: 'neutral' }).tone;
  }

  function escapeHtml(value) {
    return String(value === undefined || value === null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function normalizePhone(value) {
    var digits = String(value || '').replace(/[^0-9]/g, '');
    if (digits.indexOf('0') === 0) digits = '62' + digits.slice(1);
    if (digits.indexOf('8') === 0) digits = '62' + digits;
    return digits;
  }

  function formatPhoneDisplay(value) {
    var digits = normalizePhone(value);
    if (!digits) return '—';
    return '+' + digits.replace(/(\d{2})(\d{3})(\d{4})(\d+)/, '$1 $2-$3-$4');
  }

  window.KGStore = {
    seed: seed,
    getProducts: getProducts,
    saveProducts: saveProducts,
    getProduct: getProduct,
    addProduct: addProduct,
    updateProduct: updateProduct,
    deleteProduct: deleteProduct,
    getCategories: getCategories,
    getCategory: function (id) { return getCategories().filter(function (c) { return c.id === id; })[0] || null; },
    addCategory: addCategory,
    updateCategory: updateCategory,
    deleteCategory: deleteCategory,
    categoryName: categoryName,
    getCart: getCart,
    addToCart: addToCart,
    setCartQty: setCartQty,
    removeFromCart: removeFromCart,
    clearCart: clearCart,
    cartDetails: cartDetails,
    getOrders: getOrders,
    addOrder: addOrder,
    updateOrderStatus: updateOrderStatus,
    completedOrders: completedOrders,
    getSettings: getSettings,
    saveSettings: saveSettings,
    formatRupiah: formatRupiah,
    formatNumber: formatNumber,
    formatDate: formatDate,
    statusLabel: statusLabel,
    statusTone: statusTone,
    statusList: STATUS_ORDER.slice(),
    escapeHtml: escapeHtml,
    normalizePhone: normalizePhone,
    formatPhoneDisplay: formatPhoneDisplay,
    keys: KEYS
  };
})();
