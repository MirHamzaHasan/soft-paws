/* BarkLog's vector dog. Each moving part has one animation owner. Board only. */
(() => {
  'use strict';
  const F=window.F,B=window.B;
  // One vector character, shared by Home, setup and the component previews.
  B.dogCharacter=()=>{
    const s=F.svg;
    return s('svg',{viewBox:'0 0 180 190',class:'bl-home-dog bl-dog-character','aria-hidden':'true'},
      s('g',{class:'dog-character-tail'},s('path',{d:'M126 146c18 10 35 3 31-11-2-7-9-8-10-3-1 3 5 6 1 10-4 5-12 3-18-2Z',fill:'var(--dog-ear)'})),
      s('path',{d:'M75 91c-14 20-19 42-15 61 3 16 15 25 40 25 25 0 38-9 35-26-3-22-11-43-26-60Z',fill:'var(--dog-fur)'}),
      s('path',{d:'M78 105c-7 16-8 39-2 51 6 13 30 13 36 0 6-15 1-37-6-51Z',fill:'var(--dog-muzzle)'}),
      s('path',{d:'M71 136c-15-6-24 8-19 23 4 12 20 15 30 9l-4-13Z',fill:'var(--dog-ear)'}),
      s('path',{d:'M119 136c16-5 24 10 17 24-5 10-19 13-28 7l5-15Z',fill:'var(--dog-ear)'}),
      s('path',{d:'M77 124c-4 10-5 29-4 39-10 1-15 6-12 12 2 4 19 5 25 1 4-3 2-31 4-46m18-4c3 13 2 25 2 37-8 1-12 7-9 12 3 4 20 5 25 0 3-4-3-38-7-48',fill:'var(--dog-fur)'}),
      s('path',{d:'M64 173h18m23 0h18',fill:'none',stroke:'var(--dog-ear)','stroke-width':2,'stroke-linecap':'round',opacity:.55}),
      s('g',{class:'dog-character-head'},
        s('g',{class:'dog-character-ear is-left'},s('path',{d:'M65 31c-17-4-29 12-27 32 1 17 9 27 18 20 10-9 17-34 9-52Z',fill:'var(--dog-ear)'})),
        s('path',{d:'M57 51c0-27 14-40 36-40 25 0 42 16 40 44-2 29-17 44-39 44-24 0-39-18-37-48Z',fill:'var(--dog-fur)'}),
        s('g',{class:'dog-character-ear is-right'},s('path',{d:'M121 28c18-1 29 16 25 36-3 16-11 23-19 16-9-9-14-35-6-52Z',fill:'var(--dog-ear)'})),
        s('path',{d:'M91 23c6 7 9 17 8 28-2 7-9 13-16 10-8-4-10-19-5-29Z',fill:'var(--dog-muzzle)',opacity:.45}),
        s('ellipse',{class:'dog-character-eye',cx:77,cy:51,rx:3.2,ry:4.2,fill:'var(--dog-ink)'}),
        s('ellipse',{class:'dog-character-eye',cx:110,cy:51,rx:3.2,ry:4.2,fill:'var(--dog-ink)'}),
        s('ellipse',{cx:94,cy:72,rx:26,ry:20,fill:'var(--dog-muzzle)'}),
        s('path',{d:'M85 63c4-4 14-4 18 0 2 5-3 10-9 10s-11-5-9-10Z',fill:'var(--dog-ink)'}),
        s('path',{d:'M94 72v7m-10 0c6 7 15 7 21 0',fill:'none',stroke:'var(--dog-ink)','stroke-width':2.2,'stroke-linecap':'round'})),
      s('path',{d:'M68 90c16 7 35 7 55-1l1 9c-20 8-39 8-56 0Z',fill:'var(--dog-collar)'}),
      s('circle',{cx:97,cy:102,r:6,fill:'var(--ball)'}),
      s('circle',{cx:97,cy:102,r:1.5,fill:'var(--dog-ink)'}));
  };

  B.wagDogCharacter=(ctx,art)=>{
    if(F.reduced()||ctx.dead)return;
    const tail=art.querySelector('.dog-character-tail');
    if(!tail)return;
    const matrix=new DOMMatrix(getComputedStyle(tail).transform);
    const angle=Math.atan2(matrix.b,matrix.a)*180/Math.PI;
    tail.getAnimations().forEach(a=>a.cancel());
    ctx.track(tail.animate([angle,-12,7,-4,0].map(r=>({transform:`rotate(${r}deg)`})),{duration:560*F.k(),easing:F.css('strong')}));
  };

  B.greetDogCharacter=(ctx,art)=>{
    if(F.reduced()||ctx.dead)return;
    art._characterResponded=true;
    B.wagDogCharacter(ctx,art);
    const head=art.querySelector('.dog-character-head');
    const matrix=new DOMMatrix(getComputedStyle(head).transform);
    const angle=Math.atan2(matrix.b,matrix.a)*180/Math.PI;
    head.getAnimations().forEach(a=>a.cancel());
    ctx.track(head.animate([angle,-4,1.5,0].map(r=>({transform:`rotate(${r}deg)`})),{duration:480*F.k(),easing:F.css('strong')}));
  };

  // A saved moment earns one small happy bounce. Individual scale/translate keep
  // the root entrance intact; another save resumes from the dog's visible pose.
  B.celebrateDogCharacter=(ctx,art)=>{
    if(ctx.dead||!art?.isConnected||F.reduced())return;
    art._characterResponded=true;
    const style=getComputedStyle(art),scale=style.scale==='none'?'1 1':style.scale;
    const translate=style.translate==='none'?'0px 0px':style.translate;
    art._logAnimation?.cancel();
    const settle=F.springCurve(.30,.70),duration=340+settle.duration;
    const frames=[
      {scale,translate,offset:0,easing:F.css('strong')},
      {scale:'1.04 .96154',translate:'0px 2px',offset:90/duration,easing:F.css('emph')},
      {scale:'.985 1.01523',translate:'0px -6px',offset:200/duration,easing:F.css('inout')},
      ...settle.values.map((p,i)=>({scale:`${1+.025*(1-p)} ${1/(1+.025*(1-p))}`,translate:'0px 0px',offset:(340+i/(settle.values.length-1)*settle.duration)/duration})),
    ];
    art._logAnimation=ctx.track(art.animate(frames,{duration:duration*F.k(),easing:'linear'}));
    const rotate=(part,angles,ms,delay=0)=>{
      const matrix=new DOMMatrix(getComputedStyle(part).transform),angle=Math.atan2(matrix.b,matrix.a)*180/Math.PI;
      part.getAnimations().forEach(a=>a.cancel());
      ctx.track(part.animate([angle,...angles].map(r=>({transform:`rotate(${r}deg)`})),{duration:ms*F.k(),delay:delay*F.k(),easing:F.css('inout'),fill:'backwards'}));
    };
    rotate(art.querySelector('.dog-character-head'),[-7,2,0],620);
    rotate(art.querySelector('.dog-character-tail'),[-23,17,-11,5,0],680);
    art.querySelectorAll('.dog-character-ear').forEach((ear,i)=>rotate(ear,[i?-5:5,i?2:-2,0],500,40));
  };

  B.animateDogCharacter=(ctx,art,{carried=false,idle=true,delay=140}={})=>{
    if(ctx.dead||F.reduced()||art._characterMotion)return;
    art._characterMotion=true;
    const play=(el,frames,ms,wait=0,easing=F.css('emph'))=>ctx.track(el.animate(frames,{duration:ms*F.k(),delay:wait*F.k(),easing,fill:'backwards'}));
    const flying=carried&&getComputedStyle(art).visibility==='hidden';
    const arriving=art.getAnimations().some(a=>a.playState!=='finished');
    if(!flying&&!arriving)play(art,[{transform:'translate(18px, 8px)',opacity:0},{transform:'none',opacity:1}],620,delay);
    const follow=flying?620:delay+100;
    play(art.querySelector('.dog-character-head'),[{transform:'rotate(-5deg)'},{transform:'rotate(0deg)'}],560,follow);
    art.querySelectorAll('.dog-character-ear').forEach((ear,i)=>play(ear,[
      {transform:`rotate(${i?-7:7}deg)`},
      {transform:`rotate(${i?2:-2}deg)`,offset:.65},
      {transform:'rotate(0deg)'}],540,follow+35));
    ctx.at(follow+260,()=>{if(!art._characterResponded)B.wagDogCharacter(ctx,art);});
    if(!idle)return;
    const blink=()=>{
      if(ctx.dead||F.reduced())return;
      art.querySelectorAll('.dog-character-eye').forEach(eye=>play(eye,[
        {transform:'scaleY(1)'},{transform:'scaleY(.12)',offset:.45},{transform:'scaleY(1)'}],160,0,'ease-in-out'));
      ctx.at(5400,blink);
    };
    ctx.at(1400,blink);
  };

  // Landscape previews use the same dog and timing, with space around the silhouette.
  B.scene=(ctx,kind='day')=>{
    const art=B.dogCharacter();
    art.classList.add('v4-dog-scene');
    art.setAttribute('viewBox','-70 0 320 190');
    if(kind==='training')art.classList.add('is-training');
    document.fonts.ready.then(()=>requestAnimationFrame(()=>B.animateDogCharacter(ctx,art)));
    return art;
  };

})();
