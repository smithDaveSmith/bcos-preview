/* =============================================================================
   Beacon — motion system and instrument
   One gesture ("the sweep") at three scales: the beam, the ruled line, the
   button underline. Everything is built inside gsap.matchMedia() contexts so
   it reverts cleanly on resize and respects prefers-reduced-motion.
   ============================================================================= */
(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  var hasGSAP = typeof window.gsap !== 'undefined';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  root.classList.remove('no-js');
  doc.body.classList.add(hasGSAP && !reduced ? 'js-motion' : 'no-motion');

  /* -------------------------------------------------- utilities */
  function $(s, c) { return (c || doc).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); }
  var DAY = 86400000;

  function startOfDay(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
  function parseISO(s) {
    if (!s) return null;
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
    if (!m) return null;
    var d = new Date(+m[1], +m[2] - 1, +m[3]);
    return (d.getFullYear() === +m[1] && d.getMonth() === +m[2] - 1 && d.getDate() === +m[3]) ? d : null;
  }
  function toISO(d) {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function addDays(d, n) { var r = new Date(d.getTime()); r.setDate(r.getDate() + n); return r; }
  /** Add whole months, clamping the day to the last day of the target month. */
  function addMonths(d, n) {
    var day = d.getDate();
    var r = new Date(d.getFullYear(), d.getMonth() + n, 1);
    var last = new Date(r.getFullYear(), r.getMonth() + 1, 0).getDate();
    r.setDate(Math.min(day, last));
    return r;
  }
  function daysBetween(a, b) { return Math.round((startOfDay(b) - startOfDay(a)) / DAY); }
  var FMT = new Intl.DateTimeFormat('en-IE', { day: 'numeric', month: 'long', year: 'numeric' });
  var FMT_S = new Intl.DateTimeFormat('en-IE', { day: 'numeric', month: 'short', year: 'numeric' });
  var FMT_M = new Intl.DateTimeFormat('en-IE', { day: 'numeric', month: 'short' });
  function euro(n) { return '€' + Number(n).toLocaleString('en-IE'); }

  /* -------------------------------------------------- GSAP setup */
  var SWEEP = 'power3.inOut';
  if (hasGSAP) {
    var plugins = [];
    if (window.ScrollTrigger) plugins.push(window.ScrollTrigger);
    if (window.SplitText) plugins.push(window.SplitText);
    if (window.DrawSVGPlugin) plugins.push(window.DrawSVGPlugin);
    if (window.CustomEase) plugins.push(window.CustomEase);
    if (window.Flip) plugins.push(window.Flip);
    gsap.registerPlugin.apply(gsap, plugins);
    if (window.CustomEase) {
      /* The sweep: slow to leave, decisive through the middle, settles without bounce.
         Used for the beam, the ruled lines and the button underlines alike. */
      CustomEase.create('sweep', '0.22,0.00,0.10,1.00');
      SWEEP = 'sweep';
    }
    gsap.defaults({ ease: SWEEP, duration: 0.9 });
  }

  /* =============================================================================
     1. HEADER + MENU
     ============================================================================= */
  (function header() {
    var btn = $('[data-menu-toggle]');
    var menu = $('[data-menu]');
    if (!btn || !menu) return;
    var open = false;
    var lastFocus = null;

    function setOpen(v) {
      open = v;
      btn.setAttribute('aria-expanded', String(v));
      if (v) {
        lastFocus = doc.activeElement;
        menu.hidden = false;
        doc.body.style.overflow = 'hidden';
        if (hasGSAP && !reduced) {
          gsap.fromTo(menu.querySelectorAll('.menu__i'),
            { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: .5, stagger: .05, ease: 'power2.out' });
        }
        var first = menu.querySelector('a');
        if (first) first.focus();
      } else {
        menu.hidden = true;
        doc.body.style.overflow = '';
        if (lastFocus) lastFocus.focus();
      }
    }
    btn.addEventListener('click', function () { setOpen(!open); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
    doc.addEventListener('keydown', function (e) { if (e.key === 'Escape' && open) setOpen(false); });
    window.addEventListener('resize', function () { if (open && window.innerWidth >= 900) setOpen(false); });
  })();

  /* =============================================================================
     2. THE INSTRUMENT
     The deadline is the horizon. Above it, the time you have. Below it, the
     penalty accruing. The beam points at today.
     ============================================================================= */
  var Instrument = (function () {
    var R = 150;                 // radius in viewBox units
    var SPAN_BEFORE = 365;       // days of "before" mapped onto the upper semicircle
    var SPAN_AFTER = 368;        // days to the €1,200 cap, mapped onto the lower semicircle
    var PEN = { initial: 100, daily: 3, max: 1200 };

    function angleBefore(d) { return -180 * (Math.min(Math.max(d, 0), SPAN_BEFORE) / SPAN_BEFORE); }
    function angleAfter(n) { return 180 * (Math.min(Math.max(n, 0), SPAN_AFTER) / SPAN_AFTER); }
    function pt(deg, r) {
      var a = deg * Math.PI / 180, rr = r == null ? R : r;
      return [rr * Math.cos(a), rr * Math.sin(a)];
    }
    function arcPath(a1, a2, r) {
      var rr = r == null ? R : r;
      var p1 = pt(a1, rr), p2 = pt(a2, rr);
      var large = Math.abs(a2 - a1) > 180 ? 1 : 0;
      var sweep = a2 > a1 ? 1 : 0;
      return 'M' + p1[0].toFixed(2) + ' ' + p1[1].toFixed(2) +
        ' A' + rr + ' ' + rr + ' 0 ' + large + ' ' + sweep + ' ' + p2[0].toFixed(2) + ' ' + p2[1].toFixed(2);
    }
    function penaltyFor(n) {
      if (n < 1) return 0;
      return Math.min(PEN.initial + PEN.daily * (n - 1), PEN.max);
    }

    function init(el) {
      var ard = $('#f-ard', el), fye = $('#f-fye', el);
      var out = {
        num: $('[data-out="num"]', el), unit: $('[data-out="unit"]', el), date: $('[data-out="date"]', el),
        rule: $('[data-out="rule"]', el), cost: $('[data-out="cost"]', el), live: $('[data-out="live"]', el)
      };
      var svg = $('svg', el);
      var gRemain = $('[data-arc="remain"]', svg), gLate = $('[data-arc="late"]', svg);
      var beam = $('[data-beam]', svg);
      var mkDead = $('[data-mk="deadline"]', svg), mkAlt = $('[data-mk="alt"]', svg), mkToday = $('[data-mk="today"]', svg);
      var errA = $('[data-err="ard"]', el), errF = $('[data-err="fye"]', el);
      if (!ard || !fye || !svg) return;

      var state = { angle: 0, remain: 0 };

      function place(g, deg, label, sub) {
        if (!g) return;
        var rad = deg * Math.PI / 180;
        var cos = Math.cos(rad), sin = Math.sin(rad);
        var p = pt(deg, R);
        g.setAttribute('transform', 'translate(' + p[0].toFixed(2) + ',' + p[1].toFixed(2) + ')');
        var t = $('text', g);
        if (!t) return;
        /* Labels sit outside the ring, offset along the radius so they never run
           back across it, and flip side at the vertical so they stay readable. */
        var flip = cos < 0;
        var x = +(cos * 11 + (flip ? -11 : 11)).toFixed(1);
        var y = +(sin * 17 + 3.5).toFixed(1);
        t.setAttribute('x', x);
        t.setAttribute('y', y);
        t.setAttribute('text-anchor', flip ? 'end' : 'start');
        var tspans = t.querySelectorAll('tspan');
        if (tspans[0]) { tspans[0].textContent = label; tspans[0].setAttribute('x', x); }
        if (tspans[1]) { tspans[1].textContent = sub || ''; tspans[1].setAttribute('x', x); }
      }

      function render(animate) {
        var today = startOfDay(new Date());
        var dA = parseISO(ard.value), dF = parseISO(fye.value);
        errA.textContent = ard.value && !dA ? 'Enter a valid date.' : '';
        errF.textContent = fye.value && !dF ? 'Enter a valid date.' : '';
        if (!dA && !dF) return;

        var candidates = [];
        if (dA) candidates.push({ id: 'ard', date: addDays(dA, 56), label: 'ARD + 56 days', mid: 'the ARD + 56 day rule', plain: 'ARD + 56 days' });
        if (dF) candidates.push({ id: 'fye', date: addDays(addMonths(dF, 9), 56), label: 'Year end + 9 months + 56 days', mid: 'the year end + 9 months + 56 day rule', plain: 'year end + 9 months + 56 days' });
        candidates.sort(function (a, b) { return a.date - b.date; });

        var bind = candidates[0];
        var alt = candidates[1] || null;
        var remain = daysBetween(today, bind.date);
        var late = remain < 0 ? Math.abs(remain) : 0;
        var angle = late ? angleAfter(late) : angleBefore(remain);

        /* Readout */
        var n = late ? late : remain;
        out.num.textContent = String(n);
        out.num.classList.toggle('is-late', !!late);
        out.unit.textContent = late
          ? (late === 1 ? 'day overdue' : 'days overdue')
          : (remain === 0 ? 'due today' : (remain === 1 ? 'day remaining' : 'days remaining'));
        out.date.textContent = FMT.format(bind.date);

        /* Verdict */
        var sameDay = alt && daysBetween(bind.date, alt.date) === 0;
        var ruleHtml = '';
        if (!alt) {
          ruleHtml = 'Only one rule can be applied from the dates given: <b>' + bind.label + '</b>. ' +
            'Add the other date to see which of the two binds.';
        } else if (sameDay) {
          ruleHtml = 'Both rules give the same date. <b>' + bind.label + '</b> and ' +
            alt.plain + ' both land on ' + FMT_S.format(bind.date) + '.';
        } else {
          var gap = daysBetween(bind.date, alt.date);
          ruleHtml = 'The binding rule is <b>' + bind.label + '</b>.' +
            '<span class="alt">The other rule \u2014 ' + alt.mid + ' \u2014 gives ' +
            FMT_S.format(alt.date) + ' — ' + gap + ' day' + (gap === 1 ? '' : 's') +
            ' later. Working to that date would already put you ' + gap + ' day' + (gap === 1 ? '' : 's') +
            ' into the penalty.</span>';
        }
        out.rule.innerHTML = ruleHtml;
        out.cost.textContent = late
          ? 'Penalty accrued: ' + euro(penaltyFor(late)) + (penaltyFor(late) >= PEN.max ? ' (capped)' : '')
          : '';
        out.cost.hidden = !late;

        if (out.live) {
          out.live.textContent = (late
            ? n + ' days overdue. '
            : n + ' days remaining. ') + 'Deadline ' + FMT.format(bind.date) + '. ' +
            (alt && !sameDay ? 'Binding rule: ' + bind.label + '.' : '');
        }

        /* Geometry */
        var remainPath = late ? '' : arcPath(angle, 0);
        var latePath = late ? arcPath(0, angle) : '';
        gRemain.setAttribute('d', remainPath || 'M0 0');
        gLate.setAttribute('d', latePath || 'M0 0');
        gRemain.style.display = late ? 'none' : '';
        gLate.style.display = late ? '' : 'none';

        place(mkDead, 0, 'Deadline', FMT_M.format(bind.date));
        if (alt && !sameDay) {
          var altAngle = angleAfter(daysBetween(bind.date, alt.date));
          place(mkAlt, altAngle, 'Alt. rule', FMT_M.format(alt.date));
          mkAlt.style.display = '';
        } else { mkAlt.style.display = 'none'; }
        if (mkAlt.style.display !== 'none' && hasGSAP) gsap.set(mkAlt, { opacity: .8 });
        place(mkToday, angle, 'Today', FMT_M.format(today));

        /* The sweep */
        var target = angle;
        if (animate && hasGSAP && !reduced) {
          gsap.to(state, {
            angle: target, duration: 1.15, ease: SWEEP, overwrite: true,
            onUpdate: function () { beam.setAttribute('transform', 'rotate(' + state.angle.toFixed(2) + ')'); }
          });
          gsap.fromTo([gRemain, gLate], { drawSVG: '0% 0%' }, { drawSVG: '0% 100%', duration: 1.15, ease: SWEEP, overwrite: true });
        } else {
          state.angle = target;
          beam.setAttribute('transform', 'rotate(' + target.toFixed(2) + ')');
          gsap && gsap.set && gsap.set([gRemain, gLate], { clearProps: 'strokeDasharray,strokeDashoffset' });
        }
      }

      ard.addEventListener('change', function () { render(true); });
      fye.addEventListener('change', function () { render(true); });
      ard.addEventListener('input', function () { render(false); });
      fye.addEventListener('input', function () { render(false); });

      $$('[data-example]', el).forEach(function (b) {
        b.addEventListener('click', function () {
          var v = b.getAttribute('data-example').split('|');
          ard.value = v[0]; fye.value = v[1];
          render(true);
        });
      });

      /* Seed with the common Irish case: 31 December year end, 30 September ARD. */
      (function seed() {
        var today = startOfDay(new Date());
        var y = today.getFullYear();
        var a = new Date(y, 8, 30);                       // 30 September
        if (daysBetween(today, addDays(a, 56)) < 0) a = new Date(y + 1, 8, 30);
        var f = new Date(a.getFullYear() - 1, 11, 31);    // preceding 31 December
        ard.value = toISO(a); fye.value = toISO(f);
        render(false);
      })();

      return { render: render, state: state, angleBefore: angleBefore };
    }
    return { init: init, penaltyFor: penaltyFor, PEN: PEN };
  })();

  var instEl = $('[data-instrument]');
  var inst = instEl ? Instrument.init(instEl) : null;

  /* =============================================================================
     3. SCROLL SCENES — built inside matchMedia so they revert on resize
     ============================================================================= */
  if (hasGSAP && window.ScrollTrigger) {
    var mm = gsap.matchMedia();

    /* ---- Reduced motion: no scenes, just the end state. ---- */
    mm.add('(prefers-reduced-motion: reduce)', function () {
      gsap.set('[data-anim]', { clearProps: 'opacity,transform' });
      gsap.set('.reg__rule', { scaleX: 1 });
      $$('[data-curve]').forEach(function (c) {
        var p = $('.cv-line', c); if (p) gsap.set(p, { drawSVG: '0% 100%' });
        var f = $('[data-curve-fig]', c); if (f) f.textContent = euro(1200);
      });
    });

    mm.add('(prefers-reduced-motion: no-preference)', function () {

      /* ---- Opening: the light comes up. ---- */
      var heroSvg = $('.hero [data-instrument] svg');
      if (heroSvg) {
        /* fromTo throughout: the end state is stated explicitly, so a context
           revert or a late ScrollTrigger refresh cannot strand an element at
           its start value. */
        var q = function (sel) { return heroSvg.querySelectorAll(sel); };
        var tl = gsap.timeline({ defaults: { ease: SWEEP } });
        tl.fromTo(q('.ring'), { drawSVG: '50% 50%' }, { drawSVG: '0% 100%', duration: 1.5, stagger: .12 }, 0)
          .fromTo(q('.horizon-l'), { drawSVG: '0% 0%' }, { drawSVG: '0% 100%', duration: 1.1 }, .25)
          .fromTo('.hero__horizon', { scaleX: 0 }, { scaleX: 1, transformOrigin: 'center', duration: 1.4 }, .1)
          .fromTo(q('.tick'), { opacity: 0 }, { opacity: 1, duration: .5, stagger: { each: .008, from: 'start' } }, .45)
          .fromTo(q('.arc-pen'), { opacity: 0 }, { opacity: 1, duration: .9 }, .8)
          .fromTo(q('.beam'), { opacity: 0 }, { opacity: 1, duration: .8 }, .65)
          .fromTo(q('.hub__core'), { opacity: 0 }, { opacity: 1, duration: .5 }, .6)
          .fromTo(q('.mk'), { opacity: 0 }, { opacity: 1, duration: .6, stagger: .09 }, 1.05)
          .fromTo('.inst__read > *', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: .7, stagger: .07 }, .9)
          .fromTo('.inst__ctl', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: .8 }, 1.15);
      }

      /* ---- Headline: lines rise from behind a mask. One reveal, not a stagger-fade. ---- */
      var splits = [];
      $$('[data-split]').forEach(function (el) {
        if (window.SplitText) {
          var s = SplitText.create(el, {
            type: 'lines', mask: 'lines', autoSplit: true, aria: 'auto',
            onSplit: function (self) {
              return gsap.from(self.lines, {
                yPercent: 110, duration: 1.05, ease: SWEEP, stagger: .085,
                scrollTrigger: el.closest('.hero') ? null : { trigger: el, start: 'top 85%' },
                delay: el.closest('.hero') ? .35 : 0
              });
            }
          });
          splits.push(s);
        } else {
          gsap.from(el, { opacity: 0, y: 16, duration: .9, scrollTrigger: { trigger: el, start: 'top 85%' } });
        }
      });

      /* ---- Generic entrances. Deliberately plain: the character is in the
         scenes below. The start state is set here, not in CSS, so content is
         never hidden by a stylesheet that outlives its script. ScrollTrigger.batch
         fires immediately for anything already in view. ---- */
      var anim = $$('[data-anim]');
      if (anim.length) {
        gsap.set(anim, { opacity: 0, y: 18 });
        ScrollTrigger.batch(anim, {
          start: 'top 92%', once: true,
          onEnter: function (batch) {
            gsap.to(batch, { opacity: 1, y: 0, duration: .85, stagger: .06, overwrite: true });
          }
        });
        /* Failsafe: after layout settles, anything the batch has not reached but
           that is already scrolled past is shown outright. */
        var settle = function () {
          anim.forEach(function (el) {
            var r = el.getBoundingClientRect();
            if (r.top < window.innerHeight * 0.92 && gsap.getProperty(el, 'opacity') === 0) {
              gsap.to(el, { opacity: 1, y: 0, duration: .5, overwrite: true });
            }
          });
        };
        window.addEventListener('load', function () { setTimeout(settle, 220); });
        setTimeout(settle, 1800);
      }

      /* ---- The register: each entry's rule is ruled in, left to right. ---- */
      var rules = $$('.reg__rule');
      if (rules.length) {
        gsap.set(rules, { scaleX: 0 });
        ScrollTrigger.batch(rules, {
          start: 'top 94%', once: true,
          onEnter: function (batch) {
            /* Ruled in gold, then settled back to a hairline: the gesture reads,
               the page does not end up striped with gold. */
            gsap.timeline()
              .to(batch, { scaleX: 1, duration: .85, ease: SWEEP, stagger: .055, overwrite: true })
              .to(batch, { opacity: .18, duration: .7, ease: 'power1.out', stagger: .055 }, '>-.45');
          }
        });
      }

      /* ---- The penalty curve: scrubbed, because the shape IS the argument. ---- */
      $$('[data-curve]').forEach(function (wrap) {
        var path = $('.cv-line', wrap);
        var fig = $('[data-curve-fig]', wrap);
        var day = $('[data-curve-day]', wrap);
        if (!path) return;
        var o = { p: 0 };
        gsap.set(path, { drawSVG: '0% 0%' });
        gsap.to(o, {
          p: 1, ease: 'none',
          scrollTrigger: { trigger: wrap, start: 'top 72%', end: 'bottom 72%', scrub: .6 },
          onUpdate: function () {
            path.style.strokeDasharray = '';
            gsap.set(path, { drawSVG: '0% ' + (o.p * 100).toFixed(2) + '%' });
            var n = Math.round(o.p * 368);
            if (fig) fig.textContent = euro(Instrument.penaltyFor(Math.max(n, 1)));
            if (day) day.textContent = n <= 1 ? 'day 1' : 'day ' + n;
          }
        });
      });

      /* ---- Section markers flash once as the section arrives. The firm's character. ---- */
      $$('.char').forEach(function (c) {
        var dots = c.querySelectorAll('i');
        gsap.timeline({ scrollTrigger: { trigger: c, start: 'top 90%', once: true } })
          .to(dots, { opacity: 1, duration: .18, stagger: .13 })
          .to(dots, { opacity: .5, duration: .5, stagger: .13 }, '>-.25');
      });

      return function cleanup() {
        splits.forEach(function (s) { try { s.revert(); } catch (e) {} });
      };
    });

    /* Desktop only: the folio column holds while its group passes, like a straight-edge. */
    mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', function () {
      $$('[data-pin]').forEach(function (el) {
        ScrollTrigger.create({
          trigger: el.closest('[data-pin-scope]') || el.parentElement,
          start: 'top 18%', end: 'bottom 60%', pin: el, pinSpacing: false, invalidateOnRefresh: true
        });
      });
    });

    /* Fonts change line wrapping, which changes every trigger position. */
    if (doc.fonts && doc.fonts.ready) {
      doc.fonts.ready.then(function () { ScrollTrigger.refresh(); });
    }
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }

  /* =============================================================================
     4. THE REGISTER FILTER — Flip, because it is the same 16 entries re-ordered
     ============================================================================= */
  (function registerFilter() {
    var bar = $('[data-regbar]');
    var scope = $('[data-reg]');
    if (!bar || !scope) return;
    var btns = $$('.regbar__b', bar);
    var groups = $$('[data-group]', scope);

    function apply(mode) {
      var items = $$('.reg__e', scope);
      var state = (window.Flip && hasGSAP && !reduced) ? Flip.getState(items.concat(groups)) : null;

      groups.forEach(function (g) {
        var show = mode === 'all' || g.getAttribute('data-group') === mode;
        g.hidden = !show;
      });

      btns.forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-filter') === mode)); });
      var count = $('[data-regcount]');
      if (count) {
        var vis = items.filter(function (i) { return !i.closest('[data-group]').hidden; }).length;
        count.textContent = vis + ' of ' + items.length + ' entries';
      }
      if (state) {
        Flip.from(state, {
          duration: .7, ease: SWEEP, absolute: false, nested: true,
          onEnter: function (els) { return gsap.fromTo(els, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: .55 }); },
          onLeave: function (els) { return gsap.to(els, { opacity: 0, duration: .25 }); }
        });
      }
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    }

    btns.forEach(function (b) {
      b.addEventListener('click', function () { apply(b.getAttribute('data-filter')); });
    });
    apply('all');
  })();

  /* =============================================================================
     5. FORMS — real validation, and no false success. Nothing is sent.
     ============================================================================= */
  (function forms() {
    $$('form[data-demo-form]').forEach(function (form) {
      var out = $('[data-form-out]', form);
      form.setAttribute('novalidate', '');

      function fieldOf(input) { return input.closest('.f'); }
      function errOf(input) { var f = fieldOf(input); return f ? $('.f__err', f) : null; }

      function validate(input) {
        var err = errOf(input), f = fieldOf(input);
        if (!err || !f) return true;
        var v = (input.value || '').trim();
        var msg = '';
        if (input.required && !v) msg = 'Required.';
        else if (input.type === 'email' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) msg = 'Enter a valid email address.';
        else if (input.name === 'phone' && v && !/^[+0-9 ()\-]{7,}$/.test(v)) msg = 'Enter a valid phone number.';
        err.textContent = msg;
        if (msg) { f.setAttribute('data-invalid', ''); input.setAttribute('aria-invalid', 'true'); }
        else { f.removeAttribute('data-invalid'); input.removeAttribute('aria-invalid'); }
        return !msg;
      }

      $$('input,textarea,select', form).forEach(function (i) {
        i.addEventListener('blur', function () { validate(i); });
        i.addEventListener('input', function () { if (fieldOf(i) && fieldOf(i).hasAttribute('data-invalid')) validate(i); });
      });

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var fields = $$('input,textarea,select', form);
        var ok = true, firstBad = null;
        fields.forEach(function (i) { var v = validate(i); if (!v && !firstBad) firstBad = i; ok = ok && v; });
        if (!ok) {
          out.hidden = true;
          if (firstBad) firstBad.focus();
          return;
        }
        /* Deliberately honest: this preview has no authorised submission endpoint. */
        var name = (form.querySelector('[name=name]') || {}).value || '';
        var subject = encodeURIComponent('Website enquiry' + (name ? ' from ' + name : ''));
        var body = encodeURIComponent(fields
          .filter(function (i) { return i.type !== 'submit' && (i.value || '').trim(); })
          .map(function (i) { return (i.getAttribute('data-label') || i.name) + ': ' + i.value; })
          .join('\n'));
        out.hidden = false;
        out.innerHTML =
          '<p><b>Nothing has been sent.</b> This is a concept preview, so the form has no mailbox behind it — ' +
          'it validates, but it deliberately does not pretend to deliver.</p>' +
          '<p style="margin-top:.8em">Your message is ready to send from your own email client, ' +
          'or contact the firm directly:</p>' +
          '<p style="margin-top:.8em"><a class="lnk" href="mailto:info@bcos.ie?subject=' + subject + '&body=' + body +
          '"><span>Open this in your email app</span></a></p>' +
          '<p style="margin-top:.6em"><a class="lnk" href="mailto:info@bcos.ie"><span>info@bcos.ie</span></a> &nbsp; ' +
          '<a class="lnk" href="tel:+35316276627"><span>+353 1 627 6627</span></a></p>';
        out.setAttribute('tabindex', '-1');
        out.focus();
      });
    });
  })();

  /* Expose a tiny surface for verification scripts. */
  window.__beacon = { instrument: inst, Instrument: Instrument, reduced: reduced };
})();
