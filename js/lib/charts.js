/* IRCTC OneTrip — OT.charts: tiny dependency-free chart library (SVG + HTML).
 * Builder B. Every function returns an HTML string; insert it with innerHTML.
 *
 *   OT.charts.bar(data, opts)          vertical bars       data: [{label, value, highlight?, muted?, tip?}]
 *   OT.charts.hbar(data, opts)         horizontal bars     (HTML rows; long labels wrap)
 *   OT.charts.stacked(cats, series, o) vertical stacked    cats: ['W1',..], series: [{name, values:[]}]
 *   OT.charts.stack100(rows, names, o) 100% horizontal     rows: [{label, values:[]}]
 *   OT.charts.line(labels, series, o)  line / area + points + crosshair tooltip
 *   OT.charts.donut(data, opts)        donut + legend      data: [{label, value, color?}]
 *   OT.charts.sparkline(values, opts)
 *   OT.charts.funnel(steps, opts)      steps: [{label, value}]
 *   OT.charts.heat(rows, cols, matrix, opts)  heat-table (sequential blue ramp)
 *   OT.charts.legend(items)            items: [{name, color}]
 *   OT.charts.table(headers, rows)     "View data" disclosure for accessibility
 *
 * Palette (validated for CVD separation + contrast on white): blue, saffron, teal, violet, ochre — in that
 * fixed order. Saffron doubles as the single highlight colour on single-series charts.
 * Tooltips: any element with data-tip="..." shows a floating tooltip on hover / focus.
 */
(function () {
  'use strict';
  var OT = window.OT;
  var esc = OT.esc;

  var PAL = {
    cat: ['#2860C8', '#E0761A', '#0E9AA7', '#8A55C0', '#B0892A'],
    blue: '#2860C8',
    navy: '#143D7A',
    saffron: '#E0761A',
    muted: '#B9C4D4',
    grid: '#E6ECF4',
    axis: '#5A6B82',
    ink: '#1E2A3B',
    ok: '#12805C', warn: '#A86A12', bad: '#C2382F',
    // Likert diverging: negative (saffron) → neutral grey → positive (blue)
    likert: ['#B85A07', '#F2B37A', '#C9D1DC', '#8FB1EC', '#1F55B8'],
    // sequential blue ramp (light → dark) for heat tables
    seq: ['#F2F6FD', '#DCE8FB', '#B9D0F6', '#86AEEE', '#4F86E0', '#2860C8', '#174FB3', '#143D7A']
  };

  function narrow() { return (window.innerWidth || 1024) < 700; }
  function fmtDefault(v) { return v == null || isNaN(v) ? '—' : Number(v).toLocaleString('en-IN'); }
  function uid() { return 'c' + Math.random().toString(36).slice(2, 8); }

  function niceMax(v) {
    if (!v || v <= 0) return 1;
    var p = Math.pow(10, Math.floor(Math.log10(v)));
    var n = v / p;
    var s = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10;
    return s * p;
  }
  /** Nice axis: returns {max, count} so every tick is a round number. */
  function autoScale(raw, givenMax) {
    if (givenMax) return { max: givenMax, count: (givenMax <= 6 && givenMax === Math.round(givenMax)) ? givenMax : 4 };
    if (!raw || raw <= 0) return { max: 1, count: 1 };
    var x = raw / 4, p = Math.pow(10, Math.floor(Math.log10(x))), n = x / p;
    var step = (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * p;
    var count = Math.ceil(raw / step);
    return { max: step * count, count: count };
  }
  function ticks(max, count) {
    var out = [];
    for (var i = 0; i <= count; i++) out.push(max * i / count);
    return out;
  }
  function lum(hex) {
    var h = String(hex).replace('#', '');
    if (h.length === 3) h = h.replace(/(.)/g, '$1$1');
    var n = parseInt(h, 16);
    if (isNaN(n)) return 1;
    return (0.2126 * ((n >> 16) & 255) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255;
  }
  function trunc(s, n) { s = String(s); return s.length > n ? s.slice(0, Math.max(1, n - 1)) + '…' : s; }
  function shortNum(v) {
    v = Number(v);
    var a = Math.abs(v);
    if (a >= 1e7) return (v / 1e7).toFixed(a >= 1e8 ? 0 : 1).replace(/\.0$/, '') + 'Cr';
    if (a >= 1e5) return (v / 1e5).toFixed(a >= 1e6 ? 0 : 1).replace(/\.0$/, '') + 'L';
    if (a >= 1e3) return (v / 1e3).toFixed(a >= 1e4 ? 0 : 1).replace(/\.0$/, '') + 'K';
    return String(Math.round(v * 10) / 10);
  }

  /* Rounded-top bar path anchored at the baseline. */
  function barPath(x, y, w, h, r) {
    if (h <= 0) return '';
    r = Math.min(r, w / 2, h);
    return 'M' + x + ',' + (y + h) + 'V' + (y + r) + 'Q' + x + ',' + y + ' ' + (x + r) + ',' + y +
      'H' + (x + w - r) + 'Q' + (x + w) + ',' + y + ' ' + (x + w) + ',' + (y + r) + 'V' + (y + h) + 'Z';
  }

  function svgOpen(w, h, label, extraCls) {
    var id = uid();
    return '<svg class="otc ' + (extraCls || '') + '" viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-labelledby="' + id + '" preserveAspectRatio="xMidYMid meet">' +
      '<title id="' + id + '">' + esc(label || 'Chart') + '</title>';
  }

  function yAxis(max, x0, x1, yOf, fmtTick, count) {
    var s = '';
    ticks(max, count).forEach(function (t) {
      var y = yOf(t);
      s += '<line class="otc-grid" x1="' + x0 + '" x2="' + x1 + '" y1="' + y + '" y2="' + y + '"/>' +
        '<text class="otc-tick" x="' + (x0 - 6) + '" y="' + (y + 3.5) + '" text-anchor="end">' + esc(fmtTick(t)) + '</text>';
    });
    return s;
  }

  /* ---------- Vertical bar ---------- */
  function bar(data, o) {
    o = o || {};
    var fmt = o.fmt || fmtDefault;
    var fmtTick = o.fmtTick || shortNum;
    var W = o.w || (narrow() ? 360 : 520), H = o.h || (narrow() ? 230 : 250);
    var m = { t: 22, r: 8, b: o.xLabelLines === 2 ? 42 : 30, l: o.noAxis ? 8 : 40 };
    var sc = autoScale(Math.max.apply(null, data.map(function (d) { return d.value; })) * 1.06, o.max);
    var max = sc.max;
    var iw = W - m.l - m.r, ih = H - m.t - m.b;
    var band = iw / Math.max(1, data.length);
    var bw = Math.max(6, Math.min(56, band * (o.barRatio || 0.62)));
    var yOf = function (v) { return m.t + ih - (v / max) * ih; };
    var s = svgOpen(W, H, o.label);
    if (!o.noAxis) s += yAxis(max, m.l, W - m.r, yOf, fmtTick, sc.count);
    s += '<line class="otc-base" x1="' + m.l + '" x2="' + (W - m.r) + '" y1="' + (m.t + ih) + '" y2="' + (m.t + ih) + '"/>';
    var maxChars = Math.max(3, Math.floor(band / 7.4));
    data.forEach(function (d, i) {
      var x = m.l + band * i + (band - bw) / 2;
      var y = yOf(d.value);
      var col = d.color || (d.highlight ? PAL.saffron : d.muted ? PAL.muted : (o.color || PAL.blue));
      var tip = d.tip || (d.label + ': ' + fmt(d.value));
      s += '<g class="otc-mark" data-tip="' + esc(tip) + '">' +
        '<rect class="otc-hit" x="' + (m.l + band * i) + '" y="' + m.t + '" width="' + band + '" height="' + ih + '"/>' +
        '<path d="' + barPath(x, y, bw, m.t + ih - y, 4) + '" fill="' + col + '"/>';
      if (o.valueLabels !== false) {
        s += '<text class="otc-val' + (d.highlight ? ' hi' : '') + '" x="' + (x + bw / 2) + '" y="' + (y - 6) + '" text-anchor="middle">' + esc(o.fmtLabel ? o.fmtLabel(d.value) : fmt(d.value)) + '</text>';
      }
      var lab = String(d.short || d.label);
      if (o.xLabelLines === 2 && lab.indexOf(' ') > 0 && lab.length > maxChars) {
        var words = lab.split(' '), a = '', b = '';
        words.forEach(function (w) { if ((a + ' ' + w).trim().length <= maxChars && !b) a = (a + ' ' + w).trim(); else b = (b + ' ' + w).trim(); });
        s += '<text class="otc-xl" x="' + (x + bw / 2) + '" y="' + (m.t + ih + 15) + '" text-anchor="middle">' + esc(trunc(a, maxChars)) + '</text>' +
          '<text class="otc-xl" x="' + (x + bw / 2) + '" y="' + (m.t + ih + 28) + '" text-anchor="middle">' + esc(trunc(b, maxChars)) + '</text>';
      } else {
        s += '<text class="otc-xl" x="' + (x + bw / 2) + '" y="' + (m.t + ih + 17) + '" text-anchor="middle">' + esc(trunc(lab, maxChars)) + '</text>';
      }
      s += '</g>';
    });
    return wrap(s + '</svg>', o);
  }

  /* ---------- Horizontal bar (HTML rows: labels wrap, works at 375px) ---------- */
  function hbar(data, o) {
    o = o || {};
    var fmt = o.fmt || fmtDefault;
    var max = o.max || Math.max.apply(null, data.map(function (d) { return d.value; })) || 1;
    var rows = data.map(function (d) {
      var pct = Math.max(0, Math.min(100, (d.value / max) * 100));
      var col = d.color || (d.highlight ? PAL.saffron : d.muted ? PAL.muted : (o.color || PAL.blue));
      return '<li class="hb-row' + (d.highlight ? ' hi' : '') + (d.muted ? ' mu' : '') + '" data-tip="' + esc(d.tip || (d.label + ': ' + fmt(d.value))) + '">' +
        '<span class="hb-label">' + esc(d.label) + (d.note ? ' <span class="hb-note">' + esc(d.note) + '</span>' : '') + '</span>' +
        '<span class="hb-track"><span class="hb-fill" style="width:' + pct.toFixed(2) + '%;background:' + col + '"></span></span>' +
        '<span class="hb-val">' + esc(fmt(d.value)) + '</span></li>';
    }).join('');
    return '<ul class="otc-hbar' + (o.compact ? ' compact' : '') + '" role="list" aria-label="' + esc(o.label || 'Bar chart') + '">' + rows + '</ul>' + (o.table ? o.table : '');
  }

  /* ---------- Vertical stacked bar ---------- */
  function stacked(cats, series, o) {
    o = o || {};
    var fmt = o.fmt || fmtDefault;
    var fmtTick = o.fmtTick || shortNum;
    var colors = o.colors || PAL.cat;
    var W = o.w || (narrow() ? 360 : 520), H = o.h || (narrow() ? 240 : 260);
    var m = { t: 22, r: 8, b: 30, l: 42 };
    var totals = cats.map(function (_, i) { return series.reduce(function (a, s) { return a + (s.values[i] || 0); }, 0); });
    var sc = autoScale(Math.max.apply(null, totals) * 1.06, o.max);
    var max = sc.max;
    var iw = W - m.l - m.r, ih = H - m.t - m.b;
    var band = iw / cats.length;
    var bw = Math.max(8, Math.min(64, band * 0.62));
    var yOf = function (v) { return m.t + ih - (v / max) * ih; };
    var s = svgOpen(W, H, o.label);
    s += yAxis(max, m.l, W - m.r, yOf, fmtTick, sc.count);
    var longest = Math.max.apply(null, cats.map(function (c) { return String(c).length; }));
    var everyN = Math.max(1, Math.ceil((longest * 7.2 + 8) / band));
    var maxChars = Math.max(3, Math.floor(band * everyN / 7.4));
    cats.forEach(function (c, i) {
      var x = m.l + band * i + (band - bw) / 2;
      var acc = 0;
      var tip = c + ' — ' + series.map(function (sr) { return sr.name + ': ' + fmt(sr.values[i]); }).join(' · ') + ' · Total: ' + fmt(totals[i]);
      s += '<g class="otc-mark" data-tip="' + esc(tip) + '"><rect class="otc-hit" x="' + (m.l + band * i) + '" y="' + m.t + '" width="' + band + '" height="' + ih + '"/>';
      series.forEach(function (sr, k) {
        var v = sr.values[i] || 0;
        var y0 = yOf(acc), y1 = yOf(acc + v);
        acc += v;
        if (v <= 0) return;
        var isTop = k === series.length - 1 || series.slice(k + 1).every(function (q) { return !(q.values[i] > 0); });
        var h = Math.max(0, y0 - y1);
        var d = isTop ? barPath(x, y1, bw, h, 4) : 'M' + x + ',' + y1 + 'h' + bw + 'v' + h + 'h-' + bw + 'Z';
        s += '<path d="' + d + '" fill="' + colors[k % colors.length] + '" stroke="#fff" stroke-width="1.5"/>';
      });
      if (o.totalLabels !== false) s += '<text class="otc-val" x="' + (x + bw / 2) + '" y="' + (yOf(totals[i]) - 6) + '" text-anchor="middle">' + esc(o.fmtLabel ? o.fmtLabel(totals[i]) : shortNum(totals[i])) + '</text>';
      if (i % everyN === 0) s += '<text class="otc-xl" x="' + (x + bw / 2) + '" y="' + (m.t + ih + 17) + '" text-anchor="middle">' + esc(trunc(c, maxChars)) + '</text>';
      s += '</g>';
    });
    s += '<line class="otc-base" x1="' + m.l + '" x2="' + (W - m.r) + '" y1="' + (m.t + ih) + '" y2="' + (m.t + ih) + '"/>';
    s += '</svg>';
    var leg = legend(series.map(function (sr, k) { return { name: sr.name, color: colors[k % colors.length] }; }));
    return wrap(s, o, leg);
  }

  /* ---------- 100% horizontal stacked (HTML) — Likert distributions etc. ---------- */
  function stack100(rows, names, o) {
    o = o || {};
    var colors = o.colors || PAL.cat;
    var fmt = o.fmt || function (v) { return v.toFixed(1) + '%'; };
    var html = rows.map(function (r) {
      var tot = r.values.reduce(function (a, b) { return a + b; }, 0) || 1;
      var segs = r.values.map(function (v, k) {
        var p = v / tot * 100;
        if (p <= 0) return '';
        var dark = lum(colors[k % colors.length]) < 0.45;
        return '<span class="s1-seg" style="width:' + p.toFixed(2) + '%;background:' + colors[k % colors.length] + ';color:' + (dark ? '#fff' : '#1E2A3B') + '" data-tip="' + esc(r.label + ' — ' + names[k] + ': ' + fmt(p) + (r.counts ? ' (' + r.counts[k] + ')' : '')) + '">' + (p >= 9 ? esc(Math.round(p) + '%') : '') + '</span>';
      }).join('');
      return '<div class="s1-row"><div class="s1-label">' + esc(r.label) + (r.note ? '<span class="s1-note">' + esc(r.note) + '</span>' : '') + '</div><div class="s1-bar" role="img" aria-label="' + esc(r.label + ': ' + r.values.map(function (v, k) { return names[k] + ' ' + fmt(v / tot * 100); }).join(', ')) + '">' + segs + '</div></div>';
    }).join('');
    var leg = o.legend === false ? '' : legend(names.map(function (n, k) { return { name: n, color: colors[k % colors.length] }; }));
    return '<div class="otc-s100">' + html + '</div>' + leg;
  }

  /* ---------- Line / area ---------- */
  function line(labels, series, o) {
    o = o || {};
    var fmt = o.fmt || fmtDefault;
    var fmtTick = o.fmtTick || shortNum;
    var colors = o.colors || PAL.cat;
    var W = o.w || (narrow() ? 360 : 520), H = o.h || (narrow() ? 220 : 240);
    var m = { t: 16, r: o.endLabels === false ? 12 : (narrow() ? 12 : 64), b: 28, l: 42 };
    var all = [];
    series.forEach(function (s) { all = all.concat(s.values.filter(function (v) { return v != null; })); });
    var min = o.min != null ? o.min : 0;
    var sc = autoScale((Math.max.apply(null, all) - min) * 1.06, o.max != null ? o.max - min : null);
    var max = min + sc.max;
    var iw = W - m.l - m.r, ih = H - m.t - m.b;
    var n = labels.length;
    var xOf = function (i) { return m.l + (n === 1 ? iw / 2 : (iw * i) / (n - 1)); };
    var yOf = function (v) { return m.t + ih - ((v - min) / (max - min)) * ih; };
    var s = svgOpen(W, H, o.label);
    ticks(max - min, sc.count).forEach(function (t) {
      var v = min + t, y = yOf(v);
      s += '<line class="otc-grid" x1="' + m.l + '" x2="' + (W - m.r) + '" y1="' + y + '" y2="' + y + '"/>' +
        '<text class="otc-tick" x="' + (m.l - 6) + '" y="' + (y + 3.5) + '" text-anchor="end">' + esc(fmtTick(v)) + '</text>';
    });
    var longestL = Math.max.apply(null, labels.map(function (l) { return String(l).length; }));
    var stepPx = n > 1 ? iw / (n - 1) : iw;
    var everyN = Math.max(1, Math.ceil((longestL * 7.2 + 8) / stepPx));
    labels.forEach(function (l, i) {
      if (i % everyN === 0) s += '<text class="otc-xl" x="' + xOf(i) + '" y="' + (m.t + ih + 18) + '" text-anchor="middle">' + esc(l) + '</text>';
    });
    s += '<line class="otc-base" x1="' + m.l + '" x2="' + (W - m.r) + '" y1="' + (m.t + ih) + '" y2="' + (m.t + ih) + '"/>';
    series.forEach(function (sr, k) {
      var col = sr.color || colors[k % colors.length];
      var pts = sr.values.map(function (v, i) { return v == null ? null : [xOf(i), yOf(v)]; }).filter(Boolean);
      if (!pts.length) return;
      var d = pts.map(function (p, i) { return (i ? 'L' : 'M') + p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join('');
      if (o.area && series.length === 1) {
        var gid = uid();
        s += '<defs><linearGradient id="' + gid + '" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="' + col + '" stop-opacity=".22"/><stop offset="1" stop-color="' + col + '" stop-opacity="0"/></linearGradient></defs>' +
          '<path d="' + d + 'L' + pts[pts.length - 1][0] + ',' + (m.t + ih) + 'L' + pts[0][0] + ',' + (m.t + ih) + 'Z" fill="url(#' + gid + ')"/>';
      }
      s += '<path d="' + d + '" fill="none" stroke="' + col + '" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"' + (sr.dash ? ' stroke-dasharray="5 4"' : '') + '/>';
      if (o.points !== false) pts.forEach(function (p) { s += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="3.6" fill="' + col + '" stroke="#fff" stroke-width="1.6"/>'; });
      if (o.endLabels !== false && !narrow() && series.length <= 4) {
        var lp = pts[pts.length - 1];
        s += '<text class="otc-end" x="' + (lp[0] + 8) + '" y="' + (lp[1] + 4) + '">' + esc(o.fmtLabel ? o.fmtLabel(sr.values[sr.values.length - 1]) : shortNum(sr.values[sr.values.length - 1])) + '</text>';
      }
    });
    // crosshair columns
    labels.forEach(function (l, i) {
      var x = xOf(i), half = n > 1 ? iw / (n - 1) / 2 : iw / 2;
      var tip = l + ' — ' + series.map(function (sr) { return (series.length > 1 ? sr.name + ': ' : '') + fmt(sr.values[i]); }).join(' · ');
      s += '<g class="otc-x" data-tip="' + esc(tip) + '"><rect class="otc-hit" x="' + (x - half) + '" y="' + m.t + '" width="' + (half * 2) + '" height="' + ih + '"/>' +
        '<line class="otc-guide" x1="' + x + '" x2="' + x + '" y1="' + m.t + '" y2="' + (m.t + ih) + '"/></g>';
    });
    s += '</svg>';
    var leg = series.length > 1 ? legend(series.map(function (sr, k) { return { name: sr.name, color: sr.color || colors[k % colors.length], dash: sr.dash }; })) : '';
    return wrap(s, o, leg);
  }

  /* ---------- Donut ---------- */
  function donut(data, o) {
    o = o || {};
    var fmt = o.fmt || fmtDefault;
    var colors = o.colors || PAL.cat;
    var total = data.reduce(function (a, d) { return a + d.value; }, 0) || 1;
    var S = 180, R = 82, r = o.thin ? 64 : 56, cx = S / 2, cy = S / 2;
    var s = svgOpen(S, S, o.label, 'otc-donut-svg');
    var a0 = -Math.PI / 2;
    data.forEach(function (d, i) {
      var frac = d.value / total;
      var a1 = a0 + frac * Math.PI * 2;
      var col = d.color || colors[i % colors.length];
      var tip = d.tip || (d.label + ': ' + fmt(d.value) + (o.showPct !== false ? ' (' + (frac * 100).toFixed(1) + '%)' : ''));
      var path;
      if (frac >= 0.9999) {
        path = '<circle cx="' + cx + '" cy="' + cy + '" r="' + ((R + r) / 2) + '" fill="none" stroke="' + col + '" stroke-width="' + (R - r) + '"/>';
      } else {
        var large = a1 - a0 > Math.PI ? 1 : 0;
        var p = function (rad, a) { return (cx + rad * Math.cos(a)).toFixed(2) + ',' + (cy + rad * Math.sin(a)).toFixed(2); };
        path = '<path d="M' + p(R, a0) + 'A' + R + ',' + R + ' 0 ' + large + ' 1 ' + p(R, a1) + 'L' + p(r, a1) + 'A' + r + ',' + r + ' 0 ' + large + ' 0 ' + p(r, a0) + 'Z" fill="' + col + '" stroke="#fff" stroke-width="2"/>';
      }
      s += '<g class="otc-mark otc-slice" data-tip="' + esc(tip) + '">' + path + '</g>';
      a0 = a1;
    });
    if (o.center) s += '<text class="otc-dc" x="' + cx + '" y="' + (cy + (o.sub ? 2 : 7)) + '" text-anchor="middle">' + esc(o.center) + '</text>';
    if (o.sub) s += '<text class="otc-ds" x="' + cx + '" y="' + (cy + 20) + '" text-anchor="middle">' + esc(o.sub) + '</text>';
    s += '</svg>';
    var leg = '<ul class="otc-dleg">' + data.map(function (d, i) {
      return '<li><i style="background:' + (d.color || colors[i % colors.length]) + '"></i><span>' + esc(d.label) + '</span><b>' + esc(o.fmtLegend ? o.fmtLegend(d.value, d.value / total) : fmt(d.value)) + '</b></li>';
    }).join('') + '</ul>';
    return '<div class="otc-donut">' + s + leg + '</div>';
  }

  /* ---------- Sparkline ---------- */
  function sparkline(values, o) {
    o = o || {};
    var W = o.w || 120, H = o.h || 30, pad = 3;
    var max = Math.max.apply(null, values), min = Math.min.apply(null, values);
    if (max === min) { max += 1; min -= 1; }
    var n = values.length;
    var pts = values.map(function (v, i) { return [pad + (W - pad * 2) * i / Math.max(1, n - 1), pad + (H - pad * 2) * (1 - (v - min) / (max - min))]; });
    var d = pts.map(function (p, i) { return (i ? 'L' : 'M') + p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join('');
    var col = o.color || PAL.blue;
    var lp = pts[pts.length - 1];
    return '<svg class="otc-spark" viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '" aria-hidden="true">' +
      '<path d="' + d + 'L' + lp[0] + ',' + H + 'L' + pts[0][0] + ',' + H + 'Z" fill="' + col + '" opacity=".12"/>' +
      '<path d="' + d + '" fill="none" stroke="' + col + '" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/>' +
      '<circle cx="' + lp[0] + '" cy="' + lp[1] + '" r="2.6" fill="' + (o.dot || PAL.saffron) + '"/></svg>';
  }

  /* ---------- Funnel (HTML) ---------- */
  function funnel(steps, o) {
    o = o || {};
    var fmt = o.fmt || fmtDefault;
    var top = steps[0] ? steps[0].value : 1;
    return '<ol class="otc-funnel" aria-label="' + esc(o.label || 'Funnel') + '">' + steps.map(function (st, i) {
      var w = Math.max(8, st.value / top * 100);
      var conv = i ? (st.value / steps[i - 1].value * 100) : null;
      return '<li data-tip="' + esc(st.label + ': ' + fmt(st.value) + (conv != null ? ' · ' + conv.toFixed(1) + '% of previous step' : '')) + '">' +
        '<div class="fn-meta"><span class="fn-label">' + esc(st.label) + '</span><span class="fn-val">' + esc(fmt(st.value)) + '</span></div>' +
        '<div class="fn-bar"><span style="width:' + w.toFixed(1) + '%;background:' + (i === steps.length - 1 ? PAL.saffron : PAL.cat[0]) + ';opacity:' + (1 - i * 0.12).toFixed(2) + '"></span></div>' +
        (conv != null ? '<div class="fn-conv">' + conv.toFixed(1) + '% step conversion</div>' : '') + '</li>';
    }).join('') + '</ol>';
  }

  /* ---------- Heat table (HTML) ---------- */
  function heat(rows, cols, matrix, o) {
    o = o || {};
    var fmt = o.fmt || fmtDefault;
    var flat = [];
    matrix.forEach(function (r) { r.forEach(function (v) { if (v != null) flat.push(v); }); });
    var max = o.max != null ? o.max : Math.max.apply(null, flat);
    var min = o.min != null ? o.min : Math.min(0, Math.min.apply(null, flat));
    var ramp = PAL.seq;
    var head = '<tr><th scope="col">' + esc(o.corner || '') + '</th>' + cols.map(function (c) { return '<th scope="col">' + esc(c) + '</th>'; }).join('') + (o.rowTotals ? '<th scope="col" class="num">' + esc(o.totalLabel || 'Total') + '</th>' : '') + '</tr>';
    var body = rows.map(function (r, i) {
      var tot = 0;
      var tds = cols.map(function (c, j) {
        var v = matrix[i][j];
        if (v == null) return '<td class="ht-na">—</td>';
        tot += v;
        var t = max === min ? 0.5 : (v - min) / (max - min);
        var idx = Math.max(0, Math.min(ramp.length - 1, Math.round(t * (ramp.length - 1))));
        var dark = idx >= 4;
        return '<td style="background:' + ramp[idx] + ';color:' + (dark ? '#fff' : '#1E2A3B') + '" data-tip="' + esc(r + ' · ' + c + ': ' + fmt(v)) + '">' + esc(o.cellFmt ? o.cellFmt(v) : fmt(v)) + '</td>';
      }).join('');
      return '<tr><th scope="row">' + esc(r) + '</th>' + tds + (o.rowTotals ? '<td class="num ht-tot">' + esc(fmt(tot)) + '</td>' : '') + '</tr>';
    }).join('');
    var scale = '<div class="ht-scale" aria-hidden="true"><span>' + esc(o.lowLabel || 'Low') + '</span>' + ramp.map(function (c) { return '<i style="background:' + c + '"></i>'; }).join('') + '<span>' + esc(o.highLabel || 'High') + '</span></div>';
    return '<div class="table-wrap otc-heat-wrap"><table class="otc-heat"><caption class="sr-only">' + esc(o.label || 'Heat table') + '</caption><thead>' + head + '</thead><tbody>' + body + '</tbody></table></div>' + scale;
  }

  function legend(items) {
    return '<ul class="otc-legend">' + items.map(function (it) {
      return '<li><i style="background:' + it.color + (it.dash ? ';background:repeating-linear-gradient(90deg,' + it.color + ' 0 4px,transparent 4px 7px)' : '') + '"></i>' + esc(it.name) + '</li>';
    }).join('') + '</ul>';
  }

  function table(headers, rows, summary) {
    return '<details class="otc-data"><summary>' + esc(summary || 'View data table') + '</summary><div class="table-wrap"><table class="table"><thead><tr>' +
      headers.map(function (h, i) { return '<th' + (i ? ' class="num"' : '') + '>' + esc(h) + '</th>'; }).join('') + '</tr></thead><tbody>' +
      rows.map(function (r) { return '<tr>' + r.map(function (c, i) { return '<td' + (i ? ' class="num"' : '') + '>' + esc(c) + '</td>'; }).join('') + '</tr>'; }).join('') +
      '</tbody></table></div></details>';
  }

  function wrap(svg, o, leg) {
    return '<div class="otc-wrap">' + svg + (leg || '') + (o.table || '') + '</div>';
  }

  /* ---------- Tooltip (one delegated handler for all charts) ---------- */
  var tipEl = null;
  function ensureTip() {
    if (tipEl && document.body.contains(tipEl)) return tipEl;
    tipEl = document.createElement('div');
    tipEl.className = 'otc-tip';
    tipEl.setAttribute('role', 'tooltip');
    document.body.appendChild(tipEl);
    return tipEl;
  }
  function place(e) {
    if (!tipEl) return;
    var x = e.clientX, y = e.clientY;
    var w = tipEl.offsetWidth, h = tipEl.offsetHeight;
    var vw = window.innerWidth;
    var left = Math.min(vw - w - 8, Math.max(8, x - w / 2));
    var top = y - h - 14;
    if (top < 8) top = y + 18;
    tipEl.style.transform = 'translate(' + Math.round(left) + 'px,' + Math.round(top) + 'px)';
  }
  function findTip(t) {
    while (t && t !== document) {
      if (t.getAttribute && t.getAttribute('data-tip')) return t;
      t = t.parentNode;
    }
    return null;
  }
  document.addEventListener('mouseover', function (e) {
    var t = findTip(e.target);
    if (!t) { if (tipEl) tipEl.classList.remove('show'); return; }
    ensureTip().textContent = t.getAttribute('data-tip');
    tipEl.classList.add('show');
    place(e);
  });
  document.addEventListener('mousemove', function (e) { if (tipEl && tipEl.classList.contains('show')) place(e); });
  document.addEventListener('scroll', function () { if (tipEl) tipEl.classList.remove('show'); }, true);
  window.addEventListener('hashchange', function () { if (tipEl) tipEl.classList.remove('show'); });

  OT.charts = {
    palette: PAL,
    narrow: narrow,
    shortNum: shortNum,
    bar: bar, hbar: hbar, stacked: stacked, stack100: stack100, line: line,
    donut: donut, sparkline: sparkline, funnel: funnel, heat: heat, legend: legend, table: table
  };
})();

/* OT.dashkit — shared layout helpers for Builder B views (partner/admin/insights/about/settings). */
(function () {
  'use strict';
  var OT = window.OT;
  var esc = OT.esc;

  /** Translate with fallback; works before/without i18n.js. */
  function t(key, fallback, vars) {
    var s = (OT.t ? OT.t(key, fallback, vars) : fallback);
    if (s == null || s === key) s = fallback;
    if (vars) s = String(s).replace(/\{(\w+)\}/g, function (m, k) { return vars[k] != null ? vars[k] : m; });
    return s;
  }

  /** Dashboard frame: side sub-nav + main column. Returns HTML; content goes in [data-dash-body]. */
  function frame(o) {
    var items = o.items.map(function (it) {
      return '<li><a href="#/' + o.base + (it.sub ? '/' + it.sub : '') + '" class="' + (it.sub === o.active ? 'on' : '') + '"' + (it.sub === o.active ? ' aria-current="page"' : '') + '>' +
        OT.icon(it.icon, 17) + '<span>' + esc(it.label) + '</span>' + (it.count ? '<span class="count">' + esc(it.count) + '</span>' : '') + '</a></li>';
    }).join('');
    return '<div class="container page"><div class="dash">' +
      '<aside class="dash-nav" aria-label="' + esc(o.navLabel || 'Dashboard sections') + '">' +
        '<div class="dash-id"><div><div class="eyebrow">' + esc(o.eyebrow) + '</div><strong>' + esc(o.who) + '</strong><small>' + esc(o.whoSub || '') + '</small></div>' + (o.idAction || '') + '</div>' +
        '<ul class="dash-menu">' + items + '</ul>' +
        (o.foot ? '<div class="dash-foot">' + o.foot + '</div>' : '') +
      '</aside>' +
      '<div class="dash-main"><div class="dash-title"><div><div class="eyebrow">' + esc(o.kicker || '') + '</div><h1>' + esc(o.title) + '</h1>' + (o.sub ? '<p>' + o.sub + '</p>' : '') + '</div>' + (o.tools ? '<div class="row-wrap">' + o.tools + '</div>' : '') + '</div>' +
      '<div data-dash-body></div></div></div></div>';
  }

  /** Navy KPI board. kpis: [{label, value, delta, dir:'up'|'down', good:true|false, spark:[...], hi:true, note}] */
  function board(kpis, note) {
    return '<div class="board' + (kpis.length >= 6 ? ' board-dense' : '') + '" role="list">' + kpis.map(function (k) {
      var deltaCls = k.dir ? ((k.good === false) ? 'down' : 'up') : '';
      return '<div class="bk" role="listitem"><div class="bk-l">' + esc(k.label) + '</div><div class="bk-v' + (k.hi ? ' hi' : '') + '">' + esc(k.value) + '</div>' +
        (k.delta ? '<div class="bk-d"><span class="' + deltaCls + '">' + (k.dir === 'up' ? '▲ ' : k.dir === 'down' ? '▼ ' : '') + esc(k.delta) + '</span> ' + esc(k.deltaNote || '') + '</div>' : (k.note ? '<div class="bk-d">' + esc(k.note) + '</div>' : '')) +
        (k.spark ? OT.charts.sparkline(k.spark, { color: '#8FB1EC', dot: '#FFB46B', w: 140, h: 26 }) : '') + '</div>';
    }).join('') + '</div>' + (note ? '<div class="board-note">' + note + '</div>' : '');
  }

  function sec(title, sub, body, tools) {
    return '<section class="dsec' + (title ? '' : ' dsec-lead') + '"><div class="dsec-h">' + (title ? '<h2>' + esc(title) + '</h2>' : '') + (sub ? '<p>' + sub + '</p>' : '') + (tools ? '<div class="tools">' + tools + '</div>' : '') + '</div>' + body + '</section>';
  }
  function pane(title, sub, body, cls) {
    return '<div class="pane ' + (cls || '') + '">' + (title ? '<h3>' + esc(title) + '</h3>' : '') + (sub ? '<p class="pane-sub">' + sub + '</p>' : '') + body + '</div>';
  }
  function simLine(text) {
    return '<div class="sim-line">' + OT.simTag() + '<span>' + esc(text || t('dash.simNote', 'Simulated pilot data for demonstration — not IRCTC, bank or BHASHINI data.')) + '</span></div>';
  }
  function pct(v, dp) { return (v == null || isNaN(v)) ? '—' : Number(v).toFixed(dp == null ? 1 : dp) + '%'; }
  function cr(v) { return '₹' + (v / 1e7).toFixed(2) + ' Cr'; }
  function lakh(v) { return '₹' + (v / 1e5).toFixed(1) + ' L'; }
  function money(v) { return v >= 1e7 ? cr(v) : v >= 1e5 ? lakh(v) : OT.inr(v); }
  function keep(s) { return '<bdi class="keep" translate="no">' + esc(s) + '</bdi>'; }
  function date(iso) {
    try { return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' }); } catch (e) { return String(iso || ''); }
  }

  /** Re-render the active route when the viewport crosses the chart breakpoint (charts size by viewport). */
  var lastNarrow = null;
  window.addEventListener('resize', OT.debounce ? OT.debounce(function () {
    var n = OT.charts.narrow();
    if (lastNarrow === null) { lastNarrow = n; return; }
    if (n !== lastNarrow) {
      lastNarrow = n;
      var cur = OT.router && OT.router.current && OT.router.current();
      if (cur && /^(partner|admin|insights|about)$/.test(cur.name)) {
        var y = window.scrollY;
        OT.router.render();
        window.scrollTo(0, y);
      }
    }
  }, 250) : function () {});
  lastNarrow = (window.innerWidth || 1024) < 700;

  OT.dashkit = { t: t, frame: frame, board: board, sec: sec, pane: pane, simLine: simLine, pct: pct, cr: cr, lakh: lakh, money: money, keep: keep, date: date };
})();
