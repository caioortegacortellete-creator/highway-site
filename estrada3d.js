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
  cena.fog = new THREE.FogExp2(NEVOA, leve ? 0.0105 : 0.0088);
  const cam = new THREE.PerspectiveCamera(62, 1, 0.1, 1200);

  /* ---------- texturas desenhadas em canvas ---------- */
  const tela = (w, h, fn) => { const c = document.createElement("canvas"); c.width = w; c.height = h; fn(c.getContext("2d"), w, h); return c; };
  const textura = (c, rep) => { const t = new THREE.CanvasTexture(c); if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; } t.anisotropy = 4; return t; };
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
  const TRECHOS = [
    { sel: "#hero", L: 170, giro: 0, sobe: 0, tema: "cidade" },
    { sel: "#caminho", L: 230, giro: -60, sobe: 0, tema: "curva" },
    { sel: ".nichos", L: 80, giro: 0, sobe: 0, tema: "portico" },
    { sel: ".manifesto", L: 170, giro: 42, sobe: 0, tema: "cidade" },
    { sel: "#portfolio", L: 280, giro: 0, sobe: 0, tema: "outdoors" },
    { sel: "#niveis", L: 230, giro: 45, sobe: 18, tema: "rampa" },
    { sel: "#planos", L: 210, giro: 0, sobe: 0, tema: "pedagio" },
    { sel: "#quiz", L: 190, giro: -70, sobe: 0, tema: "elevado" },
    { sel: "#como-funciona", L: 210, giro: 0, sobe: -18, tema: "descida" },
    { sel: ".porque", L: 230, giro: 35, sobe: 0, tema: "tunel" },
    { sel: "#duvidas", L: 190, giro: -35, sobe: 0, tema: "estrada" },
    { sel: "#contato", L: 220, giro: 0, sobe: 0, tema: "chegada" },
    { sel: ".rodape", L: 160, giro: 0, sobe: 0, tema: "chegada" }
  ];
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
    if (i === 0 || tr.sel === ".rodape") return;
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
      const d = outTr.ini + 24 + k * ((outTr.L - 40) / 9), p = em(d), sl = k % 2 ? 1 : -1;
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
  let pino = null, anel = null;
  if (chegTr) {
    const p = em(chegTr.ini + chegTr.L * 0.85);
    pino = new THREE.Group();
    const corpo = new THREE.Mesh(new THREE.ConeGeometry(2.3, 5.5, 24), new THREE.MeshBasicMaterial({ color: COR.m })); corpo.rotation.x = Math.PI; corpo.position.y = 2.75;
    const cabeca = new THREE.Mesh(new THREE.SphereGeometry(2.6, 24, 16), new THREE.MeshBasicMaterial({ color: COR.m })); cabeca.position.y = 6;
    const miolo = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), new THREE.MeshBasicMaterial({ color: 0x0a0c22 })); miolo.position.set(0, 6, 0);
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: texBrilho, color: COR.m, transparent: true, opacity: 0.75, blending: THREE.AdditiveBlending, depthWrite: false })); halo.scale.set(22, 22, 1); halo.position.y = 5;
    pino.add(corpo, cabeca, miolo, halo);
    pino.position.copy(lado(p, 0, 3)); cena.add(pino);
    miolo.position.z = 2.2;
    anel = new THREE.Mesh(new THREE.RingGeometry(3, 3.6, 48), aditivo(COR.m, 0.8)); anel.rotation.x = -Math.PI / 2; anel.position.copy(lado(p, 0, 0.08)); cena.add(anel);
  }

  /* ---------- trânsito: faróis vindo e lanternas indo ---------- */
  const NC = leve ? 26 : 56;
  const carros = Array.from({ length: NC }, (_, k) => {
    const vem = k % 2 === 0;
    return { d: Math.random() * TOTAL, off: vem ? (k % 4 ? -2 : -6) : (k % 3 ? 2 : 6), v: vem ? -rnd(28, 40) : rnd(12, 22), vem };
  });
  const geoCarro = new THREE.BufferGeometry();
  const posC = new Float32Array(NC * 2 * 3), corC = new Float32Array(NC * 2 * 3);
  carros.forEach((c, k) => { const col = c.vem ? [0.9, 0.97, 1] : [1, 0.12, 0.35]; corC.set([...col, ...col], k * 6); });
  geoCarro.setAttribute("position", new THREE.BufferAttribute(posC, 3));
  geoCarro.setAttribute("color", new THREE.BufferAttribute(corC, 3));
  const ptsCarro = new THREE.Points(geoCarro, new THREE.PointsMaterial({ size: 1.5, map: texBrilho, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  ptsCarro.frustumCulled = false; cena.add(ptsCarro);
  const moverCarros = (dt) => {
    carros.forEach((c, k) => {
      if (!reduz) c.d = (c.d + c.v * dt + TOTAL) % TOTAL;
      const p = em(c.d);
      const a = lado(p, c.off - 0.75, 0.75), b = lado(p, c.off + 0.75, 0.75);
      posC.set([a.x, a.y, a.z, b.x, b.y, b.z], k * 6);
    });
    geoCarro.attributes.position.needsUpdate = true;
  };

  /* ---------- rolagem → posição na estrada ---------- */
  let ancoras = [];
  const medirAncoras = () => {
    const sy = window.scrollY, vh = window.innerHeight;
    const maxS = Math.max(1, document.documentElement.scrollHeight - vh);
    ancoras = [{ s: 0, d: 6 }];
    TRECHOS.forEach((tr, i) => {
      if (i === 0) return;
      const el = $(tr.sel); if (!el) return;
      const s = clamp(el.getBoundingClientRect().top + sy - vh * 0.55, 1, maxS);
      if (s > ancoras[ancoras.length - 1].s + 1) ancoras.push({ s, d: tr.ini + 2 });
    });
    ancoras.push({ s: maxS + 1, d: TOTAL - 40 });
  };
  const dDaRolagem = (s) => {
    for (let k = 0; k < ancoras.length - 1; k++) {
      const a = ancoras[k], b = ancoras[k + 1];
      if (s < b.s) return a.d + ((s - a.s) / (b.s - a.s)) * (b.d - a.d);
    }
    return ancoras[ancoras.length - 1].d;
  };

  /* ---------- câmera ---------- */
  let dCam = 6, dAntes = 6, vel = 0, mx = 0, my = 0, alvoMx = 0, alvoMy = 0, tempo = 0;
  window.addEventListener("pointermove", (e) => { alvoMx = e.clientX / window.innerWidth - 0.5; alvoMy = e.clientY / window.innerHeight - 0.5; }, { passive: true });
  const olhar = new THREE.Vector3();
  const posicionar = () => {
    const p = em(dCam), f = em(dCam + 26), atras = em(dCam - 10);
    const pos = lado(p, 2.6 + mx * 1.2, 3.4 + Math.sin(tempo * 0.8) * 0.08);
    cam.position.copy(pos);
    olhar.copy(lado(f, 1.2 + mx * 3, 1.9 - my * 2));
    cam.lookAt(olhar);
    let curva = f.h - atras.h;
    cam.rotateZ(clamp(-curva * 0.9, -0.12, 0.12));
    ceu.position.set(pos.x, 0, pos.z);
    const fov = 62 + clamp(Math.abs(vel) * 0.55, 0, 14);
    if (Math.abs(cam.fov - fov) > 0.05) { cam.fov += (fov - cam.fov) * 0.12; cam.updateProjectionMatrix(); }
  };

  const ajustar = () => {
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h, false);
    cam.aspect = w / h; cam.updateProjectionMatrix();
  };
  ajustar();
  window.addEventListener("resize", () => { ajustar(); medirAncoras(); });
  medirAncoras();
  if (window.ScrollTrigger) window.ScrollTrigger.addEventListener("refresh", medirAncoras);
  window.addEventListener("load", medirAncoras);

  let ultimo = performance.now(), visivel = true;
  document.addEventListener("visibilitychange", () => { visivel = !document.hidden; ultimo = performance.now(); });
  const quadro = () => {
    const agora = performance.now(), dt = Math.min((agora - ultimo) / 1000, 0.05); ultimo = agora;
    if (!visivel) return;
    tempo += dt;
    const alvo = dDaRolagem(window.scrollY);
    if (reduz) dCam = alvo; else dCam += (alvo - dCam) * Math.min(1, dt * 4.2);
    vel = (dCam - dAntes) / Math.max(dt, 0.001); dAntes = dCam;
    mx += (alvoMx - mx) * 0.04; my += (alvoMy - my) * 0.04;
    moverCarros(dt);
    if (texLed && !reduz) texLed.offset.x = (texLed.offset.x + dt * 0.06) % 1;
    if (pino) { pino.position.y = em(chegTr.ini + chegTr.L * 0.85).y + 3 + Math.sin(tempo * 2) * 0.6; pino.rotation.y += dt * 0.6; }
    if (anel) { const s = 1 + ((tempo * 0.6) % 1) * 2.2; anel.scale.set(s, s, s); anel.material.opacity = 0.8 * (1 - ((tempo * 0.6) % 1)); }
    posicionar();
    renderer.render(cena, cam);
  };
  if (window.gsap) window.gsap.ticker.add(quadro);
  else { const loop = () => { quadro(); requestAnimationFrame(loop); }; requestAnimationFrame(loop); }

  window.HighwayEstrada = { medirAncoras, trechos: TRECHOS, total: TOTAL };
})();
