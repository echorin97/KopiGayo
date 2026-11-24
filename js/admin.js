/* =========================================================
   Jualan Kopi Gayo — Logika Dashboard Admin
   ========================================================= */
(function () {
  'use strict';

  var S = window.KGStore;
  if (!S) return;

  var DEMO_USER = 'admin';
  var DEMO_PASS = 'admin';
  var SESSION_KEY = 'kg_admin_session';

  var state = {
    view: 'dashboard',
    productQuery: '',
    productCategory: 'all',
    productSort: 'name',
    stockFilter: 'all',
    orderFilter: 'all',
    reportPeriod: 'bulan',
    productImage: '',
    settingsLogo: ''
  };

  var memorySession = false;
  var renderToken = 0;
  var clockTimer = null;
  var modalPreviousFocus = null;

  var ICONS = {
    grid: '<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
    box: '<path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/>',
    tag: '<path d="M20.6 13.4L11 3.8A2 2 0 0 0 9.6 3H4a1 1 0 0 0-1 1v5.6a2 2 0 0 0 .6 1.4l9.6 9.6a2 2 0 0 0 2.8 0l4.6-4.6a2 2 0 0 0 0-2.6z"/><circle cx="7.5" cy="7.5" r="1.2"/>',
    layers: '<path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 12l9 5 9-5"/><path d="M3 16l9 5 9-5"/>',
    cart: '<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    wallet: '<path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4z"/>',
    pencil: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    trash: '<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/>',
    eye: '<path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
    chart: '<path d="M3 3v18h18"/><path d="M7 15l4-5 3 3 5-7"/>',
    check: '<path d="M20 6L9 17l-5-5"/>',
    alert: '<path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>',
    x: '<path d="M18 6L6 18M6 6l12 12"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5M12 15V3"/>',
    store: '<path d="M3 9l1.5-5h15L21 9"/><path d="M4 9v11h16V9"/><path d="M9 20v-6h6v6"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/>',
    chat: '<path d="M21 11.5a8.4 8.4 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7a8.5 8.5 0 1 1 16.1-3.8z"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 8l5-5 5 5M12 3v12"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>'
  };

  var VIEWS = {
    dashboard: { title: 'Ringkasan Dashboard', subtitle: 'Pantau performa toko kopi Anda', render: renderDashboard },
    produk: { title: 'Kelola Produk', subtitle: 'Tambah, ubah, dan atur produk kopi', render: renderProductsView },
    kategori: { title: 'Kategori Produk', subtitle: 'Kelompokkan produk untuk filter katalog', render: renderCategoriesView },
    stok: { title: 'Stok Produk', subtitle: 'Perbarui dan pantau ketersediaan stok', render: renderStockView },
    pesanan: { title: 'Pesanan', subtitle: 'Kelola status pesanan pelanggan', render: renderOrdersView },
    laporan: { title: 'Laporan Penjualan', subtitle: 'Rekap transaksi dan ekspor CSV', render: renderReportsView },
    pengaturan: { title: 'Pengaturan Toko', subtitle: 'Informasi toko yang tampil di website', render: renderSettingsView }
  };

  document.addEventListener('DOMContentLoaded', init);

  /* ==================== INISIALISASI ==================== */
  function init() {
    S.seed();
    bindLogin();
    bindShell();
    startClock();
    applyBranding();

    if (isLoggedIn()) {
      showApp();
    } else {
      showLogin();
    }
  }

  function $(selector, root) { return (root || document).querySelector(selector); }
  function $$(selector, root) { return Array.prototype.slice.call((root || document).querySelectorAll(selector)); }
  function e(value) { return S.escapeHtml(value); }
  function icon(name) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + (ICONS[name] || '') + '</svg>';
  }

  /* ==================== AUTENTIKASI ==================== */
  function isLoggedIn() {
    try {
      return window.sessionStorage.getItem(SESSION_KEY) === '1';
    } catch (err) {
      return memorySession;
    }
  }

  function setLoggedIn(value) {
    memorySession = value;
    try {
      if (value) window.sessionStorage.setItem(SESSION_KEY, '1');
      else window.sessionStorage.removeItem(SESSION_KEY);
    } catch (err) { /* sessionStorage tidak tersedia, gunakan memori */ }
  }

  function bindLogin() {
    var form = $('#loginForm');
    var error = $('#loginError');
    var toggle = $('#togglePassword');
    var password = $('#loginPassword');
    var username = $('#loginUsername');

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var user = username.value.trim();
      var pass = password.value;
      if (user === DEMO_USER && pass === DEMO_PASS) {
        setLoggedIn(true);
        error.classList.remove('show');
        form.reset();
        password.type = 'password';
        showApp();
        toast('Login berhasil', 'Selamat datang di Dashboard Admin.', 'success');
      } else {
        error.classList.add('show');
        password.focus();
        password.select();
      }
    });

    toggle.addEventListener('click', function () {
      var isPassword = password.type === 'password';
      password.type = isPassword ? 'text' : 'password';
      toggle.setAttribute('aria-label', isPassword ? 'Sembunyikan password' : 'Tampilkan password');
      toggle.setAttribute('aria-pressed', isPassword ? 'true' : 'false');
      var eye = $('#eyeIcon');
      eye.innerHTML = isPassword
        ? '<path d="M17.9 17.9A10.4 10.4 0 0 1 12 20C5 20 1 12 1 12a18.8 18.8 0 0 1 5.1-5.9M9.9 4.2A10.9 10.9 0 0 1 12 4c7 0 11 8 11 8a18.7 18.7 0 0 1-2.2 3.2M1 1l22 22"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>'
        : '<path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/>';
      password.focus();
    });

    [username, password].forEach(function (input) {
      input.addEventListener('input', function () { error.classList.remove('show'); });
    });
  }

  function showLogin() {
    $('#loginView').hidden = false;
    $('#appView').hidden = true;
    document.title = 'Login Admin — Jualan Kopi Gayo';
    closeModal();
    try { history.replaceState(null, '', location.pathname); } catch (err) { /* file:// */ }
    setTimeout(function () { $('#loginUsername').focus(); }, 60);
  }

  function showApp() {
    $('#loginView').hidden = true;
    $('#appView').hidden = false;
    applyBranding();
    updatePendingBadge();
    var hashView = location.hash.replace('#/', '').trim();
    setView(VIEWS[hashView] ? hashView : 'dashboard');
  }

  function logout() {
    setLoggedIn(false);
    state.view = 'dashboard';
    showLogin();
    toast('Anda telah logout', 'Dashboard tidak dapat diakses tanpa login.', 'info');
  }

  function bindShell() {
    $('#logoutBtn').addEventListener('click', logout);
    $('#logoutSide').addEventListener('click', logout);

    $('#menuToggle').addEventListener('click', function () {
      document.body.classList.add('sidebar-open');
      $('#sidebarOverlay').classList.add('show');
    });
    $('#sidebarOverlay').addEventListener('click', closeSidebar);

    var collapse = $('#sidebarCollapse');
    collapse.style.display = 'inline-grid';
    collapse.addEventListener('click', function () {
      document.body.classList.toggle('sidebar-collapsed');
      try {
        localStorage.setItem('kg_sidebar_collapsed', document.body.classList.contains('sidebar-collapsed') ? '1' : '0');
      } catch (err) { /* abaikan */ }
    });
    try {
      if (localStorage.getItem('kg_sidebar_collapsed') === '1') document.body.classList.add('sidebar-collapsed');
    } catch (err) { /* abaikan */ }

    $('#sidebar').addEventListener('click', function (event) {
      var link = event.target.closest('[data-view]');
      if (!link) return;
      setView(link.getAttribute('data-view'));
      closeSidebar();
    });

    document.addEventListener('click', onDocumentClick);
    document.addEventListener('submit', onDocumentSubmit);
    document.addEventListener('input', onDocumentInput);
    document.addEventListener('change', onDocumentChange);

    window.addEventListener('hashchange', function () {
      if (!isLoggedIn()) { showLogin(); return; }
      var name = location.hash.replace('#/', '').trim();
      if (VIEWS[name] && name !== state.view) setView(name);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && $('#modalRoot').classList.contains('open')) closeModal();
    });

    window.addEventListener('storage', function (event) {
      if (!event.key || event.key.indexOf('kg_') !== 0 || !isLoggedIn()) return;
      applyBranding();
      updatePendingBadge();
      setView(state.view);
    });
  }

  function closeSidebar() {
    document.body.classList.remove('sidebar-open');
    $('#sidebarOverlay').classList.remove('show');
  }

  /* ==================== ROUTING VIEW ==================== */
  function setView(name) {
    if (!VIEWS[name]) name = 'dashboard';
    state.view = name;
    if (location.hash !== '#/' + name) {
      try { history.replaceState(null, '', '#/' + name); } catch (err) { /* abaikan */ }
    }
    $$('.side-link[data-view]').forEach(function (link) {
      link.classList.toggle('active', link.getAttribute('data-view') === name);
    });
    $('#pageTitle').textContent = VIEWS[name].title;
    $('#pageSubtitle').textContent = name === 'dashboard'
      ? getGreeting() + ', Admin — ' + VIEWS[name].subtitle.toLowerCase()
      : VIEWS[name].subtitle;

    var view = $('#view');
    var token = ++renderToken;
    view.innerHTML = '<div class="skeleton-grid"><div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div></div><div class="skeleton wide"></div>';
    window.setTimeout(function () {
      if (token !== renderToken) return;
      view.innerHTML = VIEWS[name].render();
      view.classList.remove('view');
      void view.offsetWidth;
      view.classList.add('view');
      updatePendingBadge();
    }, 140);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    closeSidebar();
  }

  function onDocumentClick(event) {
    if (event.target === $('#modalRoot')) { closeModal(); return; }

    var closeBtn = event.target.closest('[data-action="close-modal"]');
    if (closeBtn) { closeModal(); return; }

    var goto = event.target.closest('[data-action="goto"]');
    if (goto) { setView(goto.getAttribute('data-view') || goto.getAttribute('data-goto') || 'dashboard'); return; }

    var btn = event.target.closest('[data-action]');
    if (!btn) return;
    var action = btn.getAttribute('data-action');
    var id = btn.getAttribute('data-id');

    switch (action) {
      case 'open-product-form': openProductForm(id || null); break;
      case 'edit-product': openProductForm(id); break;
      case 'view-product': openProductDetail(id); break;
      case 'delete-product': confirmDeleteProduct(id); break;
      case 'toggle-product': toggleProductActive(id); break;
      case 'open-category-form': openCategoryForm(id || null); break;
      case 'edit-category': openCategoryForm(id); break;
      case 'delete-category': confirmDeleteCategory(id); break;
      case 'stock-plus': adjustStock(id, 1); break;
      case 'stock-minus': adjustStock(id, -1); break;
      case 'stock-save': saveStockInput(id); break;
      case 'stock-filter':
        state.stockFilter = btn.getAttribute('data-filter') || 'all';
        setView('stok');
        break;
      case 'order-filter':
        state.orderFilter = btn.getAttribute('data-status') || 'all';
        setView('pesanan');
        break;
      case 'view-order': openOrderDetail(id); break;
      case 'save-order-status': saveOrderStatusFromModal(id); break;
      case 'report-period':
        state.reportPeriod = btn.getAttribute('data-period') || 'bulan';
        setView('laporan');
        break;
      case 'export-csv': exportCsv(); break;
      case 'reset-filters':
        state.productQuery = '';
        state.productCategory = 'all';
        state.productSort = 'name';
        setView('produk');
        break;
      default: break;
    }
  }

  function onDocumentInput(event) {
    if (event.target.id === 'productSearch') {
      state.productQuery = event.target.value;
      refreshProductTable();
    }
    if (event.target.id === 'productImageUrl') {
      state.productImage = event.target.value.trim();
      updateImagePreview('#productImagePreview', state.productImage);
    }
    if (event.target.id === 'settingsLogoUrl') {
      state.settingsLogo = event.target.value.trim();
      updateImagePreview('#settingsLogoPreview', state.settingsLogo);
    }
  }

  function onDocumentChange(event) {
    var target = event.target;
    if (target.id === 'productCategory') {
      state.productCategory = target.value;
      refreshProductTable();
    }
    if (target.id === 'productSort') {
      state.productSort = target.value;
      refreshProductTable();
    }
    if (target.id === 'productImageFile') {
      handleImageFile(target.files[0], function (dataUrl) {
        state.productImage = dataUrl;
        updateImagePreview('#productImagePreview', dataUrl);
        toast('Gambar siap', 'Gambar produk berhasil dimuat dari perangkat.', 'success');
      });
    }
    if (target.id === 'settingsLogoFile') {
      handleImageFile(target.files[0], function (dataUrl) {
        state.settingsLogo = dataUrl;
        updateImagePreview('#settingsLogoPreview', dataUrl);
        toast('Logo siap', 'Logo berhasil dimuat. Tekan Simpan untuk menerapkan.', 'success');
      });
    }
    if (target.classList.contains('order-status-inline')) {
      var order = S.updateOrderStatus(target.getAttribute('data-id'), target.value);
      if (order) {
        toast('Status pesanan diperbarui', order.id + ' → ' + S.statusLabel(order.status), 'success');
        updatePendingBadge();
        setView('pesanan');
      }
    }
  }

  function onDocumentSubmit(event) {
    if (event.target.id === 'productForm') {
      event.preventDefault();
      saveProductForm(event.target);
    }
    if (event.target.id === 'categoryForm') {
      event.preventDefault();
      saveCategoryForm(event.target);
    }
    if (event.target.id === 'settingsForm') {
      event.preventDefault();
      saveSettingsForm(event.target);
    }
  }

  /* ==================== TANGGAL & BRANDING ==================== */
  function startClock() {
    updateClock();
    if (clockTimer) clearInterval(clockTimer);
    clockTimer = setInterval(updateClock, 1000);
  }

  function updateClock() {
    var now = new Date();
    var time = $('#clockTime');
    var date = $('#clockDate');
    if (time) time.textContent = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/\./g, ':');
    if (date) date.textContent = now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }

  function getGreeting() {
    var hour = new Date().getHours();
    if (hour < 11) return 'Selamat pagi';
    if (hour < 15) return 'Selamat siang';
    if (hour < 19) return 'Selamat sore';
    return 'Selamat malam';
  }

  function applyBranding() {
    var settings = S.getSettings();
    var name = settings.storeName || 'Jualan Kopi Gayo';
    if ($('#sidebarStoreName')) $('#sidebarStoreName').textContent = name;
    if ($('#loginBrandName')) $('#loginBrandName').textContent = name;
    if ($('#sidebarLogo') && settings.logo) $('#sidebarLogo').src = settings.logo;
    if ($('#loginLogo') && settings.logo) $('#loginLogo').src = settings.logo;
    if (isLoggedIn()) document.title = 'Dashboard Admin — ' + name;
    updatePendingBadge();
  }

  function updatePendingBadge() {
    var badge = $('#pendingBadge');
    if (!badge) return;
    var pending = S.getOrders().filter(function (order) { return order.status === 'menunggu'; }).length;
    badge.textContent = pending;
    badge.hidden = pending === 0;
  }

  /* ==================== UTIL ==================== */
  function badge(text, tone) {
    return '<span class="badge badge-' + (tone || 'neutral') + '"><span class="dot"></span>' + e(text) + '</span>';
  }

  function stockBadge(stock) {
    if (stock <= 0) return badge('Habis', 'danger');
    if (stock <= 10) return badge('Menipis', 'warning');
    return badge('Aman', 'success');
  }

  function statusBadge(status) {
    return badge(S.statusLabel(status), S.statusTone(status));
  }

  function shortMoney(value) {
    var n = Number(value) || 0;
    if (n >= 1000000) {
      var millions = n / 1000000;
      var text = millions % 1 === 0 ? millions.toFixed(0) : millions.toFixed(1).replace('.', ',');
      return 'Rp ' + text + ' jt';
    }
    if (n >= 1000) return 'Rp ' + Math.round(n / 1000) + ' rb';
    return 'Rp ' + n;
  }

  function toast(title, message, type) {
    var stack = $('#toastStack');
    var iconName = type === 'error' ? 'alert' : type === 'info' ? 'info' : 'check';
    var node = document.createElement('div');
    node.className = 'toast ' + (type || 'success');
    node.innerHTML = icon(iconName) + '<div><strong>' + e(title) + '</strong>' + (message ? '<span>' + e(message) + '</span>' : '') + '</div>';
    stack.appendChild(node);
    window.setTimeout(function () {
      node.style.opacity = '0';
      node.style.transform = 'translateX(14px)';
      node.style.transition = 'all .25s ease';
      window.setTimeout(function () { node.remove(); }, 260);
    }, 4200);
  }

  function openModal(html, size) {
    var root = $('#modalRoot');
    modalPreviousFocus = document.activeElement;
    root.innerHTML = '<div class="modal-card ' + (size || '') + '" role="dialog" aria-modal="true">' + html + '</div>';
    root.classList.add('open');
    root.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    window.setTimeout(function () {
      var focusable = root.querySelector('.modal-body input:not([type="file"]), .modal-body select, .modal-body textarea') || root.querySelector('.close-x');
      if (focusable) focusable.focus();
    }, 80);
  }

  function closeModal() {
    var root = $('#modalRoot');
    root.classList.remove('open');
    root.setAttribute('aria-hidden', 'true');
    root.innerHTML = '';
    document.body.style.overflow = '';
    if (modalPreviousFocus && modalPreviousFocus.focus) {
      try { modalPreviousFocus.focus(); } catch (err) { /* abaikan */ }
    }
  }

  function modalHead(title, subtitle) {
    return '<div class="modal-head"><div><h3>' + e(title) + '</h3>' +
      (subtitle ? '<p>' + e(subtitle) + '</p>' : '') + '</div>' +
      '<button type="button" class="close-x" data-action="close-modal" aria-label="Tutup">' + icon('x') + '</button></div>';
  }

  function confirmDialog(options) {
    openModal(
      '<div class="modal-body"><div class="confirm-icon ' + (options.tone || '') + '">' + icon(options.icon || 'alert') + '</div>' +
      '<h3 style="font-size:17px;margin-bottom:6px">' + e(options.title) + '</h3>' +
      '<p class="confirm-text">' + options.message + '</p></div>' +
      '<div class="modal-foot"><button type="button" class="btn btn-outline" data-action="close-modal">Batal</button>' +
      '<button type="button" class="btn ' + (options.danger === false ? 'btn-primary' : 'btn-danger') + '" id="confirmDialogBtn">' + e(options.confirmText || 'Hapus') + '</button></div>',
      'sm'
    );
    var button = $('#confirmDialogBtn');
    button.addEventListener('click', function () {
      closeModal();
      options.onConfirm();
    });
  }

  function emptyState(title, text, actionLabel, action) {
    return '<div class="empty"><div class="empty-icon">' + icon('box') + '</div><h3>' + e(title) + '</h3><p>' + e(text) + '</p>' +
      (actionLabel ? '<button class="btn btn-primary btn-sm" data-action="' + action + '">' + icon('plus') + e(actionLabel) + '</button>' : '') +
      '</div>';
  }

  function emptyChart(title, text) {
    return '<div class="chart-empty">' + icon('chart') + '<div><strong>' + e(title) + '</strong><span>' + e(text) + '</span></div></div>';
  }

  function updateImagePreview(selector, src) {
    var box = $(selector);
    if (!box) return;
    if (!src) {
      box.innerHTML = icon('image');
      return;
    }
    box.innerHTML = '<img src="' + e(src) + '" alt="Pratinjau gambar" />';
  }

  function handleImageFile(file, callback) {
    if (!file) return;
    if (!/^image\//.test(file.type)) {
      toast('Format tidak didukung', 'Pilih berkas gambar (JPG, PNG, atau WebP).', 'error');
      return;
    }
    var reader = new FileReader();
    reader.onload = function (event) {
      var image = new Image();
      image.onload = function () {
        var max = 640;
        var scale = Math.min(1, max / Math.max(image.width, image.height));
        var canvas = document.createElement('canvas');
        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);
        canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
        try {
          callback(canvas.toDataURL('image/jpeg', 0.82));
        } catch (err) {
          callback(event.target.result);
        }
      };
      image.onerror = function () { callback(event.target.result); };
      image.src = event.target.result;
    };
    reader.onerror = function () {
      toast('Gagal membaca gambar', 'Coba pilih berkas lain.', 'error');
    };
    reader.readAsDataURL(file);
  }

  /* ==================== DASHBOARD ==================== */
  function renderDashboard() {
    var settings = S.getSettings();
    var products = S.getProducts();
    var categories = S.getCategories();
    var orders = S.getOrders();
    var completed = orders.filter(function (o) { return o.status === 'selesai'; });
    var pending = orders.filter(function (o) { return o.status === 'menunggu'; });
    var totalStock = products.reduce(function (sum, p) { return sum + (Number(p.stock) || 0); }, 0);
    var totalSales = completed.reduce(function (sum, o) { return sum + (Number(o.total) || 0); }, 0);
    var activeCount = products.filter(function (p) { return p.active !== false; }).length;
    var lowStock = products.filter(function (p) { return p.stock > 0 && p.stock <= 10; });
    var outStock = products.filter(function (p) { return p.stock <= 0; });
    var average = completed.length ? Math.round(totalSales / completed.length) : 0;

    var html = '<div class="greeting">' +
      '<div><h2>' + e(getGreeting()) + ', Admin</h2>' +
      '<p>Ini ringkasan ' + e(settings.storeName) + ' hari ini.</p></div>' +
      '<button class="btn btn-primary" data-action="open-product-form">' + icon('plus') + 'Tambah Produk</button>' +
      '</div>';

    if (lowStock.length || outStock.length) {
      var parts = [];
      if (outStock.length) parts.push('<strong>' + outStock.length + ' produk habis</strong>');
      if (lowStock.length) parts.push('<strong>' + lowStock.length + ' produk stok menipis</strong>');
      html += '<div class="notice">' + icon('alert') +
        '<div>Perlu perhatian: ' + parts.join(' dan ') + '. ' +
        '<button class="btn btn-sm btn-outline" data-action="goto" data-view="stok" style="margin-left:4px">Kelola stok</button></div></div>';
    }

    html += '<div class="cards-grid">' +
      statCard('box', '', 'Total Produk', S.formatNumber(products.length), activeCount + ' produk aktif') +
      statCard('tag', 'blue', 'Total Kategori', S.formatNumber(categories.length), 'Dipakai pada filter katalog') +
      statCard('layers', 'green', 'Total Stok Produk', S.formatNumber(totalStock), 'unit dari seluruh produk') +
      statCard('cart', '', 'Jumlah Pesanan', S.formatNumber(orders.length), 'termasuk semua status') +
      statCard('clock', 'amber', 'Menunggu Konfirmasi', S.formatNumber(pending.length), 'pesanan perlu ditindaklanjuti') +
      statCard('wallet', 'green', 'Total Penjualan Tercatat', S.formatRupiah(totalSales), completed.length + ' pesanan selesai · rata-rata ' + S.formatRupiah(average)) +
      '</div>';

    html += '<div class="two-col">' +
      '<div class="panel"><div class="panel-head"><div><h3>Penjualan Bulanan</h3><p>6 bulan terakhir · hanya pesanan berstatus Selesai</p></div>' +
      '<div class="panel-actions"><button class="btn btn-sm btn-outline" data-action="goto" data-view="laporan">Lihat laporan</button></div></div>' +
      '<div class="panel-body">' + barChart(monthlySeries(completed, 6), 'Belum ada penjualan selesai', 'Angka akan muncul setelah pesanan ditandai Selesai.') + '</div></div>' +

      '<div class="panel"><div class="panel-head"><div><h3>Produk Terlaris</h3><p>Berdasarkan jumlah unit terjual</p></div></div>' +
      '<div class="panel-body">' + topProductsChart(completed) + '</div></div>' +
      '</div>';

    html += '<div class="panel"><div class="panel-head"><div><h3>Pesanan Terbaru</h3><p>5 pesanan terakhir yang tercatat</p></div>' +
      '<div class="panel-actions"><button class="btn btn-sm btn-outline" data-action="goto" data-view="pesanan">Semua pesanan</button></div></div>' +
      '<div class="panel-body flush">' + recentOrdersTable(orders.slice(0, 5)) + '</div></div>';

    return html;
  }

  function statCard(iconName, tone, label, value, note) {
    return '<div class="stat-card"><span class="stat-icon ' + (tone || '') + '">' + icon(iconName) + '</span>' +
      '<div class="stat-meta"><span>' + e(label) + '</span><strong>' + e(value) + '</strong>' +
      (note ? '<small>' + e(note) + '</small>' : '') + '</div></div>';
  }

  function monthlySeries(orders, months) {
    var now = new Date();
    var series = [];
    for (var i = months - 1; i >= 0; i--) {
      var date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      var total = orders.reduce(function (sum, order) {
        var created = new Date(order.createdAt);
        if (created.getFullYear() === date.getFullYear() && created.getMonth() === date.getMonth()) {
          return sum + (Number(order.total) || 0);
        }
        return sum;
      }, 0);
      series.push({
        label: date.toLocaleDateString('id-ID', { month: 'short' }),
        full: date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }),
        value: total
      });
    }
    return series;
  }

  function barChart(series, emptyTitle, emptyText) {
    var hasData = series.some(function (item) { return item.value > 0; });
    if (!hasData) return emptyChart(emptyTitle, emptyText);
    var max = Math.max.apply(null, series.map(function (item) { return item.value; }));
    var dense = series.length > 14;
    var bars = series.map(function (item) {
      var height = Math.max(4, Math.round((item.value / max) * 150));
      return '<div class="bar-col"><div class="bar-wrap"><div class="bar" style="height:' + height + 'px" title="' +
        e(item.full) + ': ' + S.formatRupiah(item.value) + '">' +
        (item.value > 0 ? '<span>' + e(shortMoney(item.value)) + '</span>' : '') +
        '</div></div><div class="bar-label">' + e(item.label) + '</div></div>';
    }).join('');
    return '<div class="chart-bars' + (dense ? ' dense' : '') + '">' + bars + '</div>';
  }

  function productSales(orders) {
    var map = {};
    orders.forEach(function (order) {
      (order.items || []).forEach(function (item) {
        var key = item.productId || item.name;
        if (!map[key]) map[key] = { name: item.name, qty: 0, revenue: 0 };
        map[key].qty += Number(item.qty) || 0;
        map[key].revenue += (Number(item.price) || 0) * (Number(item.qty) || 0);
      });
    });
    return Object.keys(map).map(function (key) { return map[key]; }).sort(function (a, b) { return b.qty - a.qty; });
  }

  function topProductsChart(orders) {
    var ranked = productSales(orders).slice(0, 5);
    if (!ranked.length) return emptyChart('Belum ada produk terjual', 'Data muncul setelah ada pesanan berstatus Selesai.');
    var max = ranked[0].qty || 1;
    return '<div class="hbar-list">' + ranked.map(function (item) {
      var width = Math.max(6, Math.round((item.qty / max) * 100));
      return '<div class="hbar-row"><div class="hbar-top"><strong>' + e(item.name) + '</strong>' +
        '<span>' + item.qty + ' terjual</span></div>' +
        '<div class="hbar-track"><div class="hbar-fill" style="width:' + width + '%"></div></div></div>';
    }).join('') + '</div>';
  }

  function recentOrdersTable(orders) {
    if (!orders.length) {
      return '<div class="empty small"><div class="empty-icon">' + icon('cart') + '</div><h3>Belum ada pesanan</h3>' +
        '<p>Pesanan dari checkout WhatsApp akan muncul di sini setelah pelanggan mengisi nama dan nomor WhatsApp.</p>' +
        '<button class="btn btn-outline btn-sm" data-action="goto" data-view="pesanan">Buka menu pesanan</button></div>';
    }
    return '<div class="table-wrap"><table class="data-table"><thead><tr>' +
      '<th>ID Pesanan</th><th>Pelanggan</th><th>Tanggal</th><th>Total</th><th>Status</th></tr></thead><tbody>' +
      orders.map(function (order) {
        return '<tr><td class="cell-strong">' + e(order.id) + '</td>' +
          '<td>' + e(order.customer && order.customer.name) + '</td>' +
          '<td class="cell-muted">' + e(S.formatDate(order.createdAt)) + '</td>' +
          '<td class="price-now">' + S.formatRupiah(order.total) + '</td>' +
          '<td>' + statusBadge(order.status) + '</td></tr>';
      }).join('') + '</tbody></table></div>';
  }

  /* ==================== PRODUK ==================== */
  function renderProductsView() {
    var categories = S.getCategories();
    var options = '<option value="all">Semua kategori</option>' + categories.map(function (cat) {
      return '<option value="' + e(cat.id) + '"' + (state.productCategory === cat.id ? ' selected' : '') + '>' + e(cat.name) + '</option>';
    }).join('');
    var sortOptions = [
      ['name', 'Nama A–Z'],
      ['price-asc', 'Harga terendah'],
      ['price-desc', 'Harga tertinggi'],
      ['stock-asc', 'Stok tersedikit'],
      ['newest', 'Terbaru']
    ].map(function (pair) {
      return '<option value="' + pair[0] + '"' + (state.productSort === pair[0] ? ' selected' : '') + '>' + pair[1] + '</option>';
    }).join('');

    return '<div class="toolbar">' +
      '<div class="search-box">' + icon('search') +
      '<input type="search" id="productSearch" placeholder="Cari nama produk…" value="' + e(state.productQuery) + '" autocomplete="off" aria-label="Cari produk" /></div>' +
      '<select id="productCategory" aria-label="Filter kategori">' + options + '</select>' +
      '<select id="productSort" aria-label="Urutkan produk">' + sortOptions + '</select>' +
      '<div class="spacer"></div>' +
      '<button class="btn btn-primary" data-action="open-product-form">' + icon('plus') + 'Tambah Produk</button>' +
      '</div>' +
      '<div id="productTableWrap">' + productListHtml() + '</div>';
  }

  function productListHtml() {
    var products = S.getProducts();
    var query = state.productQuery.toLowerCase();
    var list = products.filter(function (product) {
      if (state.productCategory !== 'all' && product.categoryId !== state.productCategory) return false;
      if (!query) return true;
      return (product.name + ' ' + product.origin + ' ' + product.flavor).toLowerCase().indexOf(query) >= 0;
    });

    if (state.productSort === 'price-asc') list.sort(function (a, b) { return a.price - b.price; });
    else if (state.productSort === 'price-desc') list.sort(function (a, b) { return b.price - a.price; });
    else if (state.productSort === 'stock-asc') list.sort(function (a, b) { return a.stock - b.stock; });
    else if (state.productSort === 'newest') list.sort(function (a, b) { return new Date(b.createdAt) - new Date(a.createdAt); });
    else list.sort(function (a, b) { return a.name.localeCompare(b.name, 'id'); });

    var head = '<div class="panel"><div class="panel-head"><div><h3>Daftar Produk</h3>' +
      '<p>' + list.length + ' dari ' + products.length + ' produk</p></div>' +
      '<div class="panel-actions"><span class="badge badge-success">' + products.filter(function (p) { return p.active !== false; }).length + ' aktif</span>' +
      (products.length - products.filter(function (p) { return p.active !== false; }).length > 0
        ? '<span class="badge badge-neutral">' + (products.length - products.filter(function (p) { return p.active !== false; }).length) + ' nonaktif</span>'
        : '') +
      '</div></div>';

    if (!products.length) {
      return head + emptyState('Belum ada produk', 'Tambahkan produk pertama Anda untuk mulai berjualan.', 'Tambah Produk', 'open-product-form') + '</div>';
    }
    if (!list.length) {
      return head + '<div class="empty"><div class="empty-icon">' + icon('search') + '</div><h3>Produk tidak ditemukan</h3>' +
        '<p>Tidak ada produk yang cocok dengan pencarian atau filter saat ini.</p>' +
        '<button class="btn btn-outline btn-sm" data-action="reset-filters">Reset pencarian</button></div></div>';
    }

    var rows = list.map(function (product) {
      return '<tr>' +
        '<td><div class="product-cell"><img src="' + e(product.image) + '" alt="' + e(product.name) + '" />' +
        '<div><div class="name">' + e(product.name) + '</div><div class="id">' + e(product.id) + ' · ' + e(product.weight) + '</div></div></div></td>' +
        '<td>' + e(S.categoryName(product.categoryId)) + '</td>' +
        '<td class="price-now">' + S.formatRupiah(product.price) + '</td>' +
        '<td><span class="stock-number">' + product.stock + '</span> ' + stockBadge(product.stock) + '</td>' +
        '<td><button class="badge ' + (product.active !== false ? 'badge-success' : 'badge-neutral') + '" data-action="toggle-product" data-id="' + e(product.id) + '" title="Klik untuk mengubah status">' +
        (product.active !== false ? 'Aktif' : 'Nonaktif') + '</button></td>' +
        '<td><div class="cell-actions">' +
        '<button class="btn-icon" data-action="view-product" data-id="' + e(product.id) + '" title="Detail produk" aria-label="Detail produk">' + icon('eye') + '</button>' +
        '<button class="btn-icon" data-action="edit-product" data-id="' + e(product.id) + '" title="Edit produk" aria-label="Edit produk">' + icon('pencil') + '</button>' +
        '<button class="btn-icon danger" data-action="delete-product" data-id="' + e(product.id) + '" title="Hapus produk" aria-label="Hapus produk">' + icon('trash') + '</button>' +
        '</div></td></tr>';
    }).join('');

    return head + '<div class="panel-body flush"><div class="table-wrap"><table class="data-table"><thead><tr>' +
      '<th>Produk</th><th>Kategori</th><th>Harga</th><th>Stok</th><th>Status</th><th style="text-align:right">Aksi</th>' +
      '</tr></thead><tbody>' + rows + '</tbody></table></div></div></div>';
  }

  function refreshProductTable() {
    var wrap = $('#productTableWrap');
    if (wrap) wrap.innerHTML = productListHtml();
  }

  function openProductDetail(id) {
    var product = S.getProduct(id);
    if (!product) { toast('Produk tidak ditemukan', '', 'error'); return; }
    var fields = [
      ['ID Produk', product.id],
      ['Kategori', S.categoryName(product.categoryId)],
      ['Harga', S.formatRupiah(product.price)],
      ['Berat / ukuran', product.weight],
      ['Stok', product.stock + ' unit'],
      ['Asal kopi', product.origin],
      ['Metode pengolahan', product.process],
      ['Tingkat roasting', product.roast],
      ['Status produk', product.active !== false ? 'Aktif' : 'Nonaktif'],
      ['Dibuat', S.formatDate(product.createdAt, true)]
    ];
    openModal(
      modalHead('Detail Produk', product.name) +
      '<div class="modal-body"><div class="detail-hero">' +
      '<img src="' + e(product.image) + '" alt="' + e(product.name) + '" />' +
      '<div><h4>' + e(product.name) + '</h4><p>' + e(product.flavor) + '</p>' +
      '<div style="margin-top:8px">' + stockBadge(product.stock) + ' ' + (product.active !== false ? badge('Aktif', 'success') : badge('Nonaktif', 'neutral')) + '</div></div></div>' +
      '<div class="detail-list">' + fields.map(function (field) {
        return '<div><span>' + e(field[0]) + '</span><strong>' + e(field[1]) + '</strong></div>';
      }).join('') + '</div>' +
      '<div style="margin-top:18px"><span style="display:block;font-size:10px;letter-spacing:.07em;text-transform:uppercase;color:#7C6A5A;margin-bottom:4px">Deskripsi</span>' +
      '<p style="margin:0;font-size:13px;color:#5D4C3C;line-height:1.7">' + e(product.description || '—') + '</p></div>' +
      '</div>' +
      '<div class="modal-foot"><button class="btn btn-outline" data-action="close-modal">Tutup</button>' +
      '<button class="btn btn-primary" data-action="edit-product" data-id="' + e(product.id) + '">' + icon('pencil') + 'Edit Produk</button></div>',
      'lg'
    );
  }

  function openProductForm(id) {
    var product = id ? S.getProduct(id) : null;
    if (id && !product) { toast('Produk tidak ditemukan', '', 'error'); return; }
    var categories = S.getCategories();
    if (!categories.length) {
      toast('Kategori belum ada', 'Buat kategori terlebih dahulu sebelum menambah produk.', 'error');
      setView('kategori');
      return;
    }

    state.productImage = product ? product.image : '';
    var categoryOptions = categories.map(function (cat) {
      return '<option value="' + e(cat.id) + '"' + (product && product.categoryId === cat.id ? ' selected' : '') + '>' + e(cat.name) + '</option>';
    }).join('');

    var roastOptions = ['Light', 'Medium Light', 'Medium', 'Medium Dark', 'Dark'].map(function (roast) {
      return '<option value="' + roast + '"' + (product && product.roast === roast ? ' selected' : '') + '>' + roast + '</option>';
    }).join('');

    var html = modalHead(product ? 'Edit Produk' : 'Tambah Produk Baru', product ? product.id : 'Isi data produk kopi dengan lengkap') +
      '<form id="productForm" novalidate data-id="' + (product ? e(product.id) : '') + '">' +
      '<div class="modal-body"><div class="form-grid">' +
      field('name', 'Nama produk', '<input name="name" type="text" value="' + e(product ? product.name : '') + '" placeholder="Contoh: Arabica Gayo Premium" />', true, 'Nama produk minimal 3 karakter.') +
      field('categoryId', 'Kategori', '<select name="categoryId">' + categoryOptions + '</select>', true, 'Pilih kategori produk.') +
      field('price', 'Harga (Rp)', '<input name="price" type="number" min="1" step="500" value="' + (product ? product.price : '') + '" placeholder="95000" />', true, 'Harga harus berupa angka lebih dari 0.') +
      field('weight', 'Berat / ukuran kemasan', '<input name="weight" type="text" value="' + e(product ? product.weight : '') + '" placeholder="250 g" />', true, 'Berat atau ukuran wajib diisi.') +
      field('stock', 'Stok', '<input name="stock" type="number" min="0" step="1" value="' + (product ? product.stock : 0) + '" />', true, 'Stok harus bilangan bulat 0 atau lebih.') +
      field('origin', 'Asal kopi', '<input name="origin" type="text" value="' + e(product ? product.origin : '') + '" placeholder="Aceh Tengah" />', true, 'Asal kopi wajib diisi.') +
      field('process', 'Metode pengolahan', '<input name="process" type="text" value="' + e(product ? product.process : '') + '" placeholder="Full Washed" />', true, 'Metode pengolahan wajib diisi.') +
      field('roast', 'Tingkat roasting', '<select name="roast">' + roastOptions + '</select>', true, 'Tingkat roasting wajib dipilih.') +
      field('flavor', 'Deskripsi rasa', '<input name="flavor" type="text" value="' + e(product ? product.flavor : '') + '" placeholder="Cokelat, jeruk manis, floral" />', true, 'Deskripsi rasa minimal 3 karakter.') +
      field('active', 'Status produk', '<select name="active"><option value="true"' + (!product || product.active !== false ? ' selected' : '') + '>Aktif (tampil di katalog)</option>' +
        '<option value="false"' + (product && product.active === false ? ' selected' : '') + '>Nonaktif (disembunyikan)</option></select>', false) +
      field('description', 'Deskripsi produk', '<textarea name="description" rows="3" placeholder="Ceritakan karakter kopi ini…">' + e(product ? product.description : '') + '</textarea>', false, '', 'full') +
      '<div class="form-field full" data-field="image"><label>Gambar produk</label>' +
      '<div class="image-picker">' +
      '<div class="image-preview" id="productImagePreview">' + (state.productImage ? '<img src="' + e(state.productImage) + '" alt="Pratinjau" />' : icon('image')) + '</div>' +
      '<div class="image-picker-fields">' +
      '<input type="text" name="imageUrl" id="productImageUrl" placeholder="URL gambar (https://… atau assets/…)" value="' + e(product ? product.image : '') + '" />' +
      '<label class="file-btn">' + icon('upload') + 'Unggah dari perangkat<input type="file" accept="image/*" id="productImageFile" /></label>' +
      '<span class="form-hint">Unggah gambar akan diperkecil otomatis (maks. 640 px) agar penyimpanan browser tetap ringan.</span>' +
      '</div></div></div>' +
      '</div></div>' +
      '<div class="modal-foot"><button type="button" class="btn btn-outline" data-action="close-modal">Batal</button>' +
      '<button type="submit" class="btn btn-primary">' + icon('check') + (product ? 'Simpan Perubahan' : 'Tambah Produk') + '</button></div>' +
      '</form>';
    openModal(html, 'lg');
  }

  function field(name, label, control, required, errorText, full) {
    return '<div class="form-field ' + (full || '') + '" data-field="' + name + '">' +
      '<label for="' + name + '">' + e(label) + (required ? ' <span class="req">*</span>' : '') + '</label>' +
      control +
      '<span class="form-error">' + e(errorText || 'Wajib diisi.') + '</span></div>';
  }

  function markInvalid(container, fieldName, message) {
    var wrap = container.querySelector('[data-field="' + fieldName + '"]');
    if (!wrap) return;
    wrap.classList.add('invalid');
    var err = wrap.querySelector('.form-error');
    if (err && message) err.textContent = message;
  }

  function clearMarks(container) {
    $$('.form-field.invalid', container).forEach(function (wrap) { wrap.classList.remove('invalid'); });
  }

  function saveProductForm(form) {
    clearMarks(form);
    var editingId = form.getAttribute('data-id');
    var data = {
      name: form.elements.name.value.trim(),
      categoryId: form.elements.categoryId.value,
      price: Number(form.elements.price.value),
      weight: form.elements.weight.value.trim(),
      stock: Number(form.elements.stock.value),
      origin: form.elements.origin.value.trim(),
      process: form.elements.process.value.trim(),
      roast: form.elements.roast.value,
      flavor: form.elements.flavor.value.trim(),
      description: form.elements.description.value.trim(),
      image: state.productImage || form.elements.imageUrl.value.trim() || 'assets/product-arabica-premium.svg',
      active: form.elements.active.value === 'true'
    };

    var errors = 0;
    if (data.name.length < 3) { markInvalid(form, 'name', 'Nama produk minimal 3 karakter.'); errors++; }
    if (!data.categoryId) { markInvalid(form, 'categoryId', 'Pilih kategori produk.'); errors++; }
    if (!data.price || data.price <= 0 || isNaN(data.price)) { markInvalid(form, 'price', 'Harga harus berupa angka lebih dari 0.'); errors++; }
    if (!data.weight) { markInvalid(form, 'weight', 'Berat atau ukuran wajib diisi.'); errors++; }
    if (isNaN(data.stock) || data.stock < 0 || Math.floor(data.stock) !== data.stock) { markInvalid(form, 'stock', 'Stok harus bilangan bulat 0 atau lebih.'); errors++; }
    if (!data.origin) { markInvalid(form, 'origin', 'Asal kopi wajib diisi.'); errors++; }
    if (!data.process) { markInvalid(form, 'process', 'Metode pengolahan wajib diisi.'); errors++; }
    if (!data.roast) { markInvalid(form, 'roast', 'Tingkat roasting wajib dipilih.'); errors++; }
    if (data.flavor.length < 3) { markInvalid(form, 'flavor', 'Deskripsi rasa minimal 3 karakter.'); errors++; }
    if (!data.image) { markInvalid(form, 'image', 'Gambar produk wajib diisi.'); errors++; }

    if (errors) {
      toast('Data produk belum lengkap', errors + ' kolom perlu diperbaiki.', 'error');
      var firstInvalid = form.querySelector('.form-field.invalid input, .form-field.invalid select, .form-field.invalid textarea');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    try {
      if (editingId) {
        S.updateProduct(editingId, data);
        toast('Produk diperbarui', data.name + ' tersimpan dan katalog sudah mengikuti perubahan.', 'success');
      } else {
        var created = S.addProduct(data);
        toast('Produk ditambahkan', created.name + ' sekarang tampil di katalog.', 'success');
      }
    } catch (err) {
      toast('Gagal menyimpan produk', err.message || 'Penyimpanan browser penuh.', 'error');
      return;
    }
    closeModal();
    if (state.view === 'produk') setView('produk');
    else setView(state.view);
  }

  function toggleProductActive(id) {
    var product = S.getProduct(id);
    if (!product) return;
    S.updateProduct(id, { active: product.active === false });
    toast(product.active === false ? 'Produk diaktifkan' : 'Produk dinonaktifkan',
      product.name + ' ' + (product.active === false ? 'kembali tampil di katalog.' : 'disembunyikan dari katalog.'), 'success');
    refreshProductTable();
  }

  function confirmDeleteProduct(id) {
    var product = S.getProduct(id);
    if (!product) return;
    confirmDialog({
      title: 'Hapus produk ini?',
      message: 'Produk <strong>' + e(product.name) + '</strong> akan dihapus permanen dari dashboard dan katalog pelanggan. Tindakan ini tidak dapat dibatalkan.',
      confirmText: 'Hapus Produk',
      onConfirm: function () {
        S.deleteProduct(id);
        toast('Produk dihapus', product.name + ' tidak lagi tampil di katalog.', 'info');
        if (state.view === 'produk') setView('produk');
        else setView(state.view);
      }
    });
  }

  /* ==================== KATEGORI ==================== */
  function renderCategoriesView() {
    var categories = S.getCategories();
    var products = S.getProducts();
    var cards = categories.map(function (cat) {
      var count = products.filter(function (p) { return p.categoryId === cat.id; }).length;
      return '<div class="category-card">' +
        '<div class="cat-top"><span class="stat-icon">' + icon('tag') + '</span>' +
        '<div><h4>' + e(cat.name) + '</h4><span class="cat-count"><strong>' + count + '</strong> produk</span></div></div>' +
        '<p>' + e(cat.description || 'Tanpa deskripsi.') + '</p>' +
        '<div class="cat-foot"><span class="cat-count">' + (count ? 'Dipakai di filter katalog' : 'Belum dipakai') + '</span>' +
        '<div class="cat-actions">' +
        '<button class="btn-icon" data-action="edit-category" data-id="' + e(cat.id) + '" title="Edit kategori" aria-label="Edit kategori">' + icon('pencil') + '</button>' +
        '<button class="btn-icon danger" data-action="delete-category" data-id="' + e(cat.id) + '" title="Hapus kategori" aria-label="Hapus kategori">' + icon('trash') + '</button>' +
        '</div></div></div>';
    }).join('');

    return '<div class="toolbar"><div><strong style="font-size:13px">' + categories.length + ' kategori</strong>' +
      '<div class="cell-muted">Kategori otomatis muncul sebagai filter di katalog pelanggan.</div></div>' +
      '<div class="spacer"></div><button class="btn btn-primary" data-action="open-category-form">' + icon('plus') + 'Tambah Kategori</button></div>' +
      '<div class="panel"><div class="panel-head"><div><h3>Daftar Kategori</h3><p>Setiap produk harus memiliki satu kategori</p></div></div>' +
      '<div class="panel-body">' +
      (categories.length
        ? '<div class="category-grid">' + cards + '</div>'
        : emptyState('Belum ada kategori', 'Buat kategori seperti Biji Kopi, Kopi Bubuk, atau Kopi Specialty.', 'Tambah Kategori', 'open-category-form')) +
      '</div></div>';
  }

  function openCategoryForm(id) {
    var category = id ? S.getCategory(id) : null;
    if (id && !category) { toast('Kategori tidak ditemukan', '', 'error'); return; }
    openModal(
      modalHead(category ? 'Edit Kategori' : 'Tambah Kategori', category ? category.id : 'Kategori baru untuk filter katalog') +
      '<form id="categoryForm" novalidate data-id="' + (category ? e(category.id) : '') + '">' +
      '<div class="modal-body"><div class="form-grid">' +
      field('name', 'Nama kategori', '<input name="name" type="text" value="' + e(category ? category.name : '') + '" placeholder="Contoh: Kopi Specialty" />', true, 'Nama kategori minimal 2 karakter.') +
      field('description', 'Deskripsi singkat', '<textarea name="description" rows="3" placeholder="Penjelasan singkat kategori…">' + e(category ? category.description : '') + '</textarea>', false, '', 'full') +
      '</div></div>' +
      '<div class="modal-foot"><button type="button" class="btn btn-outline" data-action="close-modal">Batal</button>' +
      '<button type="submit" class="btn btn-primary">' + icon('check') + (category ? 'Simpan Perubahan' : 'Tambah Kategori') + '</button></div>' +
      '</form>',
      'sm'
    );
  }

  function saveCategoryForm(form) {
    clearMarks(form);
    var id = form.getAttribute('data-id');
    var name = form.elements.name.value.trim();
    var description = form.elements.description.value.trim();
    if (name.length < 2) {
      markInvalid(form, 'name', 'Nama kategori minimal 2 karakter.');
      toast('Nama kategori belum valid', 'Minimal 2 karakter.', 'error');
      return;
    }
    var duplicate = S.getCategories().some(function (cat) {
      return cat.name.toLowerCase() === name.toLowerCase() && cat.id !== id;
    });
    if (duplicate) {
      markInvalid(form, 'name', 'Nama kategori sudah digunakan.');
      toast('Kategori sudah ada', 'Gunakan nama lain.', 'error');
      return;
    }
    if (id) {
      S.updateCategory(id, { name: name, description: description });
      toast('Kategori diperbarui', name + ' tersimpan.', 'success');
    } else {
      S.addCategory({ name: name, description: description });
      toast('Kategori ditambahkan', name + ' kini muncul di filter katalog.', 'success');
    }
    closeModal();
    setView('kategori');
  }

  function confirmDeleteCategory(id) {
    var category = S.getCategory(id);
    if (!category) return;
    var used = S.getProducts().filter(function (p) { return p.categoryId === id; }).length;
    if (used > 0) {
      toast('Kategori masih digunakan', 'Ada ' + used + ' produk di kategori ini. Pindahkan produk terlebih dahulu.', 'error');
      return;
    }
    confirmDialog({
      title: 'Hapus kategori?',
      message: 'Kategori <strong>' + e(category.name) + '</strong> akan dihapus. Kategori ini tidak memiliki produk.',
      confirmText: 'Hapus Kategori',
      onConfirm: function () {
        S.deleteCategory(id);
        toast('Kategori dihapus', category.name + ' dihapus dari filter katalog.', 'info');
        setView('kategori');
      }
    });
  }

  /* ==================== STOK ==================== */
  function renderStockView() {
    var products = S.getProducts();
    var safe = products.filter(function (p) { return p.stock > 10; }).length;
    var low = products.filter(function (p) { return p.stock > 0 && p.stock <= 10; }).length;
    var out = products.filter(function (p) { return p.stock <= 0; }).length;

    var chips = [
      { id: 'all', label: 'Semua', count: products.length },
      { id: 'safe', label: 'Aman (&gt;10)', count: safe },
      { id: 'low', label: 'Menipis (1–10)', count: low },
      { id: 'out', label: 'Habis', count: out }
    ].map(function (chip) {
      return '<button class="chip-btn ' + (state.stockFilter === chip.id ? 'active' : '') + '" data-action="stock-filter" data-filter="' + chip.id + '">' +
        chip.label + '<span class="count">' + chip.count + '</span></button>';
    }).join('');

    var html = '<div class="chip-row">' + chips + '</div>';
    if (low || out) {
      html += '<div class="notice">' + icon('alert') + '<div><strong>' + low + ' stok menipis</strong> dan <strong>' + out +
        ' produk habis</strong>. Produk dengan stok 0 otomatis tidak dapat ditambahkan ke keranjang pelanggan.</div></div>';
    }
    html += '<div class="panel"><div class="panel-head"><div><h3>Manajemen Stok</h3><p>Perubahan langsung memperbarui katalog pelanggan</p></div>' +
      '<div class="panel-actions"><span class="badge badge-success">' + safe + ' aman</span><span class="badge badge-warning">' + low + ' menipis</span>' +
      '<span class="badge badge-danger">' + out + ' habis</span></div></div>' +
      '<div class="panel-body flush" id="stockTableWrap">' + stockTableHtml() + '</div></div>';
    return html;
  }

  function stockTableHtml() {
    var products = S.getProducts();
    var list = products.filter(function (product) {
      if (state.stockFilter === 'safe') return product.stock > 10;
      if (state.stockFilter === 'low') return product.stock > 0 && product.stock <= 10;
      if (state.stockFilter === 'out') return product.stock <= 0;
      return true;
    }).sort(function (a, b) { return a.stock - b.stock; });

    if (!products.length) {
      return emptyState('Belum ada produk', 'Tambahkan produk terlebih dahulu untuk mengelola stok.', 'Tambah Produk', 'open-product-form');
    }
    if (!list.length) {
      return '<div class="empty"><div class="empty-icon">' + icon('layers') + '</div><h3>Tidak ada produk di filter ini</h3>' +
        '<p>Semua produk berada pada status stok yang berbeda.</p>' +
        '<button class="btn btn-outline btn-sm" data-action="stock-filter" data-filter="all">Tampilkan semua</button></div>';
    }

    var rows = list.map(function (product) {
      return '<tr>' +
        '<td><div class="product-cell"><img src="' + e(product.image) + '" alt="' + e(product.name) + '" />' +
        '<div><div class="name">' + e(product.name) + '</div><div class="id">' + e(product.id) + ' · ' + e(product.weight) + '</div></div></div></td>' +
        '<td>' + stockBadge(product.stock) + '</td>' +
        '<td><div class="stock-control">' +
        '<button type="button" data-action="stock-minus" data-id="' + e(product.id) + '" aria-label="Kurangi stok">' + icon('minus') + '</button>' +
        '<input type="number" min="0" step="1" value="' + product.stock + '" data-stock-input="' + e(product.id) + '" aria-label="Stok ' + e(product.name) + '" />' +
        '<button type="button" data-action="stock-plus" data-id="' + e(product.id) + '" aria-label="Tambah stok">' + icon('plus') + '</button>' +
        '</div></td>' +
        '<td style="text-align:right"><button class="btn btn-sm btn-primary" data-action="stock-save" data-id="' + e(product.id) + '">Simpan</button></td>' +
        '</tr>';
    }).join('');

    return '<div class="table-wrap"><table class="data-table"><thead><tr>' +
      '<th>Produk</th><th>Status</th><th>Jumlah stok</th><th style="text-align:right">Perbarui</th>' +
      '</tr></thead><tbody>' + rows + '</tbody></table></div>' +
      '<div style="padding:12px 16px;border-top:1px solid #F3EADF"><small class="cell-muted">Stok tidak dapat bernilai negatif. Nilai 0 membuat produk berstatus habis.</small></div>';
  }

  function refreshStock() {
    if (state.view === 'stok') $('#view').innerHTML = renderStockView();
    updatePendingBadge();
  }

  function adjustStock(id, delta) {
    var product = S.getProduct(id);
    if (!product) return;
    var next = Math.max(0, product.stock + delta);
    if (next === product.stock) {
      toast('Stok tidak berubah', 'Stok sudah berada di batas minimum 0.', 'info');
      return;
    }
    S.updateProduct(id, { stock: next });
    toast('Stok diperbarui', product.name + ' → ' + next + ' unit.', 'success');
    refreshStock();
  }

  function saveStockInput(id) {
    var input = document.querySelector('[data-stock-input="' + id + '"]');
    var product = S.getProduct(id);
    if (!product || !input) return;
    var value = Number(input.value);
    if (isNaN(value) || value < 0 || Math.floor(value) !== value) {
      toast('Nilai stok tidak valid', 'Masukkan bilangan bulat 0 atau lebih.', 'error');
      input.value = product.stock;
      input.focus();
      return;
    }
    if (value === product.stock) {
      toast('Tidak ada perubahan', 'Stok ' + product.name + ' tetap ' + value + '.', 'info');
      return;
    }
    S.updateProduct(id, { stock: value });
    toast('Stok disimpan', product.name + ' → ' + value + ' unit.', 'success');
    refreshStock();
  }

  /* ==================== PESANAN ==================== */
  function renderOrdersView() {
    var orders = S.getOrders();
    var counts = { all: orders.length };
    S.statusList.forEach(function (status) {
      counts[status] = orders.filter(function (o) { return o.status === status; }).length;
    });

    var chips = '<button class="chip-btn ' + (state.orderFilter === 'all' ? 'active' : '') + '" data-action="order-filter" data-status="all">Semua<span class="count">' + counts.all + '</span></button>' +
      S.statusList.map(function (status) {
        return '<button class="chip-btn ' + (state.orderFilter === status ? 'active' : '') + '" data-action="order-filter" data-status="' + status + '">' +
          e(S.statusLabel(status)) + '<span class="count">' + counts[status] + '</span></button>';
      }).join('');

    var html = '<div class="notice info">' + icon('info') +
      '<div><strong>Checkout via WhatsApp.</strong> Pesanan tercatat otomatis ketika pelanggan menekan tombol “Pesan via WhatsApp” di keranjang dengan nama dan nomor yang valid. ' +
      'Data ini tersimpan di <strong>localStorage browser ini</strong> sebagai demonstrasi — belum tersinkron ke backend atau perangkat lain. Status awal setiap pesanan adalah menunggu konfirmasi.</div></div>';
    html += '<div class="chip-row">' + chips + '</div>';
    html += '<div id="orderTableWrap">' + orderTableHtml() + '</div>';
    return html;
  }

  function orderTableHtml() {
    var orders = S.getOrders();
    var list = orders.filter(function (order) {
      return state.orderFilter === 'all' || order.status === state.orderFilter;
    });

    var head = '<div class="panel"><div class="panel-head"><div><h3>Daftar Pesanan</h3><p>' + list.length + ' pesanan ditampilkan</p></div>' +
      '<div class="panel-actions"><span class="badge badge-warning">' + orders.filter(function (o) { return o.status === 'menunggu'; }).length + ' menunggu</span>' +
      '<span class="badge badge-success">' + orders.filter(function (o) { return o.status === 'selesai'; }).length + ' selesai</span></div></div>';

    if (!orders.length) {
      return head + '<div class="empty small"><div class="empty-icon">' + icon('cart') + '</div><h3>Belum ada pesanan tercatat</h3>' +
        '<p>Buka halaman pelanggan, masukkan produk ke keranjang, lalu isi nama dan nomor WhatsApp pada checkout. Pesanan akan muncul di sini sebagai demonstrasi. ' +
        'Angka penjualan tetap nol sampai pesanan ditandai selesai.</p>' +
        '<a class="btn btn-outline btn-sm" href="index.html" target="_blank" rel="noopener">Buka halaman pelanggan' + icon('arrow') + '</a></div></div>';
    }
    if (!list.length) {
      return head + '<div class="empty small"><div class="empty-icon">' + icon('search') + '</div><h3>Tidak ada pesanan dengan status ini</h3>' +
        '<p>Pilih status lain untuk melihat pesanan.</p>' +
        '<button class="btn btn-outline btn-sm" data-action="order-filter" data-status="all">Lihat semua pesanan</button></div></div>';
    }

    var rows = list.map(function (order) {
      var names = (order.items || []).map(function (item) { return e(item.name) + ' ×' + item.qty; }).join(', ');
      var statusOptions = S.statusList.map(function (status) {
        return '<option value="' + status + '"' + (order.status === status ? ' selected' : '') + '>' + e(S.statusLabel(status)) + '</option>';
      }).join('');
      return '<tr>' +
        '<td><div class="cell-strong">' + e(order.id) + '</div><div class="cell-muted">' + e(S.formatDate(order.createdAt, true)) + '</div></td>' +
        '<td><div class="cell-strong">' + e(order.customer && order.customer.name) + '</div><div class="cell-muted">' + e(order.customer && order.customer.phone) + '</div></td>' +
        '<td style="max-width:230px"><div class="cell-muted" style="line-height:1.5">' + names + '</div>' +
        '<div class="cell-muted">' + (order.itemCount || 0) + ' item</div></td>' +
        '<td class="price-now">' + S.formatRupiah(order.total) + '</td>' +
        '<td><select class="status-select order-status-inline" data-id="' + e(order.id) + '" aria-label="Status pesanan ' + e(order.id) + '">' + statusOptions + '</select></td>' +
        '<td style="text-align:right"><button class="btn btn-sm btn-outline" data-action="view-order" data-id="' + e(order.id) + '">' + icon('eye') + 'Detail</button></td>' +
        '</tr>';
    }).join('');

    return head + '<div class="panel-body flush"><div class="table-wrap"><table class="data-table"><thead><tr>' +
      '<th>ID / Tanggal</th><th>Pelanggan</th><th>Produk</th><th>Total</th><th>Status</th><th style="text-align:right">Aksi</th>' +
      '</tr></thead><tbody>' + rows + '</tbody></table></div></div></div>';
  }

  function openOrderDetail(id) {
    var order = S.getOrders().filter(function (o) { return o.id === id; })[0];
    if (!order) { toast('Pesanan tidak ditemukan', '', 'error'); return; }
    var settings = S.getSettings();
    var items = order.items || [];
    var itemRows = items.map(function (item) {
      return '<tr><td>' + e(item.name) + '<div class="cell-muted">' + e(item.weight) + '</div></td>' +
        '<td>' + item.qty + '</td><td>' + S.formatRupiah(item.price) + '</td><td>' + S.formatRupiah(item.price * item.qty) + '</td></tr>';
    }).join('');
    var statusOptions = S.statusList.map(function (status) {
      return '<option value="' + status + '"' + (order.status === status ? ' selected' : '') + '>' + e(S.statusLabel(status)) + '</option>';
    }).join('');
    var waMessage = encodeURIComponent('Halo ' + (order.customer ? order.customer.name : '') + ', kami dari ' + settings.storeName +
      ' ingin mengonfirmasi pesanan ' + order.id + ' sebesar ' + S.formatRupiah(order.total) + '.');

    openModal(
      modalHead('Detail Pesanan', order.id) +
      '<div class="modal-body">' +
      '<div class="detail-list" style="margin-bottom:16px">' +
      '<div><span>Pelanggan</span><strong>' + e(order.customer && order.customer.name) + '</strong></div>' +
      '<div><span>Nomor WhatsApp</span><strong>' + e(order.customer && order.customer.phone) + '</strong></div>' +
      '<div><span>Tanggal pesanan</span><strong>' + e(S.formatDate(order.createdAt, true)) + '</strong></div>' +
      '<div><span>Status saat ini</span><strong>' + e(S.statusLabel(order.status)) + '</strong></div>' +
      (order.customer && order.customer.note ? '<div class="full" style="grid-column:1/-1"><span>Alamat / catatan</span><strong>' + e(order.customer.note) + '</strong></div>' : '') +
      '</div>' +
      '<table class="order-items-table"><thead><tr><th>Produk</th><th>Qty</th><th>Harga</th><th>Subtotal</th></tr></thead>' +
      '<tbody>' + itemRows + '</tbody></table>' +
      '<div class="order-total"><span>' + (order.itemCount || 0) + ' item · total</span><strong style="font-family:var(--font-head);font-size:20px">' + S.formatRupiah(order.total) + '</strong></div>' +
      '<div class="form-field" style="margin-top:16px"><label for="modalOrderStatus">Perbarui status pesanan</label>' +
      '<select id="modalOrderStatus">' + statusOptions + '</select></div>' +
      '</div>' +
      '<div class="modal-foot">' +
      '<a class="btn btn-outline" href="https://wa.me/' + e(S.normalizePhone(order.customer && order.customer.phone)) + '?text=' + waMessage + '" target="_blank" rel="noopener">' + icon('chat') + 'Chat pelanggan</a>' +
      '<button class="btn btn-outline" data-action="close-modal">Tutup</button>' +
      '<button class="btn btn-primary" data-action="save-order-status" data-id="' + e(order.id) + '">' + icon('check') + 'Simpan Status</button>' +
      '</div>'
    );
  }

  function saveOrderStatusFromModal(id) {
    var select = $('#modalOrderStatus');
    if (!select) return;
    var order = S.updateOrderStatus(id, select.value);
    if (!order) { toast('Status gagal diperbarui', '', 'error'); return; }
    closeModal();
    toast('Status diperbarui', order.id + ' → ' + S.statusLabel(order.status), 'success');
    updatePendingBadge();
    setView('pesanan');
  }

  /* ==================== LAPORAN ==================== */
  function getReportData(period) {
    var completed = S.getOrders().filter(function (o) { return o.status === 'selesai'; });
    var start = periodStart(period);
    var orders = completed.filter(function (order) {
      var date = new Date(order.createdAt);
      return !isNaN(date.getTime()) && date >= start;
    });
    var total = orders.reduce(function (sum, o) { return sum + (Number(o.total) || 0); }, 0);
    var ranked = productSales(orders);
    return {
      orders: orders,
      total: total,
      count: orders.length,
      average: orders.length ? Math.round(total / orders.length) : 0,
      top: ranked[0] || null,
      excluded: S.getOrders().filter(function (o) { return o.status !== 'selesai'; }).length
    };
  }

  function periodStart(period) {
    var now = new Date();
    if (period === 'hari') return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (period === 'minggu') {
      var day = (now.getDay() + 6) % 7;
      var monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day);
      return monday;
    }
    if (period === 'bulan') return new Date(now.getFullYear(), now.getMonth(), 1);
    return new Date(now.getFullYear(), 0, 1);
  }

  function reportSeries(period, orders) {
    var now = new Date();
    var series = [];
    if (period === 'hari') {
      for (var h = 0; h < 24; h += 3) {
        series.push({ label: (h < 10 ? '0' : '') + h, full: 'Pukul ' + h + ':00–' + (h + 3) + ':00', value: 0, hours: [h, h + 1, h + 2] });
      }
      orders.forEach(function (order) {
        var date = new Date(order.createdAt);
        if (date.toDateString() !== now.toDateString()) return;
        var index = Math.floor(date.getHours() / 3);
        if (series[index]) series[index].value += Number(order.total) || 0;
      });
    } else if (period === 'minggu') {
      var start = periodStart('minggu');
      for (var i = 0; i < 7; i++) {
        var day = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
        series.push({
          label: day.toLocaleDateString('id-ID', { weekday: 'short' }),
          full: day.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' }),
          value: 0,
          key: day.toDateString()
        });
      }
      orders.forEach(function (order) {
        var date = new Date(order.createdAt);
        series.forEach(function (bucket) {
          if (bucket.key === date.toDateString()) bucket.value += Number(order.total) || 0;
        });
      });
    } else if (period === 'bulan') {
      var daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      for (var d = 1; d <= daysInMonth; d++) {
        series.push({ label: String(d), full: d + ' ' + now.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }), value: 0, day: d });
      }
      orders.forEach(function (order) {
        var date = new Date(order.createdAt);
        if (date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) {
          var bucket = series[date.getDate() - 1];
          if (bucket) bucket.value += Number(order.total) || 0;
        }
      });
    } else {
      for (var m = 0; m < 12; m++) {
        var monthDate = new Date(now.getFullYear(), m, 1);
        series.push({
          label: monthDate.toLocaleDateString('id-ID', { month: 'short' }),
          full: monthDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }),
          value: 0,
          month: m
        });
      }
      orders.forEach(function (order) {
        var date = new Date(order.createdAt);
        if (date.getFullYear() === now.getFullYear()) {
          var bucket = series[date.getMonth()];
          if (bucket) bucket.value += Number(order.total) || 0;
        }
      });
    }
    return series;
  }

  function renderReportsView() {
    var data = getReportData(state.reportPeriod);
    var series = reportSeries(state.reportPeriod, data.orders);
    var periods = [['hari', 'Hari ini'], ['minggu', 'Minggu ini'], ['bulan', 'Bulan ini'], ['tahun', 'Tahun ini']];

    var html = '<div class="chip-row">' + periods.map(function (item) {
      return '<button class="chip-btn ' + (state.reportPeriod === item[0] ? 'active' : '') + '" data-action="report-period" data-period="' + item[0] + '">' + item[1] + '</button>';
    }).join('') + '</div>';

    html += '<div class="cards-grid">' +
      statCard('wallet', 'green', 'Total Penjualan', S.formatRupiah(data.total), 'hanya pesanan berstatus Selesai') +
      statCard('cart', '', 'Jumlah Transaksi', S.formatNumber(data.count), 'transaksi selesai pada periode ini') +
      statCard('box', 'amber', 'Produk Paling Laku', data.top ? data.top.name : '—', data.top ? data.top.qty + ' unit terjual' : 'Belum ada data') +
      statCard('chart', 'blue', 'Rata-rata / Transaksi', S.formatRupiah(data.average), 'nilai rata-rata pesanan') +
      '</div>';

    html += '<div class="panel"><div class="panel-head"><div><h3>Grafik Penjualan</h3><p>' +
      e(state.reportPeriod === 'hari' ? 'Per 3 jam hari ini' : state.reportPeriod === 'minggu' ? 'Per hari minggu ini' : state.reportPeriod === 'bulan' ? 'Per hari bulan ini' : 'Per bulan tahun ini') +
      '</p></div><div class="panel-actions"><button class="btn btn-sm btn-primary" data-action="export-csv">' + icon('download') + 'Ekspor CSV</button></div></div>' +
      '<div class="panel-body">' + barChart(series, 'Belum ada penjualan pada periode ini', 'Hanya transaksi berstatus Selesai yang dihitung.') + '</div></div>';

    html += '<div class="panel"><div class="panel-head"><div><h3>Riwayat Transaksi</h3><p>Selesai pada periode ini</p></div>' +
      '<div class="panel-actions"><span class="badge badge-warning">' + data.excluded + ' pesanan belum selesai tidak dihitung</span></div></div>' +
      '<div class="panel-body flush">' + reportTable(data.orders) + '</div></div>';

    return html;
  }

  function reportTable(orders) {
    if (!orders.length) {
      return '<div class="empty small"><div class="empty-icon">' + icon('chart') + '</div><h3>Belum ada transaksi selesai</h3>' +
        '<p>Tandai pesanan sebagai <strong>Selesai</strong> di menu Pesanan agar masuk ke laporan penjualan.</p>' +
        '<button class="btn btn-outline btn-sm" data-action="goto" data-view="pesanan">Buka menu pesanan</button></div>';
    }
    var rows = orders.slice().sort(function (a, b) { return new Date(b.createdAt) - new Date(a.createdAt); }).map(function (order) {
      return '<tr><td class="cell-strong">' + e(order.id) + '</td>' +
        '<td>' + e(S.formatDate(order.createdAt, true)) + '</td>' +
        '<td>' + e(order.customer && order.customer.name) + '</td>' +
        '<td>' + (order.itemCount || 0) + ' item</td>' +
        '<td class="price-now">' + S.formatRupiah(order.total) + '</td>' +
        '<td>' + statusBadge(order.status) + '</td></tr>';
    }).join('');
    return '<div class="table-wrap"><table class="data-table"><thead><tr>' +
      '<th>ID Pesanan</th><th>Tanggal</th><th>Pelanggan</th><th>Jumlah</th><th>Total</th><th>Status</th>' +
      '</tr></thead><tbody>' + rows + '</tbody></table></div>';
  }

  function exportCsv() {
    var data = getReportData(state.reportPeriod);
    if (!data.orders.length) {
      toast('Tidak ada data untuk diekspor', 'Belum ada transaksi selesai pada periode ini.', 'error');
      return;
    }
    var rows = [['ID Pesanan', 'Tanggal', 'Pelanggan', 'WhatsApp', 'Produk', 'Jumlah Item', 'Total (Rp)', 'Status']];
    data.orders.forEach(function (order) {
      rows.push([
        order.id,
        S.formatDate(order.createdAt, true),
        order.customer ? order.customer.name : '',
        order.customer ? order.customer.phone : '',
        (order.items || []).map(function (item) { return item.name + ' x' + item.qty; }).join('; '),
        order.itemCount || 0,
        order.total,
        S.statusLabel(order.status)
      ]);
    });
    var csv = rows.map(function (row) {
      return row.map(function (cell) {
        return '"' + String(cell === undefined || cell === null ? '' : cell).replace(/"/g, '""') + '"';
      }).join(',');
    }).join('\r\n');

    var now = new Date();
    var stamp = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
    var blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = 'laporan-penjualan-' + state.reportPeriod + '-' + stamp + '.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
    toast('Laporan diekspor', data.orders.length + ' transaksi selesai diunduh sebagai CSV.', 'success');
  }

  /* ==================== PENGATURAN ==================== */
  function renderSettingsView() {
    var settings = S.getSettings();
    state.settingsLogo = settings.logo || '';
    return '<div class="notice">' + icon('info') +
      '<div>Perubahan di halaman ini langsung tampil pada halaman pelanggan (nama toko, WhatsApp, alamat, email, logo, dan informasi pengiriman). ' +
      'Data disimpan di <strong>localStorage browser ini</strong>.</div></div>' +
      '<div class="panel"><div class="panel-head"><div><h3>Informasi Toko</h3><p>Data yang digunakan di seluruh halaman website</p></div>' +
      '<div class="panel-actions"><a class="btn btn-sm btn-outline" href="index.html" target="_blank" rel="noopener">Lihat website' + icon('arrow') + '</a></div></div>' +
      '<form id="settingsForm" novalidate><div class="panel-body"><div class="form-grid">' +
      field('storeName', 'Nama toko', '<input name="storeName" type="text" value="' + e(settings.storeName) + '" />', true, 'Nama toko wajib diisi.') +
      field('whatsapp', 'Nomor WhatsApp', '<input name="whatsapp" type="tel" value="' + e(settings.whatsapp) + '" placeholder="6281234567890" />', true, 'Nomor WhatsApp minimal 10 digit.') +
      field('email', 'Email', '<input name="email" type="email" value="' + e(settings.email) + '" />', true, 'Email tidak valid.') +
      field('openHours', 'Jam operasional', '<input name="openHours" type="text" value="' + e(settings.openHours) + '" />', false) +
      field('tagline', 'Tagline singkat', '<input name="tagline" type="text" value="' + e(settings.tagline) + '" />', false, '', 'full') +
      field('address', 'Alamat toko', '<input name="address" type="text" value="' + e(settings.address) + '" />', true, 'Alamat wajib diisi.', 'full') +
      field('description', 'Deskripsi toko', '<textarea name="description" rows="3">' + e(settings.description) + '</textarea>', false, '', 'full') +
      field('shipping', 'Informasi pengiriman', '<textarea name="shipping" rows="2">' + e(settings.shipping) + '</textarea>', false, '', 'full') +
      '<div class="form-field full" data-field="logo"><label>Logo toko</label>' +
      '<div class="image-picker"><div class="image-preview" id="settingsLogoPreview">' +
      (settings.logo ? '<img src="' + e(settings.logo) + '" alt="Logo toko" />' : icon('image')) + '</div>' +
      '<div class="image-picker-fields">' +
      '<input type="text" name="logoUrl" id="settingsLogoUrl" placeholder="URL logo (https://… atau assets/logo.svg)" value="' + e(settings.logo) + '" />' +
      '<label class="file-btn">' + icon('upload') + 'Unggah logo<input type="file" accept="image/*" id="settingsLogoFile" /></label>' +
      '<span class="form-hint">Kosongkan untuk memakai logo bawaan.</span>' +
      '</div></div></div>' +
      '</div>' +
      '<div style="display:flex;justify-content:flex-end;gap:9px;margin-top:20px">' +
      '<button type="submit" class="btn btn-primary">' + icon('check') + 'Simpan Pengaturan</button></div>' +
      '</div></form></div>' +
      '<div class="panel"><div class="panel-head"><div><h3>Catatan Penyimpanan Data</h3><p>Penting untuk versi produksi</p></div></div>' +
      '<div class="panel-body"><p style="margin:0;font-size:12.5px;color:#5D4C3C;line-height:1.75">' +
      'Versi demo ini menyimpan produk, kategori, stok, pesanan, dan pengaturan pada <strong>localStorage</strong> — hanya di browser yang dipakai admin. ' +
      'Data tidak terlihat oleh pengunjung lain dan tidak aman untuk toko sungguhan. Untuk produksi, pindahkan penyimpanan ke backend + database (MySQL/PostgreSQL) ' +
      'dengan autentikasi password ter-hash dan session aman. Struktur data di <code>js/store.js</code> sudah dipisahkan agar mudah diganti dengan API.</p>' +
      '</div></div>';
  }

  function saveSettingsForm(form) {
    clearMarks(form);
    var data = {
      storeName: form.elements.storeName.value.trim(),
      whatsapp: S.normalizePhone(form.elements.whatsapp.value),
      email: form.elements.email.value.trim(),
      openHours: form.elements.openHours.value.trim(),
      tagline: form.elements.tagline.value.trim(),
      address: form.elements.address.value.trim(),
      description: form.elements.description.value.trim(),
      shipping: form.elements.shipping.value.trim(),
      logo: state.settingsLogo || form.elements.logoUrl.value.trim()
    };
    var errors = 0;
    if (!data.storeName) { markInvalid(form, 'storeName', 'Nama toko wajib diisi.'); errors++; }
    if (data.whatsapp.length < 10) { markInvalid(form, 'whatsapp', 'Nomor WhatsApp minimal 10 digit.'); errors++; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) { markInvalid(form, 'email', 'Format email tidak valid.'); errors++; }
    if (!data.address) { markInvalid(form, 'address', 'Alamat wajib diisi.'); errors++; }
    if (errors) {
      toast('Pengaturan belum lengkap', errors + ' kolom perlu diperbaiki.', 'error');
      return;
    }
    try {
      S.saveSettings(data);
    } catch (err) {
      toast('Gagal menyimpan pengaturan', err.message || 'Penyimpanan browser penuh.', 'error');
      return;
    }
    applyBranding();
    toast('Pengaturan tersimpan', 'Perubahan langsung berlaku di halaman pelanggan.', 'success');
    setView('pengaturan');
  }
})();
