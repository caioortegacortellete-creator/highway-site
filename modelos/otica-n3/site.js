/* SITE MODELO — HIGHWAY AGÊNCIA — ÓTICA NÍVEL 3. Comportamentos compartilhados por todas as páginas (topo, rodapé, animações, cursor, cookies). */
document.documentElement.classList.add('js');

const ICONES = {
  whats: '<svg viewBox="0 0 24 24"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2Zm5.8 14.06c-.24.68-1.43 1.33-1.97 1.38-.5.05-.97.24-3.27-.68-2.77-1.09-4.52-3.92-4.66-4.1-.13-.18-1.11-1.48-1.11-2.82 0-1.34.7-2 .95-2.27.25-.27.54-.34.72-.34h.52c.17 0 .39-.06.61.47.24.56.79 1.92.86 2.06.07.14.11.3.02.48-.09.18-.14.3-.27.46-.14.16-.29.36-.41.48-.14.14-.28.29-.12.56.16.27.71 1.17 1.52 1.9 1.05.93 1.93 1.22 2.2 1.36.27.14.43.11.59-.07.16-.18.68-.79.86-1.06.18-.27.36-.23.61-.14.25.09 1.59.75 1.86.89.27.14.45.2.52.32.07.11.07.66-.17 1.34Z"/></svg>',
  seta: '<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  instagram: '<svg viewBox="0 0 24 24"><path d="M12 7.3a4.7 4.7 0 1 0 0 9.4 4.7 4.7 0 0 0 0-9.4Zm0 7.7a3 3 0 1 1 0-6 3 3 0 0 1 0 6Zm4.9-8.9a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0ZM12 3.6c2.7 0 3 0 4.1.1 2.7.1 4 1.4 4.1 4.1.1 1.1.1 1.4.1 4.1s0 3-.1 4.1c-.1 2.7-1.4 4-4.1 4.1-1.1.1-1.4.1-4.1.1s-3 0-4.1-.1c-2.7-.1-4-1.4-4.1-4.1-.1-1.1-.1-1.4-.1-4.1s0-3 .1-4.1c.1-2.7 1.4-4 4.1-4.1 1.1-.1 1.4-.1 4.1-.1ZM12 2c-2.7 0-3.1 0-4.2.1C4.2 2.2 2.2 4.2 2.1 7.8 2 8.9 2 9.3 2 12s0 3.1.1 4.2c.1 3.6 2.1 5.6 5.7 5.7 1.1.1 1.5.1 4.2.1s3.1 0 4.2-.1c3.6-.1 5.6-2.1 5.7-5.7.1-1.1.1-1.5.1-4.2s0-3.1-.1-4.2c-.1-3.6-2.1-5.6-5.7-5.7C15.1 2 14.7 2 12 2Z"/></svg>',
  linkedin: '<svg viewBox="0 0 24 24"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4V21H3V9.75Zm6.5 0h3.8v1.6h.06c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.77 2.65 4.77 6.1V21h-4v-5.03c0-1.2-.02-2.74-1.67-2.74-1.67 0-1.93 1.3-1.93 2.65V21h-4V9.75Z"/></svg>',
  facebook: '<svg viewBox="0 0 24 24"><path d="M14 8.5V6.6c0-.8.2-1.3 1.4-1.3H17V2.2c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.4-4 4.1v2.3H8v3.3h2.6V22H14v-10.2h2.6l.4-3.3H14Z"/></svg>'
};
const linkWhats = msg => `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`;
const naInicial = !!document.querySelector('[data-pagina="inicio"]');
const ancora = id => (naInicial ? '' : 'index.html') + '#' + id;
const OCULOS = '<g class="oculos" fill="none" stroke="currentColor"><circle cx="15" cy="23" r="5.6"/><circle cx="29" cy="23" r="5.6"/><path d="M20.6 22.2c.9-1.2 1.9-1.2 2.8 0M9.4 22 8 19.5M34.6 22 36 19.5"/></g>';
const selo = `<svg viewBox="0 0 44 44" aria-hidden="true"><circle cx="22" cy="22" r="21"/>${OCULOS}</svg>`;
const MSG_PADRAO = 'Olá, vim pelo site e gostaria de tirar uma dúvida.';
const MSG_RECEITA = 'Olá, vim pelo site e gostaria de enviar a minha receita para orçamento.';

/* ---------- Topo e rodapé montados a partir de dados.js ---------- */
const lugarTopo = document.querySelector('[data-topo]');
if (lugarTopo) lugarTopo.outerHTML = `
<div class="progresso-leitura" id="progresso"></div>
<header class="topo" id="topo">
  <div class="container">
    <a class="marca" href="index.html">${selo}<span><small>Ótica</small><b>${CONFIG.nome}</b></span></a>
    <nav aria-label="Menu principal">
      <ul class="menu" id="menu">
        <li><a href="${ancora('sobre')}">A ótica</a></li>
        <li class="tem-sub"><a href="${ancora('produtos')}">Produtos</a>
          <ul class="submenu">${PRODUTOS.map((a, i) => `<li><a href="produto.html?a=${a.id}">${a.titulo}<span>0${i + 1}</span></a></li>`).join('')}</ul>
        </li>
        <li><a href="${ancora('diagnostico')}">Teste de estilo</a></li>
        <li><a href="${ancora('artigos')}">Dicas</a></li>
        <li><a href="${ancora('agendar')}">Contato</a></li>
      </ul>
    </nav>
    <a class="btn" href="${ancora('agendar')}">Agendar visita</a>
    <button class="hamburguer" id="hamburguer" aria-label="Abrir menu" aria-expanded="false" aria-controls="menu"><span></span><span></span><span></span></button>
  </div>
</header>`;

const lugarRodape = document.querySelector('[data-rodape]');
if (lugarRodape) lugarRodape.outerHTML = `
<footer class="rodape granulado">
  <div class="rodape-cta">
    <div class="container">
      <p class="rotulo revelar">Vamos conversar</p>
      <h2 class="revelar">Seu próximo óculos<br>começa por uma <em>conversa.</em></h2>
      <div class="acoes revelar">
        <a class="btn" href="${linkWhats(MSG_RECEITA)}" target="_blank" rel="noopener">${ICONES.whats} Enviar minha receita</a>
        <a class="btn btn-claro" href="${ancora('agendar')}">Agendar visita</a>
      </div>
    </div>
  </div>
  <div class="container rodape-grade">
    <div>
      <p class="marca-rodape">${CONFIG.escritorio}</p>
      <p>${CONFIG.especialidade}.<br>Em ${CONFIG.cidade} desde ${CONFIG.desde}.</p>
      <div class="redes">
        <a href="${CONFIG.redes.instagram}" aria-label="Instagram">${ICONES.instagram}</a>
        <a href="${CONFIG.redes.facebook}" aria-label="Facebook">${ICONES.facebook}</a>
      </div>
    </div>
    <div><h4>Produtos</h4><ul>${PRODUTOS.map(a => `<li><a href="produto.html?a=${a.id}">${a.titulo}</a></li>`).join('')}</ul></div>
    <div><h4>Navegação</h4><ul>
      <li><a href="${ancora('sobre')}">A ótica</a></li><li><a href="${ancora('diagnostico')}">Teste de estilo</a></li>
      <li><a href="${ancora('artigos')}">Dicas</a></li><li><a href="${ancora('agendar')}">Agendar visita</a></li></ul></div>
    <div><h4>Contato</h4><ul>
      <li>${CONFIG.telefone}</li><li>${CONFIG.email}</li><li>${CONFIG.endereco}<br>${CONFIG.bairroCidade}</li><li>${CONFIG.horario}<br>${CONFIG.horarioSabado}</li></ul></div>
  </div>
  <div class="rodape-base"><div class="container">
    <span>© ${new Date().getFullYear()} ${CONFIG.escritorio} · CNPJ ${CONFIG.cnpj}</span>
    <span>Imagens ilustrativas.</span>
  </div></div>
  <p class="rodape-assinatura" aria-hidden="true">${CONFIG.nome}</p>
</footer>
<a class="whats-flutuante" href="${linkWhats(MSG_PADRAO)}" target="_blank" rel="noopener" aria-label="Falar pelo WhatsApp">${ICONES.whats}</a>
<div class="cookies" id="cookies" role="dialog" aria-label="Aviso de cookies">
  <p><b>Sua privacidade importa.</b> Usamos cookies apenas para entender a navegação e melhorar o site, conforme a LGPD.</p>
  <div class="acoes"><button id="cookies-recusar">Recusar</button><button class="aceitar" id="cookies-aceitar">Aceitar</button></div>
</div>
<div class="cursor" id="cursor" aria-hidden="true"></div>`;

document.body.insertAdjacentHTML('beforeend', `<div class="cortina" id="cortina" aria-hidden="true">${selo}</div>`);
document.getElementById('menu').setAttribute('data-lenis-prevent', '');

/* Links de WhatsApp: qualquer elemento com data-whats="mensagem" */
document.querySelectorAll('[data-whats]').forEach(a => {
  a.href = linkWhats(a.dataset.whats || MSG_PADRAO);
  a.target = '_blank'; a.rel = 'noopener';
});
document.querySelectorAll('[data-icone]').forEach(el => el.insertAdjacentHTML('afterbegin', ICONES[el.dataset.icone]));

/* ---------- Rolagem suave (Lenis) ---------- */
const semMovimento = matchMedia('(prefers-reduced-motion: reduce)').matches;
let lenis = null;
// só com mouse: no celular a rolagem natural do aparelho já é suave e mais leve
if (window.Lenis && !semMovimento && !matchMedia('(pointer: coarse)').matches) {
  lenis = new Lenis({ lerp: .075, wheelMultiplier: .9, smoothWheel: true });
  (function quadro(t) { lenis.raf(t); requestAnimationFrame(quadro); })(performance.now());
}
const travar = sim => { document.body.classList.toggle('travado', sim); if (lenis) sim ? lenis.stop() : lenis.start(); };
function rolarPara(hash) {
  const alvo = hash.length > 1 && document.querySelector(hash);
  if (!alvo) return;
  if (lenis) lenis.scrollTo(alvo, { offset: hash === '#inicio' ? 0 : -60 });
  else alvo.scrollIntoView({ behavior: semMovimento ? 'auto' : 'smooth' });
}

/* ---------- Cortina de transição entre páginas ---------- */
const cortina = document.getElementById('cortina');
const veioDeOutraPagina = document.documentElement.classList.contains('em-transicao');
try { sessionStorage.removeItem('transicao'); } catch (e) {}
function revelarPagina() {
  cortina.classList.add('cobrindo');
  document.documentElement.classList.remove('em-transicao');
  requestAnimationFrame(() => requestAnimationFrame(() => { cortina.classList.remove('cobrindo'); cortina.classList.add('saindo'); }));
  cortina.addEventListener('transitionend', function fim(e) { if (e.target !== cortina) return; cortina.classList.remove('saindo'); cortina.removeEventListener('transitionend', fim); });
}
document.addEventListener('click', e => {
  const a = e.target.closest('a[href]');
  if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target === '_blank' || a.hasAttribute('download')) return;
  const url = new URL(a.getAttribute('href'), location.href);
  if (url.origin !== location.origin) return;
  if (url.pathname === location.pathname && url.search === location.search) {
    if (url.hash) { e.preventDefault(); rolarPara(url.hash); history.replaceState(null, '', url.hash); }
    return;
  }
  e.preventDefault();
  try { sessionStorage.setItem('transicao', '1'); } catch (er) {}
  if (semMovimento) { location.href = url.href; return; }
  cortina.classList.remove('saindo'); void cortina.offsetWidth; cortina.classList.add('entrando');
  setTimeout(() => { location.href = url.href; }, 760);
});
// ao voltar pelo botão do navegador, a página pode vir da memória ainda coberta
addEventListener('pageshow', e => { if (e.persisted) { cortina.className = 'cortina'; document.documentElement.classList.remove('em-transicao'); } });

/* ---------- Abertura (só na primeira visita da sessão) e liberação das animações de entrada ---------- */
function liberar() { document.body.classList.add('pronto'); }
const abertura = document.querySelector('.abertura');
let jaViu = false;
try { jaViu = sessionStorage.getItem('abertura') === '1'; sessionStorage.setItem('abertura', '1'); } catch (e) {}
if (veioDeOutraPagina) {
  if (abertura) abertura.remove();
  revelarPagina();
  setTimeout(liberar, 380);
} else if (abertura && !jaViu) {
  travar(true);
  const inicio = performance.now();
  const sair = () => setTimeout(() => {
    abertura.classList.add('saiu'); travar(false); liberar();
  }, Math.max(0, 1500 - (performance.now() - inicio)));
  if (document.readyState === 'complete') sair(); else window.addEventListener('load', sair);
  setTimeout(() => { if (!document.body.classList.contains('pronto')) { abertura.classList.add('saiu'); travar(false); liberar(); } }, 3500);
} else {
  if (abertura) abertura.remove();
  requestAnimationFrame(liberar);
}

/* ---------- Topo: fundo ao rolar, esconde ao descer, progresso de leitura ---------- */
const topo = document.getElementById('topo');
const progresso = document.getElementById('progresso');
let ultimoY = 0;
function aoRolar() {
  const y = window.scrollY, max = document.documentElement.scrollHeight - innerHeight;
  topo.classList.toggle('rolado', y > 40);
  topo.classList.toggle('escondido', y > 700 && y > ultimoY && !document.body.classList.contains('menu-aberto'));
  ultimoY = y;
  progresso.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
}
window.addEventListener('scroll', aoRolar, { passive: true });
aoRolar();

/* ---------- Menu do celular ---------- */
const hamburguer = document.getElementById('hamburguer');
function menu(abrir) {
  document.body.classList.toggle('menu-aberto', abrir);
  travar(abrir);
  hamburguer.setAttribute('aria-expanded', abrir);
  hamburguer.setAttribute('aria-label', abrir ? 'Fechar menu' : 'Abrir menu');
}
hamburguer.addEventListener('click', () => menu(!document.body.classList.contains('menu-aberto')));
document.querySelectorAll('#menu a').forEach(a => a.addEventListener('click', () => menu(false)));
document.addEventListener('keydown', e => { if (e.key === 'Escape' && document.body.classList.contains('menu-aberto')) menu(false); });

/* ---------- Revelar ao rolar e contadores ---------- */
const observador = new IntersectionObserver(entradas => entradas.forEach(e => {
  if (!e.isIntersecting) return;
  e.target.classList.add('visivel');
  e.target.querySelectorAll('[data-contar]').forEach(contar);
  observador.unobserve(e.target);
}), { threshold: .12, rootMargin: '0px 0px -40px 0px' });
const observarTudo = () => document.querySelectorAll('.revelar:not(.visivel), .revelar-img:not(.visivel), [data-observar]').forEach(el => observador.observe(el));
observarTudo();
function contar(el) {
  const alvo = +el.dataset.contar, sufixo = el.dataset.sufixo || '', inicio = performance.now();
  (function passo(t) {
    const p = Math.min((t - inicio) / 1600, 1);
    el.textContent = Math.round(alvo * (1 - Math.pow(1 - p, 3))) + (p === 1 ? sufixo : '');
    if (p < 1) requestAnimationFrame(passo);
  })(inicio);
}

/* ---------- Cursor personalizado e botões magnéticos (só com mouse) ---------- */
const temMouse = matchMedia('(hover: hover) and (pointer: fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches;
if (temMouse) {
  const cursor = document.getElementById('cursor');
  let cx = 0, cy = 0, x = 0, y = 0;
  addEventListener('mousemove', e => { x = e.clientX; y = e.clientY; cursor.classList.add('ativo'); });
  document.addEventListener('mouseleave', () => cursor.classList.remove('ativo'));
  (function seguir() { cx += (x - cx) * .18; cy += (y - cy) * .18; cursor.style.transform = `translate(${cx}px, ${cy}px)`; requestAnimationFrame(seguir); })();
  document.addEventListener('mouseover', e => cursor.classList.toggle('sobre-link', !!e.target.closest('a, button, summary, label')));
  document.querySelectorAll('.btn').forEach(b => {
    b.addEventListener('mousemove', e => {
      const r = b.getBoundingClientRect();
      b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .18}px, ${(e.clientY - r.top - r.height / 2) * .3}px)`;
    });
    b.addEventListener('mouseleave', () => { b.style.transform = ''; });
  });
}

/* ---------- Aviso de cookies (LGPD) ---------- */
const cookies = document.getElementById('cookies');
let respondeu = false;
try { respondeu = !!localStorage.getItem('cookies'); } catch (e) {}
if (!respondeu) setTimeout(() => cookies.classList.add('mostrar'), 2500);
const responder = v => { try { localStorage.setItem('cookies', v); } catch (e) {} cookies.classList.remove('mostrar'); };
document.getElementById('cookies-aceitar').addEventListener('click', () => responder('aceito'));
document.getElementById('cookies-recusar').addEventListener('click', () => responder('recusado'));
