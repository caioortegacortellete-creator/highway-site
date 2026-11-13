/* =========================================================
   HIGHWAY · KM TESTE · Pista dos sites
   A ideia da esteira de sushi, em versão pista de corrida: os sites conceito
   correm numa pista oval em perspectiva. Passar o mouse para a pista e levanta
   o site, arrastar gira a pista, clicar abre o site de verdade no visor.
   ========================================================= */
(() => {
  "use strict";
  const palco = document.getElementById("pistaPalco");
  if (!palco) return;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const reduz = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const NV = { 1: ["Nível 1 · Essencial", "R$ 597,90"], 2: ["Nível 2 · Profissional", "R$ 997,90"], 3: ["Nível 3 · Premium", "R$ 1.297,90"] };
  const sites = $$(".cf-card").map((c) => ({ href: c.getAttribute("href"), nome: c.dataset.nome, local: c.dataset.local, nivel: +c.dataset.nivel, img: $("img", c).getAttribute("src") }));
  const n = sites.length;
  if (!n) return;

  const svg = $("#pistaSvg"), info = $("#pistaInfo");
  const textoPadrao = info.innerHTML;
  const cards = sites.map((s, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = `pc-card nv${s.nivel}`;
    b.dataset.i = i;
    b.tabIndex = i === 0 ? 0 : -1;
    b.setAttribute("aria-label", `${s.nome}, ${NV[s.nivel][0]}, ${NV[s.nivel][1]}. Abrir o site`);
    b.innerHTML = `<span class="pc-sombra" aria-hidden="true"></span><span class="pc-lift"><img src="${s.img}" alt="" draggable="false" loading="lazy"><span class="pc-selo" aria-hidden="true">N${s.nivel}</span><span class="pc-chip" aria-hidden="true">${s.nome} · ${NV[s.nivel][1]}</span></span>`;
    palco.appendChild(b);
    return b;
  });
  const lifts = cards.map((c) => $(".pc-lift", c)), imgs = cards.map((c) => $("img", c));

  /* ---------- geometria: pista oval (estádio) em perspectiva ---------- */
  const SPACING = 1.55, CURVE = 1.0, BAND = 1.05, TILT = 0.62, AR = 0.625;
  const along = (g, u) => {
    const { s, r } = g;
    let t = ((u % g.l) + g.l) % g.l;
    if (t < s) return { x: s / 2 - t, z: r, nx: 0, nz: 1 };
    t -= s;
    const arc = Math.PI * r;
    if (t < arc) { const f = t / r, sn = Math.sin(f), cs = Math.cos(f); return { x: -s / 2 - r * sn, z: r * cs, nx: -sn, nz: cs }; }
    t -= arc;
    if (t < s) return { x: -s / 2 + t, z: -r, nx: 0, nz: -1 };
    t -= s;
    const f = Math.min(Math.PI, t / r), sn = Math.sin(f), cs = Math.cos(f);
    return { x: s / 2 + r * sn, z: -r * cs, nx: sn, nz: -cs };
  };
  const project = (g, x, z) => { const k = g.a + g.b * z; return { x: g.cx + x * k, y: g.ym + TILT * (g.a * z + (g.b * z * z) / 2), k }; };
  const makeGeo = (width, d, kb) => {
    const l = n * SPACING * d, r = Math.min(CURVE * d, l / (2 * Math.PI)), s = Math.max(0, (l - 2 * Math.PI * r) / 2);
    const g = { width, d, h: d * AR, r, s, l, pitch: l / n, kb, cx: width / 2, ym: 0, a: (1 + kb) / 2, b: (1 - kb) / (2 * r), band: BAND * d, side: Math.max(5, d * 0.09) };
    let top = Infinity, bottom = -Infinity;
    for (let j = 0; j < 120; j++) {
      const p = along(g, (j / 120) * l);
      const rim = project(g, p.x + (p.nx * g.band) / 2, p.z + (p.nz * g.band) / 2), pl = project(g, p.x, p.z);
      top = Math.min(top, rim.y, pl.y - g.h * pl.k * 1.14 - 34);
      bottom = Math.max(bottom, rim.y + g.side + 8, pl.y + g.d * 0.08);
    }
    g.ym = Math.ceil(-top) + 2;
    g.height = Math.ceil(bottom - top) + 4;
    return g;
  };
  const halfSpan = (g) => {
    let span = 0;
    for (let j = 0; j < 120; j++) {
      const p = along(g, (j / 120) * g.l);
      const rim = project(g, p.x + (p.nx * g.band) / 2, p.z + (p.nz * g.band) / 2), pl = project(g, p.x, p.z);
      span = Math.max(span, Math.abs(rim.x - g.cx) + 4, Math.abs(pl.x - g.cx) + (pl.k * g.d * 1.1) / 2);
    }
    return span;
  };
  const borda = (g, off) => {
    let d = "";
    for (let j = 0; j < 168; j++) { const p = along(g, (j / 168) * g.l), q = project(g, p.x + p.nx * off, p.z + p.nz * off); d += `${j ? "L" : "M"}${q.x.toFixed(1)} ${q.y.toFixed(1)}`; }
    return d + "Z";
  };

  let g = null;
  const desenharPista = () => {
    const ext = borda(g, g.band / 2), int = borda(g, -g.band / 2), meio = borda(g, 0), ilha = borda(g, -g.band / 2 - g.d * 0.06);
    const p0 = along(g, g.s / 2), a = project(g, p0.x, p0.z + g.band / 2), b = project(g, p0.x, p0.z - g.band / 2);
    const lx = Math.max(6, g.d * 0.07);
    svg.setAttribute("width", g.width); svg.setAttribute("height", g.height); svg.setAttribute("viewBox", `0 0 ${g.width} ${g.height}`);
    svg.innerHTML = `
      <defs>
        <pattern id="pGrade" width="22" height="22" patternUnits="userSpaceOnUse"><path d="M22 0H0V22" fill="none" stroke="rgba(179,80,255,.18)" stroke-width="1"/></pattern>
        <pattern id="pXadrez" width="${lx}" height="${lx}" patternUnits="userSpaceOnUse"><rect width="${lx}" height="${lx}" fill="#eef1ff"/><rect width="${lx / 2}" height="${lx / 2}" fill="#05060f"/><rect x="${lx / 2}" y="${lx / 2}" width="${lx / 2}" height="${lx / 2}" fill="#05060f"/></pattern>
        <linearGradient id="gAsf" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#14173a"/><stop offset="1" stop-color="#0d1030"/></linearGradient>
        <filter id="fBrilho" x="-10%" y="-30%" width="120%" height="160%"><feGaussianBlur stdDeviation="3"/></filter>
      </defs>
      <path d="${ext}" transform="translate(0 ${(g.side + g.d * 0.08).toFixed(1)})" fill="#000" opacity=".55" filter="url(#fBrilho)"/>
      <path d="${ext}${int}" fill-rule="evenodd" transform="translate(0 ${g.side.toFixed(1)})" fill="#070820"/>
      <path d="${ext}${int}" fill-rule="evenodd" fill="url(#gAsf)"/>
      <path d="${meio}" fill="none" stroke="rgba(238,241,255,.5)" stroke-width="${Math.max(1.2, g.d * 0.014).toFixed(1)}" stroke-dasharray="${(g.d * 0.16).toFixed(1)} ${(g.d * 0.14).toFixed(1)}"/>
      <path d="${ext}" fill="none" stroke="#29ecff" stroke-width="${Math.max(2, g.d * 0.022).toFixed(1)}" filter="url(#fBrilho)" opacity=".9"/>
      <path d="${ext}" fill="none" stroke="#29ecff" stroke-width="${Math.max(1.4, g.d * 0.014).toFixed(1)}"/>
      <path d="${int}" fill="none" stroke="#ff3df2" stroke-width="${Math.max(2, g.d * 0.02).toFixed(1)}" filter="url(#fBrilho)" opacity=".9"/>
      <path d="${int}" fill="none" stroke="#ff3df2" stroke-width="${Math.max(1.2, g.d * 0.012).toFixed(1)}"/>
      <path d="${ilha}" fill="#06071a"/>
      <path d="${ilha}" fill="url(#pGrade)"/>
      <polygon points="${(a.x - lx * a.k / 2).toFixed(1)},${a.y.toFixed(1)} ${(a.x + lx * a.k / 2).toFixed(1)},${a.y.toFixed(1)} ${(b.x + lx * b.k / 2).toFixed(1)},${b.y.toFixed(1)} ${(b.x - lx * b.k / 2).toFixed(1)},${b.y.toFixed(1)}" fill="url(#pXadrez)" opacity=".9"/>
      <text x="${g.cx}" y="${(g.ym + 4).toFixed(1)}" text-anchor="middle" dominant-baseline="middle" class="pista-marca" style="font-size:${(g.d * 0.36).toFixed(0)}px">HIGHWAY</text>`;
  };

  /* ---------- estado e física ---------- */
  const CRUZEIRO = reduz ? 0 : 46;
  const st = { off: 0, v: 0, alvo: null, ativo: null, pausa: false, auto: !reduz, lift: new Array(n).fill(0), raf: 0, last: 0, visivel: true, centro: 0 };
  const pose = (i) => { const p = along(g, st.off - i * g.pitch), q = project(g, p.x, p.z); return { x: q.x, y: q.y, k: q.k, prof: (p.z + g.r) / (2 * g.r) }; };
  const centroDe = () => ((Math.round((st.off - g.s / 2) / g.pitch) % n) + n) % n;

  const pintar = () => {
    if (!g) return;
    for (let i = 0; i < n; i++) {
      const q = pose(i), e = st.lift[i];
      cards[i].style.transform = `translate3d(${(q.x - g.d / 2).toFixed(2)}px,${(q.y - g.h).toFixed(2)}px,0) scale(${q.k.toFixed(4)})`;
      cards[i].style.zIndex = i === st.ativo ? 2000 : 100 + Math.round(q.y);
      lifts[i].style.transform = `translateY(${(-14 * e).toFixed(2)}%) scale(${(1 + 0.1 * e).toFixed(4)})`;
      imgs[i].style.filter = `brightness(${(0.62 + 0.38 * clamp(q.prof + e, 0, 1)).toFixed(3)})`;
    }
    const c = centroDe();
    if (c !== st.centro) { st.centro = c; cards.forEach((b, i) => { b.tabIndex = i === (st.ativo ?? c) ? 0 : -1; }); }
  };

  const tick = (agora) => {
    st.raf = 0;
    if (!g || !st.visivel) { st.last = 0; return; }
    const dt = st.last ? clamp((agora - st.last) / 1000, 0, 0.05) : 1 / 60;
    st.last = agora;
    if (st.alvo !== null) {
      const w = 5.4;
      st.v += (w * w * (st.alvo - st.off) - 2 * w * st.v) * dt;
      st.off += st.v * dt;
      if (Math.abs(st.alvo - st.off) < 0.3 && Math.abs(st.v) < 4) { st.off = st.alvo; st.v = 0; st.alvo = null; }
    } else if (!arraste.ativo) {
      const parar = st.pausa || st.ativo !== null;
      const alvoV = parar ? 0 : CRUZEIRO;
      st.v += (alvoV - st.v) * Math.min(1, dt * (Math.abs(st.v - alvoV) > 120 ? 1.4 : 3));
      if (Math.abs(st.v) < 0.05 && parar) st.v = 0;
      st.off += st.v * dt;
    }
    let ocupado = st.alvo !== null || st.v !== 0 || (!st.pausa && st.ativo === null && CRUZEIRO > 0) || arraste.ativo;
    for (let i = 0; i < n; i++) {
      const alvo = i === st.ativo ? 1 : 0;
      st.lift[i] += (alvo - st.lift[i]) * Math.min(1, dt * (reduz ? 60 : 9));
      if (Math.abs(alvo - st.lift[i]) > 0.002) ocupado = true; else st.lift[i] = alvo;
    }
    pintar();
    if (ocupado) st.raf = requestAnimationFrame(tick); else st.last = 0;
  };
  const acordar = () => { if (!st.raf && st.visivel) { st.last = 0; st.raf = requestAnimationFrame(tick); } };

  const mostrarInfo = (i) => {
    if (i === null) { info.innerHTML = textoPadrao; return; }
    const s = sites[i];
    info.innerHTML = `<p class="pi-nv nv${s.nivel}">${NV[s.nivel][0]}</p><p class="pi-nome">${s.nome} <span>· ${NV[s.nivel][1]}</span></p><p class="pi-local">${s.local} · Projeto conceito. Clique para abrir o site.</p>`;
  };
  const ativar = (i) => {
    if (st.ativo === i) return;
    st.ativo = i;
    cards.forEach((b, k) => b.classList.toggle("ativo", k === i));
    mostrarInfo(i);
    acordar();
  };
  const pararAuto = () => { st.auto = false; };
  const irPara = (i, foco) => {
    i = ((i % n) + n) % n;
    pararAuto();
    const base = g.s / 2 + i * g.pitch;
    st.alvo = base + Math.round((st.off - base) / g.l) * g.l;
    if (reduz) { st.off = st.alvo; st.alvo = null; st.v = 0; }
    ativar(i);
    if (foco) cards[i].focus({ preventScroll: true });
    acordar();
  };
  const abrir = (i) => {
    const s = sites[i];
    if (window.HighwayAbrirSite) window.HighwayAbrirSite(s.href);
    else window.open(s.href, "_blank", "noopener");
  };

  /* ---------- interações ---------- */
  const arraste = { id: -1, x: 0, off0: 0, faixa: 1, moveu: false, ultX: 0, ultT: 0, vel: 0, ativo: false };
  cards.forEach((b, i) => {
    b.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse" && !arraste.ativo) { pararAuto(); ativar(i); } });
    b.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse" && st.ativo === i && !b.matches(":focus-visible")) ativar(null); });
    b.addEventListener("focus", () => { if (arraste.id < 0) { pararAuto(); ativar(i); } });
    b.addEventListener("blur", () => { if (st.ativo === i) ativar(null); });
    b.addEventListener("click", (e) => {
      if (arraste.moveu) { e.preventDefault(); return; }
      if (e.pointerType === "touch" || (e.detail && matchMedia("(pointer: coarse)").matches)) { if (st.ativo !== i) { pararAuto(); ativar(i); return; } }
      abrir(i);
    });
    b.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") { e.preventDefault(); irPara(i + (e.key === "ArrowRight" ? 1 : -1), true); }
    });
  });
  palco.addEventListener("pointerdown", (e) => {
    if (e.button !== 0 || !g) return;
    const r = palco.getBoundingClientRect();
    Object.assign(arraste, { id: e.pointerId, x: e.clientX, off0: st.off, faixa: e.clientY - r.top >= g.ym ? 1 : -1, moveu: false, ultX: e.clientX, ultT: e.timeStamp, vel: 0, ativo: false });
  });
  palco.addEventListener("pointermove", (e) => {
    if (arraste.id !== e.pointerId) return;
    const dx = e.clientX - arraste.x;
    if (!arraste.moveu && Math.abs(dx) > 6) { arraste.moveu = true; arraste.ativo = true; pararAuto(); st.alvo = null; ativar(null); palco.setPointerCapture(e.pointerId); palco.classList.add("arrastando"); }
    if (!arraste.moveu) return;
    const esc = arraste.faixa > 0 ? 1 : 1 / g.kb;
    const v = (e.clientX - arraste.ultX) / Math.max(1, e.timeStamp - arraste.ultT);
    arraste.vel = arraste.vel * 0.6 + v * 0.4; arraste.ultX = e.clientX; arraste.ultT = e.timeStamp;
    st.off = arraste.off0 - arraste.faixa * dx * esc;
    st.v = reduz ? 0 : -arraste.faixa * arraste.vel * 1000 * esc;
    acordar();
  });
  const soltar = (e) => {
    if (arraste.id !== e.pointerId) return;
    arraste.id = -1;
    if (palco.hasPointerCapture(e.pointerId)) palco.releasePointerCapture(e.pointerId);
    palco.classList.remove("arrastando");
    if (arraste.ativo) {
      arraste.ativo = false;
      const resto = Math.exp(-Math.max(0, e.timeStamp - arraste.ultT) / 70);
      st.v = reduz ? 0 : clamp(st.v * resto, -1400, 1400);
      acordar();
      setTimeout(() => { arraste.moveu = false; }, 0);
    }
  };
  palco.addEventListener("pointerup", soltar);
  palco.addEventListener("pointercancel", soltar);

  const btnPausa = $("#pistaPausa");
  $("#pistaAnt").addEventListener("click", () => irPara((st.ativo ?? st.centro) - 1, false));
  $("#pistaProx").addEventListener("click", () => irPara((st.ativo ?? st.centro) + 1, false));
  btnPausa.addEventListener("click", () => {
    pararAuto();
    st.pausa = !st.pausa;
    btnPausa.setAttribute("aria-pressed", String(st.pausa));
    btnPausa.setAttribute("aria-label", st.pausa ? "Continuar a pista" : "Pausar a pista");
    btnPausa.classList.toggle("pausado", st.pausa);
    acordar();
  });

  /* modo automático: destaca um site de cada vez até a pessoa interagir */
  let ultAuto = null;
  setInterval(() => {
    if (!st.auto || !st.visivel || st.pausa || !g || document.hidden) return;
    const i = ultAuto === null ? centroDe() : (ultAuto + 1) % n;
    ultAuto = i;
    const base = g.s / 2 + i * g.pitch;
    st.alvo = base + Math.round((st.off - base) / g.l) * g.l;
    ativar(i);
    acordar();
    setTimeout(() => { if (st.auto && st.ativo === i) ativar(null); }, 1600);
  }, 3400);

  /* ---------- tamanho e visibilidade ---------- */
  const medir = () => {
    const W = Math.round(palco.clientWidth);
    if (!W) return;
    const kb = W < 480 ? 0.58 : 0.66;
    const span = halfSpan(makeGeo(1000, 100, kb)) / 100;
    const d = Math.round(clamp((W - 8) / (2 * span), 40, 190));
    const antigo = g;
    g = makeGeo(W, d, kb);
    if (antigo && antigo.l) st.off *= g.l / antigo.l; else st.off = g.s / 2 - g.pitch * 0.4;
    palco.style.height = g.height + "px";
    cards.forEach((b) => { b.style.width = g.d + "px"; b.style.height = g.h + "px"; });
    desenharPista();
    pintar();
    acordar();
  };
  new ResizeObserver(medir).observe(palco);
  medir();
  if ("IntersectionObserver" in window) {
    new IntersectionObserver((es) => { st.visivel = es.some((x) => x.isIntersecting); if (st.visivel) acordar(); }).observe(palco);
  }
})();
