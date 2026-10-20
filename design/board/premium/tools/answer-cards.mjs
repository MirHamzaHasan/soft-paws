// Synthetic local board QA only; never opens a signed-in browser or a journal.
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.argv[2]||'http://localhost:4278/premium/index.html';
const out=process.argv[3]||'.verify-build/task041';await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1100},deviceScaleFactor:1});
const errors=[],external=[],checks=[],layouts=[],motion=[];
page.on('pageerror',e=>errors.push(e.message));
page.on('request',r=>{if(/^https?:/.test(r.url())&&!['localhost','127.0.0.1'].includes(new URL(r.url()).hostname))external.push(r.url());});
const phone=()=>page.locator('.player .ph').last();
const wait=id=>page.waitForFunction(id=>NEXT.activeContext?.screen.id===id,id);
let navigation=0;
const go=async(id,theme='light',compact=false,large=false,reduced=false)=>{
  await page.goto(base+'?answerQa='+(++navigation)+'&answerTheme='+theme+'&phone='+(compact?'375x667':'390x844')+'&reducedMotion='+reduced+'#play-'+id);
  await wait(id);await page.evaluate(()=>document.fonts.ready);
  if(large)await phone().evaluate(el=>el.style.setProperty('--text-scale','1.3'));
  await page.waitForTimeout(id==='next-chat-cards-error'?1600:850);
};
const capture=async name=>{await phone().screenshot({path:out+'/'+name+'.png'});};
const click=async label=>{await phone().getByRole('button',{name:label,exact:true}).click();await page.waitForTimeout(450);};
const scroll=async bottom=>phone().locator('.bl-scroll').evaluate((el,bottom)=>el.scrollTop=bottom?el.scrollHeight:0,bottom);
const metrics=()=>phone().evaluate(root=>{
  const rgb=s=>{const a=s.match(/[\d.]+/g)?.map(Number)||[];return a.length===3?[...a,1]:a;};
  const over=(a,b)=>[...a.slice(0,3).map((v,i)=>v*a[3]+b[i]*(1-a[3])),1];
  const background=el=>{const stack=[];for(let n=el;n;n=n.parentElement)stack.unshift(rgb(getComputedStyle(n).backgroundColor));return stack.reduce((b,a)=>a.length>=4?over(a,b):b,[255,255,255,1]);};
  const lum=c=>c.slice(0,3).map(x=>x/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4).reduce((v,x,i)=>v+x*[.2126,.7152,.0722][i],0);
  const contrast=[];
  root.querySelectorAll('.ac-intro,.ac-muted,.ac-boundary,.ac-eyebrow,.ac-action,.ac-summary span,.ac-day strong,.ac-day>span:last-child,.ac-latest p,.ac-latest strong,.ac-step p,.n-composer-caption,.n-context-button').forEach(el=>{
    if(!el.textContent.trim())return;const c=rgb(getComputedStyle(el).color),bg=background(el),l1=lum(over(c,bg)),l2=lum(bg);contrast.push({text:el.textContent.slice(0,38),ratio:(Math.max(l1,l2)+.05)/(Math.min(l1,l2)+.05)});
  });
  const targets=[...root.querySelectorAll('button')].filter(el=>el.getClientRects().length).map(el=>{const r=el.getBoundingClientRect(),scale=root.getBoundingClientRect().width/root.offsetWidth;return {name:el.getAttribute('aria-label')||el.textContent.trim(),width:r.width/scale,height:r.height/scale};});
  const overflow=[...root.querySelectorAll('.ac-card,.n-composer,.n-context-button,.n-chat-top,.ac-step,.ac-source-record')].filter(el=>el.scrollWidth>el.clientWidth+2).map(el=>el.className);
  const header=root.querySelector('.n-chat-top'),sc=root.querySelector('.bl-scroll'),composer=root.querySelector('.n-composer');
  return {contrast,targets,overflow,phoneWidth:root.offsetWidth,phoneHeight:root.offsetHeight,headerBottom:header?.offsetTop+header?.offsetHeight,readingBottom:sc?.offsetTop+sc?.offsetHeight,composerTop:composer?.offsetTop,bodyTop:root.querySelector('.n-body')?.getBoundingClientRect().top-root.getBoundingClientRect().top,backendExposed:/atlas/i.test(root.innerText)};
});
try{
  const ids=['next-chat-cards','next-chat-cards-brushing','next-chat-cards-no-match','next-chat-cards-empty','next-chat-cards-products','next-chat-cards-loading','next-chat-cards-error','next-ai-cards-consent'];
  for(const theme of ['light','dark'])for(const id of ids){
    await go(id,theme);const name=id.replace('next-','')+'-'+theme;
    await capture(name);
    if(!id.includes('consent')&&!id.includes('loading')&&!id.includes('error')){await scroll(true);await capture(name+'-lower');await scroll(false);}
    const m=await metrics();assert.deepEqual(m.overflow,[],name+' horizontal overflow');assert.equal(m.backendExposed,false);
    for(const t of m.targets){assert.ok(t.name,name+' unnamed control');assert.ok(t.width>=47.5&&t.height>=47.5,name+' small target '+JSON.stringify(t));}
    for(const c of m.contrast)assert.ok(c.ratio>=4.5,name+' contrast '+JSON.stringify(c));
    if(!id.includes('consent'))assert.ok(m.readingBottom<=m.composerTop,name+' composer covers reading viewport');
    layouts.push({id,theme,large:false,compact:false,...m});
  }
  for(const theme of ['light','dark'])for(const id of ['next-chat-cards','next-chat-cards-empty','next-ai-cards-consent']){
    await go(id,theme,true,true);const name=id.replace('next-','')+'-'+theme+'-375-130';await capture(name);await scroll(true);await capture(name+'-lower');
    const m=await metrics();assert.deepEqual(m.overflow,[],name+' overflow');assert.equal(m.phoneWidth,375);assert.equal(m.phoneHeight,667);
    layouts.push({id,theme,large:true,compact:true,...m});
  }
  checks.push('Eight states in light/dark; populated/empty/consent at 375×667 with 130% text; readable end-of-scroll captures');
  await go('next-chat-cards');assert.equal(await phone().locator('.ac-number').innerText(),'7');
  const fixture=await page.evaluate(()=>NEXT.answerCardFixture);assert.equal(fixture.length,12);assert.equal(fixture.filter(r=>r.type==='walk').length,7);
  await click('View 7 walk logs');assert.equal(await phone().getByRole('dialog').locator('.ac-source-record').count(),7);
  assert.match(await phone().getByRole('dialog').innerText(),/Evening loop · 24 minutes/);
  await page.keyboard.press('Tab');assert.equal(await phone().getByRole('button',{name:'Back to answer',exact:true}).evaluate(el=>el===document.activeElement),true);
  await page.keyboard.press('Escape');assert.equal(await phone().getByRole('dialog').count(),0);
  assert.equal(await phone().getByRole('button',{name:'View 7 walk logs',exact:true}).evaluate(el=>el===document.activeElement),true);
  checks.push('Exact fixture counts; seven original walk source notes; sheet focus trap, Escape and focus return');
  await click('Review automatic profile and seven-day context');assert.equal(await phone().getByRole('dialog').locator('.ac-source-record').count(),12);
  await click('Review Bruno’s profile');assert.equal(await phone().getByRole('dialog',{name:'Bruno’s profile',exact:true}).count(),1);
  assert.match(await phone().getByRole('dialog',{name:'Bruno’s profile',exact:true}).innerText(),/Cocker Spaniel/);
  await click('Back to chat');await click('Back to chat');
  checks.push('Automatic-context review includes all twelve example rows plus the named dog profile; no per-record picker');
  await go('next-ai-cards-consent');assert.equal(await phone().getByRole('button',{name:'Enable BarkLog AI',exact:true}).isDisabled(),true);
  await phone().getByRole('checkbox').check();await click('Enable BarkLog AI');await wait('next-chat-cards');
  await go('next-ai-cards-consent');await click('Keep using my journal');await wait('next-home');
  checks.push('Unchecked consent disables AI; affirmative scope consent opens chat; declining returns to the journal');
  await go('next-chat-cards-loading');await click('Stop response');assert.match(await phone().innerText(),/Reply stopped/);
  await click('Try again');await page.waitForTimeout(1400);assert.equal(await phone().locator('.ac-number').innerText(),'7');
  await go('next-chat-cards-error');assert.match(await phone().innerText(),/The reply didn’t arrive/);
  await click('Try again');await page.waitForTimeout(1400);assert.equal(await phone().locator('.ac-number').innerText(),'7');
  checks.push('Loading can stop without losing the question; stopped/error states retry to a source-backed authored reply');
  await go('next-chat-cards-empty');assert.equal(await phone().locator('.ac-number').innerText(),'0');assert.match(await phone().innerText(),/profile is still included/);
  await go('next-chat-cards-no-match');assert.equal(await phone().locator('.ac-number').innerText(),'0');assert.match(await phone().innerText(),/Other care records were included/);
  assert.equal(await phone().locator('.ac-products').count(),0);await go('next-chat-cards-products');assert.equal(await phone().locator('.ac-products').count(),1);
  assert.equal(await phone().locator('.ac-products a,.ac-products button').count(),0);
  checks.push('No logs and no matching logs remain distinct; future placement has no links/actions and is absent in normal answers');
  await go('next-chat-cards','light',false,false,true);await scroll(true);const still=await phone().screenshot();await page.waitForTimeout(450);assert.ok(still.equals(await phone().screenshot()),'Reduced-motion rest pixels changed');await capture('reduced-motion');
  checks.push('Reduced-motion screen is stable at rest');
  // Capture the actual source-sheet movement by elapsed wall-clock time.
  await go('next-chat-cards');await phone().getByRole('button',{name:'View 7 walk logs',exact:true}).click();const began=await page.evaluate(()=>performance.now());
  for(const target of [105,210,315]){const elapsed=await page.evaluate(()=>performance.now())-began;if(elapsed<target)await page.waitForTimeout(target-elapsed);motion.push({targetMs:target,observedMs:await page.evaluate(()=>performance.now())-began});await capture('sheet-motion-'+target);}
  await page.waitForTimeout(450);await capture('sheet-settled');
  assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
  checks.push('Real-time source-sheet frames; no browser errors or external requests');
}finally{
  await writeFile(out+'/results.json',JSON.stringify({checks,errors,external,layouts,motion,nativeImplemented:false},null,2));await browser.close();
}
console.log(JSON.stringify({checks,errors,external,layouts:layouts.length,motion},null,2));
