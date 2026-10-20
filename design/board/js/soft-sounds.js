/* task042 · original, locally synthesized interaction sounds. Board preview only. */
(() => {
  'use strict';
  if(window.BarkSounds)return;
  const KEY='barklog:interaction-sounds:v1',listeners=new Set(),buffers=new Map(),active=new Set(),gestures=new WeakMap(),completed=new WeakMap();
  let preferences={enabled:false,volume:.35,style:'wood'};
  try{const p=JSON.parse(localStorage.getItem(KEY)||'null');if(p)preferences={enabled:p.enabled===true,volume:Number.isFinite(p.volume)?Math.max(0,Math.min(1,p.volume)):.35,style:p.style==='pop'?'pop':'wood'};}catch{}
  let context=null,master=null,revision=0,request=0,lastAt=-Infinity,plays=0,lastKind=null,error=null;
  const state=()=>({...preferences,available:!!(window.AudioContext||window.webkitAudioContext),error});
  const publish=()=>{for(const fn of listeners)fn(state());};
  const persist=()=>{try{localStorage.setItem(KEY,JSON.stringify(preferences));}catch{}publish();};
  const stop=()=>{revision++;request++;for(const source of active){try{source.stop();source.disconnect();}catch{}}active.clear();};
  const gain=()=>{if(master&&context){master.gain.cancelScheduledValues(context.currentTime);master.gain.setTargetAtTime(preferences.volume*.5,context.currentTime,.008);}};
  // Short damped resonances and filtered texture, not recordings or a sound library.
  function renderPCM(kind='tap',style='wood',rate=48000){
    const duration=kind==='saved'?.21:kind==='selection'?.065:.085;
    const out=new Float32Array(Math.ceil(rate*duration));let seed=0x4241524b,filtered=0,phase=0;
    const envelope=(t,decay,end)=>t<0||t>end?0:(1-Math.exp(-t/.0018))*Math.exp(-t/decay)*Math.min(1,(end-t)/.012);
    for(let i=0;i<out.length;i++){
      const t=i/rate;seed=(Math.imul(seed,1664525)+1013904223)>>>0;
      filtered+=.12*((seed/4294967296*2-1)-filtered);
      let x=0;
      if(kind==='saved'){
        x=.52*Math.sin(2*Math.PI*330*t)*envelope(t,.035,.12)+.44*Math.sin(2*Math.PI*440*(t-.065))*envelope(t-.065,.045,.145);
      }else if(style==='pop'){
        const frequency=(kind==='selection'?520:310)*Math.exp(-t*13);phase+=2*Math.PI*frequency/rate;
        x=(Math.sin(phase)*.65+filtered*.1)*envelope(t,kind==='selection'?.012:.019,duration);
      }else{
        const frequency=kind==='selection'?690:235;
        x=(Math.sin(2*Math.PI*frequency*t)*.43+Math.sin(2*Math.PI*frequency*2.17*t)*.12+filtered*.28)*envelope(t,kind==='selection'?.008:.014,duration);
      }
      out[i]=x;
    }
    let peak=0;for(const x of out)peak=Math.max(peak,Math.abs(x));
    if(peak)for(let i=0;i<out.length;i++)out[i]*=(kind==='selection'?.3:.42)/peak;
    out[0]=0;out[out.length-1]=0;return out;
  }
  const prepare=()=>{
    if(context?.state==='closed'){context=null;master=null;buffers.clear();}
    if(!context){const Constructor=window.AudioContext||window.webkitAudioContext;if(!Constructor)throw Error('unavailable');context=new Constructor({latencyHint:'interactive'});master=context.createGain();master.gain.value=preferences.volume*.5;master.connect(context.destination);}
    return context;
  };
  async function play(kind='tap'){
    if(!preferences.enabled||preferences.volume===0||document.hidden)return false;
    if(!['tap','selection','saved'].includes(kind))return false;
    const now=performance.now();if(kind!=='saved'&&now-lastAt<70)return false;
    lastAt=now;const version=revision,id=++request;
    try{
      const audio=prepare();if(audio.state!=='running')await audio.resume();
      if(version!==revision||id!==request||!preferences.enabled||preferences.volume===0||document.hidden||audio.state!=='running')return false;
      const key=kind+':'+preferences.style+':'+audio.sampleRate;
      if(!buffers.has(key)){const pcm=renderPCM(kind,preferences.style,audio.sampleRate),buffer=audio.createBuffer(1,pcm.length,audio.sampleRate);buffer.copyToChannel(pcm,0);buffers.set(key,buffer);}
      // One voice: quick taps never add together into a louder burst.
      for(const source of active){try{source.stop();}catch{}}active.clear();
      const source=audio.createBufferSource();source.buffer=buffers.get(key);source.connect(master);active.add(source);
      source.onended=()=>{active.delete(source);source.disconnect();};source.start();plays++;lastKind=kind;
      if(error){error=null;publish();}return true;
    }catch{error='Sounds are unavailable here. Everything else still works.';publish();return false;}
  }
  window.BarkSounds={
    state,play,stop,renderPCM,
    setEnabled(enabled){preferences.enabled=!!enabled;error=null;if(!enabled)stop();persist();},
    setVolume(volume){preferences.volume=Math.max(0,Math.min(1,Number(volume)||0));if(!preferences.volume)stop();gain();persist();},
    setStyle(style){preferences.style=style==='pop'?'pop':'wood';persist();},
    subscribe(fn){listeners.add(fn);fn(state());return()=>listeners.delete(fn);},
    diagnostics:()=>({plays,lastKind,active:active.size,contextCreated:!!context,contextState:context?.state||'not-created',...state()}),
  };
  document.addEventListener('click',event=>{
    if(!event.isTrusted)return;
    const control=event.target.closest('button,input[type="checkbox"],input[type="radio"]');
    if(!control||!control.closest('.ph')||control.closest('[data-sound-control]')||control.disabled||control.getAttribute('aria-disabled')==='true'||control.getAttribute('aria-busy')==='true'||control.closest('[inert]'))return;
    gestures.set(control.closest('.ph'),performance.now());
    const selection=control.matches('[role="switch"],[aria-pressed],input,.bl-tab,.bl-chip,.n-choice,.v4-choice');
    void play(selection?'selection':'tap');
  },true);
  document.addEventListener('change',event=>{if(event.isTrusted&&event.target.matches('.ph input[type="range"],.ph select')&&!event.target.closest('[data-sound-control]'))void play('selection');});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){stop();context?.suspend().catch(()=>{});}});
  window.addEventListener('pagehide',()=>{stop();context?.close().catch(()=>{});});
  // Explicit completion signal, never a guessed button label, toast or landing animation.
  const B=window.B;
  B.soundSuccess=ctx=>{
    const gesture=gestures.get(ctx.root);
    if(!ctx.dead&&ctx.mode==='flow'&&gesture!=null&&performance.now()-gesture<5000&&completed.get(ctx.root)!==gesture){completed.set(ctx.root,gesture);void play('saved');}
  };
  const save=B.savePreviewRecord;
  if(save)B.savePreviewRecord=(ctx,...args)=>{const result=save(ctx,...args);B.soundSuccess(ctx);return result;};
  // The pinned Home source remains unchanged. Observe its synchronous preview write
  // around a real quick-care click, then signal success only if a record was added.
  const home=B.home;
  if(home)B.home=(ctx,...args)=>{
    home(ctx,...args);const pending=new WeakMap();
    ctx.on(ctx.root,'click',event=>{const tile=event.target.closest('.v3-care');if(event.isTrusted&&tile&&!tile.disabled)pending.set(event,(ctx.answers.records||B.example).length);},true);
    ctx.on(ctx.root,'click',event=>{const before=pending.get(event);if(before!=null&&(ctx.answers.records||B.example).length===before+1)B.soundSuccess(ctx);});
  };
})();
