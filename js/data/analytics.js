/* IRCTC OneTrip — SIMULATED partner + admin analytics (Builder B).
 * ALL numbers in this file are synthetic, generated for the academic prototype. They are NOT
 * IRCTC, BHASHINI, bank or survey data. Derived figures (GTV, commission, attach rate, settlements,
 * policy counts) are computed from the base series below so every dashboard stays internally consistent.
 * Pilot framing: 10 destinations, 12 weeks ending 9 Aug – 25 Oct 2026.
 */
(function () {
  'use strict';
  var OT = window.OT;
  OT.data = OT.data || {};

  function sum(a) { return a.reduce(function (x, y) { return x + y; }, 0); }
  function r1(v) { return Math.round(v * 10) / 10; }

  var weeks = ['9 Aug', '16 Aug', '23 Aug', '30 Aug', '6 Sep', '13 Sep', '20 Sep', '27 Sep', '4 Oct', '11 Oct', '18 Oct', '25 Oct'];

  /* ---- Categories (AOV & take-rate match the Insights revenue model assumptions) ---- */
  var cats = [
    { key: 'hotel', name: 'Hotel / stay', aov: 3750, take: 0.12, orders: [2100, 2350, 2620, 2800, 3050, 3390, 3700, 4120, 4480, 5050, 5640, 6180] },
    { key: 'cab', name: 'Station cab', aov: 450, take: 0.10, orders: [3300, 3620, 3980, 4250, 4610, 5020, 5400, 5900, 6350, 7020, 7700, 8350] },
    { key: 'food', name: 'E-catering', aov: 250, take: 0.15, orders: [4200, 4500, 4850, 5050, 5400, 5800, 6150, 6600, 7000, 7600, 8200, 8800] },
    { key: 'tour', name: 'Sightseeing', aov: 1200, take: 0.15, orders: [520, 580, 650, 700, 760, 850, 930, 1040, 1150, 1320, 1490, 1650] }
  ];
  cats.forEach(function (c) {
    c.gtv = c.orders.map(function (o) { return o * c.aov; });
    c.commission = c.gtv.map(function (g) { return g * c.take; });
  });

  var eligible = [228000, 231000, 236000, 234000, 241000, 247000, 252000, 258000, 266000, 281000, 296000, 309000];
  var OVERLAP = 1.45; // avg add-on orders per trip that has at least one add-on
  var orders = weeks.map(function (_, i) { return sum(cats.map(function (c) { return c.orders[i]; })); });
  var trips = orders.map(function (o) { return Math.round(o / OVERLAP); });
  var gtv = weeks.map(function (_, i) { return sum(cats.map(function (c) { return c.gtv[i]; })); });
  var commission = weeks.map(function (_, i) { return sum(cats.map(function (c) { return c.commission[i]; })); });
  var attach = trips.map(function (t, i) { return Math.round(t / eligible[i] * 10000) / 100; }); // % with 2 dp

  var registered = [41200, 52800, 65900, 79400, 94800, 112300, 131500, 153200, 176800, 204100, 234900, 268400];
  var activeUsers = registered.map(function (r, i) { return Math.round(r * (0.36 + i * 0.004)); });
  var livePartners = [412, 468, 531, 598, 664, 731, 803, 868, 934, 991, 1036, 1078];

  var totals = {
    orders: sum(orders), trips: sum(trips), gtv: sum(gtv), commission: sum(commission), eligible: sum(eligible)
  };
  totals.takeRate = totals.commission / totals.gtv;
  totals.attach = totals.trips / totals.eligible * 100;

  /* ---- Complaints, refunds & SLA ---- */
  var per1000 = [5.1, 4.9, 4.8, 4.6, 4.5, 4.3, 4.2, 4.0, 3.9, 3.8, 3.7, 3.6];
  var complaintsWk = orders.map(function (o, i) { return Math.round(o / 1000 * per1000[i]); });
  var compTotal = sum(complaintsWk);
  var compCats = [
    { name: 'Refund delay', share: 0.22, sla: 93.8, avgH: 31 },
    { name: 'Cab no-show / late pickup', share: 0.19, sla: 96.1, avgH: 9 },
    { name: 'Hotel not as described', share: 0.16, sla: 91.2, avgH: 38 },
    { name: 'Payment debited, not confirmed', share: 0.14, sla: 98.4, avgH: 6 },
    { name: 'Meal late / quality', share: 0.12, sla: 97.0, avgH: 11 },
    { name: 'Overbooking / check-in denied', share: 0.09, sla: 89.5, avgH: 22 },
    { name: 'Translation / language issue', share: 0.04, sla: 95.2, avgH: 14 },
    { name: 'Other', share: 0.04, sla: 94.0, avgH: 27 }
  ].map(function (c) { c.count = Math.round(compTotal * c.share); return c; });
  var slaWithin = compCats.reduce(function (a, c) { return a + c.count * c.sla; }, 0) / sum(compCats.map(function (c) { return c.count; }));

  var refundRate = 0.031; // share of add-on orders refunded (cancellations + service failures)
  var refundsCount = Math.round(totals.orders * refundRate);
  var refundValue = Math.round(totals.gtv * 0.029);
  var refunds = {
    count: refundsCount,
    value: refundValue,
    fromEscrowPct: 97.4,
    tatProviderCancelH: 0.4,
    tatTravellerCancelH: 26,
    within72hPct: 96.8,
    pending: 214,
    queue: [
      { id: 'RF-88213', ref: 'OT-HTL-K29Q1', partner: 'Hotel Ganga Darshan, Varanasi', amount: 4200, reason: 'Traveller cancelled (>24 h)', age: '5 h', status: 'processing', owner: 'Partner → Escrow bank' },
      { id: 'RF-88207', ref: 'OT-CAB-M83J0', partner: 'Puri Coastal Cabs', amount: 450, reason: 'Driver no-show', age: '9 h', status: 'processing', owner: 'Partner → Escrow bank' },
      { id: 'RF-88191', ref: 'OT-HTL-T61B8', partner: 'Shirdi Sai Residency', amount: 2650, reason: 'Overbooking (partner fault)', age: '26 h', status: 'pending', owner: 'Partner (penalty applies)' },
      { id: 'RF-88174', ref: 'OT-FD-W55D3', partner: 'IRCTC e-Catering (sample)', amount: 260, reason: 'Meal not delivered', age: '41 h', status: 'pending', owner: 'IRCTC' },
      { id: 'RF-88150', ref: 'OT-TUR-P11X2', partner: 'Pink City Heritage Walks', amount: 2400, reason: 'Tour cancelled by operator', age: '52 h', status: 'pending', owner: 'Partner → Escrow bank', breach: true }
    ]
  };

  /* ---- Partners ---- */
  var partnerTypes = [
    { label: 'Hotels', value: 426 }, { label: 'Homestays & dharamshalas', value: 162 }, { label: 'Cab operators', value: 338 },
    { label: 'Tour operators', value: 104 }, { label: 'Caterers', value: 48 }
  ];
  var partners = [
    { id: 'P-101', name: 'Hotel Shivalik View', city: 'Chandigarh', type: 'Hotel', bookings: 256, revenue: 1183400, conv: 5.6, cancel: 7.0, rating: 4.4, complaints: 2.3, respH: 1.2 },
    { id: 'P-114', name: 'Hotel Ganga Darshan', city: 'Varanasi', type: 'Hotel', bookings: 612, revenue: 2478600, conv: 6.4, cancel: 5.1, rating: 4.5, complaints: 1.8, respH: 0.8 },
    { id: 'P-122', name: 'Tirumala Pilgrim Stay', city: 'Tirupati', type: 'Dharamshala', bookings: 734, revenue: 1321200, conv: 7.9, cancel: 3.9, rating: 4.6, complaints: 1.1, respH: 0.6 },
    { id: 'P-131', name: 'Puri Coastal Cabs', city: 'Puri', type: 'Cab', bookings: 1890, revenue: 850500, conv: 9.8, cancel: 8.6, rating: 4.1, complaints: 4.9, respH: 0.3 },
    { id: 'P-138', name: 'Meenakshi Heritage Inn', city: 'Madurai', type: 'Hotel', bookings: 341, revenue: 1146000, conv: 5.2, cancel: 6.2, rating: 4.3, complaints: 2.6, respH: 1.9 },
    { id: 'P-145', name: 'Pink City Heritage Walks', city: 'Jaipur', type: 'Tour', bookings: 488, revenue: 585600, conv: 4.1, cancel: 11.4, rating: 3.9, complaints: 6.1, respH: 4.8 },
    { id: 'P-152', name: 'Konkan Rail Stays', city: 'Goa', type: 'Homestay', bookings: 296, revenue: 1302400, conv: 3.8, cancel: 9.2, rating: 4.2, complaints: 3.4, respH: 2.6 },
    { id: 'P-160', name: 'Shirdi Sai Residency', city: 'Shirdi', type: 'Hotel', bookings: 522, revenue: 1383300, conv: 6.8, cancel: 6.9, rating: 4.0, complaints: 5.2, respH: 3.1 },
    { id: 'P-167', name: 'Golden Temple Transfers', city: 'Amritsar', type: 'Cab', bookings: 1312, revenue: 538000, conv: 10.4, cancel: 4.4, rating: 4.5, complaints: 1.6, respH: 0.4 },
    { id: 'P-173', name: 'Kalka-Shimla Toy Train Tours', city: 'Shimla', type: 'Tour', bookings: 219, revenue: 394200, conv: 4.6, cancel: 7.8, rating: 4.4, complaints: 2.1, respH: 1.4 }
  ].map(function (p) {
    p.status = p.rating >= 4.3 && p.complaints < 3 && p.cancel < 8 ? 'good' : (p.rating < 4.0 || p.complaints > 5 || p.cancel > 10) ? 'action' : 'watch';
    return p;
  });

  /* ---- Destination demand (rail arrivals on pilot routes, thousands / month) ---- */
  var months = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
  var destinations = [
    { city: 'Tirupati', code: 'TPTY', m: [148, 142, 139, 144, 151, 158], fwd: 6, share: 0.13, note: 'Brahmotsavam (Oct)' },
    { city: 'Varanasi', code: 'BSB', m: [96, 82, 88, 101, 94, 132], fwd: 38, share: 0.15, note: 'Dev Deepawali (Nov) — forward bookings spike' },
    { city: 'Shirdi', code: 'SNSI', m: [92, 88, 90, 94, 97, 104], fwd: 5, share: 0.087, note: 'Steady pilgrimage demand' },
    { city: 'Puri', code: 'PURI', m: [71, 76, 124, 68, 64, 82], fwd: 12, share: 0.09, note: 'Rath Yatra (Jul) peak' },
    { city: 'Chandigarh', code: 'CDG', m: [66, 71, 62, 64, 68, 77], fwd: 11, share: 0.11, note: 'Gateway to Shimla / Kasauli' },
    { city: 'Shimla', code: 'SML', m: [82, 94, 51, 43, 52, 69], fwd: 8, share: 0.06, note: 'Summer + early winter peaks' },
    { city: 'Jaipur', code: 'JP', m: [64, 41, 38, 46, 58, 79], fwd: 22, share: 0.10, note: 'Season opens Oct' },
    { city: 'Goa', code: 'MAO', m: [61, 32, 24, 29, 44, 72], fwd: 31, share: 0.12, note: 'Post-monsoon surge' },
    { city: 'Amritsar', code: 'ASR', m: [58, 55, 57, 61, 63, 74], fwd: 14, share: 0.076, note: 'Gurpurab (Nov)' },
    { city: 'Madurai', code: 'MDU', m: [58, 54, 52, 57, 61, 73], fwd: 9, share: 0.077, note: 'Festive season' }
  ];
  destinations.forEach(function (d) {
    d.total = sum(d.m);
    d.orders = Math.round(totals.orders * d.share);
    d.gtv = Math.round(totals.gtv * d.share);
  });

  /* ---- Language, translation quality & support (SIMULATED — not in the survey) ---- */
  var languages = [
    { code: 'en', name: 'English', share: 36.4, voice: 9, asr: 0.94, nmt: null, review: 0, original: 0, fcr: 78, esc: 9.8, csat: 4.3, frt: 18 },
    { code: 'hi', name: 'Hindi', share: 30.8, voice: 34, asr: 0.91, nmt: 0.93, review: 1.2, original: 3.1, fcr: 76, esc: 10.6, csat: 4.4, frt: 21 },
    { code: 'bn', name: 'Bengali', share: 6.2, voice: 27, asr: 0.87, nmt: 0.89, review: 2.4, original: 5.2, fcr: 71, esc: 13.1, csat: 4.2, frt: 26 },
    { code: 'mr', name: 'Marathi', share: 5.4, voice: 25, asr: 0.86, nmt: 0.88, review: 2.6, original: 5.6, fcr: 72, esc: 12.7, csat: 4.2, frt: 25 },
    { code: 'ta', name: 'Tamil', share: 5.1, voice: 29, asr: 0.85, nmt: 0.87, review: 2.9, original: 6.1, fcr: 70, esc: 13.8, csat: 4.1, frt: 27 },
    { code: 'te', name: 'Telugu', share: 4.6, voice: 28, asr: 0.85, nmt: 0.87, review: 3.0, original: 6.3, fcr: 70, esc: 14.0, csat: 4.1, frt: 28 },
    { code: 'kn', name: 'Kannada', share: 3.3, voice: 22, asr: 0.83, nmt: 0.86, review: 3.4, original: 7.0, fcr: 68, esc: 14.9, csat: 4.0, frt: 29 },
    { code: 'ml', name: 'Malayalam', share: 2.7, voice: 24, asr: 0.82, nmt: 0.85, review: 3.8, original: 7.6, fcr: 67, esc: 15.6, csat: 4.0, frt: 31 },
    { code: 'gu', name: 'Gujarati', share: 2.6, voice: 19, asr: 0.84, nmt: 0.87, review: 2.8, original: 6.0, fcr: 71, esc: 13.2, csat: 4.2, frt: 26 },
    { code: 'pa', name: 'Punjabi', share: 1.7, voice: 31, asr: 0.83, nmt: 0.86, review: 3.5, original: 7.2, fcr: 69, esc: 14.6, csat: 4.1, frt: 30 },
    { code: 'or', name: 'Odia', share: 1.2, voice: 26, asr: 0.79, nmt: 0.82, review: 5.6, original: 10.4, fcr: 63, esc: 17.9, csat: 3.8, frt: 36 }
  ];
  var nonEnglish = r1(100 - languages[0].share);
  var policyCheck = { translated: 18420, autoVerified: 96.2, humanVerified: 3.4, showedOriginal: 0.4, displayedUnverified: 0 };
  var supportTrend = { fcr: [66, 67, 68, 69, 70, 71, 72, 72, 73, 74, 74, 75], esc: [16.2, 15.6, 15.1, 14.4, 13.9, 13.3, 12.8, 12.4, 12.0, 11.7, 11.4, 11.2] };

  /* ---- Bank & financial products (concepts; issuer = "Partner Bank (sample)") ---- */
  var settledToPartners = Math.round(totals.gtv - totals.commission - refundValue);
  var payments = {
    successRate: 98.6, autoReversal1h: 99.1, chargebackRate: 0.08, reconExceptions: 0.3,
    escrowBalance: Math.round(gtv[11] * 1.3), settledToPartners: settledToPartners, t1Pct: 93.6,
    t1Trend: [84.2, 86.0, 87.1, 88.4, 89.0, 90.2, 91.1, 91.8, 92.4, 92.9, 93.3, 93.6],
    fraudFlags: 61, fraudConfirmed: 9, fraudBlockedValue: 412000
  };
  var shieldPolicies = Math.round(totals.trips * 0.074);
  var products = [
    { seg: 'Retail traveller', name: 'OneTrip Rewards Card', what: 'Co-branded RuPay credit card; points on rail + add-ons', adoptionLabel: 'Cards issued', adoption: 4860, adoptionRate: '1.8% of active users', volume: 69000000, volumeLabel: 'Card spend', riskLabel: '30+ DPD', risk: 1.4, target: '2% of active users carry card (yr 1)', status: 'on' },
    { seg: 'Retail traveller', name: 'Trip Shield', what: 'Opt-in cover: train delay, missed hotel night, baggage (licensed insurer)', adoptionLabel: 'Policies', adoption: shieldPolicies, adoptionRate: '7.4% of OneTrip trips', volume: shieldPolicies * 69, volumeLabel: 'Premium (GWP)', riskLabel: 'Claim rate', risk: 3.1, target: '8% opt-in; claim TAT < 72 h (now 41 h)', status: 'near' },
    { seg: 'Retail traveller', name: 'Trip EMI / Pay-in-3', what: 'Spread a ₹10k+ family trip over 3 months (bank / NBFC underwrites)', adoptionLabel: 'Loans', adoption: 640, adoptionRate: '2.1% of eligible baskets', volume: 8200000, volumeLabel: 'Disbursed', riskLabel: 'Default', risk: 1.3, target: '< 3% of eligible baskets; default < 2%', status: 'on' },
    { seg: 'Tourism partner', name: 'Settle-Fast + Escrow', what: 'Escrow until service delivered; T+1 auto-split settlement + GST invoice', adoptionLabel: 'Partners', adoption: 1078, adoptionRate: '100% of live partners', volume: settledToPartners, volumeLabel: 'Settled', riskLabel: 'Dispute rate', risk: 0.21, target: '90% of settlements by T+1 (now 93.6%)', status: 'on' },
    { seg: 'Tourism partner', name: 'OneTrip Growth Line', what: 'Seasonal working capital informed by consented 6-month sales history', adoptionLabel: 'Approved / applied', adoption: 118, adoptionRate: '118 of 212 applications', volume: 46000000, volumeLabel: 'Sanctioned', riskLabel: 'NPA', risk: 1.1, target: '300 partners in pilot; NPA < 3%', status: 'near' },
    { seg: 'Tourism partner', name: 'Smart POS / QR kit', what: 'Merchant account, UPI QR + soundbox, EMI-on-POS', adoptionLabel: 'Small partners', adoption: 486, adoptionRate: '64% digitally onboarded', volume: 31000000, volumeLabel: 'Monthly volume', riskLabel: 'Fraud rate', risk: 0.04, target: '70% of small partners onboarded', status: 'near' },
    { seg: 'Financial inclusion', name: 'Yatra Saathi assisted booking', what: 'BC agents at 40 stations; voice-guided regional flow; account optional', adoptionLabel: 'Assisted trips', adoption: 8420, adoptionRate: '17.8% opened a first account', volume: 21900000, volumeLabel: 'Trip value', riskLabel: 'Complaint rate', risk: 0.6, target: '1 lakh trips / yr; 20% first accounts', status: 'near' },
    { seg: 'Financial inclusion', name: 'Teerth Bachat RD', what: '₹200/month pilgrimage recurring deposit, redeemable for an IRCTC package', adoptionLabel: 'RDs opened', adoption: 3150, adoptionRate: 'Early: redemption from 2027', volume: 6300000, volumeLabel: 'Deposits', riskLabel: 'Premature closure', risk: 4.2, target: '50k RDs; 60% redeemed for trips', status: 'early' },
    { seg: 'Financial inclusion', name: 'Micro-partner Mudra link', what: 'Referral to Mudra / PM SVANidhi-type loans; OneTrip ratings as evidence', adoptionLabel: 'Loans referred', adoption: 96, adoptionRate: '96 micro-partners', volume: 4800000, volumeLabel: 'Disbursed', riskLabel: 'Repayment', risk: 97.2, riskGood: true, target: '1,000 micro-partners; repayment > 95%', status: 'early' }
  ];

  /* ---- Demo partner P-101: Hotel Shivalik View, Chandigarh ---- */
  var pBookings = [14, 16, 15, 18, 19, 21, 20, 23, 24, 26, 29, 31];
  var pAvg = [4520, 4480, 4610, 4550, 4590, 4660, 4620, 4700, 4640, 4710, 4690, 4750];
  var pViews = [306, 339, 309, 352, 365, 392, 366, 409, 421, 446, 488, 508];
  var pCancel = [1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 1, 2];
  var p101 = {
    id: 'P-101', name: 'Hotel Shivalik View', city: 'Chandigarh', station: 'CDG', distanceKm: 1.2,
    gst: '04AAXXX0000X1Z5 (sample)', contact: 'frontdesk@shivalikview.example',
    weeks: weeks,
    bookings: pBookings,
    revenue: pBookings.map(function (b, i) { return b * pAvg[i]; }),
    views: pViews,
    enquiryCounts: [38, 41, 37, 44, 46, 49, 47, 53, 55, 58, 63, 66],
    cancellations: pCancel,
    conversion: pBookings.map(function (b, i) { return Math.round(b / pViews[i] * 1000) / 10; }),
    cancelReasons: [{ label: 'Plans changed', value: 8 }, { label: 'Train cancelled / delayed', value: 5 }, { label: 'Found cheaper', value: 3 }, { label: 'Other', value: 2 }],
    rating: 4.4, reviews: 1284,
    ratingDist: [{ label: '5 ★', value: 715 }, { label: '4 ★', value: 357 }, { label: '3 ★', value: 127 }, { label: '2 ★', value: 54 }, { label: '1 ★', value: 31 }],
    sentiment: [{ label: 'Positive', value: 987 }, { label: 'Neutral', value: 188 }, { label: 'Negative', value: 109 }],
    reviewLangs: [{ label: 'Hindi', value: 491 }, { label: 'English', value: 448 }, { label: 'Punjabi', value: 176 }, { label: 'Other Indian languages', value: 169 }],
    demandRadar: [
      { origin: 'New Delhi (NDLS)', arrivals: 4120, lead: 9 }, { origin: 'Mumbai (CSMT/BCT)', arrivals: 610, lead: 21 },
      { origin: 'Lucknow (LKO)', arrivals: 488, lead: 14 }, { origin: 'Amritsar (ASR)', arrivals: 352, lead: 6 },
      { origin: 'Jaipur (JP)', arrivals: 214, lead: 12 }, { origin: 'Other origins', arrivals: 37, lead: null, suppressed: true }
    ],
    listings: [
      { id: 'L-101-1', type: 'hotel', title: 'Deluxe Double Room (AC, breakfast)', price: 2650, unit: 'night', units: 12, capacity: 2, checkin: '14:00', policy: 'Full refund up to 24 h before check-in; 50% refund after that.', status: 'live', earlyCheckInFee: 500 },
      { id: 'L-101-2', type: 'hotel', title: 'Standard Room (AC)', price: 2200, unit: 'night', units: 8, capacity: 2, checkin: '14:00', policy: 'Free cancellation up to 24 h before check-in.', status: 'live' },
      { id: 'L-101-3', type: 'hotel', title: 'Family Suite (up to 4 guests)', price: 3900, unit: 'night', units: 4, capacity: 4, checkin: '14:00', policy: 'Free cancellation up to 48 h before check-in; 50% refund after.', status: 'live' },
      { id: 'L-101-4', type: 'cab', title: 'Station pickup: CDG → hotel (sedan)', price: 350, unit: 'trip', units: 3, capacity: 4, checkin: '', policy: 'Free cancellation up to 2 h before pickup.', status: 'live' },
      { id: 'L-101-5', type: 'tour', title: 'Half-day: Rock Garden & Sukhna Lake', price: 1200, unit: 'person', units: 10, capacity: 10, checkin: '', policy: '', status: 'draft' }
    ],
    sampleBookings: [
      { ref: 'OT-HTL-8Q2LM', guest: 'R. K.', title: 'Deluxe Double Room (AC, breakfast)', checkin: '2026-11-07', nights: 2, amount: 5300, status: 'confirmed', lang: 'Hindi', paidAt: '2026-10-29T10:12:00+05:30' },
      { ref: 'OT-HTL-3T7VA', guest: 'S. M.', title: 'Family Suite (up to 4 guests)', checkin: '2026-11-08', nights: 1, amount: 3900, status: 'confirmed', lang: 'Punjabi', paidAt: '2026-10-28T19:40:00+05:30' },
      { ref: 'OT-CAB-5J1KD', guest: 'A. I.', title: 'Station pickup: CDG → hotel (sedan)', checkin: '2026-11-04', nights: 0, amount: 350, status: 'confirmed', lang: 'Tamil', paidAt: '2026-10-27T08:05:00+05:30' },
      { ref: 'OT-HTL-9W4EZ', guest: 'P. D.', title: 'Standard Room (AC)', checkin: '2026-11-02', nights: 3, amount: 6600, status: 'confirmed', lang: 'English', paidAt: '2026-10-25T14:22:00+05:30' },
      { ref: 'OT-HTL-1C8RN', guest: 'N. B.', title: 'Deluxe Double Room (AC, breakfast)', checkin: '2026-10-30', nights: 2, amount: 5300, status: 'cancelled', lang: 'Bengali', paidAt: '2026-10-21T11:51:00+05:30' },
      { ref: 'OT-HTL-6F3QS', guest: 'V. S.', title: 'Deluxe Double Room (AC, breakfast)', checkin: '2026-10-24', nights: 2, amount: 5300, status: 'completed', lang: 'Hindi', paidAt: '2026-10-15T09:30:00+05:30' }
    ],
    enquiries: [
      { id: 'EQ-1041', partnerId: 'P-101', guest: 'Traveller S. (2 pax)', lang: 'hi', langName: 'Hindi', listingId: 'L-101-1', dates: '14–16 Nov 2026', pax: 2, topic: 'earlyCheckin', received: '2026-11-01T09:12:00+05:30',
        original: 'क्या 14 नवंबर को सुबह 11:30 बजे अर्ली चेक-इन मिल सकता है? हम दो लोग हैं, ट्रेन 12011 से 11:05 पर पहुँचेंगे।',
        english: 'Can we get early check-in at 11:30 AM on 14 Nov? We are two people, arriving by train 12011 at 11:05.' },
      { id: 'EQ-1042', partnerId: 'P-101', guest: 'Traveller G. (4 pax)', lang: 'pa', langName: 'Punjabi', listingId: 'L-101-3', dates: '21–23 Nov 2026', pax: 4, topic: 'family', received: '2026-10-31T18:47:00+05:30',
        original: 'ਕੀ 21 ਨਵੰਬਰ ਲਈ ਚਾਰ ਲੋਕਾਂ ਦਾ ਫੈਮਿਲੀ ਕਮਰਾ ਮਿਲੇਗਾ? ਸਾਡੇ ਨਾਲ ਬਜ਼ੁਰਗ ਮਾਤਾ-ਪਿਤਾ ਵੀ ਹਨ।',
        english: 'Is a family room for four people available on 21 Nov? Our elderly parents are travelling with us.' },
      { id: 'EQ-1043', partnerId: 'P-101', guest: 'Traveller A. (3 pax)', lang: 'ta', langName: 'Tamil', listingId: 'L-101-4', dates: '18 Nov 2026', pax: 3, topic: 'pickup', received: '2026-10-31T13:05:00+05:30',
        original: 'ரயில் நிலையத்திலிருந்து பிக்அப் கிடைக்குமா? எங்கள் ரயில் 12011 காலை 11:05 மணிக்கு வரும்.',
        english: 'Is pickup from the railway station available? Our train 12011 arrives at 11:05 AM.' },
      { id: 'EQ-1044', partnerId: 'P-101', guest: 'Traveller M. (2 pax)', lang: 'en', langName: 'English', listingId: 'L-101-1', dates: '28–30 Nov 2026', pax: 2, topic: 'food', received: '2026-10-30T21:16:00+05:30',
        original: 'Is breakfast included, and do you have Jain food options? We are booking for 28–30 Nov.',
        english: 'Is breakfast included, and do you have Jain food options? We are booking for 28–30 Nov.' },
      { id: 'EQ-1045', partnerId: 'P-101', guest: 'Traveller D. (2 pax)', lang: 'bn', langName: 'Bengali', listingId: 'L-101-2', dates: '18–19 Nov 2026', pax: 2, topic: 'refund', received: '2026-10-30T10:02:00+05:30',
        original: 'বাতিল করলে কত টাকা ফেরত পাব? আমরা ১৮ নভেম্বর বুক করতে চাই।',
        english: 'How much refund will I get if I cancel? We want to book for 18 Nov.' }
    ],
    feedback: [
      { id: 'RV-1', rating: 5, sentiment: 'positive', lang: 'hi', langName: 'Hindi', date: '2026-10-26', stay: 'Deluxe Double',
        original: 'स्टेशन से बहुत पास है, स्टाफ़ ने जल्दी चेक-इन करवा दिया। नाश्ता अच्छा था।', english: 'Very close to the station; staff arranged early check-in. Breakfast was good.' },
      { id: 'RV-2', rating: 4, sentiment: 'positive', lang: 'en', langName: 'English', date: '2026-10-22', stay: 'Standard Room',
        original: 'Clean rooms and the OneTrip itinerary matched the pickup time exactly. Wi-Fi was patchy.', english: 'Clean rooms and the OneTrip itinerary matched the pickup time exactly. Wi-Fi was patchy.' },
      { id: 'RV-3', rating: 5, sentiment: 'positive', lang: 'pa', langName: 'Punjabi', date: '2026-10-19', stay: 'Family Suite',
        original: 'ਬਜ਼ੁਰਗਾਂ ਲਈ ਲਿਫ਼ਟ ਅਤੇ ਗਰਾਊਂਡ ਫਲੋਰ ਕਮਰਾ ਮਿਲਿਆ। ਬਹੁਤ ਵਧੀਆ ਸੇਵਾ।', english: 'We got a lift and a ground-floor room for the elderly. Very good service.' },
      { id: 'RV-4', rating: 2, sentiment: 'negative', lang: 'bn', langName: 'Bengali', date: '2026-10-14', stay: 'Deluxe Double',
        original: 'ঘর পরিষ্কার ছিল কিন্তু চেক-ইনে এক ঘণ্টা অপেক্ষা করতে হয়েছে।', english: 'The room was clean but we had to wait an hour at check-in.' },
      { id: 'RV-5', rating: 4, sentiment: 'neutral', lang: 'ta', langName: 'Tamil', date: '2026-10-11', stay: 'Station pickup',
        original: 'பிக்அப் நேரத்திற்கு வந்தது. ஓட்டுநருக்கு தமிழ் தெரியவில்லை, ஆனால் ஆப் மொழிபெயர்ப்பு உதவியது.', english: 'Pickup arrived on time. The driver did not know Tamil, but the app translation helped.' },
      { id: 'RV-6', rating: 3, sentiment: 'neutral', lang: 'hi', langName: 'Hindi', date: '2026-10-06', stay: 'Standard Room',
        original: 'कमरा ठीक था, पर दिवाली के आसपास दाम थोड़े ज़्यादा लगे।', english: 'The room was okay, but prices felt a bit high around Diwali.' }
    ],
    agentTips: [
      { kind: 'warn', text: 'Listing “Half-day: Rock Garden & Sukhna Lake” has no cancellation policy, so it cannot go live (Trust rule TRUST-01).', action: 'listings' },
      { kind: 'info', text: '3 new enquiries are waiting; average reply time this week is 1.2 h (target under 2 h).', action: 'enquiries' },
      { kind: 'info', text: 'Demand Radar: arrivals from NDLS on 13–15 Nov are up 18% vs last month. Consider opening 2 more Deluxe rooms.', action: 'pricing' }
    ]
  };

  // keep the admin partner table consistent with the P-101 partner dashboard
  partners[0].revenue = sum(p101.revenue);
  partners[0].bookings = sum(p101.bookings);
  partners[0].conv = Math.round(sum(p101.bookings) / sum(p101.views) * 1000) / 10;
  partners[0].cancel = Math.round(sum(p101.cancellations) / sum(p101.bookings) * 1000) / 10;

  OT.data.analytics = {
    SIMULATED: true,
    note: 'Simulated pilot data (10 destinations, 12 weeks ending 25 Oct 2026). Not IRCTC, bank, BHASHINI or survey data.',
    weeks: weeks,
    cats: cats,
    eligible: eligible,
    orders: orders, trips: trips, gtv: gtv, commission: commission, attach: attach, overlap: OVERLAP,
    totals: totals,
    users: { registered: registered, active: activeUsers, livePartners: livePartners, registeredPartners: 1284, pendingKyc: 131, partnerTypes: partnerTypes,
      byLangNew: languages.map(function (l) { return { label: l.name, value: Math.round(registered[11] * l.share / 100) }; }),
      repeatRate: 27.4, sso: 81.2 },
    complaints: { weekly: complaintsWk, per1000: per1000, total: compTotal, cats: compCats, slaWithin: slaWithin, slaTargetH: 48, open: 132, escalatedFromAgent: 11.2 },
    refunds: refunds,
    partners: partners,
    months: months,
    destinations: destinations,
    languages: languages,
    nonEnglishShare: nonEnglish,
    policyCheck: policyCheck,
    supportTrend: supportTrend,
    payments: payments,
    products: products,
    guardrail: { ticketSuccess: 99.2, ticketSuccessBaseline: 99.2, p95Latency: 1.8, p95Baseline: 1.8, dismissRate: 22.6, optOutRate: 1.9, cardsPerStage: 1 },
    p101: p101,

    /** Live bookings made in this browser via the traveller flow (store), normalised. */
    live: function () {
      var list = (OT.store && OT.store.get('bookings', [])) || [];
      if (!Array.isArray(list)) list = [];
      var ok = list.filter(function (b) { return b && typeof b === 'object'; });
      var confirmed = ok.filter(function (b) { return b.status !== 'cancelled' && b.status !== 'refunded'; });
      // v1.1: train tickets are IRCTC ticketing revenue, not OneTrip add-on GTV -> tracked separately
      var addOns = confirmed.filter(function (b) { return b.type !== 'train'; });
      var trains = confirmed.filter(function (b) { return b.type === 'train'; });
      var sum = function (l) { return l.reduce(function (a, b) { return a + (Number(b.amount) || 0); }, 0); };
      var gtvLive = sum(addOns);
      return {
        all: ok,
        confirmed: addOns,
        trains: trains,
        trainValue: sum(trains),
        gtv: gtvLive,
        p101: ok.filter(function (b) { return b.partnerId === 'P-101'; }),
        cancelled: ok.filter(function (b) { return b.status === 'cancelled' || b.status === 'refunded' || b.cancellation; })
      };
    }
  };
})();
