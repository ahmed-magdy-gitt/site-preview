/* DriveShare - shared UI code. Client-side only: no network requests, no cookies, no analytics. */
(function () {
  'use strict';
  var A = window.App = {};
  var $ = A.$ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = A.$$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  A.esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };

  /* ---------- storage (always guarded) ---------- */
  var mem = {};
  A.store = {
    get: function (k, d) { try { var v = localStorage.getItem('ds_' + k); return v === null ? (k in mem ? mem[k] : d) : JSON.parse(v); } catch (e) { return k in mem ? mem[k] : d; } },
    set: function (k, v) { mem[k] = v; try { localStorage.setItem('ds_' + k, JSON.stringify(v)); } catch (e) { } },
    del: function (k) { delete mem[k]; try { localStorage.removeItem('ds_' + k); } catch (e) { } }
  };
  var S = A.store;
  A.user = function () { return S.get('user', null); };
  A.role = function () { return S.get('role', 'renter'); };
  A.bookings = function () { var b = S.get('bookings', null); if (!b) { b = DS.seedBookings(); S.set('bookings', b); } return b; };
  A.favs = function () { return S.get('favs', [3, 2]); };
  A.isFav = function (id) { return A.favs().indexOf(+id) > -1; };
  A.toggleFav = function (id) { var f = A.favs(), i = f.indexOf(+id); if (i > -1) f.splice(i, 1); else f.push(+id); S.set('favs', f); return i === -1; };
  A.search = function () { return S.get('search', { loc: 'Cairo, Egypt', from: '2026-10-25', to: '2026-10-28', pt: '10:00 AM', dt: '10:00 AM' }); };
  A.q = function (k) { try { return new URLSearchParams(location.search).get(k); } catch (e) { return null; } };

  /* ---------- icons ---------- */
  var P = {
    home: 'M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10', car: 'M5 16H3v-5l2-5h14l2 5v5h-2M5 16a2 2 0 104 0m6 0a2 2 0 104 0M5 11h14M9 16h6', cal: 'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4', msg: 'M4 5h16v11H9l-5 4z', heart: 'M12 20s-8-5-8-11a4.5 4.5 0 018-2.5A4.5 4.5 0 0120 9c0 6-8 11-8 11z', card: 'M3 6h18v12H3zM3 10h18M7 15h3', shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z', user: 'M12 12a4 4 0 100-8 4 4 0 000 8zM4 21c0-4 3.5-6 8-6s8 2 8 6', gear: 'M12 15a3 3 0 100-6 3 3 0 000 6zM19 12l2-1-1-3-2 .5-1.5-1.5.5-2-3-1-1 2h-2l-1-2-3 1 .5 2L6 8l-2-.5-1 3 2 1v2l-2 1 1 3 2-.5L7.5 18l-.5 2 3 1 1-2h2l1 2 3-1-.5-2 1.5-1.5 2 .5 1-3-2-1z',
    search: 'M11 18a7 7 0 100-14 7 7 0 000 14zM21 21l-5-5', bell: 'M6 16V11a6 6 0 0112 0v5l2 2H4zM10 21h4', pin: 'M12 21s7-6 7-12a7 7 0 10-14 0c0 6 7 12 7 12zM12 11a2 2 0 100-4 2 2 0 000 4z', clock: 'M12 21a9 9 0 100-18 9 9 0 000 18zM12 7v5l3 2',
    cd: 'M6 9l6 6 6-6', cl: 'M15 18l-6-6 6-6', cr: 'M9 18l6-6-6-6', cu: 'M6 15l6-6 6 6', ar: 'M5 12h14M13 6l6 6-6 6', au: 'M12 19V5M6 11l6-6 6 6', plus: 'M12 5v14M5 12h14', check: 'M5 12l5 5 9-10', x: 'M6 6l12 12M18 6L6 18',
    star: 'M12 3l2.7 5.7 6.3.8-4.6 4.3 1.2 6.2L12 17l-5.6 3 1.2-6.2L3 9.5l6.3-.8z', users: 'M9 11a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM2 20c0-3.5 3-5.5 7-5.5s7 2 7 5.5M17 4.5a3.5 3.5 0 010 6.5M19 14.5c2 .7 3 2.2 3 5.5', bag: 'M5 8h14l-1 12H6zM9 8V6a3 3 0 016 0v2', auto: 'M12 15a3 3 0 100-6 3 3 0 000 6zM12 3v3M12 18v3M3 12h3M18 12h3', fuel: 'M5 21V5a2 2 0 012-2h6a2 2 0 012 2v16M5 21h10M5 10h10M15 8l3 2v8a1.5 1.5 0 003 0v-6l-3-3',
    share: 'M18 8a3 3 0 100-6 3 3 0 000 6zM6 15a3 3 0 100-6 3 3 0 000 6zM18 22a3 3 0 100-6 3 3 0 000 6zM8.6 13.5l6.8 4M15.4 6.5l-6.8 4', phone: 'M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z', edit: 'M4 20h4L19 9l-4-4L4 16zM13 7l4 4', trash: 'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3', more: 'M12 6v.01M12 12v.01M12 18v.01', moreh: 'M6 12h.01M12 12h.01M18 12h.01',
    dollar: 'M12 3v18M16 7.5C16 6 14.2 5 12 5s-4 1-4 2.8c0 4.2 8 2.2 8 6.4 0 1.7-1.8 2.8-4 2.8s-4-1.1-4-2.6', file: 'M6 3h8l5 5v13H6zM14 3v5h5M9 13h7M9 17h7', up: 'M12 16V4M6 10l6-6 6 6M4 20h16', down: 'M12 4v12M6 12l6 6 6-6M4 20h16', filter: 'M4 5h16l-6 8v6l-4-2v-4z', grid: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z', map: 'M9 4L3 6v14l6-2 6 2 6-2V4l-6 2zM9 4v14M15 6v14', info: 'M12 21a9 9 0 100-18 9 9 0 000 18zM12 11v6M12 7.5v.01', lock: 'M6 11h12v9H6zM8 11V8a4 4 0 018 0v3', mail: 'M3 6h18v12H3zM3 7l9 7 9-7', eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 15a3 3 0 100-6 3 3 0 000 6z',
    help: 'M12 21a9 9 0 100-18 9 9 0 000 18zM9.5 9.5a2.5 2.5 0 114 2c-1 .7-1.5 1-1.5 2M12 17v.01', send: 'M21 3L10 14M21 3l-7 18-4-7-7-4z', expand: 'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5', bolt: 'M13 2L4 14h7l-1 8 9-12h-7z', snow: 'M12 2v20M4 7l16 10M4 17L20 7', compass: 'M12 21a9 9 0 100-18 9 9 0 000 18zM15.5 8.5L13.5 13.5 8.5 15.5l2-5z', bt: 'M7 7l10 10-5 4V3l5 4L7 17', cam: 'M4 8h4l2-3h4l2 3h4v11H4zM12 17a3.5 3.5 0 100-7 3.5 3.5 0 000 7z', music: 'M9 18V5l11-2v13M9 18a3 3 0 11-6 0 3 3 0 016 0zm11-2a3 3 0 11-6 0 3 3 0 016 0z', award: 'M12 14a6 6 0 100-12 6 6 0 000 12zM8.5 13L7 22l5-3 5 3-1.5-9', trend: 'M3 17l6-6 4 4 8-8M15 7h6v6', wallet: 'M3 7h16a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2zM3 7l12-3v3M16 13.5h.01', menu: 'M4 7h16M4 12h16M4 17h16', tag: 'M3 12V4h8l10 10-8 8zM7.5 8.5h.01', logout: 'M10 4H5v16h5M15 8l4 4-4 4M19 12H9', doc: 'M6 3h9l4 4v14H6zM9 12h7M9 16h5', globe: 'M12 21a9 9 0 100-18 9 9 0 000 18zM3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18', refresh: 'M20 11a8 8 0 10-2 6M20 5v6h-6', chat: 'M4 5h16v11H9l-5 4zM8 9h8M8 12h5', seat: 'M7 4v10h9l3 6M7 14l-2 6'
  };
  A.ic = function (n, c) { return '<svg class="ic ' + (c || '') + '" viewBox="0 0 24 24" aria-hidden="true"><path d="' + (P[n] || P.info) + '"/></svg>'; };
  var ic = A.ic;
  A.star = function (c) { return '<svg class="ic f ' + (c || '') + '" viewBox="0 0 24 24" aria-hidden="true"><path d="' + P.star + '"/></svg>'; };
  A.logo = function (cls) {
    return '<a class="logo ' + (cls || '') + '" href="index.html" aria-label="DriveShare home"><svg viewBox="0 0 48 34"><defs><linearGradient id="lg' + (cls || 'd') + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2f7bff"/><stop offset="1" stop-color="#0a3cc4"/></linearGradient></defs><path d="M7 20l3-9c.6-1.8 2-3 4-3h14c2 0 3.4 1 4.2 2.6L37 18c3 0 5 2 5 5v3a2 2 0 01-2 2h-2a4 4 0 01-8 0H18a4 4 0 01-8 0H8a3 3 0 01-3-3v-3c0-1.2.8-2.4 2-3z" fill="url(#lg' + (cls || 'd') + ')"/><path d="M15 12h11l3 6H12z" fill="#fff" opacity=".85"/><circle cx="14" cy="27" r="3.2" fill="#0b1f5b" stroke="#fff" stroke-width="1.4"/><circle cx="34" cy="27" r="3.2" fill="#0b1f5b" stroke="#fff" stroke-width="1.4"/></svg><span><b>DriveShare</b><small>Rent Cars. Share Journeys.</small></span></a>';
  };
  var COLORS = ['#3b82f6,#7c3aed', '#f97316,#e11d48', '#10b981,#0ea5e9', '#8b5cf6,#ec4899', '#f59e0b,#ef4444', '#06b6d4,#3b82f6'];
  A.avatar = function (name, cls) { var i = 0, s = name || '?'; for (var k = 0; k < s.length; k++) i += s.charCodeAt(k); var ini = s.split(' ').map(function (w) { return w[0]; }).slice(0, 2).join('').toUpperCase(); return '<span class="av ' + (cls || '') + '" style="background:linear-gradient(135deg,' + COLORS[i % COLORS.length] + ')" aria-hidden="true">' + A.esc(ini) + '</span>'; };

  /* ---------- toast / modal / drawer ---------- */
  var tt;
  A.toast = function (msg, err) {
    var t = $('#toast'); if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.className = 'toast' + (err ? ' err' : ''); t.innerHTML = ic(err ? 'x' : 'check') + '<span>' + A.esc(msg) + '</span>'; void t.offsetWidth; t.classList.add('on'); clearTimeout(tt); tt = setTimeout(function () { t.classList.remove('on'); }, 2600);
  };
  var lastFocus;
  A.modal = function (o) {
    A.closeModal(); lastFocus = document.activeElement;
    var ov = document.createElement('div'); ov.className = 'ov on'; ov.id = 'modal';
    ov.innerHTML = '<div class="md ' + (o.cls || '') + '" role="dialog" aria-modal="true" aria-label="' + A.esc(o.title || 'Dialog') + '"><div class="mh"><h3>' + (o.title || '') + '</h3><button class="ibtn" data-x aria-label="Close">' + ic('x') + '</button></div><div class="mb">' + (o.body || '') + '</div>' + (o.actions ? '<div class="mf"></div>' : '') + '</div>';
    document.body.appendChild(ov); document.body.style.overflow = 'hidden';
    var mf = $('.mf', ov);
    (o.actions || []).forEach(function (a) { var b = document.createElement('button'); b.className = 'btn ' + (a.cls || ''); b.innerHTML = a.label; b.onclick = function () { if (a.fn) { var r = a.fn(ov); if (r === false) return; } if (!a.keep) A.closeModal(); }; mf.appendChild(b); });
    ov.addEventListener('click', function (e) { if (e.target === ov || e.target.closest('[data-x]')) A.closeModal(); });
    var f = $('input,select,textarea,.btn.pri', ov); if (f) setTimeout(function () { f.focus(); }, 30); else { var c = $('[data-x]', ov); c && c.focus(); }
    if (o.init) o.init(ov); return ov;
  };
  A.closeModal = function () { var m = $('#modal'); if (m) { m.remove(); document.body.style.overflow = ''; if (lastFocus && lastFocus.focus) try { lastFocus.focus(); } catch (e) { } } };
  A.confirm = function (title, text, label, fn, danger) { A.modal({ title: title, body: '<p>' + text + '</p>', actions: [{ label: 'Cancel' }, { label: label, cls: danger ? 'dng' : 'pri', fn: fn }] }); };
  A.drawer = function (title, body, init) {
    A.closeDrawer(); var d = document.createElement('aside'); d.className = 'drw'; d.id = 'drawer'; d.setAttribute('aria-label', title);
    d.innerHTML = '<div class="dh"><h3>' + title + '</h3><button class="ibtn" data-x aria-label="Close">' + ic('x') + '</button></div><div class="db">' + body + '</div>';
    var ov = document.createElement('div'); ov.className = 'ov'; ov.id = 'dov'; ov.style.zIndex = 205; document.body.appendChild(ov); document.body.appendChild(d);
    void d.offsetWidth; d.classList.add('on'); ov.classList.add('on'); ov.style.alignItems = 'stretch';
    function cl() { A.closeDrawer(); } ov.onclick = cl; $('[data-x]', d).onclick = cl; if (init) init(d); return d;
  };
  A.closeDrawer = function () { var d = $('#drawer'), o = $('#dov'); if (d) d.remove(); if (o) o.remove(); };
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { A.closeModal(); A.closeDrawer(); $$('.pop.on,.dp.on,.menu.on,.sug.on').forEach(function (p) { p.classList.remove('on'); }); } });
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.rel')) $$('.pop.on').forEach(function (p) { p.classList.remove('on'); });
    if (!e.target.closest('.menu,.kb')) $$('.menu.on').forEach(function (p) { p.classList.remove('on'); });
    if (!e.target.closest('.dp,.dd,.dpbtn')) $$('.dp.on').forEach(function (p) { p.classList.remove('on'); $$('.dd.open').forEach(function (b) { b.classList.remove('open'); }); });
    if (!e.target.closest('.hsearch')) $$('.sug.on').forEach(function (p) { p.classList.remove('on'); });
  });

  /* ---------- validation helpers ---------- */
  A.fieldErr = function (inp, msg) {
    var f = inp.closest('.fld') || inp.parentNode, e = $('.ferr', f);
    if (!e) { e = document.createElement('div'); e.className = 'ferr'; e.setAttribute('role', 'alert'); f.appendChild(e); }
    inp.classList.toggle('err', !!msg); inp.setAttribute('aria-invalid', msg ? 'true' : 'false'); e.textContent = msg || ''; return !msg;
  };
  A.rules = {
    req: function (v) { return v.trim() ? '' : 'This field is required'; },
    email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Enter a valid email address'; },
    phone: function (v) { return /^[+]?[\d\s()-]{8,16}$/.test(v.trim()) ? '' : 'Enter a valid phone number'; },
    pw: function (v) { return v.length >= 8 ? '' : 'Use at least 8 characters'; },
    card: function (v) { var d = v.replace(/\s/g, ''); return /^\d{15,16}$/.test(d) ? '' : 'Enter a valid card number'; },
    exp: function (v) { var m = v.match(/^(\d{2})\s*\/\s*(\d{2})$/); return m && +m[1] >= 1 && +m[1] <= 12 ? '' : 'Use MM/YY'; },
    cvc: function (v) { return /^\d{3,4}$/.test(v.trim()) ? '' : '3 or 4 digits'; }
  };
  /* validate(form, {name:[rules...]}) */
  A.validate = function (root, spec) {
    var ok = true, first;
    Object.keys(spec).forEach(function (n) {
      var el = $('[name="' + n + '"]', root); if (!el) return; var msg = '';
      for (var i = 0; i < spec[n].length && !msg; i++) { var r = spec[n][i]; msg = typeof r === 'function' ? r(el.value, el) : A.rules[r](el.value); }
      if (!A.fieldErr(el, msg)) { ok = false; first = first || el; }
      el.addEventListener('input', function () { if (el.classList.contains('err')) A.fieldErr(el, ''); }, { once: true });
    });
    if (first) first.focus(); return ok;
  };

  /* ---------- date picker ---------- */
  var MN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  A.datepicker = function (btn, o) {
    var host = btn.parentNode; if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
    var dp = document.createElement('div'); dp.className = 'dp'; dp.setAttribute('role', 'dialog'); host.appendChild(dp);
    var view; btn.classList.add('dpbtn');
    function draw() {
      var cur = o.get(), min = o.min ? o.min() : DS.today, y = view.getFullYear(), m = view.getMonth(), first = new Date(y, m, 1), n = new Date(y, m + 1, 0).getDate(), lead = first.getDay();
      var h = '<div class="hd"><button type="button" data-n="-1" aria-label="Previous month">' + ic('cl', 'sm') + '</button><span>' + MN[m] + ' ' + y + '</span><button type="button" data-n="1" aria-label="Next month">' + ic('cr', 'sm') + '</button></div><div class="gr">' + ['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(function (d) { return '<b>' + d + '</b>'; }).join('');
      for (var i = 0; i < lead; i++) h += '<span></span>';
      for (var d = 1; d <= n; d++) { var dt = new Date(y, m, d), iso = DS.isoD(dt), dis = dt < min || (o.max && dt > o.max()); h += '<button type="button" data-d="' + iso + '" class="' + (iso === DS.isoD(cur) ? 'sel ' : '') + (iso === DS.isoD(DS.today) ? 'td' : '') + '"' + (dis ? ' disabled' : '') + '>' + d + '</button>'; }
      dp.innerHTML = h + '</div>';
    }
    btn.addEventListener('click', function (e) { e.preventDefault(); var wasOn = dp.classList.contains('on'); $$('.dp.on').forEach(function (p) { p.classList.remove('on'); }); $$('.dd.open').forEach(function (b) { b.classList.remove('open'); }); if (wasOn) return; view = new Date(o.get().getFullYear(), o.get().getMonth(), 1); draw(); dp.classList.add('on'); btn.classList.add('open'); });
    dp.addEventListener('click', function (e) { e.stopPropagation(); var n = e.target.closest('[data-n]'), d = e.target.closest('[data-d]'); if (n) { view = new Date(view.getFullYear(), view.getMonth() + (+n.dataset.n), 1); draw(); } if (d) { o.set(DS.parseD(d.dataset.d)); dp.classList.remove('on'); btn.classList.remove('open'); } });
  };
  /* generic "dropdown look" select: <label class="dd"><i/> <span class=v>..</span><select>..</select></label> */
  A.ddSelect = function (dd, onchange) { var s = $('select', dd), v = $('.v', dd); function up() { v.textContent = s.value; } s.addEventListener('change', function () { up(); onchange && onchange(s.value); }); up(); };

  /* ---------- car card ---------- */
  A.carCard = function (c) {
    var o = DS.owner(c.owner), fav = A.isFav(c.id);
    return '<article class="cc" data-id="' + c.id + '"><a class="ph" href="car.html?id=' + c.id + '" aria-label="' + A.esc(c.name) + '"><img src="' + DS.photoOf(c) + '" alt="' + A.esc(c.name) + '" loading="lazy"><span class="av-b ' + (c.badge === 'Available' ? '' : 'am') + '">' + c.badge + '</span><span class="rt">' + A.star() + c.rating + ' (' + c.reviews + ')</span></a>' +
      '<button class="fav ' + (fav ? 'on' : '') + '" data-fav="' + c.id + '" aria-label="Save ' + A.esc(c.name) + '" aria-pressed="' + fav + '">' + ic('heart') + '</button>' +
      '<div class="bd"><div class="tp"><a href="car.html?id=' + c.id + '">' + A.esc(c.name) + '</a><span class="pr"><b>$' + c.price + '</b><small>/ day</small></span></div><div class="spec" style="margin-top:-4px"><span>' + ic('users') + c.seats + ' Seats</span><span>' + ic('bag') + c.bags + ' Bags</span><span>' + ic('auto') + c.trans + '</span></div>' +
      '<div class="ft"><div class="ow">' + A.avatar(o.name, 's') + '<div><b>' + A.esc(o.name) + '</b><small>' + o.tag + '</small></div></div><a class="btn pri sm" href="car.html?id=' + c.id + '">View Details ' + ic('ar', 'sm') + '</a></div></div></article>';
  };
  document.addEventListener('click', function (e) {
    var f = e.target.closest('[data-fav]'); if (!f) return; e.preventDefault();
    var on = A.toggleFav(f.dataset.fav); $$('[data-fav="' + f.dataset.fav + '"]').forEach(function (b) { b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
    A.toast(on ? 'Added to Saved Cars' : 'Removed from Saved Cars'); if (A.onFav) A.onFav();
  });

  /* ---------- search suggestions ---------- */
  A.suggest = function (input, box) {
    var idx = -1;
    function items() { return $$('a', box); }
    function render() {
      var q = input.value.trim().toLowerCase(), h = '';
      if (!q) { box.classList.remove('on'); return; }
      var cars = DS.cars.filter(function (c) { return (c.name + ' ' + c.type).toLowerCase().indexOf(q) > -1; }).slice(0, 5);
      var cities = DS.cities.filter(function (c) { return c.toLowerCase().indexOf(q) > -1; }).slice(0, 2);
      if (cars.length) { h += '<h6>Cars</h6>'; cars.forEach(function (c) { h += '<a href="car.html?id=' + c.id + '">' + ic('car', 'sm') + '<span>' + A.esc(c.full) + '</span><small>$' + c.price + '/day</small></a>'; }); }
      if (cities.length) { h += '<h6>Locations</h6>'; cities.forEach(function (c) { h += '<a href="cars.html?loc=' + encodeURIComponent(c) + '">' + ic('pin', 'sm') + '<span>' + c + '</span></a>'; }); }
      if (!cars.length && !cities.length) h = '<div class="em">No matches for "' + A.esc(input.value) + '"</div>';
      h += '<a href="cars.html?q=' + encodeURIComponent(input.value.trim()) + '">' + ic('search', 'sm') + '<span>See all results for "<b>' + A.esc(input.value.trim()) + '</b>"</span></a>';
      box.innerHTML = h; box.classList.add('on'); idx = -1;
    }
    input.addEventListener('input', render); input.addEventListener('focus', render);
    input.addEventListener('keydown', function (e) {
      var it = items();
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); if (!it.length) return; idx = (idx + (e.key === 'ArrowDown' ? 1 : -1) + it.length) % it.length; it.forEach(function (a, i) { a.classList.toggle('hl', i === idx); }); }
      if (e.key === 'Enter') { e.preventDefault(); if (idx > -1 && it[idx]) location.href = it[idx].getAttribute('href'); else if (input.value.trim()) location.href = 'cars.html?q=' + encodeURIComponent(input.value.trim()); }
    });
  };

  /* ---------- notifications / profile ---------- */
  var NOTIFS = [
    { id: 1, ic: 'check', t: 'Booking confirmed', s: 'BMW X5 2024 - Oct 25 to Oct 28', time: '15 min ago', un: 1 },
    { id: 2, ic: 'msg', t: 'New message from Karim Nabil', s: 'Please bring your driver license and ID.', time: '1 hour ago', un: 1 },
    { id: 3, ic: 'dollar', t: 'Payment received', s: '$160 from Sara Ali', time: '3 hours ago', un: 1 },
    { id: 4, ic: 'star', t: 'New review', s: '5 stars for Range Rover Sport', time: 'Yesterday', un: 0 }
  ];
  function notifState() { return S.get('notifs', NOTIFS); }
  A.notifBtn = function () {
    var n = notifState(), un = n.filter(function (x) { return x.un; }).length;
    return '<div class="rel"><button class="ibtn" data-pop="np" aria-label="Notifications" aria-haspopup="true">' + ic('bell', 'lg') + (un ? '<i class="dot"></i>' : '') + '</button><div class="pop" id="np" style="width:330px"></div></div>';
  };
  function drawNotifs() {
    var p = $('#np'); if (!p) return; var n = notifState();
    p.innerHTML = '<div class="ph">Notifications <button class="lnk" data-markall>Mark all read</button></div>' + n.map(function (x) { return '<div class="nt ' + (x.un ? 'un' : '') + '" data-nid="' + x.id + '">' + ic(x.ic) + '<div><b>' + A.esc(x.t) + '</b><small>' + A.esc(x.s) + ' · ' + x.time + '</small></div></div>'; }).join('') + '<a href="messages.html" style="border-top:1px solid var(--line);justify-content:center;color:var(--blue);font-weight:700">Open messages</a>';
    var dot = $('.dot', p.parentNode); var un = n.filter(function (x) { return x.un; }).length; if (dot) dot.style.display = un ? '' : 'none';
  }
  A.profileBtn = function () {
    var u = A.user() || { name: DS.me.name }, role = A.role();
    return '<div class="rel"><button class="me" data-pop="pp" aria-haspopup="true" aria-label="Account menu">' + A.avatar(u.name) + '<div><b>' + A.esc(u.name) + '</b><small>' + (role === 'owner' ? 'Car Owner' : 'Renter') + '</small></div>' + ic('cd', 'sm') + '</button>' +
      '<div class="pop" id="pp"><a href="account.html?tab=profile">' + ic('user') + 'My Profile</a><a href="bookings.html">' + ic('cal') + 'My Bookings</a><a href="saved.html">' + ic('heart') + 'Saved Cars</a><a href="messages.html">' + ic('msg') + 'Messages</a><a href="account.html?tab=settings">' + ic('gear') + 'Settings</a><hr>' +
      '<button class="mi" data-role>' + ic('refresh') + 'Switch to ' + (role === 'owner' ? 'Renter' : 'Owner') + ' mode</button><button class="mi" data-logout>' + ic('logout') + 'Log out</button></div></div>';
  };
  document.addEventListener('click', function (e) {
    var pb = e.target.closest('[data-pop]');
    if (pb) { var p = $('#' + pb.dataset.pop); var on = p.classList.contains('on'); $$('.pop.on').forEach(function (x) { x.classList.remove('on'); }); if (!on) { if (pb.dataset.pop === 'np') drawNotifs(); p.classList.add('on'); } return; }
    if (e.target.closest('[data-markall]')) { var n = notifState(); n.forEach(function (x) { x.un = 0; }); S.set('notifs', n); drawNotifs(); A.toast('All notifications marked as read'); return; }
    var nt = e.target.closest('[data-nid]'); if (nt) { var n2 = notifState(); n2.forEach(function (x) { if (x.id == nt.dataset.nid) x.un = 0; }); S.set('notifs', n2); drawNotifs(); var t = nt.querySelector('b').textContent; location.href = /message/i.test(t) ? 'messages.html' : /Booking|review/i.test(t) ? 'bookings.html' : 'dashboard.html'; return; }
    if (e.target.closest('[data-role]')) { var r = A.role() === 'owner' ? 'renter' : 'owner'; S.set('role', r); location.href = r === 'owner' ? 'dashboard.html' : 'bookings.html'; return; }
    if (e.target.closest('[data-logout]')) { S.del('user'); A.toast('You have been logged out'); setTimeout(function () { location.href = 'index.html'; }, 700); return; }
    var mo = e.target.closest('[data-modal]'); if (mo) { e.preventDefault(); A.info(mo.dataset.modal); return; }
    var tg = e.target.closest('[data-toast]'); if (tg) { e.preventDefault(); A.toast(tg.dataset.toast); }
  });

  /* ---------- info modals (footer links etc.) ---------- */
  var INFO = {
    help: ['Help Center', '<p>Find quick answers about booking, payments and insurance.</p><div class="acc on"><button type="button" data-acc>How do I book a car? ' + ic('cd', 'sm') + '</button><div class="ab">Pick your dates, choose a car, and send a request. The owner confirms within about an hour.</div></div><div class="acc"><button type="button" data-acc>Can I cancel for free? ' + ic('cd', 'sm') + '</button><div class="ab">Yes - most cars offer free cancellation up to 24 hours before pick-up.</div></div><div class="acc"><button type="button" data-acc>Is insurance included? ' + ic('cd', 'sm') + '</button><div class="ab">Every trip includes basic coverage. You can upgrade to full insurance during checkout.</div></div>'],
    contact: ['Contact us', null], terms: ['Terms of Service', '<p>This is a design preview with fictional content. In a live product, these terms would describe how renters and owners use DriveShare, how bookings are confirmed, and how payments and deposits are handled.</p><p>All names, prices and contact details in this prototype are made up.</p>'],
    privacy: ['Privacy Policy', '<p>This prototype keeps its data only in your browser (for example saved cars and demo bookings). Nothing is sent to any server, and you can clear it any time by clearing site data.</p>'],
    careers: ['Careers', '<p>We are always looking for curious people. Open roles (demo): Product Designer, Frontend Engineer, Trust &amp; Safety Specialist, Community Manager.</p>'],
    press: ['Press', '<p>Press kit and brand assets are available on request: press@driveshare.example</p>'],
    social: ['Follow DriveShare', '<p>Our social channels are not part of this prototype - follow us for updates on launch day.</p>']
  };
  A.info = function (k) {
    var d = INFO[k]; if (!d) return;
    if (k === 'contact') return A.contactModal();
    A.modal({ title: d[0], body: d[1], actions: [{ label: 'Close', cls: 'pri' }] });
  };
  A.contactModal = function (title) {
    A.modal({
      title: title || 'Send us a message', body: '<form id="cf" novalidate class="fgrid" style="gap:12px"><div class="fld" style="grid-column:1/-1"><label>Your name</label><input class="inp" name="n" value="' + A.esc((A.user() || {}).name || '') + '"></div><div class="fld" style="grid-column:1/-1"><label>Email</label><input class="inp" name="e" type="email" value="' + (A.user() ? DS.me.email : '') + '"></div><div class="fld" style="grid-column:1/-1"><label>How can we help?</label><textarea class="inp" name="m"></textarea></div></form>',
      actions: [{ label: 'Cancel' }, { label: 'Send message', cls: 'pri', fn: function (ov) { if (!A.validate(ov, { n: ['req'], e: ['email'], m: [function (v) { return v.trim().length >= 10 ? '' : 'Please write at least 10 characters'; }] })) return false; A.toast('Message sent - we will reply within 24 hours'); } }]
    });
  };
  document.addEventListener('click', function (e) { var b = e.target.closest('[data-acc]'); if (b) { var a = b.parentNode, on = a.classList.contains('on'); $$('.acc.on', a.parentNode).forEach(function (x) { x.classList.remove('on'); }); a.classList.toggle('on', !on); b.setAttribute('aria-expanded', !on); } });

  /* ---------- layout ---------- */
  var NAV = [['index.html', 'Home', 'home'], ['cars.html', 'Browse Cars', 'cars'], ['how-it-works.html', 'How It Works', 'how'], ['owners.html', 'For Owners', 'owners'], ['about.html', 'About', 'about']];
  function publicHeader(cur) {
    var u = A.user(), nav = NAV.map(function (n) { return '<a href="' + n[0] + '"' + (cur === n[2] ? ' class="on" aria-current="page"' : '') + '>' + n[1] + '</a>'; }).join('');
    var act = u ? '<div class="hsearch"><span>' + ic('search') + '</span><input class="inp" id="hs" type="search" placeholder="Search for cars, locations..." aria-label="Search cars" autocomplete="off"><div class="sug" id="hsug"></div></div>' + A.notifBtn() + A.profileBtn()
      : '<div class="rel"><button class="ibtn" id="sbtn" aria-label="Search">' + ic('search', 'lg') + '</button></div><a class="btn out" href="login.html?next=' + encodeURIComponent(location.pathname.split('/').pop() + location.search) + '">Log in</a><a class="btn pri" href="login.html?mode=signup">Sign Up</a>';
    return '<header class="hdr"><div class="wrap">' + A.logo() + '<button class="ibtn burger" id="burger" aria-label="Menu" aria-expanded="false">' + ic('menu', 'lg') + '</button><nav class="nav" id="nav" aria-label="Main">' + nav + '</nav><div class="hact">' + act + '</div></div></header>';
  }
  function footer() {
    return '<footer class="ftr"><div class="wrap"><div class="g"><div>' + A.logo('w') + '<p style="margin-top:14px;max-width:300px;font-size:13px;line-height:1.6">The peer-to-peer car rental marketplace. Rent cars from trusted local owners or list your own and start earning.</p><div class="soc"><button data-modal="social" aria-label="Facebook">' + ic('globe', 'sm') + '</button><button data-modal="social" aria-label="Instagram">' + ic('cam', 'sm') + '</button><button data-modal="social" aria-label="X">' + ic('x', 'sm') + '</button></div></div>' +
      '<div><h5>Company</h5><a href="about.html">About us</a><a href="how-it-works.html">How it works</a><a href="#" data-modal="careers">Careers</a><a href="#" data-modal="press">Press</a></div><div><h5>Support</h5><a href="#" data-modal="help">Help center</a><a href="#" data-modal="contact">Contact us</a><a href="#" data-modal="terms">Terms of service</a><a href="#" data-modal="privacy">Privacy policy</a></div>' +
      '<div><h5>Stay in the loop</h5><p style="font-size:13px">Deals and new cars near you, once a month.</p><form class="nl" id="nl" novalidate><div class="fld" style="flex:1"><input class="inp" name="em" type="email" placeholder="Your email" aria-label="Email address"></div><button class="btn pri" type="submit">Subscribe</button></form></div></div><div class="bt"><span>© 2026 DriveShare. Design preview with fictional data.</span><span><a href="#" data-modal="terms" style="display:inline;padding:0 8px">Terms</a><a href="#" data-modal="privacy" style="display:inline;padding:0 8px">Privacy</a></span></div></div></footer>';
  }
  var SIDE_R = [['index.html', 'home', 'Home'], ['cars.html', 'car', 'Browse Cars'], ['bookings.html', 'cal', 'My Bookings'], ['messages.html', 'msg', 'Messages', 'badge'], ['saved.html', 'heart', 'Saved Cars'], ['account.html?tab=payments', 'card', 'Payment Methods'], ['account.html?tab=verification', 'shield', 'Driver Verification', 'ver'], ['account.html?tab=profile', 'user', 'My Profile'], ['account.html?tab=settings', 'gear', 'Settings']];
  var SIDE_O = [['dashboard.html', 'home', 'Dashboard'], ['cars.html', 'car', 'Browse Cars'], ['bookings.html', 'cal', 'My Bookings'], ['messages.html', 'msg', 'Messages', 'badge'], ['account.html?tab=calendar', 'cal', 'Calendar'], ['account.html?tab=earnings', 'dollar', 'Earnings'], ['account.html?tab=reviews', 'star', 'Reviews'], ['saved.html', 'heart', 'Favorites'], ['account.html?tab=documents', 'doc', 'Documents'], ['account.html?tab=settings', 'gear', 'Settings']];
  A.unread = function () { var t = S.get('threads', null) || DS.threads(); return t.reduce(function (a, x) { return a + (x.unread || 0); }, 0); };
  function sidebar(kind, cur) {
    var list = kind === 'owner' ? SIDE_O : SIDE_R, un = A.unread();
    var h = '<aside class="side" id="side" aria-label="Sidebar">' + (kind === 'owner' ? A.logo('w') : '') + list.map(function (i) {
      var on = (i[0].split('?')[0] === cur.split('?')[0]) && (i[0].indexOf('?') < 0 || cur.indexOf(i[0].split('?')[1]) > -1);
      return '<a href="' + i[0] + '"' + (on ? ' class="on" aria-current="page"' : '') + '>' + ic(i[1]) + i[2] + (i[3] === 'badge' && un ? '<span class="bg">' + un + '</span>' : '') + (i[3] === 'ver' ? '<span class="ver">Verified</span>' : '') + '</a>';
    }).join('') + '<div class="promo"><h4>' + (kind === 'owner' ? 'Upgrade to<br>Earn More' : 'Freedom<br>to Move') + '</h4><p>' + (kind === 'owner' ? 'List more cars and reach more renters.' : 'Discover amazing cars from trusted local owners.') + '</p>' + (kind === 'owner' ? '<button class="btn pri blk" data-addcar>Add New Car ' + ic('ar', 'sm') + '</button>' : '<a class="btn blk" href="cars.html">Explore Cars ' + ic('ar', 'sm') + '</a>') + '</div></aside>';
    return h;
  }
  function topbar(kind) {
    var u = A.user() || { name: DS.me.name };
    return '<div class="top"><button class="ibtn burger" id="sburger" aria-label="Open menu">' + ic('menu', 'lg') + '</button>' + (kind === 'owner' ? '' : A.logo()) + '<div class="hsearch"><span>' + ic('search') + '</span><input class="inp" id="hs" type="search" placeholder="' + (kind === 'owner' ? 'Search for cars, bookings, or users...' : 'Search for cars, locations, or owners...') + '" aria-label="Search" autocomplete="off"><div class="sug" id="hsug"></div></div><div class="loc">' + ic('pin', 'sm') + 'Cairo, Egypt</div>' + A.notifBtn() + A.profileBtn() + '</div>';
  }
  A.layout = function () {
    var b = document.body, kind = b.dataset.layout || 'public', cur = location.pathname.split('/').pop() || 'index.html', full = cur + location.search;
    if (b.dataset.auth && !A.user()) { location.replace('login.html?next=' + encodeURIComponent(full)); return false; }
    var main = $('main'); if (!main) return true;
    if (kind === 'public') { b.insertAdjacentHTML('afterbegin', publicHeader(b.dataset.nav)); main.insertAdjacentHTML('afterend', footer()); }
    else {
      var k = kind === 'rent' ? 'renter' : 'owner', role = A.role();
      if (b.dataset.role === 'auto') k = role === 'owner' ? 'owner' : 'renter';
      var shell = document.createElement('div'); shell.className = 'shell ' + (k === 'renter' ? 'rent' : 'own');
      var right = document.createElement('div'); right.style.minWidth = 0;
      if (k === 'renter') { shell.innerHTML = topbar(k) + sidebar(k, full); shell.appendChild(main); } else { right.innerHTML = topbar(k); right.appendChild(main); shell.innerHTML = sidebar(k, full); shell.appendChild(right); }
      
      b.insertBefore(shell, b.firstChild); b.classList.add('app');
      var sb = $('#sburger'); sb && sb.addEventListener('click', function () { $('#side').classList.toggle('on'); });
      document.addEventListener('click', function (e) { if (!e.target.closest('#side,#sburger')) $('#side') && $('#side').classList.remove('on'); });
    }
    var hs = $('#hs'); if (hs) A.suggest(hs, $('#hsug'));
    var sbtn = $('#sbtn'); if (sbtn) sbtn.addEventListener('click', function () {
      A.modal({ title: 'Search cars', body: '<div class="hsearch" style="width:100%"><span>' + ic('search') + '</span><input class="inp" id="ms" placeholder="Try &quot;BMW&quot;, &quot;SUV&quot; or &quot;Giza&quot;" autocomplete="off" aria-label="Search"><div class="sug" id="msug" style="top:46px"></div></div><div style="height:150px"></div>', init: function () { A.suggest($('#ms'), $('#msug')); } });
    });
    var bg = $('#burger'); if (bg) bg.addEventListener('click', function () { var n = $('#nav'); var on = n.classList.toggle('on'); bg.setAttribute('aria-expanded', on); });
    var nl = $('#nl'); if (nl) nl.addEventListener('submit', function (e) { e.preventDefault(); if (A.validate(nl, { em: ['email'] })) { A.toast('Subscribed - welcome aboard!'); nl.reset(); } });
    return true;
  };
  A.live = function () { /* tiny live chat widget (simulated replies) */
    var el = $('#livech'); if (el) { el.classList.toggle('on'); return; }
    el = document.createElement('div'); el.className = 'livech on'; el.id = 'livech'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Live chat');
    el.innerHTML = '<div class="h">' + A.avatar('Support Team', 's') + '<div><b>DriveShare Support</b><br><small>Usually replies in a minute</small></div><button class="ibtn" data-x aria-label="Close chat">' + ic('x') + '</button></div><div class="msgs" id="lm"><div class="msg">Hi Ahmed! How can we help with your trip today?</div></div><form class="cin" id="lf"><input class="inp" id="li" placeholder="Type your message..." aria-label="Message" autocomplete="off"><button class="btn pri" type="submit" aria-label="Send">' + ic('send') + '</button></form>';
    document.body.appendChild(el);
    $('[data-x]', el).onclick = function () { el.classList.remove('on'); };
    $('#lf', el).onsubmit = function (e) {
      e.preventDefault(); var i = $('#li'), v = i.value.trim(); if (!v) return; var m = $('#lm'); m.insertAdjacentHTML('beforeend', '<div class="msg me">' + A.esc(v) + '</div>'); i.value = ''; m.scrollTop = 1e6;
      var typ = document.createElement('div'); typ.className = 'typing'; typ.textContent = 'Support is typing...'; m.appendChild(typ); m.scrollTop = 1e6;
      setTimeout(function () { typ.remove(); var r = /cancel/i.test(v) ? 'You can cancel from My Bookings > Cancel Booking. Free cancellation applies up to 24 hours before pick-up.' : /pay|price|refund/i.test(v) ? 'Payments are released to the owner after pick-up. Refunds usually take 3-5 business days.' : 'Thanks! A specialist will look into that right away. Is there anything else I can help with?'; m.insertAdjacentHTML('beforeend', '<div class="msg">' + r + '</div>'); m.scrollTop = 1e6; }, 1100);
    };
    setTimeout(function () { $('#li').focus(); }, 50);
  };
  document.addEventListener('click', function (e) { if (e.target.closest('[data-live]')) A.live(); });
  A.countdown = function (el, secs) { /* simulated live countdown */ var end = Date.now() + secs * 1000; function t() { var s = Math.max(0, Math.round((end - Date.now()) / 1000)), d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60), x = s % 60; el.innerHTML = [[d, 'Days'], [h, 'Hours'], [m, 'Minutes'], [x, 'Seconds']].map(function (p) { return '<div><b>' + p[0] + '</b><small>' + p[1] + '</small></div>'; }).join(''); } t(); setInterval(t, 1000); };
  A.ready = function (fn) { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn); else fn(); };
})();
