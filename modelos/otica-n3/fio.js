/* ============================================================
   FIO VERMELHO — uma linha contínua guiada pela rolagem que nasce na ponta da haste
   do óculos que voou da foto da loja e pousou em Produtos ([data-voo-destino]) e segue pela página:
   haste do óculos → embaraçado que fica nítido (teste de estilo) → um olho (equipe)
   → moldura em volta da tabela de visão (contato).
   O percurso é calculado a partir da posição real das seções e corre pelas margens e espaços vazios.
   Se algo falhar, a camada é removida e o site segue normal.
   ============================================================ */
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const reduzir = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let svg, pecas = [], no = null, ponta, alvoSuave = null, quadro = 0;

  function desligar(e) {
    if (e) console.warn('Fio desativado:', e);
    if (svg) svg.remove();
    svg = null;
  }

  function iniciar() {
    if (!document.querySelector('[data-voo-destino]') || !document.getElementById('agendar')) return;
    if (matchMedia('(max-width: 920px), (pointer: coarse)').matches) return;   // no celular o fio fica de fora, para o site ficar leve
    svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'fio' + (reduzir ? ' fio-estatico' : ''));
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    document.body.appendChild(svg);

    construirSeguro();
    let espera;
    const reconstruir = () => { clearTimeout(espera); espera = setTimeout(construirSeguro, 180); };
    addEventListener('resize', reconstruir);
    addEventListener('load', reconstruir);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(reconstruir);
    if ('ResizeObserver' in window) {
      let alturaAnterior = 0;
      new ResizeObserver(() => {
        const h = document.querySelector('main').offsetHeight;
        if (Math.abs(h - alturaAnterior) > 2) { alturaAnterior = h; reconstruir(); }
      }).observe(document.querySelector('main'));
    }
    if (!reduzir) addEventListener('scroll', pedirQuadro, { passive: true });
  }

  function construirSeguro() { if (!svg) return; try { construir(); atualizar(true); } catch (e) { desligar(e); } }

  /* posição no documento ignorando transformações (as animações de entrada deslocam os elementos) */
  function pos(el) {
    let x = 0, y = 0, n = el;
    while (n) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; }
    return { x, y, w: el.offsetWidth, h: el.offsetHeight, r: x + el.offsetWidth, b: y + el.offsetHeight };
  }
  const $ = s => document.querySelector(s);
  const limitar = (v, a, b) => Math.min(Math.max(v, a), b);

  function caminho(d, classe) {
    const p = document.createElementNS(NS, 'path');
    p.setAttribute('d', d);
    if (classe) p.setAttribute('class', classe);
    svg.appendChild(p);
    return p;
  }
  const circulo = (x, y, r) => `M ${x + r} ${y} a ${r} ${r} 0 1 0 ${-2 * r} 0 a ${r} ${r} 0 1 0 ${2 * r} 0`;

  /* uma peça = um ou mais traços desenhados juntos dentro de uma janela de rolagem [y0, y1] */
  function peca(ds, y0, y1, minimo) {
    const els = ds.map(d => caminho(d.d || d, d.classe));
    pecas.push({ els, y0, y1, minimo: minimo || 0, atrasos: ds.map(d => d.atraso || 0) });
  }

  /* ---------------- embaraçado: dois estados com a mesma estrutura (enrolado → solto) ---------------- */
  const NO_AMARRADO = [[70, -60], [20, -62], [-40, -50], [-42, -14], [-44, 24], [6, 40], [26, 14], [46, -12], [34, -56], [2, -48], [-28, -40], [-30, -4], [-8, 14], [14, 32], [-6, 60], [-60, 72]];
  const NO_SOLTO = [[70, -60], [54, -58], [40, -50], [30, -38], [20, -26], [14, -16], [8, -6], [2, 4], [-4, 14], [-10, 24], [-16, 34], [-26, 44], [-36, 54], [-44, 62], [-52, 68], [-60, 72]];
  function caminhoNo(cx, cy, s, u) {
    const p = NO_AMARRADO.map((a, i) => { const b = NO_SOLTO[i]; return [cx + (a[0] + (b[0] - a[0]) * u) * s, cy + (a[1] + (b[1] - a[1]) * u) * s]; });
    let d = `M ${p[0][0]} ${p[0][1]}`;
    for (let i = 1; i < p.length; i += 3) d += ` C ${p[i][0]} ${p[i][1]}, ${p[i + 1][0]} ${p[i + 1][1]}, ${p[i + 2][0]} ${p[i + 2][1]}`;
    return d;
  }

  function construir() {
    svg.innerHTML = '';
    pecas = []; no = null;
    svg.style.height = '0px';
    const W = document.documentElement.clientWidth, H = document.documentElement.scrollHeight, vh = innerHeight;
    svg.setAttribute('width', W); svg.setAttribute('height', H);
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.style.width = W + 'px'; svg.style.height = H + 'px';

    const celular = W <= 920;
    const margem = Math.max(0, (W - 1220) / 2);
    const conteudoE = margem + 28, conteudoD = W - margem - 28;
    const xr = celular ? W - 12 : W - limitar(margem / 2 + 14, 18, 150);
    const xl = celular ? 12 : W - xr;

    /* ---------- 1. Nasce na ponta da haste direita do óculos que pousou em Produtos ---------- */
    // o óculos pousado ocupa a largura de [data-voo-destino]; a dobradiça direita fica a ~51% da largura à direita do centro
    const dv = pos($('[data-voo-destino]'));
    const esc = dv.w / 2.7;
    const S = { x: dv.x + dv.w / 2 + 1.37 * esc, y: dv.y + dv.h / 2 - .17 * esc };
    const fimAbertura = { x: xr, y: S.y + (celular ? 140 : 190) };
    // a haste continua para trás, faz uma volta (como a curva da orelha) e desce até a margem
    peca([`M ${S.x} ${S.y} C ${S.x + 30} ${S.y - 4}, ${S.x + 58} ${S.y + 4}, ${S.x + 66} ${S.y + 26} C ${S.x + 74} ${S.y + 50}, ${S.x + 42} ${S.y + 62}, ${S.x + 34} ${S.y + 40} C ${S.x + 26} ${S.y + 18}, ${S.x + 70} ${S.y + 6}, ${Math.min(S.x + 110, xr - 30)} ${S.y + 44} C ${xr - 10} ${S.y + 90}, ${xr} ${S.y + 100}, ${xr} ${fimAbertura.y}`],
      S.y - vh * .1, fimAbertura.y, celular ? 160 : 220);

    /* ---------- 2. Teste de estilo: o embaraçado que se desfaz (de embaçado a nítido) ---------- */
    const D = pos($('#diagnostico')), topo = pos($('.diag-topo'));
    const espacoLado = topo.x - conteudoE;
    const lateral = !celular && espacoLado >= 170;
    let s, kx, ky, travessia;
    if (lateral) {
      s = limitar((espacoLado - 30) / 140, .8, 1.35);
      kx = (conteudoE + topo.x) / 2; ky = topo.y + topo.h / 2;
    } else {
      s = celular ? .42 : .55;
      kx = celular ? W - 62 : conteudoD - 60; ky = D.y + (celular ? 50 : 72);
    }
    const E = { x: kx + 70 * s, y: ky - 60 * s }, X = { x: kx - 60 * s, y: ky + 72 * s };
    peca([`M ${xr} ${fimAbertura.y} L ${xr} ${D.y + 14}`], fimAbertura.y, D.y + 14);
    if (lateral) {
      const yT = D.y + 58;
      travessia = `M ${xr} ${D.y + 14} C ${xr} ${yT}, ${xr - 30} ${yT}, ${xr - 70} ${yT} L ${E.x + 70} ${yT} C ${E.x + 30} ${yT}, ${E.x + 40} ${E.y}, ${E.x} ${E.y}`;
    } else {
      travessia = `M ${xr} ${D.y + 14} C ${xr} ${E.y}, ${E.x + 20} ${E.y}, ${E.x} ${E.y}`;
    }
    peca([travessia], D.y + 14, E.y + 1, lateral ? 230 : 80);
    peca([caminhoNo(kx, ky, s, 0)], E.y, X.y, celular ? 140 : 220);
    no = { el: pecas[pecas.length - 1].els[0], kx, ky, s, u: -1, peca: pecas[pecas.length - 1] };

    /* ---------- 3. Equipe: um olho, no espaço acima do texto de apresentação ---------- */
    const Q = pos($('#equipe'));
    const xDesce = lateral ? xl : xr;
    const saidaNo = lateral
      ? `M ${X.x} ${X.y} C ${X.x - 14} ${X.y + 24}, ${xl} ${X.y + 10}, ${xl} ${X.y + 64} L ${xl} ${Q.y + 10}`
      : `M ${X.x} ${X.y} C ${X.x - 6} ${X.y + 24}, ${xr} ${X.y + 6}, ${xr} ${X.y + 50} L ${xr} ${Q.y + 10}`;
    peca([saidaNo], X.y, Q.y + 10);
    let tBase, alt;
    if (celular) { alt = 56; tBase = Q.y + 92; }
    else {
      const pq = pos($('#equipe .cabecalho > p'));
      tBase = pq.y - 22; alt = limitar(tBase - (Q.y + 76), 90, 170);
    }
    const hw = alt * .72, hh = alt * .3;
    const ex = (celular ? W - 30 : conteudoD) - hw, ey = tBase - alt * .45;
    const cilio = alt * .14;
    const yC = Q.y + (celular ? 22 : 40);
    const gx = ex - hw - (celular ? 18 : 30);
    const dir = gx > xDesce ? 1 : -1;
    peca([`M ${xDesce} ${Q.y + 10} C ${xDesce} ${yC}, ${xDesce + 30 * dir} ${yC}, ${xDesce + 60 * dir} ${yC} L ${gx - 40 * dir} ${yC} C ${gx - 10 * dir} ${yC}, ${gx} ${yC + 6}, ${gx} ${yC + 30} L ${gx} ${ey - 20}`],
      Q.y + 10, ey - 20, Math.abs(gx - xDesce) > 200 ? 220 : 60);
    peca([`M ${gx} ${ey - 20} C ${gx} ${ey - 4}, ${gx + 8} ${ey}, ${ex - hw} ${ey} Q ${ex} ${ey - hh * 2}, ${ex + hw} ${ey} Q ${ex} ${ey + hh * 2}, ${ex - hw} ${ey}`],
      ey - 20, ey + 30, celular ? 90 : 140);
    const palpebra = dx => ey - hh * (1 - (dx / hw) ** 2);
    const cilios = [-.5, 0, .5].map(f => { const x = ex + hw * f, y = palpebra(hw * f); return { d: `M ${x} ${y} L ${x + f * cilio * .6} ${y - cilio}`, atraso: .55 }; });
    peca([circulo(ex, ey, hh * .78), { d: circulo(ex, ey, hh * .3), atraso: .35 }, ...cilios], ey + 30, ey + 31, celular ? 120 : 200);
    const tipA = [ex + hw, ey], tipB = [ex, palpebra(0) - cilio];

    /* ---------- 4. Contato: dois fios saem do olho e se unem numa moldura em volta da tabela de visão ---------- */
    const info = pos($('.tabela-visao'));
    const rr = celular ? 10 : 14;
    const fl = celular ? 12 : info.x - 22, fr = celular ? W - 12 : info.r + 24;
    const ft = info.y - (celular ? 22 : 30), fb = info.b + 16, cx = (fl + fr) / 2;
    const xB = xr - (celular ? 8 : 11);
    peca([
      `M ${tipA[0]} ${tipA[1]} C ${tipA[0] + 40} ${tipA[1] - 10}, ${xr} ${tipA[1]}, ${xr} ${tipA[1] + 60} L ${xr} ${ft - 50}`,
      `M ${tipB[0]} ${tipB[1]} C ${tipB[0] + 30} ${tipB[1] - 40}, ${xB} ${tipB[1] - 20}, ${xB} ${tipB[1] + 50} L ${xB} ${ft - 40}`
    ], ey + 31, ft - 50);
    let molduraA, molduraB;
    if (celular) {
      molduraA = `M ${xr} ${ft - 50} L ${xr} ${fb - rr} Q ${xr} ${fb}, ${xr - rr} ${fb} L ${cx} ${fb}`;
      molduraB = `M ${xB} ${ft - 40} C ${xB} ${ft}, ${xB - 14} ${ft}, ${xB - 30} ${ft} L ${fl + rr} ${ft} Q ${fl} ${ft}, ${fl} ${ft + rr} L ${fl} ${fb - rr} Q ${fl} ${fb}, ${fl + rr} ${fb} L ${cx} ${fb}`;
    } else {
      molduraA = `M ${xr} ${ft - 50} C ${xr} ${ft}, ${xr - 30} ${ft}, ${xr - 60} ${ft} L ${fl + rr} ${ft} Q ${fl} ${ft}, ${fl} ${ft + rr} L ${fl} ${fb - rr} Q ${fl} ${fb}, ${fl + rr} ${fb} L ${cx} ${fb}`;
      molduraB = `M ${xB} ${ft - 40} C ${xB} ${ft + 9}, ${xB - 26} ${ft + 9}, ${xB - 50} ${ft + 9} L ${fr + rr} ${ft + 9} Q ${fr} ${ft + 9}, ${fr} ${ft + 9 + rr} L ${fr} ${fb - rr} Q ${fr} ${fb}, ${fr - rr} ${fb} L ${cx} ${fb}`;
    }
    peca([molduraA, molduraB, { d: circulo(cx, fb, celular ? 3 : 4), atraso: .92 }], ft - 50, fb + 40, celular ? 220 : 300);

    /* janelas contínuas: cada peça começa onde a anterior terminou */
    let fim = -Infinity;
    pecas.forEach(p => {
      p.y0 = Math.max(p.y0, fim);
      p.y1 = Math.max(p.y1, p.y0 + p.minimo, p.y0 + 1);
      fim = p.y1;
      p.els.forEach(el => { el.comp = el.getTotalLength(); el.style.strokeDasharray = el.comp; });
    });
    // o embaraçado fica enrolado por um instante e depois se desfaz conforme a rolagem
    no.desatar = [no.peca.y1 + vh * .12, no.peca.y1 + vh * (celular ? .45 : .62)];

    ponta = document.createElementNS(NS, 'circle');
    ponta.setAttribute('class', 'ponta'); ponta.setAttribute('r', celular ? 2 : 2.4);
    svg.appendChild(ponta);
    alvoSuave = null;
  }

  function pedirQuadro() { if (!quadro) quadro = requestAnimationFrame(() => { quadro = 0; atualizar(false); }); }

  function atualizar(imediato) {
    if (!svg || !pecas.length) return;
    const alvo = reduzir ? Infinity : scrollY + innerHeight * (innerWidth <= 920 ? .7 : .62);
    if (alvoSuave === null || imediato || reduzir) alvoSuave = alvo;
    else alvoSuave += (alvo - alvoSuave) * .2;
    if (!reduzir && Math.abs(alvo - alvoSuave) > .5) pedirQuadro();

    const u = reduzir ? 1 : limitar((alvoSuave - no.desatar[0]) / (no.desatar[1] - no.desatar[0]), 0, 1);
    const uSuave = u * u * (3 - 2 * u);
    if (Math.abs(uSuave - no.u) > .001) {
      no.el.setAttribute('d', caminhoNo(no.kx, no.ky, no.s, uSuave));
      no.el.comp = no.el.getTotalLength(); no.el.style.strokeDasharray = no.el.comp;
      no.u = uSuave;
    }

    let pontaXY = null;
    pecas.forEach(p => {
      const f = limitar((alvoSuave - p.y0) / (p.y1 - p.y0), 0, 1);
      p.els.forEach((el, i) => {
        const a = p.atrasos[i];
        const fi = a ? limitar((f - a) / (1 - a), 0, 1) : f;
        el.style.strokeDashoffset = el.comp * (1 - fi);
        if (i === 0 && fi > 0 && fi < 1) pontaXY = el.getPointAtLength(el.comp * fi);
      });
    });
    if (pontaXY && !reduzir) { ponta.setAttribute('cx', pontaXY.x); ponta.setAttribute('cy', pontaXY.y); ponta.style.opacity = 1; }
    else ponta.style.opacity = 0;
  }

  // só inicia depois que todas as funções e constantes acima existem
  try { iniciar(); } catch (e) { desligar(e); }
})();
