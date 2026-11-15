/* DriveShare - page logic. Everything runs in the browser with fake data. */
(function () {
  'use strict';
  var A = window.App, $ = A.$, $$ = A.$$, ic = A.ic, S = A.store, esc = A.esc;
  var Pages = {};
  var TIMES = ['08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '06:00 PM', '08:00 PM'];
  function money(n) { return '$' + n.toLocaleString('en-US'); }
  function stars(n) { var h = ''; for (var i = 0; i < 5; i++) h += A.star(i < Math.round(n) ? '' : 'sm" style="opacity:.25'); return '<span class="stars">' + h + '</span>'; }
  function badge(st) { return { pending: ['amber', 'Pending Approval'], confirmed: ['green', 'Confirmed'], active: ['green', 'Confirmed'], completed: ['blue', 'Completed'], cancelled: ['red', 'Cancelled'] }[st]; }
  function selOpts(arr, cur) { return arr.map(function (x) { return '<option' + (x === cur ? ' selected' : '') + '>' + x + '</option>'; }).join(''); }

  /* ---- shared search box (home + cars) ---- */
  function searchBox(label) {
    var s = A.search();
    return '<div class="ff"><span>Location</span><label class="dd">' + ic('pin') + '<span class="v"></span><i class="cv">' + ic('cd', 'sm') + '</i><select name="loc" aria-label="Location">' + selOpts(DS.cities, s.loc) + '</select></label></div>' +
      '<div class="ff"><span>Pick-up Date</span><button type="button" class="dd" id="bf">' + ic('cal') + '<span class="v"></span><i class="cv">' + ic('cd', 'sm') + '</i></button></div>' +
      '<div class="ff"><span>Pick-up Time</span><label class="dd">' + ic('clock') + '<span class="v"></span><i class="cv">' + ic('cd', 'sm') + '</i><select name="pt" aria-label="Pick-up time">' + selOpts(TIMES, s.pt.replace(/^(\d):/, '0$1:')) + '</select></label></div>' +
      '<div class="ff"><span>Drop-off Date</span><button type="button" class="dd" id="bt">' + ic('cal') + '<span class="v"></span><i class="cv">' + ic('cd', 'sm') + '</i></button></div>' +
      '<div class="ff"><span>Drop-off Time</span><label class="dd">' + ic('clock') + '<span class="v"></span><i class="cv">' + ic('cd', 'sm') + '</i><select name="dt" aria-label="Drop-off time">' + selOpts(TIMES, s.dt.replace(/^(\d):/, '0$1:')) + '</select></label></div>' +
      '<button class="btn pri sbtn" type="submit">' + ic('search') + label + ' ' + ic('ar', 'sm') + '</button>';
  }
  function bindSearch(form, onSubmit) {
    var s = A.search(); s.pt = s.pt.replace(/^(\d):/, '0$1:'); s.dt = s.dt.replace(/^(\d):/, '0$1:');
    function showD() { $('#bf .v', form).textContent = DS.fmtD(DS.parseD(s.from)); $('#bt .v', form).textContent = DS.fmtD(DS.parseD(s.to)); }
    $$('.dd select', form).forEach(function (sel) { A.ddSelect(sel.parentNode, function (v) { s[sel.name] = v; }); s[sel.name] = sel.value; });
    showD();
    A.datepicker($('#bf', form), { get: function () { return DS.parseD(s.from); }, set: function (d) { s.from = DS.isoD(d); if (DS.parseD(s.to) <= d) s.to = DS.isoD(new Date(d.getTime() + 864e5)); showD(); } });
    A.datepicker($('#bt', form), { get: function () { return DS.parseD(s.to); }, min: function () { return new Date(DS.parseD(s.from).getTime() + 864e5); }, set: function (d) { s.to = DS.isoD(d); showD(); } });
    form.addEventListener('submit', function (e) { e.preventDefault(); S.set('search', s); onSubmit(s); });
  }

  /* ================= HOME ================= */
  Pages.home = function () {
    var box = $('#sbox'); box.innerHTML = searchBox('Search Cars'); bindSearch(box, function (s) { location.href = 'cars.html?loc=' + encodeURIComponent(s.loc); });
    $$('.tabs .t').forEach(function (t) { t.addEventListener('click', function () { $$('.tabs .t').forEach(function (x) { x.classList.toggle('on', x === t); x.setAttribute('aria-selected', x === t); }); var k = t.dataset.t; $$('.sb').forEach(function (b) { b.hidden = b.id !== 'sb-' + k; }); }); });
    var lf = $('#listform'); lf.addEventListener('submit', function (e) { e.preventDefault(); if (!A.validate(lf, { make: ['req'], price: [function (v) { return +v >= 10 && +v <= 1000 ? '' : 'Enter a price between $10 and $1000'; }] })) return; location.href = 'owners.html?make=' + encodeURIComponent(lf.make.value) + '&price=' + lf.price.value + '#list'; });
    var mf = $('#manage'); mf.addEventListener('submit', function (e) { e.preventDefault(); if (!A.validate(mf, { ref: ['req'], ln: ['req'] })) return; var b = A.bookings().filter(function (x) { return x.id.toLowerCase() === mf.ref.value.trim().toLowerCase(); })[0]; if (b) { A.toast('Booking found'); setTimeout(function () { location.href = 'bookings.html'; }, 600); } else A.fieldErr(mf.ref, 'No booking found. Try DS-2841 (demo)'); });
    var cs = $('#cs'), cur = 'All';
    function draw() { var l = DS.cars.slice(0, 40).filter(function (c) { return cur === 'All' || c.type === cur; }).slice(0, 8); var home = { 1: 'home-1', 2: 'home-2', 3: 'home-3', 4: 'home-4' }; cs.innerHTML = l.map(function (c) { var h = A.carCard(c); return home[c.id] ? h.replace('assets/img/' + c.img + '.jpg', 'assets/img/' + home[c.id] + '.jpg') : h; }).join('') || '<div class="empty">No cars in this category yet</div>'; cs.scrollLeft = 0; }
    A.onFav = function () { };
    $$('#chips .chip').forEach(function (b) { b.addEventListener('click', function () { cur = b.dataset.c; $$('#chips .chip').forEach(function (x) { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', x === b); }); draw(); }); });
    draw(); $('#cnext').addEventListener('click', function () { var m = cs.scrollWidth - cs.clientWidth; if (cs.scrollLeft >= m - 4) cs.scrollLeft = 0; else cs.scrollLeft += cs.clientWidth * .8; });
    $$('.how-tab').forEach(function (b) { b.onclick = function () { location.href = 'how-it-works.html'; }; });
  };

  /* ================= BROWSE ================= */
  Pages.cars = function () {
    var form = $('#sbox'); form.innerHTML = searchBox('Update Search');
    var qs = A.q('q') || '', locp = A.q('loc'); var st = A.search(); if (locp) { st.loc = locp; S.set('search', st); }
    var F = { type: [], trans: [], fuel: [], feat: [], min: 0, max: 5000, sort: 'pop', view: 'grid', page: 1, q: qs };
    bindSearch(form, function (s) { F.page = 1; draw(); A.toast('Search updated'); });
    function count(fn) { return DS.cars.filter(fn).length; }
    var FKEY = ['ac', 'gps', 'bt', 'child', 'unl'];
    $('#filters').innerHTML = '<div class="fh"><h3>Filters</h3><button class="lnk" id="reset">Reset All</button></div><h4>Car Type</h4>' +
      '<label class="chk"><input type="checkbox" data-g="type" value="" checked>' + ic('car') + 'All Types<span class="n">' + DS.cars.length + '</span></label>' +
      DS.types.map(function (t) { return '<label class="chk"><input type="checkbox" data-g="type" value="' + t + '">' + ic('car') + t + '<span class="n">' + count(function (c) { return c.type === t; }) + '</span></label>'; }).join('') +
      '<h4>Price Range (per day)</h4><div class="range"><div class="tr"></div><div class="fl" id="rfl"></div><input type="range" id="rmin" min="0" max="5000" step="50" value="0" aria-label="Minimum price"><input type="range" id="rmax" min="0" max="5000" step="50" value="5000" aria-label="Maximum price"></div><div class="rl"><span id="lmin">EGP 0</span><span id="lmax">EGP 5,000+</span></div>' +
      '<h4>Transmission</h4>' + ['Automatic', 'Manual'].map(function (t) { return '<label class="chk"><input type="checkbox" data-g="trans" value="' + t + '">' + ic('auto') + t + '<span class="n">' + count(function (c) { return c.trans === t; }) + '</span></label>'; }).join('') +
      '<h4>Fuel Type</h4>' + ['Petrol', 'Diesel', 'Electric'].map(function (t) { return '<label class="chk"><input type="checkbox" data-g="fuel" value="' + t + '">' + ic(t === 'Electric' ? 'bolt' : 'fuel') + t + '<span class="n">' + count(function (c) { return c.fuel === t; }) + '</span></label>'; }).join('') +
      '<h4>Features</h4>' + DS.features.map(function (t, i) { return '<label class="chk"><input type="checkbox" data-g="feat" value="' + i + '">' + ic(['snow', 'compass', 'bt', 'users', 'trend'][i]) + t + '<span class="n">' + count(function (c) { return c.feat[i]; }) + '</span></label>'; }).join('');
    function upd() {
      var a = +$('#rmin').value, b = +$('#rmax').value; if (a > b) { var t = a; a = b; b = t; } F.min = a; F.max = b;
      $('#rfl').style.left = (a / 50) + '%'; $('#rfl').style.right = (100 - b / 50) + '%'; $('#lmin').textContent = 'EGP ' + a.toLocaleString(); $('#lmax').textContent = 'EGP ' + b.toLocaleString() + (b >= 5000 ? '+' : '');
    }
    function match(c) {
      var q = F.q.trim().toLowerCase(); var o = DS.owner(c.owner);
      if (q && (c.name + ' ' + c.type + ' ' + c.tag2 + ' ' + c.fuel + ' ' + o.name + ' ' + c.city).toLowerCase().indexOf(q) < 0) return false;
      if (st.loc !== 'Cairo, Egypt' && c.city !== st.loc) return false;
      if (F.type.length && F.type.indexOf(c.type) < 0) return false;
      if (F.trans.length && F.trans.indexOf(c.trans) < 0) return false; if (F.fuel.length && F.fuel.indexOf(c.fuel) < 0) return false;
      for (var i = 0; i < F.feat.length; i++) if (!c.feat[F.feat[i]]) return false;
      var egp = c.price * 50; if (egp < F.min || (F.max < 5000 && egp > F.max)) return false; return true;
    }
    function draw() {
      st = A.search(); if (locp && !form.dataset.touched) { }
      var list = DS.cars.filter(match);
      if (F.sort === 'low') list.sort(function (a, b) { return a.price - b.price; }); else if (F.sort === 'high') list.sort(function (a, b) { return b.price - a.price; }); else if (F.sort === 'rate') list.sort(function (a, b) { return b.rating - a.rating || b.reviews - a.reviews; });
      var per = 8, pages = Math.max(1, Math.ceil(list.length / per)); if (F.page > pages) F.page = pages;
      var from = (F.page - 1) * per, slice = list.slice(from, from + per), df = DS.parseD(st.from), dt = DS.parseD(st.to);
      var short = function (d) { return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); };
      $('#rcount').textContent = list.length + ' Cars Available'; $('#rsub').textContent = 'Showing cars in ' + st.loc + ' • ' + short(df) + ' - ' + short(dt) + (F.q ? ' • "' + F.q + '"' : '');
      var res = $('#results');
      if (!list.length) { res.innerHTML = '<div class="card empty">' + ic('search', 'lg') + '<h3>No cars match your search</h3><p>Try removing a filter or searching for something else.</p><button class="btn pri" id="clr" style="margin-top:16px">Clear all filters</button></div>'; $('#pager').innerHTML = ''; $('#clr').onclick = reset; return; }
      if (F.view === 'map') { var pins = slice.map(function (c, i) { var x = 12 + (i * 37 + c.id * 13) % 76, y = 18 + (i * 29 + c.id * 7) % 62; return '<a class="pin" href="car.html?id=' + c.id + '" style="left:' + x + '%;top:' + y + '%" title="' + esc(c.name) + '">$' + c.price + '</a>'; }).join(''); res.innerHTML = '<div class="mapv" role="img" aria-label="Map of results">' + pins + '</div>'; }
      else res.innerHTML = '<div class="cgrid">' + slice.map(A.carCard).join('') + '</div>';
      var pg = '<span>Showing ' + (from + 1) + ' - ' + Math.min(from + per, list.length) + ' of ' + list.length + ' cars</span><div class="sp"><button data-p="' + (F.page - 1) + '" ' + (F.page < 2 ? 'disabled' : '') + ' aria-label="Previous page">' + ic('cl', 'sm') + '</button>';
      var s0 = Math.max(1, Math.min(F.page - 2, pages - 4)); for (var p = s0; p <= Math.min(pages, s0 + 4); p++) pg += '<button data-p="' + p + '" class="' + (p === F.page ? 'on' : '') + '"' + (p === F.page ? ' aria-current="page"' : '') + '>' + p + '</button>';
      $('#pager').innerHTML = pg + '<button data-p="' + (F.page + 1) + '" ' + (F.page >= pages ? 'disabled' : '') + ' aria-label="Next page">' + ic('cr', 'sm') + '</button></div>';
    }
    function reset() { F.type = []; F.trans = []; F.fuel = []; F.feat = []; F.q = ''; F.page = 1; $$('#filters input[type=checkbox]').forEach(function (c) { c.checked = c.dataset.g === 'type' && c.value === ''; }); $('#rmin').value = 0; $('#rmax').value = 5000; upd(); $('#sortsel').value = 'pop'; F.sort = 'pop'; if (history.replaceState) history.replaceState(null, '', 'cars.html'); st.loc = 'Cairo, Egypt'; S.set('search', st); draw(); }
    $('#filters').addEventListener('change', function (e) {
      var c = e.target; if (c.dataset.g) { var g = c.dataset.g, v = g === 'feat' ? +c.value : c.value;
        if (g === 'type' && c.value === '') { F.type = []; $$('#filters [data-g=type]').forEach(function (x) { x.checked = x.value === ''; }); }
        else { var arr = F[g], i = arr.indexOf(v); if (c.checked && i < 0) arr.push(v); if (!c.checked && i > -1) arr.splice(i, 1); if (g === 'type') $('#filters [data-g=type][value=""]').checked = F.type.length === 0; }
        F.page = 1; draw(); }
    });
    $('#filters').addEventListener('input', function (e) { if (e.target.type === 'range') { upd(); F.page = 1; draw(); } });
    $('#reset').onclick = reset; upd();
    $('#sortsel').onchange = function () { F.sort = this.value; F.page = 1; draw(); };
    $$('#vt button').forEach(function (b) { b.onclick = function () { F.view = b.dataset.v; $$('#vt button').forEach(function (x) { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', x === b); }); draw(); }; });
    $('#pager').addEventListener('click', function (e) { var b = e.target.closest('[data-p]'); if (b && !b.disabled) { F.page = +b.dataset.p; draw(); window.scrollTo({ top: $('.layout').offsetTop - 80, behavior: 'smooth' }); } });
    A.onFav = function () { };
    draw();
  };

  /* ================= DETAIL ================= */
  Pages.car = function () {
    var c = DS.car(A.q('id') || 3) || DS.car(3), o = DS.owner(c.owner), s = A.search();
    document.title = c.full + ' - DriveShare';
    $('#crumb').innerHTML = '<a href="index.html" aria-label="Home">' + ic('home', 'sm') + '</a>' + ic('cr') + '<a href="cars.html">Browse Cars</a>' + ic('cr') + '<a href="cars.html">' + (c.type || 'Sports') + '</a>' + ic('cr') + '<a href="cars.html?q=' + encodeURIComponent(c.name.split(' ')[0]) + '">' + c.name.split(' ')[0] + '</a>' + ic('cr') + '<span>' + esc(c.full) + '</span>';
    var imgs = c.id === 3 ? ['assets/img/bmw-large.jpg', 'assets/img/bmw-b.jpg', 'assets/img/thumb-2.jpg', 'assets/img/thumb-3.jpg', 'assets/img/thumb-4.jpg'] : [DS.photoOf(c), 'assets/img/thumb-1.jpg', 'assets/img/thumb-2.jpg', 'assets/img/thumb-3.jpg', 'assets/img/thumb-4.jpg'];
    var gi = 0, TOTAL = 12;
    $('#gal').innerHTML = '<div class="gwrap"><div class="gal"><img id="gimg" alt="' + esc(c.full) + ' photo"><span class="vb">' + ic('shield', 'sm') + 'Verified Owner</span><button class="ar l" id="gp" aria-label="Previous photo">' + ic('cl') + '</button><button class="ar r" id="gn" aria-label="Next photo">' + ic('cr') + '</button><span class="ct" id="gc"></span><button class="ex" id="gx" aria-label="Open full screen">' + ic('expand', 'sm') + '</button></div><div class="gth" id="gth">' + imgs.map(function (u, i) { return '<button data-i="' + i + '" aria-label="Photo ' + (i + 1) + '"><img src="' + u + '" alt="">' + (i === 4 ? '<span class="more">+8 Photos</span>' : '') + '</button>'; }).join('') + '</div></div>';
    function showG() { $('#gimg').src = imgs[gi % imgs.length]; $('#gc').textContent = (gi + 1) + ' / ' + TOTAL; $$('#gth button').forEach(function (b, i) { b.classList.toggle('on', i === gi % imgs.length); }); }
    $('#gp').onclick = function () { gi = (gi + TOTAL - 1) % TOTAL; showG(); }; $('#gn').onclick = function () { gi = (gi + 1) % TOTAL; showG(); };
    $('#gth').onclick = function (e) { var b = e.target.closest('button'); if (b) { gi = +b.dataset.i; showG(); } };
    $('#gx').onclick = function () { A.modal({ title: esc(c.full), cls: 'lg', body: '<img class="big" src="' + imgs[gi % imgs.length] + '" alt="">', actions: [{ label: 'Close', cls: 'pri' }] }); };
    showG();
    var fav = A.isFav(c.id);
    $('#dinfo').innerHTML = '<h1>' + esc(c.full) + '<span class="ib"><button class="rb ' + (fav ? 'on' : '') + '" id="dfav" aria-label="Save car" aria-pressed="' + fav + '">' + ic('heart') + '</button><button class="rb" id="dshare" aria-label="Share">' + ic('share') + '</button></span></h1>' +
      '<div class="meta"><span class="st">' + A.star() + c.rating + '</span><span>(' + c.reviews + ' reviews)</span><span style="display:flex;gap:5px;align-items:center">' + ic('pin', 'sm') + esc(c.city) + '</span></div>' +
      '<div class="cp"><span>' + ic('car', 'sm') + (c.type || 'Sports') + '</span><span>' + ic('users', 'sm') + c.seats + ' Seats</span><span>' + ic('bag', 'sm') + c.bags + ' Bags</span><span>' + ic('auto', 'sm') + c.trans + '</span><span>' + ic('fuel', 'sm') + c.fuel + '</span></div>' +
      '<p class="desc">The ' + esc(c.full) + ' delivers the perfect blend of luxury, performance, and advanced technology. Ideal for both city drives and long trips, this ' + (c.type || 'car') + ' offers unmatched comfort, safety, and style.</p>' +
      '<div class="hl4"><div>' + ic('shield') + 'Well Maintained</div><div>' + ic('shield') + 'Clean &amp; Sanitized</div><div>' + ic('doc') + 'Full Insurance</div><div>' + ic('phone') + '24/7 Support</div></div>' +
      '<div class="card ownc">' + A.avatar(o.name, 'l') + '<div><b style="font-size:15px">' + esc(o.name) + '</b> <span class="pill gray" style="margin-left:6px">' + ic('award', 'sm') + o.tag + '</span><div style="color:var(--muted);font-size:12px;margin-top:3px">Member since ' + o.since + '</div></div><button class="btn out sm" id="cown">' + ic('msg', 'sm') + 'Contact Owner</button><div class="stats"><span><b>' + A.star('sm') + ' ' + o.rating + '</b>' + c.reviews + ' reviews</span><span><b>' + o.cars + '</b>Cars listed</span><span><b>' + o.resp + '%</b>Response rate</span><span><b>&lt; 1 hour</b>Avg. response</span></div></div>';
    $('#dfav').onclick = function () { var on = A.toggleFav(c.id); this.classList.toggle('on', on); this.setAttribute('aria-pressed', on); A.toast(on ? 'Added to Saved Cars' : 'Removed from Saved Cars'); };
    $('#dshare').onclick = function () { var u = location.href; try { navigator.clipboard.writeText(u).then(function () { A.toast('Link copied to clipboard'); }, function () { A.toast('Link: ' + u); }); } catch (e) { A.toast('Link: ' + u); } };
    $('#cown').onclick = function () { msgModal(o, c.full); };
    // tabs
    var specs = [['Brand', c.name.split(' ')[0]], ['Model', c.name.split(' ').slice(1).join(' ') || c.name], ['Year', c.year], ['Body Type', c.type || 'Sports'], ['Transmission', c.trans], ['Fuel Type', c.fuel], ['Seats', c.seats], ['Bags', c.bags], ['Mileage Limit', '250 km/day'], ['Color', ['Black', 'White', 'Silver', 'Blue', 'Red'][c.id % 5]]];
    var ico = ['tag', 'car', 'cal', 'car', 'auto', 'fuel', 'users', 'bag', 'compass', 'info'];
    var kf = [['compass', 'Navigation', 'GPS'], ['bt', 'Bluetooth', 'Connectivity'], ['cam', 'Rear Camera', '360° View'], ['snow', 'Air Conditioning', 'Dual Zone'], ['music', 'Premium Sound', 'Harman Kardon'], ['car', 'Sunroof', 'Panoramic'], ['users', 'Leather Seats', 'Premium'], ['shield', 'Safety', 'ABS, Airbags']];
    var tabs = ['Overview', 'Specifications', 'Features', 'Location', 'Reviews (' + c.reviews + ')', 'Rental Rules'];
    var specH = '<h3>Specifications</h3><div class="spt">' + specs.map(function (x, i) { return '<div>' + ic(ico[i], 'sm') + x[0] + '<b>' + x[1] + '</b></div>'; }).join('') + '</div>';
    var kfH = '<h3>Key Features</h3><div class="kf">' + kf.map(function (x) { return '<div><i>' + ic(x[0]) + '</i>' + x[1] + '<br>' + x[2] + '</div>'; }).join('') + '</div>';
    var locH = '<h3>Location <a class="lnk" style="float:right;font-size:12px" href="#" id="vmap">View on Map</a></h3><div class="locmap"><img src="assets/img/map.jpg" alt="Map showing the pick-up area"></div>';
    var revs = DS.reviews.slice();
    function revH() { return '<h3>Reviews (' + (c.reviews + (revs.length - 4)) + ')</h3><div class="meta" style="margin:-6px 0 8px"><span class="st">' + A.star() + c.rating + '</span><span>average rating</span></div>' + revs.map(function (r) { return '<div class="rev"><div class="h">' + A.avatar(r.who, 's') + '<b>' + esc(r.who) + '</b>' + stars(r.rate) + '<small>' + r.when + '</small></div><p>' + esc(r.text) + '</p></div>'; }).join('') + '<button class="btn out sm" id="wr" style="margin-top:10px">Write a review</button>'; }
    var rules = [['Driver requirements', 'Drivers must be 21+ with a valid license held for at least 2 years.'], ['Fuel policy', 'Return the car with the same fuel level as at pick-up.'], ['Mileage', '250 km per day included. Extra kilometers cost $0.20/km.'], ['Cancellation', 'Free cancellation up to 24 hours before pick-up.'], ['Smoking & pets', 'No smoking. Pets only with the owner approval.']];
    function panel(i) {
      var h = '';
      if (i === 0) h = '<div class="tp3 card" style="padding:18px"><div>' + specH + '</div><div>' + kfH + '</div><div>' + locH + '</div></div>';
      if (i === 1) h = '<div class="card pnl" style="padding:20px">' + specH + '</div>';
      if (i === 2) h = '<div class="card pnl" style="padding:20px">' + kfH + '<div class="cp" style="margin-top:18px">' + DS.features.map(function (f, k) { return c.feat[k] ? '<span>' + ic('check', 'sm') + f + '</span>' : ''; }).join('') + '</div></div>';
      if (i === 3) h = '<div class="card pnl" style="padding:20px;max-width:520px">' + locH + '</div>';
      if (i === 4) h = '<div class="card pnl" style="padding:20px">' + revH() + '</div>';
      if (i === 5) h = '<div class="pnl">' + rules.map(function (r, k) { return '<div class="acc ' + (k === 0 ? 'on' : '') + '"><button type="button" data-acc>' + r[0] + ic('cd', 'sm') + '</button><div class="ab">' + r[1] + '</div></div>'; }).join('') + '</div>';
      $('#dpanel').innerHTML = h; var v = $('#vmap'); if (v) v.onclick = function (e) { e.preventDefault(); A.modal({ title: 'Pick-up area', body: '<img class="big" src="assets/img/map.jpg" alt="Map"><p>The exact address is shared after the owner confirms your booking.</p>', actions: [{ label: 'Close', cls: 'pri' }] }); };
      var wr = $('#wr'); if (wr) wr.onclick = function () { reviewModal(function (r) { revs.unshift({ who: 'Ahmed S.', rate: r.rate, when: 'Just now', text: r.text }); panel(4); }); };
    }
    $('#dtabs').innerHTML = tabs.map(function (t, i) { return '<button role="tab" data-t="' + i + '" class="' + (i ? '' : 'on') + '" aria-selected="' + (!i) + '">' + t + '</button>'; }).join('');
    $('#dtabs').onclick = function (e) { var b = e.target.closest('button'); if (!b) return; $$('#dtabs button').forEach(function (x) { x.classList.toggle('on', x === b); x.setAttribute('aria-selected', x === b); }); panel(+b.dataset.t); };
    panel(0);
    var sim = DS.similar(c).slice(0, 5); if (sim.length < 5) sim = sim.concat(DS.cars.filter(function (x) { return x.id !== c.id && sim.indexOf(x) < 0; }).slice(0, 5 - sim.length));
    $('#sim').innerHTML = sim.map(function (x) { return '<article class="cc" style="cursor:pointer" data-go="car.html?id=' + x.id + '"><a class="ph" href="car.html?id=' + x.id + '" aria-label="' + esc(x.name) + '"><img src="' + DS.photoOf(x) + '" alt="' + esc(x.name) + '" loading="lazy"></a><button class="fav ' + (A.isFav(x.id) ? 'on' : '') + '" data-fav="' + x.id + '" aria-label="Save">' + ic('heart') + '</button><div class="bd"><div class="tp"><a href="car.html?id=' + x.id + '">' + esc(x.full) + '</a></div><div class="tp"><span><b style="font-size:14px">$' + x.price + '</b><small> / day</small></span><span class="st" style="display:flex;align-items:center;gap:4px;font-size:12px">' + A.star('sm') + x.rating + ' (' + x.reviews + ')</span></div></div></article>'; }).join('');
    // booking card
    var bs = { from: s.from, to: s.to, pt: s.pt.replace(/^(\d):/, '0$1:'), dt: s.dt.replace(/^(\d):/, '0$1:'), loc: s.loc };
    $('#bcard').innerHTML = '<div class="pr"><b>$' + c.price + '</b><span>/ day</span><span class="pill green" style="background:#10b981;color:#fff">' + (c.badge === 'Available' ? 'Available' : 'Almost booked') + '</span></div>' +
      '<span class="lbl">Pick-up Location</span><label class="dd">' + ic('pin') + '<span class="v"></span><i class="cv">' + ic('cd', 'sm') + '</i><select name="loc" aria-label="Pick-up location">' + selOpts(DS.cities, bs.loc) + '</select></label>' +
      '<div class="two"><div><span class="lbl">Pick-up Date</span><button type="button" class="dd" id="bf">' + ic('cal') + '<span class="v"></span>' + ic('cd', 'sm') + '</button></div><div><span class="lbl">Pick-up Time</span><label class="dd">' + ic('clock') + '<span class="v"></span><select name="pt" aria-label="Pick-up time">' + selOpts(TIMES, bs.pt) + '</select></label></div>' +
      '<div><span class="lbl">Drop-off Date</span><button type="button" class="dd" id="bt">' + ic('cal') + '<span class="v"></span>' + ic('cd', 'sm') + '</button></div><div><span class="lbl">Drop-off Time</span><label class="dd">' + ic('clock') + '<span class="v"></span><select name="dt" aria-label="Drop-off time">' + selOpts(TIMES, bs.dt) + '</select></label></div></div>' +
      '<div class="sum" id="bsum"></div><button class="btn pri lg blk" id="book" style="background:linear-gradient(180deg,#2b7bff,#0a5cff)">' + ic('cal') + ' Request to Book ' + ic('ar', 'sm') + '</button><small class="no">You won\'t be charged yet. The owner will review your request.</small>';
    function sum() { var d = DS.days(DS.parseD(bs.from), DS.parseD(bs.to)), sub = d * c.price; $('#bf .v').textContent = DS.fmtD(DS.parseD(bs.from)); $('#bt .v').textContent = DS.fmtD(DS.parseD(bs.to)); $('#bsum').innerHTML = '<div><span>$' + c.price + ' x ' + d + ' day' + (d > 1 ? 's' : '') + '</span><b>' + money(sub) + '</b></div><div><span>Service fee ' + ic('info', 'sm') + '</span><b>$' + DS.FEE + '</b></div><div class="tot"><span>Total Price</span><b>' + money(sub + DS.FEE) + '</b></div>'; }
    $$('#bcard select').forEach(function (sel) { A.ddSelect(sel.parentNode, function (v) { bs[sel.name] = v; }); bs[sel.name] = sel.value; });
    A.datepicker($('#bf'), { get: function () { return DS.parseD(bs.from); }, set: function (d) { bs.from = DS.isoD(d); if (DS.parseD(bs.to) <= d) bs.to = DS.isoD(new Date(d.getTime() + 864e5)); sum(); } });
    A.datepicker($('#bt'), { get: function () { return DS.parseD(bs.to); }, min: function () { return new Date(DS.parseD(bs.from).getTime() + 864e5); }, set: function (d) { bs.to = DS.isoD(d); sum(); } });
    sum();
    $('#book').onclick = function () { var n = A.search(); n.from = bs.from; n.to = bs.to; n.pt = bs.pt; n.dt = bs.dt; n.loc = bs.loc; S.set('search', n); location.href = 'checkout.html?id=' + c.id; };
    document.addEventListener('click', function (e) { var g = e.target.closest('[data-go]'); if (g && !e.target.closest('a,button')) location.href = g.dataset.go; });
  };
  function reviewModal(done) {
    var rate = 5;
    A.modal({ title: 'Write a review', body: '<div class="fld"><label>Rating</label><div id="rs" style="display:flex;gap:4px;font-size:0"></div></div><div class="fld"><label>Your review</label><textarea class="inp" name="t" placeholder="Tell others about your trip..."></textarea></div>',
      init: function (ov) { var rs = $('#rs', ov); function d() { rs.innerHTML = [1, 2, 3, 4, 5].map(function (i) { return '<button type="button" class="ibtn" data-r="' + i + '" aria-label="' + i + ' stars" style="color:' + (i <= rate ? '#f59e0b' : '#d3dbec') + '">' + A.star('lg') + '</button>'; }).join(''); } d(); rs.onclick = function (e) { var b = e.target.closest('[data-r]'); if (b) { rate = +b.dataset.r; d(); } }; },
      actions: [{ label: 'Cancel' }, { label: 'Submit review', cls: 'pri', fn: function (ov) { var t = $('[name=t]', ov); if (!A.validate(ov, { t: [function (v) { return v.trim().length >= 5 ? '' : 'Please write a few words'; }] })) return false; A.toast('Thanks for your review!'); done({ rate: rate, text: t.value.trim() }); } }] });
  }
  function msgModal(o, car) {
    A.modal({ title: 'Message ' + esc(o.name), body: '<p style="color:var(--muted);margin:0">About: ' + esc(car || 'your trip') + '</p><div class="fld"><label>Message</label><textarea class="inp" name="m" placeholder="Hi ' + esc(o.name.split(' ')[0]) + ', is the car available...?"></textarea></div>', actions: [{ label: 'Cancel' }, { label: 'Send message ' + ic('send', 'sm'), cls: 'pri', fn: function (ov) {
      if (!A.validate(ov, { m: [function (v) { return v.trim().length >= 3 ? '' : 'Write your message'; }] })) return false;
      if (!A.user()) { A.closeModal(); location.href = 'login.html?next=' + encodeURIComponent(location.pathname.split('/').pop() + location.search); return false; }
      var ts = S.get('threads', null) || DS.threads(), t = ts.filter(function (x) { return x.ownerId === o.id; })[0];
      if (!t) { t = { id: 't' + Date.now(), ownerId: o.id, car: car || 'General', unread: 0, msgs: [] }; ts.unshift(t); }
      t.msgs.push({ me: 1, t: $('[name=m]', ov).value.trim(), at: 'Just now' }); S.set('threads', ts); A.toast('Message sent to ' + o.name);
    } }] });
  }
  A.msgModal = msgModal; A.reviewModal = reviewModal;

  /* ================= CHECKOUT ================= */
  Pages.checkout = function () {
    var c = DS.car(A.q('id') || 3) || DS.car(3), s = A.search(), step = 1, o = DS.owner(c.owner), extras = { ins: false, gps: false, child: false }, XP = { ins: 12, gps: 5, child: 4 };
    var d = { name: DS.me.name, phone: DS.me.phone, lic: '', card: '', exp: '', cvc: '', note: '' };
    function days() { return DS.days(DS.parseD(s.from), DS.parseD(s.to)); }
    function total() { var n = days(), t = n * c.price + DS.FEE; Object.keys(extras).forEach(function (k) { if (extras[k]) t += XP[k] * n; }); return t; }
    function summary() {
      var n = days(), h = '<div class="it"><img src="' + DS.photoOf(c) + '" alt=""><div><b>' + esc(c.full) + '</b><div style="color:var(--muted);font-size:12px">' + esc(o.name) + '</div><div style="font-size:12px;margin-top:4px">' + A.star('sm') + ' ' + c.rating + '</div></div></div><div class="row"><span>' + DS.fmtD(DS.parseD(s.from)) + ' → ' + DS.fmtD(DS.parseD(s.to)) + '</span></div><div class="row"><span>$' + c.price + ' x ' + n + ' day' + (n > 1 ? 's' : '') + '</span><b>' + money(c.price * n) + '</b></div>';
      Object.keys(extras).forEach(function (k) { if (extras[k]) h += '<div class="row"><span>' + { ins: 'Full insurance', gps: 'GPS device', child: 'Child seat' }[k] + '</span><b>' + money(XP[k] * n) + '</b></div>'; });
      return h + '<div class="row"><span>Service fee</span><b>$' + DS.FEE + '</b></div><div class="row tot"><span>Total</span><span>' + money(total()) + '</span></div><p style="font-size:11.5px;color:var(--muted);margin-top:8px">You won\'t be charged until the owner accepts your request. Free cancellation up to 24 hours before pick-up.</p>';
    }
    function stepper() { return '<div class="stp">' + ['Trip details', 'Driver & payment', 'Review'].map(function (t, i) { return '<div class="' + (i + 1 === step ? 'on' : i + 1 < step ? 'dn' : '') + '"><i>' + (i + 1 < step ? '✓' : i + 1) + '</i><span>' + t + '</span></div>'; }).join('') + '</div>'; }
    function draw() {
      var h = stepper(), m = $('#ckmain');
      if (step === 1) h += '<div class="card" style="padding:22px"><h2 style="font-size:20px;margin-bottom:14px">Trip details</h2><div class="fgrid"><div class="fld"><span class="lbl">Pick-up</span><div class="card" style="padding:12px;box-shadow:none">' + ic('cal', 'sm') + ' ' + DS.fmtD(DS.parseD(s.from)) + ' · ' + s.pt + '<br><small style="color:var(--muted)">' + esc(s.loc) + '</small></div></div><div class="fld"><span class="lbl">Drop-off</span><div class="card" style="padding:12px;box-shadow:none">' + ic('cal', 'sm') + ' ' + DS.fmtD(DS.parseD(s.to)) + ' · ' + s.dt + '<br><small style="color:var(--muted)">' + esc(s.loc) + '</small></div></div></div><h3 style="margin:22px 0 12px;font-size:16px">Add extras</h3><div style="display:flex;flex-direction:column;gap:10px">' +
        [['ins', 'Full insurance', 'Zero deductible, roadside assistance'], ['gps', 'GPS device', 'Offline maps for all Egypt'], ['child', 'Child seat', 'Suitable for ages 1-4']].map(function (x) { return '<label class="opt ' + (extras[x[0]] ? 'on' : '') + '"><span class="chk"><input type="checkbox" data-x="' + x[0] + '"' + (extras[x[0]] ? ' checked' : '') + '></span><span><b>' + x[1] + '</b><small>' + x[2] + '</small></span><span class="pr">+$' + XP[x[0]] + '/day</span></label>'; }).join('') + '</div><div style="display:flex;justify-content:space-between;margin-top:22px"><a class="btn" href="car.html?id=' + c.id + '">' + ic('cl', 'sm') + ' Back to car</a><button class="btn pri" data-next>Continue ' + ic('ar', 'sm') + '</button></div></div>';
      if (step === 2) h += '<form class="card" id="f2" novalidate style="padding:22px"><h2 style="font-size:20px;margin-bottom:14px">Driver details</h2><div class="fgrid"><div class="fld"><label>Full name</label><input class="inp" name="name" value="' + esc(d.name) + '" autocomplete="name"></div><div class="fld"><label>Phone</label><input class="inp" name="phone" value="' + esc(d.phone) + '" autocomplete="tel"></div><div class="fld" style="grid-column:1/-1"><label>Driver license number</label><input class="inp" name="lic" value="' + esc(d.lic) + '" placeholder="e.g. 2918 5543 12"></div></div><h2 style="font-size:20px;margin:24px 0 6px">Payment</h2><p style="color:var(--muted);font-size:12.5px;margin-bottom:12px">' + ic('lock', 'sm') + ' Demo only - card details are never stored or sent anywhere.</p><div class="fgrid"><div class="fld" style="grid-column:1/-1"><label>Card number</label><input class="inp" name="card" inputmode="numeric" value="' + esc(d.card) + '" placeholder="4242 4242 4242 4242" autocomplete="off"></div><div class="fld"><label>Expiry (MM/YY)</label><input class="inp" name="exp" value="' + esc(d.exp) + '" placeholder="09/28" autocomplete="off"></div><div class="fld"><label>CVC</label><input class="inp" name="cvc" inputmode="numeric" value="' + esc(d.cvc) + '" placeholder="123" autocomplete="off"></div><div class="fld" style="grid-column:1/-1"><label>Message to the owner (optional)</label><textarea class="inp" name="note" placeholder="Anything the owner should know?">' + esc(d.note) + '</textarea></div></div><div style="display:flex;justify-content:space-between;margin-top:22px"><button type="button" class="btn" data-back>' + ic('cl', 'sm') + ' Back</button><button class="btn pri" type="submit">Review booking ' + ic('ar', 'sm') + '</button></div></form>';
      if (step === 3) h += '<div class="card" style="padding:22px"><h2 style="font-size:20px;margin-bottom:14px">Review &amp; confirm</h2><div class="setrow"><div><b>Driver</b><small>' + esc(d.name) + ' · ' + esc(d.phone) + '</small></div><button class="btn sm" data-edit>Edit</button></div><div class="setrow"><div><b>Payment</b><small>Card ending in ' + esc(d.card.replace(/\s/g, '').slice(-4)) + '</small></div><button class="btn sm" data-edit>Edit</button></div><div class="setrow"><div><b>Trip</b><small>' + DS.fmtD(DS.parseD(s.from)) + ' - ' + DS.fmtD(DS.parseD(s.to)) + ' · ' + esc(s.loc) + '</small></div></div><label class="chk" style="margin-top:16px"><input type="checkbox" id="agree"><span>I agree to the <a href="#" data-modal="terms" style="color:var(--blue);text-decoration:underline">Terms of Service</a> and the cancellation policy.</span></label><div class="ferr" id="agerr"></div><div style="display:flex;justify-content:space-between;margin-top:22px"><button class="btn" data-back>' + ic('cl', 'sm') + ' Back</button><button class="btn pri lg" id="confirm">Send booking request</button></div></div>';
      m.innerHTML = h; $('#sumc').innerHTML = '<h3 style="font-size:16px;margin-bottom:14px">Booking summary</h3>' + summary();
    }
    $('#ckmain').addEventListener('click', function (e) {
      if (e.target.closest('[data-next]')) { step = 2; draw(); window.scrollTo(0, 0); }
      if (e.target.closest('[data-back]')) { if (step === 2) { var f = $('#f2'); if (f) $$('input,textarea', f).forEach(function (i) { d[i.name] = i.value; }); } step--; draw(); }
      if (e.target.closest('[data-edit]')) { step = 2; draw(); }
      if (e.target.closest('#confirm')) {
        if (!$('#agree').checked) { $('#agerr').textContent = 'Please accept the terms to continue'; return; }
        var id = 'DS-' + (2900 + Math.floor(Math.random() * 99)), b = A.bookings(); var n = days();
        b.unshift({ id: id, carId: c.id, from: s.from, to: s.to, status: 'pending', total: total(), price: c.price * n, ownerId: c.owner }); S.set('bookings', b);
        var nt = S.get('notifs', null); if (nt) { nt.unshift({ id: Date.now(), ic: 'cal', t: 'Request sent', s: c.full + ' - waiting for owner', time: 'Just now', un: 1 }); S.set('notifs', nt); }
        $('#ckmain').innerHTML = '<div class="card succ"><div class="ck">' + ic('check', 'lg') + '</div><h2>Request sent!</h2><p style="color:var(--muted);margin:8px 0 18px">Booking <b>' + id + '</b> for ' + esc(c.full) + ' is waiting for ' + esc(o.name) + ' to accept. You will be notified shortly.</p><div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap"><a class="btn pri" href="bookings.html">View my bookings</a><a class="btn" href="cars.html">Keep browsing</a></div></div>'; $('.stp') && 0; window.scrollTo(0, 0);
      }
    });
    $('#ckmain').addEventListener('change', function (e) { var x = e.target.dataset.x; if (x) { extras[x] = e.target.checked; draw(); } });
    $('#ckmain').addEventListener('submit', function (e) {
      e.preventDefault(); var f = e.target; if (!A.validate(f, { name: ['req'], phone: ['phone'], lic: ['req'], card: ['card'], exp: ['exp'], cvc: ['cvc'] })) return;
      $$('input,textarea', f).forEach(function (i) { d[i.name] = i.value; }); step = 3; draw(); window.scrollTo(0, 0);
    });
    draw();
  };

  /* ================= BOOKINGS (renter) ================= */
  Pages.bookings = function () {
    var tab = 'up', bk;
    function load() { bk = A.bookings(); }
    function save() { S.set('bookings', bk); }
    function car(b) { return DS.car(b.carId); }
    var photoMap = { 3: 'bmw-b', 4: 'tesla-b', 6: 'range-b' };
    function img(b) { var c = car(b); return photoMap[c.id] ? 'assets/img/' + photoMap[c.id] + '.jpg' : DS.photoOf(c); }
    function fmtR(b) { return DS.fmtD(DS.parseD(b.from)).replace(/, \d{4}/, ', 2026'); }
    function specs(c) { return '<span>' + ic('car', 'sm') + (c.type || 'Sports') + '</span><span>' + ic('auto', 'sm') + c.trans + '</span><span>' + ic('fuel', 'sm') + c.fuel + '</span><span>' + ic('users', 'sm') + c.seats + ' Seats</span>'; }
    function actions(b) {
      var h = '<button class="btn sm" data-msg="' + b.id + '">' + ic('chat', 'sm') + 'Message</button>';
      if (b.status === 'pending' || b.status === 'confirmed') h += '<button class="btn dng sm" data-cancel="' + b.id + '">Cancel</button>';
      if (b.status === 'completed') h += '<button class="btn out sm" data-review="' + b.id + '">' + ic('star', 'sm') + 'Review</button><a class="btn pri sm" href="car.html?id=' + b.carId + '">Book again</a>';
      if (b.status === 'cancelled') h += '<a class="btn pri sm" href="car.html?id=' + b.carId + '">Rebook</a>';
      return h;
    }
    function smallCard(b) {
      var c = car(b), o = DS.owner(b.ownerId), n = DS.days(DS.parseD(b.from), DS.parseD(b.to)), bd = badge(b.status), sh = DS.fmtD(DS.parseD(b.from)), eh = DS.fmtD(DS.parseD(b.to));
      return '<div class="card ob"><div class="im"><img src="' + img(b) + '" alt="' + esc(c.full) + '"></div><div class="mid"><div><span class="pill ' + bd[0] + '">' + bd[1] + '</span><div class="nm" data-open="' + b.id + '">' + esc(c.full) + ' ' + ic('cr', 'sm') + '</div><div class="spec">' + '<span>' + ic('car', 'sm') + (c.type || 'Sports') + '</span><span>' + ic('auto', 'sm') + c.trans + '</span><span>' + ic('users', 'sm') + c.seats + ' Seats</span></div></div>' +
        '<div class="dt">Pick-up<b>' + sh + '</b></div><div class="dt">Drop-off<b>' + eh + '</b><span>' + n + ' Day' + (n > 1 ? 's' : '') + ' Duration</span></div><div class="pr"><b>' + money(b.price) + '</b><small>$' + Math.round(b.price / n) + ' / day</small><div class="ac">' + actions(b) + '</div></div></div></div>';
    }
    function featured() { return bk.filter(function (b) { return b.status === 'active'; })[0]; }
    function draw() {
      load(); var f = featured(), ups = bk.filter(function (b) { return b.status === 'pending' || b.status === 'confirmed'; }), past = bk.filter(function (b) { return b.status === 'completed'; }), canc = bk.filter(function (b) { return b.status === 'cancelled'; });
      $('#bt').innerHTML = '<button data-t="up" class="' + (tab === 'up' ? 'on' : '') + '" role="tab" aria-selected="' + (tab === 'up') + '">Upcoming <i>' + ups.length + '</i></button><button data-t="past" class="' + (tab === 'past' ? 'on' : '') + '" role="tab">Past Bookings <i>' + past.length + '</i></button><button data-t="canc" class="' + (tab === 'canc' ? 'on' : '') + '" role="tab">Cancelled <i>' + canc.length + '</i></button>';
      var h = '';
      if (tab === 'up') {
        if (f) { var c = car(f), o = DS.owner(f.ownerId), n = DS.days(DS.parseD(f.from), DS.parseD(f.to));
          h += '<div class="card bc"><div class="im"><img src="' + img(f) + '" alt="' + esc(c.full) + '"><button data-open="' + f.id + '">View Details ' + ic('expand', 'sm') + '</button></div><div><div class="tt"><div><span class="pill green">Confirmed</span><h3 data-open="' + f.id + '" style="margin-top:8px">' + esc(c.full) + ' ' + ic('cr', 'sm') + '</h3></div><div class="pr"><b>' + money(f.price) + '</b><small>$' + Math.round(f.price / n) + ' / day</small></div></div><div class="sp">' + specs(c) + '</div>' +
            '<div class="tl"><div><i></i><span>Pick-up<b>' + fmtR(f) + '</b>10:00 AM</span></div><div><i class="b"></i><span>Drop-off<b>' + DS.fmtD(DS.parseD(f.to)) + '</b>10:00 AM</span></div><div>' + ic('cal') + '<span><b>' + n + ' Days</b>Duration</span></div></div>' +
            '<div class="ow2"><span style="display:flex;gap:6px;align-items:center">' + ic('pin') + '<span>Location<b>Cairo, Egypt</b></span></span><span class="who">' + A.avatar(o.name, 's') + '<span><b>' + o.name + ' <span class="pill blue" style="font-size:10px;padding:1px 7px">Top Owner</span></b>' + A.star('sm') + ' ' + o.rating + ' (102 reviews)</span><button class="btn sm" data-msg="' + f.id + '">' + ic('chat', 'sm') + 'Message</button><button class="btn pri sm" data-call="' + f.id + '">' + ic('phone', 'sm') + 'Call</button></span></div></div></div>' +
            '<div class="card prog"><div class="s"><i>' + ic('check', 'sm') + '</i><span>Booking Request<b>Oct 20, 2026</b>10:24 AM</span><span class="ar">' + ic('ar', 'sm') + '</span></div><div class="s"><i>' + ic('check', 'sm') + '</i><span>Owner Approval<b>Oct 20, 2026</b>11:10 AM</span><span class="ar">' + ic('ar', 'sm') + '</span></div><div class="s"><i>' + ic('check', 'sm') + '</i><span>Payment Completed<b>Oct 20, 2026</b>11:12 AM</span><span class="ar">' + ic('ar', 'sm') + '</span></div><div class="s"><i class="cur"></i><span><b style="color:var(--blue)">Trip in Progress</b>Oct 25, 2026</span><span class="ar">' + ic('ar', 'sm') + '</span></div><div class="s" style="flex:.8"><i class="todo">' + ic('plus', 'sm') + '</i><span>Completed<b style="font-weight:400;color:var(--muted)">Oct 28, 2026</b></span></div></div>'; }
        h += '<div class="sec2"><h2>Other Upcoming Bookings</h2><button class="lnk" id="va">View All ' + ic('ar', 'sm') + '</button></div>' + (ups.length ? ups.map(smallCard).join('') : '<div class="card empty">' + ic('cal', 'lg') + '<h3>No other upcoming bookings</h3><a class="btn pri" href="cars.html" style="margin-top:12px">Find a car</a></div>');
      } else if (tab === 'past') h += past.length ? past.map(smallCard).join('') : '<div class="card empty"><h3>No past bookings yet</h3></div>';
      else h += canc.length ? canc.map(smallCard).join('') : '<div class="card empty"><h3>Nothing cancelled</h3><p>Cancelled bookings will show up here.</p></div>';
      $('#bmain').innerHTML = h;
    }
    $('#bt').addEventListener('click', function (e) { var b = e.target.closest('[data-t]'); if (b) { tab = b.dataset.t; draw(); } });
    function find(id) { return bk.filter(function (b) { return b.id === id; })[0]; }
    function detail(b) {
      var c = car(b), o = DS.owner(b.ownerId), n = DS.days(DS.parseD(b.from), DS.parseD(b.to)), bd = badge(b.status);
      A.drawer('Booking ' + b.id, '<img src="' + img(b) + '" alt="" style="border-radius:12px;width:100%"><div><span class="pill ' + bd[0] + '">' + bd[1] + '</span><h3 style="font-size:20px;margin-top:8px">' + esc(c.full) + '</h3></div><div class="card" style="padding:14px;box-shadow:none"><div class="setrow"><span>Pick-up</span><b style="margin-left:auto">' + DS.fmtD(DS.parseD(b.from)) + ' · 10:00 AM</b></div><div class="setrow"><span>Drop-off</span><b style="margin-left:auto">' + DS.fmtD(DS.parseD(b.to)) + ' · 10:00 AM</b></div><div class="setrow"><span>Duration</span><b style="margin-left:auto">' + n + ' days</b></div><div class="setrow"><span>Subtotal</span><b style="margin-left:auto">' + money(b.price) + '</b></div><div class="setrow"><span>Service fee</span><b style="margin-left:auto">$' + (b.total - b.price) + '</b></div><div class="setrow"><span><b>Total</b></span><b style="margin-left:auto;font-size:18px">' + money(b.total) + '</b></div></div><div style="display:flex;gap:10px;align-items:center">' + A.avatar(o.name) + '<div><b>' + esc(o.name) + '</b><br><small style="color:var(--muted)">' + o.phone + '</small></div></div><div style="display:flex;gap:10px"><a class="btn blk" href="car.html?id=' + c.id + '">View car</a><button class="btn pri blk" data-msg="' + b.id + '">Message owner</button></div>');
    }
    document.addEventListener('click', function (e) {
      var t;
      if ((t = e.target.closest('[data-open]'))) { load(); var b = find(t.dataset.open); b && detail(b); }
      else if ((t = e.target.closest('[data-msg]'))) { load(); var b2 = find(t.dataset.msg); A.closeDrawer(); msgModal(DS.owner(b2.ownerId), car(b2).full); }
      else if ((t = e.target.closest('[data-cancel]'))) { load(); var b3 = find(t.dataset.cancel); A.confirm('Cancel this booking?', 'Cancel <b>' + esc(car(b3).full) + '</b> (' + b3.id + ')? Free cancellation applies until 24 hours before pick-up.', 'Yes, cancel booking', function () { b3.status = 'cancelled'; save(); draw(); A.toast('Booking cancelled'); }, true); }
      else if ((t = e.target.closest('[data-review]'))) { reviewModal(function () { }); }
      else if ((t = e.target.closest('[data-call]'))) { load(); var o = DS.owner(find(t.dataset.call).ownerId), sec = 0, iv;
        A.modal({ title: 'Calling ' + esc(o.name), body: '<div style="text-align:center;padding:10px">' + A.avatar(o.name, 'l') + '<p style="margin:12px 0 2px"><b>' + esc(o.name) + '</b></p><p style="color:var(--muted)">' + o.phone + '</p><p id="cs" style="font-size:22px;font-weight:700;margin-top:10px">Calling...</p></div>', actions: [{ label: ic('phone', 'sm') + ' End call', cls: 'dng', fn: function () { clearInterval(iv); } }], init: function () { iv = setInterval(function () { if (!$('#cs')) return clearInterval(iv); sec++; $('#cs').textContent = sec < 2 ? 'Ringing...' : '00:0' + Math.min(sec - 2, 9); }, 1000); } }); }
      else if (e.target.closest('#va')) { load(); A.drawer('All bookings', bk.map(function (b) { var bd = badge(b.status); return '<div class="setrow" style="cursor:pointer" data-open="' + b.id + '"><div><b>' + esc(car(b).full) + '</b><small>' + b.id + ' · ' + DS.fmtD(DS.parseD(b.from)) + '</small></div><span class="pill ' + bd[0] + '" style="margin-left:auto">' + bd[1] + '</span></div>'; }).join('')); }
      else if (e.target.closest('#cancelTrip')) { load(); var f = featured(); if (!f) return A.toast('No active trip to cancel', 1); A.confirm('Cancel this booking?', 'Cancel your ' + esc(car(f).full) + ' trip? Free cancellation may not apply because the trip has started.', 'Yes, cancel trip', function () { f.status = 'cancelled'; save(); draw(); A.toast('Booking cancelled'); }, true); }
      else if (e.target.closest('#modTrip')) { load(); var g = featured() || ups0(); if (!g) return A.toast('No booking to modify', 1);
        A.modal({ title: 'Modify booking', body: '<div class="fgrid"><div class="fld"><label>Pick-up date</label><input class="inp" type="date" name="a" value="' + g.from + '"></div><div class="fld"><label>Drop-off date</label><input class="inp" type="date" name="b" value="' + g.to + '"></div></div>', actions: [{ label: 'Cancel' }, { label: 'Save changes', cls: 'pri', fn: function (ov) { var a = $('[name=a]', ov), b = $('[name=b]', ov); if (!A.validate(ov, { a: ['req', function (v) { return ''; }], b: ['req', function (v) { return v > a.value ? '' : 'Drop-off must be after pick-up'; }] })) return false; g.from = a.value; g.to = b.value; var n = DS.days(DS.parseD(g.from), DS.parseD(g.to)), pd = car(g).price; g.price = n * pd; g.total = g.price + DS.FEE; save(); draw(); A.toast('Booking updated'); } }] }); }
      else if (e.target.closest('#vtrip')) { load(); var h = featured() || ups0(); h ? detail(h) : A.toast('No trip yet', 1); }
      else if (e.target.closest('#vdet')) A.modal({ title: 'Driver verification', body: '<img class="big" src="assets/img/id-card.jpg" alt="Driver license preview"><div class="idc"><ul style="grid-column:1/-1"><li>' + ic('check', 'sm') + 'Identity verified</li><li>' + ic('check', 'sm') + 'License verified</li><li>' + ic('check', 'sm') + 'Ready to book</li></ul></div>', actions: [{ label: 'Manage in profile', cls: 'pri', fn: function () { location.href = 'account.html?tab=verification'; } }] });
    });
    function ups0() { return bk.filter(function (b) { return b.status === 'pending' || b.status === 'confirmed'; })[0]; }
    $('#newb').onclick = function () { location.href = 'cars.html'; };
    $('#sidec').innerHTML = '<div class="card rc"><h3><span style="width:34px;height:34px;border-radius:50%;background:#e3f7ea;color:var(--green);display:grid;place-items:center">' + ic('shield') + '</span>Driver Verification<span class="pill green tr">Verified</span></h3><div class="idc"><img src="assets/img/id-card.jpg" alt="Driver license thumbnail"><ul><li>' + ic('check', 'sm') + 'Identity Verified</li><li>' + ic('check', 'sm') + 'License Verified</li><li>' + ic('check', 'sm') + 'Ready to Book</li></ul></div><button class="btn out blk" id="vdet" style="margin-top:12px">View Details ' + ic('ar', 'sm') + '</button></div>' +
      '<div class="card rc"><h3>Upcoming Trip<span class="pill green tr">● Live</span></h3><div class="cd" id="cdw"></div><button class="btn pri blk" id="vtrip">' + ic('cal', 'sm') + ' View Trip Details</button><div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px"><button class="btn sm" id="modTrip">' + ic('edit', 'sm') + 'Modify Booking</button><button class="btn dng sm" id="cancelTrip">' + ic('x', 'sm') + 'Cancel Booking</button></div></div>' +
      '<div class="card rc"><h3>Support</h3><div style="display:flex;gap:12px;align-items:center;margin-bottom:12px"><span style="width:44px;height:44px;border-radius:50%;background:#eaf2ff;color:var(--blue);display:grid;place-items:center">' + ic('help', 'lg') + '</span><div><b>Need Help?</b><br><small style="color:var(--muted)">Our support team is here for you 24/7.</small></div></div><div class="sup"><button class="btn out" data-live>' + ic('chat', 'sm') + 'Live Chat</button><button class="btn out" id="sendm">' + ic('mail', 'sm') + 'Send Message</button></div><a href="tel:+20212345 6789" id="callus" style="display:flex;gap:12px;align-items:center;margin-top:16px;font-weight:700">' + ic('phone', 'lg') + '<span><small style="color:var(--muted);font-weight:400;display:block">Call Us</small>+20 2 123 456 789</span></a></div>';
    A.countdown($('#cdw'), 2 * 86400 + 14 * 3600 + 32 * 60 + 10);
    $('#sendm').onclick = function () { A.contactModal('Send a message to support'); };
    $('#callus').onclick = function (e) { e.preventDefault(); A.modal({ title: 'Call support', body: '<p>Our team is available 24/7 at <b>+20 2 123 456 789</b>.</p><p style="color:var(--muted)">This is a design preview - no call will be placed.</p>', actions: [{ label: 'Close', cls: 'pri' }] }); };
    draw();
  };

  /* ================= DASHBOARD (owner) ================= */
  Pages.dashboard = function () {
    var cars = S.get('ocars', null) || (function () { var c = DS.seedOwnerCars(); S.set('ocars', c); return c; })();
    var obk = S.get('obk', null) || (function () { var c = DS.seedOwnerBookings(); S.set('obk', c); return c; })();
    var range = 'Oct 1, 2026 - Oct 31, 2026', per = 'This Month';
    var CH = { 'This Week': [[40, 60, 30], [55, 40, 20], [70, 50, 40], [30, 80, 20], [60, 30, 50], [90, 40, 25], [80, 60, 35]], 'This Month': [[22, 6], [32, 12], [18, 8], [36, 14], [30, 10], [44, 12], [26, 14], [40, 16], [34, 12], [38, 14], [28, 20], [46, 18]], 'This Year': [[30, 8], [26, 10], [34, 8], [40, 12], [38, 14], [46, 10], [52, 14], [44, 12], [50, 16], [56, 14], [48, 12], [60, 16]] };
    var TOT = { 'This Week': 940, 'This Month': 4280, 'This Year': 38650 };
    var XL = { 'This Week': ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], 'This Month': ['Oct 1', 'Oct 7', 'Oct 14', 'Oct 21', 'Oct 28'], 'This Year': ['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Dec'] };
    var act = S.get('act', null) || [['calendar', 'New booking request', 'Tesla Model 3 2024', '2 mins ago'], ['check', 'Booking confirmed', 'BMW X5 2024', '15 mins ago'], ['dollar', 'Payment received', '$160 from Sara Ali', '1 hour ago'], ['star', 'New review', '5 stars for Range Rover Sport', '2 hours ago'], ['car', 'Car updated', 'Audi Q7 2024', '4 hours ago']];
    function pushAct(a, b) { act.unshift(['check', a, b, 'Just now']); S.set('act', act); drawAct(); }
    $('#welcome').innerHTML = '<div class="ph2"><div><h1>Welcome Back, Ahmed <span aria-hidden="true">👋</span></h1><p class="sub">Here\'s an overview of your cars, bookings, and earnings.</p></div><div style="margin-left:auto;display:flex;gap:12px" class="rel"><button class="btn" id="rng" style="margin:0">' + ic('cal', 'sm') + '<span id="rtxt">' + range + '</span>' + ic('cd', 'sm') + '</button><button class="btn pri" data-addcar style="margin:0">' + ic('plus', 'sm') + 'Add New Car</button><div class="pop" id="rpop" style="right:150px;top:46px;width:210px"></div></div></div>';
    var presets = ['Oct 1, 2026 - Oct 31, 2026', 'Last 7 days', 'Last 30 days', 'This year'];
    $('#rpop').innerHTML = presets.map(function (p) { return '<button class="mi" data-rg="' + p + '">' + p + '</button>'; }).join(''); $('#rng').onclick = function (e) { e.stopPropagation(); $('#rpop').classList.toggle('on'); }; $('#rpop').onclick = function (e) { var b = e.target.closest('[data-rg]'); if (b) { range = b.dataset.rg; $('#rtxt').textContent = range; $('#rpop').classList.remove('on'); A.toast('Showing ' + range); } };
    function stats() {
      var act2 = cars.filter(function (c) { return c.status === 'Active'; }).length, conf = obk.filter(function (b) { return b.status === 'Completed' || b.status === 'Confirmed'; }).length;
      $('#stats').innerHTML = [['car', '#e6efff', '#0a5cff', 'Total Cars', 5 + (cars.length - 4), '↑ +2 this month'], ['cal', '#efe9ff', '#7c3aed', 'Total Bookings', 24 + (obk.length - 4), '↑ +12%'], ['dollar', '#e0f7ea', '#16a34a', 'Total Earnings', money(TOT['This Month'] + obk.filter(function (b) { return b.status === 'Completed' && b.id.length > 4; }).length * 0), '↑ +18%'], ['star', '#fff4dc', '#f59e0b', 'Average Rating', '4.8', '(86 reviews)']].map(function (s) { return '<div class="card stc"><i style="background:' + s[1] + ';color:' + s[2] + '">' + ic(s[0], 'lg') + '</i><div><small>' + s[3] + '</small><b>' + s[4] + '</b><em' + (s[0] === 'star' ? ' style="color:var(--muted);font-weight:400"' : '') + '>' + s[5] + '</em></div></div>'; }).join('');
    }
    function drawCars() {
      $('#mycars').innerHTML = cars.map(function (c) { return '<div class="mc" data-cid="' + c.id + '"><div class="ph"><img src="assets/img/' + c.img + '.jpg" alt="' + esc(c.name) + '"><span class="stt ' + (c.status === 'Active' ? '' : 'off') + '"><i></i>' + c.status + '</span><button class="kb" data-kb="' + c.id + '" aria-label="Car options">' + ic('more', 'sm') + '</button><div class="menu" id="mn-' + c.id + '"><button data-edit="' + c.id + '">' + ic('edit', 'sm') + 'Edit price</button><button data-tog="' + c.id + '">' + ic('refresh', 'sm') + (c.status === 'Active' ? 'Deactivate' : 'Activate') + '</button><button class="d" data-del="' + c.id + '">' + ic('trash', 'sm') + 'Remove</button></div></div><div class="b"><b>' + esc(c.name) + '</b><div class="sp"><span>' + c.type + '</span><span>' + c.trans + '</span></div><div class="pp"><span>$' + c.price + '<small> / day</small></span><span>' + A.star('sm') + ' ' + c.rating + ' <small>(' + c.reviews + ')</small></span></div></div></div>'; }).join('') || '<div class="empty" style="grid-column:1/-1">No cars yet. <button class="lnk" data-addcar>Add your first car</button></div>'; stats();
    }
    function drawBk() {
      var cl = { Pending: ['pend', 'clock'], Confirmed: ['conf', 'check'], Completed: ['comp', 'check'], Cancelled: ['canc', 'x'] };
      $('#obk').innerHTML = '<table class="tbl"><thead><tr><th>User</th><th>Car</th><th>Dates</th><th>Status</th><th>Amount</th><th style="text-align:center">Actions</th></tr></thead><tbody>' + obk.map(function (b) { return '<tr><td><div class="u">' + A.avatar(b.who, 's') + '<div><b>' + esc(b.who) + '</b><small>' + A.star('sm') + ' ' + b.rate + ' (' + b.n + ')</small></div></div></td><td><div class="u"><div><b>' + esc(b.car) + '</b><small>' + b.ct + '</small></div></div></td><td>' + b.dates + '<small style="display:block;color:var(--muted)">' + b.days + '</small></td><td><span class="sbadge ' + cl[b.status][0] + '">' + ic(cl[b.status][1], 'sm') + b.status + '</span></td><td><b>$' + b.amount + '</b></td><td style="text-align:center;position:relative"><button class="ibtn" data-ob="' + b.id + '" aria-label="Booking actions">' + ic('moreh') + '</button><div class="menu" id="ob-' + b.id + '" style="right:20px;top:30px">' + (b.status === 'Pending' ? '<button data-oa="Confirmed" data-id="' + b.id + '">' + ic('check', 'sm') + 'Accept request</button><button class="d" data-oa="Cancelled" data-id="' + b.id + '">' + ic('x', 'sm') + 'Decline</button>' : '') + (b.status === 'Confirmed' ? '<button data-oa="Completed" data-id="' + b.id + '">' + ic('check', 'sm') + 'Mark completed</button><button class="d" data-oa="Cancelled" data-id="' + b.id + '">' + ic('x', 'sm') + 'Cancel</button>' : '') + '<button data-om="' + b.id + '">' + ic('chat', 'sm') + 'Message renter</button></div></td></tr>'; }).join('') + '</tbody></table>';
    }
    function drawChart() {
      var data = CH[per], max = 70, nb = data.length;
      $('#ear').innerHTML = '<div style="display:flex;align-items:center"><h3 style="font-size:14px">Earnings Overview</h3><label class="dd" style="width:auto;height:30px;margin-left:auto;font-size:12px;padding:0 10px;background:#fff;border-color:var(--line)"><span class="v"></span><i class="cv">' + ic('cd', 'sm') + '</i><select id="per" aria-label="Period">' + selOpts(Object.keys(CH), per) + '</select></label></div><div style="font-size:30px;font-weight:800;margin:10px 0 0">' + money(TOT[per]) + ' <span class="pill green" style="font-size:11px;vertical-align:middle">↑ 18%</span></div><div class="chart" id="chart" role="img" aria-label="Earnings chart">' + data.map(function (d, i) { var a = d.reduce(function (x, y) { return x + y; }, 0), h1 = d[0] / max * 100, h2 = d.length > 1 ? (a - d[0]) / max * 100 : 0; return '<div class="c" data-v="' + Math.round(a * (per === 'This Year' ? 90 : per === 'This Week' ? 3 : 8)) + '" data-l="' + (XL[per][Math.min(i, XL[per].length - 1)]) + '"><u style="height:' + h2 + '%"></u><i style="height:' + h1 + '%"></i></div>'; }).join('') + '<div class="tip" id="tip"></div></div><div class="xl">' + XL[per].map(function (x) { return '<span>' + x + '</span>'; }).join('') + '</div><div class="lg2"><span>Completed</span><span>Upcoming</span></div>';
      var sel = $('#per'), dd = sel.parentNode; A.ddSelect(dd, function (v) { per = v; drawChart(); });
      var chart = $('#chart'), tip = $('#tip'); chart.addEventListener('mouseover', function (e) { var c = e.target.closest('.c'); if (!c) return; tip.innerHTML = '<b>$' + c.dataset.v + '</b><br>' + c.dataset.l; tip.style.left = (c.offsetLeft + c.offsetWidth / 2) + 'px'; tip.style.top = (chart.clientHeight - c.firstChild.offsetHeight - c.lastChild.offsetHeight) + 'px'; tip.classList.add('on'); }); chart.addEventListener('mouseleave', function () { tip.classList.remove('on'); });
    }
    function drawAct() {
      var colors = { calendar: ['#eef1f8', '#516087'], check: ['#e3f7ea', '#16a34a'], dollar: ['#e6efff', '#0a5cff'], star: ['#fff4dc', '#f59e0b'], car: ['#eaf2ff', '#0a5cff'] };
      $('#acts').innerHTML = act.slice(0, 5).map(function (a) { var ci = colors[a[0]] || colors.check; return '<div class="act"><i style="background:' + ci[0] + ';color:' + ci[1] + '">' + ic(a[0] === 'calendar' ? 'cal' : a[0]) + '</i><div><b>' + esc(a[1]) + '</b><small>' + esc(a[2]) + '</small></div><time>' + a[3] + '</time></div>'; }).join('');
    }
    document.addEventListener('click', function (e) {
      var t;
      if ((t = e.target.closest('[data-kb]'))) { var id = t.dataset.kb, m = $('#mn-' + id), on = m.classList.contains('on'); $$('.menu.on').forEach(function (x) { x.classList.remove('on'); }); if (!on) m.classList.add('on'); e.stopPropagation(); return; }
      if ((t = e.target.closest('[data-ob]'))) { var m2 = $('#ob-' + t.dataset.ob), on2 = m2.classList.contains('on'); $$('.menu.on').forEach(function (x) { x.classList.remove('on'); }); if (!on2) m2.classList.add('on'); e.stopPropagation(); return; }
      if ((t = e.target.closest('[data-tog]'))) { var c = cars.filter(function (x) { return x.id === t.dataset.tog; })[0]; c.status = c.status === 'Active' ? 'Inactive' : 'Active'; S.set('ocars', cars); drawCars(); A.toast(c.name + ' is now ' + c.status.toLowerCase()); pushAct('Car updated', c.name); }
      else if ((t = e.target.closest('[data-del]'))) { var c2 = cars.filter(function (x) { return x.id === t.dataset.del; })[0]; A.confirm('Remove this car?', 'Remove <b>' + esc(c2.name) + '</b> from your listings? You can add it again later.', 'Remove car', function () { cars.splice(cars.indexOf(c2), 1); S.set('ocars', cars); drawCars(); A.toast('Car removed'); }, true); }
      else if ((t = e.target.closest('[data-edit]'))) { var c3 = cars.filter(function (x) { return x.id === t.dataset.edit; })[0]; A.modal({ title: 'Edit price', body: '<div class="fld"><label>Daily price (USD)</label><input class="inp" name="p" type="number" value="' + c3.price + '"></div>', actions: [{ label: 'Cancel' }, { label: 'Save', cls: 'pri', fn: function (ov) { if (!A.validate(ov, { p: [function (v) { return +v >= 10 && +v <= 1000 ? '' : 'Enter a price between $10 and $1000'; }] })) return false; c3.price = +$('[name=p]', ov).value; S.set('ocars', cars); drawCars(); A.toast('Price updated'); pushAct('Car updated', c3.name); } }] }); }
      else if ((t = e.target.closest('[data-oa]'))) { var b = obk.filter(function (x) { return x.id === t.dataset.id; })[0]; b.status = t.dataset.oa; S.set('obk', obk); drawBk(); A.toast('Booking ' + b.status.toLowerCase()); pushAct('Booking ' + b.status.toLowerCase(), b.car); }
      else if ((t = e.target.closest('[data-om]'))) { var b2 = obk.filter(function (x) { return x.id === t.dataset.om; })[0]; A.msgModal({ id: 99, name: b2.who }, b2.car); }
      else if (e.target.closest('#vall')) A.drawer('All activity', act.map(function (a) { return '<div class="act"><i style="background:#eaf2ff;color:#0a5cff">' + ic('check') + '</i><div><b>' + esc(a[1]) + '</b><small>' + esc(a[2]) + '</small></div><time>' + a[3] + '</time></div>'; }).join(''));
      else if (e.target.closest('#vbk')) location.href = 'bookings.html';
      else if (e.target.closest('#vcars')) A.drawer('All cars (' + cars.length + ')', cars.map(function (c) { return '<div class="setrow"><img src="assets/img/' + c.img + '.jpg" alt="" style="width:70px;height:46px;object-fit:cover;border-radius:8px"><div><b>' + esc(c.name) + '</b><small>$' + c.price + ' / day · ' + c.status + '</small></div></div>'; }).join(''));
      else if (e.target.closest('[data-addcar]')) addCar();
    });
    function addCar() {
      A.modal({ title: 'Add a new car', cls: 'lg', body: '<form class="fgrid" novalidate><div class="fld"><label>Make</label><input class="inp" name="make" placeholder="e.g. Toyota"></div><div class="fld"><label>Model</label><input class="inp" name="model" placeholder="e.g. Corolla"></div><div class="fld"><label>Year</label><select class="sel" name="year">' + [2026, 2025, 2024, 2023, 2022, 2021, 2020].map(function (y) { return '<option>' + y + '</option>'; }).join('') + '</select></div><div class="fld"><label>Type</label><select class="sel" name="type"><option>SUV</option><option>Sedan</option><option>Hatchback</option><option>Luxury</option><option>Family</option></select></div><div class="fld"><label>Transmission</label><select class="sel" name="tr"><option>Automatic</option><option>Manual</option></select></div><div class="fld"><label>Daily price (USD)</label><input class="inp" name="price" type="number" placeholder="60"></div><div class="fld" style="grid-column:1/-1"><label>Photo</label><div class="up" id="upl">' + ic('up', 'lg') + '<div>Click to choose a photo (preview only)</div></div></div></form>', actions: [{ label: 'Cancel' }, { label: 'Add car', cls: 'pri', fn: function (ov) {
        if (!A.validate(ov, { make: ['req'], model: ['req'], price: [function (v) { return +v >= 10 && +v <= 1000 ? '' : 'Enter a price between $10 and $1000'; }] })) return false;
        var v = function (n) { return $('[name=' + n + ']', ov).value; }; var nc = { id: 'm' + Date.now(), name: v('make') + ' ' + v('model') + ' ' + v('year'), type: v('type'), trans: v('tr'), price: +v('price'), rating: 5.0, reviews: 0, status: 'Active', img: ['dash-1', 'dash-2', 'dash-3', 'dash-4'][cars.length % 4] }; cars.push(nc); S.set('ocars', cars); drawCars(); A.toast('Car added to your listings'); pushAct('Car added', nc.name); } }],
        init: function (ov) { $('#upl', ov).onclick = function () { this.innerHTML = ic('check', 'lg') + '<div>photo-selected.jpg</div>'; this.style.color = 'var(--green)'; }; } });
    }
    A.addCar = addCar;
    $('#rbox').innerHTML = '<div class="lmc"><h4>List More Cars</h4><p>Increase your earnings by adding more cars to your fleet.</p><button class="btn" data-addcar>Add New Car ' + ic('ar', 'sm') + '</button></div>';
    stats(); drawCars(); drawBk(); drawChart(); drawAct();
  };

  /* ================= SAVED ================= */
  Pages.saved = function () {
    function draw() { var ids = A.favs(), list = ids.map(DS.car).filter(Boolean); $('#sc').innerHTML = list.length ? '<div class="cgrid">' + list.map(A.carCard).join('') + '</div>' : '<div class="card empty">' + ic('heart', 'lg') + '<h3>No saved cars yet</h3><p>Tap the heart on any car to save it here.</p><a class="btn pri" href="cars.html" style="margin-top:14px">Browse cars</a></div>'; $('#scn').textContent = list.length + ' saved'; }
    A.onFav = function () { setTimeout(draw, 150); }; draw();
    var cl = $('#clearfav'); cl.onclick = function () { if (!A.favs().length) return A.toast('Nothing to clear', 1); A.confirm('Clear all saved cars?', 'This removes every car from your saved list.', 'Clear all', function () { S.set('favs', []); draw(); A.toast('Saved list cleared'); }, true); };
  };

  /* ================= MESSAGES ================= */
  Pages.messages = function () {
    var ts = S.get('threads', null) || DS.threads(), cur = A.q('t') || ts[0].id;
    function save() { S.set('threads', ts); }
    function drawList() { $('#lst').innerHTML = ts.map(function (t) { var o = DS.owner(t.ownerId) || { name: 'Support' }, l = t.msgs[t.msgs.length - 1] || { t: '' }; return '<div class="th ' + (t.id === cur ? 'on' : '') + '" data-th="' + t.id + '" tabindex="0" role="button">' + A.avatar(o.name) + '<div><b>' + esc(o.name) + '</b><small>' + esc(l.t) + '</small></div>' + (t.unread ? '<span class="bg">' + t.unread + '</span>' : '') + '</div>'; }).join(''); }
    function drawChat() {
      var t = ts.filter(function (x) { return x.id === cur; })[0]; if (!t) { $('#cv').innerHTML = '<div class="empty">Select a conversation</div>'; return; } t.unread = 0; save(); var o = DS.owner(t.ownerId) || { name: 'Support', tag: '' };
      $('#cv').innerHTML = '<div class="ch">' + A.avatar(o.name) + '<div><b>' + esc(o.name) + '</b><br><small style="color:var(--green)">● Online</small></div><span class="pill blue" style="margin-left:auto">' + esc(t.car) + '</span></div><div class="msgs" id="mm">' + t.msgs.map(function (m) { return '<div class="msg ' + (m.me ? 'me' : '') + '">' + esc(m.t) + '<small>' + m.at + '</small></div>'; }).join('') + '</div><form class="cin" id="mf"><input class="inp" id="mi" placeholder="Type a message..." aria-label="Message" autocomplete="off"><button class="btn pri" type="submit">' + ic('send', 'sm') + 'Send</button></form>';
      var mm = $('#mm'); mm.scrollTop = 1e6;
      $('#mf').onsubmit = function (e) { e.preventDefault(); var v = $('#mi').value.trim(); if (!v) return; t.msgs.push({ me: 1, t: v, at: 'Just now' }); save(); drawChat(); drawList(); var mm2 = $('#mm'); var ty = document.createElement('div'); ty.className = 'typing'; ty.textContent = o.name.split(' ')[0] + ' is typing...'; mm2.appendChild(ty); mm2.scrollTop = 1e6; setTimeout(function () { t.msgs.push({ me: 0, t: /when|time/i.test(v) ? 'Anytime after 10 AM works for me.' : /price|discount/i.test(v) ? 'I can offer 10% off for 4+ days.' : 'Sounds good! Let me know if you need anything else.', at: 'Just now' }); if (cur !== t.id) t.unread++; save(); if (cur === t.id) drawChat(); drawList(); }, 1300); };
    }
    $('#lst').onclick = function (e) { var b = e.target.closest('[data-th]'); if (b) { cur = b.dataset.th; drawList(); drawChat(); } };
    $('#lst').onkeydown = function (e) { if (e.key === 'Enter' && e.target.dataset.th) e.target.click(); };
    drawList(); drawChat();
  };

  /* ================= ACCOUNT ================= */
  Pages.account = function () {
    var tab = A.q('tab') || 'profile', role = A.role();
    var tabs = [['profile', 'Profile'], ['payments', 'Payment Methods'], ['verification', 'Driver Verification'], ['settings', 'Settings']];
    if (role === 'owner') tabs = tabs.concat([['calendar', 'Calendar'], ['earnings', 'Earnings'], ['reviews', 'Reviews'], ['documents', 'Documents']]);
    if (!tabs.some(function (t) { return t[0] === tab; })) tabs.push([tab, tab[0].toUpperCase() + tab.slice(1)]);
    $('#atabs').innerHTML = tabs.map(function (t) { return '<a href="account.html?tab=' + t[0] + '" class="' + (t[0] === tab ? 'on' : '') + '">' + t[1] + '</a>'; }).join('');
    var u = S.get('profile', { name: DS.me.name, email: DS.me.email, phone: DS.me.phone, city: DS.me.city, bio: 'Weekend traveller and car enthusiast.' }), h = '', box = $('#abody');
    var F = {
      profile: function () {
        box.innerHTML = '<form class="card" id="pf" novalidate style="padding:24px;max-width:720px"><div style="display:flex;gap:16px;align-items:center;margin-bottom:20px">' + A.avatar(u.name, 'l') + '<div><h2 style="font-size:20px">' + esc(u.name) + '</h2><p style="color:var(--muted)">' + (role === 'owner' ? 'Car Owner' : 'Renter') + ' · Member since 2025</p></div><button type="button" class="btn sm" style="margin-left:auto" id="chp">Change photo</button></div><div class="fgrid"><div class="fld"><label>Full name</label><input class="inp" name="name" value="' + esc(u.name) + '"></div><div class="fld"><label>Email</label><input class="inp" name="email" type="email" value="' + esc(u.email) + '"></div><div class="fld"><label>Phone</label><input class="inp" name="phone" value="' + esc(u.phone) + '"></div><div class="fld"><label>City</label><select class="sel" name="city">' + selOpts(DS.cities, u.city) + '</select></div><div class="fld" style="grid-column:1/-1"><label>About you</label><textarea class="inp" name="bio">' + esc(u.bio) + '</textarea></div></div><div style="display:flex;gap:10px;margin-top:20px"><button class="btn pri" type="submit">Save changes</button><button type="button" class="btn" id="pwb">Change password</button></div></form>';
        $('#pf').onsubmit = function (e) { e.preventDefault(); var f = e.target; if (!A.validate(f, { name: ['req'], email: ['email'], phone: ['phone'] })) return; u = { name: f.name.value, email: f.email.value, phone: f.phone.value, city: f.city.value, bio: f.bio.value }; S.set('profile', u); var us = A.user(); if (us) { us.name = u.name; S.set('user', us); } A.toast('Profile saved'); };
        $('#chp').onclick = function () { A.toast('Photo upload is not available in the preview', 1); };
        $('#pwb').onclick = function () { A.modal({ title: 'Change password', body: '<form novalidate style="display:flex;flex-direction:column;gap:12px"><div class="fld"><label>Current password</label><input class="inp" type="password" name="a" autocomplete="current-password"></div><div class="fld"><label>New password</label><input class="inp" type="password" name="b" autocomplete="new-password"></div><div class="fld"><label>Confirm new password</label><input class="inp" type="password" name="c" autocomplete="new-password"></div></form>', actions: [{ label: 'Cancel' }, { label: 'Update password', cls: 'pri', fn: function (ov) { var b = $('[name=b]', ov); if (!A.validate(ov, { a: ['req'], b: ['pw'], c: [function (v) { return v === b.value ? '' : 'Passwords do not match'; }] })) return false; A.toast('Password updated (demo - nothing is stored)'); } }] }); };
      },
      payments: function () {
        var cards = S.get('cards', [{ id: 1, brand: 'VISA', last: '4242', exp: '09/28', def: 1 }, { id: 2, brand: 'MC', last: '8821', exp: '02/27', def: 0 }]);
        function draw() { box.innerHTML = '<div class="card" style="padding:24px;max-width:720px"><div style="display:flex;align-items:center;margin-bottom:16px"><h2 style="font-size:20px">Payment methods</h2><button class="btn pri sm" style="margin-left:auto" id="addc">' + ic('plus', 'sm') + 'Add card</button></div>' + (cards.length ? cards.map(function (c) { return '<div class="crd"><div class="cb">' + c.brand + '</div><div><b>•••• ' + c.last + '</b> ' + (c.def ? '<span class="pill blue">Default</span>' : '') + '<br><small style="color:var(--muted)">Expires ' + c.exp + '</small></div><div class="ac">' + (c.def ? '' : '<button class="btn sm" data-def="' + c.id + '">Make default</button>') + '<button class="btn dng sm" data-rm="' + c.id + '">Remove</button></div></div>'; }).join('') : '<div class="empty">No cards saved</div>') + '</div>'; }
        draw(); box.onclick = function (e) { var t;
          if (e.target.closest('#addc')) A.modal({ title: 'Add card', body: '<p style="color:var(--muted);margin:0;font-size:12.5px">' + ic('lock', 'sm') + ' Demo only - only the last 4 digits are kept in your browser.</p><form class="fgrid" novalidate><div class="fld" style="grid-column:1/-1"><label>Card number</label><input class="inp" name="n" inputmode="numeric" placeholder="4242 4242 4242 4242" autocomplete="off"></div><div class="fld"><label>Expiry</label><input class="inp" name="e" placeholder="MM/YY" autocomplete="off"></div><div class="fld"><label>CVC</label><input class="inp" name="c" placeholder="123" autocomplete="off"></div></form>', actions: [{ label: 'Cancel' }, { label: 'Save card', cls: 'pri', fn: function (ov) { if (!A.validate(ov, { n: ['card'], e: ['exp'], c: ['cvc'] })) return false; var n = $('[name=n]', ov).value.replace(/\s/g, ''); cards.push({ id: Date.now(), brand: n[0] === '5' ? 'MC' : 'VISA', last: n.slice(-4), exp: $('[name=e]', ov).value, def: cards.length ? 0 : 1 }); S.set('cards', cards); draw(); A.toast('Card added'); } }] });
          else if ((t = e.target.closest('[data-def]'))) { cards.forEach(function (c) { c.def = c.id == t.dataset.def ? 1 : 0; }); S.set('cards', cards); draw(); A.toast('Default card updated'); }
          else if ((t = e.target.closest('[data-rm]'))) A.confirm('Remove card?', 'This card will be removed from your account.', 'Remove', function () { cards = cards.filter(function (c) { return c.id != t.dataset.rm; }); if (cards.length && !cards.some(function (c) { return c.def; })) cards[0].def = 1; S.set('cards', cards); draw(); A.toast('Card removed'); }, true); };
      },
      verification: function () {
        var v = S.get('verif', { id: 1, lic: 1, ready: 1 });
        box.innerHTML = '<div class="card" style="padding:24px;max-width:720px"><div style="display:flex;gap:14px;align-items:center;margin-bottom:16px"><span style="width:50px;height:50px;border-radius:50%;background:#e3f7ea;color:var(--green);display:grid;place-items:center">' + ic('shield', 'lg') + '</span><div><h2 style="font-size:20px">Driver verification</h2><p style="color:var(--muted)">Your license has been verified successfully.</p></div><span class="pill green" style="margin-left:auto">Verified</span></div><div class="idc" style="margin-bottom:16px"><img src="assets/img/id-card.jpg" alt="License preview"><ul><li>' + ic('check', 'sm') + 'Identity Verified</li><li>' + ic('check', 'sm') + 'License Verified</li><li>' + ic('check', 'sm') + 'Ready to Book</li></ul></div><div class="up" id="vup">' + ic('up', 'lg') + '<div>Upload a new document</div></div><div class="bar" style="margin-top:14px;display:none" id="vbar"><i></i></div></div>';
        $('#vup').onclick = function () { var b = $('#vbar'), i = $('i', b); b.style.display = ''; var p = 0, iv = setInterval(function () { p += 12; i.style.width = Math.min(p, 100) + '%'; if (p >= 100) { clearInterval(iv); A.toast('Document uploaded - under review'); } }, 120); };
      },
      settings: function () {
        var st = S.get('settings', { email: 1, sms: 0, promo: 0, twofa: 0, compact: 0 }), rows = [['email', 'Email notifications', 'Booking updates and receipts'], ['sms', 'SMS alerts', 'Pick-up reminders by text message'], ['promo', 'Promotions', 'Deals and new cars near you'], ['twofa', 'Two-factor authentication', 'Extra security when you log in'], ['compact', 'Compact layout', 'Show more content on screen']];
        box.innerHTML = '<div class="card" style="padding:8px 24px;max-width:720px">' + rows.map(function (r) { return '<div class="setrow"><div><b>' + r[1] + '</b><small>' + r[2] + '</small></div><label class="sw"><input type="checkbox" data-s="' + r[0] + '"' + (st[r[0]] ? ' checked' : '') + ' aria-label="' + r[1] + '"><i></i></label></div>'; }).join('') + '<div class="setrow"><div><b>Language</b><small>Preview shows English only</small></div><select class="sel" style="width:150px;margin-left:auto" id="lang"><option>English</option><option>العربية</option></select></div><div class="setrow"><div><b>Delete account</b><small>Removes your demo data from this browser</small></div><button class="btn dng sm" id="delacc" style="margin-left:auto">Delete</button></div></div>';
        box.onchange = function (e) { var k = e.target.dataset.s; if (k) { st[k] = e.target.checked ? 1 : 0; S.set('settings', st); A.toast(rows.filter(function (r) { return r[0] === k; })[0][1] + (st[k] ? ' enabled' : ' disabled')); } if (e.target.id === 'lang' && e.target.value !== 'English') { A.toast('Arabic is coming soon'); e.target.value = 'English'; } };
        $('#delacc').onclick = function () { A.confirm('Delete your account?', 'This clears all demo data stored in this browser (bookings, saved cars, messages).', 'Delete data', function () { ['bookings', 'favs', 'threads', 'ocars', 'obk', 'cards', 'profile', 'settings', 'notifs', 'search', 'act', 'verif', 'user'].forEach(S.del); A.toast('Data cleared'); setTimeout(function () { location.href = 'index.html'; }, 800); }, true); };
      },
      calendar: function () {
        var y = 2026, m = 9, bk = A.bookings();
        function draw() { var first = new Date(y, m, 1).getDay(), n = new Date(y, m + 1, 0).getDate(), h = '<div class="card" style="padding:20px"><div style="display:flex;align-items:center;gap:10px;margin-bottom:14px"><button class="btn sm" id="cp">' + ic('cl', 'sm') + '</button><h2 style="font-size:18px;min-width:160px;text-align:center">' + ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][m] + ' ' + y + '</h2><button class="btn sm" id="cn">' + ic('cr', 'sm') + '</button></div><div class="cal">' + ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(function (d) { return '<b>' + d + '</b>'; }).join('');
          for (var i = 0; i < first; i++) h += '<div class="o"></div>';
          for (var d = 1; d <= n; d++) { var dt = new Date(y, m, d), iso = DS.isoD(dt), ev = bk.filter(function (b) { return b.status !== 'cancelled' && iso >= b.from && iso <= b.to; }).slice(0, 2); h += '<div class="' + (iso === DS.isoD(DS.today) ? 'td' : '') + '">' + d + ev.map(function (b) { return '<i class="' + (b.status === 'pending' ? 'a' : b.status === 'completed' ? 'g' : '') + '">' + esc(DS.car(b.carId).name) + '</i>'; }).join('') + '</div>'; }
          box.innerHTML = h + '</div></div>'; $('#cp').onclick = function () { m--; if (m < 0) { m = 11; y--; } draw(); }; $('#cn').onclick = function () { m++; if (m > 11) { m = 0; y++; } draw(); }; }
        draw();
      },
      earnings: function () {
        var rows = [['Oct 21', 'BMW X5 2024', 'Omar Hassan', 285], ['Oct 20', 'Tesla Model 3 2024', 'Sara Ali', 160], ['Oct 18', 'Range Rover Sport 2024', 'Karim Mostafa', 360], ['Oct 15', 'Audi Q7 2024', 'Mona Khaled', 170], ['Oct 09', 'BMW X5 2024', 'Hossam Reda', 190], ['Oct 04', 'Tesla Model 3 2024', 'Dina Sherif', 240]];
        function draw(f) { var l = rows.filter(function (r) { return !f || (r[1] + r[2]).toLowerCase().indexOf(f.toLowerCase()) > -1; }), t = l.reduce(function (a, r) { return a + r[3]; }, 0); $('#etb').innerHTML = l.map(function (r) { return '<tr><td>' + r[0] + '</td><td>' + r[1] + '</td><td>' + r[2] + '</td><td><b>$' + r[3] + '</b></td></tr>'; }).join('') || '<tr><td colspan="4" class="empty">No payouts match</td></tr>'; $('#etot').textContent = money(t); }
        box.innerHTML = '<div class="card" style="padding:20px"><div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-bottom:16px"><div><small style="color:var(--muted)">Payouts shown</small><div style="font-size:28px;font-weight:800" id="etot"></div></div><input class="inp" id="ef" placeholder="Filter by car or renter" style="max-width:260px;margin-left:auto" aria-label="Filter payouts"><button class="btn" id="exp">' + ic('down', 'sm') + 'Export CSV</button></div><table class="tbl"><thead><tr><th>Date</th><th>Car</th><th>Renter</th><th>Amount</th></tr></thead><tbody id="etb"></tbody></table></div>';
        draw(''); $('#ef').oninput = function () { draw(this.value); };
        $('#exp').onclick = function () { try { var csv = 'Date,Car,Renter,Amount\n' + rows.map(function (r) { return r.join(','); }).join('\n'), a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'earnings.csv'; a.click(); A.toast('Earnings exported'); } catch (e) { A.toast('Export is not available here', 1); } };
      },
      reviews: function () {
        var rv = DS.reviews.map(function (r) { return { who: r.who, rate: r.rate, when: r.when, text: r.text, reply: '' }; });
        function draw() { box.innerHTML = '<div class="card" style="padding:20px 24px;max-width:760px"><h2 style="font-size:20px;margin-bottom:6px">Reviews</h2>' + rv.map(function (r, i) { return '<div class="rev"><div class="h">' + A.avatar(r.who, 's') + '<b>' + esc(r.who) + '</b>' + stars(r.rate) + '<small>' + r.when + '</small></div><p>' + esc(r.text) + '</p>' + (r.reply ? '<p style="margin-top:8px;padding:10px 12px;background:#f1f6ff;border-radius:10px"><b>Your reply:</b> ' + esc(r.reply) + '</p>' : '<button class="btn sm" data-rp="' + i + '" style="margin-top:8px">Reply</button>') + '</div>'; }).join('') + '</div>'; }
        draw(); box.onclick = function (e) { var b = e.target.closest('[data-rp]'); if (b) { var r = rv[+b.dataset.rp]; A.modal({ title: 'Reply to ' + esc(r.who), body: '<div class="fld"><textarea class="inp" name="t" placeholder="Thank you for renting with us..."></textarea></div>', actions: [{ label: 'Cancel' }, { label: 'Post reply', cls: 'pri', fn: function (ov) { if (!A.validate(ov, { t: [function (v) { return v.trim().length >= 3 ? '' : 'Write a reply'; }] })) return false; r.reply = $('[name=t]', ov).value.trim(); draw(); A.toast('Reply posted'); } }] }); } };
      },
      documents: function () {
        var docs = S.get('docs', [['Vehicle registration - BMW X5.pdf', '1.2 MB'], ['Insurance policy 2026.pdf', '860 KB'], ['Owner ID.jpg', '2.4 MB']]);
        function draw() { box.innerHTML = '<div class="card" style="padding:24px;max-width:720px"><div style="display:flex;align-items:center;margin-bottom:12px"><h2 style="font-size:20px">Documents</h2></div>' + docs.map(function (d, i) { return '<div class="crd"><span style="width:40px;height:40px;border-radius:10px;background:#eaf2ff;color:var(--blue);display:grid;place-items:center">' + ic('doc') + '</span><div><b>' + esc(d[0]) + '</b><br><small style="color:var(--muted)">' + d[1] + '</small></div><div class="ac"><button class="btn sm" data-dl="' + i + '">Download</button><button class="btn dng sm" data-rm="' + i + '">Delete</button></div></div>'; }).join('') + '<div class="up" id="dup" style="margin-top:12px">' + ic('up', 'lg') + '<div>Upload a document</div></div></div>'; }
        draw(); box.onclick = function (e) { var t;
          if (e.target.closest('#dup')) { docs.push(['New document ' + (docs.length + 1) + '.pdf', '540 KB']); S.set('docs', docs); draw(); A.toast('Document uploaded'); }
          else if ((t = e.target.closest('[data-rm]'))) { docs.splice(+t.dataset.rm, 1); S.set('docs', docs); draw(); A.toast('Document deleted'); }
          else if ((t = e.target.closest('[data-dl]'))) A.toast('Preview only - nothing to download', 1); };
      }
    };
    (F[tab] || F.profile)();
  };

  /* ================= LOGIN ================= */
  Pages.login = function () {
    var mode = A.q('mode') === 'signup' ? 'signup' : 'login', next = A.q('next') || 'bookings.html';
    if (!/^[a-z0-9\-]+\.html(\?[\w=&%.\-]*)?$/i.test(next)) next = 'bookings.html';
    function draw() {
      $('#abox').innerHTML = '<h1>' + (mode === 'login' ? 'Welcome back' : 'Create your account') + '</h1><p style="color:var(--muted)">' + (mode === 'login' ? 'Log in to manage your trips and cars.' : 'Join thousands of renters and owners across Egypt.') + '</p><div class="seg" role="tablist"><button data-m="login" class="' + (mode === 'login' ? 'on' : '') + '" role="tab">Log in</button><button data-m="signup" class="' + (mode === 'signup' ? 'on' : '') + '" role="tab">Sign up</button></div>' +
        '<form id="af" novalidate style="display:flex;flex-direction:column;gap:14px">' + (mode === 'signup' ? '<div class="fld"><label>Full name</label><input class="inp" name="name" autocomplete="name"></div>' : '') + '<div class="fld"><label>Email</label><input class="inp" name="email" type="email" autocomplete="email"></div><div class="fld"><label>Password</label><div class="pw"><input class="inp" name="pw" type="password" autocomplete="' + (mode === 'login' ? 'current-password' : 'new-password') + '"><button type="button" id="eye" aria-label="Show password">' + ic('eye', 'sm') + '</button></div></div>' +
        (mode === 'login' ? '<div style="display:flex;justify-content:space-between"><label class="chk"><input type="checkbox" checked> Remember me</label><a href="#" class="lnk" id="fp">Forgot password?</a></div>' : '<label class="chk"><input type="checkbox" name="tos"> <span>I agree to the <a href="#" data-modal="terms" class="lnk">Terms</a></span></label><div class="ferr" id="toserr"></div>') +
        '<button class="btn pri lg blk" type="submit">' + (mode === 'login' ? 'Log in' : 'Create account') + '</button></form><div style="text-align:center;color:var(--muted);font-size:12px">or</div><button class="btn lg blk" id="demo">Continue as demo user (Ahmed Samir)</button><p style="font-size:11.5px;color:var(--muted);text-align:center">Demo only: any email and password work, and nothing is sent or stored.</p>';
      $$('[data-m]').forEach(function (b) { b.onclick = function () { mode = b.dataset.m; draw(); }; });
      $('#eye').onclick = function () { var p = $('[name=pw]'); p.type = p.type === 'password' ? 'text' : 'password'; this.setAttribute('aria-label', p.type === 'password' ? 'Show password' : 'Hide password'); };
      var fp = $('#fp'); if (fp) fp.onclick = function (e) { e.preventDefault(); A.modal({ title: 'Reset password', body: '<div class="fld"><label>Email</label><input class="inp" name="e" type="email"></div>', actions: [{ label: 'Cancel' }, { label: 'Send reset link', cls: 'pri', fn: function (ov) { if (!A.validate(ov, { e: ['email'] })) return false; A.toast('Reset link sent (demo)'); } }] }); };
      $('#demo').onclick = function () { go({ name: DS.me.name }); };
      $('#af').onsubmit = function (e) { e.preventDefault(); var f = e.target, spec = { email: ['email'], pw: [mode === 'login' ? 'req' : 'pw'] }; if (mode === 'signup') spec.name = ['req']; if (!A.validate(f, spec)) return; if (mode === 'signup' && !f.tos.checked) { $('#toserr').textContent = 'Please accept the terms'; return; } go({ name: mode === 'signup' ? f.name.value.trim() : f.email.value.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); }) }); };
    }
    function go(u) { S.set('user', u); S.set('role', /dashboard/.test(next) ? 'owner' : 'renter'); A.toast('Welcome, ' + u.name.split(' ')[0] + '!'); setTimeout(function () { location.href = next; }, 600); }
    draw();
  };

  /* ================= OWNERS ================= */
  Pages.owners = function () {
    var pr = +(A.q('price') || 60), days = 14, f = $('#lcf');
    function calc() { var m = pr * days * 0.85; $('#calc').textContent = money(Math.round(m)); $('#pv').textContent = '$' + pr; $('#dv').textContent = days + ' days'; }
    $('#pr').value = pr; $('#dr').value = days; calc(); $('#pr').oninput = function () { pr = +this.value; calc(); }; $('#dr').oninput = function () { days = +this.value; calc(); };
    if (A.q('make')) f.make.value = A.q('make'); if (A.q('price')) f.price.value = A.q('price');
    f.onsubmit = function (e) { e.preventDefault(); if (!A.validate(f, { make: ['req'], model: ['req'], year: [function (v) { return +v >= 2010 && +v <= 2026 ? '' : 'Enter a year between 2010 and 2026'; }], price: [function (v) { return +v >= 10 && +v <= 1000 ? '' : 'Enter a price between $10 and $1000'; }], email: ['email'] })) return;
      var cars = S.get('ocars', null) || DS.seedOwnerCars(); cars.push({ id: 'm' + Date.now(), name: f.make.value + ' ' + f.model.value + ' ' + f.year.value, type: 'Sedan', trans: 'Automatic', price: +f.price.value, rating: 5.0, reviews: 0, status: 'Active', img: 'dash-' + (1 + cars.length % 4) }); S.set('ocars', cars);
      A.modal({ title: 'Your car is listed!', body: '<p>Thanks! <b>' + esc(f.make.value + ' ' + f.model.value) + '</b> is now in your owner dashboard. Log in to see it.</p>', actions: [{ label: 'Close' }, { label: 'Go to dashboard', cls: 'pri', fn: function () { if (!A.user()) { S.set('user', { name: DS.me.name }); } S.set('role', 'owner'); location.href = 'dashboard.html'; } }] }); f.reset(); };
  };
  Pages.how = function () {
    var role = 'renter', data = { renter: [['search', 'Search & compare', 'Pick your city and dates, then filter by type, price, transmission and more.'], ['cal', 'Book in minutes', 'Send a request. The owner confirms - usually within an hour.'], ['key', 'Pick up & drive', 'Meet the owner, check the car together and enjoy your trip.']], owner: [['car', 'List your car', 'Add photos, set your price and availability in a few minutes.'], ['msg', 'Approve requests', 'Review renters, chat with them and accept the bookings you like.'], ['dollar', 'Get paid', 'Earnings are paid out after every completed trip.']] };
    P.key = 'M15 7a4 4 0 11-3.8 5.2L4 19v-3h3v-3h3l1.2-1.2A4 4 0 0115 7z';
    function draw() { $('#hsteps').innerHTML = data[role].map(function (s, i) { return '<div class="card step"><i>' + (s[0] === 'key' ? '<svg class="ic lg" viewBox="0 0 24 24"><path d="M15 7a4 4 0 11-3.8 5.2L4 19v-3h3v-3h3l1.2-1.2A4 4 0 0115 7z"/></svg>' : ic(s[0], 'lg')) + '</i><span class="n">STEP ' + (i + 1) + '</span><h3>' + s[1] + '</h3><p>' + s[2] + '</p></div>'; }).join(''); $$('#roleseg button').forEach(function (b) { b.classList.toggle('on', b.dataset.r === role); b.setAttribute('aria-selected', b.dataset.r === role); }); }
    $('#roleseg').onclick = function (e) { var b = e.target.closest('button'); if (b) { role = b.dataset.r; draw(); } }; draw();
  };
  Pages.about = function () { $('#msgus').onclick = function () { A.contactModal('Get in touch'); }; };
  Pages.nf = function () { };

  A.ready(function () { if (!A.layout()) return; var fn = Pages[document.body.dataset.page]; if (fn) fn(); });
  var P = {};
})();
