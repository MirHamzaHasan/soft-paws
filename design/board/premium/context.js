/* Useful dog context and tactile controls for the owner's light-theme refinement. */
(() => {
  const N=window.NEXT,{F,B,h}=N,baseState=N.state;
  N.onboardingOrder=['next-opening','next-dog','next-stage','next-age','next-breed','next-sex','next-size','next-experience','next-goals','next-rhythm','next-focus','next-personality','next-activities','next-food','next-care-notes','next-reminder','next-permissions','next-context-review','next-practice','next-ai-demo'];
  N.state=ctx=>{const s=baseState(ctx);s.breeds??=[s.breed||'Mixed breed'];s.focuses??=[s.focus||'Daily routines'];s.rhythms??=[s.rhythm||'Morning & evening'];s.personality??=[];s.activities??=[];s.diet??=[];s.ageMode??='estimate';s.sex??='Not specified';s.neutered??='Not specified';s.size??='Not specified';s.weightUnit??='kg';s.profileContext??=false;return s;};
  N.syncLabels=ctx=>{const s=N.state(ctx);s.breed=s.breeds.join(' × ')||'Not specified';s.focus=s.focuses[0]||'Daily routines';s.rhythm=s.rhythms.join(' · ')||'No preference';N.syncDog(ctx);};
  N.advance=(ctx,to)=>{N.syncLabels(ctx);const s=N.state(ctx);if(s.returnToReview){s.returnToReview=false;N.go(ctx,'next-context-review');}else N.go(ctx,to);};
  const oldTop=N.top;
  N.top=(ctx,back,step)=>{
    if(step===undefined)return oldTop(ctx,back,step);
    const index=N.onboardingOrder.indexOf(ctx.screen.id),total=N.onboardingOrder.length-1,target=index>0?index:step,s=N.state(ctx),from=ctx.mode==='flow'?(s.progressStep??target):target;
    const top=oldTop(ctx,back,1),bar=top.querySelector('.n-progress'),fill=bar.firstElementChild;
    bar.setAttribute('aria-valuemax',String(total));bar.setAttribute('aria-valuenow',String(target));fill.style.transform=`scaleX(${target/total})`;
    if(ctx.mode==='flow')s.progressStep=target;
    if(!F.reduced())F.move(fill,{sx:from/total,sy:1},{sx:target/total,sy:1},{duration:460,curve:'emph',ctx,fill:'forwards'});
    return top;
  };
  const oldChoice=N.choice;
  N.choice=(ctx,o)=>{const el=oldChoice(ctx,o);el._choiceCtx=ctx;ctx.on(el,'pointerdown',e=>{const r=el.getBoundingClientRect();el._tapX=(e.clientX-r.x)/r.width*el.offsetWidth;el._tapY=(e.clientY-r.y)/r.height*el.offsetHeight;});return el;};
  N.setPicked=(el,on)=>{const was=el.getAttribute('aria-pressed')==='true',ctx=el._choiceCtx;if(was===on)return;el.setAttribute('aria-pressed',String(on));const c=el.querySelector('.n-choice-check');c._pickMotion?.cancel();c.replaceChildren(...(on?[N.icon('check',17)]:[]));if(was!==on&&ctx)F.bloom(ctx,el,!on);if(on&&!was&&!F.reduced()&&ctx)c._pickMotion=F.move(c,{s:.55},{s:1},{spring:{response:.36,damping:.62},ctx,fill:'none'});};
  N.segment=(ctx,label,values,initial,onChange)=>{
    let value=initial;const thumb=h('span.n-segment-thumb',{'aria-hidden':'true'}),el=h('div.n-segment',{role:'group','aria-label':label,style:{'--segment-count':values.length}},thumb);let motion;
    const buttons=values.map(([key,text])=>B.press(ctx,h('button',{type:'button','aria-pressed':String(value===key)},text),()=>{if(value===key)return;value=key;paint(true);ctx.haptic('selection');onChange(key);},.86,true));
    const paint=animate=>{const i=Math.max(0,values.findIndex(([key])=>key===value)),x=i*(el.clientWidth-8)/values.length;buttons.forEach((b,j)=>b.setAttribute('aria-pressed',String(i===j)));const from=getComputedStyle(thumb).transform==='none'?0:new DOMMatrix(getComputedStyle(thumb).transform).m41;motion?.cancel();thumb.style.transform=`translateX(${x}px)`;if(animate&&!F.reduced())motion=F.move(thumb,{x:from},{x},{spring:{response:.38,damping:.78},ctx,fill:'forwards'});};
    el.append(...buttons);document.fonts.ready.then(()=>requestAnimationFrame(()=>{if(!ctx.dead)paint(false);}));return el;
  };
  N.selectionTray=(ctx,getValues,onRemove)=>{
    const count=h('strong','0'),chips=h('div.n-selected-chips'),el=h('div.n-selection-tray',h('div.n-selected-heading',count,h('span','selected')),chips);let previous=[];
    const render=()=>{const values=getValues();F.roll(count,String(values.length));chips.replaceChildren(...(values.length?values.map(value=>{const b=B.press(ctx,h('button.n-selected-chip',{type:'button','aria-label':'Remove '+value},value,N.icon('x',14)),()=>{onRemove(value);render();},.86,true);if(!previous.includes(value)&&!F.reduced())F.move(b,{y:6,s:.88,o:0},{y:0,s:1,o:1},{duration:360,curve:'emph',ctx,fill:'backwards'});return b;}):[h('span.bl-caption','Choose what fits. You can change it later.')]));previous=[...values];};render();return {el,render};
  };
  N.multi=(ctx,{key,label,options,tiles=true,none})=>{
    const s=N.state(ctx),list=h('div.'+(tiles?'n-tiles':'n-options'),{role:'group','aria-label':label});s[key]??=[];const buttons=[];
    const tray=N.selectionTray(ctx,()=>s[key],value=>{s[key]=s[key].filter(x=>x!==value);sync();N.syncLabels(ctx);});
    const sync=()=>buttons.forEach(({value,b})=>N.setPicked(b,s[key].includes(value)));
    options.forEach(([value,sub,icon])=>{const b=N.choice(ctx,{title:value,sub,icon,selected:s[key].includes(value),onPick:el=>{if(s[key].includes(value))s[key]=s[key].filter(x=>x!==value);else s[key]=none&&value===none?[none]:[...s[key].filter(x=>x!==none),value];sync();tray.render();N.syncLabels(ctx);ctx.haptic('selection');}});buttons.push({value,b});list.append(b);});
    return {el:h('div.n-multi',tray.el,list),refresh:()=>{sync();tray.render();}};
  };
  N.switch=(ctx,{label,on=false,onToggle})=>{
    const face=h('span.n-switch-face'),knob=h('span.n-switch-thumb',face),track=h('span.n-switch-track',knob),button=B.press(ctx,h('button.n-switch',{type:'button',role:'switch','aria-label':label,'aria-checked':String(on)},track),()=>onToggle(),.86,true);let motion;
    const set=(checked,{pending=false,animate=true}={})=>{const changed=button.getAttribute('aria-checked')!==String(checked);button.setAttribute('aria-checked',String(checked));button.setAttribute('aria-busy',String(pending));button.classList.toggle('is-on',checked);button.classList.toggle('is-pending',pending);const from=getComputedStyle(knob).transform==='none'?0:new DOMMatrix(getComputedStyle(knob).transform).m41;motion?.cancel();knob.style.transform=`translateX(${checked?20:0}px)`;face.replaceChildren(...(checked?[N.icon('check',14)]:[]));if(animate&&changed&&!F.reduced()){motion=F.move(knob,{x:from},{x:checked?20:0},{spring:{response:.32,damping:.7},ctx,fill:'forwards'});ctx.track(face.animate([{transform:'scale(1,1)'},{transform:'scale(1.12,.893)',offset:.45},{transform:'scale(1,1)'}],{duration:380*F.k(),easing:F.css('emph')}));}};
    set(on,{animate:false});return {button,set};
  };
  N.ageLabel=s=>{
    if(s.birthDate){const d=new Date(s.birthDate+'T00:00:00Z');return Number.isFinite(d.getTime())&&d.toISOString().slice(0,10)===s.birthDate&&s.birthDate<='2026-10-16'?'Born '+s.birthDate:null;}
    const hasYear=s.ageYears!=null&&String(s.ageYears).trim()!=='',hasMonths=s.ageMonths!=null&&String(s.ageMonths).trim()!=='';
    if(!hasYear&&!hasMonths)return null;
    const years=Number(s.ageYears||0),months=Number(s.ageMonths||0);if(!Number.isInteger(years)||years<0||years>40||!Number.isInteger(months)||months<0||months>11)return null;
    return ([years?`${years} years`:null,months?`${months} months`:null].filter(Boolean).join(', ')||'0 months')+' (estimate)';
  };
  N.profileSnapshot=ctx=>{const s=N.state(ctx);return structuredClone({name:N.name(ctx),stage:s.stage,age:N.ageLabel(s),breeds:s.breeds,sex:s.sex,neutered:s.neutered,size:s.size,weight:s.weightValue?`${s.weightValue} ${s.weightUnit}`:null,personality:s.personality,activities:s.activities,diet:s.diet,allergies:s.allergies||'',conditions:s.conditions||'',medications:s.medications||'',careNotes:s.careNotes||'',goals:s.goals,focuses:s.focuses,rhythms:s.rhythms,experience:s.experience});};
  N.profileRows=p=>[
    ['Name',p.name,'next-dog'],['Life stage',p.stage,'next-stage'],['Age',p.age,'next-age'],['Breed or mix',(p.breeds||[]).join(' × '),'next-breed'],['Sex',p.sex,'next-sex'],['Neutered / spayed',p.neutered,'next-sex'],['Size',p.size,'next-size'],['Recorded weight',p.weight,'next-size'],['Personality',(p.personality||[]).join(' · '),'next-personality'],['Favorite activities',(p.activities||[]).join(' · '),'next-activities'],['Food',(p.diet||[]).join(' · '),'next-food'],['Allergies / sensitivities',p.allergies,'next-food'],['Known conditions',p.conditions,'next-care-notes'],['Medications / care instructions',p.medications,'next-care-notes'],['Other care notes',p.careNotes,'next-care-notes'],['Your experience',p.experience,'next-experience'],['Care priorities',(p.goals||[]).join(' · '),'next-goals'],['Your routine',(p.rhythms||[]).join(' · '),'next-rhythm'],['AI topics',(p.focuses||[]).join(' · '),'next-focus'],
  ].filter(([,v])=>v&&v!=='Not specified');
  N.profileView=(ctx,{snapshot=N.profileSnapshot(ctx),edit=false}={})=>h('div.n-plan',...N.profileRows(snapshot).map(([label,value,route])=>h('div.n-plan-row',h('div',h('small',label),h('strong.n-context-value',String(value))),edit?B.press(ctx,h('button.n-icon',{type:'button','aria-label':'Edit '+label},N.icon('pencil',17)),()=>{N.state(ctx).returnToReview=true;if(ctx.screen.id==='next-dog-profile')N.state(ctx).editing=true;N.go(ctx,route);},.86,true):null)));
})();
