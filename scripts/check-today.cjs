/* Checks for /{lang}/today/ : banned vocabulary, live block per time zone, no console errors. Called from check-site.cjs. */
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const LANGS=['en','de','es','fr','it','pt-br','ru','ja'];
const dist=path.resolve(__dirname,'../dist');
const SUBSTR=['horoscop','astrolog','zodia','oroscop','horósc','horosc','horoskop','astról','zodíac','гороскоп','астролог','зодиак','星座','占星',
  // vocabulary banned in the app (PlannerTests.testBannedWords)
  'fortune','prediction','vorhersage','prognose','占い','ホロスコープ','予言','予測','運勢','предсказ','гадан','судьб','прогноз','predicc','adivin','prédict','predict','voyance','predizion','divinaz','fortuna','simpatia'];
const SIGNS=['aries','taurus','gemini','cancer','leo','virgo','libra','scorpio','sagittarius','capricorn','aquarius','pisces',
  'овен','телец','близнецы','рак','лев','дева','весы','скорпион','стрелец','козерог','водолей','рыбы'];
function bannedHits(text){
  const hits=[];const low=text.toLowerCase();
  for(const w of SUBSTR)if(low.includes(w))hits.push(w);
  for(const w of SIGNS)if(new RegExp(`(?<![\\p{L}])${w}(?![\\p{L}])`,'iu').test(text))hits.push(w);
  return hits;
}
function walk(dir,out=[]){for(const n of fs.readdirSync(dir,{withFileTypes:true})){const f=path.join(dir,n.name);if(n.isDirectory())walk(f,out);else out.push(f);}return out;}
function files(){
  const list=LANGS.map(l=>path.join(dist,l,'today','index.html'));
  for(const f of walk(path.join(dist,'assets','today')))if(/\.(json|js)$/.test(f))list.push(f);  // assets/vendor is a third-party library and is not scanned
  return list;
}
const KINDS={moon:'moon',apollo:'apollo',luna:'luna',china:'china',new:'new'};
const num=s=>parseFloat(s.replace(/[^\d.,-]/g,'').replace(/[\s  ]/g,'').replace(',','.'));
const frameOf=src=>Number(src.match(/\/(\d{3})(?:-800)?\.webp/)[1]);
module.exports=async function checkToday(browser,base){
  let checks=0;
  for(const f of files()){assert.deepEqual(bannedHits(fs.readFileSync(f,'utf8')),[],`banned vocabulary in ${f}`);checks++;}
  for(const f of walk(path.join(dist,'assets','today')))assert.deepEqual(bannedHits(path.basename(f)),[],`banned vocabulary in file name ${f}`);
  assert.equal(fs.readdirSync(path.join(dist,'assets','today','phases')).filter(f=>/^\d{3}(-800)?\.webp$/.test(f)).length,144,'144 phase frames');
  // Banner on every page except the language chooser and 404; the old article-cta block is gone.
  for(const f of walk(dist).filter(f=>f.endsWith('.html'))){
    const rel=path.relative(dist,f),html=fs.readFileSync(f,'utf8'),n=(html.match(/class="app-banner"/g)||[]).length;
    if(rel==='index.html'||rel==='404.html')assert.equal(n,0,`${rel}: no banner on chooser/404`);
    else{assert.equal(n,1,`${rel}: exactly one banner`);assert(!html.includes('article-cta'),`${rel}: old CTA block`);
      const m=rel.match(/^[^/]+\/(moon|apollo|luna|china|new)\//);const kind=rel.endsWith('/today/index.html')||rel.includes('today/')?'today':m?KINDS[m[1]]:/^[^/]+\/index\.html$/.test(rel)?'home':'general';
      assert(html.includes(`data-banner="${kind}"`),`${rel}: banner kind ${kind}`);}
    checks++;
  }
  for(const timezoneId of ['Europe/Moscow','America/New_York']){
    const ctx=await browser.newContext({timezoneId,viewport:{width:1440,height:900}});
    const page=await ctx.newPage();const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
    for(const lang of LANGS){
      await page.goto(`${base}/${lang}/today/`,{waitUntil:'networkidle'});
      await page.waitForSelector('[data-today] .today-facts',{timeout:10000});
      const r=await page.evaluate(()=>{const f=k=>document.querySelector(`[data-fact=${k}]`)?.textContent||'';const img=document.querySelector('[data-frame] img');
        const A=window.Astronomy,now=new Date();
        return{facts:Object.fromEntries(['lit','age','dist','diam','liblon','liblat','angle'].map(k=>[k,f(k)])),tz:document.querySelector('.today-tz').textContent,
        phase:document.querySelector('.today-phase').textContent.length,lists:document.querySelectorAll('.today-next li').length,canvas:document.querySelectorAll('canvas').length,
        img:img&&{src:img.currentSrc||img.src,ok:img.complete&&img.naturalWidth>0,alt:img.alt.length},banner:document.querySelectorAll('.app-banner[data-banner=today]').length,
        elong:A.MoonPhase(now),ill:A.Illumination(A.Body.Moon,now).phase_fraction*100,body:document.body.innerText}});
      for(const [k,v] of Object.entries(r.facts))assert(v.length>0,`${lang} ${timezoneId}: fact ${k} missing`);
      const lit=num(r.facts.lit),dist=Number(r.facts.dist.replace(/\D/g,'')),diam=num(r.facts.diam);
      assert(lit>=0&&lit<=100&&Math.abs(lit-r.ill)<=1,`${lang}: illumination ${lit} vs ${r.ill}`);
      assert(dist>=356000&&dist<=407000,`${lang}: distance ${r.facts.dist}`);assert(diam>=29&&diam<=34,`${lang}: diameter ${r.facts.diam}`);
      assert(r.facts.liblon.length>0&&/[+\-−]/.test(r.facts.liblon),`${lang}: libration sign`);
      assert(r.tz.includes(timezoneId),`${lang}: time zone shown ${r.tz}`);
      assert(r.phase>0&&r.lists===7,`${lang}: phase name / lists ${r.lists}`);
      assert.equal(r.canvas,0,`${lang}: no canvas (pre-rendered frames)`);assert(r.img&&r.img.ok&&r.img.alt>0,`${lang}: Moon frame loaded`);
      assert.equal(frameOf(r.img.src),(Math.round(r.elong/5)%72)*5,`${lang}: nearest frame for elongation ${r.elong}`);
      assert.equal(r.banner,1,`${lang}: today banner`);
      checks++;
    }
    assert.deepEqual(errors,[],`console errors (${timezoneId})`);
    await ctx.close();
  }
  // The frame follows the clock: three fixed moments give three different frames; no JavaScript still gives the static text.
  const seen=new Set();
  for(const iso of ['2026-11-20T12:00:00Z','2026-12-01T12:00:00Z','2026-12-04T12:00:00Z']){
    const ctx=await browser.newContext({viewport:{width:1000,height:800}});const page=await ctx.newPage();
    await page.clock.install({time:new Date(iso)});await page.goto(`${base}/en/today/`,{waitUntil:'networkidle'});await page.waitForSelector('[data-fact=lit]');
    seen.add(await page.evaluate(()=>(document.querySelector('[data-frame] img').currentSrc||'').match(/\/(\d{3})(?:-800)?\.webp/)[1]));checks++;await ctx.close();
  }
  assert.equal(seen.size,3,`frame changes with the clock: ${[...seen]}`);
  const noJS=await browser.newContext({javaScriptEnabled:false});const plain=await noJS.newPage();await plain.goto(`${base}/ru/today/`);
  assert(await plain.locator('noscript').count()>=1&&(await plain.locator('.article-body h2').count())>=6,'no-JS text');await noJS.close();checks++;
  return checks;
};
