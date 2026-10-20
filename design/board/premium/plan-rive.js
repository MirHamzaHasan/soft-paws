/* New original task047 care-notebook puppy. The existing Rive runtime is reused. */
(() => {
  const N=window.NEXT,{h,F}=N,base='refinements/rive-care-notebook/',vendor='refinements/rive-dog/vendor/';
  let runtime;
  const loadRuntime=()=>runtime ||= (async()=>{
    if(!window.rive)await new Promise((resolve,reject)=>{
      const script=document.createElement('script');script.src=vendor+'rive.js';
      script.onload=resolve;script.onerror=()=>reject(Error('Local Rive runtime unavailable'));document.head.append(script);
    });
    const response=await fetch(vendor+'rive.wasm');if(!response.ok)throw Error('Local Rive WASM unavailable');
    rive.RuntimeLoader.setWasmBinary(await response.arrayBuffer());rive.RuntimeLoader.setWasmFallbackUrl(null);
  })();
  N.planDog=(ctx)=>{
    const label='Say hello to '+N.name(ctx),canvas=h('canvas',{'aria-hidden':'true'});
    const el=h('button.p47-mascot',{type:'button','aria-label':label,'data-playing':'false','data-rive':'still','data-artwork':'care-notebook'},h('img',{src:base+'companion.svg',alt:'','aria-hidden':'true'}),canvas);
    let player,loading=false,ready=false,dead=false,visible=false,paused=false,greeted=false,timer,settle,launch,resize;
    const states=[];
    const clear=()=>{clearTimeout(timer);clearTimeout(settle);clearTimeout(launch);timer=settle=launch=null;};
    const allowed=()=>!dead&&!ctx.dead&&visible&&!paused&&!document.hidden&&!F.reduced();
    const rest=()=>{clear();player?.pause();el.dataset.playing='false';};
    const act=(action='hello')=>{
      if(!ready||!allowed())return false;
      clear();player.play();el.dataset.playing='true';
      player.viewModelInstance?.trigger('rest')?.trigger();
      // Give the controller its first Idle frame before firing the next trigger.
      // Firing onLoad's greeting in the same tick is consumed by the entry state.
      launch=setTimeout(()=>{if(allowed())player.viewModelInstance?.trigger(action)?.trigger();},50);
      // Bounded notebook greeting, then its own neutral vector; no sales/reward loop.
      timer=setTimeout(()=>{player?.viewModelInstance?.trigger('rest')?.trigger();settle=setTimeout(rest,220);},action==='curious'?2900:2500);
      el.dataset.lastAction=action;return true;
    };
    const sync=()=>{
      el.disabled=F.reduced()||el.dataset.rive==='fallback';
      el.setAttribute('aria-label',el.disabled?'Dog illustration · still pose':label);
      if(!allowed()){rest();return;}
      if(ready&&!greeted){greeted=true;act('hello');}
      else if(!loading&&!ready)load();
    };
    const load=async()=>{
      if(loading||dead||F.reduced())return;loading=true;el.dataset.rive='loading';
      try{
        await loadRuntime();if(dead||ctx.dead)return;
        player=new rive.Rive({src:base+'care-notebook.riv',canvas,artboard:'BarkLog Care Notebook',stateMachines:'Care Companion',autoBind:true,autoplay:false,shouldDisableRiveListeners:true,
          onLoad(){if(dead||ctx.dead){player?.cleanup();return;}ready=true;el.dataset.rive='ready';player.resizeDrawingSurfaceToCanvas();sync();},
          onStateChange(event){states.push(...(Array.isArray(event.data)?event.data:[event.data]));},
          onLoadError(){ready=false;el.dataset.rive='fallback';rest();el.disabled=true;el.setAttribute('aria-label','Dog illustration · still pose');}
        });
        resize=new ResizeObserver(()=>{if(ready&&!dead)player.resizeDrawingSurfaceToCanvas();});resize.observe(el);
      }catch{el.dataset.rive='fallback';el.disabled=true;el.setAttribute('aria-label','Dog illustration · still pose');rest();}
    };
    const observer=new IntersectionObserver(entries=>{visible=entries[0].intersectionRatio>=.15;sync();},{threshold:.15});observer.observe(el);
    ctx.on(el,'click',()=>act('hello'));
    ctx.on(document,'visibilitychange',sync);ctx.on(window,'barklog-motion-change',sync);
    const preference=matchMedia('(prefers-reduced-motion: reduce)');ctx.on(preference,'change',sync);
    const oldPause=ctx.pause.bind(ctx),oldResume=ctx.resume.bind(ctx),oldDispose=ctx.dispose.bind(ctx);
    ctx.pause=()=>{paused=true;rest();oldPause();};ctx.resume=()=>{paused=false;oldResume();sync();};
    const cleanup=()=>{if(dead)return;dead=true;rest();observer.disconnect();resize?.disconnect();player?.cleanup();player=null;el.dataset.rive='disposed';};
    ctx.on(window,'pagehide',cleanup);ctx.dispose=()=>{cleanup();oldDispose();};
    el.motion={act,rest,states,get player(){return player;},get ready(){return ready;},get playing(){return el.dataset.playing==='true';},get disposed(){return dead;}};
    sync();return el;
  };
})();
