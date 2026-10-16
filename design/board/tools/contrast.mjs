// WCAG contrast check for BarkLog's text/status/event token pairs.
import { readFileSync } from 'node:fs';
const css=readFileSync(new URL('../css/barklog-tokens.css',import.meta.url),'utf8');
const future=readFileSync(new URL('../css/barklog-local-v1-tokens.css',import.meta.url),'utf8');
const vars=text=>Object.fromEntries([...text.matchAll(/--([\w-]+):\s*(#[\da-fA-F]{6})\b/g)].map(m=>[m[1],m[2]]));
const root=text=>vars(text.match(/:root\s*\{(.*?)\}/s)?.[1]||'');
const darkRoot=text=>vars(text.match(/:root\[data-theme='dark'\]\s*\{(.*?)\}/s)?.[1]||'');
const light={...root(css),...root(future)};
const dark={...light,...darkRoot(css),...darkRoot(future)};
const luminance=hex=>{const c=hex.match(/\w\w/g).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return .2126*c[0]+.7152*c[1]+.0722*c[2];};
const ratio=(a,b)=>{const [hi,lo]=[luminance(a),luminance(b)].sort((x,y)=>y-x);return(hi+.05)/(lo+.05);};
const pairs=[['ink','ground'],['ink-muted','ground'],['btn-ink','btn'],['status-good','status-good-soft'],['status-bad','status-bad-soft'],['status-warn','status-warn-soft'],['status-info','status-info-soft'],...['poop','pee','meal','walk','mood','symptom','behavior','grooming','weight','medication','training','photo'].map(k=>[`${k}-ink`,`${k}-bg`])];
let failed=false;
for(const [theme,palette] of [['light',light],['dark',dark]])for(const [fg,bg] of pairs){const value=ratio(palette[fg],palette[bg]);const pass=value>=4.5;failed||=!pass;console.log(`${pass?'PASS':'FAIL'} ${theme.padEnd(5)} ${fg}/${bg} ${value.toFixed(2)}:1`);}
process.exit(failed?1:0);
