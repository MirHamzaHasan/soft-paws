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
await navigate(base);
const integrityResult=await send('Runtime.evaluate',{expression:`(async()=>{const ids=F.SCREENS.map(s=>s.id),sections=new Set(F.SCREENS.map(s=>s.section));const scripts=[...document.scripts].filter(s=>s.src);const source=await Promise.all(scripts.map(async s=>(await fetch(s.src)).text()));const targets=source.flatMap(s=>[...s.matchAll(/S\\.go\\(c,\\s*['"]([\\w-]+)['"]\\s*[,)]/g)].map(m=>m[1]));const urls=[...scripts.map(s=>s.src),...[...document.querySelectorAll('link[rel=stylesheet]')].map(l=>l.href),...Object.values(BOARD.research).flatMap(group=>group.filter(r=>r.src).map(r=>r.src))];const brokenAssets=(await Promise.all(urls.map(async url=>{try{const r=await fetch(url);return !r.ok||(await r.arrayBuffer()).byteLength===0?url:null;}catch{return url;}}))).filter(Boolean);return JSON.stringify({duplicateIds:ids.filter((id,i)=>ids.indexOf(id)!==i),sectionsWithoutScreens:BOARD.sections.map(s=>s.id).filter(id=>!sections.has(id)),brokenSequences:F.SCREENS.filter(s=>s.seq).flatMap(s=>s.seq.filter(id=>!ids.includes(id)).map(id=>s.id+' → '+id)),brokenTargets:[...new Set(targets)].filter(id=>!ids.includes(id)),brokenAssets});})()`,awaitPromise:true,returnByValue:true});
const integrity=JSON.parse(integrityResult.result.result.value);
if(Object.values(integrity).some(list=>list.length))issues.push({integrity});
const list=await send('Runtime.evaluate',{expression:`JSON.stringify(F.SCREENS.filter(s=>!s.seq).map(s=>s.id))`,returnByValue:true});
let ids=JSON.parse(list.result.result.value);
if(process.env.QA_SCREEN)ids=ids.filter(id=>id===process.env.QA_SCREEN);
if(process.env.QA_SCREENS){const selected=new Set(process.env.QA_SCREENS.split(','));ids=ids.filter(id=>selected.has(id));}
const modes=process.env.QA_REST==='1'?[['light',''],['dark','']]:process.env.QA_FAST==='1'?[['light','']]:process.env.QA_ALT==='1'?[['dark',''],['light','&textScale=1.3']]:[['light',''],['dark',''],['light','&textScale=1.3']];
for(const [theme,query] of modes){
  await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-color-scheme',value:theme}]});
  for(const id of ids){
    await navigate(`${base}?qa=${encodeURIComponent(id)}-${theme}${query}${process.env.W?'&phone='+process.env.W+'x'+(process.env.H||844):''}${capture?'&reducedMotion=true':''}#only-${id}`);
    const result=await send('Runtime.evaluate',{expression:`JSON.stringify((()=>{
      const root=document.querySelector('.ph');if(!root)return {missing:true};
      const visible=el=>el.getClientRects().length&&!el.closest('[hidden]');
      const controls=[...root.querySelectorAll('button,input,textarea,select,a')].filter(visible);
      const small=controls.filter(el=>(el.offsetWidth<48||el.offsetHeight<48)&&!(el.matches('input[type=checkbox]')&&el.closest('.sp-checkrow')?.offsetHeight>=48)).map(el=>(el.getAttribute('aria-label')||el.textContent||el.id).trim().slice(0,50));
      const horizontal=[...root.querySelectorAll('.sp-card,.sp-head,.sp-field,.sp-list,.sp-quick,.sp-summary')].filter(visible).filter(el=>el.scrollWidth>el.clientWidth+1).map(el=>el.className);
      const dog=root.querySelector('.v4-home-scene'),art=dog?.getBoundingClientRect();
      const artOverlapsText=art?[...root.querySelectorAll('.v3-day-copy,.v3-day-status,.v3-day .dl-track')].filter(el=>{const r=el.getBoundingClientRect();return art.left<r.right-1&&art.right>r.left+1&&art.top<r.bottom-1&&art.bottom>r.top+1;}).map(el=>el.className):[];
      return {screen:root.dataset.screen,font:document.fonts.status,errors:document.querySelectorAll('.ph-error').length,small,horizontal,artOverlapsText};
    })())`,returnByValue:true});
    const data=JSON.parse(result.result.result.value);
    if(data.missing||data.errors||data.small.length||data.horizontal.length||data.artOverlapsText.length||runtime.length)issues.push({id,theme,textScale:query?'130%':'100%',...data,runtime:[...runtime]});
    if(capture){const shot=await send('Page.captureScreenshot',{format:'png'});writeFileSync(new URL(`${theme}${query?'-large':''}-${id}.png`,shotRoot),Buffer.from(shot.result.data,'base64'));}
  }
}
writeFileSync(new URL('../../../.verify-build/soft-paws/qa-results.json',import.meta.url),JSON.stringify({screens:ids.length,passes:ids.length*modes.length,integrity,issues},null,2));
console.log(JSON.stringify({screens:ids.length,passes:ids.length*modes.length,integrity,issues},null,2));
proc?.kill();
process.exit(issues.length?1:0);
