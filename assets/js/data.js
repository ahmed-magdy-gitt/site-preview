/* DriveShare - fake data (all names, numbers and contacts are fictional). No network access anywhere. */
(function () {
  var DS = window.DS = {};
  function rng(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  var R = rng(20261025);
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(R() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function pick(a) { return a[Math.floor(R() * a.length)]; }

  DS.me = { name: 'Ahmed Samir', first: 'Ahmed', email: 'ahmed.samir@example.com', phone: '+20 100 555 0142', city: 'Cairo, Egypt' };
  DS.owners = [
    { id: 1, name: 'Omar Hassan', tag: 'Super Owner', rating: 4.9, cars: 12, resp: 99, since: 'Mar 2022', phone: '+20 100 555 0111' },
    { id: 2, name: 'Sara Ali', tag: 'Super Owner', rating: 4.8, cars: 9, resp: 98, since: 'Jun 2022', phone: '+20 100 555 0112' },
    { id: 3, name: 'Karim Nabil', tag: 'Top Owner', rating: 4.9, cars: 15, resp: 98, since: 'Jan 2023', phone: '+20 100 555 0113' },
    { id: 4, name: 'Mona Khaled', tag: 'Top Owner', rating: 4.8, cars: 7, resp: 96, since: 'Sep 2022', phone: '+20 100 555 0114' },
    { id: 5, name: 'Youssef Tarek', tag: 'Top Owner', rating: 4.7, cars: 8, resp: 95, since: 'Feb 2023', phone: '+20 100 555 0115' },
    { id: 6, name: 'Nadine Samy', tag: 'Super Owner', rating: 4.9, cars: 11, resp: 99, since: 'Nov 2021', phone: '+20 100 555 0116' },
    { id: 7, name: 'Ahmed ElMasry', tag: 'Top Owner', rating: 4.8, cars: 6, resp: 94, since: 'Apr 2023', phone: '+20 100 555 0117' },
    { id: 8, name: 'Heba Mohamed', tag: 'Top Owner', rating: 4.5, cars: 5, resp: 93, since: 'Jul 2023', phone: '+20 100 555 0118' },
    { id: 9, name: 'Tamer Fathy', tag: 'Top Owner', rating: 4.6, cars: 4, resp: 92, since: 'Aug 2023', phone: '+20 100 555 0119' },
    { id: 10, name: 'Layla Hamdy', tag: 'Super Owner', rating: 4.9, cars: 10, resp: 99, since: 'Dec 2021', phone: '+20 100 555 0120' },
    { id: 11, name: 'Hossam Reda', tag: 'Top Owner', rating: 4.7, cars: 6, resp: 95, since: 'May 2023', phone: '+20 100 555 0121' },
    { id: 12, name: 'Dina Sherif', tag: 'Top Owner', rating: 4.8, cars: 7, resp: 97, since: 'Oct 2022', phone: '+20 100 555 0122' }
  ];
  DS.cities = ['Cairo, Egypt', 'New Cairo, Egypt', 'Giza, Egypt', 'Alexandria, Egypt', 'Sheikh Zayed, Egypt', 'Hurghada, Egypt', 'Sharm El Sheikh, Egypt'];
  DS.types = ['Economy', 'SUV', 'Luxury', 'Family'];
  DS.features = ['Air Conditioning', 'GPS Navigation', 'Bluetooth', 'Child Seat', 'Unlimited Mileage'];
  var FKEY = ['ac', 'gps', 'bt', 'child', 'unl'];

  // first 8 = exactly the cars shown on the Browse screen (in that order)
  var first = [
    ['Toyota RAV4', 'SUV', 45, 5, 2, 'Automatic', 'Petrol', 4.9, 120, 1, 'Available', 'car-1', [1, 1, 1, 1, 0]],
    ['Mercedes-Benz C-Class', 'Luxury', 70, 5, 3, 'Automatic', 'Petrol', 4.8, 66, 2, 'Available', 'car-2', [1, 1, 1, 0, 0]],
    ['BMW X5', 'SUV', 95, 5, 3, 'Automatic', 'Petrol', 4.9, 102, 3, 'Available', 'car-3', [1, 1, 1, 0, 1]],
    ['Tesla Model 3', 'Luxury', 80, 5, 2, 'Automatic', 'Electric', 4.7, 64, 4, 'Available', 'car-4', [1, 0, 1, 0, 0]],
    ['Hyundai Elantra', 'Economy', 35, 5, 2, 'Automatic', 'Petrol', 4.6, 51, 5, 'Available', 'car-5', [1, 0, 1, 0, 0]],
    ['Range Rover Sport', 'SUV', 120, 5, 3, 'Automatic', 'Diesel', 4.9, 37, 6, 'Almost Booked', 'car-6', [1, 1, 1, 0, 1]],
    ['Audi Q7', 'SUV', 90, 7, 3, 'Automatic', 'Petrol', 4.8, 68, 7, 'Available', 'car-7', [1, 1, 1, 1, 1]],
    ['Nissan Sunny', 'Economy', 30, 5, 2, 'Manual', 'Petrol', 4.5, 44, 8, 'Available', 'car-8', [1, 0, 0, 0, 0]]
  ];
  var models = {
    Economy: ['Kia Rio', 'Hyundai Accent', 'Chevrolet Optra', 'Nissan Sentra', 'Toyota Yaris', 'Honda City', 'Suzuki Swift', 'Skoda Fabia', 'Renault Logan', 'Fiat Tipo', 'Peugeot 301', 'MG 5'],
    SUV: ['Kia Sportage', 'Nissan Qashqai', 'Hyundai Tucson', 'Toyota Fortuner', 'Mazda CX-5', 'Honda CR-V', 'Jeep Compass', 'Chery Tiggo 7', 'MG HS', 'Ford Explorer'],
    Luxury: ['BMW 5 Series', 'Audi A6', 'Mercedes-Benz E-Class', 'Lexus ES', 'Porsche Macan', 'Volvo S90', 'Genesis G80', 'Jaguar F-Pace'],
    Family: ['Toyota Innova', 'Kia Carnival', 'Hyundai Staria', 'Honda Odyssey', 'Toyota Sienna', 'Mitsubishi Xpander', 'Kia Sedona'],
    Other: ['Ford Mustang', 'Chevrolet Camaro', 'Mini Cooper', 'Fiat 500', 'Jeep Wrangler', 'Mazda MX-5', 'VW Golf GTI', 'Nissan 370Z']
  };
  var priceRange = { Economy: [25, 48], SUV: [55, 130], Luxury: [75, 220], Family: [50, 95], Other: [45, 160] };
  var photoFor = { Economy: ['car-1', 'car-5', 'car-8'], SUV: ['car-3', 'car-6', 'car-7', 'car-1'], Luxury: ['car-2', 'car-4', 'car-3'], Family: ['car-1', 'car-7', 'car-8'], Other: ['car-4', 'car-5', 'car-2'] };
  var seatsFor = { Economy: [5, 5, 5], SUV: [5, 5, 7], Luxury: [5, 5, 4], Family: [7, 7, 8], Other: [2, 4, 4] };

  var cars = [];
  first.forEach(function (f, i) {
    cars.push({ id: i + 1, name: f[0], type: f[1], price: f[2], seats: f[3], bags: f[4], trans: f[5], fuel: f[6], rating: f[7], reviews: f[8], owner: f[9], badge: f[10], img: f[11], feat: f[12], year: 2024, city: i % 3 === 2 ? 'New Cairo, Egypt' : 'Cairo, Egypt' });
  });
  // remaining 112 cars: attribute counts chosen so the sidebar numbers match the screenshot (120 / 32,28,24,18 / 92,28 / 85,18,17 / 118,76,102,24,56)
  var typePool = shuffle([].concat(rep('Economy', 30), rep('SUV', 24), rep('Luxury', 22), rep('Family', 18), rep('Other', 18)));
  var transPool = shuffle([].concat(rep('Automatic', 85), rep('Manual', 27)));
  var fuelPool = shuffle([].concat(rep('Petrol', 79), rep('Diesel', 17), rep('Electric', 16)));
  var featSets = [[118, 110], [76, 71], [102, 95], [24, 22], [56, 53]].map(function (c) { var arr = rep(1, c[1]).concat(rep(0, 112 - c[1])); return shuffle(arr); });
  var used = { Economy: 0, SUV: 0, Luxury: 0, Family: 0, Other: 0 }, names = {};
  for (var t in models) names[t] = shuffle(models[t]);
  var yrs = [2021, 2022, 2023, 2024, 2024, 2025];
  for (var k = 0; k < 112; k++) {
    var ty = typePool[k], pr = priceRange[ty], nm = names[ty][used[ty] % names[ty].length]; used[ty]++;
    var fuel = fuelPool[k]; 
    cars.push({
      id: 9 + k, name: nm, type: ty === 'Other' ? '' : ty, tag2: ty === 'Other' ? 'Sports & Fun' : ty, price: Math.round((pr[0] + R() * (pr[1] - pr[0])) / 5) * 5,
      seats: pick(seatsFor[ty]), bags: ty === 'Economy' ? 2 : 3, trans: transPool[k], fuel: fuel, rating: Math.round((4.2 + R() * 0.8) * 10) / 10, reviews: 8 + Math.floor(R() * 110),
      owner: 1 + Math.floor(R() * 12), badge: R() < 0.12 ? 'Almost Booked' : 'Available', img: pick(photoFor[ty]),
      feat: featSets.map(function (s) { return s[k]; }), year: pick(yrs), city: pick(DS.cities.slice(0, 5))
    });
  }
  function rep(v, n) { var a = []; for (var i = 0; i < n; i++) a.push(v); return a; }
  cars.forEach(function (c) { if (!c.tag2) c.tag2 = c.type; c.slug = c.name; if (!/\d{4}$/.test(c.name)) c.full = c.name + ' ' + c.year; else c.full = c.name; if (c.id <= 8) c.full = c.name + ' ' + c.year; });
  DS.cars = cars;
  DS.car = function (id) { id = +id; return cars.filter(function (c) { return c.id === id; })[0]; };
  DS.owner = function (id) { return DS.owners.filter(function (o) { return o.id === +id; })[0]; };
  DS.similar = function (c) { return cars.filter(function (x) { return x.id !== c.id && x.type === c.type && x.id > 0; }).slice(0, 8); };

  // photo helpers (all images are cropped from the provided screens)
  DS.photoOf = function (c) { return 'assets/img/' + c.img + '.jpg'; };

  // demo "today" used for countdowns / calendar
  DS.today = new Date(2026, 9, 23);
  DS.fmtD = function (d) { return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); };
  DS.parseD = function (s) { var p = s.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); };
  DS.isoD = function (d) { return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); };
  DS.days = function (a, b) { return Math.max(1, Math.round((b - a) / 864e5)); };
  DS.FEE = 15;

  DS.seedBookings = function () {
    return [
      { id: 'DS-2841', carId: 3, from: '2026-10-25', to: '2026-10-28', status: 'active', total: 300, price: 285, ownerId: 3, ref: 'Booked Oct 20, 2026' },
      { id: 'DS-2790', carId: 4, from: '2026-11-05', to: '2026-11-07', status: 'pending', total: 175, price: 160, ownerId: 4 },
      { id: 'DS-2766', carId: 6, from: '2026-11-15', to: '2026-11-18', status: 'confirmed', total: 375, price: 360, ownerId: 5 },
      { id: 'DS-2511', carId: 2, from: '2026-08-02', to: '2026-08-05', status: 'completed', total: 225, price: 210, ownerId: 2 },
      { id: 'DS-2480', carId: 5, from: '2026-07-11', to: '2026-07-13', status: 'completed', total: 85, price: 70, ownerId: 5 },
      { id: 'DS-2433', carId: 1, from: '2026-06-20', to: '2026-06-24', status: 'completed', total: 195, price: 180, ownerId: 1 },
      { id: 'DS-2390', carId: 7, from: '2026-05-08', to: '2026-05-10', status: 'completed', total: 195, price: 180, ownerId: 7 },
      { id: 'DS-2344', carId: 8, from: '2026-04-14', to: '2026-04-16', status: 'completed', total: 75, price: 60, ownerId: 8 },
      { id: 'DS-2301', carId: 2, from: '2026-03-03', to: '2026-03-06', status: 'completed', total: 225, price: 210, ownerId: 2 },
      { id: 'DS-2655', carId: 1, from: '2026-09-12', to: '2026-09-14', status: 'cancelled', total: 105, price: 90, ownerId: 1 }
    ];
  };
  DS.seedOwnerCars = function () {
    return [
      { id: 'm1', name: 'BMW X5 2024', type: 'SUV', trans: 'Automatic', price: 95, rating: 4.9, reviews: 32, status: 'Active', img: 'dash-1' },
      { id: 'm2', name: 'Tesla Model 3 2024', type: 'Sedan', trans: 'Electric', price: 80, rating: 4.8, reviews: 24, status: 'Active', img: 'dash-2' },
      { id: 'm3', name: 'Range Rover Sport 2024', type: 'SUV', trans: 'Automatic', price: 120, rating: 4.9, reviews: 18, status: 'Active', img: 'dash-3' },
      { id: 'm4', name: 'Audi Q7 2024', type: 'SUV', trans: 'Automatic', price: 85, rating: 4.7, reviews: 12, status: 'Inactive', img: 'dash-4' }
    ];
  };
  DS.seedOwnerBookings = function () {
    return [
      { id: 'OB-1', who: 'Omar Hassan', rate: 4.9, n: 72, car: 'BMW X5 2024', ct: 'SUV', dates: 'Oct 25 - Oct 28', days: '3 days', status: 'Pending', amount: 285 },
      { id: 'OB-2', who: 'Sara Ali', rate: 4.8, n: 8, car: 'Tesla Model 3 2024', ct: 'Sedan', dates: 'Oct 20 - Oct 22', days: '2 days', status: 'Confirmed', amount: 160 },
      { id: 'OB-3', who: 'Karim Mostafa', rate: 4.7, n: 6, car: 'Range Rover Sport 2024', ct: 'SUV', dates: 'Oct 18 - Oct 21', days: '3 days', status: 'Completed', amount: 360 },
      { id: 'OB-4', who: 'Mona Khaled', rate: 4.9, n: 10, car: 'Audi Q7 2024', ct: 'SUV', dates: 'Oct 15 - Oct 17', days: '2 days', status: 'Cancelled', amount: 170 }
    ];
  };
  DS.reviews = [
    { who: 'Mostafa A.', rate: 5, when: '2 weeks ago', text: 'Spotless car and the owner was very responsive. Pick-up took five minutes.' },
    { who: 'Reem H.', rate: 5, when: '1 month ago', text: 'Drove to the North Coast and back - smooth, quiet and comfortable. Would rent again.' },
    { who: 'Adel S.', rate: 4, when: '1 month ago', text: 'Great value. Small delay on the drop-off but the owner was flexible.' },
    { who: 'Farida M.', rate: 5, when: '2 months ago', text: 'Exactly as described. The sound system is amazing.' }
  ];
  DS.threads = function () {
    return [
      { id: 't1', ownerId: 3, car: 'BMW X5 2024', unread: 2, msgs: [{ me: 0, t: 'Hi Ahmed! Your booking for the BMW X5 is confirmed.', at: '10:02 AM' }, { me: 1, t: 'Great, thank you! Can I pick it up at 10 AM?', at: '10:05 AM' }, { me: 0, t: 'Of course. I will meet you at the usual spot in Zamalek.', at: '10:07 AM' }, { me: 0, t: 'Please bring your driver license and ID.', at: '10:08 AM' }] },
      { id: 't2', ownerId: 4, car: 'Tesla Model 3 2024', unread: 1, msgs: [{ me: 0, t: 'Hello! I received your request for Nov 5 - Nov 7. I will confirm shortly.', at: 'Yesterday' }] },
      { id: 't3', ownerId: 5, car: 'Range Rover Sport 2024', unread: 0, msgs: [{ me: 1, t: 'Is the Range Rover available for a longer trip?', at: 'Mon' }, { me: 0, t: 'Yes - up to 5 days at the same daily rate.', at: 'Mon' }] }
    ];
  };
})();
