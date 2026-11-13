/* =========================================================
   HIGHWAY AGÊNCIA · rodovia 3D que atravessa o site inteiro
   Three.js (r128, cdnjs). A câmera "dirige" pela estrada conforme a rolagem:
   cada seção do site é um trecho da viagem, com o seu cenário.
   ========================================================= */
(() => {
  "use strict";
  const THREE = window.THREE;
  const raiz = document.documentElement;
  const cv = document.getElementById("estrada3d");
  if (!THREE || !cv) { raiz.classList.add("sem-3d"); return; }

  const reduz = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const leve = matchMedia("(max-width: 900px)").matches || matchMedia("(pointer: coarse)").matches;
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: !leve, alpha: true, powerPreference: "high-performance" });
  } catch (e) { raiz.classList.add("sem-3d"); return; }
  raiz.classList.add("com-3d");
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, leve ? 1.25 : 1.75));
  renderer.setClearColor(0x000000, 0);

  const $ = (s) => document.querySelector(s);
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const rnd = (a, b) => a + Math.random() * (b - a);
  const COR = { c: 0x29ecff, m: 0xff3df2, r: 0xb350ff, a: 0xffb84d, v: 0x3dffa2 };

  const cena = new THREE.Scene();
  const NEVOA = 0x150a33;
  const DENS_NEVOA = leve ? 0.0105 : 0.0088;
  cena.fog = new THREE.FogExp2(NEVOA, DENS_NEVOA);
  const cam = new THREE.PerspectiveCamera(62, 1, 0.1, 1200);

  /* ---------- texturas desenhadas em canvas ---------- */
  const tela = (w, h, fn) => { const c = document.createElement("canvas"); c.width = w; c.height = h; fn(c.getContext("2d"), w, h); return c; };
  const textura = (c, rep) => { const t = new THREE.CanvasTexture(c); if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; } t.anisotropy = 4; return t; };
  const texHalo = textura(tela(64, 64, (g, w) => {
    const r = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
    r.addColorStop(0, "rgba(255,255,255,.9)"); r.addColorStop(0.12, "rgba(255,255,255,.55)"); r.addColorStop(0.4, "rgba(255,255,255,.12)"); r.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = r; g.fillRect(0, 0, w, w);
  }));
  const texBrilho = textura(tela(64, 64, (g, w) => {
    const r = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
    r.addColorStop(0, "rgba(255,255,255,1)"); r.addColorStop(0.25, "rgba(255,255,255,.55)"); r.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = r; g.fillRect(0, 0, w, w);
  }));
  const LARG = 16;
  const texAsfalto = textura(tela(256, 256, (g, w, h) => {
    g.fillStyle = "#0b0d22"; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 1400; i++) { g.fillStyle = `rgba(150,160,255,${Math.random() * 0.05})`; g.fillRect(Math.random() * w, Math.random() * h, 1.5, 1.5); }
    g.fillStyle = "rgba(238,241,255,.85)"; [0.25, 0.75].forEach((u) => g.fillRect(u * w - 2, 0, 4, h * 0.5));
    g.fillStyle = "#b350ff"; g.fillRect(w * 0.5 - 6, 0, 3, h); g.fillRect(w * 0.5 + 3, 0, 3, h);
    g.fillStyle = "#29ecff"; g.fillRect(4, 0, 4, h);
    g.fillStyle = "#ff3df2"; g.fillRect(w - 8, 0, 4, h);
  }), true);
  const texJanelas = textura(tela(64, 128, (g, w, h) => {
    g.fillStyle = "#0a0b24"; g.fillRect(0, 0, w, h);
    const cores = ["255,184,77", "255,184,77", "255,214,150", "41,236,255", "255,61,242", "220,230,255"];
    for (let y = 4; y < h - 4; y += 8) for (let x = 4; x < w - 4; x += 7) {
      if (Math.random() < 0.34) { g.fillStyle = `rgba(${cores[(Math.random() * cores.length) | 0]},${rnd(0.4, 0.95)})`; g.fillRect(x, y, 3, 4); }
    }
    g.fillStyle = "rgba(41,236,255,.5)"; g.fillRect(0, 0, w, 1.5);
  }));
  const texGrade = textura(tela(128, 128, (g, w) => {
    g.fillStyle = "#05061a"; g.fillRect(0, 0, w, w);
    g.strokeStyle = "rgba(179,80,255,.22)"; g.lineWidth = 1.5; g.strokeRect(0, 0, w, w);
  }), true);
  const texDegrade = textura(tela(4, 64, (g, w, h) => {
    const l = g.createLinearGradient(0, 0, 0, h); l.addColorStop(0, "rgba(255,255,255,1)"); l.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = l; g.fillRect(0, 0, w, h);
  }));

  /* ---------- o traçado: um trecho por seção ---------- */
  /* min/max: espaço mínimo que o cenário de cada trecho precisa (rampa, outdoors, pedágio, túnel...) */
  const TRECHOS = [
    { sel: "#hero", L: 170, giro: 0, sobe: 0, tema: "cidade", fixo: true },
    { sel: "#caminho", giro: -60, sobe: 0, tema: "curva", min: 50 },
    { sel: ".nichos", giro: 0, sobe: 0, tema: "portico", min: 24 },
    { sel: "#portfolio", giro: 0, sobe: 0, tema: "outdoors", min: 100 },
    { sel: "#pista", giro: 45, sobe: 18, tema: "rampa", min: 64 },
    { sel: "#planos", giro: 0, sobe: 0, tema: "pedagio", min: 50 },
    { sel: "#quiz", giro: -70, sobe: 0, tema: "elevado", min: 50 },
    { sel: "#como-funciona", giro: 0, sobe: -18, tema: "descida", min: 64 },
    { sel: ".porque", giro: 35, sobe: 0, tema: "tunel", min: 50 },
    { sel: "#equipe", giro: 0, sobe: 0, tema: "passarela", min: 70 },
    { sel: "#duvidas", giro: 0, sobe: 0, tema: "praca", min: 60 },
    { sel: "#contato", giro: 0, sobe: 0, tema: "chegada", min: 44 },
    { sel: ".rodape", L: 120, giro: 0, sobe: 0, tema: "chegada", fixo: true }
  ];
  /* comprimento de cada trecho = rolagem que a seção ocupa × RITMO (com o limite de velocidade da câmera,
     a estrada acompanha a rolagem e cada cenário chega junto com a sua seção) */
  const RITMO = 0.03;
  {
    try { if (window.ScrollTrigger) window.ScrollTrigger.refresh(); } catch (e) { /* segue com o layout atual */ }
    const sy = window.scrollY, fimDoc = document.documentElement.scrollHeight;
    const topo = (sel) => { const el = document.querySelector(sel); return el ? el.getBoundingClientRect().top + sy : null; };
    const tops = TRECHOS.map((tr) => topo(tr.sel));
    TRECHOS.forEach((tr, i) => {
      if (tr.fixo) return;
      let prox = null;
      for (let k = i + 1; k < TRECHOS.length && prox === null; k++) prox = tops[k];
      const span = tops[i] === null ? 0 : Math.max(0, (prox === null ? fimDoc : prox) - tops[i]);
      tr.L = Math.round(clamp(span * RITMO, tr.min, 260) / 2) * 2;
    });
  }
  const PASSO = 2;
  const A = [];
  {
    let x = 0, y = 0, z = 0, h = 0, d = 0;
    TRECHOS.forEach((tr, i) => {
      tr.ini = d;
      const n = Math.round(tr.L / PASSO), y0 = y, giro = (tr.giro * Math.PI) / 180;
      for (let k = 0; k < n; k++) {
        const f = (k + 0.5) / n;
        A.push({ x, y, z, h, d, i });
        h += (giro * (Math.PI / 2) * Math.sin(Math.PI * f)) / n;
        x += Math.sin(h) * PASSO; z -= Math.cos(h) * PASSO;
        const s = (k + 1) / n; y = y0 + tr.sobe * s * s * (3 - 2 * s);
        d += PASSO;
      }
      tr.fim = d;
    });
    A.push({ x, y, z, h, d, i: TRECHOS.length - 1 });
  }
  const TOTAL = A[A.length - 1].d;
  const D_POUSO = 120;
  const em = (d) => {
    d = clamp(d, 0, TOTAL - 0.001);
    const i = Math.floor(d / PASSO), f = d / PASSO - i, a = A[i], b = A[Math.min(i + 1, A.length - 1)];
    return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f, z: a.z + (b.z - a.z) * f, h: a.h + (b.h - a.h) * f, i: a.i };
  };
  const lado = (p, off, alt = 0) => new THREE.Vector3(p.x + Math.cos(p.h) * off, p.y + alt, p.z + Math.sin(p.h) * off);
  const anguloFrente = (h, ladoSinal = 0, abre = 0) => {
    const nx = -Math.sin(h) * Math.cos(abre) - ladoSinal * Math.cos(h) * Math.sin(abre);
    const nz = Math.cos(h) * Math.cos(abre) - ladoSinal * Math.sin(h) * Math.sin(abre);
    return Math.atan2(nx, nz);
  };

  /* ---------- faixas ao longo do traçado ---------- */
  const fita = (off0, off1, alt, mat, escalaV, cond) => {
    const pos = [], uv = [], idx = [];
    let n = 0;
    A.forEach((p, i) => {
      const ok = !cond || cond(p);
      const c = Math.cos(p.h), s = Math.sin(p.h);
      pos.push(p.x + c * off0, p.y + alt, p.z + s * off0, p.x + c * off1, p.y + alt, p.z + s * off1);
      uv.push(0, p.d / escalaV, 1, p.d / escalaV);
      if (i < A.length - 1 && ok) idx.push(n, n + 2, n + 1, n + 1, n + 2, n + 3);
      n += 2;
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx);
    const m = new THREE.Mesh(g, mat); m.frustumCulled = false; cena.add(m); return m;
  };
  const parede = (off, alt0, alt1, mat, cond) => {
    const pos = [], uv = [], idx = [];
    let n = 0;
    A.forEach((p, i) => {
      const ok = !cond || cond(p);
      const c = Math.cos(p.h), s = Math.sin(p.h);
      pos.push(p.x + c * off, p.y + alt0, p.z + s * off, p.x + c * off, p.y + alt1, p.z + s * off);
      uv.push(p.d / 8, 1, p.d / 8, 0);
      if (i < A.length - 1 && ok) idx.push(n, n + 2, n + 1, n + 1, n + 2, n + 3);
      n += 2;
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx);
    const m = new THREE.Mesh(g, mat); m.frustumCulled = false; cena.add(m); return m;
  };
  const aditivo = (cor, op = 1, map = null) => new THREE.MeshBasicMaterial({ color: cor, transparent: true, opacity: op, map, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });

  /* chão com grade e a pista */
  const texGradeChao = texGrade.clone(); texGradeChao.needsUpdate = true; texGradeChao.repeat.set(260, 260);
  const chao = new THREE.Mesh(new THREE.PlaneGeometry(5200, 5200), new THREE.MeshBasicMaterial({ map: texGradeChao }));
  chao.rotation.x = -Math.PI / 2; chao.position.set(A[A.length >> 1].x, -0.15, A[A.length >> 1].z); cena.add(chao);
  fita(-LARG / 2, LARG / 2, 0, new THREE.MeshBasicMaterial({ map: texAsfalto, side: THREE.DoubleSide }), 14);
  fita(-LARG / 2 - 0.9, -LARG / 2 + 0.6, 0.03, aditivo(COR.c, 0.28));
  fita(LARG / 2 - 0.6, LARG / 2 + 0.9, 0.03, aditivo(COR.m, 0.28));
  /* acostamento e mureta com filete neon */
  const matMureta = new THREE.MeshBasicMaterial({ color: 0x0d1030, side: THREE.DoubleSide });
  const fora = (p) => TRECHOS[p.i].tema !== "tunel";
  parede(-LARG / 2 - 1.2, 0, 0.95, matMureta);
  parede(LARG / 2 + 1.2, 0, 0.95, matMureta);
  fita(-LARG / 2 - 1.35, -LARG / 2 - 1.05, 0.97, aditivo(COR.c, 0.9));
  fita(LARG / 2 + 1.05, LARG / 2 + 1.35, 0.97, aditivo(COR.m, 0.9));
  /* elevado: laterais altas de vidro neon */
  const elevado = (p) => p.y > 3;
  parede(-LARG / 2 - 1.2, 0.95, 2.4, aditivo(COR.c, 0.12, texDegrade), elevado);
  parede(LARG / 2 + 1.2, 0.95, 2.4, aditivo(COR.m, 0.12, texDegrade), elevado);
  /* laje do elevado vista de fora */
  parede(-LARG / 2 - 1.2, -1.6, 0, matMureta, elevado);
  parede(LARG / 2 + 1.2, -1.6, 0, matMureta, elevado);

  /* ---------- postes ---------- */
  const caixa = new THREE.BoxGeometry(1, 1, 1);
  const matEscuro = new THREE.MeshBasicMaterial({ color: 0x141838 });
  const tmp = new THREE.Object3D();
  const postes = [], focos = [];
  for (let d = 12; d < TOTAL - 20; d += 14) {
    const p = em(d), tema = TRECHOS[p.i].tema;
    if (tema === "tunel" || tema === "pedagio") continue;
    const s = (Math.round(d / 14) % 2) ? 1 : -1;
    postes.push({ p, s });
  }
  const iPoste = new THREE.InstancedMesh(caixa, matEscuro, postes.length * 2);
  const ptsLamp = [], corLamp = [];
  const iPoca = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: texBrilho, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false }), postes.length);
  postes.forEach(({ p, s }, k) => {
    const base = lado(p, s * (LARG / 2 + 1.9));
    tmp.position.set(base.x, base.y + 4.6, base.z); tmp.rotation.set(0, -p.h, 0); tmp.scale.set(0.28, 9.2, 0.28); tmp.updateMatrix(); iPoste.setMatrixAt(k * 2, tmp.matrix);
    const meio = lado(p, s * (LARG / 2 - 0.2), 9.1);
    tmp.position.copy(meio); tmp.scale.set(4.2, 0.2, 0.22); tmp.updateMatrix(); iPoste.setMatrixAt(k * 2 + 1, tmp.matrix);
    const cabeca = lado(p, s * (LARG / 2 - 2.2), 8.9);
    ptsLamp.push(cabeca.x, cabeca.y, cabeca.z);
    const c = new THREE.Color(s < 0 ? COR.c : COR.m); corLamp.push(c.r, c.g, c.b);
    const chaoL = lado(p, s * (LARG / 2 - 3), 0.05);
    tmp.position.copy(chaoL); tmp.rotation.set(-Math.PI / 2, 0, 0); tmp.scale.set(13, 13, 1); tmp.updateMatrix(); iPoca.setMatrixAt(k, tmp.matrix);
    iPoca.setColorAt(k, c);
  });
  cena.add(iPoste, iPoca);
  const geoLamp = new THREE.BufferGeometry();
  geoLamp.setAttribute("position", new THREE.Float32BufferAttribute(ptsLamp, 3));
  geoLamp.setAttribute("color", new THREE.Float32BufferAttribute(corLamp, 3));
  cena.add(new THREE.Points(geoLamp, new THREE.PointsMaterial({ size: 3.4, map: texBrilho, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })));
  const geoLamp2 = geoLamp.clone();
  cena.add(new THREE.Points(geoLamp2, new THREE.PointsMaterial({ size: 1.1, map: texBrilho, color: 0xffffff, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })));

  /* ---------- prédios ---------- */
  const predios = [];
  const densidade = leve ? 0.55 : 1;
  for (let d = 0; d < TOTAL; d += 5) {
    const p = em(d), tema = TRECHOS[p.i].tema;
    const cidade = tema === "cidade" || tema === "chegada";
    const chance = (cidade ? 0.9 : tema === "outdoors" || tema === "estrada" ? 0.28 : 0.14) * densidade;
    [-1, 1].forEach((s) => {
      if (Math.random() > chance) return;
      const longe = cidade ? rnd(16, 46) : rnd(40, 110);
      const alto = cidade ? rnd(10, tema === "chegada" ? 70 : 46) : rnd(8, 34);
      predios.push({ c: lado(p, s * (LARG / 2 + longe)), h: p.h, w: rnd(6, 14), dp: rnd(6, 14), alto });
    });
  }
  const iPredio = new THREE.InstancedMesh(caixa, new THREE.MeshBasicMaterial({ map: texJanelas }), predios.length);
  predios.forEach((b, k) => {
    tmp.position.set(b.c.x, b.alto / 2 - 0.2, b.c.z); tmp.rotation.set(0, -b.h, 0); tmp.scale.set(b.w, b.alto, b.dp); tmp.updateMatrix();
    iPredio.setMatrixAt(k, tmp.matrix);
    iPredio.setColorAt(k, new THREE.Color().setHSL(0.68 + Math.random() * 0.12, 0.5, rnd(0.55, 0.95)));
  });
  cena.add(iPredio);

  /* luzes da cidade no chão (aparecem de cima do elevado) e estrelas */
  const pontos = (n, fn, tam, op = 1) => {
    const pos = [], cor = [];
    for (let k = 0; k < n; k++) { const r = fn(k); pos.push(r[0], r[1], r[2]); cor.push(r[3], r[4], r[5]); }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute("color", new THREE.Float32BufferAttribute(cor, 3));
    const pts = new THREE.Points(g, new THREE.PointsMaterial({ size: tam, map: texBrilho, vertexColors: true, transparent: true, opacity: op, depthWrite: false, blending: THREE.AdditiveBlending }));
    pts.frustumCulled = false; cena.add(pts); return pts;
  };
  const paleta = [[1, 0.72, 0.3], [1, 0.72, 0.3], [0.16, 0.92, 1], [1, 0.24, 0.95], [0.7, 0.32, 1]];
  pontos(leve ? 1400 : 3200, () => {
    const p = em(Math.random() * TOTAL), s = Math.random() < 0.5 ? -1 : 1, v = lado(p, s * rnd(22, 240), 0);
    const c = paleta[(Math.random() * paleta.length) | 0];
    return [v.x, 0.2, v.z, c[0], c[1], c[2]];
  }, 1.6, 0.9);
  const ceu = pontos(500, () => {
    const a = Math.random() * Math.PI * 2, e = rnd(0.12, 1.2), r = 900;
    const b = rnd(0.5, 1);
    return [Math.cos(a) * Math.cos(e) * r, Math.sin(e) * r, Math.sin(a) * Math.cos(e) * r, b, b, b];
  }, 3, 0.8);
  ceu.material.fog = false;

  /* pilares do elevado */
  const pilares = [];
  for (let d = 0; d < TOTAL; d += 22) { const p = em(d); if (p.y > 3) [-5, 5].forEach((o) => pilares.push({ c: lado(p, o), h: p.h, alt: p.y - 1.6 })); }
  const iPilar = new THREE.InstancedMesh(caixa, matEscuro, Math.max(1, pilares.length));
  pilares.forEach((b, k) => { tmp.position.set(b.c.x, b.alt / 2, b.c.z); tmp.rotation.set(0, -b.h, 0); tmp.scale.set(1.6, b.alt, 1.6); tmp.updateMatrix(); iPilar.setMatrixAt(k, tmp.matrix); });
  cena.add(iPilar);

  /* ---------- placas de cada seção (pórtico sobre a pista) ---------- */
  const placas = [];
  const desenharPlaca = (g, w, h, km, titulo, cor) => {
    g.clearRect(0, 0, w, h);
    g.fillStyle = "rgba(8,10,34,.94)"; g.fillRect(0, 0, w, h);
    g.strokeStyle = cor; g.lineWidth = 6; g.shadowColor = cor; g.shadowBlur = 18; g.strokeRect(8, 8, w - 16, h - 16); g.shadowBlur = 0;
    g.fillStyle = cor; g.font = "500 30px 'JetBrains Mono', monospace"; g.fillText(km, 44, 74);
    g.fillStyle = "#eef1ff"; g.font = "700 74px 'Plus Jakarta Sans', sans-serif"; g.shadowColor = "rgba(238,241,255,.5)"; g.shadowBlur = 10;
    let t = titulo; while (g.measureText(t).width > w - 90 && t.length > 4) t = t.slice(0, -2);
    g.fillText(t === titulo ? t : t + "…", 44, 176); g.shadowBlur = 0;
    g.fillStyle = cor; g.fillRect(w - 150, h - 64, 100, 8);
  };
  const portico = (d, km, titulo, cor) => {
    const p = em(d);
    [-1, 1].forEach((s) => { const b = lado(p, s * (LARG / 2 + 1.6)); const m = new THREE.Mesh(caixa, matEscuro); m.position.set(b.x, b.y + 5.5, b.z); m.rotation.y = -p.h; m.scale.set(0.5, 11, 0.5); cena.add(m); });
    const viga = new THREE.Mesh(caixa, matEscuro); const meio = lado(p, 0, 11); viga.position.copy(meio); viga.rotation.y = -p.h; viga.scale.set(LARG + 4, 0.5, 0.5); cena.add(viga);
    const c = tela(1024, 256, () => {}); const t = textura(c);
    const placa = new THREE.Mesh(new THREE.PlaneGeometry(13, 3.25), new THREE.MeshBasicMaterial({ map: t, transparent: true, side: THREE.DoubleSide }));
    const pos = lado(p, 0, 12.9); placa.position.copy(pos); placa.rotation.y = anguloFrente(p.h); cena.add(placa);
    const brilho = new THREE.Mesh(new THREE.PlaneGeometry(15, 5), aditivo(new THREE.Color(cor).getHex(), 0.18, texBrilho));
    brilho.position.copy(pos); brilho.rotation.y = placa.rotation.y; brilho.translateZ(-0.1); cena.add(brilho);
    placas.push({ c, t, km, titulo, cor });
  };
  const textoKm = (sel, padrao) => {
    const k = $(sel + " .km");
    if (!k) return padrao;
    const b = k.querySelector("b"); const resto = k.textContent.replace(b ? b.textContent : "", "").trim();
    return [b ? b.textContent.trim() : "", resto];
  };
  const coresPlaca = ["#29ecff", "#ff3df2", "#b350ff"];
  TRECHOS.forEach((tr, i) => {
    if (i === 0 || tr.sel === ".rodape" || ["pedagio", "praca", "passarela", "chegada"].includes(tr.tema)) return;
    const [km, titulo] = tr.sel === ".nichos" ? ["PÓRTICO", "Sites sob medida"] : textoKm(tr.sel, ["", tr.tema]);
    portico(tr.ini + 6, km || "", titulo || "", coresPlaca[i % 3]);
  });
  const pintarPlacas = () => placas.forEach((pl) => { desenharPlaca(pl.c.getContext("2d"), 1024, 256, pl.km, pl.titulo, pl.cor); pl.t.needsUpdate = true; });
  pintarPlacas();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(pintarPlacas);

  /* ---------- temas especiais ---------- */
  const trechoDo = (tema) => TRECHOS.find((t) => t.tema === tema);

  /* curvas: placas de seta (chevron) no lado de fora */
  const texSeta = (esq) => textura(tela(128, 64, (g, w, h) => {
    g.fillStyle = "#05060f"; g.fillRect(0, 0, w, h);
    g.strokeStyle = "#ffb84d"; g.lineWidth = 9; g.shadowColor = "#ffb84d"; g.shadowBlur = 12; g.lineJoin = "round";
    for (let k = 0; k < 3; k++) { const x = 22 + k * 34; g.beginPath(); if (esq) { g.moveTo(x + 18, 12); g.lineTo(x, 32); g.lineTo(x + 18, 52); } else { g.moveTo(x, 12); g.lineTo(x + 18, 32); g.lineTo(x, 52); } g.stroke(); }
  }));
  const setaE = texSeta(true), setaD = texSeta(false);
  TRECHOS.forEach((tr) => {
    if (Math.abs(tr.giro) < 40 || tr.tema === "tunel") return;
    const ext = tr.giro < 0 ? 1 : -1;
    for (let d = tr.ini + tr.L * 0.22; d < tr.fim - tr.L * 0.2; d += 9) {
      const p = em(d), b = lado(p, ext * (LARG / 2 + 2.4), 2.2);
      const m = new THREE.Mesh(new THREE.PlaneGeometry(3, 1.5), new THREE.MeshBasicMaterial({ map: tr.giro < 0 ? setaE : setaD, side: THREE.DoubleSide }));
      m.position.copy(b); m.rotation.y = anguloFrente(p.h, ext, 0.15); cena.add(m);
    }
  });

  /* pórtico de LED com os nichos rolando */
  const nichosTr = trechoDo("portico");
  let texLed = null;
  if (nichosTr) {
    const p = em(nichosTr.ini + nichosTr.L * 0.6);
    const c = tela(2048, 128, (g, w, h) => {
      g.fillStyle = "#03040b"; g.fillRect(0, 0, w, h);
      g.font = "700 70px 'Plus Jakarta Sans', sans-serif"; g.textBaseline = "middle";
      const txt = "ADVOCACIA  ·  ESTÉTICA  ·  ÓTICA  ·  ODONTOLOGIA  ·  PSICOLOGIA  ·  SALÃO  ·  CONTABILIDADE  ·  ";
      g.fillStyle = "#ffb84d"; g.shadowColor = "#ffb84d"; g.shadowBlur = 14; g.fillText(txt, 10, h / 2 + 4);
      g.shadowBlur = 0; g.fillStyle = "rgba(3,4,11,.55)";
      for (let x = 0; x < w; x += 6) g.fillRect(x + 4, 0, 2, h);
      for (let y = 0; y < h; y += 6) g.fillRect(0, y + 4, w, 2);
    });
    texLed = textura(c, true); texLed.repeat.set(0.5, 1);
    const led = new THREE.Mesh(new THREE.PlaneGeometry(LARG + 4, 2.4), new THREE.MeshBasicMaterial({ map: texLed, side: THREE.DoubleSide }));
    led.position.copy(lado(p, 0, 8.4)); led.rotation.y = anguloFrente(p.h); cena.add(led);
    [-1, 1].forEach((s) => { const b = lado(p, s * (LARG / 2 + 2)); const m = new THREE.Mesh(caixa, matEscuro); m.position.set(b.x, b.y + 4.5, b.z); m.rotation.y = -p.h; m.scale.set(0.6, 9, 0.6); cena.add(m); });
  }

  /* outdoors do portfólio: os sites conceito, nível por nível */
  const outTr = trechoDo("outdoors");
  if (outTr) {
    const loader = new THREE.TextureLoader();
    const sites = ["estetica-n1", "advocacia-n1", "otica-n1", "estetica-n2", "advocacia-n2", "otica-n2", "estetica-n3", "advocacia-n3", "otica-n3"];
    const corNv = [COR.c, COR.r, COR.m];
    sites.forEach((s, k) => {
      const d = outTr.ini + 14 + k * ((outTr.L - 22) / 9), p = em(d), sl = k % 2 ? 1 : -1;
      const c = lado(p, sl * (LARG / 2 + 13), 9.5), ang = anguloFrente(p.h, sl, 0.5);
      const tex = loader.load(`imagens/prints/${s}-topo.webp`);
      const quadro = new THREE.Mesh(new THREE.PlaneGeometry(15, 9.4), new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide }));
      quadro.position.copy(c); quadro.rotation.y = ang; cena.add(quadro);
      const moldura = new THREE.Mesh(new THREE.PlaneGeometry(16.2, 10.6), aditivo(corNv[Math.floor(k / 3)], 0.85));
      moldura.position.copy(c); moldura.rotation.y = ang; moldura.translateZ(-0.08); cena.add(moldura);
      const halo = new THREE.Mesh(new THREE.PlaneGeometry(26, 18), aditivo(corNv[Math.floor(k / 3)], 0.22, texBrilho));
      halo.position.copy(c); halo.rotation.y = ang; halo.translateZ(-0.2); cena.add(halo);
      [-4, 4].forEach((o) => { const m = new THREE.Mesh(caixa, matEscuro); m.position.copy(c); m.rotation.y = ang; m.translateX(o); m.position.y = (c.y - 4.7) / 2; m.scale.set(0.5, c.y - 4.7, 0.5); cena.add(m); });
    });
  }

  /* pedágio dos planos: três cabines, uma para cada nível */
  const pedTr = trechoDo("pedagio");
  if (pedTr) {
    const p = em(pedTr.ini + pedTr.L * 0.82);
    pedTr.parada = pedTr.ini + pedTr.L * 0.82 - 24;
    const teto = new THREE.Mesh(caixa, matEscuro); teto.position.copy(lado(p, 0, 8)); teto.rotation.y = -p.h; teto.scale.set(LARG + 8, 0.9, 7); cena.add(teto);
    const pintarPedagio = (g, w, h) => {
      g.clearRect(0, 0, w, h); g.fillStyle = "#070920"; g.fillRect(0, 0, w, h);
      [["N1 · ESSENCIAL", "R$ 597,90", "#29ecff"], ["N2 · PROFISSIONAL", "R$ 997,90", "#b350ff"], ["N3 · PREMIUM", "R$ 1.297,90", "#ff3df2"]].forEach(([n, v, cor], k) => {
        const x = k * (w / 3);
        g.strokeStyle = cor; g.lineWidth = 6; g.shadowColor = cor; g.shadowBlur = 20; g.strokeRect(x + 14, 14, w / 3 - 28, h - 28); g.shadowBlur = 0;
        g.fillStyle = cor; g.font = "500 34px 'JetBrains Mono', monospace"; g.fillText(n, x + 44, 90);
        g.fillStyle = "#eef1ff"; g.font = "700 72px 'Plus Jakarta Sans', sans-serif"; g.fillText(v, x + 44, 186);
      });
    };
    const c = tela(1536, 256, pintarPedagio);
    const tPed = textura(c);
    const painel = new THREE.Mesh(new THREE.PlaneGeometry(LARG + 6, (LARG + 6) / 6), new THREE.MeshBasicMaterial({ map: tPed, side: THREE.DoubleSide }));
    painel.position.copy(lado(p, 0, 8)); painel.rotation.y = anguloFrente(p.h); painel.translateZ(3.6); cena.add(painel);
    [-LARG / 3, 0, LARG / 3].forEach((o, k) => {
      const cab = new THREE.Mesh(caixa, new THREE.MeshBasicMaterial({ color: 0x10143a })); cab.position.copy(lado(p, o, 1.6)); cab.rotation.y = -p.h; cab.scale.set(1.6, 3.2, 3); cena.add(cab);
      const luz = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.5), aditivo([COR.c, COR.r, COR.m][k], 1)); luz.position.copy(lado(p, o, 3.4)); luz.rotation.y = anguloFrente(p.h); luz.translateZ(1.55); cena.add(luz);
    });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { pintarPedagio(c.getContext("2d"), 1536, 256); tPed.needsUpdate = true; });
  }

  /* praça de pedágio das perguntas: cobertura, cabines, semáforos e cancelas que levantam quando a câmera chega */
  const pracaTr = trechoDo("praca");
  let cancelas = [], dPraca = 0;
  if (pracaTr) {
    dPraca = pracaTr.ini + pracaTr.L * 0.62;
    pracaTr.parada = dPraca - 30;
    const p = em(dPraca);
    const largura = LARG + 10;
    const cobertura = new THREE.Mesh(caixa, new THREE.MeshBasicMaterial({ color: 0x10143a })); cobertura.position.copy(lado(p, 0, 7.4)); cobertura.rotation.y = -p.h; cobertura.scale.set(largura, 0.7, 6); cena.add(cobertura);
    const filete = new THREE.Mesh(caixa, new THREE.MeshBasicMaterial({ color: COR.c })); filete.position.copy(lado(p, 0, 7.05)); filete.rotation.y = -p.h; filete.translateZ(-3.02); filete.scale.set(largura, 0.12, 0.05); cena.add(filete);
    const desenharPraca = (g, w, h) => {
      g.clearRect(0, 0, w, h); g.fillStyle = "#070920"; g.fillRect(0, 0, w, h);
      g.strokeStyle = "#ffb84d"; g.lineWidth = 6; g.shadowColor = "#ffb84d"; g.shadowBlur = 20; g.strokeRect(10, 10, w - 20, h - 20); g.shadowBlur = 0;
      g.fillStyle = "#ffb84d"; g.font = "800 120px 'Archivo', 'Arial Black', sans-serif"; g.textBaseline = "middle"; g.fillText("PEDÁGIO", 60, h / 2 + 6);
      g.fillStyle = "#eef1ff"; g.font = "600 70px 'Plus Jakarta Sans', sans-serif"; g.fillText("das perguntas", 830, h / 2 + 6);
      ["?", "?", "?", "?"].forEach((t, k) => { const x = 1300 + k * 175; g.strokeStyle = ["#29ecff", "#b350ff", "#ff3df2", "#3dffa2"][k]; g.lineWidth = 7; g.beginPath(); g.arc(x, h / 2, 62, 0, Math.PI * 2); g.stroke(); g.fillStyle = g.strokeStyle; g.font = "800 90px 'Plus Jakarta Sans', sans-serif"; g.textAlign = "center"; g.fillText(t, x, h / 2 + 8); g.textAlign = "left"; });
    };
    const c = tela(2048, 256, desenharPraca);
    const tPlaca = textura(c);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { desenharPraca(c.getContext("2d"), 2048, 256); tPlaca.needsUpdate = true; });
    const placaP = new THREE.Mesh(new THREE.PlaneGeometry(largura - 2, (largura - 2) / 8), new THREE.MeshBasicMaterial({ map: tPlaca, side: THREE.DoubleSide }));
    placaP.position.copy(lado(p, 0, 8.9)); placaP.rotation.y = anguloFrente(p.h); placaP.translateZ(3.05); cena.add(placaP);
    const ilhas = [-LARG / 2 - 1, -LARG / 4 - 0.4, 0, LARG / 4 + 0.4, LARG / 2 + 1];
    ilhas.forEach((x, k) => {
      const cab = new THREE.Mesh(caixa, new THREE.MeshBasicMaterial({ color: 0x151a42 })); cab.position.copy(lado(p, x, 1.6)); cab.rotation.y = -p.h; cab.scale.set(1.3, 3.2, 3.2); cena.add(cab);
      const vidro = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.2), aditivo([COR.c, COR.r, COR.m, COR.v, COR.c][k], 0.55)); vidro.position.copy(lado(p, x, 2.3)); vidro.rotation.y = anguloFrente(p.h); vidro.translateZ(1.62); cena.add(vidro);
      const pilar = new THREE.Mesh(caixa, matEscuro); pilar.position.copy(lado(p, x, 5.3)); pilar.rotation.y = -p.h; pilar.scale.set(0.35, 4.4, 0.35); cena.add(pilar);
    });
    /* uma cancela e um semáforo por faixa (4 faixas) */
    for (let k = 0; k < 4; k++) {
      const x0 = ilhas[k] + 0.65, x1 = ilhas[k + 1] - 0.65, comp = x1 - x0;
      const base = new THREE.Group(); base.position.copy(lado(p, x0, 1.05)); base.rotation.y = -p.h; base.translateZ(-1.9); cena.add(base);
      const braco = new THREE.Group(); base.add(braco);
      const texCancela = textura(tela(256, 16, (g, w, h) => { for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? "#ffffff" : "#ff2a5a"; g.fillRect(i * 32, 0, 32, h); } }));
      const barra = new THREE.Mesh(new THREE.BoxGeometry(comp, 0.16, 0.12), new THREE.MeshBasicMaterial({ map: texCancela }));
      barra.position.x = comp / 2; braco.add(barra);
      const luz = new THREE.Sprite(new THREE.SpriteMaterial({ map: texBrilho, color: 0xff2a5a, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
      luz.scale.set(1.8, 1.8, 1); luz.position.copy(lado(p, (x0 + x1) / 2, 6.6)); luz.translateZ(0); cena.add(luz);
      cancelas.push({ braco, luz, ang: 0, atraso: k * 0.12 });
    }
  }

  /* passarela da equipe: uma ponte de pedestres sobre a rodovia com um telão para cada sócio */
  const passTr = trechoDo("passarela");
  if (passTr) {
    const dP = passTr.ini + passTr.L * 0.6, p = em(dP);
    passTr.parada = dP - 42;
    const ALT = 8.5, larg = LARG + 14, virado = anguloFrente(p.h);
    const deck = new THREE.Mesh(caixa, new THREE.MeshBasicMaterial({ color: 0x141838 })); deck.position.copy(lado(p, 0, ALT)); deck.rotation.y = -p.h; deck.scale.set(larg, 1.1, 4); cena.add(deck);
    [[-1.95, COR.c], [1.95, COR.m]].forEach(([z, cor]) => {
      const f = new THREE.Mesh(caixa, new THREE.MeshBasicMaterial({ color: cor })); f.position.copy(lado(p, 0, ALT + 0.6)); f.rotation.y = -p.h; f.translateZ(z); f.scale.set(larg, 0.12, 0.12); cena.add(f);
      const gr = new THREE.Mesh(new THREE.PlaneGeometry(larg, 1.4), aditivo(cor, 0.12, texDegrade)); gr.position.copy(lado(p, 0, ALT + 1.3)); gr.rotation.y = virado; gr.translateZ(z > 0 ? -1.95 : 1.95); cena.add(gr);
    });
    [-1, 1].forEach((sl) => {
      const torre = new THREE.Mesh(caixa, new THREE.MeshBasicMaterial({ color: 0x10143a })); torre.position.copy(lado(p, sl * (larg / 2 + 1.5), (ALT + 2) / 2)); torre.rotation.y = -p.h; torre.scale.set(3, ALT + 2, 4.4); cena.add(torre);
      const luz = new THREE.Mesh(new THREE.PlaneGeometry(0.4, ALT), aditivo(sl < 0 ? COR.c : COR.m, 0.9)); luz.position.copy(lado(p, sl * (larg / 2 + 1.5), ALT / 2 + 1)); luz.rotation.y = virado; luz.translateZ(2.25); cena.add(luz);
    });
    const loader = new THREE.TextureLoader();
    [["caio", "CAIO", "CRIAÇÃO", -LARG / 2 + 0.6, "#29ecff", COR.c], ["carlos", "CARLOS", "COMERCIAL", LARG / 2 - 0.6, "#ff3df2", COR.m]].forEach(([slug, nome, papel, off, corCss, cor]) => {
      const W = 7.2, Hh = 9.6, cy = ALT + 0.6 + Hh / 2 + 0.6;
      const foto = new THREE.Mesh(new THREE.PlaneGeometry(W, Hh), new THREE.MeshBasicMaterial({ map: loader.load(`imagens/equipe/${slug}.webp`) }));
      foto.position.copy(lado(p, off, cy)); foto.rotation.y = virado; foto.translateZ(2.1); cena.add(foto);
      const moldura = new THREE.Mesh(new THREE.PlaneGeometry(W + 0.7, Hh + 0.7), aditivo(cor, 0.95)); moldura.position.copy(foto.position); moldura.rotation.y = virado; moldura.translateZ(-0.05); cena.add(moldura);
      const halo = new THREE.Mesh(new THREE.PlaneGeometry(W * 2.4, Hh * 1.9), aditivo(cor, 0.3, texBrilho)); halo.position.copy(foto.position); halo.rotation.y = virado; halo.translateZ(-0.12); cena.add(halo);
      const desenhar = (g, w, h) => {
        g.clearRect(0, 0, w, h); g.fillStyle = "#070920"; g.fillRect(0, 0, w, h);
        g.strokeStyle = corCss; g.lineWidth = 6; g.shadowColor = corCss; g.shadowBlur = 18; g.strokeRect(6, 6, w - 12, h - 12); g.shadowBlur = 0;
        g.textAlign = "center"; g.fillStyle = "#ffffff"; g.font = "800 64px 'Plus Jakarta Sans', sans-serif"; g.fillText(nome, w / 2, 80);
        g.fillStyle = corCss; g.font = "500 30px 'JetBrains Mono', monospace"; g.fillText(papel + " · HIGHWAY", w / 2, 122);
      };
      const cv = tela(512, 150, desenhar), t = textura(cv);
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { desenhar(cv.getContext("2d"), 512, 150); t.needsUpdate = true; });
      const nomeP = new THREE.Mesh(new THREE.PlaneGeometry(W + 0.7, (W + 0.7) * 150 / 512), new THREE.MeshBasicMaterial({ map: t })); nomeP.position.copy(lado(p, off, ALT - 0.3)); nomeP.rotation.y = virado; nomeP.translateZ(2.15); cena.add(nomeP);
    });
    /* placa da seção sobre a passarela */
    const cS = tela(1024, 140, (g, w, h) => { g.fillStyle = "#070920"; g.fillRect(0, 0, w, h); g.strokeStyle = "#b350ff"; g.lineWidth = 5; g.shadowColor = "#b350ff"; g.shadowBlur = 16; g.strokeRect(6, 6, w - 12, h - 12); g.shadowBlur = 0; g.fillStyle = "#eef1ff"; g.font = "700 62px 'Plus Jakarta Sans', sans-serif"; g.textAlign = "center"; g.fillText("Quem dirige a Highway", w / 2, 92); });
    const tS = textura(cS);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { tS.needsUpdate = true; });
    const placaS = new THREE.Mesh(new THREE.PlaneGeometry(7, 0.96), new THREE.MeshBasicMaterial({ map: tS })); placaS.position.copy(lado(p, 0, ALT + 0.2)); placaS.rotation.y = virado; placaS.translateZ(2.15); cena.add(placaS);
  }

  /* túnel de anéis neon */
  const tunTr = trechoDo("tunel");
  let aneis = null;
  if (tunTr) {
    const lista = [];
    for (let d = tunTr.ini + 10; d < tunTr.fim - 10; d += 7) lista.push(em(d));
    aneis = new THREE.InstancedMesh(new THREE.TorusGeometry(12.5, 0.16, 4, 4), new THREE.MeshBasicMaterial({ color: 0xffffff }), lista.length);
    const cores = [COR.c, COR.r, COR.m];
    lista.forEach((p, k) => {
      tmp.position.set(p.x, p.y + 5, p.z); tmp.rotation.set(0, -p.h, Math.PI / 4); tmp.scale.set(1, 1, 1); tmp.updateMatrix();
      aneis.setMatrixAt(k, tmp.matrix); aneis.setColorAt(k, new THREE.Color(cores[k % 3]));
    });
    cena.add(aneis);
  }

  /* marcos dos 4 passos na descida */
  const desTr = trechoDo("descida");
  if (desTr) {
    ["1 · CONVERSA", "2 · PROPOSTA", "3 · CRIAÇÃO", "4 · NO AR"].forEach((txt, k) => {
      const p = em(desTr.ini + desTr.L * (0.2 + k * 0.2)), s = 1;
      const c = tela(512, 128, (g, w, h) => {
        g.fillStyle = "#070920"; g.fillRect(0, 0, w, h); g.strokeStyle = "#3dffa2"; g.lineWidth = 5; g.shadowColor = "#3dffa2"; g.shadowBlur = 14; g.strokeRect(8, 8, w - 16, h - 16); g.shadowBlur = 0;
        g.fillStyle = "#eef1ff"; g.font = "700 50px 'Plus Jakarta Sans', sans-serif"; g.fillText(txt, 32, 84);
      });
      const pl = new THREE.Mesh(new THREE.PlaneGeometry(6, 1.5), new THREE.MeshBasicMaterial({ map: textura(c), side: THREE.DoubleSide }));
      pl.position.copy(lado(p, s * (LARG / 2 + 3), 3.6)); pl.rotation.y = anguloFrente(p.h, s, 0.3); cena.add(pl);
      const m = new THREE.Mesh(caixa, matEscuro); m.position.copy(lado(p, s * (LARG / 2 + 3), 1.4)); m.scale.set(0.25, 2.8, 0.25); cena.add(m);
    });
  }

  /* chegada: alfinete de destino e anel pulsando */
  const chegTr = trechoDo("chegada");
  let pino = null, anel = null, pinoBaseY = 3, posAnel = null;
  if (chegTr) {
    const p = em(chegTr.ini + chegTr.L * 0.85);
    pino = new THREE.Group();
    const corpo = new THREE.Mesh(new THREE.ConeGeometry(2.3, 5.5, 24), new THREE.MeshBasicMaterial({ color: COR.m })); corpo.rotation.x = Math.PI; corpo.position.y = 2.75;
    const cabeca = new THREE.Mesh(new THREE.SphereGeometry(2.6, 24, 16), new THREE.MeshBasicMaterial({ color: COR.m })); cabeca.position.y = 6;
    const miolo = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), new THREE.MeshBasicMaterial({ color: 0x0a0c22 })); miolo.position.set(0, 6, 0);
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: texBrilho, color: COR.m, transparent: true, opacity: 0.75, blending: THREE.AdditiveBlending, depthWrite: false })); halo.scale.set(22, 22, 1); halo.position.y = 5;
    pino.add(corpo, cabeca, miolo, halo);
    /* ---------- o destino: a rodovia termina numa praça em frente ao prédio "Seu site no ar" ---------- */
    const fimP = A[A.length - 1], hF = fimP.h;
    chegTr.parada = TOTAL - 16;
    TRECHOS[TRECHOS.length - 1].parada = TOTAL - 16;
    const aqui = (dist, off = 0, alt = 0) => new THREE.Vector3(fimP.x + Math.sin(hF) * dist + Math.cos(hF) * off, fimP.y + alt, fimP.z - Math.cos(hF) * dist + Math.sin(hF) * off);
    const virado = anguloFrente(hF);
    const semNevoa = (m) => { m.fog = false; return m; };
    /* praça circular com anéis neon */
    const praca = new THREE.Mesh(new THREE.CylinderGeometry(26, 26, 0.4, 64), new THREE.MeshBasicMaterial({ color: 0x0d1030 }));
    praca.position.copy(aqui(20, 0, 0.05)); cena.add(praca);
    [[25.6, 26, COR.c], [17, 17.4, COR.m], [8, 8.3, COR.r]].forEach(([r0, r1, cor]) => {
      const an = new THREE.Mesh(new THREE.RingGeometry(r0, r1, 72), semNevoa(aditivo(cor, 0.9))); an.rotation.x = -Math.PI / 2; an.position.copy(aqui(20, 0, 0.3)); cena.add(an);
    });
    /* faixa xadrez de chegada no fim da pista */
    const texX = textura(tela(64, 16, (g) => { for (let i = 0; i < 16; i++) for (let j = 0; j < 4; j++) { g.fillStyle = (i + j) % 2 ? "#eef1ff" : "#05060f"; g.fillRect(i * 4, j * 4, 4, 4); } }));
    const faixaX = new THREE.Mesh(new THREE.PlaneGeometry(LARG + 2, 2.4), new THREE.MeshBasicMaterial({ map: texX }));
    faixaX.rotation.set(-Math.PI / 2, 0, -hF); faixaX.position.copy(aqui(-8, 0, 0.07)); cena.add(faixaX);
    /* pórtico de chegada sobre a pista */
    const cArco = tela(1024, 200, (g, w, h) => {
      g.fillStyle = "#070920"; g.fillRect(0, 0, w, h);
      g.strokeStyle = "#ff3df2"; g.lineWidth = 8; g.shadowColor = "#ff3df2"; g.shadowBlur = 24; g.strokeRect(10, 10, w - 20, h - 20); g.shadowBlur = 0;
      g.fillStyle = "#ff3df2"; g.font = "500 40px 'JetBrains Mono', monospace"; g.fillText("KM 11", 50, 112);
      g.fillStyle = "#ffffff"; g.font = "800 84px 'Plus Jakarta Sans', sans-serif"; g.fillText("DESTINO", 250, 130);
    });
    const tArco = textura(cArco);
    [-1, 1].forEach((sl) => { const m = new THREE.Mesh(caixa, matEscuro); m.position.copy(aqui(-34, sl * (LARG / 2 + 2), 6)); m.rotation.y = -hF; m.scale.set(0.8, 12, 0.8); cena.add(m); });
    const arco = new THREE.Mesh(new THREE.PlaneGeometry(14, 2.75), semNevoa(new THREE.MeshBasicMaterial({ map: tArco, side: THREE.DoubleSide })));
    arco.position.copy(aqui(-34, 0, 12.5)); arco.rotation.y = virado; cena.add(arco);
    /* o prédio */
    const texTorreD = texJanelas.clone(); texTorreD.needsUpdate = true; texTorreD.wrapS = texTorreD.wrapT = THREE.RepeatWrapping; texTorreD.repeat.set(4, 8);
    const matPredio = semNevoa(new THREE.MeshBasicMaterial({ map: texTorreD, color: 0xd8c8ff }));
    const base = new THREE.Mesh(caixa, matPredio); base.position.copy(aqui(58, 0, 9)); base.rotation.y = -hF; base.scale.set(64, 18, 26); cena.add(base);
    const torre = new THREE.Mesh(caixa, matPredio); torre.position.copy(aqui(62, 0, 46)); torre.rotation.y = -hF; torre.scale.set(36, 58, 20); cena.add(torre);
    const topo = new THREE.Mesh(caixa, semNevoa(new THREE.MeshBasicMaterial({ color: 0x151a42 }))); topo.position.copy(aqui(62, 0, 76.5)); topo.rotation.y = -hF; topo.scale.set(38, 3, 22); cena.add(topo);
    [[0, 75, 38.4, 0.4, COR.c], [0, 18.3, 64.4, 0.4, COR.m]].forEach(([off, alt, larg, esp, cor]) => {
      const f = new THREE.Mesh(caixa, semNevoa(new THREE.MeshBasicMaterial({ color: cor }))); f.position.copy(aqui(62 - (alt > 50 ? 11.1 : 7.1), off, alt)); f.rotation.y = -hF; f.scale.set(larg, esp, 0.3); cena.add(f);
    });
    /* telão: um site no ar na fachada */
    const telaoTex = new THREE.TextureLoader().load("imagens/prints/estetica-n3-topo.webp");
    const telao = new THREE.Mesh(new THREE.PlaneGeometry(30, 18.75), semNevoa(new THREE.MeshBasicMaterial({ map: telaoTex })));
    telao.position.copy(aqui(51.85, 0, 42)); telao.rotation.y = virado; cena.add(telao);
    const moldura = new THREE.Mesh(new THREE.PlaneGeometry(31.6, 20.35), semNevoa(aditivo(COR.c, 0.9))); moldura.position.copy(aqui(51.9, 0, 42)); moldura.rotation.y = virado; cena.add(moldura);
    const haloT = new THREE.Mesh(new THREE.PlaneGeometry(56, 40), semNevoa(aditivo(COR.r, 0.35, texBrilho))); haloT.position.copy(aqui(52, 0, 42)); haloT.rotation.y = virado; cena.add(haloT);
    /* letreiro SEU SITE NO AR */
    const cLet = tela(2048, 300, (g, w, h) => {
      g.clearRect(0, 0, w, h);
      g.font = "800 200px 'Plus Jakarta Sans', sans-serif"; g.textAlign = "center"; g.textBaseline = "middle";
      const l = g.createLinearGradient(200, 0, w - 200, 0); l.addColorStop(0, "#29ecff"); l.addColorStop(0.5, "#b350ff"); l.addColorStop(1, "#ff3df2");
      g.shadowColor = "#b350ff"; g.shadowBlur = 40; g.fillStyle = l; g.fillText("SEU SITE NO AR", w / 2, h / 2 + 10);
      g.shadowBlur = 0; g.fillStyle = "rgba(255,255,255,.55)"; g.fillText("SEU SITE NO AR", w / 2, h / 2 + 10);
    });
    const tLet = textura(cLet);
    const letreiroD = new THREE.Mesh(new THREE.PlaneGeometry(44, 6.45), semNevoa(new THREE.MeshBasicMaterial({ map: tLet, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })));
    letreiroD.position.copy(aqui(44.6, 0, 22.5)); letreiroD.rotation.y = virado; cena.add(letreiroD);
    /* entrada iluminada */
    const portaD = new THREE.Mesh(new THREE.PlaneGeometry(12, 7), semNevoa(aditivo(COR.m, 0.75))); portaD.position.copy(aqui(44.9, 0, 3.5)); portaD.rotation.y = virado; cena.add(portaD);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { tArco.needsUpdate = true; tLet.needsUpdate = true; });
    /* alfinete flutuando sobre o prédio */
    const pTopo = aqui(62, 0, 0);
    pinoBaseY = fimP.y + 92;
    pino.scale.setScalar(2.6);
    pino.traverse((o) => { if (o.material) o.material.fog = false; });
    pino.position.set(pTopo.x, pinoBaseY, pTopo.z); cena.add(pino);
    posAnel = aqui(20, 0, 0.35);
    miolo.position.z = 2.2;
    anel = new THREE.Mesh(new THREE.RingGeometry(3, 3.6, 48), aditivo(COR.m, 0.8)); anel.rotation.x = -Math.PI / 2; if (posAnel) anel.position.copy(posAnel); cena.add(anel);
  }

  let luzAntena = null;
  /* ---------- o ponto de partida: terraço do arranha-céu da Highway ----------
     O topo do site acontece aqui em cima. Na passagem, a câmera gira em volta do prédio
     (heliponto em H e letreiro HIGHWAY) e mergulha até a rodovia lá embaixo. */
  const ALT_TORRE = 82, LADO_TORRE = 30;
  const baseTorre = em(110), centroTorre = lado(baseTorre, LARG / 2 + 92, 0);
  const torreY = ALT_TORRE;
  {
    const texTorre = texJanelas.clone(); texTorre.needsUpdate = true; texTorre.wrapS = texTorre.wrapT = THREE.RepeatWrapping; texTorre.repeat.set(3, 7);
    const corpo = new THREE.Mesh(caixa, new THREE.MeshBasicMaterial({ map: texTorre, color: 0xb9a8ff }));
    corpo.position.set(centroTorre.x, ALT_TORRE / 2, centroTorre.z); corpo.rotation.y = -baseTorre.h; corpo.scale.set(LADO_TORRE, ALT_TORRE, LADO_TORRE); cena.add(corpo);
    /* laje do terraço */
    const laje = new THREE.Mesh(new THREE.BoxGeometry(LADO_TORRE + 1, 0.8, LADO_TORRE + 1), new THREE.MeshBasicMaterial({ color: 0x0c0f2c }));
    laje.position.set(centroTorre.x, torreY + 0.4, centroTorre.z); laje.rotation.y = -baseTorre.h; cena.add(laje);
    /* parapeito neon nas quatro bordas */
    const ladoT = (LADO_TORRE + 1) / 2;
    [[0, ladoT, LADO_TORRE + 1, 0.25, COR.c], [0, -ladoT, LADO_TORRE + 1, 0.25, COR.m], [ladoT, 0, 0.25, LADO_TORRE + 1, COR.r], [-ladoT, 0, 0.25, LADO_TORRE + 1, COR.c]].forEach(([ox, oz, sx, sz, cor]) => {
      const g = new THREE.Group(); g.position.set(centroTorre.x, torreY + 0.8, centroTorre.z); g.rotation.y = -baseTorre.h;
      const m = new THREE.Mesh(caixa, new THREE.MeshBasicMaterial({ color: cor })); m.position.set(ox, 0.9, oz); m.scale.set(sx, 0.18, sz); g.add(m);
      const vidro = new THREE.Mesh(caixa, aditivo(cor, 0.1)); vidro.position.set(ox, 0.45, oz); vidro.scale.set(Math.max(sx, 0.05), 0.9, Math.max(sz, 0.05)); g.add(vidro);
      cena.add(g);
    });
    /* heliponto com o H da marca */
    const texHeli = textura(tela(512, 512, (g, w) => {
      g.clearRect(0, 0, w, w);
      g.strokeStyle = "#29ecff"; g.lineWidth = 16; g.shadowColor = "#29ecff"; g.shadowBlur = 30;
      g.beginPath(); g.arc(w / 2, w / 2, w * 0.42, 0, Math.PI * 2); g.stroke();
      const l = g.createLinearGradient(140, 0, 372, 0); l.addColorStop(0, "#29ecff"); l.addColorStop(0.5, "#b350ff"); l.addColorStop(1, "#ff3df2");
      g.fillStyle = l; g.shadowColor = "#b350ff"; g.shadowBlur = 26;
      g.fillRect(150, 130, 56, 252); g.fillRect(306, 130, 56, 252); g.fillRect(150, 228, 212, 56);
    }));
    const heli = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), new THREE.MeshBasicMaterial({ map: texHeli, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
    heli.rotation.set(-Math.PI / 2, 0, -baseTorre.h); heli.position.set(centroTorre.x, torreY + 0.85, centroTorre.z); cena.add(heli);
    /* letreiro HIGHWAY na borda de trás, virado para a cidade */
    const texLetreiro = textura(tela(2048, 400, (g, w, h) => {
      g.clearRect(0, 0, w, h);
      g.font = "900 300px 'Archivo', 'Arial Black', sans-serif"; g.textAlign = "center"; g.textBaseline = "middle";
      const l = g.createLinearGradient(200, 0, w - 200, 0); l.addColorStop(0, "#29ecff"); l.addColorStop(0.35, "#4d8dff"); l.addColorStop(0.65, "#b350ff"); l.addColorStop(1, "#ff3df2");
      g.lineWidth = 12; g.strokeStyle = l; g.shadowColor = "#b350ff"; g.shadowBlur = 40; g.strokeText("HIGHWAY", w / 2, h / 2 + 12);
      g.shadowBlur = 0; g.lineWidth = 5; g.strokeStyle = "rgba(255,255,255,.85)"; g.strokeText("HIGHWAY", w / 2, h / 2 + 12);
    }));
    const matLetreiro = new THREE.MeshBasicMaterial({ map: texLetreiro, transparent: true, side: THREE.FrontSide, blending: THREE.AdditiveBlending, depthWrite: false });
    const letreiro = new THREE.Mesh(new THREE.PlaneGeometry(30, 5.9), matLetreiro);
    const letreiroVerso = new THREE.Mesh(new THREE.PlaneGeometry(30, 5.9), matLetreiro); letreiroVerso.rotation.y = Math.PI; letreiro.add(letreiroVerso);
    const fundoTorre = lado(baseTorre, LARG / 2 + 92 + ladoT - 1, 0);
    letreiro.position.set(fundoTorre.x, torreY + 5.6, fundoTorre.z); letreiro.rotation.y = -baseTorre.h + Math.PI / 2; cena.add(letreiro);
    [-11, 0, 11].forEach((o) => { const m = new THREE.Mesh(caixa, matEscuro); m.position.copy(letreiro.position); m.rotation.y = letreiro.rotation.y; m.translateX(o); m.position.y = torreY + 1.6; m.scale.set(0.25, 2.4, 0.25); cena.add(m); });
    /* casa de máquinas, caixa d'água e antena com luz piscando */
    const casa = new THREE.Mesh(caixa, new THREE.MeshBasicMaterial({ color: 0x151a42 })); casa.position.set(centroTorre.x, torreY + 2.2, centroTorre.z); casa.rotation.y = -baseTorre.h; casa.translateX(-10); casa.translateZ(-9); casa.scale.set(6, 3.6, 5); cena.add(casa);
    const antena = new THREE.Mesh(caixa, matEscuro); antena.position.copy(casa.position); antena.position.y = torreY + 9; antena.scale.set(0.3, 11, 0.3); cena.add(antena);
    luzAntena = new THREE.Sprite(new THREE.SpriteMaterial({ map: texBrilho, color: 0xff3355, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
    luzAntena.position.set(antena.position.x, torreY + 14.8, antena.position.z); luzAntena.scale.set(4, 4, 1); cena.add(luzAntena);
    /* brilho do letreiro refletido no terraço */
    const reflexo = new THREE.Mesh(new THREE.PlaneGeometry(34, 14), aditivo(COR.r, 0.18, texBrilho)); reflexo.rotation.set(-Math.PI / 2, 0, -baseTorre.h); reflexo.position.set(fundoTorre.x, torreY + 0.86, fundoTorre.z); cena.add(reflexo);
  }

  /* ---------- trânsito: carros de verdade, com lataria, cabine, faróis, lanternas e neon por baixo ---------- */
  cena.add(new THREE.HemisphereLight(0x9aa6ff, 0x2a0a3a, 1.15));
  const sol = new THREE.DirectionalLight(0xff8ff0, 0.55); sol.position.set(-1, 2, 1); cena.add(sol);
  const NC = leve ? 22 : 46;
  const coresLataria = [0x1b2056, 0x2a1450, 0x0f1230, 0x3a1048, 0xd8dcf0, 0x14304a, 0x501030, 0x22264a];
  const carros = Array.from({ length: NC }, (_, k) => {
    const vem = k % 2 === 0;
    return { d: Math.random() * TOTAL, off: vem ? (k % 4 ? -2 : -6) : 6, v: vem ? -rnd(26, 38) : rnd(14, 24), vem, tipo: k % 5 === 0 ? 1 : 0, neon: k % 3 };
  });
  const matCarro = new THREE.MeshLambertMaterial({ color: 0xffffff });
  const matVidro = new THREE.MeshBasicMaterial({ color: 0x0a0d24 });
  const iLataria = new THREE.InstancedMesh(new THREE.BoxGeometry(2, 0.62, 4.4), matCarro, NC);
  const iCapo = new THREE.InstancedMesh(new THREE.BoxGeometry(1.92, 0.22, 4.2), matCarro, NC);
  const iCabine = new THREE.InstancedMesh(new THREE.BoxGeometry(1.7, 0.6, 2.1), matVidro, NC);
  const iTeto = new THREE.InstancedMesh(new THREE.BoxGeometry(1.6, 0.08, 1.8), matCarro, NC);
  const iRodas = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.38, 0.38, 2.12, 12), new THREE.MeshBasicMaterial({ color: 0x05060f }), NC * 2);
  const iNeon = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: texBrilho, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false }), NC);
  const texCone = textura(tela(128, 256, (g, w, h) => {
    const img = g.createImageData(w, h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const v = y / h, larg = 0.1 + v * 0.42, dx = Math.abs(x / w - 0.5);
      const borda = Math.max(0, 1 - dx / larg); const a = Math.pow(borda, 1.6) * Math.pow(1 - v, 1.4) * Math.min(1, v * 6);
      const i = (y * w + x) * 4; img.data[i] = img.data[i + 1] = img.data[i + 2] = 255; img.data[i + 3] = a * 255;
    }
    g.putImageData(img, 0, 0);
  }));
  const iFacho = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: texCone, color: 0xdff6ff, transparent: true, opacity: 0.38, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }), NC);
  const neonCores = [new THREE.Color(COR.c), new THREE.Color(COR.m), new THREE.Color(COR.r)];
  carros.forEach((c, k) => {
    const cor = new THREE.Color(coresLataria[k % coresLataria.length]);
    iLataria.setColorAt(k, cor); iCapo.setColorAt(k, cor); iTeto.setColorAt(k, cor);
    iNeon.setColorAt(k, neonCores[c.neon]);
  });
  [iLataria, iCapo, iCabine, iTeto, iRodas, iNeon, iFacho].forEach((m) => { m.frustumCulled = false; m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); cena.add(m); });
  /* lentes redondas dos faróis (2 por carro) e faixa de LED das lanternas */
  const iLente = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.2, 0.2, 0.08, 20), new THREE.MeshBasicMaterial({ color: 0xf4fbff }), NC * 2);
  const iAnel = new THREE.InstancedMesh(new THREE.TorusGeometry(0.24, 0.035, 6, 24), new THREE.MeshBasicMaterial({ color: 0x9feaff }), NC * 2);
  const iLed = new THREE.InstancedMesh(new THREE.BoxGeometry(1.7, 0.1, 0.05), new THREE.MeshBasicMaterial({ color: 0xff2a5a }), NC);
  const iDrl = new THREE.InstancedMesh(new THREE.BoxGeometry(1.5, 0.05, 0.05), new THREE.MeshBasicMaterial({ color: 0xbff3ff }), NC);
  [iLente, iAnel, iLed, iDrl].forEach((m) => { m.frustumCulled = false; m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); cena.add(m); });
  /* brilho suave em volta dos faróis e das lanternas: 4 pontos por carro */
  const geoLuzes = new THREE.BufferGeometry();
  const posL = new Float32Array(NC * 4 * 3), corL = new Float32Array(NC * 4 * 3);
  for (let k = 0; k < NC; k++) corL.set([0.95, 0.98, 1, 0.95, 0.98, 1, 1, 0.1, 0.3, 1, 0.1, 0.3], k * 12);
  geoLuzes.setAttribute("position", new THREE.BufferAttribute(posL, 3));
  geoLuzes.setAttribute("color", new THREE.BufferAttribute(corL, 3));
  const ptsLuzes = new THREE.Points(geoLuzes, new THREE.PointsMaterial({ size: 1.6, map: texHalo, opacity: 0.8, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  ptsLuzes.frustumCulled = false; cena.add(ptsLuzes);
  const obj = new THREE.Object3D(), v3 = new THREE.Vector3();
  const local = (x, y, z) => { v3.set(x, y, z); return v3.applyMatrix4(obj.matrix); };
  const moverCarros = (dt) => {
    carros.forEach((c, k) => {
      const VIA = TOTAL - 14;
      if (!reduz) c.d = (c.d + c.v * dt + VIA) % VIA;
      const p = em(c.d), base = lado(p, c.off, 0);
      const giro = -p.h + (c.vem ? Math.PI : 0);
      const pend = (em(c.d + 3).y - em(c.d - 3).y) / 6;
      obj.position.set(base.x, base.y, base.z); obj.rotation.set(c.vem ? -Math.atan(pend) : Math.atan(pend), giro, 0, "YXZ"); obj.scale.set(1, 1, 1); obj.updateMatrix();
      const m = obj.matrix.clone();
      const coloca = (inst, i, x, y, z, sx = 1, sy = 1, sz = 1, rx = 0) => {
        tmp.position.set(x, y, z); tmp.rotation.set(rx, 0, 0); tmp.scale.set(sx, sy, sz); tmp.updateMatrix();
        tmp.matrix.premultiply(m); inst.setMatrixAt(i, tmp.matrix);
      };
      const longo = c.tipo ? 1.18 : 1;
      coloca(iLataria, k, 0, 0.62, 0, 1, 1, longo);
      coloca(iCapo, k, 0, 1.0, 0.25, 1, 1, longo * 0.9);
      coloca(iCabine, k, 0, 1.38, 0.35, 1, c.tipo ? 1.25 : 1, c.tipo ? 1.5 : 1);
      coloca(iTeto, k, 0, c.tipo ? 1.76 : 1.7, 0.35, 1, 1, c.tipo ? 1.5 : 1);
      coloca(iRodas, k * 2, 0, 0.38, -1.4 * longo, 1, 1, 1);
      coloca(iRodas, k * 2 + 1, 0, 0.38, 1.4 * longo, 1, 1, 1);
      iRodas.setMatrixAt(k * 2, (() => { tmp.position.set(0, 0.38, -1.4 * longo); tmp.rotation.set(0, 0, Math.PI / 2); tmp.scale.set(1, 1, 1); tmp.updateMatrix(); return tmp.matrix.premultiply(m); })());
      iRodas.setMatrixAt(k * 2 + 1, (() => { tmp.position.set(0, 0.38, 1.4 * longo); tmp.rotation.set(0, 0, Math.PI / 2); tmp.scale.set(1, 1, 1); tmp.updateMatrix(); return tmp.matrix.premultiply(m); })());
      coloca(iNeon, k, 0, 0.06, 0, 3.6, 6.4, 1, -Math.PI / 2);
      coloca(iFacho, k, 0, 0.07, -2.2 * longo - 6.6, 6.4, 13, 1, -Math.PI / 2);
      const fr = -2.21 * longo, tr = 2.21 * longo;
      [-0.62, 0.62].forEach((x, j) => {
        coloca(iLente, k * 2 + j, x, 0.76, fr - 0.02, 1, 1, 1, Math.PI / 2);
        coloca(iAnel, k * 2 + j, x, 0.76, fr - 0.03, 1, 1, 1, 0);
      });
      coloca(iDrl, k, 0, 0.98, fr - 0.01, 1, 1, 1);
      coloca(iLed, k, 0, 0.82, tr + 0.01, 1, 1, 1);
      let q = local(-0.62, 0.76, fr - 0.3); posL.set([q.x, q.y, q.z], k * 12);
      q = local(0.62, 0.76, fr - 0.3); posL.set([q.x, q.y, q.z], k * 12 + 3);
      q = local(-0.75, 0.78, tr); posL.set([q.x, q.y, q.z], k * 12 + 6);
      q = local(0.75, 0.78, tr); posL.set([q.x, q.y, q.z], k * 12 + 9);
    });
    [iLataria, iCapo, iCabine, iTeto, iRodas, iNeon, iFacho, iLente, iAnel, iLed, iDrl].forEach((mm) => { mm.instanceMatrix.needsUpdate = true; });
    geoLuzes.attributes.position.needsUpdate = true;
  };

  /* ---------- rolagem → posição na estrada ---------- */
  let ancoras = [];
  /* "anda e para": enquanto uma seção está na tela, a estrada fica parada num ponto de vista do cenário dela.
     A estrada só anda na passagem de uma seção para a próxima (quando a próxima entra na tela). */
  const medirAncoras = () => {
    const sy = window.scrollY, vh = window.innerHeight;
    const maxS = Math.max(1, document.documentElement.scrollHeight - vh);
    const stP = window.ScrollTrigger ? window.ScrollTrigger.getAll().find((t) => t.pin && t.trigger && t.trigger.id === "hero") : null;
    ancoras = [{ s: 0, d: D_POUSO, fixo: true }];
    let ultS = stP && stP.end > 2 ? stP.end : 0, dAnt = D_POUSO;
    if (ultS) ancoras.push({ s: ultS, d: D_POUSO, fixo: true });
    TRECHOS.forEach((tr, i) => {
      if (i === 0) return;
      const el = $(tr.sel); if (!el) return;
      const T = el.getBoundingClientRect().top + sy;
      const parada = Math.max(dAnt, tr.parada !== undefined ? tr.parada : (tr.sel === ".rodape" ? TOTAL - 16 : tr.ini - 22));
      const s0 = clamp(T - vh * 0.95, ultS + 1, maxS);
      const s1 = clamp(T - vh * 0.12, s0 + 1, maxS + 0.5);
      ancoras.push({ s: s0, d: dAnt, fixo: true }, { s: s1, d: parada });
      ultS = s1; dAnt = parada;
    });
    ancoras.push({ s: maxS + 2, d: dAnt, fixo: true });
  };
  const suaveA = (t) => t * t * (3 - 2 * t);
  const dDaRolagem = (s) => {
    for (let k = 0; k < ancoras.length - 1; k++) {
      const a = ancoras[k], b = ancoras[k + 1];
      if (s < b.s) return a.d + suaveA(clamp((s - a.s) / (b.s - a.s), 0, 1)) * (b.d - a.d);
    }
    return ancoras[ancoras.length - 1].d;
  };

  /* ---------- câmera ---------- */
  let impulso = 0, passT = 0, passS = 0;
  let velCam = 0;
  const VEL_MAX = 42;
  let dCam = D_POUSO, dAntes = D_POUSO, vel = 0, mx = 0, my = 0, alvoMx = 0, alvoMy = 0, tempo = 0;
  window.addEventListener("pointermove", (e) => { alvoMx = e.clientX / window.innerWidth - 0.5; alvoMy = e.clientY / window.innerHeight - 0.5; }, { passive: true });
  const olhar = new THREE.Vector3();
  /* trajeto da passagem: espiral do heliponto até a pista (curvas Catmull-Rom) */
  let trajeto = null;
  const vTraj = new THREE.Vector3(), vOlhar = new THREE.Vector3();
  const montarTrajeto = () => {
    const C = new THREE.Vector3(centroTorre.x, torreY + 1, centroTorre.z);
    const longe = em(300), pouso = em(D_POUSO), antes = em(D_POUSO - 60), meio = em(D_POUSO - 28);
    const angDe = (v) => Math.atan2(v.x - C.x, v.z - C.z);
    const ang0 = angDe(longe);
    const chegada = lado(antes, 2.6, 20);
    const DOIS_PI = Math.PI * 2;
    const m0 = (((angDe(chegada) - ang0) % DOIS_PI) + DOIS_PI) % DOIS_PI;
    const opcoes = [m0, m0 - DOIS_PI, m0 + DOIS_PI, m0 - 2 * DOIS_PI].filter((v) => Math.abs(v) >= Math.PI * 1.2 && Math.abs(v) <= Math.PI * 2.25);
    const varre = opcoes.length ? opcoes.sort((x, y) => Math.abs(x) - Math.abs(y))[0] : m0 + DOIS_PI;
    const rFinal = Math.hypot(chegada.x - C.x, chegada.z - C.z);
    const olharPista = lado(em(D_POUSO + 26), 1.2, 1.9);
    const pts = [], olh = [];
    const N = 10;
    for (let k = 0; k < N; k++) {
      const f = k / (N - 1);
      const ang = ang0 + varre * f;
      const abre = Math.pow(Math.max(0, (f - 0.5) / 0.5), 1.5);
      const kz = window.innerWidth < 760 ? 1.6 : 1;
      const raio = (14 + 9 * Math.min(f / 0.5, 1)) * kz + (rFinal - 23 * kz) * abre;
      const alt = (torreY + 7.5) + Math.sin(Math.PI * Math.min(f / 0.55, 1)) * 9 * kz - abre * (torreY + 7.5 - chegada.y);
      pts.push(new THREE.Vector3(C.x + Math.sin(ang) * raio, alt, C.z + Math.cos(ang) * raio));
      /* o olhar vira aos poucos: da cidade para o heliponto e, no fim, para a pista */
      const olharCidade = new THREE.Vector3(longe.x, 22, longe.z);
      const paraHeli = suave(0, 0.6, f);
      const w = Math.pow(Math.max(0, (f - 0.5) / 0.5), 1.3);
      olh.push(new THREE.Vector3().lerpVectors(olharCidade, C, paraHeli).lerp(olharPista, w));
    }
    pts[N - 1].copy(chegada);
    /* pouso longo e suave: a câmera vem descendo junto da pista até a altura de dirigir */
    const PL = 6;
    for (let k = 1; k <= PL; k++) {
      const f = k / PL, e = 1 - Math.pow(1 - f, 2.2);
      const d = (D_POUSO - 60) + 60 * f;
      pts.push(lado(em(d), 2.6, 20 - (20 - 3.4) * e));
      olh.push(lado(em(d + 26), 1.2, 1.9 + (1 - e) * 6));
    }
    trajeto = { pos: new THREE.CatmullRomCurve3(pts, false, "centripetal"), olhar: new THREE.CatmullRomCurve3(olh, false, "centripetal") };
  };

  const suave = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const orbita = new THREE.Vector3(), alvoGiro = new THREE.Vector3();
  const posicionar = () => {
    const p = em(dCam), f = em(dCam + 26), atras = em(dCam - 10);
    const pos = lado(p, 2.6, 3.4);
    olhar.copy(lado(f, 1.2, 1.9));
    let rolagem = clamp(-(f.h - atras.h) * 0.5, -0.06, 0.06);
    /* topo e passagem: um só movimento contínuo. A câmera sai da beira do terraço, contorna o heliponto
       em espiral já se afastando do prédio e descendo, e entra na pista por trás, alinhada com a estrada. */
    const g = passS;
    let modoTerraco = 0;
    if (g < 0.999) {
      if (!trajeto) montarTrajeto();
      /* começo bem lento (a câmera "solta" do terraço), meio fluido e chegada suave */
      const u = clamp(g / 0.98, 0, 1);
      const sR = (u - 0.25) / 0.75;
      const tc = u < 0.25 ? 0.25 * Math.pow(u / 0.25, 2.2) * 0.62 : 0.155 + 0.845 * (1.5 * sR - 0.5 * sR * sR * sR);
      trajeto.pos.getPoint(tc, vTraj);
      trajeto.olhar.getPoint(tc, vOlhar);
      const inicio = 1 - suave(0, 0.2, g);
      vTraj.x += mx * 2 * inicio; vTraj.y -= my * inicio;
      vOlhar.x += mx * 40 * inicio; vOlhar.y -= my * 14 * inicio;
      const fim = suave(0.86, 1, g);
      const posPista = pos.clone(), olharPista = olhar.clone();
      pos.copy(vTraj).lerp(posPista, fim);
      olhar.copy(vOlhar).lerp(olharPista, fim);
      rolagem = rolagem * fim + Math.sin(tc * Math.PI) * 0.32 * suave(0, 0.3, g) * (1 - fim);
      modoTerraco = 1 - suave(0.72, 1, g);
    }
    cena.fog.density = DENS_NEVOA * (1 - modoTerraco) + 0.0032 * modoTerraco;
    cam.position.copy(pos);
    cam.lookAt(olhar);
    cam.rotateZ(rolagem);
    ceu.position.set(pos.x, 0, pos.z);
    const fov = 62 + clamp(Math.abs(vel) * 0.18, 0, 4) + impulso * 3;
    if (Math.abs(cam.fov - fov) > 0.05) { cam.fov += (fov - cam.fov) * 0.12; cam.updateProjectionMatrix(); }
  };

  const ajustar = () => {
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h, false);
    cam.aspect = w / h; cam.updateProjectionMatrix();
  };
  ajustar();
  window.addEventListener("resize", () => { ajustar(); medirAncoras(); trajeto = null; });
  medirAncoras();
  if (window.ScrollTrigger) window.ScrollTrigger.addEventListener("refresh", medirAncoras);
  window.addEventListener("load", medirAncoras);

  if (window.scrollY > window.innerHeight * 3) { passT = passS = 1; }
  let ultimo = performance.now(), visivel = true;
  document.addEventListener("visibilitychange", () => { visivel = !document.hidden; ultimo = performance.now(); });
  const quadro = () => {
    const agora = performance.now(), dt = Math.min((agora - ultimo) / 1000, 0.05); ultimo = agora;
    if (!visivel) return;
    tempo += dt;
    const alvo = dDaRolagem(window.scrollY);
    if (reduz) dCam = alvo;
    else {
      /* limite de velocidade: a estrada nunca passa de VEL_MAX (unidades/s), acelera e freia suave.
         Em saltos grandes (menu), o limite cresce para não demorar demais. */
      const falta = alvo - dCam, limite = VEL_MAX + Math.max(0, Math.abs(falta) - 450) * 0.6;
      const desejada = clamp(falta * 1.6, -limite, limite);
      velCam += (desejada - velCam) * Math.min(1, dt * 2.2);
      dCam += velCam * dt;
      if (Math.abs(falta) < 0.05 && Math.abs(velCam) < 0.2) { dCam = alvo; velCam = 0; }
    }
    vel = (dCam - dAntes) / Math.max(dt, 0.001); dAntes = dCam;
    mx += (alvoMx - mx) * 0.04; my += (alvoMy - my) * 0.04;
    passS += (passT - passS) * Math.min(1, dt * 5);
    if (Math.abs(passT - passS) < 0.0005) passS = passT;
    moverCarros(dt);
    if (cancelas.length) {
      cancelas.forEach((cc) => {
        const perto = dCam > dPraca - 80 + cc.atraso * 12;
        const alvoA = perto ? 1.35 : 0;
        cc.ang += (alvoA - cc.ang) * Math.min(1, dt * 2.6);
        cc.braco.rotation.z = cc.ang;
        cc.luz.material.color.setHex(cc.ang > 0.9 ? 0x3dffa2 : 0xff2a5a);
      });
    }
    if (pino) { pino.position.y = pinoBaseY; }
    posicionar();
    renderer.render(cena, cam);
  };
  if (window.gsap) window.gsap.ticker.add(quadro);
  else { const loop = () => { quadro(); requestAnimationFrame(loop); }; requestAnimationFrame(loop); }

  window.HighwayEstrada = { medirAncoras, trechos: TRECHOS, total: TOTAL, impulso: (v) => { impulso = clamp(v, 0, 1); }, estado: () => ({ d: dCam, v: vel, alvo: dDaRolagem(window.scrollY) }), saltar: () => { const a = dDaRolagem(window.scrollY); dCam = dAntes = a; velCam = 0; vel = 0; passS = passT; }, passagem: (v) => { passT = clamp(v, 0, 1); } };
})();
