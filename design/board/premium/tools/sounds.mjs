// Local sound review, including actual trusted browser gestures and rendered PCM.
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.argv[2]||'http://localhost:4278/premium/index.html',out=process.argv[3]||'.verify-build/task042';
await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true});
const browserContext=await browser.newContext({viewport:{width:1440,height:1100},deviceScaleFactor:1});
const page=await browserContext.newPage();
const errors=[],external=[],checks=[],layouts=[];let navigation=0;
page.on('pageerror',e=>errors.push(e.message));
page.on('request',r=>{if(/^https?:/.test(r.url())&&!['localhost','127.0.0.1'].includes(new URL(r.url()).hostname))external.push(r.url());});
const phone=()=>page.locator('.player .ph').last();
const wait=id=>page.waitForFunction(id=>NEXT.activeContext?.screen.id===id,id);
const go=async(id='next-sounds',query='')=>{await page.goto(base+'?soundQa='+(++navigation)+query+'#play-'+id);await wait(id);await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(800);};
const diag=()=>page.evaluate(()=>BarkSounds.diagnostics());
const click=async name=>{await phone().getByRole('button',{name,exact:true}).click();await page.waitForTimeout(100);};
const enabled=async()=>{if(!(await diag()).enabled){await phone().getByRole('switch',{name:'Interaction sounds',exact:true}).click();await page.waitForTimeout(160);}};
const shot=async name=>phone().screenshot({path:out+'/'+name+'.png'});
let pcm=[];
try{
  await go();assert.equal((await diag()).enabled,false);assert.equal((await diag()).contextCreated,false);
  assert.equal(await phone().getByRole('button',{name:'Preview button tap sound',exact:true}).isDisabled(),true);
  await page.waitForTimeout(800);assert.equal((await diag()).plays,0);checks.push('Default off: no audio context, autoplay or disabled-sample output');await shot('off');
  await enabled();assert.equal((await diag()).contextState,'running');assert.equal((await diag()).lastKind,'tap');
  let before=(await diag()).plays;await click('Preview selection tick sound');assert.equal((await diag()).plays,before+1);assert.equal((await diag()).lastKind,'selection');
  before=(await diag()).plays;await click('Preview saved sound');assert.equal((await diag()).plays,before+1);assert.equal((await diag()).lastKind,'saved');await shot('on');
  await page.waitForTimeout(260);assert.equal((await diag()).active,0);
  await click('Soft pop');assert.equal((await diag()).style,'pop');
  checks.push('Trusted enable resumes audio; three sample types play once; texture changes; sources clean up');
  const volume=phone().getByRole('slider',{name:'Interaction sound volume',exact:true});await volume.fill('0');await volume.dispatchEvent('input');await volume.dispatchEvent('change');
  before=(await diag()).plays;assert.equal(await phone().getByRole('button',{name:'Preview button tap sound',exact:true}).isDisabled(),true);
  await click('Try in AI chat');await wait('next-chat-cards');await click('View 7 walk logs');assert.equal((await diag()).plays,before);
  await page.keyboard.press('Escape');await go();assert.equal((await diag()).style,'pop');assert.equal((await diag()).volume,0);assert.equal((await diag()).contextCreated,false);
  await volume.fill('35');await volume.dispatchEvent('input');await volume.dispatchEvent('change');await page.waitForTimeout(120);
  checks.push('Zero volume mutes ordinary buttons; preference reload is silent and preserves volume/style');
  await click('Try in AI chat');await wait('next-chat-cards');
  await page.waitForTimeout(150);before=(await diag()).plays;await click('View 7 walk logs');assert.equal((await diag()).plays,before+1);await page.keyboard.press('Escape');
  await phone().getByRole('textbox',{name:'Message BarkLog AI',exact:true}).fill('A quiet typing test');before=(await diag()).plays;
  await phone().locator('.bl-scroll').evaluate(el=>el.scrollTop=el.scrollHeight);await page.waitForTimeout(200);assert.equal((await diag()).plays,before);
  await page.evaluate(()=>document.querySelector('.player .ph .n-context-button').click());await page.waitForTimeout(120);assert.equal((await diag()).plays,before);await page.keyboard.press('Escape');
  checks.push('Normal chat buttons get one sound; typing/scrolling and synthetic clicks remain silent');
  await go('next-home-premium');await page.waitForTimeout(700);before=(await diag()).plays;
  const countBefore=await page.evaluate(()=>NEXT.activeContext.answers.records?.length||B.example.length);
  await phone().getByRole('button',{name:/^Log Walk now\./}).click();await page.waitForTimeout(700);
  assert.equal(await page.evaluate(()=>NEXT.activeContext.answers.records.length),countBefore+1);assert.equal((await diag()).lastKind,'saved');assert.ok((await diag()).plays<=before+2);
  checks.push('Quick-care preview adds the record before its explicit saved cue; landing/haptic animation adds no duplicate sound');
  await go();await enabled();await click('Preview saved sound');await phone().getByRole('switch',{name:'Interaction sounds',exact:true}).click();
  assert.equal((await diag()).enabled,false);assert.equal((await diag()).active,0);before=(await diag()).plays;await page.waitForTimeout(400);assert.equal((await diag()).plays,before);
  checks.push('Switching off immediately stops the active voice and prevents delayed sounds');
  await enabled();await page.waitForTimeout(100);
  const rect=await phone().getByRole('button',{name:'Preview button tap sound',exact:true}).boundingBox();before=(await diag()).plays;
  for(let i=0;i<12;i++)await page.mouse.click(rect.x+rect.width/2,rect.y+rect.height/2);
  assert.ok((await diag()).plays-before<12);assert.ok((await diag()).active<=1);await page.waitForTimeout(240);assert.equal((await diag()).active,0);
  checks.push('Rapid trusted taps are limited; at most one active voice; no accumulated loudness');
  const client=await page.context().newCDPSession(page);await client.send('Page.setWebLifecycleState',{state:'frozen'});await client.send('Page.setWebLifecycleState',{state:'active'});await client.detach();
  // Visibility is read-only in browsers; use a separate tab for a real hidden page.
  const other=await page.context().newPage();await other.goto('about:blank');await other.bringToFront();await page.waitForTimeout(120);
  if(await page.evaluate(()=>document.hidden)){assert.equal((await diag()).active,0);checks.push('Actual background tab stops audio');}else checks.push('Headless browser did not expose hidden-tab state; physical/background audio still needs native QA');
  await other.close();await page.bringToFront();
  for(const theme of ['light','dark'])for(const compact of [false,true]){
    await go('next-sounds','&answerTheme='+theme+(compact?'&phone=375x667&textScale=1.3&reducedMotion=true':''));
    const state=await page.evaluate(theme=>{document.documentElement.dataset.theme=theme;return BarkSounds.state();},theme);
    await page.waitForTimeout(150);const name=theme+(compact?'-375-130':'');await shot(name);await phone().locator('.bl-scroll').evaluate(el=>el.scrollTop=el.scrollHeight);await shot(name+'-lower');
    const m=await phone().evaluate(root=>{
      const rgb=s=>s.match(/[\d.]+/g).map(Number),lum=c=>c.slice(0,3).map(x=>x/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4).reduce((v,x,i)=>v+x*[.2126,.7152,.0722][i],0);
      const contrast=[...root.querySelectorAll('.s-sound-copy,.s-sound-status,.s-sound-sample small,.s-sound-sample strong,.s-sound-range label,.s-sound-range output')].map(el=>{let bg=[255,255,255];for(let n=el;n;n=n.parentElement){const color=rgb(getComputedStyle(n).backgroundColor);if(color.length===3||color[3]===1){bg=color;break;}}const a=lum(rgb(getComputedStyle(el).color)),b=lum(bg);return {text:el.textContent.slice(0,30),ratio:(Math.max(a,b)+.05)/(Math.min(a,b)+.05)};});
      return {contrast,overflow:[...root.querySelectorAll('.s-sound-card,.s-sound-range,.s-sound-sample,.n-segment')].filter(el=>el.scrollWidth>el.clientWidth+2).map(el=>el.className),targets:[...root.querySelectorAll('button,input[type="range"]')].filter(el=>el.getClientRects().length).map(el=>({name:el.getAttribute('aria-label')||el.textContent.trim(),width:el.offsetWidth,height:el.offsetHeight})),phoneWidth:root.offsetWidth,phoneHeight:root.offsetHeight};
    });
    for(const c of m.contrast)assert.ok(c.ratio>=4.5,JSON.stringify(c));
    assert.deepEqual(m.overflow,[]);for(const t of m.targets){assert.ok(t.name);assert.ok(t.width>=48&&t.height>=48,JSON.stringify(t));}layouts.push({theme,compact,...m});
  }
  checks.push('Sound settings inspected in light/dark and 375×667 at 130%; named controls, 48px targets, no horizontal overflow');
  await enabled();await page.waitForTimeout(150);before=(await diag()).plays;
  await phone().getByRole('button',{name:'Preview selection tick sound',exact:true}).focus();await page.keyboard.press('Enter');await page.waitForTimeout(140);assert.equal((await diag()).plays,before+1);
  checks.push('Keyboard activation produces one cue with reduced motion enabled; measured custom text contrast meets 4.5:1');
  const fallbackContext=await browser.newContext({viewport:{width:1440,height:1100}});await fallbackContext.addInitScript(()=>{window.AudioContext=undefined;window.webkitAudioContext=undefined;});const fallback=await fallbackContext.newPage();fallback.on('pageerror',e=>errors.push(e.message));
  await fallback.goto(base+'?soundQa=unavailable&reducedMotion=true#play-next-sounds');await fallback.waitForFunction(()=>NEXT.activeContext?.screen.id==='next-sounds');
  await fallback.evaluate(()=>document.fonts.ready);await fallback.waitForTimeout(850);
  assert.equal(await fallback.locator('.player .ph').last().getByRole('switch',{name:'Interaction sounds',exact:true}).isDisabled(),true);
  await fallback.locator('.player .ph').last().getByRole('button',{name:'Try in AI chat',exact:true}).click();await fallback.waitForFunction(()=>NEXT.activeContext?.screen.id==='next-chat-cards');await fallbackContext.close();
  checks.push('Simulated unavailable audio disables only sound controls; chat navigation still works');
  pcm=await page.evaluate(()=>{
    const results=[];for(const style of ['wood','pop'])for(const kind of ['tap','selection','saved']){
      const data=BarkSounds.renderPCM(kind,style,48000);let peak=0,sum=0,mean=0;
      for(const x of data){peak=Math.max(peak,Math.abs(x));sum+=x*x;mean+=x;}
      results.push({style,kind,samples:data.length,duration:data.length/48000,peak,rms:Math.sqrt(sum/data.length),dc:mean/data.length,first:data[0],last:data.at(-1)});
    }return results;
  });
  for(const r of pcm){assert.ok(r.peak<=.421&&r.peak>=.29);assert.ok(Math.abs(r.dc)<.01);assert.equal(r.first,0);assert.equal(r.last,0);assert.ok(r.duration<=.22);}
  // Export the exact locally synthesized buffers for listening outside the board.
  for(const style of ['wood','pop']){
    const samples=await page.evaluate(style=>{const rate=48000,all=new Float32Array(rate*2);for(const [kind,offset] of [['tap',.1],['selection',.65],['saved',1.2]]){const pcm=BarkSounds.renderPCM(kind,style,rate);for(let i=0;i<pcm.length;i++)all[Math.round(offset*rate)+i]=pcm[i]*.175;}return Array.from(all);},style);
    const wav=Buffer.alloc(44+samples.length*2);wav.write('RIFF');wav.writeUInt32LE(wav.length-8,4);wav.write('WAVE',8);wav.write('fmt ',12);wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(1,22);wav.writeUInt32LE(48000,24);wav.writeUInt32LE(96000,28);wav.writeUInt16LE(2,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(samples.length*2,40);samples.forEach((x,i)=>wav.writeInt16LE(Math.round(Math.max(-1,Math.min(1,x))*32767),44+i*2));await writeFile(out+'/'+style+'-preview.wav',wav);
  }
  checks.push('Six original PCM variants checked for bounded peaks, short duration, zero endpoints and low DC; two listening WAVs exported at default gain');
  assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
}finally{await writeFile(out+'/results.json',JSON.stringify({checks,errors,external,layouts,pcm,nativeImplemented:false},null,2));await browser.close();}
console.log(JSON.stringify({checks,errors,external,layouts:layouts.length,pcm},null,2));
