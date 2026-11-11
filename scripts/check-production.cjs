const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const base=process.env.SITE_URL || 'https://moonplan.day';
const artifacts=path.resolve(__dirname,'../verification');
fs.mkdirSync(artifacts,{recursive:true});
(async()=>{
  const browser=await chromium.launch({channel:'chrome',headless:true});
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error'&&!m.text().includes('404'))errors.push(m.text());});
  let pages=0;
  for(const lang of ['en','de','es','fr','it','pt-br','ru','ja']){
    for(const file of ['','privacy.html','terms.html','support.html','publisher.html']){
      const response=await page.goto(`${base}/${lang}/${file}`,{waitUntil:'networkidle'});
      assert.equal(response.status(),200,page.url());
      assert.equal(await page.locator('h1').count(),1,page.url());
      assert.equal(await page.evaluate(()=>getComputedStyle(document.body).backgroundColor),'rgb(7, 7, 17)');
      assert.equal(await page.locator('html').getAttribute('lang'),lang==='pt-br'?'pt-BR':lang);
      assert(!(await page.locator('meta[name=robots]').getAttribute('content')).includes('noindex'));
      assert.equal(await page.locator('link[rel=canonical]').getAttribute('href'),`${base}/${lang}/${file}`);
      assert.deepEqual(await page.locator('img').evaluateAll(images=>images.filter(x=>x.complete&&x.naturalWidth===0).map(x=>x.src)),[]);
      if(file==='privacy.html')assert((await page.locator('.legal-body').innerText()).includes('Vercel'));
      pages++;
    }
  }
  await page.goto(`${base}/en/privacy.html`);
  await page.locator('.site-header .lang-menu summary').click();
  await page.locator('.site-header .lang-list a[hreflang=ja]').click();
  assert(page.url().endsWith('/ja/privacy.html'));
  await page.setViewportSize({width:390,height:844});
  await page.goto(`${base}/de/`,{waitUntil:'networkidle'});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  await page.locator('.mobile-menu summary').click();
  await page.locator('.mobile-menu nav a').first().click();
  assert(page.url().endsWith('#discover'));
  await page.goto(`${base}/ja/`,{waitUntil:'networkidle'});
  await page.screenshot({path:path.join(artifacts,'production-ja-mobile.png')});
  await page.setViewportSize({width:1440,height:1000});
  await page.goto(`${base}/en/`,{waitUntil:'networkidle'});
  await page.screenshot({path:path.join(artifacts,'production-en-desktop.png')});
  const missing=await page.goto(`${base}/does-not-exist/`);
  assert.equal(missing.status(),404);
  assert((await page.locator('h1').innerText()).includes('orbit'));
  await page.goto('https://www.moonplan.day/en/',{waitUntil:'networkidle'});
  assert.equal(new URL(page.url()).host,'moonplan.day');
  assert.deepEqual(errors,[]);
  const report={url:base,pagesChecked:pages,https:true,wwwRedirect:true,custom404:true,errors};
  fs.writeFileSync(path.join(artifacts,'production.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify(report));
  await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
