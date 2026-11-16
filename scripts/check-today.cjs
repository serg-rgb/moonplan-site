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
function files(){
  const list=LANGS.map(l=>path.join(dist,l,'today','index.html'));
  const dir=path.join(dist,'assets','today');
  for(const f of fs.readdirSync(dir))if(/\.(json|js)$/.test(f))list.push(path.join(dir,f));
  return list;
}
module.exports=async function checkToday(browser,base){
  let checks=0;
  for(const f of files()){assert.deepEqual(bannedHits(fs.readFileSync(f,'utf8')),[],`banned vocabulary in ${f}`);checks++;}
  for(const timezoneId of ['Europe/Moscow','America/New_York']){
    const ctx=await browser.newContext({timezoneId,viewport:{width:1440,height:900}});
    const page=await ctx.newPage();const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
    for(const lang of LANGS){
      await page.goto(`${base}/${lang}/today/`,{waitUntil:'networkidle'});
      await page.waitForSelector('[data-today] .today-list li',{timeout:10000});
      const r=await page.evaluate(()=>({items:document.querySelectorAll('[data-today] .today-list li').length,
        strip:document.querySelectorAll('.today-strip button').length,tz:document.querySelector('.today-tz').textContent,
        all:document.querySelectorAll('.today-all li').length}));
      assert(r.items>=1,`${lang} ${timezoneId}: no list items`);assert.equal(r.strip,7);assert.equal(r.all,40);
      assert(r.tz.includes(timezoneId.replace('_',' ')),`${lang}: time zone shown ${r.tz}`);
      const before=await page.locator('.today-date').textContent();
      await page.locator('.today-strip button').nth(3).click();
      assert.notEqual(await page.locator('.today-date').textContent(),before,`${lang}: strip click changes the day`);
      assert.equal(await page.locator('.today-strip button[aria-pressed=true]').count(),1);
      checks++;
    }
    assert.deepEqual(errors,[],`console errors (${timezoneId})`);
    await ctx.close();
  }
  return checks;
};
