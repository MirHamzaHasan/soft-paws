const $ = (s) => document.querySelector(s);
const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
const names = {hello:'Hello',curious:'Curious',saved:'Saved',sleepy:'Sleepy',sniff:'Sniff',ears:'Ear perk'};
const messages = {Idle:'A moment to breathe.',Hello:'Hello, you.',Curious:'What was that?',Saved:'A happy little hop.',Sleepy:'Getting a little sleepy.',Sniff:'Something smells interesting.','Ear perk':'All ears.'};
const state = {ready:false, motion:!motionPreference.matches, paused:false, visible:true, current:'Idle', random:true, disposed:false};
const history = [], transitions = [];
let player, timer, resizeObserver, bag=[], lastRandom='', activeBeforeMotionOff=false, pendingAction=null;
const canInteract = () => state.ready && state.motion && !state.paused && !document.hidden && !state.disposed;
const canPlay = () => canInteract() && state.visible;
const status = (text) => { $('#status').textContent=text; };
const clearIdle = () => {clearTimeout(timer);timer=null;};

function shuffledActions() {
  const items=['curious','sleepy','sniff','ears'];
  for(let i=items.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[items[i],items[j]]=[items[j],items[i]];}
  if(items.at(-1)===lastRandom)[items[0],items[items.length-1]]=[items.at(-1),items[0]];
  return items;
}
function scheduleIdle() {
  clearIdle();
  if(!canPlay() || !state.random || state.current!=='Idle')return;
  timer=setTimeout(()=>{
    timer=null;
    if(!bag.length)bag=shuffledActions();
    const action=bag.pop();lastRandom=action;act(action,'random');
  },4800+Math.random()*3400);
}
function buttons() {
  document.querySelectorAll('[data-action],#pet').forEach(b=>{b.disabled=!canInteract();});
  $('#pause').disabled=!state.ready || !state.motion;
  $('#pause').textContent=state.paused?'Resume':'Pause';
  document.querySelectorAll('[data-action]').forEach(b=>b.setAttribute('aria-pressed',String(names[b.dataset.action]===state.current && state.motion)));
}
function act(action,source='button') {
  if(!canInteract() || !(action in names))return false;
  if(!state.visible){pendingAction={action,source};$('#pet').scrollIntoView({block:'center',behavior:'smooth'});return true;}
  const trigger=player.viewModelInstance?.trigger(action);
  if(!trigger){status('The Rive action could not be found. Reload to try again.');return false;}
  clearIdle();
  history.push({action,source,at:performance.now()});
  trigger.trigger();
  return true;
}
function updatePlayback() {
  clearIdle();
  if(!state.ready)return;
  if(!state.motion) {
    pendingAction=null;
    player.pause();
    $('#pet').classList.remove('live');
    activeBeforeMotionOff=true;
    state.current='Idle';
    status('Still pose. Motion is off.');
  } else {
    if(activeBeforeMotionOff) {
      player.reset({artboard:'BarkLog Dog · Character Study',stateMachine:'Dog Controller',autoBind:true,autoplay:false});
      state.current='Idle';activeBeforeMotionOff=false;
    }
    $('#pet').classList.add('live');
    if(canPlay()){player.play();status(messages[state.current]||messages.Idle);scheduleIdle();}
    else {player.pause();if(state.paused)status('Paused. Resume when you like.');}
  }
  buttons();
}
function setMotion(value) {state.motion=Boolean(value);$('#motion').checked=state.motion;updatePlayback();}
function preferenceNote() {$('#motion-note').textContent=motionPreference.matches?'Your Mac has Reduce Motion on. Choose to play motion here.':'Switch off for a still pose. Your system settings stay the same.';}
$('#motion').checked=state.motion;preferenceNote();
$('#motion').addEventListener('change',e=>setMotion(e.target.checked));
motionPreference.addEventListener('change',()=>{preferenceNote();setMotion(!motionPreference.matches);});
$('#random').addEventListener('change',e=>{state.random=e.target.checked;scheduleIdle();});
$('#pause').addEventListener('click',()=>{state.paused=!state.paused;updatePlayback();});
$('#pet').addEventListener('click',()=>act('hello','dog'));
document.querySelectorAll('[data-action]').forEach(b=>b.addEventListener('click',()=>act(b.dataset.action)));
$('#theme').addEventListener('click',()=>{const dark=document.body.classList.toggle('dark');$('#theme').setAttribute('aria-pressed',String(dark));$('#theme').textContent=dark?'Light ground':'Dark ground';});
document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>{
  const home=b.dataset.view==='home';$('#stage').classList.toggle('home-mode',home);$('#stage-label').textContent=home?'Example Home card':'Meet the spaniel';
  document.querySelectorAll('[data-view]').forEach(v=>v.setAttribute('aria-pressed',String(v===b)));
}));
document.addEventListener('visibilitychange',updatePlayback);
const visibilityObserver=new IntersectionObserver(entries=>{
  const visible=entries[0].intersectionRatio>=0.15;
  if(visible===state.visible)return;
  state.visible=visible;updatePlayback();
  if(visible && pendingAction){const next=pendingAction;pendingAction=null;act(next.action,next.source);}
},{threshold:0.15});
visibilityObserver.observe($('#pet'));
window.addEventListener('pagehide',()=>{state.disposed=true;state.ready=false;clearIdle();pendingAction=null;visibilityObserver.disconnect();resizeObserver?.disconnect();player?.cleanup();player=null;});
window.addEventListener('pageshow',event=>{if(event.persisted && state.disposed)location.reload();});

async function load() {
  try {
    const wasm=await fetch('./vendor/rive.wasm');
    if(!wasm.ok)throw Error('The local Rive runtime could not be loaded.');
    rive.RuntimeLoader.setWasmBinary(await wasm.arrayBuffer());
    rive.RuntimeLoader.setWasmFallbackUrl(null);
    player=new rive.Rive({src:'spaniel.riv',canvas:$('#dog'),artboard:'BarkLog Dog · Character Study',stateMachine:'Dog Controller',autoBind:true,autoplay:false,shouldDisableRiveListeners:true,
      onLoad(){
        state.ready=true;player.resizeDrawingSurfaceToCanvas();updatePlayback();
      },
      onStateChange(event){
        const values=Array.isArray(event.data)?event.data:[event.data];
        for(const name of values)if(name in messages){state.current=name;transitions.push({name,at:performance.now()});}
        if(state.motion && !state.paused)status(messages[state.current]);
        buttons();scheduleIdle();
      },
      onLoadError(){state.ready=false;status('Rive could not load. The original vector is shown; reload to retry.');buttons();}
    });
    resizeObserver=new ResizeObserver(()=>{if(!state.disposed)player?.resizeDrawingSurfaceToCanvas();});
    resizeObserver.observe($('#pet'));
  } catch(error) {status(error.message+' The original vector is shown.');}
}
window.mascotStudy={state,history,transitions,act,setMotion,get player(){return player;},get idlePending(){return timer!==null;},shuffledActions};
await load();
