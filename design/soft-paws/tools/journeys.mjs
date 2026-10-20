// Board-only browser QA through Chromium's DevTools protocol. No runtime dependency.
import { spawn } from 'node:child_process';
import { existsSync, readdirSync, mkdirSync, writeFileSync, mkdtempSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { homedir, tmpdir } from 'node:os';

const base=process.argv[2]||'http://localhost:4285/';
const capture=process.env.QA_CAPTURE==='1',shotRoot=new URL('../../../.verify-build/soft-paws/qa/',import.meta.url);
if(capture)mkdirSync(shotRoot,{recursive:true});
const cache=join(homedir(),'Library/Caches/ms-playwright');
const candidates=['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome','/Applications/Chromium.app/Contents/MacOS/Chromium'];
if(existsSync(cache))for(const d of readdirSync(cache).filter(x=>x.startsWith('chromium-')))candidates.push(join(cache,d,'chrome-mac/Chromium.app/Contents/MacOS/Chromium'));
const chrome=process.env.CHROME||candidates.find(existsSync);
if(!chrome)throw new Error('No board-only Chromium found. Run: npx --yes playwright@1.55.0 install chromium');
let port=Number(process.env.CDP_PORT||0);const profile=mkdtempSync(join(tmpdir(),'barklog-board-qa-'));
const proc=process.env.CDP_PORT?null:spawn(chrome,['--headless=new','--disable-gpu','--hide-scrollbars',`--remote-debugging-port=${port}`,'--remote-debugging-address=127.0.0.1','--window-size=390,844','--user-data-dir='+profile,'about:blank'],{stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let ws;
for(let i=0;i<80&&!ws;i++){try{if(!process.env.CDP_PORT)port=Number(readFileSync(join(profile,'DevToolsActivePort'),'utf8').split('\n')[0]);const pages=await(await fetch(`http://127.0.0.1:${port}/json`)).json();const page=pages.find(x=>x.type==='page');if(page)ws=new WebSocket(page.webSocketDebuggerUrl);}catch{}if(!ws)await sleep(100);}
if(!ws)throw new Error('Chromium did not expose DevTools');
await new Promise(r=>ws.onopen=r);
let next=0;const pending=new Map(),issues=[];let runtime=[];
ws.onmessage=event=>{const msg=JSON.parse(event.data);if(msg.id&&pending.has(msg.id)){pending.get(msg.id)(msg);pending.delete(msg.id);}if(msg.method==='Runtime.exceptionThrown')runtime.push(msg.params.exceptionDetails.text+': '+msg.params.exceptionDetails.exception?.description);if(msg.method==='Runtime.consoleAPICalled'&&['error','warning'].includes(msg.params.type))runtime.push(msg.params.args.map(a=>a.value??a.description).join(' ').slice(0,300));};
const send=(method,params={})=>new Promise(resolve=>{const id=++next;pending.set(id,resolve);ws.send(JSON.stringify({id,method,params}));});
await send('Runtime.enable');await send('Page.enable');await send('Emulation.setDeviceMetricsOverride',{width:Number(process.env.W||390),height:Number(process.env.H||844),deviceScaleFactor:1,mobile:false});
const navigate=async url=>{runtime=[];await send('Page.navigate',{url});await sleep(capture?420:260);if(capture)await send('Runtime.evaluate',{expression:'document.fonts.ready',awaitPromise:true});};

const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.result.exceptionDetails)throw Error(r.result.exceptionDetails.exception?.description||'Evaluation failed');return r.result.result.value;};
const results=[];
const check=async(name,expression)=>{const ok=await evaluate(expression);results.push({name,passed:!!ok});if(!ok)throw Error(name);};
const click=async text=>{await evaluate(`(()=>{const buttons=[...document.querySelectorAll('.player .ph button')];const b=buttons.find(b=>b.textContent.trim()===${JSON.stringify(text)});if(!b)throw Error('Missing button '+${JSON.stringify(text)});b.click();})()`);await sleep(900);};
const field=async(label,value)=>evaluate(`(()=>{const l=[...document.querySelectorAll('.player .ph label')].find(x=>x.textContent===${JSON.stringify(label)});if(!l)throw Error('Missing field');const e=document.getElementById(l.htmlFor);e.value=${JSON.stringify(value)};e.dispatchEvent(new Event('input',{bubbles:true}));})()`);
try{
 await navigate(base+'?reducedMotion=true&case='+Date.now()+'#play-cat-name');await sleep(300);
 await field('Cat’s name','Nori');await click('Start with name only');await check('Name-only start preserves the entered cat name',`document.querySelector('.player .ph')?.dataset.screen==='home'&&document.querySelector('.player .sp-greeting h1').textContent.includes('Nori')`);
 await click('Meal');await field('Amount offered (g)','65');await evaluate(`document.querySelector('.player .sp-row[data-value="Mostly eaten"]').click()`);await field('Anything else?','Left a little, then watched the birds.');await click('Keep this check-in');await check('Example save produces a clear saved state',`document.querySelector('.player .ph')?.dataset.screen==='saved'`);await click('Back to today');await check('Committed preview record appears back on Home',`document.querySelector('.player .sp-event').textContent.includes('Left a little')`);
 await click('Journal');await click('Meals');await check('Journal filter keeps meal entries only',`[...document.querySelectorAll('.player .sp-event')].length===2`);
 await navigate(base+'?reducedMotion=true&case='+Date.now()+'#play-log-note');await sleep(250);await field('Title','Window watch');await field('Your note','A preview draft.');await click('Keep as draft');await check('Draft feedback is honest about in-memory preview',`document.querySelector('.sp-toast')?.textContent.includes('preview session')`);
 await navigate(base+'?reducedMotion=true&case='+Date.now()+'#play-ai-consent');await sleep(250);await check('Cloud context starts unchecked and cannot continue',`!document.querySelector('.player input[type=checkbox]').checked&&[...document.querySelectorAll('.player button')].find(x=>x.textContent==='See example chat').getAttribute('aria-disabled')==='true'`);await evaluate(`document.querySelector('.player input[type=checkbox]').click()`);await click('See example chat');await check('Explicit scope choice opens clearly labelled example chat',`document.querySelector('.player .ph').dataset.screen==='chat'&&document.querySelector('.player .sp-chatanswer').textContent.includes('No live AI request')`);
 await navigate(base+'?reducedMotion=true&case='+Date.now()+'#play-paywall');await sleep(250);await check('All recurring prices are visible before any selection',`['$2.99','$6.99','$39.99'].every(p=>document.querySelector('.player .ph').textContent.includes(p))`);await check('Unconfigured purchases remain disabled',`[...document.querySelectorAll('.player .sp-btn')].find(b=>b.textContent==='Purchases unavailable').disabled`);await click('Keep using the free journal');await check('Paywall has a working free-journal exit',`document.querySelector('.player .ph').dataset.screen==='home'`);
 await navigate(base+'?reducedMotion=true&case='+Date.now()+'#only-kit-cat');await sleep(300);await check('Reduced motion uses same-art still with no loaded runtime file',`document.querySelector('.sp-cat img').getAttribute('src')==='assets/cat/companion.svg'&&!document.querySelector('.sp-cat').classList.contains('live')&&!performance.getEntriesByType('resource').some(x=>x.name.endsWith('.riv'))`);
 await navigate(base+'?reducedMotion=false&case='+Date.now()+'#only-kit-cat');await sleep(1800);await check('Real Rive export and view model load',`document.querySelector('.sp-cat').motion.ready&&!!document.querySelector('.sp-cat').motion.player.viewModelInstance`);await evaluate(`document.querySelector('.sp-cat').motion.act('saved')`);await sleep(200);await check('Real save reaction runs on a transparent surface',`document.querySelector('.sp-cat').dataset.playing==='true'&&getComputedStyle(document.querySelector('.sp-cat')).backgroundColor==='rgba(0, 0, 0, 0)'`);await sleep(3000);await check('Reaction returns to a bounded rest',`document.querySelector('.sp-cat').dataset.playing==='false'`);await evaluate(`document.querySelector('.sp-scroll').scrollTop=9999`);await sleep(300);await check('Offscreen companion pauses',`document.querySelector('.sp-cat').dataset.playing==='false'`);
 const inventory=await evaluate(`F.SCREENS.filter(s=>!s.seq).map(s=>({id:s.id,section:s.section,name:s.name,product:!['foundations','motion'].includes(s.section)}))`);writeFileSync(new URL('../screen-inventory.json',import.meta.url),JSON.stringify(inventory,null,2)+'\n');
 console.log(JSON.stringify({checks:results.length,results,runtime},null,2));writeFileSync(new URL('../../../.verify-build/soft-paws/journeys.json',import.meta.url),JSON.stringify({checks:results.length,results,runtime},null,2));
}finally{proc?.kill();}
process.exit(results.some(x=>!x.passed)||runtime.length?1:0);
