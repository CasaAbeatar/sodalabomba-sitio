/* Chat del menú. Responde Claude con el menú guardado en la base; los pedidos se hacen con el carrito y WhatsApp. */
(function () {
  var S = document.currentScript, SITIO = (S && S.getAttribute('data-sitio')) || 'soda';
  var URLF = 'https://dwlbcbtwdungyrykgahm.supabase.co/functions/v1/claude-web';
  var EN = /^en/i.test(document.documentElement.lang || '');
  var T = EN ? {
    abrir: 'Ask about the menu', titulo: 'Menu assistant', cerrar: 'Close', enviar: 'Send', ph: 'Type your question',
    hola: 'Hi! I can answer questions about the menu, prices and Express delivery. To order, use the cart on this page.',
    aviso: 'Automatic answers based on this page’s menu. Orders are placed with the cart and sent by WhatsApp.',
    pensando: 'Writing…', error: 'We could not answer right now. You can see the full menu on this page or write to us on WhatsApp.'
  } : {
    abrir: 'Pregúntanos sobre el menú', titulo: 'Asistente del menú', cerrar: 'Cerrar', enviar: 'Enviar', ph: 'Escribe tu pregunta',
    hola: '¡Hola! Puedo contestarte dudas sobre el menú, los precios y el Express. Para pedir, usa el carrito de esta página.',
    aviso: 'Respuestas automáticas con el menú de esta página. Los pedidos se hacen con el carrito y se envían por WhatsApp.',
    pensando: 'Escribiendo…', error: 'No pudimos responder ahora. Puedes ver el menú completo en esta página o escribirnos por WhatsApp.'
  };
  var SUG = SITIO === 'soda'
    ? (EN ? ['What is there for breakfast?', 'How far does Express delivery go?', 'How much is the classic burger with fries?'] : ['¿Qué tienen de desayuno?', '¿Hasta dónde llega el Express?', '¿Cuánto cuesta la hamburguesa clásica con papas?'])
    : (EN ? ['What combos do you have?', 'What comes with the fried quarter?', 'How far does Express delivery go?'] : ['¿Qué combos tienen?', '¿Qué trae el cuarto frito?', '¿Hasta dónde llega el Express?']);

  var css = document.createElement('style');
  css.textContent =
    '.cw-btn{position:fixed;right:16px;bottom:calc(88px + env(safe-area-inset-bottom));z-index:30;min-height:48px;padding:0 18px;border-radius:999px;border:1px solid #fff;background:#B81622;color:#fff;font:800 15px/1 var(--body,system-ui,sans-serif);cursor:pointer;box-shadow:0 4px 18px rgba(0,0,0,.28)}' +
    '.cw-btn:hover,.cw-btn:focus-visible{background:#8f1019;outline:3px solid #F3A62C;outline-offset:2px}' +
    '.cw-p{position:fixed;right:16px;bottom:calc(88px + env(safe-area-inset-bottom));z-index:40;width:min(380px,calc(100vw - 32px));max-height:min(560px,calc(100vh - 140px));display:flex;flex-direction:column;background:#fff;color:#171212;border:1px solid #E6DDD3;border-radius:16px;box-shadow:0 10px 40px rgba(0,0,0,.35);overflow:hidden;font:16px/1.4 var(--body,system-ui,sans-serif)}' +
    '.cw-p[hidden]{display:none}' +
    '.cw-h{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:12px 14px;background:#B81622;color:#fff;font-weight:800}' +
    '.cw-x{min-height:44px;min-width:44px;padding:0 12px;border:1px solid #fff;border-radius:10px;background:transparent;color:#fff;font:800 14px var(--body,system-ui,sans-serif);cursor:pointer}' +
    '.cw-l{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px}' +
    '.cw-m{max-width:88%;padding:10px 12px;border-radius:14px;white-space:pre-wrap;word-wrap:break-word;border:1px solid #E6DDD3}' +
    '.cw-m.b{align-self:flex-start;background:#faf6f1}.cw-m.u{align-self:flex-end;background:#B81622;color:#fff;border-color:#B81622}' +
    '.cw-s[hidden]{display:none}' +
    '.cw-s{display:flex;flex-direction:column;gap:8px;padding:0 14px 10px}' +
    '.cw-s button{min-height:44px;text-align:left;padding:8px 12px;border:1px solid #B81622;border-radius:12px;background:#fff;color:#B81622;font:700 15px var(--body,system-ui,sans-serif);cursor:pointer}' +
    '.cw-s button:hover,.cw-s button:focus-visible{background:#B81622;color:#fff}' +
    '.cw-a{margin:0;padding:0 14px 10px;font-size:12.5px;color:#5a4a4a}' +
    '.cw-f{display:flex;gap:8px;padding:10px 14px calc(10px + env(safe-area-inset-bottom));border-top:1px solid #E6DDD3}' +
    '.cw-f input{flex:1;min-width:0;min-height:48px;padding:0 12px;border:1px solid #8a7a70;border-radius:12px;font:16px var(--body,system-ui,sans-serif);color:#171212;background:#fff}' +
    '.cw-f input:focus{outline:3px solid #B81622;outline-offset:1px}' +
    '.cw-f button{min-height:48px;padding:0 16px;border:0;border-radius:12px;background:#B81622;color:#fff;font:800 15px var(--body,system-ui,sans-serif);cursor:pointer}' +
    '.cw-f button:disabled{opacity:.5;cursor:not-allowed}' +
    '@media (min-width:860px){.cw-btn,.cw-p{bottom:24px}}';
  document.head.appendChild(css);

  function el(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }
  var btn = el('button', 'cw-btn', T.abrir); btn.type = 'button'; btn.setAttribute('aria-haspopup', 'dialog');
  var p = el('div', 'cw-p'); p.hidden = true; p.setAttribute('role', 'dialog'); p.setAttribute('aria-label', T.titulo);
  var h = el('div', 'cw-h'); h.appendChild(el('span', '', T.titulo));
  var x = el('button', 'cw-x', T.cerrar); x.type = 'button'; h.appendChild(x);
  var log = el('div', 'cw-l'); log.setAttribute('role', 'log'); log.setAttribute('aria-live', 'polite');
  var sug = el('div', 'cw-s'); var aviso = el('p', 'cw-a', T.aviso);
  var f = el('form', 'cw-f'); var inp = el('input'); inp.type = 'text'; inp.maxLength = 400; inp.placeholder = T.ph; inp.setAttribute('aria-label', T.ph); inp.autocomplete = 'off';
  var env = el('button', '', T.enviar); env.type = 'submit'; f.appendChild(inp); f.appendChild(env);
  p.appendChild(h); p.appendChild(log); p.appendChild(sug); p.appendChild(aviso); p.appendChild(f);
  document.body.appendChild(btn); document.body.appendChild(p);

  var hist = [], busy = false;
  function arriba(m) { log.scrollTop += m.getBoundingClientRect().top - log.getBoundingClientRect().top - 8; }
  function add(rol, txt) { var m = el('div', 'cw-m ' + (rol === 'user' ? 'u' : 'b'), txt); log.appendChild(m); if (rol === 'user') log.scrollTop = log.scrollHeight; else arriba(m); return m; }
  add('assistant', T.hola);
  SUG.forEach(function (s) { var b = el('button', '', s); b.type = 'button'; b.addEventListener('click', function () { ask(s); }); sug.appendChild(b); });

  function ask(q) {
    q = (q || '').trim(); if (!q || busy) return;
    busy = true; env.disabled = true; sug.hidden = true;
    add('user', q); hist.push({ role: 'user', content: q }); inp.value = '';
    var w = add('assistant', T.pensando), ac = ('AbortController' in window) ? new AbortController() : null, tm = setTimeout(function () { if (ac) ac.abort(); }, 30000);
    fetch(URLF, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sitio: SITIO, mensajes: hist.slice(-6) }), signal: ac ? ac.signal : undefined })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
      .then(function (j) { var t = String((j && j.respuesta) || T.error).replace(/\*\*/g, '').replace(/^#+\s*/gm, ''); w.textContent = t; hist.push({ role: 'assistant', content: t }); })
      .catch(function () { w.textContent = T.error; hist.pop(); })
      .then(function () { clearTimeout(tm); busy = false; env.disabled = false; arriba(w); inp.focus({ preventScroll: true }); });
    if (window.goatcounter && window.goatcounter.count) { try { window.goatcounter.count({ path: 'chat-pregunta', title: 'chat-pregunta', event: true }); } catch (e) {} }
  }
  function abrir() { p.hidden = false; btn.hidden = true; inp.focus(); }
  function cerrar() { p.hidden = true; btn.hidden = false; btn.focus(); }
  btn.addEventListener('click', abrir); x.addEventListener('click', cerrar);
  f.addEventListener('submit', function (e) { e.preventDefault(); ask(inp.value); });
  p.addEventListener('keydown', function (e) { if (e.key === 'Escape') cerrar(); });
})();
