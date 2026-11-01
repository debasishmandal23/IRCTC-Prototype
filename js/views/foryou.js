/* IRCTC OneTrip — "For you" personalised suggestions (v1.1, SIMULATED data-monetisation use case).
 * Upcoming long weekends (sample holiday calendar, weekdays computed with Date) -> what other travellers from
 * your home city booked (aggregated, anonymised) -> a train + hotel + cab + sight package priced from the catalogue.
 * Shown only to a signed-in traveller persona with the DPDP consent "Personalised suggestions" switched on.
 *   OT.forYou.render(container, {place:'home'|'journey'})
 */
(function () {
  'use strict';
  var OT = window.OT;
  function t(k, fb, v) { return OT.t(k, fb, v); }
  function L() { return OT.i18n.lang(); }
  function keep(v) { return OT.lang.keep(v); }
  function sname(c) { return OT.data.travel.stationName(c, L()); }
  function persona() {
    var u = OT.store.get('user');
    if (!u || u.role !== 'traveller') return null;
    var p = u.personaId && OT.data.personas.get(u.personaId);
    return Object.assign({}, p || { kind: 'family', party: [{ name: u.name }], budget: 3000, homeCity: 'NDLS' }, { homeCity: u.homeCity || (p && p.homeCity) || 'NDLS', name: u.name, short: (p && p.short) || String(u.name).split(' ')[0] }, { consents: u.consents || (p && p.consents) || {} });
  }
  function dayLabel(s) { var d = OT.data.rail.parseYmd(s); return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }); }
  function lwLabel(lw) {
    var name = L() === 'hi' && lw.holiday.hi ? lw.holiday.hi : lw.holiday.name;
    return name + ' · ' + dayLabel(lw.start) + ' – ' + dayLabel(lw.end);
  }
  function fitText(p) {
    var bits = [];
    if (p.kind === 'family') bits.push(t('fy.fitFamily', 'family of {n}', { n: (p.party || []).length }));
    if (p.kind === 'pilgrim') bits.push(t('fy.fitPilgrim', 'temples, lower berths for seniors'));
    if (p.kind === 'student') bits.push(t('fy.fitStudent', 'budget: sleeper class, hostel'));
    if (p.kind === 'business') bits.push(t('fy.fitBiz', 'quick trips, near the station'));
    if (p.prefs && p.prefs.veg) bits.push(t('pref.veg', 'Veg food'));
    return bits.join(' · ');
  }
  function toggleHTML(on) {
    return '<label class="switch"><input type="checkbox" id="fy-consent"' + (on ? ' checked' : '') + '><span class="sw" aria-hidden="true"></span><span class="small">' +
      OT.esc(t('fy.consent', 'Personalised suggestions')) + ': <strong>' + OT.esc(on ? t('fy.on', 'On') : t('fy.off', 'Off')) + '</strong></span></label>';
  }
  function why(p) {
    return '<details class="fy-why"><summary class="small">' + OT.icon('info', 14) + ' ' + OT.esc(t('fy.why', 'Why am I seeing this?')) + '</summary><div class="small">' +
      '<p>' + OT.esc(t('fy.why1', 'Because your home city is {city}, your past OneTrip trips, and aggregated, anonymised demand on routes from {city} for the coming long weekends. No individual traveller’s data is shown; groups under 50 people are hidden.', { city: sname(p.homeCity) })) + '</p>' +
      '<p>' + OT.esc(t('fy.why2', 'Partners and the bank never receive your itinerary from this. You can switch it off at any time (DPDP Act consent).')) + '</p>' +
      '<p class="xs muted">' + OT.esc(OT.data.demand.sourceNote) + '</p></div></details>';
  }
  function pkgHTML(pk, tr, lw, i) {
    if (!pk) return '<p class="small muted">' + OT.esc(t('fy.noPkg', 'No direct train found for this route in the sample timetable.')) + '</p>';
    var av = pk.avail;
    return '<div class="fy-pkg"><div class="fy-pkg-head"><strong>' + OT.icon('layers', 15) + ' ' + OT.esc(t('fy.pkg', 'Suggested package · {n} nights', { n: pk.nights })) + '</strong>' + OT.simTag() + '</div>' +
      '<ul class="fy-lines small">' + pk.lines.map(function (l) {
        return '<li>' + OT.icon(l.kind, 14) + '<span>' + (l.kind === 'train' ? keep(l.label.split(' ')[0]) + ' ' + OT.esc(l.label.split(' ').slice(1).join(' ')) + ' · ' + keep(pk.train.dep) + ' · <span class="' + (av.state === 'AVAILABLE' ? 'text-ok' : 'text-warn') + '">' + OT.esc(av.label) + '</span>' : OT.esc(l.label)) + '</span>' + keep(OT.inr(l.amount)) + '</li>';
      }).join('') + '</ul>' +
      '<div class="fy-total"><span>' + OT.esc(t('fy.total', 'Package total for {n}', { n: pk.pax })) + ' <strong>' + keep(OT.inr(pk.total)) + '</strong></span>' +
      (pk.savings > 0 ? '<span class="save small">' + OT.esc(t('fy.save', 'saves {s} vs booking separately (sample comparison)', { s: OT.inr(pk.savings) })) + '</span>' : '') + '</div>' +
      '<button type="button" class="btn btn-accent btn-sm" data-pkg="' + i + '">' + OT.icon('train', 15) + OT.esc(t('fy.book', 'Book this package')) + '</button></div>';
  }

  function render(el, opts) {
    if (!el) return;
    opts = opts || {};
    var p = persona();
    if (!p) {
      el.innerHTML = opts.place === 'home' ? '<section class="container fy fy-teaser"><div class="card-flat row-wrap between"><span class="small">' + OT.icon('spark', 16) + ' ' +
        OT.esc(t('fy.teaser', 'Sign in as a demo persona to see personalised long-weekend suggestions from IRCTC journey data (simulated).')) + '</span>' +
        '<a class="btn btn-ghost btn-sm" href="#/login">' + OT.icon('user', 15) + OT.esc(t('home.personas', 'Sign in as a demo persona')) + '</a></div></section>' : '';
      return;
    }
    var on = p.consents.personalised !== false;
    if (!on) {
      el.innerHTML = '<section class="container fy" data-tour="for-you"><div class="card fy-off"><div class="row between wrap"><h2 class="h3">' + OT.icon('spark', 18) + ' ' + OT.esc(t('fy.title', 'For you, {name}', { name: p.short })) + '</h2>' + toggleHTML(false) + '</div>' +
        '<p class="small muted">' + OT.esc(t('fy.offText', 'Personalised suggestions are off. Nothing about your trips is used for suggestions. Switch on to see long-weekend ideas from aggregated demand.')) + '</p></div></section>';
      bind(el, opts, null, null, []);
      return;
    }
    var lws = OT.data.demand.longWeekends(null, 3);
    if (!lws.length) { el.innerHTML = ''; return; }
    var idx = Math.min(OT.state.fyLw || 0, lws.length - 1), lw = lws[idx];
    var trs = OT.data.demand.trends(p.homeCity, lw, p).slice(0, opts.place === 'journey' ? 1 : 3);
    var pks = trs.map(function (tr) { return OT.data.demand.pkg(p, tr, lw); });
    var maxB = Math.max.apply(null, trs.map(function (x) { return x.bookings; }));
    el.innerHTML = '<section class="container fy" data-tour="for-you"><div class="card fy-card">' +
      '<div class="fy-head"><div><p class="ot-eyebrow">' + OT.icon('spark', 14) + ' ' + OT.esc(t('fy.eyebrow', 'Personalised from IRCTC journey data (simulated)')) + '</p>' +
      '<h2>' + OT.esc(t('fy.title', 'For you, {name}', { name: p.short })) + '</h2>' +
      '<p class="small muted">' + OT.esc(t('fy.sub', 'Upcoming long weekends and where travellers from {city} are going · fits: {fit}', { city: sname(p.homeCity), fit: fitText(p) })) + '</p></div>' + toggleHTML(true) + '</div>' +
      '<div class="tabs fy-tabs" role="tablist">' + lws.map(function (x, i) {
        return '<button type="button" role="tab" class="tab" data-lw="' + i + '" aria-selected="' + (i === idx) + '">' + OT.icon('calendar', 14) + ' ' + OT.esc(lwLabel(x)) +
          ' <span class="tab-n">' + OT.esc(t('fy.days', '{n} days', { n: x.days })) + '</span></button>';
      }).join('') + '</div>' +
      '<p class="small fy-lw">' + OT.icon('calendar', 14) + ' ' + OT.esc(t('fy.lwText', '{holiday} falls on a {wd}: {days}-day long weekend', { holiday: L() === 'hi' && lw.holiday.hi ? lw.holiday.hi : lw.holiday.name, wd: OT.data.rail.parseYmd(lw.holiday.date).toLocaleDateString(L() === 'en' ? 'en-IN' : (OT.lang.info(L()).bcp47 || 'en-IN'), { weekday: 'long' }), days: lw.days })) +
      (lw.leave ? ' · ' + OT.esc(t('fy.leave', 'take {d} off', { d: dayLabel(lw.leave) })) : '') + ' · ' + OT.esc(t('fy.away', 'in {n} days', { n: lw.daysAway })) + '</p>' +
      '<div class="fy-grid' + (opts.place === 'journey' ? ' one' : '') + '">' + trs.map(function (tr, i) {
        return '<article class="fy-trend" data-trend="' + tr.to + '"><div class="fy-t-head"><div><strong>' + OT.esc(tr.label) + '</strong>' +
          '<span class="xs muted"> <bdi class="keep">' + OT.esc(p.homeCity) + '</bdi> → <bdi class="keep">' + tr.to + '</bdi> · ' + tr.km + ' km</span></div>' +
          '<span class="badge b-info">' + OT.icon('trending', 12) + '<span>+' + tr.change + '%</span></span></div>' +
          '<p class="small">' + OT.esc(t('fy.trend', '{n} travellers from {city} booked this route for that weekend ({c}% more than a normal weekend).', { n: tr.bookings.toLocaleString('en-IN'), city: sname(p.homeCity), c: tr.change })) + '</p>' +
          '<div class="fy-bar" aria-hidden="true"><i style="width:' + Math.round(tr.bookings / maxB * 100) + '%"></i></div>' +
          '<p class="xs text-warn">' + OT.icon('clock', 12) + ' ' + OT.esc(t('fy.fills', 'Seats usually fill {n} days early', { n: tr.fillsEarly })) + '</p>' +
          pkgHTML(pks[i], tr, lw, i) + '</article>';
      }).join('') + '</div>' + why(p) + '</div></section>';
    bind(el, opts, p, lw, pks);
  }

  function bind(el, opts, p, lw, pks) {
    var c = el.querySelector('#fy-consent');
    if (c) c.addEventListener('change', function () {
      OT.store.update('user', function (u) { u = u || {}; u.consents = Object.assign({}, u.consents, { personalised: c.checked }); return u; });
      OT.toast(c.checked ? t('fy.onToast', 'Personalised suggestions switched on.') : t('fy.offToast', 'Personalised suggestions switched off. The section is hidden.'), 'info');
      render(el, opts);
    });
    OT.$$('[data-lw]', el).forEach(function (b) { b.addEventListener('click', function () { OT.state.fyLw = +b.getAttribute('data-lw'); render(el, opts); }); });
    OT.$$('[data-pkg]', el).forEach(function (b) {
      b.addEventListener('click', function () {
        var pk = pks[+b.getAttribute('data-pkg')]; if (!pk) return;
        OT.state.pendingPackage = { to: pk.to, from: pk.from, date: pk.date, ret: pk.returnDate, nights: pk.nights, hotel: pk.hotel && pk.hotel.id, cab: pk.cab && pk.cab.id, sight: pk.sight && pk.sight.id, cls: pk.cls, pax: pk.pax };
        OT.toast(t('fy.pkgToast', 'Package started: first book the train, then the hotel, cab and sight are added for you.'), 'info');
        OT.go(OT.trains.path({ from: pk.from, to: pk.to, date: pk.date, cls: pk.cls, pax: pk.pax, pkg: 1 }));
      });
    });
  }

  OT.forYou = { render: render, persona: persona };
})();
