// Browser-prototype checks only; never controls an installed journal or the owner's browser.
import assert from 'node:assert/strict';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const url=process.argv[2]||'http://localhost:4278/refinements/mascot-studio/index.html';
const out=process.argv[3]||'.verify-build/task030/qa';await mkdir(out,{recursive:true});
const browser=await chromium.launch(process.env.CHROMIUM_EXECUTABLE?{executablePath:process.env.CHROMIUM_EXECUTABLE}:{}),page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'no-preference'});
const errors=[],requests=[],checks=[],frames=[];
page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)requests.push([r.status(),r.url()]);});
async function ready(){await page.goto(url);await page.waitForFunction(()=>mascotReview.state.ready&&mascotReview.player?.isLoaded);await page.evaluate(()=>document.fonts.ready);await page.locator('#automatic').uncheck();}
async function rest(){await page.waitForFunction(()=>!mascotReview.state.playing);}
async function capture(name,locator=page.locator('.stage-panel')){await locator.screenshot({path:out+'/'+name+'.png'});frames.push(name+'.png');}
async function noOverflow(){assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);}
try{
  await ready();await noOverflow();assert.deepEqual(requests,[]);
  await capture('light-rest',page.locator('main'));
  for(const action of ['hello','curious','celebrate','ears','sniff','stretch','glance','idle']){
    await page.evaluate(action=>{mascotReview.play(action);window.__started=performance.now();},action);
    for(const ms of [250,550,850]){
      const elapsed=await page.evaluate(()=>performance.now()-window.__started);if(elapsed<ms)await page.waitForTimeout(ms-elapsed);
      await capture(action+'-'+ms);
    }
    await rest();
    const end=await page.evaluate(()=>({frame:mascotReview.player.currentFrame,frames:mascotReview.player.totalFrames,playing:mascotReview.state.playing}));
    assert.ok(end.frame>=end.frames-2);assert.equal(end.playing,false);
  }
  checks.push('Nine Glaxnimate-exported clips load; all eight moving clips complete; 24 real-time mid-motion frames captured');

  // Compare the actual rendered path bounds across an interrupt at frame 0.
  // This tests the pose bridge against lottie-web's renderer, not its own sampler.
  await page.evaluate(()=>mascotReview.play('hello'));await page.waitForTimeout(800);
  const interrupt=await page.evaluate(async()=>{
    const bounds=()=>[...document.querySelectorAll('#animation svg g path')].map(p=>{const b=p.getBoundingClientRect();return[b.x,b.y,b.width,b.height];});
    mascotReview.player.pause();const before=bounds();mascotReview.play('celebrate');
    await new Promise(resolve=>mascotReview.player.addEventListener('DOMLoaded',()=>{mascotReview.player.goToAndStop(0,true);resolve();}));
    const after=bounds();return{before,after};
  });
  assert.equal(interrupt.before.length,interrupt.after.length);
  let delta=0;interrupt.before.forEach((b,i)=>b.forEach((v,j)=>delta=Math.max(delta,Math.abs(v-interrupt.after[i][j]))));
  assert.ok(delta<.2,'Rendered pose jumped '+delta+'px');await capture('interruption-start');
  await page.evaluate(()=>mascotReview.player.play());await rest();
  checks.push('Interrupting a wave preserves actual rendered path bounds; maximum change '+delta.toFixed(4)+'px at the handoff');

  await page.locator('#dog').focus();await page.keyboard.press('Enter');await page.waitForTimeout(400);
  assert.equal(await page.evaluate(()=>mascotReview.state.current),'hello');
  await page.locator('#pause').click();const frozen=await page.evaluate(()=>mascotReview.player.currentFrame);await page.waitForTimeout(350);
  assert.equal(await page.evaluate(()=>mascotReview.player.currentFrame),frozen);
  await page.locator('#pause').click();await rest();
  checks.push('Keyboard greeting works; Pause freezes the live frame and Resume completes the action');

  await page.evaluate(()=>mascotReview.play('hello'));await page.waitForTimeout(350);
  await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>mascotReview.state.current==='still'&&mascotReview.player.isLoaded);
  assert.equal(await page.evaluate(()=>mascotReview.state.playing),false);
  await page.locator('#dog').click();assert.equal(await page.evaluate(()=>mascotReview.state.current),'still');
  await capture('reduced-motion');
  await page.locator('#preview-motion').check();await page.waitForTimeout(300);assert.equal(await page.evaluate(()=>mascotReview.state.current),'hello');
  await page.locator('#preview-motion').uncheck();await page.waitForFunction(()=>mascotReview.state.current==='still');
  await page.emulateMedia({reducedMotion:'no-preference'});
  checks.push('System Reduce Motion cancels movement; only the explicit preview opt-in permits motion, and turning it off restores stillness');

  const bag=await page.evaluate(()=>Array.from({length:60},()=>mascotReview.nextIdle()));
  for(let i=0;i<bag.length;i+=6)assert.equal(new Set(bag.slice(i,i+6)).size,6);
  assert.ok(bag.every((x,i)=>i===0||x!==bag[i-1]));
  await page.locator('#automatic').check();await page.waitForFunction(()=>mascotReview.state.playing,{},{timeout:9000});
  assert.ok(['idle','curious','glance','ears','sniff','stretch'].includes(await page.evaluate(()=>mascotReview.state.current)));
  await page.locator('#automatic').uncheck();await rest();
  checks.push('Shuffled idle bags avoid repeats; an automatic action starts after its quiet gap');

  await page.locator('#theme').click();await capture('dark-rest',page.locator('main'));
  await page.locator('#home').click();await capture('dark-home');await page.locator('[data-action=hello]').click();await page.waitForTimeout(550);await capture('dark-home-wave');await rest();
  await page.locator('#theme').click();await capture('light-home');
  for(const width of [375,390]){
    await page.setViewportSize({width,height:844});await page.locator('#large').click();await noOverflow();await capture('phone-'+width,page.locator('body'));
    await page.locator('#home').click();await noOverflow();await capture('phone-home-'+width);
  }
  await page.evaluate(()=>{const elements=[...document.querySelectorAll('h1,h2,p,b,small,.review-tag,.brand,.text-button,.view-picker button,.action-number,.home-copy span,.home-copy strong,.home-care span,.home-care b,summary')];const values=elements.map(e=>parseFloat(getComputedStyle(e).fontSize));elements.forEach((e,i)=>e.style.fontSize=values[i]*1.3+'px');});
  await noOverflow();await capture('phone-large-text',page.locator('body'));
  const targets=await page.locator('button,input,summary').evaluateAll(elements=>elements.filter(e=>e.getClientRects().length&&!e.disabled).map(e=>({id:e.id||e.textContent.trim(),w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height})));
  assert.deepEqual(targets.filter(t=>t.w<43.9||t.h<43.9),[]);
  checks.push('Light/dark, close-up/Home-card, 375/390px and 130% text inspected for overflow; active targets meet 44px');

  assert.deepEqual(errors,[]);assert.deepEqual(requests,[]);
  await writeFile(out+'/results.json',JSON.stringify({checks,frames,errors,requests},null,2));
  // One sheet of actual captured frames for visual review.
  const sheet=await browser.newPage({viewport:{width:1200,height:1730}});
  const chosen=['hello-250','hello-550','hello-850','curious-250','curious-550','curious-850','celebrate-250','celebrate-550','celebrate-850','dark-home-wave','light-home','interruption-start'];
  const cards=await Promise.all(chosen.map(async name=>'<figure><img src="data:image/png;base64,'+(await readFile(out+'/'+name+'.png')).toString('base64')+'"><figcaption>'+name+'</figcaption></figure>'));
  await sheet.setContent('<body style="margin:0;background:#e4e2d8;font:14px system-ui;display:grid;grid-template-columns:repeat(3,1fr);gap:12px;padding:12px">'+cards.join('')+'<style>figure{margin:0}img{width:100%;display:block}figcaption{padding:6px}</style>');
  await sheet.screenshot({path:out+'/contact-sheet.png',fullPage:true});
  console.log(JSON.stringify({checks,frames:frames.length,errors,requests},null,2));
}catch(error){await page.screenshot({path:out+'/failure.png',fullPage:true});await writeFile(out+'/failure.json',JSON.stringify({error:error.stack,checks,errors,requests},null,2));throw error;}finally{await browser.close();}
