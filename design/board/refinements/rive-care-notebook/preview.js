/* Review only: the new authored Rive file, not a CSS stand-in. */
(async()=>{
  const $=s=>document.querySelector(s),pref=matchMedia('(prefers-reduced-motion:reduce)'),states=[];
  let player,ready=false,visible=true,timer,launch,settle,disposed=false;
  const clear=()=>{clearTimeout(timer);clearTimeout(launch);clearTimeout(settle);};
  const rest=()=>{clear();player?.pause();$('#stage').dataset.playing='false';};
  $('#motion').checked=!pref.matches;
  const allowed=()=>ready&&!disposed&&!document.hidden&&visible&&$('#motion').checked;
  const act=(action='hello')=>{if(!allowed())return false;clear();player.play();$('#stage').dataset.playing='true';player.viewModelInstance?.trigger('rest')?.trigger();launch=setTimeout(()=>{if(allowed())player.viewModelInstance?.trigger(action)?.trigger();},50);timer=setTimeout(()=>{player.viewModelInstance?.trigger('rest')?.trigger();settle=setTimeout(rest,220);},action==='curious'?2900:2500);return true;};
  const sync=()=>{if(!allowed())rest();['hello','curious'].forEach(id=>$('#'+id).disabled=!allowed());};
  $('#hello').onclick=()=>act('hello');$('#curious').onclick=()=>act('curious');$('#rest').onclick=rest;
  $('#motion').onchange=sync;pref.addEventListener('change',()=>{$('#motion').checked=!pref.matches;sync();});
  $('#theme').onclick=()=>{const dark=document.body.classList.toggle('dark');$('#theme').textContent=dark?'Light ground':'Dark ground';};
  document.addEventListener('visibilitychange',sync);
  const observer=new IntersectionObserver(entries=>{visible=entries[0].intersectionRatio>=.15;sync();},{threshold:.15});observer.observe($('#stage'));
  try{
    const wasm=await fetch('../rive-dog/vendor/rive.wasm');if(!wasm.ok)throw Error('Local runtime unavailable');rive.RuntimeLoader.setWasmBinary(await wasm.arrayBuffer());rive.RuntimeLoader.setWasmFallbackUrl(null);
    player=new rive.Rive({src:'care-notebook.riv',canvas:$('#art'),artboard:'BarkLog Care Notebook',stateMachines:'Care Companion',autoBind:true,autoplay:false,shouldDisableRiveListeners:true,
      onLoad(){ready=true;player.resizeDrawingSurfaceToCanvas();$('#status').textContent='New original artwork · Care Companion controller · local Rive playback.';sync();act('hello');},
      onStateChange(event){states.push(...(Array.isArray(event.data)?event.data:[event.data]));},
      onLoadError(){ready=false;rest();sync();$('#status').textContent='The Rive file could not load. Its original still is shown.';}
    });
  }catch{rest();$('#status').textContent='The local player could not load. Its original still is shown.';}
  const resize=new ResizeObserver(()=>{if(ready&&!disposed)player.resizeDrawingSurfaceToCanvas();});resize.observe($('#stage'));
  window.addEventListener('pagehide',()=>{disposed=true;rest();observer.disconnect();resize.disconnect();player?.cleanup();});
  window.notebookReview={act,rest,states,get player(){return player;},get ready(){return ready;}};
})();
