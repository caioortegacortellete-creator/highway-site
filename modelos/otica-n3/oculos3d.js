/* ============================================================
   EXPERIÊNCIA 3D DO TOPO — um óculos 3D, reto e de frente, que coloca a página em foco.
   Fora das lentes, as palavras ficam desfocadas e crescem ao fundo; dentro delas, nítidas e ampliadas.
   Rolagem: o óculos se aproxima → troca de modelo (Clássica, Gatinho, Aviador, Redonda)
   → a lente da Redonda cresce até ocupar a tela, com a paisagem nítida só dentro dela.
   Os modelos (nome, cor, detalhe, medida, forma, material) ficam em MODELOS, logo abaixo.
   É um script comum (não "module") que carrega o three.js pelo importmap do index.html,
   para funcionar também quando o index.html é aberto direto da pasta (file://).
   Se o 3D falhar, a seção mostra o título nítido e o site segue normal.
   No celular (LEVE) roda uma versão mais leve: menos resolução e detalhe, fundo sem blur, sem o óculos que voa.
   ============================================================ */
(function () {
let THREE, RoomEnvironment;

const MODELOS = [
  { nome: 'Clássica', cor: 'Tartaruga', detalhe: 'Acetato polido à mão, ponte esculpida', medida: '52□19', forma: 'classica', material: 'tartaruga' },
  { nome: 'Gatinho', cor: 'Vermelho rubi', detalhe: 'Acetato translúcido, ponta levantada', medida: '53□17', forma: 'gatinho', material: 'rubi' },
  { nome: 'Aviador', cor: 'Dourado', detalhe: 'Metal leve, ponte dupla e plaquetas', medida: '57□15', forma: 'aviador', material: 'dourado' },
  { nome: 'Redonda', cor: 'Titânio preto', detalhe: 'Aro fino, leve como nada', medida: '49□21', forma: 'redonda', material: 'titanio' }
];
const FRASE = ['Tudo', 'em', 'foco'];
// no último modelo, esta frase (de venda) fica do lado de fora, desfocada, e a paisagem aparece dentro das lentes
const FRASE_FINAL = ['Enxergue', 'cada detalhe.'];
// aberto direto da pasta (file://), o navegador bloqueia a foto local dentro do 3D; nesse caso usa a mesma foto do Unsplash
const FOTO_FINAL = location.protocol === 'file:' ? 'https://images.unsplash.com/photo-1650493359585-f394207e8460?w=2200&q=82&auto=format' : 'paisagem.jpg';
const ANGULO = 0;     // giro do óculos de lado (radianos); 0 = reto, de frente

const secao = document.getElementById('inicio');
const palco = secao.querySelector('.exp-palco');
const fundo = document.getElementById('exp-fundo');
const glc = document.getElementById('exp-gl');
const camadaHero = secao.querySelector('.exp-hero'), camadaModelo = secao.querySelector('.exp-modelo'), camadaFinal = secao.querySelector('.exp-final');
const reduzir = matchMedia('(prefers-reduced-motion: reduce)').matches;
const temMouse = matchMedia('(hover: hover) and (pointer: fine)').matches;
const LEVE = matchMedia('(max-width: 920px), (pointer: coarse)').matches;   // celular e tablet
const BRILHO = LEVE ? 0 : 1;   // verniz (clearcoat) dos materiais: bonito, mas pesado no celular

const limitar = (v, a, b) => Math.min(Math.max(v, a), b);
const suave = t => t * t * (3 - 2 * t);
const faixa = (p, a, b) => limitar((p - a) / (b - a), 0, 1);
// distribui a rolagem entre as fases: topo (16%), troca de modelos (72%) e mergulho na lente (12%)
const fase = q => q < .16 ? q / .16 * .26 : q < .88 ? .26 + (q - .16) / .72 * .54 : .8 + (q - .88) / .12 * .2;

Promise.all([import('three'), import('three/addons/environments/RoomEnvironment.js')])
  .then(([tres, ambiente]) => { THREE = tres; RoomEnvironment = ambiente.RoomEnvironment; iniciar(); })
  .catch(semTresD);

function semTresD(e) {
  if (e) console.warn('Experiência 3D desativada:', e);
  secao.classList.add('sem-3d');
  window.oculos3dOk = true; // evita o aviso de "não carregou"
}

function iniciar() {
  /* ---------- Renderizador, câmera e luz ---------- */
  const renderer = new THREE.WebGLRenderer({ canvas: glc, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  const cena = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  cena.environment = pmrem.fromScene(new RoomEnvironment(renderer), .04).texture;
  const camera = new THREE.PerspectiveCamera(28, 1, .1, 400);
  camera.position.set(0, 0, 10);
  const luz = new THREE.DirectionalLight(0xffffff, 2); luz.position.set(-3, 5, 6); cena.add(luz);
  const recorte = new THREE.DirectionalLight(0xffffff, 1.2); recorte.position.set(5, 1, -4); cena.add(recorte);
  const luzRubi = new THREE.PointLight(0xe0313f, 16, 30); luzRubi.position.set(4, -2.5, 3); cena.add(luzRubi);

  /* ---------- Palavras e foto desenhadas em 2D: uma versão desfocada (fundo) e outra nítida (vista pelas lentes) ---------- */
  const nitido = document.createElement('canvas');
  const ctxF = fundo.getContext('2d'), ctxN = nitido.getContext('2d');
  let texN = null, W = 0, H = 0, dpr = 1;
  const foto = new Image(); let fotoPronta = false;
  foto.onload = () => { fotoPronta = true; chaveF = chaveN = ''; };
  foto.crossOrigin = 'anonymous';
  foto.src = FOTO_FINAL;

  function desenharTexto(ctx, w, h, linhas, escala) {
    const n = linhas.length, retrato = w / h < .9;
    let tam = n > 1 ? (retrato ? Math.min(w * .3, h * .17) : Math.min(w * .17, h * .28)) : (retrato ? w * .3 : Math.min(w * .16, h * .32));
    ctx.font = `800 ${tam}px Manrope, system-ui, sans-serif`;
    const maior = Math.max(...linhas.map(l => ctx.measureText(l).width));
    if (maior > w * .92) tam *= w * .92 / maior;
    tam *= escala;
    ctx.font = `800 ${tam}px Manrope, system-ui, sans-serif`;
    const alt = tam * .84, y0 = h * .5 - (n - 1) * alt / 2;
    ctx.fillStyle = '#f5f1ec'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    // no fundo do celular, desenha só a sombra do texto (o texto fica fora da tela): é um desfoque suave e barato
    const soSombra = LEVE && ctx === ctxF;
    if (soSombra) { ctx.shadowColor = '#f5f1ec'; ctx.shadowBlur = w * .045; ctx.shadowOffsetX = w * 3; }
    linhas.forEach((l, i) => ctx.fillText(l, w / 2 - (soSombra ? w * 3 : 0), y0 + i * alt + tam * .04));
    if (soSombra) { ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; }
  }
  function desenharFoto(ctx, w, h) {
    if (!fotoPronta) return;
    const r = Math.max(w / foto.width, h / foto.height), fw = foto.width * r, fh = foto.height * r;
    ctx.drawImage(foto, (w - fw) / 2, (h - fh) / 2, fw, fh);
    // véu escuro leve para a frase branca continuar legível sobre a foto
    const a = ctx.globalAlpha; ctx.globalAlpha = a * .12; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, w, h); ctx.globalAlpha = a;
  }
  function pintar(ctx, camadas) {
    const w = ctx.canvas.width, h = ctx.canvas.height;
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#0b0909'; ctx.fillRect(0, 0, w, h);
    const g = ctx.createRadialGradient(w / 2, h * .55, 0, w / 2, h * .55, Math.max(w, h) * .6);
    g.addColorStop(0, 'rgba(224,49,63,.16)'); g.addColorStop(1, 'rgba(224,49,63,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    if ('letterSpacing' in ctx) ctx.letterSpacing = '-0.02em';
    camadas.forEach(c => {
      if (c.alfa <= .001) return;
      ctx.globalAlpha = c.alfa;
      if (c.foto) desenharFoto(ctx, w, h); else desenharTexto(ctx, w, h, c.linhas, c.escala || 1);
    });
    ctx.globalAlpha = 1;
  }
  // só redesenha o que mudou; no celular, em degraus maiores, porque enviar a tela nítida à placa de vídeo é o passo mais caro
  const passoAlfa = LEVE ? 20 : 1000, passoEscala = LEVE ? 60 : 1000;
  const chave = camadas => camadas.map(c => (c.foto ? 'F' : c.linhas.join(' ') + '@' + Math.round((c.escala || 1) * passoEscala)) + ':' + Math.round(c.alfa * passoAlfa)).join(';');
  let chaveF = '', chaveN = '';
  function atualizarCena(noFundo, nasLentes) {
    const prefixo = W + 'x' + H + '|' + fotoPronta + '|';
    const kF = prefixo + chave(noFundo), kN = prefixo + chave(nasLentes);
    if (kF !== chaveF) { chaveF = kF; pintar(ctxF, noFundo); }
    if (kN !== chaveN) { chaveN = kN; pintar(ctxN, nasLentes); texN.needsUpdate = true; }
  }

  /* ---------- Lentes: mostram a versão nítida, ampliada a partir do centro de cada lente, com reflexo de vidro ---------- */
  const lentes = [];
  function materialLente() {
    const m = new THREE.ShaderMaterial({
      uniforms: { uTex: { value: null }, uRes: { value: new THREE.Vector2(1, 1) }, uCentro: { value: new THREE.Vector2() }, uZoom: { value: 1.1 } },
      vertexShader: 'varying vec2 vPos; void main(){ vPos = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: `
        uniform sampler2D uTex; uniform vec2 uRes; uniform vec2 uCentro; uniform float uZoom; varying vec2 vPos;
        void main(){
          vec2 q = uCentro + (gl_FragCoord.xy - uCentro) / uZoom;
          vec3 c = texture2D(uTex, q / uRes).rgb;
          float r = length(vPos / vec2(.55, .45));
          c *= 1.0 - smoothstep(.75, 1.05, r) * .25;
          float d = vPos.x * .8 + vPos.y;
          c += smoothstep(.09, .0, abs(d - .22)) * .07 + smoothstep(.035, .0, abs(d - .38)) * .05;
          c += vec3(.03, .02, .02) * smoothstep(.2, -.4, vPos.y);
          gl_FragColor = vec4(c, 1.0);
        }`,
      side: THREE.DoubleSide, toneMapped: false
    });
    lentes.push(m);
    return m;
  }

  /* ---------- Desenho das lentes (lente direita, ~1 unidade de largura, sentido anti-horário, t = 0 aponta para fora) ---------- */
  const se = (v, n) => Math.sign(v) * Math.pow(Math.abs(v), 2 / n);
  function contornoLente(forma) {
    const N = LEVE ? 90 : 180, pts = [];
    for (let i = 0; i < N; i++) {
      const t = i / N * Math.PI * 2, c = Math.cos(t), s = Math.sin(t);
      let x, y;
      if (forma === 'redonda') { x = .45 * c; y = .45 * s; }
      else if (forma === 'classica') { x = .53 * se(c, 3.4); y = .39 * se(s, 3.4); x *= 1 + .08 * (y / .39); if (y > 0) y += .035 * (x / .53); }
      else if (forma === 'gatinho') { x = .54 * se(c, 2.8); y = .36 * se(s, 2.8); const u = Math.max(0, x / .54); y += y > 0 ? .17 * u * u * u : .03 * u * u; }
      else { x = .55 * se(c, 2.3); y = .45 * se(s, 2.3); if (y > 0) y *= .7; else x += .1 * (-y / .45) * (x > 0 ? 1 : .35); } // aviador: gota
      pts.push(new THREE.Vector2(x, y));
    }
    return pts;
  }
  function deslocar(pts, esp) {
    const N = pts.length;
    return pts.map((p, i) => {
      const a = pts[(i - 1 + N) % N], b = pts[(i + 1) % N];
      const tx = b.x - a.x, ty = b.y - a.y, L = Math.hypot(tx, ty) || 1, e = esp(i / N * Math.PI * 2);
      return new THREE.Vector2(p.x + ty / L * e, p.y - tx / L * e);
    });
  }
  const espelhar = (pts, lado, sep) => pts.map(p => new THREE.Vector2(p.x * lado + sep * lado, p.y));

  /* ---------- Materiais ---------- */
  function texturaTartaruga() {
    const c = document.createElement('canvas'); c.width = c.height = 512;
    const x = c.getContext('2d');
    const fundoG = x.createLinearGradient(0, 0, 512, 512); fundoG.addColorStop(0, '#3a1a0a'); fundoG.addColorStop(1, '#1d0c05');
    x.fillStyle = fundoG; x.fillRect(0, 0, 512, 512);
    const cores = ['rgba(176,98,34,', 'rgba(214,142,58,', 'rgba(96,40,12,', 'rgba(10,4,2,'];
    let semente = 11; const aleatorio = () => (semente = (semente * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 220; i++) {
      const px = aleatorio() * 512, py = aleatorio() * 512, r = 6 + aleatorio() * 38, cor = cores[i % 4];
      const g = x.createRadialGradient(px, py, 0, px, py, r);
      g.addColorStop(0, cor + (.3 + aleatorio() * .45) + ')'); g.addColorStop(1, cor + '0)');
      x.fillStyle = g; x.beginPath(); x.ellipse(px, py, r * 1.8, r * (.35 + aleatorio() * .4), -.5 + aleatorio() * .4, 0, Math.PI * 2); x.fill();
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(.55, .55);
    return t;
  }
  const MATERIAIS = {
    tartaruga: new THREE.MeshPhysicalMaterial({ map: texturaTartaruga(), roughness: .22, clearcoat: BRILHO, clearcoatRoughness: .05 }),
    rubi: new THREE.MeshPhysicalMaterial({ color: 0x7e0a18, roughness: .16, clearcoat: BRILHO, clearcoatRoughness: .03 }),
    dourado: new THREE.MeshStandardMaterial({ color: 0xd8b06a, metalness: 1, roughness: .2 }),
    titanio: new THREE.MeshStandardMaterial({ color: 0x1d1c20, metalness: .9, roughness: .32 }),
    preto: new THREE.MeshPhysicalMaterial({ color: 0x0d0c0e, roughness: .16, clearcoat: BRILHO, clearcoatRoughness: .04 })
  };
  const PRATA = new THREE.MeshStandardMaterial({ color: 0xd6d3d3, metalness: 1, roughness: .22 });
  const PONTEIRA = new THREE.MeshPhysicalMaterial({ color: 0x141213, roughness: .3, clearcoat: .7 * BRILHO });
  const PLAQUETA = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: .1, transparent: true, opacity: .5 });

  /* ---------- Peças ---------- */
  function tubo(pontos, raio, mat, fechado) {
    const curva = new THREE.CatmullRomCurve3(pontos, !!fechado, 'centripetal');
    return new THREE.Mesh(new THREE.TubeGeometry(curva, (fechado ? 220 : 48) / (LEVE ? 2 : 1), raio, LEVE ? 8 : 12, !!fechado), mat);
  }
  // haste: sai da dobradiça para trás, abre um pouco para fora e faz a curva da orelha no fim
  function haste(x, y, lado, comp, raio, mat, ponta) {
    const ab = .1 * lado;
    const pts = [[0, 0, 0], [ab * .3, -.01, -comp * .3], [ab * .7, -.03, -comp * .62], [ab, -.07, -comp * .86], [ab * 1.05, -.2, -comp * 1], [ab * 1.05, -.38, -comp * 1.05]]
      .map(([a, b, c]) => new THREE.Vector3(x + a, y + b, c - .05));
    const g = new THREE.Group();
    const corpo = tubo(pts.slice(0, ponta ? 4 : 6), raio, mat);
    if (!ponta) { corpo.geometry.translate(-x, -y, 0); corpo.geometry.scale(.65, 1.7, 1); corpo.geometry.translate(x, y, 0); }
    g.add(corpo);
    if (ponta) g.add(tubo(pts.slice(3), raio * 1.5, PONTEIRA));
    return g;
  }

  /* ---------- Montagem de cada modelo (opcoes: outra cena e outro material de lente, usados no óculos que voa) ---------- */
  function montar(modelo, opcoes = {}) {
    const g = new THREE.Group(), forma = modelo.forma, mat = MATERIAIS[modelo.material];
    const metal = forma === 'aviador' || forma === 'redonda';
    const sep = { classica: .72, gatinho: .73, aviador: .75, redonda: .66 }[forma];
    const lente = contornoLente(forma);
    const meiaL = Math.max(...lente.map(p => p.x));
    const lentesModelo = [];

    if (!metal) {
      // frente inteiriça de acetato: aros com sobrancelha mais grossa, ponte esculpida, furos das lentes
      const off = deslocar(lente, t => {
        const s = Math.sin(t), c = Math.cos(t);
        return .07 + .075 * Math.pow(Math.max(0, s), 1.3) + (forma === 'gatinho' ? .07 * Math.max(0, c) * Math.max(0, s) : .015 * Math.max(0, c));
      });
      const N = off.length, a = .62;
      const idx = t => Math.round((((t % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)) / (2 * Math.PI) * N) % N;
      const iTopo = idx(Math.PI - a), iBase = idx(Math.PI + a);
      const dir = [];
      for (let k = iTopo; ; k = (k - 1 + N) % N) { dir.push(new THREE.Vector2(off[k].x + sep, off[k].y)); if (k === iBase) break; }
      const esq = dir.map(p => new THREE.Vector2(-p.x, p.y)).reverse();
      const rt = dir[0], rb = dir[dir.length - 1];
      const s = new THREE.Shape();
      s.moveTo(rt.x, rt.y); dir.slice(1).forEach(p => s.lineTo(p.x, p.y));
      s.quadraticCurveTo(0, 2 * (rt.y - .17) - rb.y, -rb.x, rb.y);           // arco do nariz
      esq.slice(1).forEach(p => s.lineTo(p.x, p.y));
      s.quadraticCurveTo(0, rt.y - .015, rt.x, rt.y);                        // topo da ponte
      for (const lado of [-1, 1]) s.holes.push(new THREE.Path(espelhar(lente, lado, sep)));
      const geo = new THREE.ExtrudeGeometry(s, { depth: .06, bevelEnabled: true, bevelThickness: .035, bevelSize: .028, bevelSegments: LEVE ? 3 : 6, steps: 1 });
      geo.translate(0, 0, -.03);
      g.add(new THREE.Mesh(geo, mat));
      // dobradiças e hastes
      for (const lado of [-1, 1]) {
        const xh = lado * (sep + meiaL + .08), yh = .17;
        const dob = new THREE.Mesh(new THREE.BoxGeometry(.08, .1, .16), PRATA); dob.position.set(xh - lado * .02, yh, -.1); g.add(dob);
        g.add(haste(xh, yh, lado, 2.3, .034, mat, false));
      }
    } else {
      // armação de metal: aros finos, ponte, plaquetas e hastes com ponteira
      const r = .021;
      for (const lado of [-1, 1]) {
        const p = espelhar(lente, lado, sep).map(v => new THREE.Vector3(v.x, v.y, 0));
        g.add(tubo(p, r, mat, true));
        // ligação do aro até a dobradiça
        const xo = lado * (sep + meiaL), yo = forma === 'aviador' ? .24 : .12;
        g.add(tubo([new THREE.Vector3(xo - lado * .02, yo, 0), new THREE.Vector3(xo + lado * .07, yo + .01, -.04), new THREE.Vector3(xo + lado * .09, yo, -.12)], r * .9, mat));
        g.add(haste(xo + lado * .09, yo, lado, 2.3, .017, mat, true));
        // plaqueta (apoio do nariz)
        const xp = lado * (sep - meiaL + .1);
        g.add(tubo([new THREE.Vector3(lado * (sep - meiaL + .02), .02, 0), new THREE.Vector3(xp - lado * .02, -.08, -.08), new THREE.Vector3(xp - lado * .03, -.14, -.14)], .008, PRATA));
        const pl = new THREE.Mesh(new THREE.SphereGeometry(.06, 16, 12), PLAQUETA); pl.scale.set(.45, 1, .3); pl.position.set(xp - lado * .03, -.2, -.15); g.add(pl);
      }
      const xi = sep - meiaL + .005;
      g.add(tubo([new THREE.Vector3(-xi, .1, 0), new THREE.Vector3(0, .19, .02), new THREE.Vector3(xi, .1, 0)], r, mat));
      if (forma === 'aviador') g.add(tubo([new THREE.Vector3(-xi - .12, .31, 0), new THREE.Vector3(0, .33, .01), new THREE.Vector3(xi + .12, .31, 0)], r * .85, mat));
    }

    // lentes (vidro que mostra a versão nítida)
    for (const lado of [-1, 1]) {
      const m = new THREE.Mesh(new THREE.ShapeGeometry(new THREE.Shape(espelhar(lente, lado, 0)), 1), opcoes.lente || materialLente());
      m.position.set(sep * lado, 0, 0); m.renderOrder = opcoes.lente ? 1 : -1;
      g.add(m); lentesModelo.push(m);
    }
    g.visible = !!opcoes.cena;
    (opcoes.cena || cena).add(g);
    return { g, lentes: lentesModelo, sep };
  }
  const oculos = MODELOS.map(m => montar(m));

  /* ---------- Tamanhos ---------- */
  let visW = 1, visH = 1, base = 1;
  function medir() {
    W = palco.clientWidth; H = palco.clientHeight; dpr = Math.min(devicePixelRatio || 1, LEVE ? 1.25 : 2);
    const bw = Math.round(W * dpr), bh = Math.round(H * dpr);
    nitido.width = bw; nitido.height = bh;
    // no celular o fundo é desenhado bem pequeno e ampliado: fica desfocado sem usar o filtro de blur, que pesa muito
    fundo.width = LEVE ? Math.round(W / 5) : bw; fundo.height = LEVE ? Math.round(H / 5) : bh;
    renderer.setPixelRatio(dpr); renderer.setSize(W, H, false);
    camera.aspect = W / H; camera.updateProjectionMatrix();
    visH = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)); visW = visH * camera.aspect;
    base = Math.min((W / H < .9 ? .92 : .5) * visW / 2.9, visH * .38);
    if (texN) texN.dispose();
    texN = new THREE.CanvasTexture(nitido);
    texN.generateMipmaps = false; texN.minFilter = THREE.LinearFilter;
    lentes.forEach(m => { m.uniforms.uTex.value = texN; m.uniforms.uRes.value.set(bw, bh); });
    fundo.style.setProperty('--desfoque', Math.round(Math.min(W, H) * .018) + 'px');
    chaveF = chaveN = '';
  }

  /* ---------- Mouse ---------- */
  let mx = 0, my = 0, rx = 0, ry = 0;
  if (temMouse && !reduzir) addEventListener('mousemove', e => { mx = e.clientX / innerWidth * 2 - 1; my = e.clientY / innerHeight * 2 - 1; });

  /* ---------- Quadro a quadro ---------- */
  let inicioIntro = null, modeloInfo = -1, pSuave = null, pAnterior = null, tAnterior = 0;
  const vivo = !LEVE && !reduzir;   // flutuação contínua só no computador; no celular só desenha quando algo muda
  const v = new THREE.Vector3();
  const infoNum = camadaModelo.querySelector('[data-num]'), infoCor = camadaModelo.querySelector('[data-cor]'),
    infoDetalhe = camadaModelo.querySelector('[data-detalhe]'), infoMedida = camadaModelo.querySelector('[data-medida]');

  function quadro(t) {
    requestAnimationFrame(quadro);
    const r = secao.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;
    const pReal = limitar(-r.top / Math.max(secao.offsetHeight - H, 1), 0, 1);
    // o óculos segue a rolagem com um pequeno atraso: mesmo rolando rápido, dá para ver o giro da troca
    pSuave = pSuave === null || reduzir ? pReal : pSuave + (pReal - pSuave) * (1 - Math.exp(-(t - tAnterior) / 220));
    if (Math.abs(pReal - pSuave) < .00005) pSuave = pReal;
    tAnterior = t;
    const p = fase(pSuave);

    // entrada: o óculos chega girando depois da tela de abertura
    if (inicioIntro === null && document.body.classList.contains('pronto')) inicioIntro = t;
    const intro = reduzir ? 1 : inicioIntro === null ? 0 : suave(limitar((t - inicioIntro) / 1900, 0, 1));
    if (!vivo && intro === 1 && pSuave === pAnterior && chaveN) return;   // nada mudou: não gasta bateria
    pAnterior = pSuave;

    // fases da rolagem
    const aprox = suave(faixa(p, .05, .15)) * (1 - suave(faixa(p, .17, .25)));
    const fm = limitar((p - .26) / .135, 0, 3.999);
    const m = Math.floor(fm), f = fm - m;
    const troca = m < 3 ? suave(faixa(f, .35, 1)) : 0;   // a troca (giro) ocupa 65% do trecho de cada modelo
    const mergulho = faixa(p, .8, .97), mg = suave(mergulho);
    const atual = p < .26 ? 0 : (troca > .5 ? m + 1 : m);

    // palavras: crescem ao fundo (desfocadas) e ficam nítidas nas lentes; no mergulho, a paisagem aparece só dentro da lente
    const hp = faixa(p, .19, .26);
    let noFundo, nasLentes;
    if (p < .26) {
      noFundo = [{ linhas: FRASE, alfa: 1 - hp, escala: (.84 + .16 * intro) * (1 + .32 * aprox + .25 * hp) }, { linhas: [MODELOS[0].nome], alfa: hp, escala: .85 + .15 * hp }];
      nasLentes = noFundo;
    } else if (mergulho > 0) {
      // a lente cresce até a tela inteira: do lado de fora a frase se abre e some; dentro, a paisagem nítida
      noFundo = [{ linhas: FRASE_FINAL, alfa: 1 - faixa(mergulho, .05, .4), escala: 1 + .7 * mg }];
      nasLentes = [{ foto: true, alfa: 1 }];
    } else {
      // cada modelo mostra o seu nome ao fundo (desfocado fora, nítido nas lentes);
      // no último, a frase de venda fica do lado de fora e a paisagem aparece dentro das lentes
      const foraModelo = (i, alfa, escala) => [{ linhas: i < 3 ? [MODELOS[i].nome] : FRASE_FINAL, alfa, escala }];
      const lenteModelo = (i, alfa, escala) => i < 3 ? foraModelo(i, alfa, escala) : [{ foto: true, alfa }];
      noFundo = foraModelo(m, 1 - troca, 1 + .25 * troca);
      nasLentes = lenteModelo(m, 1 - troca, 1 + .25 * troca);
      if (m < 3) {
        noFundo.push(...foraModelo(m + 1, troca, .85 + .15 * troca));
        nasLentes.push(...lenteModelo(m + 1, troca, .85 + .15 * troca));
      }
    }
    atualizarCena(noFundo, nasLentes);

    // qual óculos aparece e como ele está posicionado (de lado, com as hastes à mostra)
    oculos.forEach((o, i) => { o.g.visible = i === atual; });
    const oc = oculos[atual], o = oc.g;
    rx += ((reduzir ? 0 : my) * .04 - rx) * .06; ry += ((reduzir ? 0 : mx) * .07 - ry) * .06;
    const giroTroca = troca < .5 ? troca * Math.PI : (troca - 1) * Math.PI;
    const flutua = vivo ? Math.sin(t / 1100) * .04 : 0;
    const lado = ANGULO * (1 - .45 * aprox);
    let s = base * (1 + .5 * aprox) * (.6 + .4 * intro);
    let x = 0, y = flutua * (1 - mg);
    if (mergulho > 0) {
      const meiaDiag = Math.hypot(visW, visH) / 2;
      const alvo = meiaDiag / (.45 * base) * 1.3;
      s = base * Math.pow(alvo, mg);
      x = x * (1 - mg) - oc.sep * s * suave(faixa(mergulho, 0, .3));
      y *= 1 - mg;
    }
    o.scale.setScalar(s);
    o.position.set(x, y, 0);
    o.rotation.set(rx * (1 - mg), (lado + ry + giroTroca) * (1 - mg) - (1 - intro) * 2.8, (vivo ? Math.sin(t / 1700) * .02 : 0) * (1 - mg));

    // centro de cada lente na tela, para a ampliação partir dele
    const bw = W * dpr, bh = H * dpr;
    oc.lentes.forEach(l => {
      l.getWorldPosition(v); v.project(camera);
      l.material.uniforms.uCentro.value.set((v.x + 1) / 2 * bw, (v.y + 1) / 2 * bh);
      l.material.uniforms.uZoom.value = (1.1 + .3 * aprox) * (1 - mg) + mg;
    });

    // textos sobre a cena
    camadaHero.style.opacity = (1 - faixa(p, .03, .1)) * intro;
    camadaModelo.style.opacity = faixa(p, .24, .28) * (1 - faixa(p, .8, .84));
    camadaFinal.style.opacity = faixa(p, .9, .96);
    if (atual !== modeloInfo) {
      modeloInfo = atual;
      const md = MODELOS[atual];
      infoNum.textContent = `0${atual + 1} / 0${MODELOS.length}`; infoCor.textContent = md.cor; infoDetalhe.textContent = md.detalhe; infoMedida.textContent = md.medida;
    }

    renderer.render(cena, camera);
  }

  /* ---------- Óculos que sai da foto da loja, rodopia com a rolagem e pousa no teste de estilo ----------
     Começa em cima do óculos de baixo da foto ([data-voo-origem]) e termina em [data-voo-destino].
     Tem a sua própria camada (canvas fixo, sem cliques) e só desenha quando a origem ou o destino estão na tela. */
  const origemVoo = document.querySelector('[data-voo-origem]'), destinoVoo = document.querySelector('[data-voo-destino]');
  if (!LEVE && origemVoo && destinoVoo) {
    try { iniciarVoo(); } catch (e) { console.warn('Voo do óculos desativado:', e); }
  }
  function iniciarVoo() {
    const tela = document.createElement('canvas');
    tela.className = 'voo-oculos'; tela.setAttribute('aria-hidden', 'true');
    document.body.appendChild(tela);
    const rv = new THREE.WebGLRenderer({ canvas: tela, antialias: true, alpha: true });
    rv.outputColorSpace = THREE.SRGBColorSpace; rv.toneMapping = THREE.ACESFilmicToneMapping; rv.toneMappingExposure = 1.15;
    const cv = new THREE.Scene();
    cv.environment = new THREE.PMREMGenerator(rv).fromScene(new RoomEnvironment(rv), .04).texture;
    const l1 = new THREE.DirectionalLight(0xffffff, 2.2); l1.position.set(-300, 500, 600); cv.add(l1);
    const l2 = new THREE.PointLight(0xe0313f, 2, 0, 0); l2.position.set(400, -300, 300); cv.add(l2);
    const cam = new THREE.PerspectiveCamera(30, 1, 1, 10000);
    const vidro = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: .04, transparent: true, opacity: .14, envMapIntensity: 1.6, depthWrite: false, side: THREE.DoubleSide });
    const voo = montar({ forma: 'classica', material: 'preto' }, { cena: cv, lente: vidro });
    const LARG = 2 * (voo.sep + .53 + .1);     // largura da frente do óculos, em unidades do modelo
    let VW = 0, VH = 0;
    function medirVoo() {
      VW = innerWidth; VH = innerHeight;
      rv.setPixelRatio(Math.min(devicePixelRatio || 1, 2)); rv.setSize(VW, VH, false);
      cam.aspect = VW / VH; cam.position.set(0, 0, VH / 2 / Math.tan(THREE.MathUtils.degToRad(15))); cam.updateProjectionMatrix();
    }
    medirVoo(); addEventListener('resize', medirVoo);
    const centro = el => { const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width }; };
    // a foto da loja tem uma versão sem o óculos de baixo: ela aparece quando o óculos se solta
    const fotoLoja = origemVoo.closest('.sobre-foto');
    let desenhou = true, kSuave = null;
    (function passo(t) {
      requestAnimationFrame(passo);
      const a = centro(origemVoo), b = centro(destinoVoo);
      // o voo vai de quando o óculos da foto passa de 72% da altura da tela até o destino chegar a 45%
      const s0 = a.y + scrollY - VH * .72, s1 = b.y + scrollY - VH * .45;
      const alvo = reduzir ? 1 : limitar((scrollY - s0) / Math.max(s1 - s0, 1), 0, 1);
      // o movimento segue a rolagem com atraso suave, para o voo ficar lento e sem trancos
      kSuave = kSuave === null || reduzir ? alvo : kSuave + (alvo - kSuave) * .07;
      const k = Math.abs(alvo - kSuave) < .0005 ? alvo : kSuave, e = suave(k);
      fotoLoja.style.setProperty('--tirado', Math.min(k / .03, 1).toFixed(3));
      const naTela = y => y > -300 && y < VH + 300;
      if (k <= 0 || (k >= 1 && !naTela(b.y))) { if (desenhou) { rv.clear(); desenhou = false; } return; }
      desenhou = true;
      const arco = Math.sin(k * Math.PI);
      const x = a.x + (b.x - a.x) * e + arco * VW * .06;
      const y = a.y + (b.y - a.y) * e + (k >= 1 && !reduzir ? Math.sin(t / 1300) * 3 : 0);
      const largura = (a.w + (b.w - a.w) * e) * (1 + .12 * arco);
      voo.g.scale.setScalar(largura / LARG);
      voo.g.position.set(x - VW / 2, VH / 2 - y, 0);
      // começa de lado, como está na foto (lentes para a direita, hastes para a esquerda),
      // dá uma volta só, devagar, e pousa reto, de frente
      voo.g.rotation.set(arco * .12, 1.15 * (1 - e) + e * Math.PI * 2, 0);
      tela.style.opacity = Math.min(k / .03, 1);
      rv.render(cv, cam);
    })(performance.now());
  }

  medir();
  // no celular, a barra de endereço que some ao rolar dispara "resize": só refaz se o tamanho do palco mudou mesmo
  addEventListener('resize', () => { if (palco.clientWidth !== W || palco.clientHeight !== H) medir(); });
  // prepara os 4 modelos de uma vez, para a primeira troca não dar um tranco
  oculos.forEach(o => { o.g.visible = true; });
  renderer.compile(cena, camera);
  oculos.forEach(o => { o.g.visible = false; });
  const comecar = () => { window.oculos3dOk = true; secao.classList.add('com-3d'); requestAnimationFrame(quadro); };
  (document.fonts && document.fonts.load ? document.fonts.load('800 120px Manrope') : Promise.resolve()).then(comecar, comecar);
}
})();
