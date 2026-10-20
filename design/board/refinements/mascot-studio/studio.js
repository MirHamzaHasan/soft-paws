/* Local, review-only Lottie playback. No care records are read or written. */
(() => {
  'use strict';
  const $=s=>document.querySelector(s), media=matchMedia('(prefers-reduced-motion: reduce)');
  const files=['idle','curious','glance','ears','sniff','hello','stretch','celebrate','still'];
  const names={idle:'A breath, a blink, a little wag.',curious:'Something caught their attention.',glance:'A quick look around.',ears:'All ears.',sniff:'Just having a sniff.',hello:'Hello, you.',stretch:'A little stretch.',celebrate:'A happy moment, remembered.',still:'A quiet little companion.'};
  const idleActions=['idle','curious','glance','ears','sniff','stretch'];
  const state={ready:false,current:'still',playing:false,paused:false,reduced:false,previewMotion:false,queue:null,bag:[],last:null,serial:0};
  let timer=0,player=null,clips={};
  const reduced=()=>state.reduced||(media.matches&&!state.previewMotion);
  const available=()=>!document.hidden&&!state.paused&&!reduced();
  function status(message){$('#status').textContent=message;}
  function cancelTimer(){clearTimeout(timer);timer=0;}
  function updateButtons(){document.querySelectorAll('[data-action]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.action===state.current&&state.playing)));}
  function nextIdle(){if(!state.bag.length){state.bag=[...idleActions];for(let i=state.bag.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[state.bag[i],state.bag[j]]=[state.bag[j],state.bag[i]];}if(state.bag.at(-1)===state.last)[state.bag[0],state.bag[state.bag.length-1]]=[state.bag.at(-1),state.bag[0]];}state.last=state.bag.pop();return state.last;}
  function schedule(){cancelTimer();if(available()&&$('#automatic').checked)timer=setTimeout(()=>play(nextIdle()),4400+Math.random()*3000);}
  function show(action,run=true,transition=false){
    const data=transition&&player?MascotPoseBridge.bridge(clips[action],player.animationData,player.currentFrame):structuredClone(clips[action]);
    cancelTimer();const serial=++state.serial;player?.destroy();state.current=action;state.playing=run&&action!=='still';
    player=lottie.loadAnimation({container:$('#animation'),renderer:'svg',loop:false,autoplay:false,animationData:data,rendererSettings:{progressiveLoad:false,preserveAspectRatio:'xMidYMid meet'}});
    player.addEventListener('DOMLoaded',()=>{if(serial!==state.serial)return;if(state.playing&&available())player.play();else player.goToAndStop(0,true);});
    player.addEventListener('complete',()=>{if(serial!==state.serial)return;state.playing=false;updateButtons();if(state.queue&&available()){const next=state.queue;state.queue=null;show(next);return;}schedule();});
    status(reduced()?'Motion reduced · the dog stays still.':state.paused?'Paused · take your time.':names[action]);updateButtons();
  }
  function play(action){
    if(!state.ready)return;
    if(reduced()){state.queue=null;show('still',false);return;}
    if(state.paused){state.paused=false;$('#pause').textContent='Pause';$('#pause').setAttribute('aria-pressed','false');}
    // One live player owns the pose. An interrupted gesture eases from the exact
    // visible transforms into the new clip; no queued wait or mid-air reset.
    show(action,true,state.playing);
  }
  function applyMotion(){cancelTimer();state.queue=null;if(reduced()){show('still',false);}else if(!state.paused){show('still',false);schedule();}}
  document.querySelectorAll('[data-action]').forEach(b=>b.addEventListener('click',()=>play(b.dataset.action)));
  $('#dog').addEventListener('click',()=>play('hello'));
  $('#pause').addEventListener('click',()=>{state.paused=!state.paused;$('#pause').textContent=state.paused?'Resume':'Pause';$('#pause').setAttribute('aria-pressed',String(state.paused));cancelTimer();if(state.paused){state.queue=null;player?.pause();status('Paused · take your time.');}else if(available()){if(state.playing)player?.play();else schedule();status(names[state.current]);}});
  $('#automatic').addEventListener('change',schedule);
  function motionControls(){$('#reduce').checked=reduced();$('#reduce').disabled=media.matches&&!state.previewMotion;$('#system-note').hidden=!media.matches;$('#system-option').hidden=!media.matches;}
  motionControls();
  $('#reduce').addEventListener('change',()=>{state.reduced=$('#reduce').checked;applyMotion();});
  $('#preview-motion').addEventListener('change',()=>{state.previewMotion=$('#preview-motion').checked;if(state.previewMotion)state.reduced=false;motionControls();applyMotion();if(state.previewMotion)play('hello');});
  media.addEventListener('change',()=>{motionControls();applyMotion();});
  $('#theme').addEventListener('click',()=>{const dark=document.body.classList.toggle('dark');$('#theme').textContent=dark?'Light background':'Dark background';$('#theme').setAttribute('aria-pressed',String(dark));});
  function view(home){$('#stage').classList.toggle('home-mode',home);$('#home').setAttribute('aria-pressed',String(home));$('#large').setAttribute('aria-pressed',String(!home));$('#example-note').hidden=!home;}
  $('#home').addEventListener('click',()=>view(true));$('#large').addEventListener('click',()=>view(false));
  document.addEventListener('visibilitychange',()=>{cancelTimer();if(document.hidden){state.queue=null;player?.pause();}else if(available()){if(state.playing)player?.play();else schedule();}});
  window.addEventListener('pagehide',()=>{cancelTimer();state.queue=null;player?.destroy();});
  Promise.all(files.map(async name=>{const response=await fetch('assets/'+name+'.lottie.json');if(!response.ok)throw Error('Could not load '+name);return[name,await response.json()];})).then(entries=>{clips=Object.fromEntries(entries);state.ready=true;show('still',false);schedule();}).catch(error=>{player?.destroy();$('#fallback').hidden=false;$('#animation').hidden=true;status('Animation could not load. Reload to try again.');console.error(error);});
  // Exposes observable review state, not a second animation clock.
  window.mascotReview={state,play,nextIdle,get player(){return player;},get clips(){return clips;}};
})();
