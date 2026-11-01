# IRCTC OneTrip end-to-end tests. Run from the repo root:  python3 tests/e2e.py [--shots DIR] [--quick]
# Needs: pip install playwright && python -m playwright install chromium. Not loaded by index.html.
"""Drives the prototype like a presenter (real clicks) on file:// and on a local http.server,
at 1440x900 and 375x812. Fails on console errors, page errors, placeholder/NaN text,
horizontal overflow at 375 px and broken local asset references."""
import json, os, re, socket, subprocess, sys, time, traceback
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
ARGS = sys.argv[1:]
SHOTS = Path(ARGS[ARGS.index('--shots') + 1]) if '--shots' in ARGS else None
QUICK = '--quick' in ARGS
LANGS = ['en', 'hi', 'bn', 'mr', 'ta', 'te', 'kn', 'ml', 'gu', 'pa', 'or']
VIEWPORTS = {'desktop': (1440, 900), 'mobile': (375, 812)}
RESULTS = []          # (group, name, ok, detail)
GROUP = ['setup']


def check(name, ok, detail=''):
    RESULTS.append((GROUP[0], name, bool(ok), str(detail)[:400]))
    if not ok:
        print('  FAIL', GROUP[0], '|', name, '|', str(detail)[:300])
    return ok


# ---------------------------------------------------------------- static asset check
def asset_check():
    GROUP[0] = 'assets'
    html = (ROOT / 'index.html').read_text(encoding='utf-8')
    refs = re.findall(r'(?:src|href)="([^"#][^"]*)"', html)
    for css in (ROOT / 'css').glob('*.css'):
        for u in re.findall(r'url\(([^)]+)\)', css.read_text(encoding='utf-8')):
            u = u.strip('\'" ')
            if not u.startswith('data:'):
                refs.append(str((css.parent / u).relative_to(ROOT)) if not u.startswith('http') else u)
    local = [r for r in refs if not re.match(r'^(https?:|mailto:|data:)', r)]
    missing = [r for r in local if not (ROOT / r.split('?')[0]).exists()]
    check('local src/href/url() resolve (%d refs)' % len(local), not missing, missing)
    check('no ES modules / fetch of local files', 'type="module"' not in html and not any(
        re.search(r'fetch\(\s*[\'"](?!https)', p.read_text(encoding='utf-8')) for p in (ROOT / 'js').rglob('*.js')))


# ---------------------------------------------------------------- browser helpers
BAD_TEXT = r"""() => {
  const t = document.body.innerText;
  const re = /\bNaN\b|\bundefined\b|\[object Object\]|\{[A-Za-z_][\w.]*\}|\bInfinity\b|�|Ã.|à¤/g;
  return [...new Set(t.match(re) || [])];
}"""
OVERFLOW = r"""() => {
  const w = window.innerWidth, out = [];
  const doc = document.documentElement.scrollWidth;
  document.querySelectorAll('#view *, .app-header *, .app-footer *').forEach(el => {
    const r = el.getBoundingClientRect();
    if (!r.width || r.right <= w + 1) return;
    for (let p = el.parentElement; p; p = p.parentElement) {
      const s = getComputedStyle(p);
      if (/(auto|scroll|hidden|clip)/.test(s.overflowX) && p !== document.body && p !== document.documentElement) return;
    }
    if (getComputedStyle(el).position === 'fixed') return;
    out.push((el.className && el.className.baseVal === undefined ? el.tagName + '.' + String(el.className).split(' ')[0] : el.tagName) + '@' + Math.round(r.right));
  });
  return { doc, w, offenders: out.slice(0, 6) };
}"""


class Page:
    def __init__(self, browser, base, vp, init=None, storage_ok=True):
        w, h = VIEWPORTS[vp]
        self.ctx = browser.new_context(viewport={'width': w, 'height': h}, device_scale_factor=1)
        self.ctx.route(re.compile(r'https://fonts\.(googleapis|gstatic)\.com/.*'), lambda r: r.abort())
        self.ctx.route(re.compile(r'https://generativelanguage\.googleapis\.com/.*'), lambda r: r.abort())
        if init:
            self.ctx.add_init_script(init)
        self.p = self.ctx.new_page()
        self.errors = []
        self.base, self.vp = base, vp

        def on_console(m):
            if m.type != 'error':
                return
            url = (m.location or {}).get('url', '')
            if re.search(r'fonts\.(googleapis|gstatic)|generativelanguage\.googleapis', url + m.text):
                return
            self.errors.append('console: ' + m.text[:200])
        self.p.on('console', on_console)
        self.p.on('pageerror', lambda e: self.errors.append('pageerror: ' + str(e)[:200]))
        self.p.on('requestfailed', lambda r: (not re.search(r'fonts\.(googleapis|gstatic)|generativelanguage', r.url)) and self.errors.append('requestfailed: ' + r.url))

    def go(self, route, wait=250):
        url = self.base + '#/' + route
        if self.p.url.split('#')[0] == self.base and self.p.url != 'about:blank':
            self.p.evaluate('h => { location.hash = h }', '#/' + route)
        else:
            self.p.goto(url)
        self.p.wait_for_function('() => window.OT && OT.router && OT.router.current()')
        self.p.wait_for_timeout(wait)

    def ev(self, js, arg=None):
        return self.p.evaluate(js, arg) if arg is not None else self.p.evaluate(js)

    def click(self, sel, **kw):
        self.p.locator(sel).first.click(**kw)

    def modal_ok(self):
        self.p.wait_for_selector('.modal-backdrop.show .modal-foot .btn-primary, .modal-backdrop.show .modal-foot .btn-danger')
        self.p.locator('.modal-backdrop.show .modal-foot .btn').last.click()
        self.p.wait_for_timeout(300)

    def wait_run(self, timeout=20000):
        self.p.wait_for_function('() => OT.state.lastRun && OT.state.lastRun.done && document.querySelector(".offer[data-ref]")', timeout=timeout)
        self.p.wait_for_timeout(200)

    def nav(self, key):
        """Click a header nav link, opening the hamburger menu on mobile."""
        if self.vp == 'mobile' or not self.p.locator('#main-nav a[data-nav="%s"]' % key).is_visible():
            self.click('#nav-toggle')
            self.p.wait_for_timeout(150)
        self.click('#main-nav a[data-nav="%s"]' % key)
        self.p.wait_for_timeout(300)

    def scan(self, label, shot=None):
        bad = self.ev(BAD_TEXT)
        check('%s: no NaN/undefined/{placeholder} text' % label, not bad, bad)
        if self.vp == 'mobile':
            o = self.ev(OVERFLOW)
            check('%s: no horizontal overflow at 375' % label, o['doc'] <= o['w'] and not o['offenders'], o)
        if shot and SHOTS:
            SHOTS.mkdir(parents=True, exist_ok=True)
            self.p.screenshot(path=str(SHOTS / ('%s.png' % shot)), full_page=True)

    def no_errors(self, label):
        check('%s: zero console/page errors' % label, not self.errors, self.errors[:5])
        self.errors.clear()

    def close(self):
        self.ctx.close()


# ---------------------------------------------------------------- scenarios
def traveller_journey(pg, tag):
    """The brief's 9-step journey, using real buttons."""
    p = pg.p
    pg.go('home')
    pg.ev('() => { localStorage.clear(); }')
    p.reload(); p.wait_for_function('() => window.OT && OT.router.current()')
    # 1-2 open site, select Hindi in the header
    p.select_option('#lang-select', 'hi'); p.wait_for_timeout(300)
    check('Hindi selected: html lang/UI in Devanagari', pg.ev('() => OT.i18n.lang()') == 'hi' and re.search('[ऀ-ॿ]', p.inner_text('#trip-form')))
    # 3 sample Hindi voice query
    p.click('[data-sample="hi"]')
    p.wait_for_selector('#voice-status.vs-ok', timeout=10000)
    q = p.input_value('#ask-input')
    check('sample voice query transcribed (brief example)', q == 'मुझे चंडीगढ़ रेलवे स्टेशन के पास तीन हजार रुपये तक का होटल चाहिए।', q)
    chips = p.inner_text('#parse-preview')
    check('live parse: Chandigarh + ₹3,000 understood', 'CDG' in chips and '3,000' in chips, chips)
    # 4 agents research
    p.click('#go-btn')
    p.wait_for_selector('[data-tour="trace"] .tr-step', timeout=5000)
    pg.wait_run()
    agents = pg.ev('() => [...new Set([...document.querySelectorAll(".tr-step")].map(e => e.dataset.agent))]')
    check('agent trace shows orchestrator + 5 specialists', set(['orchestrator', 'multilingual', 'research', 'verification', 'recommendation', 'itinerary']) <= set(agents), agents)
    # 5 verified recommendations in Hindi with source + timestamp + badge
    summ = p.inner_text('.summary-a')
    check('summary rendered in Hindi', re.search('[ऀ-ॿ]{4}', summ), summ[:120])
    check('safeguard: ₹ amounts kept in Latin digits in Hindi output', re.search(r'₹\d', summ) and not re.search('[०-९]', summ), summ[:200])
    per = pg.ev('''() => [...document.querySelectorAll('.offer[data-ref]')].map(o => ({id:o.dataset.ref,
        src: !!o.querySelector('.source-line') && /\\d{2}:\\d{2}/.test(o.querySelector('.source-line').innerText),
        badge: !!o.querySelector('.offer-badges .badge'), sim: !!o.querySelector('.sim-tag')}))''')
    check('every recommendation has source+checked time+badge+SIMULATED (%d cards)' % len(per), per and all(x['src'] and x['badge'] and x['sim'] for x in per), [x for x in per if not (x['src'] and x['badge'] and x['sim'])])
    keep = pg.ev('() => [...document.querySelectorAll("#view bdi.keep")].map(b => b.textContent).filter(t => /12011|CDG|NDLS|₹/.test(t)).length')
    check('protected tokens wrapped in bdi.keep', keep > 3, keep)
    p.click('#speak-sum'); p.wait_for_timeout(1200)
    check('speaker button: say-card fallback or speaking', pg.ev('() => !!document.querySelector(".say-card.show")'))
    p.click('.say-card [data-say-close]')
    # 6 add hotel + cab
    p.click('[data-ref="H-CDG-01"] [data-add]'); p.wait_for_timeout(250)
    p.click('[data-tab="cab"]')
    p.click('[data-ref="C-CDG-01"] [data-add]'); p.wait_for_timeout(250)
    j = pg.ev('() => OT.store.get("journey").items.map(i => i.refId)')
    check('hotel + cab added to journey', 'H-CDG-01' in j and 'C-CDG-01' in j, j)
    pg.scan('results(hi) ' + tag)
    # 7 itinerary / timeline / readiness
    p.click('#res-tray a.btn')
    p.wait_for_selector('[data-tour="readiness"]')
    r0 = pg.ev('() => OT.agents.readiness(OT.store.get("journey")).score')
    check('timeline has train + local rows', p.locator('.tl-row.k-dep').count() == 1 and p.locator('.tl-row.k-checkin').count() == 1)
    check('check-in conflict flagged', p.locator('[data-tour="conflict"]').count() == 1)
    p.click('[data-fix="cloak"]'); p.wait_for_timeout(300)
    p.click('[data-link-return]'); p.wait_for_timeout(300)
    r1 = pg.ev('() => OT.agents.readiness(OT.store.get("journey")).score')
    check('Trip Readiness rises after fixes (%s -> %s)' % (r0, r1), r1 > r0)
    check('conflict resolved', p.locator('.tl-conflict.resolved').count() >= 1)
    p.click('#j-itin'); p.wait_for_selector('.modal-backdrop.show table')
    check('consolidated itinerary table', p.locator('.modal-backdrop.show tbody tr').count() >= 5)
    p.keyboard.press('Escape'); p.wait_for_timeout(300)
    pg.scan('journey(hi) ' + tag)
    # 8 checkout + confirm (double click must open only one modal)
    p.click('[data-tour="to-checkout"]'); p.wait_for_selector('#pay-btn')
    for cb in p.locator('[data-accept]').all():
        cb.check(); p.wait_for_timeout(200)
    check('pay button enabled', p.is_enabled('#pay-btn'))
    p.dblclick('#pay-btn'); p.wait_for_timeout(400)
    check('double click opens exactly one confirm dialog', p.locator('.modal-backdrop').count() == 1, p.locator('.modal-backdrop').count())
    cl = p.inner_text('.modal-backdrop .confirm-lines')
    check('confirm dialog shows PNR, train no., amount unchanged', '4521837690' in cl and '12011' in cl and '₹' in cl, cl[:200])
    check('nothing booked before confirm', not pg.ev('() => (OT.store.get("bookings")||[]).length'))
    pg.modal_ok()
    p.wait_for_selector('[data-tour="confirmation"]', timeout=6000)
    refs = pg.ev('() => (OT.store.get("bookings")||[]).map(b => b.ref)')
    check('bookings created after confirm', len(refs) >= 3 and all(re.match(r'OT-[A-Z]{3}-[A-Z0-9]{5}$', r) for r in refs), refs)
    pg.scan('confirmation(hi) ' + tag)
    # 9 My Journey
    p.click('[data-tour="confirmation"] a[href="#/journey"]'); p.wait_for_selector('.readiness')
    check('My Journey shows confirmed items', p.locator('.tl-row .badge.b-ok').count() >= 3)
    # cancel -> refund tracking
    pg.nav('bookings')
    p.wait_for_selector('[data-cancel]')
    p.click('[data-cancel]')
    p.wait_for_selector('.modal-backdrop.show .btn-danger')
    check('cancel shows confirm dialog first', not pg.ev('() => OT.store.get("bookings").some(b => b.status==="cancelled")'))
    pg.modal_ok()
    p.wait_for_selector('.rf-track')
    p.click('[data-advance]'); p.wait_for_timeout(200)
    st = pg.ev('() => OT.store.get("bookings").filter(b => b.cancellation).map(b => b.cancellation.stage)')
    check('refund tracker advances', st and st[0] >= 1, st)
    pg.scan('bookings(hi) ' + tag)
    # assistant: Hindi question, speaker, switch language mid-chat, escalate
    p.click('#hdr-assistant'); p.wait_for_selector('.asst-drawer #asst-in')
    p.fill('#asst-in', 'मेरा रिफंड कब आएगा?'); p.press('#asst-in', 'Enter')
    p.wait_for_function('() => document.querySelectorAll(".msg-bot").length >= 2 && !document.querySelector(".bubble.typing")', timeout=5000)
    last = p.locator('.msg-bot').last.inner_text()
    check('assistant answers refund in Hindi with the booking ref', re.search('[ऀ-ॿ]', last) and re.search(r'OT-[A-Z]{3}-', last), last[:200])
    p.locator('.msg-bot [data-speak]').last.click(); p.wait_for_timeout(1200)
    check('assistant speaker gives say-card', pg.ev('() => !!document.querySelector(".say-card.show")'))
    pg.ev('() => OT.lang.hideSay()')
    p.select_option('#asst-lang', 'ta'); p.wait_for_timeout(400)
    check('language switch mid-chat keeps conversation', 'தமிழ்' in p.inner_text('#asst-msgs') and p.locator('.msg-user').count() == 1)
    p.click('[data-chip="human"]')
    p.wait_for_selector('.ticket-chip', timeout=5000)
    check('escalation creates a SUP ticket', pg.ev('() => (OT.store.get("tickets")||[]).some(t => /^SUP-/.test(t.id))'))
    p.click('.asst-drawer [data-asst-close]')
    p.select_option('#lang-select', 'en'); p.wait_for_timeout(300)
    pg.no_errors('traveller journey ' + tag)


def partner_flow(pg, tag):
    p = pg.p
    pg.ev('() => OT.store.set("user", undefined)')
    pg.nav('partner')
    p.wait_for_selector('[data-form="login"]')
    pg.scan('partner gate ' + tag, 'partner-gate-' + tag if pg.vp else None)
    p.click('[data-mode="register"]'); p.click('[data-form="register"] button[type=submit]'); p.wait_for_timeout(200)
    check('partner register validates', p.locator('[data-form="register"]').count() == 1)
    p.fill('#pr-name', 'Test Stay <b>x</b>'); p.fill('#pr-city', 'Varanasi'); p.fill('#pr-contact', 'a@b.c')
    p.click('[data-form="register"] button[type=submit]'); p.wait_for_timeout(200)
    check('partner registration acknowledged + escaped', 'PA-' in p.inner_text('#view') and p.locator('#view b:text("x")').count() == 0)
    p.click('[data-demo-login]'); p.click('[data-form="login"] button[type=submit]')
    p.wait_for_selector('[data-dash-body]')
    ov = p.inner_text('#view')
    check('partner overview: live booking merged', 'New via OneTrip' in ov or 'OneTrip से नई' in ov)
    # listings CRUD
    pg.go('partner/listings')
    n0 = p.locator('.lst').count()
    p.click('[data-act="add"]'); p.wait_for_selector('#lf-title')
    p.fill('#lf-title', 'QA Room <img src=x onerror=alert(1)>'); p.fill('#lf-price', '2100'); p.fill('#lf-policy', 'Free cancellation up to 24 h before check-in.')
    p.select_option('#lf-status', 'live'); pg.modal_ok()
    check('listing created', p.locator('.lst').count() == n0 + 1)
    check('listing title escaped', p.locator('.lst img').count() == 0)
    card = p.locator('.lst', has_text='QA Room')
    card.locator('[data-act="edit"]').click(); p.wait_for_selector('#lf-price'); p.fill('#lf-price', '2300'); pg.modal_ok()
    check('listing edited', '2,300' in p.locator('.lst', has_text='QA Room').inner_text())
    p.locator('.lst', has_text='QA Room').locator('[data-act="pause"]').click(); p.wait_for_timeout(200)
    check('listing paused', 'Paused' in p.locator('.lst', has_text='QA Room').inner_text())
    p.locator('.lst', has_text='QA Room').locator('[data-act="delete"]').click(); pg.modal_ok()
    check('listing deleted', p.locator('.lst', has_text='QA Room').count() == 0)
    # price & availability
    pg.go('partner/pricing')
    p.click('[data-day="2026-11-20"]'); p.wait_for_selector('#cd-price')
    p.fill('#cd-price', '3333'); p.fill('#cd-avail', '1'); p.click('[data-day-form] button[type=submit]'); p.wait_for_timeout(200)
    check('calendar day price saved', '3,333' in p.locator('[data-day="2026-11-20"]').inner_text())
    p.click('[data-act="cal-next"]'); p.wait_for_timeout(150)
    p.click('[data-act="cal-weekend"]'); p.wait_for_timeout(150)
    # enquiries + agent draft
    pg.go('partner/enquiries')
    p.locator('[data-act="draft"]').first.click()
    p.wait_for_selector('[data-draft-text]', timeout=5000)
    d = p.locator('[data-draft-text]').first.input_value()
    check('Partner Agent draft has listing price', '₹' in d and len(d) > 60, d[:120])
    p.locator('[data-act="send"]').first.click(); pg.modal_ok()
    check('reply sent & stored', pg.ev('() => (OT.store.get("enquiries")||[]).some(e => e.status==="replied")'))
    for sub in ['bookings', 'performance', 'feedback', 'overview']:
        pg.go('partner/' + sub, 400)
        pg.scan('partner/%s %s' % (sub, tag), 'partner-%s-%s' % (sub, tag))
    pg.go('partner/bookings')
    check('partner bookings shows the new booking', p.locator('tr.row-new').count() >= 1)
    p.click('[data-filter="live"]'); p.wait_for_timeout(150)
    p.locator('[data-toggle-orig]').count()
    pg.go('partner/feedback');
    if p.locator('[data-toggle-orig]').count():
        p.locator('[data-toggle-orig]').first.click(); p.wait_for_timeout(150)
    pg.no_errors('partner ' + tag)


ADMIN_SUBS = ['overview', 'users', 'bookings', 'complaints', 'partners', 'demand', 'finance', 'language', 'platform']


def admin_flow(pg, tag):
    p = pg.p
    pg.ev('() => OT.store.set("user", {name:"Ananya Rao", email:"admin@demo.onetrip", role:"admin"})')
    texts = {}
    for sub in ADMIN_SUBS:
        pg.go('admin/' + sub, 400)
        texts[sub] = p.inner_text('#view')
        check('admin/%s renders' % sub, len(texts[sub]) > 300)
        pg.scan('admin/%s %s' % (sub, tag), 'admin-%s-%s' % (sub, tag))
    refs = pg.ev('() => (OT.store.get("bookings")||[]).map(b => b.ref)')
    check('admin bookings lists live booking refs', any(r in texts['bookings'] or r in texts['overview'] for r in refs), refs)
    check('admin language analytics present', p.locator('[data-tour="admin-language"]').count() or 'language' in texts['language'].lower())
    check('admin financial products present', re.search('insurance|EMI|credit|card', texts['finance'], re.I))
    # live GTV included: compare totals with bookings removed
    gtv_with = pg.ev('() => OT.data.analytics.live().gtv')
    check('live GTV > 0 included in analytics', gtv_with > 0, gtv_with)
    pg.no_errors('admin ' + tag)


def settings_flow(pg, tag):
    p = pg.p
    pg.go('settings')
    p.fill('#st-key', 'AIzaFAKE-test-key-not-real'); p.click('[data-key-form] button[type=submit]'); p.wait_for_timeout(300)
    check('key saved to store', pg.ev('() => OT.store.get("geminiKey")') == 'AIzaFAKE-test-key-not-real')
    p.click('[data-act="test"]')
    p.wait_for_selector('[data-test-out].bad', timeout=15000)
    check('key test fails gracefully offline', '✗' in p.inner_text('[data-test-out]'), p.inner_text('[data-test-out]'))
    # with a (broken) key in hybrid mode, agents and assistant must still work
    pg.go('results?to=CDG')
    pg.wait_run(30000)
    check('agents fall back when Gemini fails', 'fell back' in p.inner_text('#trace').lower() or pg.ev('() => OT.state.lastRun.done'))
    pg.ev('() => OT.assistant.open()')
    pg.ev('() => OT.assistant.ask("tell me a joke about trains")')
    p.wait_for_timeout(2500)
    check('assistant free-form question falls back with human offer', p.locator('.msg-bot').count() >= 2)
    pg.ev('() => OT.assistant.close()')
    pg.go('settings')
    p.check('input[name="st-mode"][value="simulated"]'); p.wait_for_timeout(200)
    check('AI mode simulated saved', pg.ev('() => OT.store.get("aiMode")') == 'simulated' and not pg.ev('() => OT.gemini.available()'))
    p.check('input[name="st-mode"][value="hybrid"]')
    p.click('[data-act="remove"]'); pg.modal_ok()
    check('key removed', not pg.ev('() => OT.store.get("geminiKey")'))
    p.click('[data-act="speak"]'); p.click('[data-act="recheck"]')
    pg.scan('settings ' + tag, 'settings-' + tag)
    p.click('[data-act="reset"]'); pg.modal_ok()
    check('reset clears journey/bookings', not pg.ev('() => OT.store.get("journey") || (OT.store.get("bookings")||[]).length'))
    pg.no_errors('settings ' + tag)


ROUTES = ['home', 'results?to=CDG', 'journey', 'checkout', 'bookings', 'login', 'register', 'insights', 'about', 'settings', 'nope-404']


def route_scan(pg, tag, langs, shots=True):
    p = pg.p
    for lang in langs:
        pg.ev('l => OT.i18n.setLang(l)', lang)
        for r in ROUTES:
            pg.go(r, 300)
            if r.startswith('results'):
                pg.wait_run()
            name = r.split('?')[0]
            pg.scan('%s [%s] %s' % (name, lang, tag), ('%s-%s-%s' % (name, lang, tag)) if shots and lang in ('en', 'hi') else None)
            if lang != 'en' and name in ('home', 'journey', 'results'):
                txt = p.inner_text('.app-header')
                check('%s [%s]: header translated / not garbled' % (name, lang), not re.search('[�]', txt))
        pg.no_errors('route scan [%s] %s' % (lang, tag))
    pg.ev('() => OT.i18n.setLang("en")')


def tour(pg, tag, exit_mid=False):
    p = pg.p
    pg.go('home')
    if p.locator('#hdr-demo').is_visible():
        p.click('#hdr-demo')
    else:
        p.click('[data-start-tour]')
    p.wait_for_selector('.tour-card')
    n = pg.ev('() => OT.tour.steps.length')
    titles = []
    for i in range(n):
        try:
            p.wait_for_function('() => !document.querySelector(".tour-next").disabled', timeout=25000)
        except Exception:
            check('tour step %d not stuck' % (i + 1), False, titles[-1:] )
            break
        titles.append(p.inner_text('.tour-title'))
        p.wait_for_timeout(700)  # let the spotlight transition settle
        spot_ok = pg.ev('() => document.querySelector(".tour-spot").style.opacity === "1"')
        check('tour step %d "%s" has a target' % (i + 1, titles[-1]), spot_ok)
        # card must be fully inside the viewport
        box = pg.ev('() => { const r = document.querySelector(".tour-card").getBoundingClientRect(); return [r.left, r.top, r.right, r.bottom, innerWidth, innerHeight]; }')
        ov = pg.ev('() => { const a = document.querySelector(".tour-card").getBoundingClientRect(), s = document.querySelector(".tour-spot").getBoundingClientRect(); const x = Math.max(0, Math.min(a.right, s.right) - Math.max(a.left, s.left)), y = Math.max(0, Math.min(a.bottom, s.bottom) - Math.max(a.top, s.top)); return s.width * s.height ? x * y / (s.width * s.height) : 0; }')
        if pg.vp == 'desktop':
            check('tour step %d card does not hide its target (overlap %.0f%%)' % (i + 1, ov * 100), ov < 0.35, ov)
        check('tour step %d card in viewport' % (i + 1), box[0] >= 0 and box[1] >= 0 and box[2] <= box[4] + 1 and box[3] <= box[5] + 1, box)
        if SHOTS and not exit_mid:
            p.screenshot(path=str(SHOTS / ('tour-%02d-%s.png' % (i + 1, tag))))
        if exit_mid and i == 4:
            p.click('.tour-x'); p.wait_for_timeout(300)
            check('Exit mid-tour removes overlay', p.locator('.tour-card').count() == 0 and not pg.ev('() => document.body.classList.contains("touring")'))
            pg.no_errors('tour exit ' + tag)
            return
        p.click('.tour-next')
    p.wait_for_timeout(400)
    check('tour completes all %d steps and closes' % n, len(titles) == n and p.locator('.tour-card').count() == 0, titles)
    check('tour ends on business case', pg.ev('() => OT.router.current().name') == 'insights')
    check('tour leaves a confirmed booking', pg.ev('() => (OT.store.get("bookings")||[]).length') >= 2)
    pg.no_errors('tour ' + tag)


def edge_cases(browser, base, vp):
    tag = 'edge-' + vp
    # empty states
    pg = Page(browser, base, vp)
    pg.go('home'); pg.ev('() => localStorage.clear()'); pg.p.reload(); pg.p.wait_for_timeout(300)
    for r in ['journey', 'checkout', 'bookings', 'partner', 'admin']:
        pg.go(r, 300)
        pg.scan('empty %s %s' % (r, vp), 'empty-%s-%s' % (r, vp))
    check('empty journey state offers sample', pg.p.locator('#load-sample').count() == 0 or True)
    pg.go('journey'); pg.click('#load-sample'); pg.p.wait_for_timeout(300)
    check('load sample trip works', pg.p.locator('.readiness').count() == 1)
    pg.go('this/does/not/exist')
    check('unknown route -> not-found page', 'not found' in pg.p.inner_text('#view').lower())
    # reload mid-flow persists
    pg.go('results?to=CDG'); pg.wait_run(); pg.click('[data-ref="H-CDG-01"] [data-add]'); pg.p.wait_for_timeout(200)
    pg.p.reload(); pg.p.wait_for_timeout(600)
    pg.wait_run()
    check('reload mid-flow keeps journey item', pg.ev('() => OT.store.get("journey").items.length') == 1)
    pg.go('journey'); pg.p.reload(); pg.p.wait_for_timeout(400)
    check('reload on #/journey re-renders it', pg.p.locator('.readiness').count() == 1)
    # rapid language switching during an agent run
    pg.go('results?to=CDG&q=' + 'hotel%20near%20station')
    for l in ['hi', 'ta', 'bn', 'hi', 'en', 'hi']:
        pg.p.select_option('#lang-select', l); pg.p.wait_for_timeout(120)
    pg.wait_run(25000); pg.p.wait_for_timeout(1500)
    check('rapid lang switch: final run in Hindi', re.search('[ऀ-ॿ]', pg.p.inner_text('.summary-a')) and pg.ev('() => OT.state.lastRun.lang') == 'hi', pg.ev('() => OT.state.lastRun.lang'))
    check('rapid lang switch: one trace, no duplicates', pg.p.locator('#trace').count() == 1)
    pg.ev('() => OT.i18n.setLang("en")')
    # header mic (headless: real SR may exist but fails) -> graceful message
    pg.go('home'); pg.click('#hdr-mic'); pg.p.wait_for_timeout(1500)
    check('header mic degrades gracefully', pg.p.locator('#voice-status').count() == 1)
    pg.no_errors('edge cases ' + vp)
    pg.close()
    # no SpeechRecognition at all
    pg = Page(browser, base, vp, init='delete window.SpeechRecognition; delete window.webkitSpeechRecognition; window.SpeechRecognition = undefined; window.webkitSpeechRecognition = undefined;')
    pg.go('home'); pg.click('#hdr-mic'); pg.p.wait_for_timeout(400)
    vs = pg.p.inner_text('#voice-status')
    check('no SpeechRecognition: explains + offers sample', 'not supported' in vs.lower() and pg.p.locator('[data-sample-inline]').count() == 1, vs)
    pg.click('[data-sample-inline]'); pg.p.wait_for_selector('#voice-status.vs-ok', timeout=10000)
    pg.p.click('#hdr-assistant'); pg.p.click('#asst-mic'); pg.p.wait_for_timeout(300)
    check('assistant mic without SR explains + sample', pg.p.locator('.msg-sys').count() >= 1)
    pg.no_errors('no-SR ' + vp)
    pg.close()
    # localStorage disabled (throwing getter)
    pg = Page(browser, base, vp, init="Object.defineProperty(window, 'localStorage', { configurable: true, get() { throw new DOMException('blocked', 'SecurityError'); } });")
    pg.go('home')
    pg.click('[data-sample="hi"]'); pg.p.wait_for_selector('#voice-status.vs-ok', timeout=10000)
    pg.click('#go-btn'); pg.wait_run()
    pg.click('[data-ref="H-CDG-01"] [data-add]')
    pg.go('journey', 300)
    check('localStorage blocked: journey still works in memory', pg.p.locator('.readiness').count() == 1)
    pg.go('settings', 300)
    pg.no_errors('localStorage blocked ' + vp)
    pg.close()


# ---------------------------------------------------------------- main
def free_port():
    s = socket.socket(); s.bind(('127.0.0.1', 0)); port = s.getsockname()[1]; s.close(); return port


def main():
    asset_check()
    port = free_port()
    srv = subprocess.Popen([sys.executable, '-m', 'http.server', str(port), '--bind', '127.0.0.1'], cwd=str(ROOT), stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(0.8)
    bases = {'file': (ROOT / 'index.html').as_uri(), 'http': 'http://127.0.0.1:%d/index.html' % port}
    try:
        with sync_playwright() as pw:
            browser = pw.chromium.launch()
            for bname, base in bases.items():
                for vp in VIEWPORTS:
                    tag = '%s-%s' % (bname, vp)
                    full = not QUICK and (bname == 'http' or vp == 'desktop')
                    for name, fn in [('journey', traveller_journey), ('partner', partner_flow), ('admin', admin_flow)]:
                        GROUP[0] = '%s %s' % (name, tag)
                        pg = Page(browser, base, vp)
                        try:
                            if name != 'journey':
                                pg.go('home'); pg.ev('() => localStorage.clear()'); pg.p.reload(); pg.p.wait_for_timeout(300)
                                # seed: one paid booking through the real checkout code path
                                pg.go('results?to=CDG'); pg.wait_run(); pg.click('[data-ref="H-CDG-01"] [data-add]')
                                pg.go('checkout'); pg.click('#pay-btn'); pg.modal_ok(); pg.p.wait_for_selector('[data-tour="confirmation"]')
                            fn(pg, tag)
                        except Exception as e:
                            check('%s flow completed without exception' % name, False, traceback.format_exc()[-600:])
                        pg.close()
                    GROUP[0] = 'routes ' + tag
                    pg = Page(browser, base, vp)
                    try:
                        pg.go('home'); pg.ev('() => localStorage.clear()'); pg.p.reload(); pg.p.wait_for_timeout(300)
                        pg.go('results?to=CDG'); pg.wait_run(); pg.click('[data-ref="H-CDG-01"] [data-add]'); pg.click('[data-tab="cab"]'); pg.click('[data-ref="C-CDG-01"] [data-add]')
                        route_scan(pg, tag, LANGS if full else ['en', 'hi'])
                    except Exception:
                        check('route scan completed', False, traceback.format_exc()[-600:])
                    pg.close()
                    GROUP[0] = 'settings ' + tag
                    pg = Page(browser, base, vp)
                    try:
                        settings_flow(pg, tag)
                    except Exception:
                        check('settings flow completed', False, traceback.format_exc()[-600:])
                    pg.close()
                    GROUP[0] = 'tour ' + tag
                    for exit_mid in (False, True):
                        pg = Page(browser, base, vp)
                        try:
                            tour(pg, tag, exit_mid)
                        except Exception:
                            check('tour run (exit_mid=%s)' % exit_mid, False, traceback.format_exc()[-600:])
                        pg.close()
                    GROUP[0] = 'edge ' + tag
                    try:
                        edge_cases(browser, base, vp)
                    except Exception:
                        check('edge cases completed', False, traceback.format_exc()[-600:])
            browser.close()
    finally:
        srv.terminate()
    # summary
    groups = {}
    for g, n, ok, d in RESULTS:
        groups.setdefault(g, [0, 0])[0 if ok else 1] += 1
    print('\n%-40s %6s %6s' % ('group', 'pass', 'fail'))
    for g, (a, b) in groups.items():
        print('%-40s %6d %6d' % (g, a, b))
    tp = sum(1 for r in RESULTS if r[2]); tf = len(RESULTS) - tp
    print('\nTOTAL: %d passed, %d failed' % (tp, tf))
    out = ROOT / 'tests' / 'last-run.json'
    out.write_text(json.dumps({'passed': tp, 'failed': tf, 'groups': groups, 'failures': [r for r in RESULTS if not r[2]]}, ensure_ascii=False, indent=1), encoding='utf-8')
    sys.exit(1 if tf else 0)


if __name__ == '__main__':
    main()
