/* =========================================================
   Jualan Kopi Gayo — Lapisan keamanan sisi browser
   Berisi: hash password (SHA-256 iteratif), rate limiting
   login, session bertimer, audit log, dan sanitasi input.

   PENTING: semua ini berjalan di browser pengunjung. Ini
   memperkuat demo statis, tetapi bukan pengganti backend.
   Validasi otentikasi & otorisasi yang sebenarnya wajib
   dilakukan di server (lihat SECURITY.md).
   ========================================================= */
(function (window) {
  'use strict';

  var SALT = 'kopigayo::admin::v1';
  var ITERATIONS = 2000;
  var ADMIN_USER = 'admin';
  /* SHA-256 iteratif 2000x dari "salt:password" — password asli tidak disimpan di kode. */
  var ADMIN_HASH = '2b9836506c1c74aa48c09f70dd85fbea73b959c37f716234be068e4d14decbbc';

  var SESSION_KEY = 'kg_admin_session';
  var ATTEMPT_KEY = 'kg_login_attempts';
  var LOG_KEY = 'kg_activity_log';

  var MAX_ATTEMPTS = 5;
  var ATTEMPT_WINDOW_MS = 10 * 60 * 1000;
  var LOCK_STEPS_MS = [5 * 60 * 1000, 15 * 60 * 1000, 60 * 60 * 1000];
  var IDLE_MS = 30 * 60 * 1000;
  var ABSOLUTE_MS = 8 * 60 * 60 * 1000;
  var LOG_RETENTION_MS = 90 * 24 * 60 * 60 * 1000;

  /* ---------------- SHA-256 (implementasi murni, tanpa dependensi) ---------------- */
  var K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];

  function rotr(x, n) { return (x >>> n) | (x << (32 - n)); }

  function utf8Bytes(text) {
    var bytes = [];
    var str = window.TextEncoder ? null : unescape(encodeURIComponent(text));
    if (window.TextEncoder) return Array.prototype.slice.call(new window.TextEncoder().encode(text));
    for (var i = 0; i < str.length; i += 1) bytes.push(str.charCodeAt(i) & 0xff);
    return bytes;
  }

  function sha256(input) {
    var msg = Array.prototype.slice.call(input);
    var bitLen = msg.length * 8;
    var hi = Math.floor(bitLen / 4294967296);
    var lo = bitLen >>> 0;

    msg.push(0x80);
    while (msg.length % 64 !== 56) msg.push(0);
    msg.push((hi >>> 24) & 255, (hi >>> 16) & 255, (hi >>> 8) & 255, hi & 255);
    msg.push((lo >>> 24) & 255, (lo >>> 16) & 255, (lo >>> 8) & 255, lo & 255);

    var h = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
    var w = new Array(64);

    for (var i = 0; i < msg.length; i += 64) {
      var j;
      for (j = 0; j < 16; j += 1) {
        w[j] = ((msg[i + j * 4] << 24) | (msg[i + j * 4 + 1] << 16) | (msg[i + j * 4 + 2] << 8) | msg[i + j * 4 + 3]) | 0;
      }
      for (j = 16; j < 64; j += 1) {
        var s0 = rotr(w[j - 15], 7) ^ rotr(w[j - 15], 18) ^ (w[j - 15] >>> 3);
        var s1 = rotr(w[j - 2], 17) ^ rotr(w[j - 2], 19) ^ (w[j - 2] >>> 10);
        w[j] = (w[j - 16] + s0 + w[j - 7] + s1) | 0;
      }

      var a = h[0], b = h[1], c = h[2], d = h[3], e = h[4], f = h[5], g = h[6], hh = h[7];
      for (j = 0; j < 64; j += 1) {
        var S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
        var ch = (e & f) ^ (~e & g);
        var t1 = (hh + S1 + ch + K[j] + w[j]) | 0;
        var S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
        var maj = (a & b) ^ (a & c) ^ (b & c);
        var t2 = (S0 + maj) | 0;
        hh = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
      }

      h[0] = (h[0] + a) | 0; h[1] = (h[1] + b) | 0; h[2] = (h[2] + c) | 0; h[3] = (h[3] + d) | 0;
      h[4] = (h[4] + e) | 0; h[5] = (h[5] + f) | 0; h[6] = (h[6] + g) | 0; h[7] = (h[7] + hh) | 0;
    }

    var out = [];
    for (var k = 0; k < 8; k += 1) {
      out.push((h[k] >>> 24) & 255, (h[k] >>> 16) & 255, (h[k] >>> 8) & 255, h[k] & 255);
    }
    return out;
  }

  function toHex(bytes) {
    var out = '';
    for (var i = 0; i < bytes.length; i += 1) out += (bytes[i] < 16 ? '0' : '') + bytes[i].toString(16);
    return out;
  }

  function hashPassword(password) {
    var digest = utf8Bytes(SALT + ':' + String(password || ''));
    for (var i = 0; i < ITERATIONS; i += 1) digest = sha256(digest);
    return toHex(digest);
  }

  /* Perbandingan waktu-konstan sederhana, mencegah timing attack sepele. */
  function safeEqual(a, b) {
    a = String(a); b = String(b);
    if (a.length !== b.length) return false;
    var diff = 0;
    for (var i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
    return diff === 0;
  }

  function verifyCredentials(username, password) {
    var userOk = safeEqual(String(username || '').trim().toLowerCase(), ADMIN_USER);
    var passOk = safeEqual(hashPassword(password), ADMIN_HASH);
    return userOk && passOk;
  }

  /* ---------------- Penyimpanan aman (tahan error/private mode) ---------------- */
  function readJSON(store, key, fallback) {
    try {
      var raw = window[store].getItem(key);
      if (!raw) return fallback;
      var parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : fallback;
    } catch (err) {
      return fallback;
    }
  }

  function writeJSON(store, key, value) {
    try {
      window[store].setItem(key, JSON.stringify(value));
      return true;
    } catch (err) {
      return false;
    }
  }

  function randomToken() {
    var bytes = [];
    var cryptoObj = window.crypto || window.msCrypto;
    if (cryptoObj && cryptoObj.getRandomValues) {
      var buf = new Uint8Array(32);
      cryptoObj.getRandomValues(buf);
      bytes = Array.prototype.slice.call(buf);
    } else {
      for (var i = 0; i < 32; i += 1) bytes.push(Math.floor(Math.random() * 256));
    }
    return toHex(bytes);
  }

  /* ---------------- Rate limiting login ---------------- */
  function attempts() {
    var data = readJSON('localStorage', ATTEMPT_KEY, {});
    var now = Date.now();
    var list = Array.isArray(data.failures) ? data.failures : [];
    list = list.filter(function (t) { return typeof t === 'number' && now - t < ATTEMPT_WINDOW_MS; });
    return {
      failures: list,
      level: typeof data.level === 'number' ? data.level : 0,
      lockedUntil: typeof data.lockedUntil === 'number' ? data.lockedUntil : 0
    };
  }

  function loginState() {
    var data = attempts();
    var now = Date.now();
    var locked = data.lockedUntil > now;
    return {
      locked: locked,
      msLeft: locked ? data.lockedUntil - now : 0,
      attemptsLeft: Math.max(0, MAX_ATTEMPTS - data.failures.length),
      level: data.level
    };
  }

  function registerFailure() {
    var data = attempts();
    var now = Date.now();
    data.failures.push(now);
    if (data.failures.length >= MAX_ATTEMPTS) {
      var step = LOCK_STEPS_MS[Math.min(data.level, LOCK_STEPS_MS.length - 1)];
      data.lockedUntil = now + step;
      data.level = data.level + 1;
      data.failures = [];
    }
    writeJSON('localStorage', ATTEMPT_KEY, data);
    return loginState();
  }

  function clearFailures() {
    try { window.localStorage.removeItem(ATTEMPT_KEY); } catch (err) { /* abaikan */ }
  }

  function formatDuration(ms) {
    var total = Math.max(0, Math.ceil(ms / 1000));
    var m = Math.floor(total / 60);
    var s = total % 60;
    if (m <= 0) return s + ' detik';
    return m + ' menit' + (s ? ' ' + s + ' detik' : '');
  }

  /* ---------------- Session bertimer ---------------- */
  function startSession() {
    var now = Date.now();
    var session = {
      token: randomToken(),
      started: now,
      last: now,
      expires: now + ABSOLUTE_MS
    };
    writeJSON('sessionStorage', SESSION_KEY, session);
    return session;
  }

  function getSession() {
    var session = readJSON('sessionStorage', SESSION_KEY, null);
    if (!session || typeof session.token !== 'string' || session.token.length !== 64) return null;
    return session;
  }

  function isSessionValid() {
    var session = getSession();
    if (!session) return false;
    var now = Date.now();
    return session.expires > now && session.last + IDLE_MS > now;
  }

  function sessionStatus() {
    var session = getSession();
    if (!session) return { valid: false, idleLeft: 0, absoluteLeft: 0 };
    var now = Date.now();
    return {
      valid: isSessionValid(),
      idleLeft: Math.max(0, session.last + IDLE_MS - now),
      absoluteLeft: Math.max(0, session.expires - now),
      started: session.started
    };
  }

  function touchSession() {
    var session = getSession();
    if (!session) return;
    var now = Date.now();
    if (session.expires <= now || session.last + IDLE_MS <= now) return;
    session.last = now;
    writeJSON('sessionStorage', SESSION_KEY, session);
  }

  function endSession() {
    try { window.sessionStorage.removeItem(SESSION_KEY); } catch (err) { /* abaikan */ }
  }

  /* ---------------- Audit log (maks 200 entri, retensi 90 hari) ---------------- */
  function log(action, detail) {
    var list = readJSON('localStorage', LOG_KEY, []);
    if (!Array.isArray(list)) list = [];
    var now = Date.now();
    list = list.filter(function (item) { return item && now - item.t < LOG_RETENTION_MS; });
    list.unshift({ t: now, action: String(action || '').slice(0, 60), detail: String(detail || '').slice(0, 160) });
    writeJSON('localStorage', LOG_KEY, list.slice(0, 200));
  }

  function getLog(limit) {
    var list = readJSON('localStorage', LOG_KEY, []);
    if (!Array.isArray(list)) return [];
    return list.slice(0, limit || 20);
  }

  /* ---------------- Sanitasi input ---------------- */
  function sanitizeText(value, maxLength) {
    if (value === null || value === undefined) return '';
    var text = String(value).replace(/[\u0000-\u001F\u007F]+/g, ' ').replace(/[ \t]+/g, ' ').trim();
    if (maxLength && text.length > maxLength) text = text.slice(0, maxLength);
    return text;
  }

  function sanitizeMultiline(value, maxLength) {
    if (value === null || value === undefined) return '';
    var text = String(value).replace(/\r\n?/g, '\n').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim();
    if (maxLength && text.length > maxLength) text = text.slice(0, maxLength);
    return text;
  }

  var SAFE_IMAGE_RE = /^data:image\/(png|jpe?g|gif|webp|svg\+xml);base64,[A-Za-z0-9+/=\s]+$/i;

  /* Hanya izinkan gambar lokal, http(s), atau data URL gambar. Blokir javascript:, data:text/html, dll. */
  function safeImageUrl(url, maxLength) {
    var value = sanitizeText(url, maxLength || 600000);
    if (!value) return '';
    if (/^assets\/[\w./-]+$/i.test(value)) return value;
    if (/^https?:\/\/[^\s"'<>]+$/i.test(value)) return value;
    if (SAFE_IMAGE_RE.test(value)) return value;
    return '';
  }

  function safeHttpUrl(url) {
    var value = sanitizeText(url, 2000);
    return /^https?:\/\/[^\s"'<>]+$/i.test(value) ? value : '';
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(sanitizeText(value, 120));
  }

  function isValidPhone(value) {
    var digits = String(value || '').replace(/[^\d]/g, '');
    return digits.length >= 9 && digits.length <= 15;
  }

  function clampInt(value, min, max, fallback) {
    var num = Math.round(Number(value));
    if (!isFinite(num)) return fallback;
    return Math.min(max, Math.max(min, num));
  }

  function clampNumber(value, min, max, fallback) {
    var num = Number(value);
    if (!isFinite(num)) return fallback;
    return Math.min(max, Math.max(min, num));
  }

  window.KGSecurity = {
    verifyCredentials: verifyCredentials,
    hashPassword: hashPassword,
    loginState: loginState,
    registerFailure: registerFailure,
    clearFailures: clearFailures,
    formatDuration: formatDuration,
    startSession: startSession,
    isSessionValid: isSessionValid,
    sessionStatus: sessionStatus,
    touchSession: touchSession,
    endSession: endSession,
    log: log,
    getLog: getLog,
    sanitizeText: sanitizeText,
    sanitizeMultiline: sanitizeMultiline,
    safeImageUrl: safeImageUrl,
    safeHttpUrl: safeHttpUrl,
    isValidEmail: isValidEmail,
    isValidPhone: isValidPhone,
    clampInt: clampInt,
    clampNumber: clampNumber,
    IDLE_MS: IDLE_MS,
    MAX_ATTEMPTS: MAX_ATTEMPTS
  };
})(window);
