/* task026: expressive vector mascot for this proposal only. No journal state. */
(() => {
  'use strict';
  const N=window.NEXT,{F,B,h}=N,s=F.svg;
  const ACTIONS=['curious','glance','ears','sniff','wave','stretch'];
  const originalCelebrate=B.celebrateDogCharacter,originalGreet=B.greetDogCharacter;
  B.celebrateDogCharacter=(ctx,art)=>art?._mascot?art._mascot.play('celebrate',{record:art.closest('.v3-day')?ctx.answers.records?.[0]:null}):originalCelebrate(ctx,art);
  B.greetDogCharacter=(ctx,art)=>art?._mascot?art._mascot.play('hello'):originalGreet(ctx,art);
  const setReduced=F.setReduced;
  F.setReduced=v=>{setReduced(v);window.dispatchEvent(new Event('barklog-motion-change'));};

  N.mountMascot=(ctx,art,{idle=true,entrance=true}={})=>{
    if(art._mascot)return art._mascot;
    art.classList.add('n-mascot');art._characterMotion=true;
    // Give each front paw its own pivot without changing the selected character.
    const legs=[...art.children].find(e=>e.getAttribute('d')?.startsWith('M77 124'));
    if(legs){
      legs.replaceWith(s('g',{class:'n-mascot-paw is-left'},s('path',{d:'M77 124c-4 10-5 29-4 39-10 1-15 6-12 12 2 4 19 5 25 1 4-3 2-31 4-46',fill:'var(--dog-fur)'}),s('path',{d:'M64 173h18',stroke:'var(--dog-ear)','stroke-width':2,'stroke-linecap':'round',opacity:.55})),s('g',{class:'n-mascot-paw is-right'},s('path',{d:'M108 126c3 13 2 25 2 37-8 1-12 7-9 12 3 4 20 5 25 0 3-4-3-38-7-48',fill:'var(--dog-fur)'}),s('path',{d:'M105 173h18',stroke:'var(--dog-ear)','stroke-width':2,'stroke-linecap':'round',opacity:.55})));
      [...art.children].find(e=>e.getAttribute('d')==='M64 173h18m23 0h18')?.remove();
    }
    const body=s('g',{class:'n-mascot-body'},...[...art.childNodes]);art.append(body);
    const parts={body,head:art.querySelector('.dog-character-head'),tail:art.querySelector('.dog-character-tail'),left:art.querySelector('.dog-character-ear.is-left'),right:art.querySelector('.dog-character-ear.is-right'),paw:art.querySelector('.n-mascot-paw.is-right')};
    const eyes=[...art.querySelectorAll('.dog-character-eye')];
    eyes.forEach((e,i)=>parts['eye'+i]=e);
    let timer=0,finishTimer=0,disposed=false,visible=true,paused=false,busy=false,bag=[],last=null,serial=0,pendingReward=null;
    const owners=new Map();
    const neutral={body:'translate(0px,0px) scale(1,1)',head:'translate(0px,0px) rotate(0deg)',tail:'rotate(0deg)',left:'rotate(0deg)',right:'rotate(0deg)',paw:'rotate(0deg)',eye0:'translateX(0px) scaleY(1)',eye1:'translateX(0px) scaleY(1)'};
    const available=()=>!disposed&&!ctx.dead&&art.isConnected&&!document.hidden&&visible&&!paused&&!F.reduced();
    const cancelTimers=()=>{clearTimeout(timer);clearTimeout(finishTimer);timer=finishTimer=0;};
    const still=()=>{cancelTimers();serial++;owners.forEach(a=>a.cancel());owners.clear();busy=false;art.dataset.mascotAction=F.reduced()?'still':'rest';};
    const animate=(name,values,ms,delay=0)=>{
      const el=parts[name];if(!el)return;
      // Read the visible pose before replacing its one animation owner.
      const current=getComputedStyle(el).transform;
      owners.get(name)?.cancel();
      const frames=[{transform:current==='none'?neutral[name]:current},...values.map(v=>({transform:v}))];
      const a=ctx.track(el.animate(frames,{duration:ms*F.k(),delay:delay*F.k(),easing:F.css('inout'),fill:'backwards'}));
      owners.set(name,a);a.finished.then(()=>{if(owners.get(name)===a)owners.delete(name);},()=>{});
    };
    const nextAction=()=>{
      if(!bag.length){bag=[...ACTIONS];for(let i=bag.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[bag[i],bag[j]]=[bag[j],bag[i]];}if(bag.at(-1)===last)[bag[0],bag[bag.length-1]]=[bag.at(-1),bag[0]];}
      last=bag.pop();return last;
    };
    const schedule=(first=false)=>{
      clearTimeout(timer);if(!idle||disposed||ctx.dead)return;
      timer=ctx.at(first?2400+Math.random()*1200:4400+Math.random()*3000,()=>{if(available()&&!busy)play(nextAction(),{automatic:true});else schedule();});
    };
    const play=(action='hello',{automatic=false,record=null}={})=>{
      if(!available()){if(action==='celebrate'&&!disposed&&!ctx.dead&&!F.reduced())pendingReward={record};return false;}
      pendingReward=null;
      if(automatic&&busy)return false;
      cancelTimers();const run=++serial;busy=true;art.dataset.mascotAction=action;
      const plan={};let duration=1150;
      const pose=(key,values,ms=duration,delay=0)=>plan[key]={values:[...values,neutral[key]],ms,delay};
      const head=(values,ms=duration)=>pose('head',values,ms);
      const wag=(amp=16,ms=920)=>pose('tail',[-amp,amp*.7,-amp*.45,amp*.2].map(a=>`rotate(${a}deg)`),ms);
      const blink=(double=false)=>eyes.forEach((e,i)=>pose('eye'+i,double?['scaleY(.1)','scaleY(1)','scaleY(.1)']:['scaleY(.1)'],double?440:220,300));
      const ears=(amp=12)=>{pose('left',[`rotate(${amp}deg)`,'rotate(-2deg)'],800,65);pose('right',[`rotate(${-amp}deg)`,'rotate(2deg)'],820,105);};
      if(action==='curious'){
        head(['translate(-1px,-1px) rotate(-10deg)','translate(-1px,-1px) rotate(-10deg)','rotate(3deg)']);ears(7);blink();
      }else if(action==='glance'){
        duration=1500;const direction=Math.random()<.5?-1:1;
        head([`translate(${direction*4}px,0px) rotate(${direction*6}deg)`,`translate(${direction*4}px,0px) rotate(${direction*6}deg)`],duration);
        eyes.forEach((e,i)=>pose('eye'+i,[`translateX(${direction*1.5}px) scaleY(1)`,`translateX(${direction*1.5}px) scaleY(1)`],duration));wag(9);
      }else if(action==='ears'){
        ears(17);head(['translate(0px,-2px) rotate(3deg)','rotate(-2deg)']);blink(true);
      }else if(action==='sniff'){
        duration=1300;head(['translate(0px,3px) rotate(-3deg)','translate(1px,5px) rotate(-5deg)','translate(-1px,3px) rotate(-3deg)','translate(1px,5px) rotate(-4deg)'],duration);wag(10,1100);
      }else if(action==='wave'||action==='hello'){
        duration=1400;pose('paw',['rotate(-82deg)','rotate(-104deg)','rotate(-82deg)','rotate(-99deg)'],1200);head(['rotate(-6deg)','rotate(-6deg)','rotate(2deg)'],duration);wag(22,1150);ears(6);blink();
      }else if(action==='stretch'){
        duration=1500;pose('body',['translate(0px,-2px) scale(.97,1.03093)','translate(0px,-2px) scale(.97,1.03093)'],duration);head(['translate(0px,-2px) rotate(3deg)','translate(0px,-2px) rotate(3deg)'],duration);blink(true);ears(7);
      }else if(action==='celebrate'){
        duration=1060;
        // Volume-preserving squash, a short hop, then a sampled spring landing.
        const curve=F.springCurve(.32,.70),ms=340+curve.duration,current=getComputedStyle(body).transform;
        owners.get('body')?.cancel();const a=ctx.track(body.animate([{transform:current,offset:0,easing:F.css('strong')},{transform:'translate(0px,2px) scale(1.045,.95694)',offset:90/ms,easing:F.css('emph')},{transform:'translate(0px,-7px) scale(.985,1.01523)',offset:220/ms,easing:F.css('inout')},...curve.values.map((v,i)=>({transform:`translate(0px,0px) scale(${1+.026*(1-v)},${1/(1+.026*(1-v))})`,offset:(340+i/(curve.values.length-1)*curve.duration)/ms}))],{duration:ms*F.k(),easing:'linear'}));owners.set('body',a);a.finished.then(()=>{if(owners.get('body')===a)owners.delete('body');},()=>{});head(['rotate(-8deg)','rotate(2deg)'],850);wag(25,1000);ears(10);blink();duration=Math.max(duration,ms);
      }
      // Settle any part interrupted by a higher-priority tap/save from its current pose.
      Object.keys(parts).forEach(key=>{if(key==='body'&&action==='celebrate')return;const p=plan[key];animate(key,p?.values||[neutral[key]],p?.ms||360,p?.delay||0);});
      finishTimer=ctx.at(duration+150,()=>{if(run!==serial||disposed)return;busy=false;art.dataset.mascotAction='rest';schedule();});return true;
    };
    const change=()=>{if(document.hidden||F.reduced()||paused||!visible){if(F.reduced())pendingReward=null;still();}else if(pendingReward){const reward=pendingReward;pendingReward=null;if(!reward.record||ctx.answers.records?.includes(reward.record))play('celebrate');else schedule(true);}else schedule(true);};
    ctx.on(document,'visibilitychange',change);ctx.on(window,'barklog-motion-change',change);
    const media=matchMedia('(prefers-reduced-motion: reduce)');ctx.on(media,'change',change);
    const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;change();},{threshold:.1});observer.observe(art);
    const controller={play,nextAction,actions:[...ACTIONS],suspend(){paused=true;still();},resume(){paused=false;change();},dispose(){disposed=true;pendingReward=null;still();observer.disconnect();}};
    art._mascot=controller;
    if(!ctx._mascots){ctx._mascots=[];const dispose=ctx.dispose,pause=ctx.pause,resume=ctx.resume;ctx.dispose=()=>{ctx._mascots.forEach(m=>m.dispose());dispose();};ctx.pause=()=>{ctx._mascots.forEach(m=>m.suspend());pause();};ctx.resume=()=>{resume();ctx._mascots.forEach(m=>m.resume());};}
    ctx._mascots.push(controller);
    document.fonts.ready.then(()=>{if(ctx.dead||disposed)return;if(F.reduced()){still();return;}if(entrance){const a=ctx.track(art.animate([{transform:'translate(10px,6px)',opacity:0},{transform:'none',opacity:1}],{duration:620*F.k(),easing:F.css('emph')}));owners.set('entry',a);a.finished.then(()=>{if(owners.get('entry')===a)owners.delete('entry');},()=>{});}ctx.at(entrance?760:0,()=>{if(!busy)play('hello');});});
    return controller;
  };
  N.dog=(ctx,size='large')=>{
    const art=B.dogCharacter();const el=h('div.n-dog.'+size,{'data-shared':'next-dog'});
    if(size==='large')el.append(B.press(ctx,h('button.n-mascot-button',{type:'button','aria-label':'Say hello to '+N.name(ctx)},art),()=>art._mascot?.play('hello'),.86));else el.append(art);
    N.mountMascot(ctx,art);return el;
  };
})();
