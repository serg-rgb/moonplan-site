// Open-space background: a starfield with parallax depth and the Moon (NASA LRO LROC colour + LOLA-derived normals),
// lit by today's real phase, slowly turning. Plain WebGL 1, no libraries.
import { moonPhase } from './moonphase.js';

const canvas = document.getElementById('space');
if (!canvas) throw new Error('canvas#space missing');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const small = matchMedia('(max-width: 760px)').matches;
const gl = canvas.getContext('webgl', { antialias: true, alpha: false, powerPreference: 'high-performance' });

const phase = moonPhase(new Date());
publishCaption(phase);

function publishCaption(p) {
  const el = document.querySelector('[data-phase]');
  if (!el) return;
  const pct = Math.round(p.fraction * 100);
  const lang = document.documentElement.lang || 'en';
  const date = new Intl.DateTimeFormat(lang, { day: 'numeric', month: 'long' }).format(new Date());
  // All words come from the page (content/{lang}.json via data-* attributes); nothing is hardcoded here.
  const trend = p.waxing ? el.dataset.waxing : el.dataset.waning, lit = el.dataset.lit;
  el.textContent = `${date} · ${lit} ${pct}% · ${trend}`;
}

const tex = (name) => new URL(`./${name}.webp`, import.meta.url).href;

function shader(type, src) {
  const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
  return s;
}
function program(vs, fs) {
  const p = gl.createProgram();
  gl.attachShader(p, shader(gl.VERTEX_SHADER, vs)); gl.attachShader(p, shader(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(p); return p;
}
function texture(url, unit) {
  return new Promise((resolve) => {
    const img = new Image(); img.decoding = 'async';
    img.onload = () => {
      const t = gl.createTexture(); gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); // NPOT-safe in WebGL 1
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      resolve(t);
    };
    img.src = url;
  });
}

// ---------- stars: deterministic, three depth layers; they do not twinkle (no atmosphere in space)
function makeStars(count) {
  let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const data = new Float32Array(count * 8);                          // x, y, depth, size, r, g, b, brightness
  for (let i = 0; i < count; i++) {
    const depth = rnd() < 0.7 ? 0.15 : rnd() < 0.8 ? 0.45 : 1.0;    // parallax factor
    const mag = Math.pow(rnd(), 3.2);                                 // many faint, few bright
    const t = rnd();                                                  // colour temperature
    const col = t < 0.12 ? [1.0, 0.82, 0.66] : t < 0.3 ? [1.0, 0.93, 0.84] : t < 0.85 ? [0.96, 0.97, 1.0] : [0.78, 0.86, 1.0];
    data.set([rnd() * 2 - 1, rnd() * 2 - 1, depth, 0.6 + mag * (depth > 0.9 ? 3.4 : 2.0), ...col, 0.18 + mag * 0.82], i * 8);
  }
  return data;
}
const STAR_VS = `attribute vec2 p; attribute float d; attribute float s; attribute vec3 c; attribute float b;
uniform vec2 off; uniform float px; uniform float fade; varying vec3 vc; varying float vb;
void main(){ vec2 q = p + off * d; q = mod(q + 1.0, 2.0) - 1.0; gl_Position = vec4(q, 0.999, 1.0);
gl_PointSize = s * px; vc = c; vb = b * fade; }`;
const STAR_FS = `precision mediump float; varying vec3 vc; varying float vb;
void main(){ vec2 u = gl_PointCoord * 2.0 - 1.0; float r = dot(u, u); if (r > 1.0) discard;
float a = exp(-r * 4.5) * vb; gl_FragColor = vec4(vc * a, 1.0); }`;

// ---------- the Moon: orthographic sphere (from Earth the Moon is effectively seen in parallel projection)
function makeSphere(lonSeg, latSeg) {
  const v = [], idx = [];
  for (let y = 0; y <= latSeg; y++) {
    const lat = -Math.PI / 2 + Math.PI * y / latSeg;
    for (let x = 0; x <= lonSeg; x++) {
      const lon = -Math.PI + 2 * Math.PI * x / lonSeg;
      v.push(Math.cos(lat) * Math.sin(lon), Math.sin(lat), Math.cos(lat) * Math.cos(lon), x / lonSeg, 1 - y / latSeg);
    }
  }
  for (let y = 0; y < latSeg; y++) for (let x = 0; x < lonSeg; x++) {
    const a = y * (lonSeg + 1) + x, b = a + lonSeg + 1;
    idx.push(a, a + 1, b, a + 1, b + 1, b);
  }
  return { v: new Float32Array(v), i: new Uint16Array(idx) };
}
const MOON_VS = `attribute vec3 pos; attribute vec2 uv; uniform float rot; uniform vec3 place; uniform float aspect;
varying vec3 n; varying vec2 vuv; varying vec3 tan;
void main(){ float c = cos(rot), s = sin(rot);
vec3 p = vec3(c*pos.x + s*pos.z, pos.y, -s*pos.x + c*pos.z);
n = p; vuv = uv; float lon = (uv.x - 0.5) * 6.2831853 + rot; tan = vec3(cos(lon), 0.0, -sin(lon));
gl_Position = vec4(place.xy + p.xy * place.z * vec2(1.0/aspect, 1.0), -p.z * 0.5, 1.0); }`;
const MOON_FS = `precision highp float; varying vec3 n; varying vec2 vuv; varying vec3 tan;
uniform sampler2D albedo; uniform sampler2D nmap; uniform vec3 L; uniform float earth; uniform float expo;
void main(){ vec3 N = normalize(n); vec3 T = normalize(tan - N*dot(tan,N)); vec3 B = cross(N, T);
vec3 tn = texture2D(nmap, vuv).xyz * 2.0 - 1.0; vec3 Np = normalize(T*tn.x + B*tn.y + N*tn.z*1.6);
vec3 a = texture2D(albedo, vuv).rgb;
float mu = max(N.z, 0.02); float mu0g = dot(N, L); float mu0 = max(dot(Np, L), 0.0);
float ls = mu0 / (mu0 + mu) * 2.0;                       // Lommel-Seeliger: the Moon stays bright to the limb
float lit = mix(ls, mu0, 0.25) * smoothstep(-0.06, 0.08, mu0g);
vec3 col = a * lit * expo + a * earth * vec3(0.62, 0.74, 1.0) * (1.0 - smoothstep(-0.1, 0.1, mu0g));
float edge = smoothstep(0.0, 0.035, N.z);              // soft antialiased limb
gl_FragColor = vec4(col * edge, 1.0); }`;

async function start() {
  const starProg = program(STAR_VS, STAR_FS), moonProg = program(MOON_VS, MOON_FS);
  const stars = makeStars(small ? 1400 : 2600);
  const sb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, sb); gl.bufferData(gl.ARRAY_BUFFER, stars, gl.STATIC_DRAW);
  const sphere = makeSphere(small ? 96 : 160, small ? 48 : 80);
  const vb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, vb); gl.bufferData(gl.ARRAY_BUFFER, sphere.v, gl.STATIC_DRAW);
  const ib = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, sphere.i, gl.STATIC_DRAW);

  // light: phase angle i between Sun and Earth as seen from the Moon; waxing Moon is lit on the right (north up)
  const i = phase.phaseAngle * Math.PI / 180, side = phase.waxing ? 1 : -1;
  const L = [side * Math.sin(i), 0.0, Math.cos(i)];
  const earthshine = 0.022 * (1 - phase.fraction) + 0.003;           // brighter near new Moon

  // textures: small first so something shows at once, then the sharp ones
  const big = !small && Math.min(screen.width, screen.height) * devicePixelRatio > 1400;
  await Promise.all([texture(tex('moon_2k'), 0), texture(tex('normal_1k'), 1)]);
  let ready = performance.now();
  if (big) texture(tex('moon_4k'), 0).then(() => texture(tex('normal_2k'), 1));
  else if (!small) texture(tex('normal_2k'), 1);
  document.documentElement.classList.add('space-ready');

  let W = 0, H = 0, px = 1;
  function resize() {
    px = Math.min(devicePixelRatio || 1, small ? 1.5 : 1.75);
    W = Math.round(innerWidth * px); H = Math.round(innerHeight * px);
    canvas.width = W; canvas.height = H; gl.viewport(0, 0, W, H);
  }
  resize(); addEventListener('resize', resize);

  let pointer = [0, 0], target = [0, 0], scrollY = 0;
  addEventListener('pointermove', (e) => { target = [e.clientX / innerWidth - 0.5, e.clientY / innerHeight - 0.5]; }, { passive: true });
  addEventListener('scroll', () => { scrollY = window.scrollY; document.documentElement.classList.toggle('scrolled', scrollY > innerHeight * 0.4); }, { passive: true });

  let visible = true; document.addEventListener('visibilitychange', () => { visible = !document.hidden; if (visible) loop(); });
  const ease = (t) => 1 - Math.pow(1 - Math.min(Math.max(t, 0), 1), 4);

  function frame(now) {
    const t = (now - ready) / 1000;
    pointer[0] += (target[0] - pointer[0]) * 0.04; pointer[1] += (target[1] - pointer[1]) * 0.04;
    const sp = Math.min(scrollY / innerHeight, 1.6);
    const aspect = W / H;
    const intro = reduce ? 1 : ease(t / 2.4);
    gl.clearColor(0.016, 0.016, 0.04, 1); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // stars: additive, drift with pointer and scroll (deeper layers move more)
    gl.disable(gl.DEPTH_TEST); gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE);
    gl.useProgram(starProg); gl.bindBuffer(gl.ARRAY_BUFFER, sb);
    const attr = (name, size, offset) => { const l = gl.getAttribLocation(starProg, name); gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l, size, gl.FLOAT, false, 32, offset); };
    attr('p', 2, 0); attr('d', 1, 8); attr('s', 1, 12); attr('c', 3, 16); attr('b', 1, 28);
    const drift = reduce ? 0 : t * 0.0025;
    gl.uniform2f(gl.getUniformLocation(starProg, 'off'), -pointer[0] * 0.06 + drift, pointer[1] * 0.06 + sp * 0.35);
    gl.uniform1f(gl.getUniformLocation(starProg, 'px'), px);
    gl.uniform1f(gl.getUniformLocation(starProg, 'fade'), intro);
    gl.drawArrays(gl.POINTS, 0, stars.length / 8);
    for (const n of ['p', 'd', 's', 'c', 'b']) gl.disableVertexAttribArray(gl.getAttribLocation(starProg, n));

    // moon
    gl.disable(gl.BLEND); gl.enable(gl.DEPTH_TEST); gl.disable(gl.CULL_FACE);
    gl.useProgram(moonProg); gl.bindBuffer(gl.ARRAY_BUFFER, vb); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib);
    const pl = gl.getAttribLocation(moonProg, 'pos'), ul = gl.getAttribLocation(moonProg, 'uv');
    gl.enableVertexAttribArray(pl); gl.vertexAttribPointer(pl, 3, gl.FLOAT, false, 20, 0);
    gl.enableVertexAttribArray(ul); gl.vertexAttribPointer(ul, 2, gl.FLOAT, false, 20, 12);
    const r = small ? 0.62 : 0.84;                                          // radius in NDC height units
    const cx = small ? 0.0 : 0.44, cy = small ? 0.42 : -0.04;
    const scale = r * (0.94 + 0.06 * intro) * (1 + sp * 0.18);
    gl.uniform3f(gl.getUniformLocation(moonProg, 'place'), cx - pointer[0] * 0.02, cy + pointer[1] * 0.02 + sp * 0.55, scale);
    gl.uniform1f(gl.getUniformLocation(moonProg, 'aspect'), aspect);
    gl.uniform1f(gl.getUniformLocation(moonProg, 'rot'), reduce ? 0 : t * 0.018);   // about 6 minutes per turn
    gl.uniform3fv(gl.getUniformLocation(moonProg, 'L'), L);
    gl.uniform1f(gl.getUniformLocation(moonProg, 'earth'), earthshine * intro);
    gl.uniform1f(gl.getUniformLocation(moonProg, 'expo'), 1.18 * intro * (1 - Math.min(sp, 1) * 0.8));
    gl.uniform1i(gl.getUniformLocation(moonProg, 'albedo'), 0); gl.uniform1i(gl.getUniformLocation(moonProg, 'nmap'), 1);
    gl.drawElements(gl.TRIANGLES, sphere.i.length, gl.UNSIGNED_SHORT, 0);
    gl.disableVertexAttribArray(pl); gl.disableVertexAttribArray(ul);
  }
  function loop(now = performance.now()) {
    if (!visible) return;
    frame(now);
    if (!reduce) requestAnimationFrame(loop);
  }
  if (reduce) { frame(performance.now()); addEventListener('resize', () => frame(performance.now())); addEventListener('scroll', () => requestAnimationFrame(frame), { passive: true }); }
  else requestAnimationFrame(loop);
}

if (!gl) document.documentElement.classList.add('no-webgl'); else start().catch((e) => { console.error(e); document.documentElement.classList.add('no-webgl'); });
