/* ============================================================
   FIO DOURADO — uma linha contínua guiada pela rolagem que conta a história da página:
   abertura (ao lado do advogado) → casa (áreas de atuação) → nó que se desfaz (diagnóstico)
   → árvore de gerações (equipe) → moldura em volta do convite (contato).
   O percurso é calculado a partir da posição real das seções e corre pelas margens e espaços vazios.
   Se algo falhar, a camada é removida e o site segue normal.
   ============================================================ */
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const reduzir = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let svg, pecas = [], no = null, ponta, alvoSuave = null, quadro = 0, introducao = 0;


  function desligar(e) {
    if (e) console.warn('Fio dourado desativado:', e);
    if (svg) svg.remove();
    svg = null;
  }

  function iniciar() {
    if (!document.getElementById('areas') || !document.getElementById('agendar')) return;
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
    if (!reduzir) {
      addEventListener('scroll', pedirQuadro, { passive: true });
      // abertura: o primeiro trecho do fio aparece suavemente ao carregar
      const t0 = performance.now();
      (function entrar(t) { introducao = Math.min((t - t0) / 1600, 1); pedirQuadro(); if (introducao < 1) requestAnimationFrame(entrar); })(t0);
    }
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
  function peca(ds, y0, y1, minimo, extra) {
    const els = ds.map(d => caminho(d.d || d, d.classe));
    pecas.push(Object.assign({ els, y0, y1, minimo: minimo || 0, atrasos: ds.map(d => d.atraso || 0) }, extra || {}));
  }

  /* ---------------- nó: dois estados com a mesma estrutura (amarrado → solto) ---------------- */
  // nó com dois laços que se cruzam; o estado solto tem os mesmos pontos, vira uma curva em S
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

    /* ---------- 1. Abertura: nasce ao lado da poltrona ---------- */
    const pessoa = $('#pessoa'), palco = $('#palco');
    const pr = pessoa.getBoundingClientRect();
    const fixo = getComputedStyle(palco).position === 'fixed';
    const pTopo = pr.top + (fixo ? 0 : scrollY);
    let S;
    if (celular) S = { x: W - 40, y: pTopo + pr.height * .5 };
    else S = { x: Math.min(pr.right + 26, xr - 120), y: pTopo + pr.height * .66 };
    const fimAbertura = { x: xr, y: S.y + (celular ? 120 : 160) };
    peca([`M ${S.x} ${S.y} C ${S.x + 10} ${S.y - 34}, ${S.x + 54} ${S.y - 30}, ${S.x + 48} ${S.y} C ${S.x + 42} ${S.y + 28}, ${S.x + 8} ${S.y + 20}, ${S.x + 28} ${S.y + 44} C ${S.x + 60} ${S.y + 84}, ${xr} ${S.y + 40}, ${xr} ${fimAbertura.y}`],
      S.y - vh * .3, fimAbertura.y, 0, { abertura: true });

    /* ---------- 2. Áreas de atuação: a casa, no espaço vazio acima do título ---------- */
    const A = pos($('#areas'));
    const casaL = celular ? 56 : 96, casaA = celular ? 54 : 92;
    const base = A.y + (celular ? 84 : 120);
    const hx1 = celular ? W - 34 : conteudoD, hx0 = hx1 - casaL, parede = base - casaA * .56, topoCasa = base - casaA;
    peca([`M ${xr} ${fimAbertura.y} L ${xr} ${A.y + 16}`], fimAbertura.y, A.y + 16);
    peca([`M ${xr} ${A.y + 16} C ${xr} ${base - 8}, ${hx1 + 18} ${base}, ${hx1} ${base} L ${hx0} ${base} L ${hx0} ${parede} L ${(hx0 + hx1) / 2} ${topoCasa} L ${hx1} ${parede} L ${hx1} ${base - 2} C ${hx1} ${base + 22}, ${xr} ${base + 4}, ${xr} ${base + 50}`,
      { d: `M ${(hx0 + hx1) / 2 - casaL * .11} ${base} L ${(hx0 + hx1) / 2 - casaL * .11} ${base - casaA * .26} L ${(hx0 + hx1) / 2 + casaL * .11} ${base - casaA * .26} L ${(hx0 + hx1) / 2 + casaL * .11} ${base}`, atraso: .55 }],
      A.y + 16, base + 50, celular ? 160 : 240);

    /* ---------- 3. Diagnóstico: o nó que se desfaz ---------- */
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
    peca([`M ${xr} ${base + 50} L ${xr} ${D.y + 14}`], base + 50, D.y + 14);
    if (lateral) {
      const yT = D.y + 58;
      travessia = `M ${xr} ${D.y + 14} C ${xr} ${yT}, ${xr - 30} ${yT}, ${xr - 70} ${yT} L ${E.x + 70} ${yT} C ${E.x + 30} ${yT}, ${E.x + 40} ${E.y}, ${E.x} ${E.y}`;
    } else {
      travessia = `M ${xr} ${D.y + 14} C ${xr} ${E.y}, ${E.x + 20} ${E.y}, ${E.x} ${E.y}`;
    }
    peca([travessia], D.y + 14, E.y + 1, lateral ? 230 : 80);
    peca([caminhoNo(kx, ky, s, 0)], E.y, X.y, celular ? 140 : 220);
    no = { el: pecas[pecas.length - 1].els[0], kx, ky, s, u: -1, peca: pecas[pecas.length - 1] };

    /* ---------- 4. Equipe: a árvore de gerações ---------- */
    const Q = pos($('#equipe'));
    const xDesce = lateral ? xl : xr;
    const saidaNo = lateral
      ? `M ${X.x} ${X.y} C ${X.x - 14} ${X.y + 24}, ${xl} ${X.y + 10}, ${xl} ${X.y + 64} L ${xl} ${Q.y + 10}`
      : `M ${X.x} ${X.y} C ${X.x - 6} ${X.y + 24}, ${xr} ${X.y + 6}, ${xr} ${X.y + 50} L ${xr} ${Q.y + 10}`;
    peca([saidaNo], X.y, Q.y + 10);
    let tBase, alt, xt;
    if (celular) { alt = 64; tBase = Q.y + 88; xt = W - 72; }
    else {
      const pq = pos($('#equipe .cabecalho > p'));
      tBase = pq.y - 22; alt = limitar(tBase - (Q.y + 76), 90, 190); xt = conteudoD - alt * .5;
    }
    // a linha atravessa por cima e chega à árvore pela esquerda; o lado direito fica livre para os ramos descerem
    const yC = Q.y + (celular ? 26 : 40);
    const gx = celular ? xt - 44 : xt - alt * .62;
    const dir = gx > xDesce ? 1 : -1;
    const meio = tBase - alt * .48;
    peca([`M ${xDesce} ${Q.y + 10} C ${xDesce} ${yC}, ${xDesce + 30 * dir} ${yC}, ${xDesce + 60 * dir} ${yC} L ${gx - 40 * dir} ${yC} C ${gx - 10 * dir} ${yC}, ${gx} ${yC + 6}, ${gx} ${yC + 30} L ${gx} ${tBase - 24}`],
      Q.y + 10, tBase - 24, Math.abs(gx - xDesce) > 200 ? 220 : 60);
    peca([`M ${gx} ${tBase - 24} C ${gx} ${tBase}, ${gx + 10} ${tBase}, ${gx + 24} ${tBase} L ${xt - 10} ${tBase} C ${xt - 3} ${tBase}, ${xt} ${tBase - 3}, ${xt} ${tBase - 12} L ${xt} ${meio}`,
      { d: `M ${xt - 2} ${tBase} L ${xt + (celular ? 22 : 44)} ${tBase}`, atraso: .3 }],
      tBase - 24, tBase + 30, celular ? 90 : 140);
    const r = celular ? 2.4 : 3.2;
    const pontas = {
      e: [xt - alt * .38, tBase - alt * .74], d: [xt + alt * .36, tBase - alt * .7], c: [xt + alt * .02, tBase - alt * .96],
      e2: [xt - alt * .24, tBase - alt * .95], d2: [xt + alt * .22, tBase - alt * .93]
    };
    const ramos = [
      `M ${xt} ${meio} Q ${xt - alt * .1} ${tBase - alt * .62}, ${pontas.e[0]} ${pontas.e[1]}`,
      `M ${xt} ${meio} Q ${xt + alt * .1} ${tBase - alt * .6}, ${pontas.d[0]} ${pontas.d[1]}`,
      `M ${xt} ${meio} C ${xt - alt * .04} ${tBase - alt * .7}, ${xt + alt * .04} ${tBase - alt * .8}, ${pontas.c[0]} ${pontas.c[1]}`,
      { d: `M ${xt - alt * .2} ${tBase - alt * .66} Q ${xt - alt * .22} ${tBase - alt * .82}, ${pontas.e2[0]} ${pontas.e2[1]}`, atraso: .35 },
      { d: `M ${xt + alt * .19} ${tBase - alt * .63} Q ${xt + alt * .22} ${tBase - alt * .8}, ${pontas.d2[0]} ${pontas.d2[1]}`, atraso: .35 },
      ...Object.values(pontas).map(([x, y]) => ({ d: circulo(x, y - r, r), atraso: .6 }))
    ];
    peca(ramos, tBase + 30, tBase + 31, celular ? 120 : 200);

    /* ---------- 5. Contato: os ramos se unem numa moldura em volta do convite ---------- */
    const info = pos($('.agendar-info')), st = pos($('#status'));
    const rr = celular ? 10 : 14;
    const fl = celular ? 12 : info.x - 22, fr = celular ? W - 12 : info.r + 26;
    const ft = info.y - (celular ? 24 : 30), fb = st.b + 15, cx = (fl + fr) / 2;
    const xB = xr - (celular ? 8 : 11);
    const tipA = [pontas.d[0], pontas.d[1] - 2 * r], tipB = [pontas.c[0], pontas.c[1] - 2 * r];
    peca([
      `M ${tipA[0]} ${tipA[1]} C ${tipA[0] + 40} ${tipA[1] - 10}, ${xr} ${tipA[1]}, ${xr} ${tipA[1] + 60} L ${xr} ${ft - 50}`,
      `M ${tipB[0]} ${tipB[1]} C ${tipB[0] + 30} ${tipB[1] - 40}, ${xB} ${tipB[1] - 20}, ${xB} ${tipB[1] + 50} L ${xB} ${ft - 40}`
    ], tBase + 31, ft - 50);
    let molduraA, molduraB;
    if (celular) {
      // A (externo, à direita) vira o lado direito; B atravessa por cima e desce pela esquerda
      molduraA = `M ${xr} ${ft - 50} L ${xr} ${fb - rr} Q ${xr} ${fb}, ${xr - rr} ${fb} L ${cx} ${fb}`;
      molduraB = `M ${xB} ${ft - 40} C ${xB} ${ft}, ${xB - 14} ${ft}, ${xB - 30} ${ft} L ${fl + rr} ${ft} Q ${fl} ${ft}, ${fl} ${ft + rr} L ${fl} ${fb - rr} Q ${fl} ${fb}, ${fl + rr} ${fb} L ${cx} ${fb}`;
    } else {
      // A atravessa por cima e desce pela esquerda; B corre paralelo e desce pela direita
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
    // o nó fica amarrado por um instante e depois se desfaz conforme a rolagem
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

    // nó: desfaz conforme a rolagem avança (e volta a se amarrar ao subir)
    const u = reduzir ? 1 : limitar((alvoSuave - no.desatar[0]) / (no.desatar[1] - no.desatar[0]), 0, 1);
    const uSuave = u * u * (3 - 2 * u);
    if (Math.abs(uSuave - no.u) > .001) {
      no.el.setAttribute('d', caminhoNo(no.kx, no.ky, no.s, uSuave));
      no.el.comp = no.el.getTotalLength(); no.el.style.strokeDasharray = no.el.comp;
      no.u = uSuave;
    }

    let pontaXY = null;
    pecas.forEach(p => {
      let f = limitar((alvoSuave - p.y0) / (p.y1 - p.y0), 0, 1);
      if (p.abertura && !reduzir) f = Math.max(f, 0) * introducao;
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
