/* Browser checks; point PLAYWRIGHT_MODULE at an existing installation. */
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const base=process.env.SITE_URL || 'http://127.0.0.1:4817';
const artifacts=process.env.ARTIFACTS || path.resolve(__dirname,'../verification');
fs.mkdirSync(artifacts,{recursive:true});
(async()=>{
  const browser=await chromium.launch({channel:'chrome',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const context=await browser.newContext({viewport:{width:1440,height:1000}});
  const page=await context.newPage();const errors=[];let checks=0;const bad=[];
  page.on('pageerror',error=>errors.push(error.message));
  page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
  page.on('response',response=>{if(response.status()>=400)bad.push({url:response.url(),status:response.status()});});
  const routes=['/','/404.html',...['en','de','es','fr','it','pt-br','ru','ja'].flatMap(lang=>['','privacy.html','terms.html','support.html','publisher.html'].map(file=>`/${lang}/${file}`))];
  // Articles: articles/{slug}/{lang}.md -> /{lang}/moon/{slug}.html plus the hub /{lang}/moon/ per language that has one.
  const articleDir=path.resolve(__dirname,'../articles');const articleRoutes=new Set();
  for(const slug of fs.readdirSync(articleDir)){const dir=path.join(articleDir,slug);if(!fs.statSync(dir).isDirectory())continue;
    for(const f of fs.readdirSync(dir))if(f.endsWith('.md')){const lang=f.slice(0,-3);articleRoutes.add(`/${lang}/moon/`);articleRoutes.add(`/${lang}/moon/${slug}.html`);}}
  routes.push(...articleRoutes);
  for(const width of [320,390,768,1440]){
    await page.setViewportSize({width,height:900});
    for(const route of routes){
      const response=await page.goto(base+route,{waitUntil:'networkidle'});
      assert.equal(response.status(),200,route);
      const result=await page.evaluate(()=>({
        overflow:document.documentElement.scrollWidth>innerWidth,
        headings:document.querySelectorAll('h1').length,
        missingAlt:[...document.images].filter(image=>!image.hasAttribute('alt')).length,
        badImages:[...document.images].filter(image=>image.complete && image.naturalWidth===0).map(image=>image.src),
        links:[...document.querySelectorAll('a[href]')].map(a=>a.getAttribute('href')),
        lang:document.documentElement.lang,
        canonical:document.querySelector('link[rel=canonical]')?.href,
        alternates:document.querySelectorAll('link[rel=alternate]').length
      }));
      assert.equal(result.overflow,false,`${width}: horizontal overflow ${route}`);
      assert.equal(result.headings,1,route);assert.equal(result.missingAlt,0,route);assert.deepEqual(result.badImages,[],route);
      assert(result.canonical,route);if(articleRoutes.has(route))assert(result.alternates>=2,route);else assert.equal(result.alternates,9,route);
      assert(!result.links.includes('#'),`${route}: dead anchor`);
      if(articleRoutes.has(route)){const x=await page.evaluate(()=>({canvas:document.querySelectorAll('canvas').length,ld:[...document.querySelectorAll('script[type="application/ld+json"]')].map(n=>JSON.parse(n.textContent)['@graph'].length),svg:document.querySelectorAll('svg.fig-svg title').length,og:document.querySelector('meta[property="og:type"]').content,wide:[...document.querySelectorAll('.article-body *')].filter(n=>n.getBoundingClientRect().right>innerWidth+1&&!n.closest('.table-wrap,.fig')).length}));
      assert.equal(x.canvas,0,route);assert.equal(x.wide,0,route+' content wider than viewport');if(route.endsWith('.html')){assert.deepEqual(x.ld,[2],route);assert.equal(x.og,'article',route);assert.equal(x.svg,2,route);}}
    if(/^\/(en|de|es|fr|it|pt-br|ru|ja)\//.test(route))assert.equal(result.lang,route.split('/')[1].replace('pt-br','pt-BR'));
      checks++;
    }
  }
  // A legal language change must stay on the same document.
  for(const file of ['privacy.html','terms.html','support.html','publisher.html']){
    await page.goto(base+'/en/'+file);
    for(const [code,dir] of [['de','de'],['pt-BR','pt-br'],['ja','ja']]){
      await page.locator('.site-header .lang-menu summary').click();
      await page.locator(`.site-header .lang-list a[hreflang=${code}]`).click();
      assert(page.url().endsWith(`/${dir}/`+file));
    }
    await page.locator('.site-header .lang-menu summary').click();
    await page.keyboard.press('Escape');assert.equal(await page.locator('.site-header .lang-menu').getAttribute('open'),null);checks++;
  }
  await page.setViewportSize({width:390,height:844});
  await page.goto(base+'/de/');
  const menu=page.locator('.mobile-menu');
  await menu.locator('summary').click();assert(await menu.getAttribute('open')!==null);
  assert.equal(await menu.locator('nav').evaluate(el=>Math.round(el.getBoundingClientRect().height)),844);
  await page.keyboard.press('Escape');assert.equal(await menu.getAttribute('open'),null);
  await menu.locator('summary').click();await menu.locator('a').first().click();
  assert.equal(await menu.getAttribute('open'),null);checks++;
  // Native FAQ works, and content stays available without scripts.
  const noJS=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});
  const plain=await noJS.newPage();await plain.goto(base+'/en/');
  const question=plain.locator('.faq-items details').first();await question.locator('summary').click();
  assert.equal(await question.locator('p').isVisible(),true);
  await plain.locator('.mobile-menu summary').click();
  assert.equal(await plain.locator('.mobile-menu nav').evaluate(el=>Math.round(el.getBoundingClientRect().height)),844);
  await noJS.close();checks++;
  // Landing: canvas background, no hero phone, 4 news cards with https links, HUD text from the content file.
  const landings=['en','de','es','fr','it','pt-br','ru','ja'];
  for(const lang of landings){
    await page.setViewportSize({width:1440,height:900});await page.goto(base+`/${lang}/`,{waitUntil:'networkidle'});
    assert.equal(await page.locator('body > canvas#space').count(),1,`${lang}: canvas#space`);
    assert.equal(await page.locator('.hero .phone, .hero-visual').count(),0,`${lang}: hero phone removed`);
    assert.equal(await page.evaluate(()=>getComputedStyle(document.querySelector('#space')).pointerEvents),'none',`${lang}: canvas must not block clicks`);
    const hrefs=await page.locator('.news .feed a').evaluateAll(n=>n.map(a=>a.getAttribute('href')));
    assert.equal(hrefs.length,4,`${lang}: news cards`);assert(hrefs.every(h=>h.startsWith('https://')),`${lang}: news links`);
    assert(await page.locator('.news time[datetime]').evaluateAll(n=>n.every(t=>t.textContent.trim().length>3)),`${lang}: news dates`);
    assert(await page.locator('#questions').evaluate(el=>el.previousElementSibling.id==='news'),`${lang}: news before FAQ`);
    await page.waitForFunction(()=>document.querySelector('[data-phase]').textContent.trim().length>0);
    const hud=await page.locator('[data-phase]').textContent();
    assert(/\d+%/.test(hud),`${lang}: HUD ${hud}`);
    assert(hud.includes(await page.locator('[data-phase]').getAttribute('data-lit')),`${lang}: HUD localized`);
    checks++;
  }
  for(const file of ['privacy.html','support.html'])
    {await page.goto(base+'/en/'+file);assert.equal(await page.locator('canvas#space, script[src*="space.js"]').count(),0,'space only on landing');}
  // Reduced motion, keyboard entry point and real email action.
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto(base+'/en/');
  await page.keyboard.press('Tab');assert.equal(await page.locator('.skip').evaluate(el=>el===document.activeElement),true);
  assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior),'auto');
  await page.goto(base+'/en/support.html');assert((await page.locator('.contact-actions .button').getAttribute('href')).startsWith('mailto:admin@aurelialabs.io'));
  await context.grantPermissions(['clipboard-read','clipboard-write']);await page.locator('.copy-email').click();
  await page.waitForFunction(()=>document.querySelector('.copy-status').textContent.length>0);
  assert.equal(await page.locator('.copy-status').innerText(),'Email copied');checks++;
  // Crawl all local page / asset links and validate hash destinations.
  const seen=new Set();
  for(const route of routes){
    await page.goto(base+route);
    const links=await page.locator('a[href]').evaluateAll(nodes=>nodes.map(n=>n.href));
    for(const href of links){
      const url=new URL(href);if(url.origin!==new URL(base).origin||seen.has(href))continue;
      seen.add(href);
      const response=await context.request.get(href);
      assert.equal(response.status(),200,href);
      if(url.hash){const html=await response.text();assert(html.includes(`id="${url.hash.slice(1)}"`),href);}
    }
  }
  for(const lang of ['en','de','ja']){
    for(const width of [390,1440]){
      await page.setViewportSize({width,height:1000});await page.goto(base+`/${lang}/`,{waitUntil:'networkidle'});
      await page.screenshot({path:path.join(artifacts,`${lang}-${width}-hero.png`)});
      for(let y=0;y<await page.evaluate(()=>document.body.scrollHeight);y+=800){await page.evaluate(y=>window.scrollTo(0,y),y);await page.waitForTimeout(70);}
      await page.evaluate(()=>window.scrollTo(0,0));await page.waitForTimeout(300);
      await page.screenshot({path:path.join(artifacts,`${lang}-${width}-full.png`),fullPage:true});
    }
  }
  assert.deepEqual(bad,[],'Failed resources');assert.deepEqual(errors,[],'Browser errors');
  const report={passed:true,viewChecks:checks,linksChecked:seen.size,widths:[320,390,768,1440],routes:routes.length,browserErrors:errors,failedResources:bad};
  fs.writeFileSync(path.join(artifacts,'checks.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
  await browser.close();
})().catch(error=>{console.error(error);process.exit(1);});
