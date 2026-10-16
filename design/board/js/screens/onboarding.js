(() => {
  const F=window.F,B=window.B,h=F.h,V=window.BARK_V3;
  B.seq('onboarding',['opening-value','dog-setup','home-coach']);

  /*
   * The opening, one stage, under six seconds. Thread: the dog → the moments it makes → the day
   * line they land on → the dated card that line becomes. Nothing is swapped; the button comes last.
   *   0.15 s  the dog arrives                     "Every walk. Every meal."
   *   0.70 s  the day draws itself
   *   1.30 s  four moments leave the dog and land at their times; the count ticks with each
   *   3.10 s  a card forms around the line         "Small moments, kept by day."
   *   3.60 s  Add my dog
   */
  F.def({id:'opening-value',section:'onboarding',name:'Opening · moments land on the day',flow:true,enter:'cut',seqHold:5600,intent:'One optional value beat under six seconds. The dog makes four moments; each lands on the day line at its time; the line becomes a dated card. Skip stays available until the button arrives.',build(ctx){
    B.frame(ctx);
    const moments=[{type:'poop',time:'07:40'},{type:'meal',time:'08:15'},{type:'pee',time:'13:05'},{type:'walk',time:'18:20'}];
    const dogArt=B.dogPortrait(120);
    const dog=h('div.v3-open-dog',{'data-shared':'dog'},dogArt);
    const src=h('span.v3-open-src',{'aria-hidden':'true'});
    const n=h('b','0'),unitWord=h('span',' moments');
    const line=B.dayLine(ctx,[],{now:'20:30',label:'An example day'});
    const cardBg=h('span.v3-open-card-bg',{'aria-hidden':'true'});
    const card=h('div.v3-open-card',cardBg,h('div.v3-open-card-head',h('strong','Wednesday · 14 October'),h('span',n,unitWord)),line);
    const stage=h('div.v3-open-stage',dog,src,card);
    const title=h('h1','Every walk.',h('br'),'Every meal.');
    const sub=h('p.bl-sub','An example day with a dog like yours.');
    const go=B.button(ctx,'Add my dog',()=>B.go(ctx,'dog-setup','carry'),{icon:'arrow-right'});
    const skip=B.link(ctx,'Skip',()=>B.go(ctx,'dog-setup','carry'));
    const actions=h('div.v3-open-actions',go);
    const open=h('div.v3-open',h('div.v3-open-top',h('span.v3-open-word',h('span',B.paw(16)),'BarkLog'),skip),stage,h('div.v3-open-words',title,sub),actions);
    ctx.root.append(open);
    const final=()=>{title.replaceChildren(F.rich('Small moments, kept by *day.*'));sub.textContent='A private journal on this phone. No account.';};
    if(F.reduced()){
      moments.forEach(m=>line.add(m));n.textContent='4';final();skip.style.visibility='hidden';return;
    }
    cardBg.style.opacity='0';go.style.opacity='0';go.inert=true;
    document.fonts.ready.then(()=>{
      if(ctx.dead)return;
      F.move(dog,{s:.8,o:0,y:14},{s:1,o:1,y:0},{duration:560,curve:'emph',delay:150,ctx,fill:'backwards'});
      F.titleIn(ctx,title,{delay:300});F.rise(ctx,sub,{delay:420});
      F.rise(ctx,card.querySelector('.v3-open-card-head'),{delay:640});
      F.move(line.querySelector('.dl-axis'),{o:0},{o:1},{duration:420,delay:700,curve:'strong',ctx,fill:'backwards'});
      line.reveal(700);
      moments.forEach((m,i)=>ctx.at(1300+i*420,()=>{
        const mark=line.add(m,{hidden:true});
        // The dog gives a little as each moment leaves it.
        F.move(dogArt,{sx:1,sy:1},{sx:1.04,sy:.95},{duration:90,curve:'strong',ctx,fill:'forwards'});
        ctx.at(92,()=>F.move(dogArt,{sx:1.04,sy:.95},{sx:1,sy:1},{spring:{response:.34,damping:.6},ctx,fill:'forwards'}));
        B.fly(ctx,src,mark,{duration:580,lift:34,haptic:'selection',onLand:()=>{F.roll(n,String(i+1));unitWord.textContent=i?' moments':' moment';}});
      }));
      ctx.at(3100,()=>{
        F.move(cardBg,{s:.94,o:0},{s:1,o:1},{duration:560,curve:'emph',ctx,fill:'forwards'});
        // Old words lift out, new words rise in: one element, one live animation at a time.
        const out1=F.titleOut(ctx,title),out2=F.move(sub,{o:1,y:0},{o:0,y:-6},{duration:200,curve:'exit',ctx,fill:'forwards'});
        ctx.at(240,()=>{out1?.cancel();out2?.cancel();final();F.titleIn(ctx,title);F.rise(ctx,sub,{delay:90});});
      });
      ctx.at(3600,()=>{
        go.style.opacity='';go.inert=false;F.rise(ctx,go,{distance:12,duration:520});
        const a=F.move(skip,{o:1},{o:0},{duration:200,curve:'exit',ctx,fill:'forwards'});(a?a.finished:Promise.resolve()).then(()=>{skip.style.visibility='hidden';},()=>{});
      });
    });
  }});

  F.def({id:'home-coach',section:'onboarding',name:'Coach mark · quick care',flow:true,enter:'carry',intent:'One skippable coach mark on the real Home screen. The dog and their name arrive from setup; the tip points at the first tile and then gets out of the way.',build(ctx){
    B.home(ctx,{empty:true});
    document.fonts.ready.then(()=>ctx.at(ctx.via==='carry'?900:260,()=>{const target=ctx.root.querySelector('.v3-care-grid');if(target)F.coach(ctx,target,{title:'Log care in one tap',text:'It records the time now. Add details only when they matter.',step:'One quick tip',next:'Start logging',skipTo:'home',radius:26,onNext:()=>B.go(ctx,'home')});}));
  }});
})();
