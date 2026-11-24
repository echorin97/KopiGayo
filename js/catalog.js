/* =========================================================
   Jualan Kopi Gayo — Logika halaman pelanggan
   ========================================================= */
(function () {
  'use strict';

  var S = window.KGStore;
  if (!S) return;

  var state = {
    search: '',
    category: 'all',
    sort: 'featured',
    detailId: null,
    detailQty: 1,
    reviewRating: 5,
    reviewName: '',
    lastCartCount: 0
  };

  var el = {};
  var searchTimer = null;

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    S.seed();
    cacheElements();
    applySettings();
    bindEvents();
    renderCategories();
    renderProducts();
    renderTicker();
    renderCart();
    document.getElementById('footerYear').textContent = new Date().getFullYear();
  }

  function cacheElements() {
    el.grid = document.getElementById('productGrid');
    el.chips = document.getElementById('categoryChips');
    el.search = document.getElementById('searchInput');
    el.sort = document.getElementById('sortSelect');
    el.resultCount = document.getElementById('resultCount');
    el.activeFilter = document.getElementById('activeFilter');
    el.cartDrawer = document.getElementById('cartDrawer');
    el.overlay = document.getElementById('overlay');
    el.cartBody = document.getElementById('cartBody');
    el.cartCount = document.getElementById('cartCount');
    el.cartItemCount = document.getElementById('cartItemCount');
    el.cartSummary = document.getElementById('cartSummary');
    el.cartTotal = document.getElementById('cartTotal');
    el.cartEmptyFoot = document.getElementById('cartEmptyFoot');
    el.cartCheckout = document.getElementById('cartCheckout');
    el.nav = document.getElementById('mainNav');
    el.toastStack = document.getElementById('toastStack');
    el.productModal = document.getElementById('productModal');
    el.productModalContent = document.getElementById('productModalContent');
    el.lightbox = document.getElementById('lightbox');
    el.lightboxImage = document.getElementById('lightboxImage');
    el.lightboxCaption = document.getElementById('lightboxCaption');
    el.ticker = document.getElementById('productTicker');
  }

  /* ---------------- Pengaturan toko ---------------- */
  function applySettings() {
    var settings = S.getSettings();
    var waLink = S.normalizePhone(settings.whatsapp);

    document.title = settings.storeName + ' — Kopi Arabika Dataran Tinggi Aceh';
    document.querySelectorAll('[data-store-name]').forEach(function (node) {
      node.textContent = settings.storeName;
    });
    document.querySelectorAll('[data-logo]').forEach(function (node) {
      if (settings.logo) node.src = settings.logo;
    });
    var brandLogo = document.getElementById('brandLogo');
    if (brandLogo && settings.logo) brandLogo.src = settings.logo;

    var heroTagline = document.getElementById('heroTagline');
    if (heroTagline) heroTagline.textContent = settings.tagline;

    var footerDesc = document.getElementById('footerDescription');
    if (footerDesc) footerDesc.textContent = settings.description;

    var contactPhone = document.getElementById('contactPhone');
    if (contactPhone) contactPhone.textContent = S.formatPhoneDisplay(settings.whatsapp);
    var contactEmail = document.getElementById('contactEmail');
    if (contactEmail) contactEmail.textContent = settings.email;
    var contactAddress = document.getElementById('contactAddress');
    if (contactAddress) contactAddress.textContent = settings.address;
    var contactShipping = document.getElementById('contactShipping');
    if (contactShipping) contactShipping.textContent = settings.shipping;
    var contactHours = document.getElementById('contactHours');
    if (contactHours) contactHours.textContent = settings.openHours;

    var footerPhone = document.getElementById('footerPhone');
    if (footerPhone) footerPhone.textContent = S.formatPhoneDisplay(settings.whatsapp);
    var footerEmail = document.getElementById('footerEmail');
    if (footerEmail) footerEmail.textContent = settings.email;
    var footerAddress = document.getElementById('footerAddress');
    if (footerAddress) footerAddress.textContent = settings.address;

    var topbarLocation = document.getElementById('topbarLocation');
    if (topbarLocation) topbarLocation.textContent = settings.address.split(',').slice(-3).join(',').trim() || settings.address;
    var topbarHours = document.getElementById('topbarHours');
    if (topbarHours) topbarHours.textContent = settings.openHours;

    var shippingShort = document.getElementById('heroShippingShort');
    if (shippingShort) {
      var free = /gratis/i.test(settings.shipping);
      shippingShort.textContent = free ? 'Gratis ongkir min. Rp 250.000' : 'Pengiriman ke seluruh Indonesia';
    }

    var message = 'Halo ' + settings.storeName + ', saya ingin bertanya tentang produk kopi Gayo.';
    var waUrl = 'https://wa.me/' + waLink + '?text=' + encodeURIComponent(message);
    ['topbarWaLink', 'heroWaBtn', 'contactWaBtn', 'waFloat'].forEach(function (id) {
      var node = document.getElementById(id);
      if (node) {
        node.href = waUrl;
        if (node.tagName !== 'A') node.setAttribute('aria-label', 'Chat WhatsApp');
      }
    });
    var topbarWa = document.getElementById('topbarWaLink');
    if (topbarWa) topbarWa.textContent = S.formatPhoneDisplay(settings.whatsapp);
  }

  /* ---------------- Kategori & produk ---------------- */
  function renderCategories() {
    var categories = S.getCategories();
    var chips = [{ id: 'all', name: 'Semua Produk' }].concat(categories);
    el.chips.innerHTML = chips.map(function (cat) {
      return '<button class="chip' + (state.category === cat.id ? ' active' : '') + '" data-category="' +
        S.escapeHtml(cat.id) + '">' + S.escapeHtml(cat.name) + '</button>';
    }).join('');

    var products = S.getProducts().filter(function (p) { return p.active !== false; });
    var statProducts = document.getElementById('statProducts');
    if (statProducts) statProducts.textContent = products.length;
    var statCategories = document.getElementById('statCategories');
    if (statCategories) statCategories.textContent = categories.length;
  }

  function filteredProducts() {
    var products = S.getProducts().filter(function (p) { return p.active !== false; });
    if (state.category !== 'all') {
      products = products.filter(function (p) { return p.categoryId === state.category; });
    }
    if (state.search) {
      var term = state.search.toLowerCase();
      products = products.filter(function (p) {
        return [p.name, p.flavor, p.origin, p.process, p.roast].join(' ').toLowerCase().indexOf(term) >= 0;
      });
    }
    if (state.sort === 'price-asc') products.sort(function (a, b) { return a.price - b.price; });
    else if (state.sort === 'price-desc') products.sort(function (a, b) { return b.price - a.price; });
    else if (state.sort === 'name') products.sort(function (a, b) { return a.name.localeCompare(b.name, 'id'); });
    return products;
  }

  function stockBadge(product) {
    if (product.stock <= 0) return '<span class="badge badge-stock out">Stok habis</span>';
    if (product.stock <= 10) return '<span class="badge badge-stock low">Sisa ' + product.stock + '</span>';
    return '<span class="badge badge-stock">Tersedia</span>';
  }

  function renderProducts() {
    var products = filteredProducts();
    var totalActive = S.getProducts().filter(function (p) { return p.active !== false; }).length;

    el.resultCount.textContent = 'Menampilkan ' + products.length + ' dari ' + totalActive + ' produk';
    if (state.search || state.category !== 'all') {
      var label = state.category === 'all' ? 'Semua kategori' : S.categoryName(state.category);
      el.activeFilter.textContent = 'Filter: ' + label + (state.search ? ' · "' + state.search + '"' : '');
    } else {
      el.activeFilter.textContent = '';
    }

    if (!products.length) {
      el.grid.innerHTML = '<div class="empty-state">' +
        '<span class="ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg></span>' +
        '<h3>Tidak ada produk yang cocok</h3>' +
        '<p>Coba kata kunci lain atau lihat seluruh kategori.</p>' +
        '<button class="btn btn-outline" data-action="reset-filter">Reset filter</button>' +
        '</div>';
      return;
    }

    el.grid.innerHTML = products.map(function (product) {
      var categoryName = S.categoryName(product.categoryId);
      var soldOut = product.stock <= 0;
      return '<article class="product-card">' +
        '<button class="product-thumb" data-action="detail" data-id="' + S.escapeHtml(product.id) + '" aria-label="Lihat detail ' + S.escapeHtml(product.name) + '">' +
          '<img src="' + S.escapeHtml(product.image) + '" alt="' + S.escapeHtml(product.name) + '" loading="lazy" />' +
          '<span class="badge badge-cat">' + S.escapeHtml(categoryName) + '</span>' +
          stockBadge(product) +
        '</button>' +
        '<div class="product-body">' +
          '<h3 class="product-name">' + S.escapeHtml(product.name) + '</h3>' +
          ratingMarkup(product.id) +
          '<div class="product-meta"><span>' + S.escapeHtml(product.origin) + '</span><span>·</span><span>' + S.escapeHtml(product.weight) + '</span></div>' +
          '<p class="product-flavor">' + S.escapeHtml(product.flavor) + '</p>' +
          '<div class="product-foot">' +
            '<div class="product-price">' + S.formatRupiah(product.price) + '<small>per ' + S.escapeHtml(product.weight) + '</small></div>' +
            '<button class="add-btn" data-action="add" data-id="' + S.escapeHtml(product.id) + '" ' + (soldOut ? 'disabled' : '') +
              ' aria-label="Tambah ' + S.escapeHtml(product.name) + ' ke keranjang" title="' + (soldOut ? 'Stok habis' : 'Tambah ke keranjang') + '">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>' +
            '</button>' +
          '</div>' +
        '</div>' +
      '</article>';
    }).join('');
  }

  /* ---------------- Detail produk ---------------- */
  function openDetail(id) {
    var product = S.getProduct(id);
    if (!product) return;
    state.detailId = id;
    state.detailQty = product.stock > 0 ? 1 : 0;

    var specs = [
      ['Kategori', S.categoryName(product.categoryId)],
      ['Berat / ukuran', product.weight],
      ['Asal kopi', product.origin],
      ['Metode pengolahan', product.process],
      ['Tingkat roasting', product.roast],
      ['Stok tersedia', product.stock > 0 ? product.stock + ' unit' : 'Habis']
    ];

    el.productModalContent.innerHTML = '<div class="detail-grid">' +
      '<div class="detail-media" data-action="zoom-image" title="Klik untuk zoom" role="button" tabindex="0" aria-label="Perbesar gambar produk">' +
        '<img src="' + S.escapeHtml(product.image) + '" alt="' + S.escapeHtml(product.name) + '" />' +
        '<span class="zoom-hint"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5M11 8v6M8 11h6"/></svg> Klik gambar untuk zoom</span>' +
      '</div>' +
      '<div class="detail-body">' +
        '<span class="badge badge-cat" style="position:static;background:#EFE4D2">' + S.escapeHtml(S.categoryName(product.categoryId)) + '</span>' +
        '<h2 style="margin-top:12px">' + S.escapeHtml(product.name) + '</h2>' +
        '<p class="detail-price">' + S.formatRupiah(product.price) + ' <span style="font-family:Inter,sans-serif;font-size:12px;color:#7C6A5A">/ ' + S.escapeHtml(product.weight) + '</span></p>' +
        '<p class="detail-desc">' + S.escapeHtml(product.description || product.flavor) + '</p>' +
        '<div class="detail-specs">' + specs.map(function (row) {
          return '<div><span>' + S.escapeHtml(row[0]) + '</span><strong>' + S.escapeHtml(row[1]) + '</strong></div>';
        }).join('') + '</div>' +
        (product.stock > 0
          ? '<div class="detail-actions">' +
              '<div class="qty-control">' +
                '<button type="button" data-action="detail-minus" aria-label="Kurangi jumlah"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12h14"/></svg></button>' +
                '<span id="detailQty">1</span>' +
                '<button type="button" data-action="detail-plus" aria-label="Tambah jumlah"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg></button>' +
              '</div>' +
              '<button class="btn btn-primary" data-action="detail-add">Tambah ke keranjang</button>' +
            '</div>'
          : '<p style="color:#B4372E;font-weight:600;margin:0">Stok habis — produk belum dapat dipesan.</p>') +
        reviewSection(product) +
      '</div>' +
    '</div>';

    openModal(el.productModal);
  }

  function updateDetailQty(delta) {
    var product = S.getProduct(state.detailId);
    if (!product) return;
    state.detailQty = Math.min(product.stock, Math.max(1, state.detailQty + delta));
    var node = document.getElementById('detailQty');
    if (node) node.textContent = state.detailQty;
  }

  function toggleZoom(media, event) {
    var image = media.querySelector('img');
    if (!image) return;
    if (media.classList.contains('zoomed')) {
      media.classList.remove('zoomed');
      image.style.transformOrigin = '';
      return;
    }
    var rect = media.getBoundingClientRect();
    var x = ((event.clientX - rect.left) / rect.width) * 100;
    var y = ((event.clientY - rect.top) / rect.height) * 100;
    image.style.transformOrigin = Math.min(96, Math.max(4, x)) + '% ' + Math.min(96, Math.max(4, y)) + '%';
    media.classList.add('zoomed');
  }

  /* ---------------- Rating, ulasan, laporan ---------------- */
  function starString(rating) {
    var full = Math.round(Number(rating) || 0);
    var out = '';
    for (var i = 1; i <= 5; i += 1) out += i <= full ? '★' : '☆';
    return out;
  }

  function ratingSummary(productId) {
    var list = S.getReviews(productId).filter(function (review) { return !review.report; });
    var count = list.length;
    var total = list.reduce(function (sum, review) { return sum + (Number(review.rating) || 0); }, 0);
    return { count: count, average: count ? Math.round((total / count) * 10) / 10 : 0 };
  }

  function ratingMarkup(productId) {
    var summary = ratingSummary(productId);
    if (!summary.count) return '<div class="product-rating empty">Belum ada ulasan</div>';
    return '<div class="product-rating">' +
      '<span class="stars" aria-hidden="true">' + starString(summary.average) + '</span>' +
      '<strong>' + summary.average.toFixed(1) + '</strong>' +
      '<span>(' + summary.count + ')</span>' +
    '</div>';
  }

  function reviewSection(product) {
    var visible = S.getReviews(product.id).filter(function (review) { return !review.report; });
    var summary = ratingSummary(product.id);
    var rating = state.reviewRating || 5;
    var picker = '';

    for (var i = 1; i <= 5; i += 1) {
      picker += '<button type="button" class="star-btn' + (i <= rating ? ' active' : '') + '"' +
        ' data-action="rate" data-star="' + i + '" aria-label="' + i + ' bintang" aria-pressed="' + (i <= rating) + '">★</button>';
    }

    var items = visible.map(function (review) {
      var id = S.escapeHtml(review.id);
      return '<li class="review-item">' +
        '<div class="review-top">' +
          '<strong>' + S.escapeHtml(review.name) + '</strong>' +
          '<span class="stars small" aria-hidden="true">' + starString(review.rating) + '</span>' +
          '<time datetime="' + S.escapeHtml(review.createdAt) + '">' + S.formatDate(review.createdAt) + '</time>' +
        '</div>' +
        (review.text ? '<p>' + S.escapeHtml(review.text) + '</p>' : '') +
        '<button type="button" class="review-report" data-action="report-pick" data-id="' + id + '">Laporkan</button>' +
        '<div class="report-picker" id="report-' + id + '">' +
          '<span>Alasan:</span>' +
          ['Spam / iklan', 'Kata kasar', 'Tidak relevan'].map(function (reason) {
            return '<button type="button" data-action="report-send" data-id="' + id + '" data-reason="' + S.escapeHtml(reason) + '">' + S.escapeHtml(reason) + '</button>';
          }).join('') +
          '<button type="button" class="cancel" data-action="report-cancel" data-id="' + id + '">Batal</button>' +
        '</div>' +
      '</li>';
    }).join('');

    return '<div class="reviews" id="reviewsBlock">' +
      '<div class="reviews-head">' +
        '<div><h3>Ulasan &amp; Rating</h3>' +
        '<p class="reviews-sub">Beri rating, tulis komentar, atau laporkan ulasan yang tidak pantas.</p></div>' +
        '<div class="rating-summary">' +
          '<span class="stars" aria-hidden="true">' + starString(summary.average) + '</span>' +
          '<strong>' + (summary.count ? summary.average.toFixed(1) : '—') + '</strong>' +
          '<span class="reviews-count">' + summary.count + ' ulasan</span>' +
        '</div>' +
      '</div>' +
      '<form class="review-form" id="reviewForm">' +
        '<div class="star-picker" role="group" aria-label="Pilih rating">' + picker + '</div>' +
        '<div class="review-fields">' +
          '<input type="text" id="reviewName" maxlength="40" placeholder="Nama Anda" autocomplete="name" value="' + S.escapeHtml(state.reviewName) + '" />' +
          '<textarea id="reviewText" rows="2" maxlength="400" placeholder="Bagaimana rasa dan aromanya?"></textarea>' +
        '</div>' +
        '<button type="submit" class="btn btn-primary">Kirim ulasan</button>' +
      '</form>' +
      (items
        ? '<ul class="review-list">' + items + '</ul>'
        : '<p class="reviews-empty">Jadilah yang pertama memberi rating untuk kopi ini.</p>') +
    '</div>';
  }

  function submitReview() {
    var product = S.getProduct(state.detailId);
    if (!product) return;
    var SEC = window.KGSecurity;
    var nameInput = document.getElementById('reviewName');
    var textInput = document.getElementById('reviewText');
    var name = SEC ? SEC.sanitizeText(nameInput.value, 40) : nameInput.value.trim();
    var text = SEC ? SEC.sanitizeMultiline(textInput.value, 400) : textInput.value.trim();

    if (name.length < 2) {
      toast('Nama terlalu pendek', 'Isi nama minimal 2 karakter.', 'error');
      nameInput.focus();
      return;
    }
    if (text.length < 4) {
      toast('Ulasan terlalu pendek', 'Tulis minimal 4 karakter.', 'error');
      textInput.focus();
      return;
    }

    state.reviewName = name;
    S.addReview({ productId: product.id, name: name, rating: state.reviewRating || 5, text: text });
    toast('Terima kasih!', 'Rating dan ulasan Anda sudah tersimpan.', 'success');
    refreshReviews();
  }

  function refreshReviews() {
    if (!state.detailId) return;
    openDetail(state.detailId);
    renderProducts();
    renderTicker();
    var block = document.getElementById('reviewsBlock');
    if (block) block.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  /* ---------------- Produk berjalan ---------------- */
  function renderTicker() {
    if (!el.ticker) return;
    var products = S.getProducts().filter(function (product) { return product.active !== false; }).slice(0, 8);
    var strip = document.getElementById('productTickerStrip');
    if (!products.length) {
      if (strip) strip.hidden = true;
      return;
    }
    if (strip) strip.hidden = false;

    var items = products.map(function (product) {
      return '<button type="button" class="ticker-item" data-action="detail" data-id="' + S.escapeHtml(product.id) + '">' +
        '<img src="' + S.escapeHtml(product.image) + '" alt="" loading="lazy" />' +
        '<span class="ticker-text">' +
          '<strong>' + S.escapeHtml(product.name) + '</strong>' +
          '<small>' + S.formatRupiah(product.price) + '</small>' +
        '</span>' +
      '</button>';
    }).join('');

    el.ticker.innerHTML = items + items;
    Array.prototype.forEach.call(el.ticker.children, function (node, index) {
      if (index < products.length) {
        node.style.animationDelay = (index * 0.32).toFixed(2) + 's';
        node.classList.add('enter');
      } else {
        node.setAttribute('aria-hidden', 'true');
        node.setAttribute('tabindex', '-1');
      }
    });
  }

  /* ---------------- Keranjang ---------------- */
  function renderCart() {
    var details = S.cartDetails();
    var totalQty = details.reduce(function (sum, item) { return sum + item.qty; }, 0);
    var totalPrice = details.reduce(function (sum, item) { return sum + item.subtotal; }, 0);

    el.cartCount.textContent = totalQty;
    if (el.cartCount && state.lastCartCount !== totalQty) {
      el.cartCount.classList.remove('pop');
      void el.cartCount.offsetWidth;
      el.cartCount.classList.add('pop');
    }
    state.lastCartCount = totalQty;
    el.cartItemCount.textContent = totalQty + ' produk';

    if (!details.length) {
      el.cartBody.innerHTML = '<div class="empty-state" style="border:none;padding:48px 10px;background:transparent">' +
        '<span class="ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/></svg></span>' +
        '<h3>Keranjang kosong</h3>' +
        '<p>Belum ada kopi yang dipilih.</p>' +
        '</div>';
      el.cartEmptyFoot.hidden = false;
      el.cartCheckout.hidden = true;
      return;
    }

    el.cartEmptyFoot.hidden = true;
    el.cartCheckout.hidden = false;

    el.cartBody.innerHTML = details.map(function (item) {
      var product = item.product;
      return '<div class="cart-item">' +
        '<img src="' + S.escapeHtml(product.image) + '" alt="' + S.escapeHtml(product.name) + '" />' +
        '<div class="cart-item-main">' +
          '<h4>' + S.escapeHtml(product.name) + '</h4>' +
          '<div class="meta">' + S.escapeHtml(product.weight) + ' · ' + S.escapeHtml(product.origin) + '</div>' +
          '<div class="cart-item-row">' +
            '<div class="qty-control">' +
              '<button data-action="cart-minus" data-id="' + S.escapeHtml(product.id) + '" aria-label="Kurangi"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12h14"/></svg></button>' +
              '<span>' + item.qty + '</span>' +
              '<button data-action="cart-plus" data-id="' + S.escapeHtml(product.id) + '" aria-label="Tambah"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg></button>' +
            '</div>' +
            '<span class="cart-item-price">' + S.formatRupiah(item.subtotal) + '</span>' +
          '</div>' +
          '<button class="remove-link" data-action="cart-remove" data-id="' + S.escapeHtml(product.id) + '">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg> Hapus' +
          '</button>' +
        '</div>' +
      '</div>';
    }).join('');

    el.cartSummary.textContent = totalQty + ' produk · ' + details.length + ' jenis';
    el.cartTotal.textContent = S.formatRupiah(totalPrice);
  }

  function openCart() {
    el.cartDrawer.classList.add('open');
    el.overlay.classList.add('open');
    el.cartDrawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeCart() {
    el.cartDrawer.classList.remove('open');
    if (!document.querySelector('.modal-wrap.open')) {
      el.overlay.classList.remove('open');
      document.body.style.overflow = '';
    }
    el.cartDrawer.setAttribute('aria-hidden', 'true');
  }

  /* ---------------- Checkout ---------------- */
  function checkout(event) {
    event.preventDefault();
    var settings = S.getSettings();
    var nameField = document.getElementById('fieldName');
    var phoneField = document.getElementById('fieldPhone');
    var nameInput = document.getElementById('customerName');
    var phoneInput = document.getElementById('customerPhone');
    var noteInput = document.getElementById('customerNote');

    var SEC = window.KGSecurity;
    var name = SEC ? SEC.sanitizeText(nameInput.value, 60) : nameInput.value.trim();
    var phoneDigits = S.normalizePhone(phoneInput.value).slice(0, 15);
    var note = SEC ? SEC.sanitizeMultiline(noteInput.value, 400) : noteInput.value.trim();
    var valid = true;

    nameField.classList.remove('invalid');
    phoneField.classList.remove('invalid');
    if (name.length < 2) {
      nameField.classList.add('invalid');
      valid = false;
    }
    if (!/^[\d]{10,15}$/.test(phoneDigits)) {
      phoneField.classList.add('invalid');
      valid = false;
    }
    if (!valid) {
      toast('Periksa kembali data pesanan', 'Nama dan nomor WhatsApp wajib diisi dengan benar.', 'error');
      return;
    }

    var details = S.cartDetails();
    if (!details.length) {
      toast('Keranjang kosong', 'Tambahkan produk terlebih dahulu.', 'error');
      return;
    }

    var outOfStock = details.filter(function (item) { return item.qty > item.product.stock; });
    if (outOfStock.length) {
      toast('Stok berubah', 'Jumlah ' + outOfStock[0].product.name + ' melebihi stok tersedia.', 'error');
      renderCart();
      return;
    }

    var items = details.map(function (item) {
      return {
        productId: item.product.id,
        name: item.product.name,
        price: item.product.price,
        qty: item.qty,
        weight: item.product.weight
      };
    });
    var total = details.reduce(function (sum, item) { return sum + item.subtotal; }, 0);

    var order;
    try {
      order = S.addOrder({
        customer: { name: name, phone: phoneDigits, note: note },
        items: items,
        itemCount: items.reduce(function (sum, item) { return sum + item.qty; }, 0),
        total: total
      });
    } catch (err) {
      toast('Pesanan gagal disimpan', err.message || 'Penyimpanan browser tidak tersedia.', 'error');
      return;
    }

    var lines = items.map(function (item, index) {
      return (index + 1) + '. ' + item.name + ' (' + item.weight + ') x' + item.qty + ' — ' + S.formatRupiah(item.price * item.qty);
    });
    var message = 'Halo ' + settings.storeName + ', saya ingin memesan:\n\n' +
      lines.join('\n') + '\n\n' +
      'Total: ' + S.formatRupiah(total) + '\n' +
      'Nama: ' + name + '\n' +
      'No. WhatsApp: ' + phoneDigits +
      (note ? '\nAlamat/Catatan: ' + note : '') +
      '\n\nNomor pesanan: ' + order.id;

    var waUrl = 'https://wa.me/' + S.normalizePhone(settings.whatsapp) + '?text=' + encodeURIComponent(message);
    window.open(waUrl, '_blank', 'noopener');

    S.clearCart();
    renderCart();
    closeCart();
    document.getElementById('checkoutForm').reset();
    toast('Pesanan tercatat: ' + order.id, 'Silakan lanjutkan konfirmasi di WhatsApp. Status awal: menunggu konfirmasi.', 'success');
  }

  /* ---------------- Modal & toast ---------------- */
  function openModal(modal) {
    if (!modal) return;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModals() {
    document.querySelectorAll('.modal-wrap.open').forEach(function (modal) {
      modal.classList.remove('open');
    });
    if (!el.cartDrawer.classList.contains('open')) {
      el.overlay.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  function toast(title, message, type) {
    var iconPath = type === 'error'
      ? '<circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>'
      : type === 'info'
        ? '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>'
        : '<circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-6"/>';
    var node = document.createElement('div');
    node.className = 'toast ' + (type || 'success');
    node.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">' + iconPath + '</svg>' +
      '<div><strong>' + S.escapeHtml(title) + '</strong>' + (message ? '<span>' + S.escapeHtml(message) + '</span>' : '') + '</div>';
    el.toastStack.appendChild(node);
    setTimeout(function () {
      node.style.opacity = '0';
      node.style.transform = 'translateX(16px)';
      node.style.transition = 'all .25s ease';
      setTimeout(function () { node.remove(); }, 260);
    }, 4200);
  }

  function openLightbox(button) {
    el.lightboxImage.src = button.getAttribute('data-img');
    el.lightboxImage.alt = button.getAttribute('data-caption') || 'Gambar galeri';
    el.lightboxCaption.textContent = button.getAttribute('data-caption') || '';
    openModal(el.lightbox);
  }

  /* ---------------- Event ---------------- */
  function bindEvents() {
    el.search.addEventListener('input', function () {
      clearTimeout(searchTimer);
      var value = el.search.value;
      searchTimer = setTimeout(function () {
        state.search = value.trim();
        renderProducts();
      }, 180);
    });

    el.sort.addEventListener('change', function () {
      state.sort = el.sort.value;
      renderProducts();
    });

    el.chips.addEventListener('click', function (event) {
      var chip = event.target.closest('[data-category]');
      if (!chip) return;
      state.category = chip.getAttribute('data-category');
      renderCategories();
      renderProducts();
    });

    el.grid.addEventListener('click', function (event) {
      var actionBtn = event.target.closest('[data-action]');
      if (!actionBtn) return;
      var action = actionBtn.getAttribute('data-action');
      var id = actionBtn.getAttribute('data-id');
      if (action === 'detail' && id) openDetail(id);
      if (action === 'add' && id) {
        var result = S.addToCart(id, 1);
        toast(result.ok ? 'Ditambahkan ke keranjang' : 'Tidak dapat menambahkan', result.message, result.ok ? 'success' : 'error');
        if (result.ok) {
          renderCart();
          openCart();
        }
      }
      if (action === 'reset-filter') {
        state.search = '';
        state.category = 'all';
        el.search.value = '';
        renderCategories();
        renderProducts();
      }
    });

    el.ticker.addEventListener('click', function (event) {
      var item = event.target.closest('[data-action="detail"]');
      if (item && item.getAttribute('data-id')) openDetail(item.getAttribute('data-id'));
    });

    el.productModalContent.addEventListener('click', function (event) {
      var media = event.target.closest('[data-action="zoom-image"]');
      if (media) {
        toggleZoom(media, event);
        return;
      }
      var btn = event.target.closest('[data-action]');
      if (!btn) return;
      var action = btn.getAttribute('data-action');
      var id = btn.getAttribute('data-id');

      if (action === 'rate') {
        state.reviewRating = Number(btn.getAttribute('data-star')) || 5;
        Array.prototype.forEach.call(el.productModalContent.querySelectorAll('.star-btn'), function (star) {
          var value = Number(star.getAttribute('data-star'));
          star.classList.toggle('active', value <= state.reviewRating);
          star.setAttribute('aria-pressed', String(value <= state.reviewRating));
        });
      }
      if (action === 'report-pick') {
        var box = document.getElementById('report-' + id);
        if (box) box.classList.toggle('open');
      }
      if (action === 'report-cancel') {
        var closeBox = document.getElementById('report-' + id);
        if (closeBox) closeBox.classList.remove('open');
      }
      if (action === 'report-send') {
        var reported = S.reportReview(id, btn.getAttribute('data-reason'));
        if (reported) {
          toast('Laporan diterima', 'Ulasan disembunyikan dan dicatat untuk ditinjau admin.', 'info');
          refreshReviews();
        }
      }
    });

    el.productModalContent.addEventListener('submit', function (event) {
      if (!event.target || event.target.id !== 'reviewForm') return;
      event.preventDefault();
      submitReview();
    });

    document.getElementById('cartBtn').addEventListener('click', openCart);
    document.getElementById('closeCart').addEventListener('click', closeCart);
    document.getElementById('cartShopBtn').addEventListener('click', function () {
      closeCart();
      document.getElementById('produk').scrollIntoView({ behavior: 'smooth' });
    });
    el.overlay.addEventListener('click', closeCart);

    el.cartBody.addEventListener('click', function (event) {
      var btn = event.target.closest('[data-action]');
      if (!btn) return;
      var action = btn.getAttribute('data-action');
      var id = btn.getAttribute('data-id');
      var current = (S.getCart().filter(function (item) { return item.id === id; })[0] || {}).qty || 0;
      if (action === 'cart-plus') {
        var product = S.getProduct(id);
        if (product && current + 1 > product.stock) {
          toast('Stok terbatas', 'Jumlah melebihi stok tersedia (' + product.stock + ').', 'error');
          return;
        }
        S.setCartQty(id, current + 1);
      }
      if (action === 'cart-minus') S.setCartQty(id, current - 1);
      if (action === 'cart-remove') {
        S.removeFromCart(id);
        toast('Produk dihapus dari keranjang', '', 'info');
      }
      renderCart();
      renderProducts();
    });

    document.getElementById('checkoutForm').addEventListener('submit', checkout);

    /* Kebijakan privasi: pengunjung bisa menghapus seluruh data demo di browser ini. */
    var clearDataBtn = document.getElementById('clearLocalData');
    if (clearDataBtn) {
      clearDataBtn.addEventListener('click', function () {
        if (!window.confirm('Hapus semua data toko dan pesanan yang tersimpan di browser ini? Tindakan ini tidak bisa dibatalkan.')) return;
        try {
          Object.keys(window.localStorage).forEach(function (key) {
            if (key.indexOf('kg_') === 0) window.localStorage.removeItem(key);
          });
        } catch (err) { /* localStorage tidak tersedia */ }
        toast('Data browser dihapus', 'Katalog akan dimuat ulang dengan data awal.', 'info');
        window.setTimeout(function () { window.location.reload(); }, 800);
      });
    }

    el.productModal.addEventListener('click', function (event) {
      if (event.target === el.productModal) {
        closeModals();
        return;
      }
      var btn = event.target.closest('[data-action]');
      if (!btn) return;
      var action = btn.getAttribute('data-action');
      if (action === 'detail-plus') updateDetailQty(1);
      if (action === 'detail-minus') updateDetailQty(-1);
      if (action === 'detail-add') {
        var result = S.addToCart(state.detailId, state.detailQty);
        if (result.ok) {
          closeModals();
          renderCart();
          renderProducts();
          openCart();
          toast('Ditambahkan ke keranjang', result.message, 'success');
        } else {
          toast('Tidak dapat menambahkan', result.message, 'error');
        }
      }
    });

    el.lightbox.addEventListener('click', function (event) {
      if (event.target === el.lightbox || event.target.closest('[data-close-modal]')) closeModals();
    });

    document.querySelectorAll('[data-close-modal]').forEach(function (btn) {
      btn.addEventListener('click', closeModals);
    });

    document.getElementById('galleryGrid').addEventListener('click', function (event) {
      var item = event.target.closest('.gallery-item');
      if (item) openLightbox(item);
    });

    document.getElementById('menuToggle').addEventListener('click', function () {
      el.nav.classList.toggle('open');
    });

    el.nav.addEventListener('click', function (event) {
      if (event.target.tagName === 'A') el.nav.classList.remove('open');
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        closeModals();
        closeCart();
      }
    });

    /* Sinkronkan tampilan bila data diubah dari tab dashboard */
    window.addEventListener('storage', function (event) {
      if (event.key && event.key.indexOf('kg_') === 0) {
        renderCategories();
        renderProducts();
        renderCart();
        applySettings();
      }
    });

    /* Fallback gambar rusak agar katalog tetap rapi */
    document.addEventListener('error', function (event) {
      var target = event.target;
      if (target && target.tagName === 'IMG' && !target.dataset.fallback) {
        target.dataset.fallback = '1';
        target.src = 'assets/photos/product-01.jpg';
      }
    }, true);

    /* Sorot menu aktif saat menggulir */
    var sections = ['beranda', 'produk', 'cerita', 'galeri', 'kontak'];
    var navLinks = Array.prototype.slice.call(el.nav.querySelectorAll('a'));
    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          navLinks.forEach(function (link) {
            link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id);
          });
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      sections.forEach(function (id) {
        var section = document.getElementById(id);
        if (section) observer.observe(section);
      });
    }
  }
})();
