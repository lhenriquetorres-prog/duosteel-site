/* Duosteel — menu, filtro de obras, galeria ampliada e formulário via WhatsApp. Sem dependências. */
(function () {
  'use strict';
  var ui = {};
  try { ui = JSON.parse(document.body.getAttribute('data-ui') || '{}'); } catch (e) {}

  /* menu mobile */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  /* filtro de obras */
  var filters = document.querySelectorAll('button[data-filter]');
  var cards = document.querySelectorAll('[data-pais]');
  Array.prototype.forEach.call(filters, function (btn) {
    btn.addEventListener('click', function () {
      var f = btn.getAttribute('data-filter');
      Array.prototype.forEach.call(filters, function (b) {
        var on = b === btn;
        b.classList.toggle('tag-accent', on);
        b.classList.toggle('tag-outline', !on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      Array.prototype.forEach.call(cards, function (c) {
        var tags = (c.getAttribute('data-tags') || '').split('|');
        c.hidden = !(f === 'Todos' || c.getAttribute('data-pais') === f || tags.indexOf(f) > -1);
      });
    });
  });

  /* galeria ampliada */
  var imgs = Array.prototype.slice.call(document.querySelectorAll('img[data-full]'));
  if (imgs.length && window.HTMLDialogElement) {
    var dlg = document.createElement('dialog');
    dlg.className = 'lb';
    dlg.innerHTML = '<span class="lb-count" aria-live="polite"></span><figure><img alt=""><figcaption></figcaption></figure>' +
      '<button type="button" class="lb-prev" aria-label="' + (ui.prev || 'Anterior') + '">‹</button>' +
      '<button type="button" class="lb-next" aria-label="' + (ui.next || 'Próxima') + '">›</button>' +
      '<button type="button" class="lb-close" aria-label="' + (ui.close || 'Fechar') + '">×</button>';
    document.body.appendChild(dlg);
    var big = dlg.querySelector('img'), cap = dlg.querySelector('figcaption'), cnt = dlg.querySelector('.lb-count');
    var idx = 0, opener = null;
    var show = function (i) {
      idx = (i + imgs.length) % imgs.length;
      var src = imgs[idx];
      big.src = src.getAttribute('data-full');
      big.alt = src.alt;
      cap.textContent = src.alt;
      cnt.textContent = (idx + 1) + ' / ' + imgs.length;
    };
    var open = function (i) { opener = imgs[i]; show(i); dlg.showModal(); };
    imgs.forEach(function (im, i) {
      im.setAttribute('role', 'button');
      im.setAttribute('aria-label', (ui.zoom || 'Ampliar foto') + ': ' + im.alt);
      im.addEventListener('click', function () { open(i); });
      im.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(i); }
      });
    });
    dlg.querySelector('.lb-prev').addEventListener('click', function () { show(idx - 1); });
    dlg.querySelector('.lb-next').addEventListener('click', function () { show(idx + 1); });
    dlg.querySelector('.lb-close').addEventListener('click', function () { dlg.close(); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg || e.target.tagName === 'FIGURE') dlg.close(); });
    dlg.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') show(idx - 1);
      if (e.key === 'ArrowRight') show(idx + 1);
    });
    dlg.addEventListener('close', function () { big.removeAttribute('src'); if (opener) opener.focus(); });
    var x0 = null;
    dlg.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    dlg.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
      x0 = null;
    });
  }

  /* formulário de orçamento → WhatsApp */
  var form = document.getElementById('orcamento');
  if (form) {
    var sent = document.querySelector('[data-sent]');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var lines = [form.getAttribute('data-greet'), ''];
      Array.prototype.forEach.call(form.querySelectorAll('.field'), function (f) {
        var lab = f.querySelector('label[for], .field-label');
        var label = lab ? lab.textContent.trim() : '';
        var val = '';
        var radio = f.querySelector('input[type=radio]:checked');
        if (radio) val = radio.value;
        else {
          var inp = f.querySelector('input:not([type=radio]), textarea');
          if (inp) val = inp.value.trim();
        }
        if (val) lines.push('*' + label + ':* ' + val);
      });
      var url = 'https://wa.me/' + form.getAttribute('data-wa') + '?text=' + encodeURIComponent(lines.join('\n'));
      window.open(url, '_blank', 'noopener');
      form.hidden = true;
      if (sent) { sent.hidden = false; sent.removeAttribute('hidden'); }
    });
    var reset = document.querySelector('[data-action=reset]');
    if (reset) reset.addEventListener('click', function () {
      form.reset();
      if (sent) sent.hidden = true;
      form.hidden = false;
      var first = form.querySelector('input'); if (first) first.focus();
    });
  }
})();
