// Synthetic visual/interaction QA for task047. No app account, store or AI requests.
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.argv[2]||'http://127.0.0.1:4278/premium/index.html',out=process.argv[3]||'.verify-build/task047-motion';
await mkdir(out,{recursive:true});
const browser=await chromium.launch(),page=await browser.newPage({viewport:{width:1100,height:1100}});
const errors=[],external=[],checks=[],contrast=[];
page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url())&&!['localhost','127.0.0.1'].includes(new URL(r.url()).hostname))external.push(r.url());});
const phone=()=>page.locator('.player .ph').last();let serial=0;
const go=async(id,extra='')=>{await page.goto(base+'?task047='+(++serial)+extra+'#play-'+id);await page.waitForFunction(id=>NEXT.activeContext?.screen.id===id,id);await page.evaluate(()=>document.fonts.ready);await phone().scrollIntoViewIfNeeded();await page.waitForTimeout(1900);};
await go('next-paywall');
for(const [name,price,period]of[['Weekly','$2.99','week'],['Monthly','$6.99','month'],['Yearly','$39.99','year']]){
  const button=phone().getByRole('button',{name:name+', '+price+' US dollars per '+period,exact:true});
  assert(await button.isVisible());assert(await button.getByText(price,{exact:true}).isVisible());
}
const freeButton=phone().locator('.p47-pay-actions').getByRole('button',{name:'Continue with free journal',exact:true});
const within=await freeButton.evaluate(el=>{const r=el.getBoundingClientRect(),p=el.closest('.ph').getBoundingClientRect();return r.top>=p.top&&r.bottom<=p.bottom;});assert(within);
assert(await phone().getByRole('button',{name:'Continue with monthly',exact:true}).isDisabled());checks.push('all three complete recurring USD prices visible; disabled store CTA and visible free path');
await page.waitForFunction(()=>document.querySelector('.player .p47-mascot')?.dataset.rive==='ready',null,{timeout:15000});
await page.evaluate(()=>document.querySelector('.player .p47-mascot').motion.act('hello'));
await page.waitForTimeout(650);await phone().screenshot({path:out+'/rive-greeting.png'});
assert.equal(await phone().locator('.p47-mascot').getAttribute('data-playing'),'true');assert((await phone().locator('.p47-mascot').evaluate(el=>el.motion.player.stateMachineNames)).includes('Care Companion'));checks.push('new original care-notebook Rive export and controller load; greeting plays');
assert((await phone().locator('.p47-mascot').evaluate(el=>el.motion.states)).includes('Hello'),'Rive must actually enter the Hello state');
await page.waitForTimeout(2700);assert.equal(await phone().locator('.p47-mascot').getAttribute('data-playing'),'false');checks.push('bounded Rive greeting returns to the same-art still');
await page.evaluate(()=>document.querySelector('.player .p47-mascot').motion.act('hello'));
await phone().locator('.bl-scroll').evaluate(el=>{const spacer=document.createElement('div');spacer.dataset.qaSpacer='true';spacer.style.height='600px';el.append(spacer);el.scrollTop=el.scrollHeight;});await page.waitForFunction(()=>document.querySelector('.player .p47-mascot').dataset.playing==='false');
await phone().locator('.bl-scroll').evaluate(el=>{el.querySelector('[data-qa-spacer]').remove();el.scrollTop=0;});await page.waitForTimeout(150);
await page.evaluate(()=>{document.querySelector('.player .p47-mascot').motion.act('hello');NEXT.activeContext.pause();});assert.equal(await phone().locator('.p47-mascot').getAttribute('data-playing'),'false');await page.evaluate(()=>NEXT.activeContext.resume());checks.push('offscreen and paused contexts stop Rive playback');
await page.evaluate(()=>{document.querySelector('.player .p47-mascot').motion.act('hello');Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});assert.equal(await phone().locator('.p47-mascot').getAttribute('data-playing'),'false');await page.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});checks.push('synthetic background visibility event stops Rive playback');
await page.evaluate(()=>{F.T.speed=.25;document.querySelector('.player .p47-price-choice:last-child').click();});
for(const fraction of[.25,.5,.75]){await phone().locator('.p47-price-pick').evaluate((el,fraction)=>{const a=el.getAnimations()[0];a.pause();a.currentTime=Number(a.effect.getTiming().duration)*fraction;},fraction);await page.waitForTimeout(30);await phone().screenshot({path:out+'/selection-'+fraction*100+'.png'});}
await phone().getByRole('button',{name:'Weekly, $2.99 US dollars per week',exact:true}).click();
await page.waitForTimeout(90);
const before=await phone().locator('.p47-price-pick').evaluate(el=>new DOMMatrix(getComputedStyle(el).transform).e);
await page.evaluate(()=>document.querySelectorAll('.player .p47-price-choice')[1].click());
const after=await phone().locator('.p47-price-pick').evaluate(el=>new DOMMatrix(getComputedStyle(el).transform).e);
assert(Math.abs(before-after)<12,'interrupted selection must start at its current position');
await page.waitForFunction(()=>!document.querySelector('.player .p47-price-pick').getAnimations().length,null,{timeout:10000});
const selection=await phone().locator('.p47-price-grid').evaluate(el=>{const marker=el.querySelector('.p47-price-pick'),selected=el.querySelector('[aria-pressed=true]');return{pressed:el.querySelectorAll('[aria-pressed=true]').length,delta:Math.abs(marker.getBoundingClientRect().left-selected.getBoundingClientRect().left),animations:marker.getAnimations().length};});
assert.equal(selection.pressed,1);assert(selection.delta<1);assert.equal(selection.animations,0);checks.push('selection glides, reverses from current pose, settles over exactly one checked plan');
assert((await phone().locator('.p47-mascot').evaluate(el=>el.motion.states)).includes('Curious'),'price selection must reach the authored Curious state');
await page.evaluate(()=>{F.T.speed=1;F.setReduced(true);document.querySelectorAll('.player .p47-price-choice')[2].click();});
const reduced=await phone().evaluate(el=>({animations:el.querySelector('.p47-price-pick').getAnimations().filter(a=>a.playState==='running').length,playing:el.querySelector('.p47-mascot').dataset.playing,price:el.querySelector('.p47-price-summary').textContent}));
assert.equal(reduced.animations,0);assert.equal(reduced.playing,'false');assert(reduced.price.includes('$39.99'));checks.push('Reduce Motion lands on final selected price and still dog immediately');
// Keyboard remains native button behavior; no pointer-only selection.
await phone().getByRole('button',{name:'Weekly, $2.99 US dollars per week',exact:true}).focus();await page.keyboard.press('Enter');assert.equal(await page.evaluate(()=>NEXT.state(NEXT.activeContext).billing),'weekly');checks.push('keyboard Enter selects a plan');
await page.evaluate(()=>{window.task047OldDog=document.querySelector('.player .p47-mascot');NEXT.go(NEXT.activeContext,'next-manage-plan');});await page.waitForFunction(()=>NEXT.activeContext.screen.id==='next-manage-plan');await page.waitForTimeout(700);assert.equal(await page.evaluate(()=>task047OldDog.motion.disposed),true);checks.push('leaving the screen disposes the Rive player and observers');
await go('next-paywall');await freeButton.click();await page.waitForFunction(()=>NEXT.activeContext.screen.id==='next-ready');checks.push('free journal route remains usable without a purchase');
await go('next-manage-plan');await phone().getByRole('button',{name:'Explore Premium',exact:true}).click();await page.waitForFunction(()=>NEXT.activeContext.screen.id==='next-paywall');assert(await phone().getByRole('complementary',{name:'Planned Premium feature · not available yet'}).count());await freeButton.click();await page.waitForFunction(()=>NEXT.activeContext.screen.id==='next-manage-plan');checks.push('account plan → paywall → free returns to the account plan; food scanner is explicitly Coming soon');
await go('next-plan');await phone().getByRole('button',{name:'Review Bruno’s full profile',exact:true}).click();assert(await phone().getByRole('dialog',{name:'Bruno’s profile details'}).count());await page.keyboard.press('Tab');assert(await page.evaluate(()=>!!document.activeElement.closest('[role=dialog]')));await page.keyboard.press('Escape');assert.equal(await phone().getByRole('dialog').count(),0);checks.push('full dog profile opens, traps focus and dismisses with Escape');
for(const theme of['light','dark']){
  await go('next-paywall','&reducedMotion=true');await page.evaluate(theme=>document.documentElement.dataset.theme=theme,theme);
  const values=await phone().evaluate(el=>{
    const rgb=c=>c.match(/[\d.]+/g).slice(0,3).map(Number),lum=c=>{const v=rgb(c).map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4;});return v[0]*.2126+v[1]*.7152+v[2]*.0722;};
    const background=node=>{for(let p=node;p;p=p.parentElement){const c=getComputedStyle(p).backgroundColor;if(c!=='rgba(0, 0, 0, 0)'&&c!=='transparent')return c;}return'rgb(255,255,255)';};
    return [...el.querySelectorAll('.p47-price-choice strong,.p47-price-choice small,.p47-caption,.p47-benefit strong,.p47-benefit p,.p47-purchase-note')].map(node=>{
      const css=getComputedStyle(node),bg=node.closest('.p47-price-choice[aria-pressed=true]')?getComputedStyle(el.querySelector('.p47-price-pick')).backgroundColor:background(node);const a=lum(css.color),b=lum(bg),ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);const large=parseFloat(css.fontSize)>=24||(parseFloat(css.fontSize)>=18.66&&+css.fontWeight>=700);return{text:node.textContent,foreground:css.color,background:bg,ratio:+ratio.toFixed(2),minimum:large?3:4.5,pass:ratio>=(large?3:4.5)};
    });
  });contrast.push(...values.map(v=>({theme,...v})));
}
assert(contrast.every(x=>x.pass),JSON.stringify(contrast.filter(x=>!x.pass)));checks.push('actual rendered plan prices, captions and benefit copy meet contrast in both themes');
for(const theme of['light','dark']){
  await go('next-manage-plan','&reducedMotion=false');
  await page.evaluate(theme=>{document.documentElement.dataset.theme=theme;F.T.speed=.25;F.board.openPlayer('next-plan');},theme);
  await page.waitForFunction(()=>NEXT.activeContext.screen.id==='next-plan');await page.waitForTimeout(650);
  await page.evaluate(()=>document.activeElement?.blur());
  for(const fraction of[.25,.5,.75,1]){
    await phone().evaluate((el,fraction)=>el.getAnimations({subtree:true}).forEach(a=>{a.pause();a.currentTime=1590*4*fraction;}),fraction);
    await page.waitForTimeout(30);await phone().screenshot({path:out+'/plan-'+theme+'-'+fraction*100+'.png'});
  }
}
checks.push('plan reveal captured at 25/50/75/100 percent in both themes');
const fallback=await browser.newPage({viewport:{width:1100,height:1100}});await fallback.route('**/care-notebook.riv',route=>route.abort());await fallback.goto(base+'?fallback=047#play-next-paywall');await fallback.waitForFunction(()=>document.querySelector('.player .p47-mascot')?.dataset.rive==='fallback');const dog=fallback.locator('.player .p47-mascot');assert(await dog.locator('img').isVisible());assert(await dog.isDisabled());await fallback.waitForTimeout(1900);await fallback.locator('.player .ph').screenshot({path:out+'/rive-fallback.png'});await fallback.close();checks.push('failed runtime export keeps the new transparent notebook vector visible');
assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
await writeFile(out+'/results.json',JSON.stringify({checks,contrast,errors,external},null,2));console.log(checks.length+' checks; '+contrast.length+' contrast pairs; no runtime errors or remote requests');await browser.close();
