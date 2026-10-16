(() => {
  const N=window.NEXT,{F,B,h}=N;
  const def=(id,name,build)=>N.def({id,section:'next-onboarding',name,intent:name+' · owner-requested board proposal; example state only.',build});
  const pickScreen=(id,{name,title,sub,key,options,next,back,step,tiles=false})=>def(id,name,ctx=>{
    const s=N.state(ctx),body=N.frame(ctx,{back,step}),choices=h('div.'+(tiles?'n-tiles':'n-options'));
    const buttons=options.map(([value,detail,icon])=>N.choice(ctx,{title:value,sub:detail,icon,selected:s[key]===value,onPick:el=>{s[key]=value;N.syncDog(ctx);buttons.forEach(b=>N.setPicked(b,b===el));ctx.haptic('selection');ctx.at(F.reduced()?0:340,()=>N.advance(ctx,next));}}));
    choices.append(...buttons);body.append(N.head(title,sub),choices,h('p.n-note',N.icon('info',17),'You can change this later.'),N.foot());N.enter(ctx,body);
  });
  def('next-opening','A day becomes a story',ctx=>{
    const body=N.frame(ctx),title=N.head('Know the little things.','A journal for the dog you know best.'),dog=N.dog(ctx),stage=h('div.n-opening-stage',dog);
    const record=h('div.n-practice-record',B.paint(h('span.bl-event-icon',N.icon('footprints')), 'walk'),h('div',h('strong','Evening walk'),h('small','18:20 · 24 minutes')));
    const prompt=N.button(ctx,'Try logging a walk',()=>advance(),{icon:'plus'}),foot=N.foot(prompt,N.link(ctx,'Skip intro',()=>N.go(ctx,'next-dog')),N.link(ctx,'I already have an account',()=>{N.state(ctx).returning=true;N.go(ctx,'next-login');}));
    let beat=0;
    const advance=()=>{beat++;if(beat===1){stage.append(record);F.rise(ctx,record,{distance:24,duration:520});title.replaceWith(N.head('A moment, remembered.','Exact times. Your words. Ready when you need them.'));prompt.textContent='See what AI adds';B.celebrateDogCharacter(ctx,dog.querySelector('svg'));}
      else if(beat===2){F.swapText(ctx,record.querySelector('strong'),'What happened today?');record.querySelector('small').textContent='AI can turn your records into a short recap.';body.querySelector('.n-head').replaceWith(N.head('A clearer picture.','Free journaling. Optional AI with Premium.'));prompt.textContent='Meet my dog';}
      else N.go(ctx,'next-dog');};
    body.append(title,stage,foot);N.enter(ctx,body);
  });
  def('next-dog','Dog identity & photo',ctx=>{
    const s=N.state(ctx),body=N.frame(ctx,{back:'next-opening',step:1});
    const field=B.field(ctx,'Your dog’s name',(s.named||s.editing)?N.name(ctx):'',{placeholder:'Bruno',maximum:50});field.input.autocomplete='off';
    const identity=h('div.n-identity',N.dog(ctx,'small'),N.tag('Their own little journal','notebook-pen'));
    const photo=N.link(ctx,s.photo?'Change photo':'Add a photo',()=>N.picker(ctx,()=>{photo.textContent='Photo added · change';identity.replaceChildren(B.photo('Your selected example photo'));}));
    const error=h('p.n-error',{role:'alert'}),next=N.button(ctx,'Continue',()=>{const name=field.input.value.trim();if(!name){error.textContent='Give your dog a name to continue.';field.input.setAttribute('aria-invalid','true');field.input.focus();return;}ctx.answers.dog=name;if(!s.named&&!s.editing){ctx.answers.selectedDogId='next-dog';ctx.answers.dogs=[{id:'next-dog',name,detail:''}];ctx.answers.records=[];ctx.answers.freshJournal=true;}s.named=true;N.syncDog(ctx);N.advance(ctx,'next-stage');});
    body.append(N.head('Who’s your dog?','We’ll keep their care and conversations together.'),identity,field.el,photo,error,N.foot(next));N.enter(ctx,body);
  });
  pickScreen('next-stage',{name:'Life stage · four tiles',title:'What chapter are they in?',sub:'This shapes the journal and AI starter questions.',key:'stage',back:'next-dog',next:'next-age',step:2,tiles:true,options:[['Puppy','Still growing','paw-print'],['Adult','Finding their rhythm','sun'],['Senior','Familiar routines','heart'],['Not sure','That’s okay','help-circle']]});
  pickScreen('next-experience',{name:'Caregiver experience',title:'How new is dog care?',sub:'We’ll match the amount of guidance to you.',key:'experience',back:'next-breed',next:'next-goals',step:4,options:[['My first dog','Show me the basics','sprout'],['Some experience','A little guidance helps','paw-print'],['Dogs are my life','Keep it short and practical','heart']]});
  def('next-goals','Care priorities · multiple choices',ctx=>{
    const body=N.frame(ctx,{back:'next-experience',step:5}),multi=N.multi(ctx,{key:'goals',label:'Care priorities',options:[['Remember daily care','Logs & reminders','clock'],['Understand routines','Records & AI recaps','chart-no-axes-column-increasing'],['Prepare for vet visits','Notes & question lists','notebook-pen'],['Keep their memories','Photos & captions','image']]});
    body.append(N.head('What would help most?','Choose all that fit. We’ll keep each one.'),multi.el,N.foot(N.button(ctx,'Continue',()=>N.advance(ctx,'next-rhythm'))));N.enter(ctx,body);
  });
  def('next-rhythm','Routine · flexible days',ctx=>{
    const body=N.frame(ctx,{back:'next-goals',step:6}),multi=N.multi(ctx,{key:'rhythms',label:'Your routine',tiles:false,options:[['Morning & evening','Two familiar check-ins','sunrise'],['Little moments all day','Log as things happen','sun'],['Every day is different','Keep the schedule flexible','calendar']]});
    const marks=[[1,0,0,1],[1,1,1,1],[0,1,0,1]];multi.el.querySelectorAll('.n-choice-copy').forEach((copy,i)=>copy.append(h('span.n-rhythm',{'aria-hidden':'true'},marks[i].map(on=>h('i'+(on?'.on':''))))));
    body.append(N.head('How does your day go?','Pick more than one if your week varies.'),multi.el,N.foot(N.button(ctx,'Continue',()=>N.advance(ctx,'next-focus'))));N.enter(ctx,body);
  });
  def('next-focus','AI topics · multiple choices',ctx=>{
    const body=N.frame(ctx,{back:'next-rhythm',step:7}),multi=N.multi(ctx,{key:'focuses',label:'AI topics',options:[['Daily routines','See the day together','clock'],['Walks & activity','Review recorded walks','footprints'],['Food & care notes','Keep details together','utensils'],['Questions for the vet','Prepare what to ask','notebook-pen'],['Training & play','Remember what they enjoy','graduation-cap'],['Memories & milestones','Keep the little things','image']]});
    body.append(N.head('What are you curious about?','Choose every topic you’d like to come back to.'),multi.el,N.foot(N.button(ctx,'Continue',()=>N.advance(ctx,'next-personality'))));N.enter(ctx,body);
  });
  def('next-reminder','A reminder that fits',ctx=>{
    const s=N.state(ctx),body=N.frame(ctx,{back:'next-care-notes',step:8}),days=h('div.n-week',{'role':'group','aria-label':'Reminder days'});
    ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].forEach(day=>{const b=B.press(ctx,h('button.n-day',{type:'button','aria-pressed':String(s.days.includes(day))},day),()=>{s.days=s.days.includes(day)?s.days.filter(d=>d!==day):[...s.days,day];b.setAttribute('aria-pressed',String(s.days.includes(day)));ctx.haptic('selection');});days.append(b);});
    const time=B.field(ctx,'Check-in time',s.time);time.input.type='time';ctx.on(time.input,'change',()=>s.time=time.input.value);
    body.append(N.head('A little nudge?',`Set a check-in for ${N.name(ctx)}. It stays off until you allow it.`),N.dog(ctx,'small'),h('span.bl-label','On these days'),days,time.el,h('p.n-note',N.icon('bell',18),'No reminders are on yet. Choose access on the next screen.'),N.foot(N.button(ctx,'Choose access',()=>N.go(ctx,'next-permissions')),N.link(ctx,'Not now',()=>{s.remindersEnabled=false;N.go(ctx,'next-context-review');})));N.enter(ctx,body);
  });
  def('next-practice','One-tap logging · practice only',ctx=>{
    const body=N.frame(ctx,{back:'next-context-review',step:10}),dog=N.dog(ctx,'small'),status=h('p.n-note',{role:'status'},'Try it once. This won’t become a saved record.'),stage=h('div.n-opening-stage',dog),next=N.button(ctx,'See AI in action',()=>N.go(ctx,'next-ai-demo'));
    const tile=N.button(ctx,'Log a walk',()=>{tile.disabled=true;const record=h('div.n-practice-record',B.paint(h('span.bl-event-icon',N.icon('footprints')),'walk'),h('div',h('strong','Walk · just now'),h('small',N.name(ctx)+'’s practice record')),N.icon('check'));stage.append(record);F.rise(ctx,record,{distance:18,duration:460});status.textContent='That’s a care moment. Real records stay on your phone.';B.celebrateDogCharacter(ctx,dog.querySelector('svg'));ctx.haptic('success');},{icon:'plus'});
    body.append(N.head('One tap. A little less to remember.','Time and type now. A note whenever you need one.'),stage,tile,status,N.foot(next));N.enter(ctx,body);
  });
  def('next-ai-demo','AI value · grounded sample',ctx=>{
    const body=N.frame(ctx,{back:'next-practice'}),question=N.state(ctx).focus==='Walks & activity'?'When was the last walk?':'What did today look like?';
    const answer=h('div.n-assistant',h('div.n-assistant-mark',B.paw(18),'BarkLog AI'),h('p',N.name(ctx)+' has 7 recorded care moments in this example day. The last walk was at 18:20 and lasted 24 minutes.'),h('p.bl-caption','This describes the records, not your dog’s health.'));
    body.append(N.tag('Premium · example conversation','message-circle'),N.head('Your records, in plain words.','Ask a question. See the moments behind the answer.'),h('div.n-user-message',question),answer,N.button(ctx,'See the 7 example records',()=>N.modal(ctx,{title:'Example day · 14 October',body:B.example.map(e=>B.row(ctx,e,false)),actions:close=>[N.button(ctx,'Close',close)]}),{secondary:true}),N.foot(N.button(ctx,'Make it ours',()=>N.go(ctx,N.state(ctx).account?'next-plan':'next-login')),h('p.bl-caption','The journal is free. AI is an optional paid feature.')));N.enter(ctx,body);
  });
  B.seq('next-onboarding',N.onboardingOrder);
})();
