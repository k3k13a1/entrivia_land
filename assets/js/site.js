/* ENTRIVIA — логика сайта: жидкое стекло и уведомление о cookie.
   Без сторонних библиотек и счётчиков. */
(function () {
  'use strict';

  var DOC_VERSION = '2026-10-09';

  var root = document.querySelector('[data-lg-root]');
  var $ = function (sel, el) { return (el || document).querySelector(sel); };
  var show = function (name, on) { var el = $('[data-if="' + name + '"]'); if (el) el.hidden = !on; };
  var store = {
    get: function (k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { window.localStorage.setItem(k, v); } catch (e) { /* приватный режим */ } }
  };

  // ---------- Жидкое стекло ----------
  // Преломление SVG-фильтром в backdrop-filter поддерживает только Chromium; остальные браузеры получают матовое стекло.
  var brands = navigator.userAgentData && navigator.userAgentData.brands;
  if (root && brands && brands.some(function (b) { return /Chromium/.test(b.brand); })) root.classList.add('lg-refract');

  // Блик следует за указателем
  document.addEventListener('pointermove', function (e) {
    var el = e.target && e.target.closest ? e.target.closest('.lg') : null;
    if (!el) return;
    var r = el.getBoundingClientRect();
    el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    el.style.setProperty('--my', (e.clientY - r.top) + 'px');
    el.style.setProperty('--la', (90 + (e.clientX - r.left) / Math.max(1, r.width) * 90) + 'deg');
  }, { passive: true });

  // Шапка-капсула сжимается при прокрутке
  var header = $('.lg-header');
  var onScroll = function () { if (header) header.classList.toggle('scrolled', (window.scrollY || 0) > 40); };
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // Жидкая линза под пунктами меню
  var nav = $('[data-lg-nav]'), ind = $('[data-lg-ind]'), sq;
  if (nav && ind) {
    nav.addEventListener('pointerover', function (e) {
      var a = e.target.closest('a'); if (!a || !nav.contains(a)) return;
      var nr = nav.getBoundingClientRect(), ar = a.getBoundingClientRect();
      ind.style.left = (ar.left - nr.left) + 'px'; ind.style.width = ar.width + 'px';
      ind.classList.add('on', 'squish'); clearTimeout(sq); sq = setTimeout(function () { ind.classList.remove('squish'); }, 260);
    });
    nav.addEventListener('pointerleave', function () { ind.classList.remove('on'); });
  }

  // ---------- Уведомление о cookie ----------
  if (!store.get('entrivia-cookie-notice')) show('cookies', true);
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-act]'); if (!b) return;
    var act = b.getAttribute('data-act');
    if (act === 'close-cookies') { show('cookies', false); store.set('entrivia-cookie-notice', DOC_VERSION); }
    if (act === 'open-cookies') show('cookies', true);
  });

})();
