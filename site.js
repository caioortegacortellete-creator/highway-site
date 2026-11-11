/* =========================================================
   HIGHWAY AGÊNCIA · animações e interações
   GSAP + ScrollTrigger + Lenis (carregados por CDN no index.html)
   ========================================================= */
(() => {
  "use strict";

  /* Ajustes rápidos */
  const ABERTURA = true;            // tela de entrada com o logo (só na 1ª visita da sessão)
  const WPP = "5543984124448";      // WhatsApp da Highway

  const raiz = document.documentElement;
  raiz.classList.add("js");
  const reduz = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fino = window.matchMedia("(pointer: fine)").matches;
  const temGSAP = !!(window.gsap && window.ScrollTrigger);
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const linkWpp = (msg) => `https://wa.me/${WPP}?text=${encodeURIComponent(msg)}`;
  const animar = temGSAP && !reduz;

  if (temGSAP) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.defaults({ ease: "power3.out" });
  }

  /* entrada ao rolar: fromTo com valores finais explícitos (sobrevive aos refresh do ScrollTrigger) */
  const CONF = ["duration", "stagger", "ease", "delay", "scrollTrigger", "onComplete"];
  const entrar = (alvo, vars) => {
    const de = {}, para = {};
    Object.keys(vars).forEach((k) => {
      if (CONF.includes(k)) para[k] = vars[k];
      else { de[k] = vars[k]; para[k] = k === "opacity" || k === "scale" ? 1 : 0; }
    });
    return gsap.fromTo(alvo, de, para);
  };

  /* ---------- rolagem suave (Lenis, só no computador) ---------- */
  let lenis = null;
  if (animar && fino && window.Lenis) {
    lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const irPara = (alvo) => {
    const topo = parseFloat(getComputedStyle(raiz).getPropertyValue("--topo-h")) || 70;
    if (lenis) lenis.scrollTo(alvo, { offset: alvo === 0 ? 0 : -topo - 10, duration: 1.4 });
    else if (alvo === 0) window.scrollTo({ top: 0, behavior: reduz ? "auto" : "smooth" });
    else alvo.scrollIntoView({ behavior: reduz ? "auto" : "smooth" });
  };
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute("href");
    if (id.length < 2) return;
    const alvo = id === "#inicio" ? 0 : $(id);
    if (alvo === null) return;
    e.preventDefault();
    fecharMenu();
    irPara(alvo);
  });

  /* ---------- menu do celular e topo fixo ---------- */
  const topoFixo = $("#topoFixo");
  const hamb = $("#hamburguer");
  function fecharMenu() {
    raiz.classList.remove("menu-aberto");
    hamb && hamb.setAttribute("aria-expanded", "false");
    if (lenis) lenis.start();
  }
  hamb && hamb.addEventListener("click", () => {
    const abre = !raiz.classList.contains("menu-aberto");
    raiz.classList.toggle("menu-aberto", abre);
    hamb.setAttribute("aria-expanded", String(abre));
    hamb.setAttribute("aria-label", abre ? "Fechar menu" : "Abrir menu");
    if (lenis) abre ? lenis.stop() : lenis.start();
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") fecharMenu(); });

  let ultY = window.scrollY;
  function aoRolar() {
    const y = window.scrollY;
    topoFixo.classList.toggle("rolou", y > 20);
    if (!raiz.classList.contains("menu-aberto")) topoFixo.classList.toggle("escondido", y > 500 && y > ultY + 2);
    if (y < ultY - 2) topoFixo.classList.remove("escondido");
    ultY = y;
    atualizarAvenida();
    acordarWpp();
  }
  window.addEventListener("scroll", aoRolar, { passive: true });

  /* ---------- abertura ---------- */
  const usarAbertura = ABERTURA && animar && raiz.classList.contains("js-abertura");
  if (usarAbertura) {
    try { sessionStorage.setItem("hw-abertura", "1"); } catch (e) { /* sem storage */ }
  } else raiz.classList.remove("js-abertura");

  /* ---------- título palavra por palavra ---------- */
  function dividirPalavras(el) {
    const novo = document.createDocumentFragment();
    const empacota = (texto, comEm) => {
      texto.split(/(\s+)/).forEach((p) => {
        if (!p) return;
        if (!p.trim()) { novo.appendChild(document.createTextNode(" ")); return; }
        const fora = document.createElement("span");
        fora.className = "pal";
        fora.style.cssText = "display:inline-block;overflow:hidden;vertical-align:top;padding-bottom:.08em;margin-bottom:-.08em";
        const dentro = document.createElement(comEm ? "em" : "span");
        dentro.className = "pal-in";
        dentro.style.display = "inline-block";
        dentro.textContent = p;
        fora.appendChild(dentro);
        novo.appendChild(fora);
      });
    };
    [...el.childNodes].forEach((n) => {
      if (n.nodeType === 3) empacota(n.textContent, false);
      else if (n.tagName === "EM") empacota(n.textContent, true);
      else novo.appendChild(n.cloneNode(true));
    });
    el.textContent = "";
    el.appendChild(novo);
  }

  function introHero() {
    if (!animar) return;
    const tl = gsap.timeline();
    tl.from(".pal-in", { yPercent: 115, duration: 1, stagger: 0.055, ease: "power4.out" })
      .from(".hero .km, .hero-sub, .hero .ctas, .selos", { y: 24, opacity: 0, duration: 0.8, stagger: 0.08 }, "-=0.7")
      .from(".historia", { x: 60, opacity: 0, duration: 1.3, ease: "power4.out" }, "-=1.1")
      .from(".topo-barra", { y: -30, opacity: 0, duration: 0.7, clearProps: "transform,opacity" }, "-=1")
      .add(() => { $$(".pal").forEach((p) => { p.style.overflow = "visible"; }); });
  }

  if (animar) dividirPalavras($("#hero-titulo"));

  function rodarAbertura(fim) {
    const ab = $("#abertura");
    if (!usarAbertura) { ab && ab.remove(); fim(); return; }
    if (lenis) lenis.stop();
    const tl = gsap.timeline({
      onComplete: () => { ab.remove(); raiz.classList.remove("js-abertura"); if (lenis) lenis.start(); }
    });
    tl.from(".abertura-logo img", { scale: 0.6, opacity: 0, rotation: -8, duration: 0.7, ease: "back.out(1.6)" })
      .from(".abertura-logo span", { letterSpacing: "0.9em", opacity: 0, duration: 0.7 }, "-=0.45")
      .to(".abertura-velocidade", { opacity: 0.55, backgroundPosition: "-1800px 0", duration: 0.9, ease: "power2.in" }, 0.2)
      .to(".abertura-logo", { scale: 1.15, opacity: 0, duration: 0.45, ease: "power2.in" }, 1.15)
      .to(ab, { clipPath: "inset(50% 0% 50% 0%)", duration: 0.75, ease: "power4.inOut" }, 1.3)
      .add(fim, 1.45);
  }

  /* ---------- avenida do topo (canvas): pista, postes neon, cidade e carros ---------- */
  const cv = $("#heroEstrada");
  const hero = $("#hero");
  let alvoX = 0, alvoY = 0, velExtra = 0;
  if (cv && cv.getContext) {
    const ctx = cv.getContext("2d");
    const C = "41,236,255", M = "255,61,242", R = "179,80,255", B = "238,241,255", A = "255,184,77";
    const LARG = 3.6, CAM = 1.75, LONGE = 120, VAO = 13, TRACO = 9;
    let W = 0, H = 0, vx = 0, hy = 0, f = 1, perto = 1, mx = 0, my = 0, camX = 0.9, dist = 0, tempo = 0, visivel = true;
    let cidade = null, cidadeH = 0, antenas = [];
    const novoCarro = (k, inicio) => {
      const vem = k % 2 === 0;
      const faixa = vem ? (k % 4 === 0 ? -2.7 : -0.9) : (k % 3 === 0 ? 2.7 : 0.9);
      return { vem, x: faixa, z: inicio ? 4 + Math.random() * LONGE : LONGE + Math.random() * 40, v: vem ? 0.9 + Math.random() * 0.5 : 0.18 + Math.random() * 0.3 };
    };
    const carros = Array.from({ length: 14 }, (_, k) => novoCarro(k, true));
    const proj = (x, y, z) => [vx + (x - camX) * f / z, hy + (CAM - y) * f / z];
    const neblina = (z) => Math.pow(clamp(1 - z / LONGE, 0, 1), 0.9);

    const montarCidade = () => {
      cidade = document.createElement("canvas");
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      cidadeH = hy + 2;
      cidade.width = Math.round((W + 40) * dpr); cidade.height = Math.round(cidadeH * dpr);
      const c = cidade.getContext("2d");
      c.setTransform(dpr, 0, 0, dpr, 20, 0);
      for (let i = 0; i < 70; i++) {
        c.fillStyle = `rgba(${B},${0.15 + Math.random() * 0.5})`;
        c.fillRect(Math.random() * W, Math.random() * hy * 0.7, 1.2, 1.2);
      }
      antenas = [];
      const camadas = [{ alt: 0.2, cor: ["#0c0e2c", "#090a22"], luz: 0.12 }, { alt: 0.13, cor: ["#121540", "#0b0d2a"], luz: 0.22 }];
      camadas.forEach((cam, ci) => {
        let x = -20;
        while (x < W + 20) {
          const perto_vp = 1 - Math.min(1, Math.abs(x - vx) / (W * 0.55));
          const w = 22 + Math.random() * 60;
          const h = H * (0.025 + Math.random() * cam.alt * (0.45 + perto_vp * 0.8));
          const g = c.createLinearGradient(0, hy - h, 0, hy);
          g.addColorStop(0, cam.cor[0]); g.addColorStop(1, cam.cor[1]);
          c.fillStyle = g; c.fillRect(x, hy - h, w, h + 2);
          if (Math.random() < 0.35) {
            c.fillStyle = `rgba(${Math.random() < 0.5 ? C : M},${ci ? 0.55 : 0.3})`;
            c.fillRect(x, hy - h, w, 1.5);
          }
          for (let yy = hy - h + 6; yy < hy - 4; yy += 7) {
            for (let xx = x + 4; xx < x + w - 4; xx += 6) {
              if (Math.random() < cam.luz) {
                const r = Math.random();
                c.fillStyle = r < 0.55 ? `rgba(${A},${0.35 + Math.random() * 0.4})` : r < 0.8 ? `rgba(${C},.55)` : `rgba(${M},.5)`;
                c.fillRect(xx, yy, 2, 3);
              }
            }
          }
          if (ci === 1 && h > H * 0.11 && Math.random() < 0.5) antenas.push([x + w / 2, hy - h - 6]);
          x += w + (ci ? 3 : 8) + Math.random() * 6;
        }
      });
    };

    const medir = () => {
      const r = hero.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      W = r.width; H = r.height;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const estreito = W < 900;
      vx = estreito ? W * 0.5 : W * 0.66;
      hy = estreito ? H * 0.5 : H * 0.42;
      f = estreito ? H * 0.75 : H * 1.05;
      perto = CAM * f / (H + 30 - hy);
      montarCidade();
    };

    const quad = (x1, x2, z1, z2) => {
      const a = proj(x1, 0, z1), b = proj(x2, 0, z1), c = proj(x2, 0, z2), d = proj(x1, 0, z2);
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); ctx.lineTo(d[0], d[1]); ctx.closePath();
    };
    const linhaLonga = (x, larg, rgb, forca) => {
      const g = ctx.createLinearGradient(0, hy, 0, H);
      g.addColorStop(0, `rgba(${rgb},0)`); g.addColorStop(0.25, `rgba(${rgb},${forca * 0.5})`); g.addColorStop(1, `rgba(${rgb},${forca})`);
      ctx.fillStyle = g;
      quad(x - larg / 2, x + larg / 2, perto * 0.6, LONGE); ctx.fill();
    };
    const brilho = (x, y, raio, rgb, a) => {
      if (raio < 0.5) return;
      const g = ctx.createRadialGradient(x, y, 0, x, y, raio);
      g.addColorStop(0, `rgba(255,255,255,${a})`); g.addColorStop(0.18, `rgba(${rgb},${a * 0.8})`); g.addColorStop(1, `rgba(${rgb},0)`);
      ctx.fillStyle = g; ctx.fillRect(x - raio, y - raio, raio * 2, raio * 2);
    };

    const desenha = (dt) => {
      const vel = 15 * (1 + velExtra);
      tempo += dt;
      dist += dt * vel;
      velExtra *= 0.94;
      mx += (alvoX - mx) * 0.05; my += (alvoY - my) * 0.05;
      const estreito = W < 900;
      vx = (estreito ? W * 0.5 : W * 0.66) + mx * 70;
      hy = (estreito ? H * 0.5 : H * 0.42) + my * 18;
      camX = 0.9 + mx * 1.4;
      ctx.clearRect(0, 0, W, H);

      /* céu e brilho da cidade no horizonte */
      const ceu = ctx.createRadialGradient(vx, hy, 0, vx, hy, Math.max(W, H) * 0.75);
      ceu.addColorStop(0, `rgba(${M},.42)`); ceu.addColorStop(0.18, `rgba(${R},.28)`); ceu.addColorStop(0.5, "rgba(47,91,255,.08)"); ceu.addColorStop(1, "rgba(6,8,22,0)");
      ctx.fillStyle = ceu; ctx.fillRect(0, 0, W, H);
      const cy0 = hy - cidadeH + 2, cx0 = -20 - mx * 18;
      if (cidade) ctx.drawImage(cidade, cx0, cy0, W + 40, cidadeH);
      ctx.globalCompositeOperation = "lighter";
      antenas.forEach(([ax, ay], i) => { if (Math.sin(tempo * 2.4 + i * 1.7) > 0.4) brilho(ax + 20 + cx0, ay + cy0, 5, "255,60,90", 0.9); });
      ctx.globalCompositeOperation = "source-over";

      /* chão, calçadas e asfalto */
      const chao = ctx.createLinearGradient(0, hy, 0, H);
      chao.addColorStop(0, "#120f33"); chao.addColorStop(1, "#05060f");
      ctx.fillStyle = chao; ctx.fillRect(0, hy, W, H - hy);
      ctx.fillStyle = "rgba(255,61,242,.55)"; ctx.fillRect(0, hy - 1, W, 1.5);
      ctx.fillStyle = "#0f1230"; quad(-LARG - 2.2, LARG + 2.2, perto * 0.6, LONGE); ctx.fill();
      const asf = ctx.createLinearGradient(0, hy, 0, H);
      asf.addColorStop(0, "#1a1745"); asf.addColorStop(1, "#0b0d24");
      ctx.fillStyle = asf; quad(-LARG, LARG, perto * 0.6, LONGE); ctx.fill();

      ctx.globalCompositeOperation = "lighter";
      /* poças de luz dos postes (desenhadas antes das faixas) */
      const postes = [];
      [-1, 1].forEach((lado) => {
        const off = lado < 0 ? 0 : VAO / 2;
        for (let k = 0; k < LONGE / VAO + 2; k++) {
          const z = k * VAO + off - (dist % VAO);
          if (z < perto * 0.45 || z > LONGE) continue;
          postes.push({ z, lado });
        }
      });
      postes.forEach(({ z, lado }) => {
        const nev = neblina(z), rgb = lado < 0 ? C : M;
        const xl = lado * (LARG - 0.6);
        const [px, py] = proj(xl, 0, z);
        const rx = Math.min(2.6 * f / z, W);
        const ry = Math.max(1, (proj(xl, 0, z - 1.4)[1] - proj(xl, 0, z + 1.4)[1]) / 2);
        ctx.save(); ctx.translate(px, py); ctx.scale(1, ry / rx);
        const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
        g.addColorStop(0, `rgba(${rgb},${0.34 * nev})`); g.addColorStop(0.5, `rgba(${rgb},${0.1 * nev})`); g.addColorStop(1, `rgba(${rgb},0)`);
        ctx.fillStyle = g; ctx.fillRect(-rx, -rx, rx * 2, rx * 2);
        ctx.restore();
        /* reflexo no asfalto molhado */
        const rl = Math.min(ry * 7, H - py + 10), rw = Math.max(1, rx * 0.12);
        const gr = ctx.createLinearGradient(0, py, 0, py + rl);
        gr.addColorStop(0, `rgba(${rgb},${0.28 * nev})`); gr.addColorStop(1, `rgba(${rgb},0)`);
        ctx.fillStyle = gr; ctx.fillRect(px - rw / 2, py, rw, rl);
      });

      /* faixas: bordas neon, faixa dupla central e tracejados */
      linhaLonga(-LARG, 0.16, C, 1); linhaLonga(-LARG, 0.9, C, 0.16);
      linhaLonga(LARG, 0.16, M, 1); linhaLonga(LARG, 0.9, M, 0.16);
      linhaLonga(-0.11, 0.07, R, 0.95); linhaLonga(0.11, 0.07, R, 0.95); linhaLonga(0, 0.6, R, 0.12);
      [-1.8, 1.8].forEach((x) => {
        for (let k = 0; k < LONGE / TRACO + 1; k++) {
          const z1 = k * TRACO - (dist % TRACO) + perto * 0.6;
          const z2 = z1 + 3.2;
          if (z2 < perto * 0.6 || z1 > LONGE) continue;
          ctx.fillStyle = `rgba(${B},${0.7 * neblina(z1)})`;
          quad(x - 0.06, x + 0.06, Math.max(z1, perto * 0.6), z2); ctx.fill();
        }
      });

      /* carros: faróis vindo, lanternas indo, com rastro de luz */
      carros.forEach((c, k) => {
        if (!reduz) c.z -= vel * c.v * dt;
        if (c.z < perto * 0.5) carros[k] = novoCarro(k, false);
        if (c.z > LONGE) return;
        const nev = neblina(c.z);
        const rgb = c.vem ? B : "255,40,90", alt = c.vem ? 0.55 : 0.65;
        const rastroZ = c.z + (c.vem ? 9 : 5) * (1 + velExtra);
        [-0.42, 0.42].forEach((dx) => {
          const a = proj(c.x + dx, alt, c.z), b = proj(c.x + dx, alt, rastroZ);
          const lg = ctx.createLinearGradient(b[0], b[1], a[0], a[1]);
          lg.addColorStop(0, `rgba(${c.vem ? C : M},0)`); lg.addColorStop(1, `rgba(${rgb},${0.85 * nev})`);
          ctx.strokeStyle = lg; ctx.lineWidth = clamp(0.16 * f / c.z, 0.6, 9); ctx.lineCap = "round";
          ctx.beginPath(); ctx.moveTo(b[0], b[1]); ctx.lineTo(a[0], a[1]); ctx.stroke();
          brilho(a[0], a[1], clamp(0.5 * f / c.z, 1, 60), c.vem ? C : M, 0.85 * nev);
        });
      });

      /* postes: do mais longe para o mais perto */
      postes.sort((a, b) => b.z - a.z).forEach(({ z, lado }) => {
        const nev = neblina(z), rgb = lado < 0 ? C : M;
        const xp = lado * (LARG + 1.3), xl = lado * (LARG - 0.6);
        const base = proj(xp, 0, z), topo = proj(xp, 6.2, z), curva = proj(xp, 6.9, z), lamp = proj(xl, 6.25, z);
        const esp = clamp(0.2 * f / z, 1, 16);
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = `rgba(14,16,44,${0.4 + 0.6 * nev})`; ctx.lineWidth = esp; ctx.lineCap = "butt";
        ctx.beginPath(); ctx.moveTo(base[0], base[1]); ctx.lineTo(topo[0], topo[1]); ctx.quadraticCurveTo(curva[0], curva[1], lamp[0], lamp[1]); ctx.stroke();
        ctx.globalCompositeOperation = "lighter";
        ctx.strokeStyle = `rgba(${rgb},${0.55 * nev})`; ctx.lineWidth = Math.max(0.6, esp * 0.22);
        ctx.beginPath(); ctx.moveTo(base[0], base[1]); ctx.lineTo(topo[0], topo[1]); ctx.quadraticCurveTo(curva[0], curva[1], lamp[0], lamp[1]); ctx.stroke();
        /* cone de luz */
        const c1 = proj(xl - 1.9, 0, z), c2 = proj(xl + 1.9, 0, z);
        const gc = ctx.createLinearGradient(0, lamp[1], 0, c1[1]);
        gc.addColorStop(0, `rgba(${rgb},${0.2 * nev})`); gc.addColorStop(1, `rgba(${rgb},0)`);
        ctx.fillStyle = gc;
        ctx.beginPath(); ctx.moveTo(lamp[0] - esp * 0.6, lamp[1]); ctx.lineTo(lamp[0] + esp * 0.6, lamp[1]); ctx.lineTo(c2[0], c2[1]); ctx.lineTo(c1[0], c1[1]); ctx.closePath(); ctx.fill();
        brilho(lamp[0], lamp[1], clamp(1.3 * f / z, 3, 130), rgb, 0.95 * nev);
      });
      ctx.globalCompositeOperation = "source-over";
      ctx.lineCap = "butt";
    };
    let ult = performance.now();
    const loop = (agora) => {
      const dt = Math.min((agora - ult) / 1000, 0.05); ult = agora;
      if (visivel) desenha(dt);
      requestAnimationFrame(loop);
    };
    medir(); desenha(0);
    if (!reduz) requestAnimationFrame(loop);
    let tRes = null;
    window.addEventListener("resize", () => { clearTimeout(tRes); tRes = setTimeout(() => { medir(); desenha(0); }, 120); });
    if ("IntersectionObserver" in window) new IntersectionObserver((e) => { visivel = e[0].isIntersecting; }).observe(hero);
  }

  /* ---------- história animada do topo (busca → site → topo do Google → WhatsApp → projetos → marca) ---------- */
  const hist = $("#historia");
  if (hist) {
    const leg = $("#histLegenda");
    const cena = (n) => $(".hc-" + n, hist);
    const marcos = $$(".hist-rota b", hist);
    const carroRota = $(".hist-carro", hist);
    const escrever = (simples, destaque) => {
      leg.textContent = "";
      const add = (txt, em) => txt.split(" ").filter(Boolean).forEach((p) => {
        const s = document.createElement(em ? "em" : "span");
        s.className = "w"; s.textContent = p; leg.appendChild(s);
      });
      add(simples, false); add(destaque, true);
      return $$(".w", leg);
    };
    const legenda = (tl, pos, simples, destaque) => {
      tl.call(() => {
        const ws = escrever(simples, destaque);
        gsap.fromTo(ws, { opacity: 0, y: 10, filter: "blur(10px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.7, stagger: 0.07, ease: "power2.out" });
      }, null, pos);
    };
    const tirarLegenda = (tl, pos) => tl.call(() => gsap.to($$(".w", leg), { opacity: 0, filter: "blur(8px)", y: -6, duration: 0.4, stagger: 0.02 }), null, pos);
    const marcar = (tl, pos, k) => tl.call(() => {
      marcos.forEach((m, i) => m.classList.toggle("on", i <= k));
      gsap.to(carroRota, { left: (k / (marcos.length - 1)) * 100 + "%", duration: 0.9, ease: "power2.inOut" });
    }, null, pos);
    const entra = (tl, el, pos) => tl.fromTo(el, { autoAlpha: 0, filter: "blur(10px)", scale: 0.97 }, { autoAlpha: 1, filter: "blur(0px)", scale: 1, duration: 0.6, ease: "power2.out" }, pos);
    const sai = (tl, el, pos) => tl.to(el, { autoAlpha: 0, filter: "blur(10px)", scale: 1.02, duration: 0.5, ease: "power2.in" }, pos);
    const digitar = (tl, el, texto, pos, dur) => {
      const o = { n: 0 };
      tl.fromTo(o, { n: 0 }, { n: texto.length, duration: dur, ease: "none", onUpdate: () => { el.textContent = texto.slice(0, Math.round(o.n)); } }, pos);
    };
    const contar = (tl, el, de, ate, pos, dur) => {
      const o = { v: de };
      tl.fromTo(o, { v: de }, { v: ate, duration: dur, ease: "power2.out", onUpdate: () => { el.textContent = Math.round(o.v); } }, pos);
    };

    if (!animar) {
      hist.classList.add("sem-hist");
      escrever("Projetos conceito,", "cada um único.");
      marcos.forEach((m, i) => m.classList.toggle("on", i <= 4));
      carroRota.style.left = "80%";
    } else {
      const tl = gsap.timeline({ repeat: -1, paused: true, defaults: { ease: "power2.out" } });
      /* 1 · busca */
      const cb = cena("busca"), num = $(".hc-num", cb), met = $(".hc-metrica", cb), rot = $(".hc-rotulo", cb), mil = $(".hc-mil", cb);
      tl.addLabel("busca");
      marcar(tl, "busca", 0);
      tl.call(() => { $(".hc-digita", cb).textContent = ""; num.textContent = "0"; rot.textContent = "Buscas por mês"; met.classList.remove("zero"); mil.style.opacity = 1; });
      entra(tl, cb, "busca");
      tl.fromTo($$(".hc-linha", cb), { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, stagger: 0.12, duration: 0.4 }, "busca+=0.3");
      digitar(tl, $(".hc-digita", cb), "clínica de estética perto de mim", "busca+=0.4", 1.5);
      tl.fromTo(met, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.5 }, "busca+=0.6");
      contar(tl, num, 0, 18, "busca+=0.8", 1.4);
      tl.call(() => { rot.textContent = "Chegam até você"; met.classList.add("zero"); mil.style.opacity = 0; }, null, "busca+=2.6");
      contar(tl, num, 18, 0, "busca+=2.6", 0.8);
      legenda(tl, "busca+=2.8", "Seu cliente busca.", "Não te acha.");
      tirarLegenda(tl, "busca+=5");
      sai(tl, cb, "busca+=5");

      /* 2 · o site */
      const cs = cena("site");
      tl.addLabel("site", "busca+=5.5");
      marcar(tl, "site", 1);
      legenda(tl, "site", "Primeiro,", "um site que convence.");
      tl.set(cs, { autoAlpha: 1, filter: "blur(0px)", scale: 1 }, "site");
      tl.fromTo([$(".hs-barra", cs), $(".hs-titulo", cs), $(".hs-foto", cs), $(".hs-texto", cs), $(".hs-wpp", cs), ...$$(".hs-cards i", cs)],
        { autoAlpha: 0, y: 16, filter: "blur(8px)" }, { autoAlpha: 1, y: 0, filter: "blur(0px)", stagger: 0.16, duration: 0.5 }, "site+=0.2");
      tl.fromTo($$(".hs-titulo i", cs), { scaleX: 0, transformOrigin: "left" }, { scaleX: 1, stagger: 0.12, duration: 0.5 }, "site+=0.5");
      tl.to($(".hs-wpp", cs), { scale: 1.08, duration: 0.25, yoyo: true, repeat: 3, ease: "power1.inOut" }, "site+=2.2");
      tirarLegenda(tl, "site+=4");
      sai(tl, cs, "site+=4");

      /* 3 · topo da busca */
      const ct = cena("topo"), voce = $(".hc-voce", ct);
      tl.addLabel("topo", "site+=4.5");
      marcar(tl, "topo", 2);
      entra(tl, ct, "topo");
      tl.fromTo($$(".hc-resultados .hc-linha", ct), { y: -52 }, { y: 0, duration: 0.6, ease: "power3.out" }, "topo+=0.5");
      tl.fromTo(voce, { autoAlpha: 0, y: -16, scale: 0.96 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.6, ease: "back.out(1.6)" }, "topo+=0.5");
      tl.fromTo($(".hc-mapa", ct), { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.5 }, "topo+=0.9");
      tl.fromTo($(".hc-mapa svg", ct), { y: -40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8, ease: "bounce.out" }, "topo+=1.1");
      legenda(tl, "topo+=0.6", "Depois,", "o topo da busca.");
      tirarLegenda(tl, "topo+=4");
      sai(tl, ct, "topo+=4");

      /* 4 · WhatsApp */
      const cc = cena("chat"), msgs = $$(".hc-msg", cc);
      tl.addLabel("chat", "topo+=4.5");
      marcar(tl, "chat", 3);
      tl.set(cc, { autoAlpha: 1, filter: "blur(0px)", scale: 1 }, "chat");
      tl.fromTo(msgs, { autoAlpha: 0, y: 26, scale: 0.96, filter: "blur(0px)" }, { autoAlpha: 1, y: 0, scale: 1, filter: "blur(0px)", stagger: 0.55, duration: 0.5, ease: "back.out(1.5)" }, "chat+=0.1");
      legenda(tl, "chat+=0.8", "Aí", "ele chama no WhatsApp.");
      tl.to(msgs.slice(0, 2), { autoAlpha: 0.35, filter: "blur(2px)", stagger: 0.2, duration: 0.4 }, "chat+=3");
      tirarLegenda(tl, "chat+=4");
      sai(tl, cc, "chat+=4");

      /* 5 · projetos */
      const cp = cena("proj"), imgs = $$("img", cp);
      tl.addLabel("proj", "chat+=4.5");
      marcar(tl, "proj", 4);
      tl.set(cp, { autoAlpha: 1, filter: "blur(0px)", scale: 1 }, "proj");
      tl.fromTo(imgs, { autoAlpha: 0, scale: 0.85, filter: "blur(10px)" }, { autoAlpha: 1, scale: 1, filter: "blur(0px)", stagger: 0.14, duration: 0.6 }, "proj+=0.1");
      legenda(tl, "proj+=0.4", "Projetos conceito,", "cada um único.");
      tirarLegenda(tl, "proj+=4");
      sai(tl, cp, "proj+=4");

      /* 6 · marca */
      const cm = cena("marca");
      tl.addLabel("marca", "proj+=4.5");
      marcar(tl, "marca", 5);
      tl.set(cm, { autoAlpha: 1, filter: "blur(0px)", scale: 1 }, "marca");
      tl.fromTo($("img", cm), { autoAlpha: 0, scale: 0.6, rotation: -10 }, { autoAlpha: 1, scale: 1, rotation: 0, duration: 0.7, ease: "back.out(1.7)" }, "marca+=0.1");
      tl.fromTo($("strong", cm), { autoAlpha: 0, letterSpacing: "0.7em" }, { autoAlpha: 1, letterSpacing: "0.24em", duration: 0.9 }, "marca+=0.3");
      tl.fromTo($("small", cm), { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.5 }, "marca+=0.8");
      sai(tl, cm, "marca+=3.2");
      tl.to({}, { duration: 0.3 });

      let rodando = false;
      const ligar = (sim) => { if (sim && !rodando) { tl.play(); rodando = true; } else if (!sim && rodando) { tl.pause(); rodando = false; } };
      if ("IntersectionObserver" in window) new IntersectionObserver((e) => ligar(e[0].isIntersecting), { threshold: 0.15 }).observe(hist);
      else ligar(true);
    }
  }

  /* inclinação suave da história e a avenida seguindo o mouse */
  if (animar && fino && hero) {
    const moldura = $(".hist-moldura");
    const rx = moldura && gsap.quickTo(moldura, "rotationX", { duration: 0.9 }), ry = moldura && gsap.quickTo(moldura, "rotationY", { duration: 0.9 });
    hero.addEventListener("pointermove", (e) => {
      const r = hero.getBoundingClientRect();
      alvoX = (e.clientX - r.left) / r.width - 0.5;
      alvoY = (e.clientY - r.top) / r.height - 0.5;
      if (moldura) { ry(alvoX * 8); rx(-alvoY * 6); }
    });
    hero.addEventListener("pointerleave", () => { alvoX = alvoY = 0; if (moldura) { ry(0); rx(0); } });
  }
  if (animar) {
    gsap.to(".hero-txt", { y: -80, opacity: 0.2, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true } });
    gsap.to(".historia", { y: 60, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true } });
    ScrollTrigger.create({ trigger: hero, start: "top top", end: "bottom top", onUpdate: (s) => { velExtra = Math.min(3, Math.abs(s.getVelocity()) / 900); } });
  }

  /* ---------- luz do menu que desliza até o link ---------- */
  const menuEl = $("#menu"), menuLuz = $("#menuLuz");
  const moverLuz = (a) => {
    if (!menuLuz || window.innerWidth <= 900) return;
    $$(".menu a").forEach((x) => x.classList.toggle("luz-aqui", x === a));
    if (!a) { menuLuz.style.opacity = 0; return; }
    menuLuz.style.left = a.offsetLeft + "px";
    menuLuz.style.width = a.offsetWidth + "px";
    menuLuz.style.opacity = 1;
  };
  if (menuEl) {
    $$(".menu a:not(.menu-wpp)").forEach((a) => a.addEventListener("pointerenter", () => moverLuz(a)));
    menuEl.addEventListener("pointerleave", () => moverLuz($(".menu a.atual")));
  }

  /* ---------- KM 02 · caminho do cliente ---------- */
  const termos = ["clínica de estética perto de mim", "advogado de família em Londrina", "ótica perto de mim", "dentista aberto sábado", "psicóloga em Maringá", "contador para MEI"];
  const termoEl = $("#termoBusca");
  if (termoEl && !reduz) {
    let t = 0, c = termos[0].length, apagando = true;
    const digita = () => {
      const alvo = termos[t];
      if (apagando) {
        c--;
        if (c <= 0) { apagando = false; t = (t + 1) % termos.length; }
      } else {
        c++;
        if (c >= termos[t].length) { apagando = true; termoEl.textContent = termos[t]; setTimeout(digita, 2200); return; }
      }
      termoEl.textContent = (apagando ? alvo : termos[t]).slice(0, Math.max(c, 0));
      setTimeout(digita, apagando ? 28 : 55);
    };
    setTimeout(digita, 2600);
  }
  if (animar) {
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1081px)", () => {
      const cenas = $$(".cena");
      gsap.set(cenas, { opacity: 0.18, y: 40, "--prog": 0 });
      const tl = gsap.timeline({ scrollTrigger: { trigger: ".caminho", start: "top top", end: "+=220%", pin: true, scrub: 0.8, anticipatePin: 1 } });
      tl.from(".caminho .cab", { y: 40, opacity: 0, duration: 0.6 });
      cenas.forEach((cena, k) => {
        tl.to(cena, { opacity: 1, y: 0, duration: 0.6 }, k === 0 ? ">-0.2" : ">")
          .to(cena, { "--prog": 1, duration: 0.6, ease: "none" }, "<");
        if (k === 1) tl.from(".resultado.vazio", { scale: 0.85, opacity: 0, duration: 0.4, ease: "back.out(2)" }, "<0.2");
        if (k === 2) tl.from(".cena-site img", { scale: 1.3, rotation: -4, opacity: 0, duration: 0.6 }, "<");
        if (k === 3) tl.from(".balao", { y: 24, opacity: 0, stagger: 0.25, duration: 0.4 }, "<0.1");
        if (k < cenas.length - 1) tl.to(cena, { opacity: 0.55, duration: 0.4 }, ">");
      });
      tl.to(cenas, { opacity: 1, duration: 0.4 });
      return () => gsap.set(cenas, { clearProps: "all" });
    });
    mm.add("(max-width: 1080px)", () => {
      $$(".cena").forEach((cena) => {
        entrar(cena, { y: 50, opacity: 0, duration: 0.8, scrollTrigger: { trigger: cena, start: "top 85%" } });
        const baloes = $$(".balao", cena);
        if (baloes.length) entrar(baloes, { y: 20, opacity: 0, stagger: 0.3, duration: 0.5, scrollTrigger: { trigger: cena, start: "top 70%" } });
      });
    });
  }

  /* ---------- KM 03 · faixa de nichos ---------- */
  const trilhoNichos = $(".esteira-trilho");
  if (trilhoNichos) {
    trilhoNichos.innerHTML += trilhoNichos.innerHTML;
    $$("span", trilhoNichos).forEach((s, k, arr) => { if (k >= arr.length / 2) s.setAttribute("aria-hidden", "true"); });
    if (animar) {
      const esteira = gsap.to(trilhoNichos, { xPercent: -50, duration: 34, ease: "none", repeat: -1 });
      let dir = 1;
      ScrollTrigger.create({
        trigger: ".nichos", start: "top bottom", end: "bottom top",
        onUpdate: (s) => {
          dir = s.direction;
          const v = clamp(Math.abs(s.getVelocity()) / 260, 0, 6);
          gsap.to(esteira, { timeScale: dir * (1 + v), duration: 0.2, overwrite: true });
          gsap.to(esteira, { timeScale: dir, duration: 1.2, delay: 0.2, overwrite: false });
        }
      });
    }
  }

  /* ---------- KM 04 · manifesto ---------- */
  const manif = $("#manifesto-texto");
  if (manif) {
    const quebra = (no) => {
      [...no.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const f = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((p) => {
            if (!p) return;
            if (!p.trim()) { f.appendChild(document.createTextNode(" ")); return; }
            const s = document.createElement("span"); s.className = "p"; s.textContent = p; f.appendChild(s);
          });
          n.replaceWith(f);
        } else if (n.nodeType === 1) quebra(n);
      });
    };
    quebra(manif);
    const pals = $$(".p", manif);
    const acender = (k) => { const n = Math.round(k * pals.length); pals.forEach((s, i) => s.classList.toggle("on", i < n)); };
    if (animar) {
      ScrollTrigger.create({ trigger: manif, start: "top 80%", end: "bottom 40%", scrub: true, onUpdate: (s) => acender(s.progress) });
    } else acender(1);
  }

  /* ---------- KM 04 · portfólio em carrossel 3D por nível + visor com o site de verdade ---------- */
  const NIVEIS = {
    1: { nome: "Nível 1 · Essencial", txt: "Uma página direta, rápida no celular, com botão de WhatsApp e mapa. A partir de R$ 597,90." },
    2: { nome: "Nível 2 · Profissional", txt: "Mais seções para passar confiança: equipe, galeria, avaliações, perguntas e formulário. A partir de R$ 997,90." },
    3: { nome: "Nível 3 · Premium", txt: "Topo interativo, teste que indica o serviço, agendamento e páginas por serviço. A partir de R$ 1.297,90." }
  };
  const cf = $("#coverflow");
  let visorAberto = false, fecharVisor = () => {};
  if (cf) {
    const cards = $$(".cf-card", cf), N = cards.length;
    const secao = $("#portfolio");
    const infoNv = $("#cfInfoNv"), infoNome = $("#cfInfoNome"), infoDesc = $("#cfInfoDesc"), nivelTxt = $("#cfNivelTxt"), carroCf = $("#cfCarro");
    const botoesNv = $$(".cf-nv");
    let pos = 0, alvo = 0, atualIdx = -1, nivelAtual = 0, stCf = null;

    const atualizarInfo = (k) => {
      const c = cards[k], nv = +c.dataset.nivel;
      const trocar = () => { infoNv.textContent = NIVEIS[nv].nome; infoNome.textContent = c.dataset.nome; infoDesc.textContent = c.dataset.local; };
      if (animar) gsap.fromTo([infoNv, infoNome, infoDesc], { opacity: 0, y: 8, filter: "blur(6px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.45, stagger: 0.05, overwrite: true, onStart: trocar });
      else trocar();
      if (nv !== nivelAtual) {
        nivelAtual = nv;
        secao.style.setProperty("--nv-atual", `var(--n${nv})`);
        nivelTxt.textContent = NIVEIS[nv].txt;
        if (animar) gsap.fromTo(nivelTxt, { opacity: 0, x: 12 }, { opacity: 1, x: 0, duration: 0.5 });
        botoesNv.forEach((b) => b.classList.toggle("ativo", +b.dataset.ir === nv));
      }
    };
    const desenhar = () => {
      const estreito = window.innerWidth < 760;
      const passo = cards[0].offsetWidth * (estreito ? 0.66 : 0.52);
      cards.forEach((c, i) => {
        const d = i - pos, ad = Math.abs(d);
        const x = Math.sign(d) * (Math.min(ad, 1) * passo + Math.max(0, ad - 1) * passo * 0.4);
        const rot = -Math.sign(d) * Math.min(ad, 1.4) * (estreito ? 26 : 34);
        const z = -Math.min(ad, 4) * (estreito ? 110 : 170);
        c.style.transform = `translate3d(${x.toFixed(1)}px,0,${z.toFixed(1)}px) rotateY(${rot.toFixed(2)}deg)`;
        c.style.zIndex = String(100 - Math.round(ad * 10));
        c.style.opacity = clamp(3.6 - ad, 0, 1).toFixed(3);
        c.style.setProperty("--esc", clamp(ad * 0.34, 0, 0.72).toFixed(3));
        c.style.visibility = ad > 3.7 ? "hidden" : "visible";
        c.classList.toggle("centro", ad < 0.5);
        c.tabIndex = ad < 0.5 ? 0 : -1;
      });
      carroCf.style.left = ((pos + 0.5) / N) * 100 + "%";
      const k = clamp(Math.round(pos), 0, N - 1);
      if (k !== atualIdx) { atualIdx = k; atualizarInfo(k); }
    };
    desenhar();
    if (temGSAP && !reduz) {
      gsap.ticker.add(() => {
        if (Math.abs(alvo - pos) < 0.0005) return;
        pos += (alvo - pos) * 0.12;
        if (Math.abs(alvo - pos) < 0.0005) pos = alvo;
        desenhar();
      });
    }
    const mover = (i) => { alvo = clamp(i, 0, N - 1); if (!temGSAP || reduz) { pos = alvo; desenhar(); } };
    const irCard = (i) => {
      i = clamp(i, 0, N - 1);
      if (stCf) {
        const y = stCf.start + (stCf.end - stCf.start) * (i / (N - 1));
        if (lenis) lenis.scrollTo(y, { duration: 1.1 }); else window.scrollTo({ top: y, behavior: "smooth" });
      } else mover(i);
    };
    window.addEventListener("resize", desenhar);

    if (animar) {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 901px)", () => {
        stCf = ScrollTrigger.create({
          trigger: ".portfolio", start: "top top", end: () => "+=" + (N - 1) * 330, pin: true, anticipatePin: 1,
          snap: { snapTo: 1 / (N - 1), duration: { min: 0.25, max: 0.7 }, delay: 0.12, ease: "power2.inOut" },
          onUpdate: (s) => { alvo = s.progress * (N - 1); }
        });
        return () => { stCf = null; };
      });
      entrar(".portfolio .cab > *, .cf-niveis", { y: 30, opacity: 0, stagger: 0.08, duration: 0.8, scrollTrigger: { trigger: ".portfolio", start: "top 75%" } });
      entrar(".cf, .cf-rodape", { y: 60, opacity: 0, stagger: 0.12, duration: 1, scrollTrigger: { trigger: ".portfolio", start: "top 70%" } });
    }

    $("#cfAnt").addEventListener("click", () => irCard(Math.round(alvo) - 1));
    $("#cfProx").addEventListener("click", () => irCard(Math.round(alvo) + 1));
    botoesNv.forEach((b) => b.addEventListener("click", () => irCard((+b.dataset.ir - 1) * 3)));

    /* arrastar para os lados (celular e quando não está preso à rolagem) */
    let arrastando = false, arrastou = false, x0 = 0, y0 = 0, alvo0 = 0;
    cf.addEventListener("pointerdown", (e) => {
      if (stCf || e.button !== 0 || e.target.closest(".cf-seta")) return;
      arrastando = true; arrastou = false; x0 = e.clientX; y0 = e.clientY; alvo0 = alvo;
    });
    window.addEventListener("pointermove", (e) => {
      if (!arrastando) return;
      const dx = e.clientX - x0;
      if (!arrastou && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(e.clientY - y0)) arrastou = true;
      if (arrastou) mover(alvo0 - dx / (cards[0].offsetWidth * 0.6));
    });
    window.addEventListener("pointerup", () => {
      if (!arrastando) return;
      arrastando = false;
      if (arrastou) mover(Math.round(alvo));
    });
    cf.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") { e.preventDefault(); irCard(Math.round(alvo) - 1); }
      if (e.key === "ArrowRight") { e.preventDefault(); irCard(Math.round(alvo) + 1); }
    });

    /* visor */
    const visor = $("#visor"), frame = $("#visorFrame"), janela = $("#visorJanela"), carreg = $("#visorCarregando");
    const fora = [$("main"), $("#topoFixo"), $(".rodape"), $("#wppFlutuante")].filter(Boolean);
    let vIdx = 0, focoAntes = null;
    const dois = (n) => String(n).padStart(2, "0");
    const mostrar = (i) => {
      vIdx = (i + N) % N;
      const c = cards[vIdx], nv = c.dataset.nivel;
      visor.style.setProperty("--nv", `var(--n${nv})`);
      $("#visorNv").textContent = NIVEIS[nv].nome;
      $("#visorNome").textContent = c.dataset.nome;
      $("#visorDesc").textContent = c.dataset.local + " · Projeto conceito";
      $("#visorUrl").textContent = c.dataset.dominio;
      $("#visorAbrir").href = c.getAttribute("href");
      $("#visorConta").textContent = `${dois(vIdx + 1)} / ${dois(N)}`;
      carreg.classList.remove("some");
      frame.title = `Site conceito ${c.dataset.nome}, ${NIVEIS[nv].nome}`;
      frame.src = c.getAttribute("href");
      if (animar) gsap.fromTo(".visor-txt > *", { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, overwrite: true });
    };
    frame.addEventListener("load", () => { if (frame.src && !frame.src.startsWith("about:")) carreg.classList.add("some"); });
    const abrirVisor = (i) => {
      focoAntes = document.activeElement;
      mostrar(i);
      visor.hidden = false; visorAberto = true;
      raiz.classList.add("visor-aberto");
      fora.forEach((el) => { el.inert = true; });
      if (lenis) lenis.stop();
      if (animar) {
        gsap.fromTo(visor, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: "power2.out" });
        gsap.fromTo(janela, { y: 50, scale: 0.95, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.7, ease: "power4.out", clearProps: "transform" });
      }
      $("#visorFechar").focus();
    };
    fecharVisor = () => {
      if (!visorAberto) return;
      visorAberto = false;
      const fim = () => {
        visor.hidden = true; frame.src = "about:blank";
        raiz.classList.remove("visor-aberto");
        fora.forEach((el) => { el.inert = false; });
        if (lenis) lenis.start();
        if (stCf) irCard(vIdx); else mover(vIdx);
        if (focoAntes && focoAntes.focus) focoAntes.focus({ preventScroll: true });
      };
      if (animar) gsap.to(visor, { opacity: 0, duration: 0.3, onComplete: fim }); else fim();
    };
    cards.forEach((c, i) => c.addEventListener("click", (e) => {
      e.preventDefault();
      if (arrastou) { arrastou = false; return; }
      if (Math.abs(i - pos) > 0.5) irCard(i); else abrirVisor(i);
    }));
    $("#visorFechar").addEventListener("click", fecharVisor);
    $("#visorAnt").addEventListener("click", () => mostrar(vIdx - 1));
    $("#visorProx").addEventListener("click", () => mostrar(vIdx + 1));
    $$(".visor-telas button").forEach((b) => b.addEventListener("click", () => {
      $$(".visor-telas button").forEach((x) => { x.classList.toggle("ativo", x === b); x.setAttribute("aria-pressed", String(x === b)); });
      janela.classList.toggle("cel", b.dataset.tela === "cel");
    }));
    document.addEventListener("keydown", (e) => {
      if (!visorAberto) return;
      if (e.key === "Escape") fecharVisor();
      if (e.key === "ArrowLeft" && !e.target.closest("iframe")) mostrar(vIdx - 1);
      if (e.key === "ArrowRight" && !e.target.closest("iframe")) mostrar(vIdx + 1);
    });
  }

  /* ---------- KM 06 · três níveis ---------- */
  const comp = $("#comparador");
  if (comp) {
    const tela = $(".comp-tela", comp);
    const linha = $("#compLinha");
    const nivelTxt = $("#compNivel");
    const itens = $$("#niveisLista li");
    const nomes = ["Nível 1", "Nível 2", "Nível 3"];
    const estado = { p: 0 };
    let atual = -1;
    const render = () => {
      const p = estado.p;
      const p2 = clamp(p, 0, 1) * 100, p3 = clamp(p - 1, 0, 1) * 100;
      tela.style.setProperty("--p2", p2 + "%");
      tela.style.setProperty("--p3", p3 + "%");
      const emTransicao = (p > 0.01 && p < 0.99) || (p > 1.01 && p < 1.99);
      tela.style.setProperty("--linha-x", (p <= 1 ? 100 - p2 : 100 - p3) + "%");
      tela.style.setProperty("--linha-o", emTransicao ? 1 : 0);
      const n = clamp(Math.round(p), 0, 2);
      if (n !== atual) {
        atual = n;
        nivelTxt.textContent = nomes[n];
        itens.forEach((li, i) => li.classList.toggle("ativo", i <= n));
      }
    };
    render();
    let stNiveis = null;
    if (animar) {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 901px)", () => {
        const tl = gsap.timeline({ scrollTrigger: { trigger: ".niveis", start: "top top", end: "+=180%", pin: true, scrub: 0.6, anticipatePin: 1 } });
        tl.to({}, { duration: 0.3 })
          .to(estado, { p: 1, duration: 1, ease: "power1.inOut", onUpdate: render })
          .to({}, { duration: 0.4 })
          .to(estado, { p: 2, duration: 1, ease: "power1.inOut", onUpdate: render })
          .to({}, { duration: 0.3 });
        stNiveis = tl.scrollTrigger;
        return () => { stNiveis = null; };
      });
      entrar(".niveis-txt > *", { y: 30, opacity: 0, stagger: 0.08, duration: 0.8, scrollTrigger: { trigger: ".niveis", start: "top 70%" } });
      entrar(comp, { y: 60, opacity: 0, rotationX: 12, duration: 1.1, scrollTrigger: { trigger: ".niveis", start: "top 70%" } });
    }
    itens.forEach((li, n) => {
      $("button", li).addEventListener("click", () => {
        if (stNiveis) {
          const pos = { 0: 0.1, 1: 0.55, 2: 0.98 }[n];
          const y = stNiveis.start + (stNiveis.end - stNiveis.start) * pos;
          if (lenis) lenis.scrollTo(y, { duration: 1.2 }); else window.scrollTo({ top: y, behavior: "smooth" });
        } else if (temGSAP && !reduz) gsap.to(estado, { p: n, duration: 0.9, ease: "power2.inOut", onUpdate: render });
        else { estado.p = n; render(); }
      });
    });
    const urls = { estetica: "clinica-alba.com.br", advocacia: "rafaelduarte.adv.br", otica: "oticamirante.com.br" };
    $$(".abas .chip").forEach((b) => {
      b.addEventListener("click", () => {
        const nicho = b.dataset.nicho;
        $$(".abas .chip").forEach((x) => { x.classList.toggle("ativo", x === b); x.setAttribute("aria-selected", String(x === b)); });
        const imgs = [$(".c1", tela), $(".c2", tela), $(".c3", tela)];
        const trocar = () => {
          imgs.forEach((im, i) => { im.src = `imagens/prints/${nicho}-n${i + 1}-topo.webp`; });
          $("#compUrl").textContent = urls[nicho];
        };
        if (animar) gsap.to(tela, { opacity: 0, duration: 0.25, onComplete: () => { trocar(); gsap.to(tela, { opacity: 1, duration: 0.4, delay: 0.05 }); } });
        else trocar();
      });
    });
  }

  /* ---------- KM 07 · planos ---------- */
  if (animar) {
    entrar(".planos .cab > *", { y: 30, opacity: 0, stagger: 0.08, duration: 0.8, scrollTrigger: { trigger: ".planos", start: "top 75%" } });
    entrar(".plano", { y: 90, opacity: 0, rotationX: 14, stagger: 0.14, duration: 1.1, ease: "power4.out", scrollTrigger: { trigger: ".planos-grade", start: "top 82%" } });
    const fmt = (n) => "R$ " + n.toLocaleString("pt-BR") + '<span class="cent">,90</span>';
    $$(".preco .valor").forEach((el) => {
      const alvo = +el.dataset.valor, obj = { v: 0 };
      gsap.to(obj, { v: alvo, duration: 1.6, ease: "power2.out", onUpdate: () => { el.innerHTML = fmt(Math.round(obj.v)); }, scrollTrigger: { trigger: el, start: "top 88%" } });
    });
  }

  /* abrir e fechar com altura suave (comparativo e dúvidas) */
  $$("details").forEach((d) => {
    const s = $("summary", d), corpo = d.querySelector(".comparativo-corpo, .faq-corpo");
    if (!corpo || !temGSAP || reduz) return;
    s.addEventListener("click", (e) => {
      e.preventDefault();
      if (d.open) {
        gsap.to(corpo, { height: 0, opacity: 0, duration: 0.45, ease: "power2.inOut", onComplete: () => { d.open = false; gsap.set(corpo, { clearProps: "all" }); ScrollTrigger.refresh(); } });
      } else {
        d.open = true;
        gsap.fromTo(corpo, { height: 0, opacity: 0 }, { height: "auto", opacity: 1, duration: 0.55, ease: "power2.out", onComplete: () => { gsap.set(corpo, { clearProps: "all" }); ScrollTrigger.refresh(); } });
        if (d.id === "comparativo") gsap.from($$("tbody tr", d), { x: -20, opacity: 0, stagger: 0.03, duration: 0.4, delay: 0.1 });
      }
    });
  });

  /* ---------- KM 08 · qual plano é o seu ---------- */
  const quiz = $("#quizCaixa");
  if (quiz) {
    const etapas = $$(".quiz-etapa", quiz);
    const carro = $(".quiz-pista", quiz);
    const passoTxt = $("#quizPasso");
    const resp = [];
    let etapa = 0;
    const planos = {
      Essencial: { nv: "Nível 1", motivo: "Para começar com o pé direito: um site direto, rápido no celular, que aparece no Google e leva o cliente ao seu WhatsApp. Quando tiver mais fotos e avaliações, dá para fazer o upgrade." },
      Profissional: { nv: "Nível 2", motivo: "Você já tem o que mostrar. O Profissional coloca equipe, espaço e avaliações em destaque e traz o formulário que chega pronto no WhatsApp, para passar mais confiança." },
      Premium: { nv: "Nível 3", motivo: "Você quer ser a referência da cidade. O Premium traz um topo interativo exclusivo, teste que indica o serviço, pedido de agendamento e uma página para cada serviço no Google." }
    };
    const mostrar = (n) => {
      const de = etapas[etapa], para = etapas[n];
      carro.style.setProperty("--q", (Math.min(n, 3) / 3) * 100 + "%");
      passoTxt.textContent = n < 3 ? `Pergunta ${n + 1} de 3` : "Pronto!";
      if (animar) {
        gsap.to(de, { x: -50, opacity: 0, duration: 0.35, ease: "power2.in", onComplete: () => { de.classList.remove("ativa"); gsap.set(de, { clearProps: "all" }); } });
        para.classList.add("ativa");
        gsap.fromTo(para, { x: 50, opacity: 0 }, { x: 0, opacity: 1, duration: 0.55, delay: 0.3 });
        if (n === 3) gsap.from("#quizPlano", { scale: 0.6, opacity: 0, duration: 0.7, delay: 0.55, ease: "back.out(2)" });
      } else { de.classList.remove("ativa"); para.classList.add("ativa"); }
      etapa = n;
    };
    const resultado = () => {
      const pontos = resp[0] * 1.5 + resp[1] + resp[2];
      const nome = pontos < 1.5 ? "Essencial" : pontos < 3.5 ? "Profissional" : "Premium";
      $("#quizPlano").textContent = nome;
      $("#quizMotivo").textContent = planos[nome].motivo;
      $("#quizLink").href = linkWpp(`Oi! Fiz o teste no site da Highway e o plano indicado foi o ${nome} (${planos[nome].nv}). Quero saber mais!`);
    };
    $$(".quiz-opcoes button", quiz).forEach((b) => {
      b.addEventListener("click", () => {
        const n = +b.closest(".quiz-etapa").dataset.etapa;
        resp[n] = parseFloat(b.dataset.valor);
        if (n === 2) resultado();
        mostrar(n + 1);
      });
    });
    $("#quizRefazer").addEventListener("click", () => { resp.length = 0; mostrar(0); });
    if (animar) entrar(quiz, { y: 60, opacity: 0, duration: 1, scrollTrigger: { trigger: quiz, start: "top 85%" } });
  }

  /* ---------- KM 09 · como funciona ---------- */
  const passos = $("#passos");
  if (passos) {
    const lista = $$(".passo", passos);
    const acende = (p) => {
      passos.style.setProperty("--passos-p", p);
      lista.forEach((el, i) => el.classList.toggle("aceso", p >= i / (lista.length - 1) - 0.04));
    };
    if (animar) {
      ScrollTrigger.create({ trigger: passos, start: "top 75%", end: "bottom 45%", scrub: true, onUpdate: (s) => acende(s.progress) });
      entrar(lista, { y: 40, opacity: 0, stagger: 0.12, duration: 0.8, scrollTrigger: { trigger: passos, start: "top 85%" } });
      entrar(".processo .cab > *", { y: 30, opacity: 0, stagger: 0.08, duration: 0.8, scrollTrigger: { trigger: ".processo", start: "top 75%" } });
    } else acende(1);
  }

  /* ---------- KM 10 · por que a Highway ---------- */
  const troca = $$("#troca img");
  if (troca.length && !reduz) {
    let k = 0, timer = null;
    const passar = () => { troca[k].classList.remove("ativa"); k = (k + 1) % troca.length; troca[k].classList.add("ativa"); };
    if ("IntersectionObserver" in window) {
      new IntersectionObserver((e) => {
        if (e[0].isIntersecting && !timer) timer = setInterval(passar, 2400);
        else if (!e[0].isIntersecting && timer) { clearInterval(timer); timer = null; }
      }).observe($("#troca"));
    }
  }
  if (animar) {
    entrar(".porque .cab > *", { y: 30, opacity: 0, stagger: 0.08, duration: 0.8, scrollTrigger: { trigger: ".porque", start: "top 75%" } });
    gsap.set(".porque .painel", { y: 60, opacity: 0 });
    ScrollTrigger.batch(".porque .painel", { start: "top 88%", once: true, onEnter: (els) => gsap.to(els, { y: 0, opacity: 1, stagger: 0.12, duration: 0.9 }) });
    $$(".icone").forEach((svg) => {
      const tracos = $$("path, rect, circle", svg);
      tracos.forEach((t) => { const L = t.getTotalLength ? t.getTotalLength() : 120; t.style.strokeDasharray = L; t.style.strokeDashoffset = L; });
      gsap.to(tracos, { strokeDashoffset: 0, duration: 1.4, stagger: 0.2, ease: "power2.inOut", scrollTrigger: { trigger: svg, start: "top 90%" } });
    });
  }

  /* ---------- KM 10 · dúvidas ---------- */
  if (animar) {
    entrar(".duvidas .cab > *", { y: 30, opacity: 0, stagger: 0.08, duration: 0.8, scrollTrigger: { trigger: ".duvidas", start: "top 75%" } });
    entrar(".faq details", { y: 24, opacity: 0, stagger: 0.06, duration: 0.6, scrollTrigger: { trigger: ".faq", start: "top 85%" } });
  }

  /* ---------- KM 11 · destino ---------- */
  if (animar) {
    entrar("#pino", { y: -160, opacity: 0, duration: 1.3, ease: "bounce.out", scrollTrigger: { trigger: ".destino", start: "top 70%" } });
    entrar(".destino-txt > *:not(#pino)", { y: 40, opacity: 0, stagger: 0.1, duration: 0.9, delay: 0.2, scrollTrigger: { trigger: ".destino", start: "top 70%" } });
    entrar(".formulario", { x: 60, opacity: 0, duration: 1.1, scrollTrigger: { trigger: ".destino", start: "top 70%" } });
    const letras = $$(".marca-gigante tspan");
    gsap.set(letras, { strokeOpacity: 0.06 });
    gsap.timeline({ scrollTrigger: { trigger: ".rodape", start: "top 85%" } })
      .to(letras, { keyframes: [{ strokeOpacity: 1, duration: 0.05 }, { strokeOpacity: 0.15, duration: 0.07 }, { strokeOpacity: 1, duration: 0.06 }, { strokeOpacity: 0.4, duration: 0.05 }, { strokeOpacity: 1, duration: 0.12 }], stagger: 0.13 })
      .fromTo(".marca-gigante svg", { y: 30 }, { y: 0, duration: 1.2, ease: "power3.out" }, 0);
  }
  const form = $("#formulario");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const nome = $("#fNome"), neg = $("#fNegocio"), plano = $("#fPlano"), aceite = $("#fAceite"), erro = $("#formErro");
      [nome, neg].forEach((c) => c.classList.toggle("erro", !c.value.trim()));
      if (!nome.value.trim() || !neg.value.trim()) { erro.textContent = "Preencha seu nome e o nome do seu negócio para continuar."; (nome.value.trim() ? neg : nome).focus(); return; }
      if (!aceite.checked) { erro.textContent = "Marque a caixa de concordância para continuar."; aceite.focus(); return; }
      erro.textContent = "";
      const msg = `Oi! Meu nome é ${nome.value.trim()}, do negócio ${neg.value.trim()}. Vim pelo site da Highway e tenho interesse no plano: ${plano.value}.`;
      const url = linkWpp(msg);
      const w = window.open(url, "_blank", "noopener");
      if (!w) window.location.href = url;
    });
  }

  /* ---------- WhatsApp flutuante chama atenção quando a página fica parada ---------- */
  const wpp = $("#wppFlutuante");
  let timerWpp = null;
  function acordarWpp() {
    if (!wpp || reduz) return;
    wpp.classList.remove("chama");
    clearTimeout(timerWpp);
    timerWpp = setTimeout(() => wpp.classList.add("chama"), 7000);
  }
  acordarWpp();
  if (animar) gsap.from(wpp, { scale: 0, duration: 0.6, ease: "back.out(2)", delay: usarAbertura ? 2.4 : 1 });

  /* ---------- avenida que acompanha a página: bordas neon, postes que acendem e o carro ---------- */
  const avenida = $("#avenida"), avPostes = $("#avPostes"), carro = $("#carro");
  let avIni = 0, avFim = 0, obsPostes = null, ultYAv = window.scrollY, velCarro = 0, velMostrada = -1, carroDir = 1;
  const topoDoc = (el) => el.getBoundingClientRect().top + window.scrollY;
  function montarAvenida() {
    if (!avenida) return;
    raiz.classList.add("tem-avenida");
    avIni = topoDoc(hero) + hero.offsetHeight;
    const chegada = $("#chegada");
    avFim = chegada ? topoDoc(chegada) + chegada.offsetHeight / 2 : document.documentElement.scrollHeight;
    avenida.style.top = avIni + "px";
    avenida.style.height = Math.max(0, avFim - avIni) + "px";
    const passo = window.innerWidth < 760 ? 480 : 560;
    const total = 2 * Math.max(0, Math.floor((avFim - avIni - 300) / passo) + 1);
    const atuais = $$(".poste", avPostes);
    for (let i = atuais.length; i < total; i++) {
      const p = document.createElement("div");
      p.className = "poste " + (i % 2 ? "dir" : "esq");
      p.innerHTML = '<i class="poste-luz"></i><i class="poste-base"></i><i class="poste-braco"></i><i class="poste-cabeca"></i>';
      avPostes.appendChild(p);
      if (reduz || !("IntersectionObserver" in window)) p.classList.add("aceso");
      else {
        if (!obsPostes) obsPostes = new IntersectionObserver((es) => es.forEach((e) => {
          if (e.isIntersecting) { e.target.classList.add("aceso"); obsPostes.unobserve(e.target); }
        }), { rootMargin: "0px 0px -15% 0px" });
        obsPostes.observe(p);
      }
    }
    $$(".poste", avPostes).forEach((p, i) => {
      if (i >= total) { p.remove(); return; }
      p.style.top = 200 + Math.floor(i / 2) * passo + (i % 2 ? passo / 2 : 0) + "px";
    });
    atualizarAvenida();
  }
  function atualizarAvenida() {
    if (!avenida || !avFim) return;
    const y = window.scrollY, ref = y + window.innerHeight * 0.62;
    avenida.style.setProperty("--av-prog", clamp(ref - avIni, 0, avFim - avIni).toFixed(0) + "px");
    if (!carro) return;
    const dy = y - ultYAv; ultYAv = y;
    carro.classList.toggle("na-pista", ref > avIni + 80 && ref < avFim - 40);
    velCarro = Math.max(velCarro, Math.min(Math.abs(dy) / 35, 1.5));
    if (animar) {
      if (dy > 2 && carroDir < 0) { carroDir = 1; gsap.to(carro, { rotation: 0, duration: 0.6, ease: "power2.inOut" }); }
      else if (dy < -2 && carroDir > 0) { carroDir = -1; gsap.to(carro, { rotation: 180, duration: 0.6, ease: "power2.inOut" }); }
    }
  }
  if (carro && animar) {
    gsap.ticker.add(() => {
      velCarro *= 0.93;
      const v = Math.round(velCarro * 100) / 100;
      if (v !== velMostrada) { velMostrada = v; carro.style.setProperty("--vel", v); }
    });
  }

  /* ---------- cidade neon do rodapé ---------- */
  const cidadeRodape = $("#cidade");
  if (cidadeRodape) {
    const L = 1600, A = 170, cores = ["#29ecff", "#ff3df2", "#b350ff", "#ffb84d"];
    let svg = `<svg viewBox="0 0 ${L} ${A}" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="gPredio" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#141848"/><stop offset="1" stop-color="#060816"/></linearGradient></defs>`;
    let x = 0, k = 0;
    while (x < L) {
      const w = 34 + Math.random() * 80, h = 30 + Math.random() * (A - 40) * (0.5 + 0.5 * Math.sin((x / L) * Math.PI));
      svg += `<rect x="${x.toFixed(0)}" y="${(A - h).toFixed(0)}" width="${w.toFixed(0)}" height="${h.toFixed(0)}" fill="url(#gPredio)"/>`;
      if (Math.random() < 0.4) svg += `<rect x="${x.toFixed(0)}" y="${(A - h).toFixed(0)}" width="${w.toFixed(0)}" height="2" fill="${cores[k++ % 3]}" opacity=".7"/>`;
      for (let yy = A - h + 8; yy < A - 6; yy += 10) {
        for (let xx = x + 5; xx < x + w - 6; xx += 8) {
          if (Math.random() < 0.16) svg += `<rect x="${xx.toFixed(0)}" y="${yy.toFixed(0)}" width="3" height="4" fill="${cores[Math.random() < 0.6 ? 3 : Math.floor(Math.random() * 3)]}" opacity="${(0.35 + Math.random() * 0.5).toFixed(2)}"/>`;
        }
      }
      x += w + 2 + Math.random() * 5;
    }
    cidadeRodape.innerHTML = svg + "</svg>";
  }

  /* ---------- botões magnéticos e cards que inclinam ---------- */
  if (animar && fino) {
    $$(".mag").forEach((b) => {
      b.addEventListener("pointermove", (e) => {
        const r = b.getBoundingClientRect();
        b.style.setProperty("--mx", ((e.clientX - r.left) / r.width - 0.5) * 14 + "px");
        b.style.setProperty("--my", ((e.clientY - r.top) / r.height - 0.5) * 10 + "px");
      });
      b.addEventListener("pointerleave", () => { b.style.setProperty("--mx", "0px"); b.style.setProperty("--my", "0px"); });
    });
    $$(".tilt").forEach((c) => {
      c.addEventListener("pointermove", (e) => {
        const r = c.getBoundingClientRect();
        c.style.setProperty("--ry", ((e.clientX - r.left) / r.width - 0.5) * 9 + "deg");
        c.style.setProperty("--rx", (0.5 - (e.clientY - r.top) / r.height) * 7 + "deg");
      });
      c.addEventListener("pointerleave", () => { c.style.setProperty("--rx", "0deg"); c.style.setProperty("--ry", "0deg"); });
    });
  }

  /* ---------- menu marca a seção atual ---------- */
  if (temGSAP) {
    ["portfolio", "planos", "como-funciona", "duvidas"].forEach((id) => {
      const link = $(`.menu a[href="#${id}"]`), sec = $("#" + id);
      if (!link || !sec) return;
      ScrollTrigger.create({ trigger: sec, start: "top 50%", end: "bottom 50%", onToggle: (s) => { link.classList.toggle("atual", s.isActive); if (menuEl && !menuEl.matches(":hover")) moverLuz($(".menu a.atual")); } });
    });
  }

  /* ---------- começar ---------- */
  const iniciar = () => rodarAbertura(introHero);
  if (temGSAP) {
    ScrollTrigger.addEventListener("refresh", montarAvenida);
    window.addEventListener("load", () => { ScrollTrigger.refresh(); });
  } else {
    window.addEventListener("load", montarAvenida);
  }
  window.addEventListener("resize", () => { if (!temGSAP) montarAvenida(); });
  if (temGSAP) iniciar(); else { const ab = $("#abertura"); ab && ab.remove(); }
  aoRolar();
})();
