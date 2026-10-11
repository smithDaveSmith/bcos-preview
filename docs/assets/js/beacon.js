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
      /* One easing for everything that moves. Decisive, settles without bounce. */
      CustomEase.create('sweep', '0.22,0.00,0.12,1.00');
      SWEEP = 'sweep';
    }
    gsap.defaults({ ease: SWEEP, duration: 0.55 });
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
            { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: .32, stagger: .035, ease: 'power2.out' });
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
    var PAD_L = 10, PAD_R = 10, TRACK_Y = 48, TRACK_H = 10;
    var H_FULL = 112, H_SHORT = 72;
    var PEN = { initial: 100, daily: 3, max: 1200 };

    function penaltyFor(n) {
      if (n < 1) return 0;
      return Math.min(PEN.initial + PEN.daily * (n - 1), PEN.max);
    }

    function init(el) {
      var ard = $('#f-ard', el), fye = $('#f-fye', el);
      /* Scoped: the panel header also contains an icon <svg>. */
      var svg = $('[data-timeline]', el);
      if (!ard || !fye || !svg) return;

      var out = {
        num: $('[data-out="num"]', el), unit: $('[data-out="unit"]', el), date: $('[data-out="date"]', el),
        rule: $('[data-out="rule"]', el), cost: $('[data-out="cost"]', el),
        live: $('[data-out="live"]', el), status: $('[data-out="status"]', el),
        verdict: $('[data-verdict]', el)
      };
      var elBase = $('[data-el="base"]', svg), elRemain = $('[data-el="remain"]', svg),
          elLate = $('[data-el="late"]', svg), elPen = $('[data-el="pen"]', svg);
      var mkToday = $('[data-mk="today"]', svg), mkDead = $('[data-mk="deadline"]', svg),
          mkAlt = $('[data-mk="alt"]', svg);
      var errA = $('[data-err="ard"]', el), errF = $('[data-err="fye"]', el);

      /* The viewBox width tracks the rendered width, so one SVG unit is one CSS
         pixel and the labels stay legible at every size instead of scaling down. */
      var W = 640, X0 = PAD_L, X1 = W - PAD_R;
      function measure() {
        var host = el.querySelector('.inst__track') || svg.parentNode;
        var w = Math.round((host && host.getBoundingClientRect().width) || 0);
        W = Math.max(w || 640, 260);
        X0 = PAD_L; X1 = W - PAD_R;
        var base = $('[data-el="base"]', svg);
        if (base) { base.setAttribute('x', X0); base.setAttribute('width', Math.max(0, X1 - X0)); }
      }

      /* Animated state, so the bars and markers can be tweened as one. */
      var st = { todayX: X0, deadX: X1, altX: X1, remainW: 0, lateW: 0 };

      function setRect(node, x, w) {
        if (!node) return;
        node.setAttribute('x', Math.min(x, x + w).toFixed(1));
        node.setAttribute('width', Math.max(0, Math.abs(w)).toFixed(1));
      }
      function moveMark(g, x, label, sub, align) {
        if (!g) return;
        g.setAttribute('transform', 'translate(' + x.toFixed(1) + ',0)');
        var line = $('line', g), dot = $('circle', g), ts = g.querySelectorAll('text');
        if (line) { line.setAttribute('x1', 0); line.setAttribute('x2', 0); }
        if (dot) dot.setAttribute('cx', 0);
        /* Labels flip to the inside near either edge so they never clip. */
        var anchor = align === 'end' ? 'end' : (align === 'start' ? 'start' : 'middle');
        var dx = align === 'end' ? -8 : (align === 'start' ? 8 : 0);
        for (var i = 0; i < ts.length; i++) {
          ts[i].setAttribute('x', dx);
          ts[i].setAttribute('text-anchor', anchor);
        }
        if (ts[0] && label != null) ts[0].textContent = label;
        if (ts[1] && sub != null) ts[1].textContent = sub;
      }
      function edgeAlign(x) {
        if (x < X0 + 54) return 'start';
        if (x > X1 - 54) return 'end';
        return 'mid';
      }

      function render(animate) {
        measure();
        var today = startOfDay(new Date());
        var dA = parseISO(ard.value), dF = parseISO(fye.value);
        errA.textContent = ard.value && !dA ? 'Enter a valid date.' : '';
        errF.textContent = fye.value && !dF ? 'Enter a valid date.' : '';
        if (!dA && !dF) return;

        var cands = [];
        if (dA) cands.push({ date: addDays(dA, 56), label: 'ARD + 56 days',
                             plain: 'ARD + 56 days', mid: 'the ARD + 56 day rule' });
        if (dF) cands.push({ date: addDays(addMonths(dF, 9), 56), label: 'Year end + 9 months + 56 days',
                             plain: 'year end + 9 months + 56 days', mid: 'the year end + 9 months + 56 day rule' });
        cands.sort(function (a, b) { return a.date - b.date; });
        var bind = cands[0], alt = cands[1] || null;
        var sameDay = alt && daysBetween(bind.date, alt.date) === 0;

        var remain = daysBetween(today, bind.date);
        var late = remain < 0 ? Math.abs(remain) : 0;

        /* Axis window: always contains today, the deadline, the other rule and
           a slice of the penalty period, with padding so nothing sits on an edge. */
        var marks = [today, bind.date];
        if (alt) marks.push(alt.date);
        var lo = new Date(Math.min.apply(null, marks));
        var hi = new Date(Math.max.apply(null, marks));
        var span = Math.max(daysBetween(lo, hi), 1);
        var pad = Math.max(Math.round(span * 0.18), 10);
        var axisFrom = addDays(lo, -pad), axisTo = addDays(hi, pad);
        var axisDays = Math.max(daysBetween(axisFrom, axisTo), 1);
        var xOf = function (d) { return X0 + (X1 - X0) * (daysBetween(axisFrom, d) / axisDays); };

        var todayX = xOf(today), deadX = xOf(bind.date), altX = alt ? xOf(alt.date) : deadX;

        /* Readout */
        var n = late ? late : remain;
        out.num.textContent = String(n);
        out.num.classList.toggle('is-late', !!late);
        out.unit.textContent = late ? (late === 1 ? 'day overdue' : 'days overdue')
          : (remain === 0 ? 'due today' : (remain === 1 ? 'day remaining' : 'days remaining'));
        out.date.innerHTML = 'Filing deadline <b>' + FMT.format(bind.date) + '</b>';

        /* Status pill */
        if (out.status) {
          var cls = 'pill ', txt = '';
          if (late) { cls += 'pill--bad'; txt = 'Overdue'; }
          else if (remain <= 14) { cls += 'pill--warn'; txt = 'Due soon'; }
          else { cls += 'pill--ok'; txt = 'On time'; }
          out.status.className = cls;
          out.status.textContent = txt;
        }

        /* Verdict */
        var html;
        if (!alt) {
          html = 'Only one rule can be applied from the dates given: <b>' + bind.label +
            '</b>. Add the other date to see which of the two binds.';
        } else if (sameDay) {
          html = 'Both rules give the same date. <b>' + bind.label + '</b> and ' + alt.plain +
            ' both land on ' + FMT_S.format(bind.date) + '.';
        } else {
          var gap = daysBetween(bind.date, alt.date);
          html = 'The binding rule is <b>' + bind.label + '</b>.' +
            '<span class="alt">' + alt.mid.charAt(0).toUpperCase() + alt.mid.slice(1) +
            ' gives ' + FMT_S.format(alt.date) + ', ' + gap + ' day' + (gap === 1 ? '' : 's') +
            ' later. Working to that date would put you ' + gap + ' day' + (gap === 1 ? '' : 's') +
            ' into the penalty.</span>';
        }
        out.rule.innerHTML = html;
        if (out.verdict) out.verdict.classList.toggle('is-late', !!late);
        out.cost.textContent = late
          ? 'Penalty accrued to date: ' + euro(penaltyFor(late)) + (penaltyFor(late) >= PEN.max ? ' (at the maximum)' : '')
          : '';
        out.cost.hidden = !late;

        if (out.live) {
          out.live.textContent = (late ? n + ' days overdue. ' : n + ' days remaining. ') +
            'Filing deadline ' + FMT.format(bind.date) + '. ' +
            (alt && !sameDay ? 'The binding rule is ' + bind.label + '. ' : '') +
            (late ? 'Penalty accrued ' + euro(penaltyFor(late)) + '.' : '');
        }

        /* Labels and zones */
        moveMark(mkDead, deadX, 'Deadline', FMT_S.format(bind.date), edgeAlign(deadX));
        moveMark(mkToday, todayX, 'Today', FMT_S.format(today), edgeAlign(todayX));
        if (alt && !sameDay) {
          moveMark(mkAlt, altX, 'Other rule', FMT_S.format(alt.date), edgeAlign(altX));
          mkAlt.style.display = '';
        } else if (mkAlt) { mkAlt.style.display = 'none'; }
        svg.setAttribute('viewBox', '0 0 ' + W + ' ' + ((alt && !sameDay) ? H_FULL : H_SHORT));
        svg.style.height = ((alt && !sameDay) ? H_FULL : H_SHORT) + 'px';

        /* The penalty band always runs from the deadline to the end of the axis. */
        setRect(elPen, deadX, X1 - deadX);

        var target = { remainW: late ? 0 : deadX - todayX, lateW: late ? todayX - deadX : 0,
                       todayX: todayX, deadX: deadX };
        function paint() {
          setRect(elRemain, Math.min(st.todayX, st.deadX), st.remainW);
          setRect(elLate, st.deadX, st.lateW);
        }
        if (animate && hasGSAP && !reduced) {
          gsap.to(st, {
            remainW: target.remainW, lateW: target.lateW, todayX: todayX, deadX: deadX,
            duration: .7, ease: SWEEP, overwrite: true, onUpdate: paint
          });
          gsap.fromTo([mkToday, mkDead, mkAlt].filter(Boolean),
            { opacity: .35 }, { opacity: 1, duration: .5, ease: 'power2.out', overwrite: true });
        } else {
          st.remainW = target.remainW; st.lateW = target.lateW;
          st.todayX = todayX; st.deadX = deadX;
          paint();
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

      var rt;
      window.addEventListener('resize', function () {
        clearTimeout(rt);
        rt = setTimeout(function () { render(false); }, 120);
      });
      if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(function () { render(false); });

      /* Seed with the most common Irish case: 31 December year end, 30 September ARD. */
      (function seed() {
        var today = startOfDay(new Date());
        var y = today.getFullYear();
        var a = new Date(y, 8, 30);
        if (daysBetween(today, addDays(a, 56)) < 0) a = new Date(y + 1, 8, 30);
        var f = new Date(a.getFullYear() - 1, 11, 31);
        ard.value = toISO(a); fye.value = toISO(f);
        render(false);
      })();

      return { render: render };
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
      $$('[data-curve]').forEach(function (c) {
        var p = $('.cv-line', c); if (p) gsap.set(p, { drawSVG: '0% 100%' });
        var f = $('[data-curve-fig]', c); if (f) f.textContent = euro(1200);
      });
    });

    mm.add('(prefers-reduced-motion: no-preference)', function () {

      /* ---- Opening: the panel assembles. Short, functional, done in under a
         second — this is a professional tool, not a title sequence. ---- */
      var panel = $('.hero [data-instrument]');
      if (panel) {
        var svg = $('[data-timeline]', panel);
        var tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
        tl.fromTo(panel, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: .5 }, 0)
          .fromTo(svg.querySelector('[data-el="base"]'), { scaleX: 0, transformOrigin: 'left center' },
                  { scaleX: 1, duration: .55 }, .15)
          .fromTo(svg.querySelectorAll('[data-mk]'), { opacity: 0 }, { opacity: 1, duration: .35, stagger: .06 }, .45)
          .fromTo('.inst__read', { opacity: 0 }, { opacity: 1, duration: .4 }, .3)
          .fromTo('.hero__acts .btn', { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: .4, stagger: .06 }, .3)
          .fromTo('.trust__i', { opacity: 0 }, { opacity: 1, duration: .4, stagger: .05 }, .5);
      }

      /* ---- Headline: lines rise from behind a mask. One reveal, not a stagger-fade. ---- */
      var splits = [];
      $$('[data-split]').forEach(function (el) {
        if (window.SplitText) {
          var s = SplitText.create(el, {
            type: 'lines', mask: 'lines', autoSplit: true, aria: 'auto',
            onSplit: function (self) {
              return gsap.from(self.lines, {
                yPercent: 104, duration: .62, ease: 'power3.out', stagger: .055,
                scrollTrigger: el.closest('.hero') ? null : { trigger: el, start: 'top 86%' },
                delay: el.closest('.hero') ? .06 : 0
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
        gsap.set(anim, { opacity: 0, y: 10 });
        ScrollTrigger.batch(anim, {
          start: 'top 94%', once: true,
          onEnter: function (batch) {
            gsap.to(batch, { opacity: 1, y: 0, duration: .5, ease: 'power2.out', stagger: .045, overwrite: true });
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
          scrollTrigger: { trigger: wrap, start: 'top 78%', end: 'bottom 78%', scrub: .5 },
          onUpdate: function () {
            path.style.strokeDasharray = '';
            gsap.set(path, { drawSVG: '0% ' + (o.p * 100).toFixed(2) + '%' });
            var n = Math.round(o.p * 368);
            if (fig) fig.textContent = euro(Instrument.penaltyFor(Math.max(n, 1)));
            if (day) day.textContent = n <= 1 ? 'day 1' : 'day ' + n;
          }
        });
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
          duration: .45, ease: 'power2.out', absolute: false, nested: true,
          onEnter: function (els) { return gsap.fromTo(els, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: .35 }); },
          onLeave: function (els) { return gsap.to(els, { opacity: 0, duration: .18 }); }
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
