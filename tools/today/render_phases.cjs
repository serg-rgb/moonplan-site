/* Offline renderer: 72 Moon frames (elongation 0..355 deg, step 5), mean libration, Sun in the screen plane, north up.
   Same shader and textures as assets/space/space.js (moon_4k colour + normal_2k relief; NASA LRO LROC/LOLA).
   Output: assets/today/phases/NNN.webp (1600 px) and NNN-800.webp (800 px), transparent background.
   Run: PLAYWRIGHT_MODULE=<path to playwright> node tools/today/render_phases.cjs   (system Chrome + SwiftShader) */
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const http = require('node:http'), fs = require('node:fs'), path = require('node:path');
const root = path.resolve(__dirname, '../..'), space = path.join(root, 'assets/space'), out = path.join(root, 'assets/today/phases');
const STEP = 5;
// MOON_VS / MOON_FS: copied from assets/space/space.js (kept identical; the only change is alpha = limb coverage).
const PAGE = `<!doctype html><canvas id=c width=1600 height=1600></canvas><canvas id=d width=800 height=800></canvas><script>
const gl=document.getElementById('c').getContext('webgl',{antialias:true,alpha:true,premultipliedAlpha:true,preserveDrawingBuffer:true});
const VS=\`attribute vec3 pos; attribute vec2 uv; uniform float rot; uniform vec3 place; uniform float aspect;
varying vec3 n; varying vec2 vuv; varying vec3 tan;
void main(){ float c = cos(rot), s = sin(rot);
vec3 p = vec3(c*pos.x + s*pos.z, pos.y, -s*pos.x + c*pos.z);
n = p; vuv = uv; float lon = (uv.x - 0.5) * 6.2831853 + rot; tan = vec3(cos(lon), 0.0, -sin(lon));
gl_Position = vec4(place.xy + p.xy * place.z * vec2(1.0/aspect, 1.0), -p.z * 0.5, 1.0); }\`;
const FS=\`precision highp float; varying vec3 n; varying vec2 vuv; varying vec3 tan;
uniform sampler2D albedo; uniform sampler2D nmap; uniform vec3 L; uniform float earth; uniform float expo;
void main(){ vec3 N = normalize(n); vec3 T = normalize(tan - N*dot(tan,N)); vec3 B = cross(N, T);
vec3 tn = texture2D(nmap, vuv).xyz * 2.0 - 1.0; vec3 Np = normalize(T*tn.x + B*tn.y + N*tn.z*1.6);
vec3 a = texture2D(albedo, vuv).rgb;
float mu = max(N.z, 0.02); float mu0g = dot(N, L); float mu0 = max(dot(Np, L), 0.0);
float ls = mu0 / (mu0 + mu) * 2.0;
float lit = mix(ls, mu0, 0.25) * smoothstep(-0.06, 0.08, mu0g);
vec3 col = a * lit * expo + a * earth * vec3(0.62, 0.74, 1.0) * (1.0 - smoothstep(-0.1, 0.1, mu0g));
float edge = smoothstep(0.0, 0.035, N.z);
gl_FragColor = vec4(col * edge, edge); }\`;
function sh(t,s){const o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);if(!gl.getShaderParameter(o,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(o));return o;}
const P=gl.createProgram();gl.attachShader(P,sh(gl.VERTEX_SHADER,VS));gl.attachShader(P,sh(gl.FRAGMENT_SHADER,FS));gl.linkProgram(P);gl.useProgram(P);
function tex(url,unit){return new Promise((ok,no)=>{const i=new Image();i.crossOrigin='anonymous';i.onerror=()=>no(new Error(url));i.onload=()=>{const t=gl.createTexture();gl.activeTexture(gl.TEXTURE0+unit);gl.bindTexture(gl.TEXTURE_2D,t);
gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,i);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);ok();};i.src=url;});}
const LON=256,LAT=128,v=[],idx=[];
for(let y=0;y<=LAT;y++){const la=-Math.PI/2+Math.PI*y/LAT;for(let x=0;x<=LON;x++){const lo=-Math.PI+2*Math.PI*x/LON;v.push(Math.cos(la)*Math.sin(lo),Math.sin(la),Math.cos(la)*Math.cos(lo),x/LON,1-y/LAT);}}
for(let y=0;y<LAT;y++)for(let x=0;x<LON;x++){const a=y*(LON+1)+x,b=a+LON+1;idx.push(a,a+1,b,a+1,b+1,b);}
const vb=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,vb);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(v),gl.STATIC_DRAW);
const ib=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ib);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint32Array(0),gl.STATIC_DRAW);
const idx16=new Uint16Array(idx);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,idx16,gl.STATIC_DRAW);
const u=n=>gl.getUniformLocation(P,n);
window.ready=Promise.all([tex('/moon_4k.webp',0),tex('/normal_2k.webp',1)]);
window.render=(elong)=>{
  const i=Math.abs(180-elong)*Math.PI/180, waxing=elong<180, frac=(1+Math.cos(i))/2, side=waxing?1:-1;
  gl.viewport(0,0,1600,1600);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
  gl.disable(gl.BLEND);gl.enable(gl.DEPTH_TEST);gl.disable(gl.CULL_FACE);
  const pl=gl.getAttribLocation(P,'pos'),ul=gl.getAttribLocation(P,'uv');
  gl.enableVertexAttribArray(pl);gl.vertexAttribPointer(pl,3,gl.FLOAT,false,20,0);gl.enableVertexAttribArray(ul);gl.vertexAttribPointer(ul,2,gl.FLOAT,false,20,12);
  gl.uniform3f(u('place'),0,0,0.92);gl.uniform1f(u('aspect'),1);gl.uniform1f(u('rot'),0);
  gl.uniform3fv(u('L'),[side*Math.sin(i),0,Math.cos(i)]);gl.uniform1f(u('earth'),0.022*(1-frac)+0.003);gl.uniform1f(u('expo'),1.18);
  gl.uniform1i(u('albedo'),0);gl.uniform1i(u('nmap'),1);gl.drawElements(gl.TRIANGLES,idx16.length,gl.UNSIGNED_SHORT,0);
  const big=document.getElementById('c'),d=document.getElementById('d'),x=d.getContext('2d');x.clearRect(0,0,800,800);x.imageSmoothingQuality='high';x.drawImage(big,0,0,800,800);
  return [big.toDataURL('image/webp',0.82),d.toDataURL('image/webp',0.82)];
};
</script>`;
(async () => {
  const srv = http.createServer((q, r) => {
    if (q.url === '/') { r.setHeader('content-type', 'text/html'); return r.end(PAGE); }
    const f = path.join(space, path.basename(q.url));
    if (!fs.existsSync(f)) { r.statusCode = 404; return r.end(); }
    r.setHeader('access-control-allow-origin', '*'); r.end(fs.readFileSync(f));
  }).listen(0, '127.0.0.1');
  await new Promise(ok => srv.once('listening', ok));
  const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage(); page.on('pageerror', e => { throw e; });
  await page.goto(`http://127.0.0.1:${srv.address().port}/`); await page.evaluate(() => window.ready);
  fs.mkdirSync(out, { recursive: true }); let total = 0;
  for (let e = 0; e < 360; e += STEP) {
    const [big, small] = await page.evaluate(e => window.render(e), e); const n = String(e).padStart(3, '0');
    for (const [name, url] of [[`${n}.webp`, big], [`${n}-800.webp`, small]]) {
      if (!url.startsWith('data:image/webp')) throw new Error('webp encoding unsupported');
      const b = Buffer.from(url.split(',')[1], 'base64'); fs.writeFileSync(path.join(out, name), b); total += b.length;
    }
  }
  console.log(`frames: ${fs.readdirSync(out).length}, total bytes: ${total}`);
  await browser.close(); srv.close();
})().catch(e => { console.error(e); process.exit(1); });
