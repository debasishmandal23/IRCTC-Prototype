/* IRCTC OneTrip — shared UI helpers (used by every view).
 *
 *   OT.icon('train', 20)                  -> inline SVG string
 *   OT.badge('verified')                  -> status pill HTML ('verified'|'confirm'|'unavailable'|'confirmed'|'pending'|'cancelled'|'refunded'|'simulated'|'info')
 *   OT.toast('Saved', 'success'|'error'|'info')
 *   OT.modal({title, body(html), actions:[{label, kind:'primary'|'ghost'|'danger', onClick(close)}]}) -> close()
 *   OT.confirmAction({title, lines:[...], confirmLabel}) -> Promise<boolean>   (human-in-the-loop confirm)
 *   OT.simTag(text)                       -> small "SIMULATED" label HTML
 */
(function () {
  'use strict';
  var OT = window.OT;

  // Minimal stroke icon set (24x24, stroke=currentColor). Paths drawn for this project.
  var P = {
    train: '<rect x="5" y="3" width="14" height="14" rx="3"/><path d="M5 11h14M9 17l-2 4M15 17l2 4M8.5 14h.01M15.5 14h.01"/>',
    hotel: '<path d="M3 21V7l9-4 9 4v14"/><path d="M9 21v-5h6v5M8 10h.01M12 10h.01M16 10h.01M8 13h.01M16 13h.01"/>',
    cab: '<path d="M5 17h14l-1.5-6.5A2 2 0 0 0 15.6 9H8.4a2 2 0 0 0-1.9 1.5L5 17Z"/><path d="M4 17v3M20 17v3M10 6h4l1 3H9l1-3ZM7.5 14h.01M16.5 14h.01"/>',
    food: '<path d="M4 3v8a3 3 0 0 0 3 3v7M7 3v6M10 3v8a3 3 0 0 1-3 3"/><path d="M17 21V3c-2 1-3 4-3 7s1 4 3 4"/>',
    sight: '<path d="M3 20h18M5 20V10l7-6 7 6v10"/><path d="M10 20v-6h4v6"/>',
    mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
    speaker: '<path d="M4 9v6h4l5 4V5L8 9H4Z"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/>',
    stop: '<rect x="6" y="6" width="12" height="12" rx="2"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    check: '<path d="m5 12 5 5 9-10"/>',
    checkCircle: '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
    alert: '<path d="M12 3 2 20h20L12 3Z"/><path d="M12 10v4M12 17h.01"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    xCircle: '<circle cx="12" cy="12" r="9"/><path d="m9 9 6 6M15 9l-6 6"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2 20a7 7 0 0 1 14 0M16 4.5a3.5 3.5 0 0 1 0 7M18 20a7 7 0 0 0-2.5-5.4"/>',
    wallet: '<rect x="3" y="6" width="18" height="14" rx="2"/><path d="M3 10h18M16 15h2M6 6l9-3 1 3"/>',
    card: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h4"/>',
    shield: '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Z"/><path d="m9 12 2 2 4-4"/>',
    bot: '<rect x="4" y="8" width="16" height="12" rx="3"/><path d="M12 4v4M9 13h.01M15 13h.01M9 17h6"/>',
    spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
    route: '<circle cx="6" cy="19" r="2"/><circle cx="18" cy="5" r="2"/><path d="M8 19h8a3 3 0 0 0 0-6H8a3 3 0 0 1 0-6h8"/>',
    map: '<path d="m9 4-6 2v14l6-2 6 2 6-2V4l-6 2-6-2Z"/><path d="M9 4v14M15 6v14"/>',
    pin: '<path d="M12 21s-7-6.5-7-12a7 7 0 0 1 14 0c0 5.5-7 12-7 12Z"/><circle cx="12" cy="9" r="2.5"/>',
    star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.2l1.1-6.2L3 9.6l6.2-.9L12 3Z"/>',
    chart: '<path d="M3 20h18M6 16v-5M11 16V7M16 16v-8M21 16v-3"/>',
    pie: '<path d="M12 3a9 9 0 1 0 9 9h-9V3Z"/><path d="M15 3.5A9 9 0 0 1 20.5 9H15V3.5Z"/>',
    refund: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 8v8M9.5 10.5c0-1 1-1.5 2.5-1.5s2.5.6 2.5 1.6c0 2.4-5 1.4-5 3.8 0 1 1 1.6 2.5 1.6s2.5-.5 2.5-1.5"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/>',
    send: '<path d="M4 12 20 4l-6 16-3-7-7-1Z"/>',
    play: '<path d="M7 4v16l13-8L7 4Z"/>',
    chat: '<path d="M4 5h16v11H9l-5 4V5Z"/><path d="M8 9h8M8 12h5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16v4Z"/><path d="m13 7 4 4"/>',
    trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
    arrowRight: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    arrowLeft: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    chevronDown: '<path d="m6 9 6 6 6-6"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    bank: '<path d="M3 10 12 4l9 6M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18"/>',
    rupee: '<path d="M6 4h12M6 9h12M9 4c4 0 6 2 6 5s-2 5-6 5H7l8 7"/>',
    headset: '<path d="M4 15v-3a8 8 0 0 1 16 0v3"/><rect x="3" y="14" width="4" height="6" rx="1.5"/><rect x="17" y="14" width="4" height="6" rx="1.5"/><path d="M19 20a3 3 0 0 1-3 2h-3"/>',
    flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
    layers: '<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 13 9 5 9-5"/>',
    download: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    logout: '<path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10"/>',
    store: '<path d="M4 9 5 4h14l1 5M4 9v11h16V9M4 9h16M9 20v-6h6v6"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    trending: '<path d="m3 17 6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
    filter: '<path d="M4 5h16l-6 8v6l-4-2v-4L4 5Z"/>',
    refresh: '<path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/>',
    leaf: '<path d="M5 19c0-9 6-14 15-14 0 9-5 15-14 15"/><path d="M5 19 13 11"/>',
    temple: '<path d="M12 2v3M8 9h8l-1-4H9L8 9ZM5 21V12h14v9M3 21h18M9 21v-5h6v5M6 12l1-3h10l1 3"/>',
    bus: '<rect x="4" y="3" width="16" height="15" rx="3"/><path d="M4 10h16M8 18v3M16 18v3M7.5 14h.01M16.5 14h.01M9 6h6"/>',
    metro: '<rect x="5" y="3" width="14" height="14" rx="4"/><path d="M5 10h14M9 17l-3 4M15 17l3 4M9 13.5h.01M15 13.5h.01M10 6.5h4"/>',
    auto: '<path d="M4 17V9a4 4 0 0 1 4-4h6l4 5h1a1 1 0 0 1 1 1v6"/><path d="M4 10h10V5M14 10h6"/><circle cx="7" cy="17.5" r="2"/><circle cx="17" cy="17.5" r="2"/>',
    walk: '<circle cx="13" cy="4" r="2"/><path d="m9 21 2-6 3 2v4M8 12l2-4 4 1 2 3 3 1M11 15l-1-3"/>',
    share: '<circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="m8.2 10.8 7.6-4.5M8.2 13.2l7.6 4.5"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    whatsapp: '<path d="M4 20l1.3-3.9A8 8 0 1 1 8 19l-4 1Z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1.2-1.4-2-1-1 .8c-.9-.4-1.7-1.2-2.1-2.1l.8-1-1-2L9 9.5Z"/>',
    qr: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM20 14v.01M14 20h.01M17 20h4v-3"/>',
    image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/>',
    printer: '<path d="M7 8V3h10v5"/><rect x="3" y="8" width="18" height="9" rx="2"/><path d="M7 14h10v7H7z"/>',
    mute: '<path d="M4 9v6h4l5 4V5L8 9H4Z"/><path d="m17 9 5 6M22 9l-5 6"/>',
    leafSm: '<path d="M6 18c0-7 5-11 12-11 0 7-4 12-11 12"/>'
  };

  OT.icon = function (name, size, cls) {
    var s = size || 18;
    return '<svg class="ic ' + (cls || '') + '" width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (P[name] || P.info) + '</svg>';
  };
  OT.iconNames = Object.keys(P);
  /** Icon for a catalogue item / booking: local-transport legs show their mode (bus, metro, auto, walk). */
  OT.itemIcon = function (x, type) {
    x = x || {};
    if (x.service) return 'lock';
    if (x.mode) return { cab: 'cab', auto: 'auto', erick: 'auto', bus: 'bus', metro: 'metro', walk: 'walk' }[x.mode] || 'cab';
    return x.type || type || 'info';
  };

  var BADGES = {
    verified: { cls: 'b-ok', icon: 'checkCircle', label: 'Verified' },
    confirmed: { cls: 'b-ok', icon: 'checkCircle', label: 'Confirmed' },
    refunded: { cls: 'b-ok', icon: 'refund', label: 'Refunded' },
    confirm: { cls: 'b-warn', icon: 'alert', label: 'Needs confirmation' },
    pending: { cls: 'b-warn', icon: 'clock', label: 'Pending' },
    processing: { cls: 'b-info', icon: 'clock', label: 'Processing' },
    unavailable: { cls: 'b-bad', icon: 'xCircle', label: 'Unavailable' },
    cancelled: { cls: 'b-bad', icon: 'xCircle', label: 'Cancelled' },
    simulated: { cls: 'b-sim', icon: 'flag', label: 'Simulated' },
    info: { cls: 'b-info', icon: 'info', label: 'Info' }
  };
  /** Status pill. label override is optional (e.g. a translated label). */
  OT.badge = function (status, label) {
    var b = BADGES[status] || BADGES.info;
    return '<span class="badge ' + b.cls + '">' + OT.icon(b.icon, 13) + '<span>' + OT.esc(label || (OT.t ? OT.t('status.' + status, b.label) : b.label)) + '</span></span>';
  };

  OT.simTag = function (text) {
    return '<span class="sim-tag" title="Simulated data for demonstration">' + OT.esc(text || 'SIMULATED') + '</span>';
  };

  OT.toast = function (msg, kind) {
    var root = document.getElementById('toast-root');
    if (!root) return;
    var n = OT.h('<div class="toast toast-' + (kind || 'info') + '" role="status">' +
      OT.icon(kind === 'error' ? 'alert' : kind === 'success' ? 'checkCircle' : 'info', 18) +
      '<span>' + OT.esc(msg) + '</span></div>');
    root.appendChild(n);
    while (root.children.length > 2) root.removeChild(root.firstElementChild); // keep at most 2 toasts on screen
    requestAnimationFrame(function () { n.classList.add('show'); });
    setTimeout(function () { n.classList.remove('show'); setTimeout(function () { n.remove(); }, 300); }, 3400);
  };

  OT.modal = function (opts) {
    var root = document.getElementById('modal-root');
    var wrap = OT.h('<div class="modal-backdrop" role="dialog" aria-modal="true">' +
      '<div class="modal ' + (opts.wide ? 'modal-wide' : '') + '">' +
      '<div class="modal-head"><h3>' + OT.esc(opts.title || '') + '</h3>' +
      '<button class="icon-btn" data-close aria-label="Close">' + OT.icon('x', 20) + '</button></div>' +
      '<div class="modal-body"></div><div class="modal-foot"></div></div></div>');
    wrap.querySelector('.modal-body').innerHTML = opts.body || '';
    var foot = wrap.querySelector('.modal-foot');
    function close() {
      wrap.classList.remove('show');
      document.removeEventListener('keydown', onKey);
      setTimeout(function () { wrap.remove(); }, 200);
      if (opts.onClose) opts.onClose();
    }
    function onKey(e) { if (e.key === 'Escape') close(); }
    (opts.actions || []).forEach(function (a) {
      var b = OT.h('<button class="btn btn-' + (a.kind || 'ghost') + '">' + OT.esc(a.label) + '</button>');
      b.addEventListener('click', function () { a.onClick ? a.onClick(close) : close(); });
      foot.appendChild(b);
    });
    if (!(opts.actions || []).length) foot.remove();
    var openedAt = Date.now();
    wrap.addEventListener('click', function (e) {
      // ignore the 2nd click of a double-click on the button that opened this dialog
      if (e.target === wrap && Date.now() - openedAt < 500) return;
      if (e.target === wrap || e.target.closest('[data-close]')) close();
    });
    document.addEventListener('keydown', onKey);
    root.appendChild(wrap);
    requestAnimationFrame(function () { wrap.classList.add('show'); });
    if (opts.onOpen) opts.onOpen(wrap.querySelector('.modal-body'), close);
    return close;
  };

  /** Human-in-the-loop confirmation. Resolves true/false. */
  OT.confirmAction = function (o) {
    return new Promise(function (resolve) {
      var done = false;
      var body = '<div class="confirm-box">' + OT.icon('shield', 28) +
        '<div><p class="muted">' + OT.esc(o.intro || (OT.t ? OT.t('confirm.intro', 'Please review before we proceed:') : 'Please review before we proceed:')) + '</p><ul class="confirm-lines">' +
        (o.lines || []).map(function (l) { return '<li>' + l + '</li>'; }).join('') + '</ul>' +
        (o.note ? '<p class="small muted">' + o.note + '</p>' : '') + '</div></div>';
      OT.modal({
        title: o.title || 'Confirm',
        body: body,
        onClose: function () { if (!done) { done = true; resolve(false); } },
        actions: [
          { label: o.cancelLabel || (OT.t ? OT.t('common.cancel', 'Cancel') : 'Cancel'), kind: 'ghost', onClick: function (c) { done = true; resolve(false); c(); } },
          { label: o.confirmLabel || (OT.t ? OT.t('common.confirm', 'Confirm') : 'Confirm'), kind: o.danger ? 'danger' : 'primary', onClick: function (c) { done = true; resolve(true); c(); } }
        ]
      });
    });
  };
})();
