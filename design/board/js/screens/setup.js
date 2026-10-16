(() => {
  const F=window.F,B=window.B,h=F.h;
  B.seq('setup',['dog-setup','home']);
  F.def({id:'dog-setup',section:'setup',name:'First dog · the name becomes the journal',flow:true,enter:'carry',intent:'O1 v3. Name-only setup. The dog carries in from the opening; as a name is typed the heading becomes “Meet Luna.” and the action names their journal. No account, no extended onboarding, honest local/legacy limits.',build(ctx){
    const body=B.frame(ctx),name=B.field(ctx,"Dog’s name",'',{placeholder:'e.g. Bruno',maximum:80});
    const heading=B.heading('Meet your *dog.*','Their name is all BarkLog needs.',{shared:'dog-name'});
    const title=heading.querySelector('h1');
    body.append(h('span.v3-setup-dog',{'data-shared':'dog'},B.dogPortrait(96)),heading);
    const label=h('span','Start journal');
    const action=B.press(ctx,h('button.bl-btn',{type:'button',disabled:true},label,F.icon('arrow-right',{size:18})),()=>{
      const value=name.input.value.trim();if(!value||/[\u0000-\u001f]/.test(value))return;
      ctx.haptic('medium');ctx.answers.dog=value;ctx.answers.records=[];B.go(ctx,'home-coach','carry');
    });
    let shown='',timer=null;
    const sync=()=>{
      const value=name.input.value.trim(),ok=!!value&&!/[\u0000-\u001f]/.test(value);
      action.disabled=!ok;
      clearTimeout(timer);
      // Words change as words, once the typing pauses: never a re-render per keystroke.
      timer=setTimeout(()=>{
        const next=ok?value.slice(0,24):'';if(next===shown||ctx.dead)return;shown=next;
        F.swapText(ctx,title,next?`Meet *${next}.*`:'Meet your *dog.*');
        label.textContent=next?`Start ${next}’s journal`:'Start journal';
        if(!F.reduced())F.move(label,{o:0,y:6},{o:1,y:0},{duration:320,curve:'strong',ctx});
      },320*F.k());
    };
    ctx.on(name.input,'input',sync);
    ctx.on(name.input,'keydown',e=>{if(e.key==='Enter'&&!action.disabled){e.preventDefault();action.click();}});
    body.append(name.el,action,
      h('div.v3-promise',h('p',F.icon('circle-check',{size:16}),'No account or subscription.'),h('p',F.icon('circle-check',{size:16}),'Records stay on this phone, even offline.')),
      h('p.bl-caption.bl-migration','This new journal does not import records from the previous app. Existing old files are left untouched.'));
    B.enter(ctx,body);
    if(ctx.mode!=='flow'&&!F.reduced())ctx.at(1300,()=>{name.input.value='Luna';sync();});
  }});
})();
