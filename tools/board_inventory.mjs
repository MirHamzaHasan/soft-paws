// Read-only inventory of the live board. Chromium is a QA dependency, not app runtime.
import { spawn } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { homedir, tmpdir } from 'node:os';

const [base = 'http://127.0.0.1:4278/', output] = process.argv.slice(2);
const url = new URL(base);
if (!['127.0.0.1', 'localhost'].includes(url.hostname)) throw Error('Inventory is localhost-only.');
const cache = join(homedir(), 'Library/Caches/ms-playwright');
const candidates = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Chromium.app/Contents/MacOS/Chromium'];
if (existsSync(cache)) for (const directory of readdirSync(cache).filter(x => x.startsWith('chromium-'))) {
  candidates.push(join(cache, directory, 'chrome-mac/Chromium.app/Contents/MacOS/Chromium'));
}
const chrome = process.env.CHROME || candidates.find(existsSync);
if (!chrome) throw Error('No board-only Chromium found.');
const profile = mkdtempSync(join(tmpdir(), 'barklog-inventory-'));
const child = spawn(chrome, ['--headless=new', '--disable-gpu', '--remote-debugging-port=0', '--remote-debugging-address=127.0.0.1', '--user-data-dir=' + profile, 'about:blank'], {stdio:'ignore'});
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
let socket;
try {
  for (let attempt = 0; attempt < 100 && !socket; attempt++) {
    try {
      const port = readFileSync(join(profile, 'DevToolsActivePort'), 'utf8').split('\n')[0];
      const pages = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
      const page = pages.find(x => x.type === 'page');
      if (page) socket = new WebSocket(page.webSocketDebuggerUrl);
    } catch {}
    if (!socket) await sleep(100);
  }
  if (!socket) throw Error('Chromium did not expose a page.');
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
  let next = 0;
  const pending = new Map();
  socket.onmessage = event => {
    const message = JSON.parse(event.data);
    if (pending.has(message.id)) { pending.get(message.id)(message); pending.delete(message.id); }
  };
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++next;
    const timeout = setTimeout(() => { pending.delete(id); reject(Error('CDP timeout: ' + method)); }, 20000);
    pending.set(id, result => { clearTimeout(timeout); result.error ? reject(Error(JSON.stringify(result.error))) : resolve(result.result); });
    socket.send(JSON.stringify({id, method, params}));
  });
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Page.navigate', {url: base});
  let ready = false;
  for (let attempt = 0; attempt < 100 && !ready; attempt++) {
    ready = (await send('Runtime.evaluate', {expression:'!!(window.F?.SCREENS?.length && window.BARK_SCREEN_MANIFEST)', returnByValue:true})).result.value;
    if (!ready) await sleep(100);
  }
  if (!ready) throw Error('Board registry did not initialize.');
  const result = await send('Runtime.evaluate', {awaitPromise:true, returnByValue:true, expression:`(async()=>{
    await document.fonts.ready;
    const assets=await Promise.all([...document.scripts].filter(s=>s.src).map(async s=>({path:new URL(s.src).pathname.slice(1),source:await(await fetch(s.src)).text()})));
    const styles=await Promise.all([...document.querySelectorAll('link[rel=stylesheet]')].map(async s=>({path:new URL(s.href).pathname.slice(1),source:await(await fetch(s.href)).text()})));
    const store=await(await fetch('/api/store')).json();
    return {boardId:BOARD.id,boardName:BOARD.name,sections:BOARD.sections,reviewStore:store,
      screens:F.SCREENS.map((s,index)=>({id:s.id,name:s.name,section:s.section,order:index,sequence:Array.isArray(s.seq)?s.seq:null,flow:!!s.flow,enter:s.enter||null,group:s.group||null,intent:s.intent||'',manifest:BARK_SCREEN_MANIFEST[s.id],referencingScripts:assets.filter(a=>a.source.includes("'"+s.id+"'")||a.source.includes('"'+s.id+'"')).map(a=>a.path)})),assets:[...assets,...styles]};
  })()`});
  if (result.exceptionDetails) throw Error(JSON.stringify(result.exceptionDetails));
  const inventory = result.result.value;
  if (output) { mkdirSync(dirname(output), {recursive:true}); writeFileSync(output, JSON.stringify(inventory, null, 2)+'\n'); }
  console.log(JSON.stringify({boardId:inventory.boardId,registered:inventory.screens.length,cards:inventory.screens.filter(x=>!x.sequence).length,sequences:inventory.screens.filter(x=>x.sequence).length,sections:inventory.sections.map(s=>({id:s.id,cards:inventory.screens.filter(x=>x.section===s.id&&!x.sequence).length})),reviewStore:inventory.reviewStore,output},null,2));
} finally {
  socket?.close();
  child.kill();
}
