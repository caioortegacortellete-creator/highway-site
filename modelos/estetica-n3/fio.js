/* SITE MODELO — HIGHWAY AGÊNCIA — ESTÉTICA NÍVEL 3. O fio rosé: nasce no selo da foto do Sobre, desce pela margem e termina em volta do mapa.
   Só no computador. O percurso é calculado das posições reais da página; se falhar, o site segue normal. */
(function () {
  if (matchMedia('(max-width: 920px), (pointer: coarse), (prefers-reduced-motion: reduce)').matches) return;
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg'), linha = document.createElementNS(NS, 'path');
  svg.setAttribute('class', 'fio'); svg.setAttribute('aria-hidden', 'true');
  svg.appendChild(linha); document.body.appendChild(svg);

  // posição na página sem contar as animações de entrada (transform)
  function pos(el) {
    let x = 0, y = 0, e = el;
    while (e) { x += e.offsetLeft; y += e.offsetTop; e = e.offsetParent; }
    return { x, y, w: el.offsetWidth, h: el.offsetHeight };
  }
  // um oval fechado, como trecho de curva, começando no topo
  function oval(cx, cy, rx, ry) {
    return `C ${cx + rx * .55} ${cy - ry} ${cx + rx} ${cy - ry * .55} ${cx + rx} ${cy} S ${cx + rx * .55} ${cy + ry} ${cx} ${cy + ry} S ${cx - rx} ${cy + ry * .55} ${cx - rx} ${cy} S ${cx - rx * .55} ${cy - ry} ${cx} ${cy - ry}`;
  }
  let total = 0, inicio = 0, fim = 1;
  function tracar() {
    const W = document.documentElement.clientWidth, H = document.documentElement.scrollHeight;
    svg.setAttribute('width', W); svg.setAttribute('height', H); svg.style.width = W + 'px'; svg.style.height = H + 'px';
    const foto = pos(document.querySelector('.sobre-foto')), seloR = document.querySelector('.selo-giro').getBoundingClientRect(), selo = { x: seloR.left, y: seloR.top + scrollY, w: seloR.width }, trat = pos(document.getElementById('tratamentos')), equipe = pos(document.getElementById('equipe')), mapa = pos(document.getElementById('mapa-oval'));
    const margemD = W - Math.max(26, (W - 1220) / 2 - 14), margemE = Math.max(26, (W - 1220) / 2 - 14);
    const mx = mapa.x + mapa.w / 2, my = mapa.y + mapa.h / 2, mrx = mapa.w / 2 + 22, mry = mapa.h / 2 + 22;
    const d = [
      `M ${selo.x + selo.w / 2} ${selo.y}`,                                               // sai do selo e sobe pelo respiro acima do texto
      `C ${selo.x + selo.w} ${foto.y - 90} ${margemD} ${foto.y - 90} ${margemD} ${foto.y + foto.h * .5}`,
      `L ${margemD} ${trat.y - 30}`,                                                      // só anda pela margem e pelos respiros entre as seções, nunca por cima do texto
      `C ${margemD} ${trat.y + 40} ${margemD - 70} ${trat.y + 70} ${margemD - 34} ${trat.y + 92}`,   // laço no respiro dos tratamentos
      `S ${margemD + 8} ${trat.y + 96} ${margemD} ${trat.y + 150}`,
      `L ${margemD} ${equipe.y - 30}`,
      `C ${margemD} ${equipe.y + 70} ${W * .68} ${equipe.y + 96} ${W * .5} ${equipe.y + 60}`,        // arco no respiro acima do título da equipe
      `S ${W * .72} ${equipe.y + 20} ${margemD} ${equipe.y + 120}`,
      `L ${margemD} ${my - mry - 40}`,
      `C ${margemD} ${my - mry - 6} ${mx + mrx * .6} ${my - mry - 10} ${mx} ${my - mry}`,
      oval(mx, my, mrx, mry)                                                              // termina fechando em volta do mapa
    ].join(' ');
    linha.setAttribute('d', d);
    total = linha.getTotalLength();
    linha.style.strokeDasharray = total;
    inicio = foto.y - innerHeight * .75; fim = my + mry - innerHeight * .78;
    desenhar();
  }
  let pedido = false;
  function desenhar() {
    pedido = false;
    const p = Math.max(0, Math.min(1, (scrollY - inicio) / (fim - inicio)));
    linha.style.strokeDashoffset = total * (1 - p);
    linha.style.opacity = p > 0 ? '' : 0;
  }
  addEventListener('scroll', () => { if (!pedido) { pedido = true; requestAnimationFrame(desenhar); } }, { passive: true });
  let esperando = 0;
  const refazer = () => { clearTimeout(esperando); esperando = setTimeout(tracar, 200); };
  addEventListener('resize', refazer); addEventListener('load', refazer);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(refazer);
  tracar();
})();
