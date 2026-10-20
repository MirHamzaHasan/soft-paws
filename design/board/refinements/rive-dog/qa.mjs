// Local exported-player QA. Does not attach to the owner's browser or journals.
import assert from 'node:assert/strict';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const url=process.argv[2]||'http://localhost:4278/refinements/rive-dog/index.html';
const out=process.argv[3]||'.verify-build/task031/qa';await mkdir(out,{recursive:true});
const browser=await chromium.launch(process.env.CHROMIUM_EXECUTABLE?{executablePath:process.env.CHROMIUM_EXECUTABLE}:{});
const page=await browser.newPage({viewport:{width:1440,height:1100},reducedMotion:'no-preference'});
const errors=[],resources=[],externalRequests=[],frames=[],checks=[],bounds=[],timings=[];
page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
page.on('response',r=>{if(r.status()>=400)resources.push([r.status(),r.url()]);});
page.on('request',r=>{if(/^https?:/.test(r.url()) && new URL(r.url()).hostname!=='localhost')externalRequests.push(r.url());});
const durations={hello:2400,curious:2800,saved:2200,sleepy:3400,sniff:2400,ears:2400};
function mascotArtboards(contents) { return contents.artboards.map(a=>a.name); }
const names={hello:'Hello',curious:'Curious',saved:'Saved',sleepy:'Sleepy',sniff:'Sniff',ears:'Ear perk'};
async function capture(name,locator=page.locator('.stage-panel')) {await locator.screenshot({path:out+'/'+name+'.png'});frames.push(name);}
async function rest(){await page.waitForFunction(()=>mascotStudy.state.current==='Idle',{},{timeout:6000});}
async function pixels() {return page.locator('canvas').evaluate(c=>{
  const {width:w,height:h}=c,d=c.getContext('2d').getImageData(0,0,w,h).data;
  let x0=w,y0=h,x1=-1,y1=-1,edge=0,hash=2166136261,painted=0;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    const i=(y*w+x)*4;hash=Math.imul(hash^d[i],16777619);hash=Math.imul(hash^d[i+3],16777619);
    if(d[i+3]>1){painted++;x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);if(x===0||y===0||x===w-1||y===h-1)edge++;}
  }
  return {w,h,x0,y0,x1,y1,edge,painted,hash:hash>>>0};
});}
async function noOverflow(){assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);}
async function pose(name){
  await page.waitForFunction(()=>{const c=document.querySelector('canvas');return c.getContext('2d').getImageData(c.width/2,c.height/2,1,1).data[3]>0;});
  const p=await pixels();assert.equal(p.edge,0,name+' clipped or has an opaque background');
  assert.ok(p.x1-p.x0>p.w*.35 && p.y1-p.y0>p.h*.6,name+' missing or incorrectly scaled');bounds.push({name,...p});
}
try {
  await page.goto(url);await page.waitForFunction(()=>mascotStudy.state.ready);await page.evaluate(()=>document.fonts.ready);
  await page.locator('#random').uncheck();
  // The paid workspace export must show the dog immediately, without a splash.
  await page.waitForTimeout(200);await pose('clean-first-frame');await capture('clean-first-frame');
  assert.deepEqual(mascotArtboards(await page.evaluate(()=>mascotStudy.player.contents)), ['BarkLog Dog · Character Study']);
  await pose('idle');await noOverflow();await capture('light-rest',page.locator('main'));
  for(const action of Object.keys(durations)) {
    const before=await pixels();await page.locator('[data-action="'+action+'"]').click();
    await page.waitForFunction(name=>mascotStudy.state.current===name,names[action]);
    await page.evaluate(()=>window.__qaStart=performance.now());
    for(const fraction of [.25,.5,.75]) {
      const target=durations[action]*fraction,elapsed=await page.evaluate(()=>performance.now()-__qaStart);
      if(elapsed<target)await page.waitForTimeout(target-elapsed);
      timings.push({action,fraction,elapsed:await page.evaluate(()=>performance.now()-__qaStart)});
      await pose(action+'-'+fraction);await capture(action+'-'+fraction,page.locator('#pet'));
      if(fraction===.5)assert.notEqual((await pixels()).hash,before.hash,action+' did not move');
    }
    await rest();await pose(action+'-end');
  }
  checks.push('All six trigger reactions play and return to Idle; 18 actual mid-motion frames captured without clipping');
  console.log('Motion clips and alpha edges checked');

  await page.locator('#pet').focus();await page.keyboard.press('Enter');await page.waitForFunction(()=>mascotStudy.state.current==='Hello');
  await page.waitForTimeout(650);await page.locator('#pause').click();
  const a=await pixels();await page.waitForTimeout(400);assert.equal((await pixels()).hash,a.hash,'Pause did not freeze the canvas');
  await capture('paused');await page.locator('#pause').click();await rest();checks.push('Keyboard greeting; Pause freezes actual canvas pixels and Resume completes the action');

  await page.locator('[data-action="hello"]').click();await page.waitForTimeout(700);
  const interrupt=await page.evaluate(async()=>{
    const c=document.querySelector('canvas'),ctx=c.getContext('2d'),before=ctx.getImageData(0,0,c.width,c.height).data;
    mascotStudy.act('saved');await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
    const after=ctx.getImageData(0,0,c.width,c.height).data;let total=0;
    for(let i=0;i<before.length;i++)total+=Math.abs(before[i]-after[i]);
    return {meanChannelDelta:total/before.length};
  });
  assert.ok(interrupt.meanChannelDelta<7,'Large pixel jump at interruption '+JSON.stringify(interrupt));
  await capture('interruption');await page.waitForFunction(()=>mascotStudy.state.current==='Saved');await rest();
  checks.push('Hello → Saved interruption blends from the live pose; mean channel change '+interrupt.meanChannelDelta.toFixed(3)+' across two animation frames');

  await page.locator('[data-action="curious"]').click();await page.waitForTimeout(300);await page.emulateMedia({reducedMotion:'reduce'});
  await page.waitForFunction(()=>!mascotStudy.state.motion);assert.equal(await page.locator('#pet').evaluate(e=>e.classList.contains('live')),false);
  assert.equal(await page.evaluate(()=>mascotStudy.idlePending),false);await capture('reduced-motion');
  await page.locator('#motion').check();await page.waitForTimeout(350);assert.equal(await page.evaluate(()=>mascotStudy.state.motion),true);
  await page.locator('#motion').uncheck();assert.equal(await page.locator('#pet').evaluate(e=>e.classList.contains('live')),false);
  await page.emulateMedia({reducedMotion:'no-preference'});await page.waitForTimeout(5000);await rest();
  checks.push('System reduced motion cancels movement to the neutral SVG; local opt-in plays and turning it off restores stillness');

  await page.locator('#random').check();const count=await page.evaluate(()=>mascotStudy.history.length);
  await page.waitForFunction(n=>mascotStudy.history.length>n,count,{timeout:9000});
  const automatic=await page.evaluate(()=>mascotStudy.history.at(-1));assert.equal(automatic.source,'random');
  await page.locator('#random').uncheck();await rest();checks.push('A random idle action starts after its quiet gap; scheduling stops when switched off');

  await page.locator('#theme').click();await capture('dark-rest',page.locator('main'));
  await page.locator('[data-view="home"]').click();await pose('dark-home');await capture('dark-home');
  await page.locator('[data-action="hello"]').click();await page.waitForTimeout(600);await capture('dark-home-wave');await rest();
  await page.locator('#theme').click();await capture('light-home');
  for(const width of [375,390]) {
    await page.setViewportSize({width,height:844});await noOverflow();await capture('phone-home-'+width,page.locator('body'));
    await page.locator('[data-view="close"]').click();await noOverflow();await capture('phone-close-'+width,page.locator('body'));
    await page.locator('[data-view="home"]').click();
  }
  await page.evaluate(()=>document.documentElement.style.fontSize='130%');await noOverflow();await capture('phone-large-text',page.locator('body'));
  const targets=await page.locator('button,input,summary').evaluateAll(es=>es.filter(e=>e.getClientRects().length&&!e.disabled).map(e=>({name:e.id||e.textContent.trim(),w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height})));
  assert.deepEqual(targets.filter(t=>t.w<43.9||t.h<43.9),[]);
  // A real scroll moves the mascot outside the viewport, then back in.
  await page.evaluate(()=>scrollTo(0,document.body.scrollHeight));await page.waitForFunction(()=>!mascotStudy.state.visible);
  assert.equal(await page.evaluate(()=>mascotStudy.idlePending),false);const offscreen=await pixels();await page.waitForTimeout(350);assert.equal((await pixels()).hash,offscreen.hash);
  await page.evaluate(()=>document.querySelector('#pet').scrollIntoView({block:'center'}));await page.waitForFunction(()=>mascotStudy.state.visible);
  checks.push('Light/dark, Home/close-up, 375/390px, 130% text, 44px targets and real offscreen pause/resume checked');
  await page.evaluate(()=>{localStorage.removeItem('barklog-rive-qa-cleanup');const original=mascotStudy.player.cleanup.bind(mascotStudy.player);mascotStudy.player.cleanup=()=>{localStorage.setItem('barklog-rive-qa-cleanup',String(Number(localStorage.getItem('barklog-rive-qa-cleanup'))+1));return original();};});
  await page.goto('about:blank');
  await page.goBack();await page.waitForFunction(()=>window.mascotStudy?.state.ready && !mascotStudy.state.disposed);
  assert.equal(await page.evaluate(()=>Number(localStorage.getItem('barklog-rive-qa-cleanup'))),1,'Player was not cleaned up on page exit');
  await page.evaluate(()=>localStorage.removeItem('barklog-rive-qa-cleanup'));
  checks.push('Real page navigation disposes the player once; browser Back restores a usable review');
  assert.deepEqual(errors,[]);assert.deepEqual(resources,[]);assert.deepEqual(externalRequests,[]);
  const result={checks,frames,bounds,timings,errors,resources,externalRequests,exportIncludesRiveSplash:false,nativeIntegration:false};
  await writeFile(out+'/results.json',JSON.stringify(result,null,2));
  const sheet=await browser.newPage({viewport:{width:1200,height:1500}});
  const selected=['hello-0.25','hello-0.5','hello-0.75','curious-0.25','curious-0.5','curious-0.75','saved-0.25','saved-0.5','saved-0.75','sleepy-0.5','sniff-0.5','ears-0.5'];
  const cards=await Promise.all(selected.map(async n=>'<figure><img src="data:image/png;base64,'+(await readFile(out+'/'+n+'.png')).toString('base64')+'"><figcaption>'+n+'</figcaption></figure>'));
  await sheet.setContent('<body style="margin:0;background:#eeeade;color:#17221b;font:14px system-ui;display:grid;grid-template-columns:repeat(3,1fr);gap:12px;padding:12px">'+cards.join('')+'<style>figure{margin:0;background:#fffefa;border-radius:12px}img{width:100%;display:block}figcaption{padding:10px}</style>');
  await sheet.screenshot({path:out+'/contact-sheet.png',fullPage:true});console.log(JSON.stringify({checks,frames:frames.length,errors,resources},null,2));
} catch(error) {
  await page.screenshot({path:out+'/failure.png',fullPage:true});await writeFile(out+'/failure.json',JSON.stringify({error:error.stack,checks,errors,resources},null,2));throw error;
} finally {await browser.close();}
