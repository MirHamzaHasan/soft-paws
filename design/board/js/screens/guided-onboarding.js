/* Design 05. Optional depth, not a longer gate. State stays in the preview session. */
(() => {
  'use strict';
  const F=window.F,B=window.B,h=F.h;
  const screen=id=>F.SCREENS.find(s=>s.id===id);
  const name=ctx=>ctx.answers.dog||'Bruno';
  const state=ctx=>ctx.answers.onboarding||(ctx.answers.onboarding={shortcuts:[]});
  const shortcuts=[['Medication','pill','medication','medication-list'],['Training','graduation-cap','training','training-catalog'],['Photos','image','photo','photo-journal'],['Care tasks','calendar','walk','care-calendar']];
  const saveDog=ctx=>{
    const p=state(ctx),id=ctx.answers.selectedDogId||'first-dog';
    const detail=[p.breed,p.age?`${p.age} · age estimate`:null].filter(Boolean).join(' · ')||'Details optional';
    ctx.answers.dogs=[{id,name:name(ctx),detail,breed:p.breed||'',age:p.age||'',samplePhoto:!!p.photo}];
    ctx.answers.selectedDogId=id;ctx.answers.records=[];ctx.answers.freshJournal=true;
  };
  const goHome=ctx=>{saveDog(ctx);B.go(ctx,'home-coach','carry');};
  const nav=(ctx,back,progress)=>h('div.guide-nav',B.back(ctx,back),h('div.guide-track',{'aria-hidden':'true','data-shared':'guide-progress'},h('i',{style:{width:progress+'%'}})),B.link(ctx,'Skip setup',()=>goHome(ctx)));
  const frame=(ctx,{back='onboarding-route',progress=12,title,sub}={})=>{
    const body=B.frame(ctx);ctx.root.classList.add('guide');
    body.append(nav(ctx,back,progress));
    if(title)body.append(B.heading(title,sub));return body;
  };
  B.sampleAvatar=(size=92)=>h('span.guide-avatar-sample',{style:{width:size+'px',height:size+'px'}},B.photo('Selected local sample · not a device photo','one'));
  const hero=ctx=>{
    const art=B.dogCharacter();
    art.setAttribute('viewBox','24 4 144 180');
    const dog=B.press(ctx,h('button.guide-character',{type:'button','data-shared':'dog','aria-label':`Say hello to ${name(ctx)}`},art),()=>B.greetDogCharacter(ctx,art),.86);
    const card=h('div.guide-hero',h('div.guide-hero-label',h('strong',{'data-shared':'dog-name'},name(ctx)),h('span','A local journal')),dog);
    document.fonts.ready.then(()=>requestAnimationFrame(()=>B.animateDogCharacter(ctx,art,{carried:ctx.via==='carry'})));
    return card;
  };
  const option=(ctx,{label,sub,key='walk',icon,selected=false,onTap})=>{
    const el=h('button.guide-option',{type:'button','aria-pressed':String(selected)},B.paint(h('span.v4-log-mark',F.icon(icon||B.type(key).icon,{size:23})),key),h('span.guide-option-copy',h('strong',label),sub?h('small',sub):null),h('span.guide-option-check',F.icon('check',{size:13})));
    return B.press(ctx,el,onTap,.86);
  };
  const define=(id,title,build,intent)=>F.def({id,section:'onboarding',name:title,flow:true,enter:'carry',intent:intent||'Optional guided setup. Skip is always available. Values are reused in the real preview surfaces; no account or permission gate.',build});

  // Keep the name-only route and the existing direct fast-start control.
  const setup=screen('dog-setup'),originalSetup=setup.build;
  setup.build=ctx=>{
    originalSetup(ctx);const body=ctx.root.querySelector('.bl-stack'),input=body.querySelector('input'),start=body.querySelector('button.bl-btn');
    const personalize=B.button(ctx,'Make it yours · optional',()=>{
      const value=input.value.trim();if(!value||/[\u0000-\u001f]/.test(value))return;
      ctx.answers.dog=value;saveDog(ctx);B.go(ctx,'onboarding-route','carry');
    },{secondary:true,icon:'settings-2',disabled:true});
    start.after(personalize);
    ctx.on(input,'input',()=>personalize.disabled=!input.value.trim());
    // The original start action remains fast; ensure Profile contains the typed dog as well.
    ctx.on(start,'click',()=>{if(!start.disabled){ctx.answers.dog=input.value.trim();saveDog(ctx);}});
  };

  define('onboarding-route','First run · quick or guided',ctx=>{
    const body=frame(ctx,{back:'dog-setup',progress:5});body.append(hero(ctx),B.heading(`A journal for *${name(ctx)}.*`,'Start now, or try a short hands-on setup.'),B.button(ctx,'Show me around',()=>B.go(ctx,'onboarding-identity','push'),{icon:'arrow-right'}),B.button(ctx,'Start logging now',()=>goHome(ctx),{secondary:true}),h('p.bl-caption','Everything here is optional. You can change it later in Profile.'));B.enter(ctx,body);
  });
  define('onboarding-identity','Identity · optional sample photo',ctx=>{
    const p=state(ctx),body=frame(ctx,{back:'onboarding-route',progress:15,title:`Make it *${name(ctx)}’s.*`,sub:'Add a photo, or keep the illustrated dog.'});
    const preview=h('div.guide-photo'),draw=()=>preview.replaceChildren(p.photo?B.photo('Selected local sample · not your device photo','one'):h('div.guide-identity',h('span.guide-dog',{'data-shared':'dog'},B.dogPortrait(86)),h('div.bl-tight',h('h2',{'data-shared':'dog-name'},name(ctx)),h('p.bl-caption','Illustration · no photo needed'))));draw();
    body.append(preview,B.button(ctx,p.photo?'Change sample photo':'Choose a photo',()=>B.sheet(ctx,{title:'Choose a dog photo',text:'Production opens the system photo picker. The board can use a clearly labeled local sample; it never reads your library.',content:B.photo('Local sample photo','one'),action:'Use local sample',onAction:()=>{p.photo=true;draw();}}),{secondary:true,icon:'image'}),B.button(ctx,'Continue',()=>B.go(ctx,'onboarding-breed','carry')),
      B.link(ctx,'Keep illustration',()=>{p.photo=false;B.go(ctx,'onboarding-breed','carry');}),h('p.bl-caption','No upload or photo analysis. No permission is requested by this preview.'));body.insertBefore(preview,body.children[1]);B.enter(ctx,body);
  });
  define('onboarding-breed','Identity · optional breed tiles',ctx=>{
    const p=state(ctx),body=frame(ctx,{back:'onboarding-identity',progress:25,title:'What’s the *mix?*',sub:'A profile detail, not a care recommendation.'}),grid=h('div.guide-breeds',{role:'group','aria-label':'Breed or mix'});
    const choices=['Mixed breed','Labrador','Terrier','Not sure'];let locked=false;
    choices.forEach((label,i)=>{const art=B.dogPortrait(65,i===2?'luna':'bruno');art.setAttribute('aria-hidden','true');const b=B.press(ctx,h('button.guide-breed',{type:'button','aria-pressed':String(p.breed===label)},art,h('span',label)),()=>{if(locked)return;locked=true;p.breed=label;grid.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));ctx.haptic('selection');ctx.at(340,()=>B.go(ctx,'onboarding-age','carry'));});grid.append(b);});body.append(grid,B.link(ctx,'Add breed later',()=>B.go(ctx,'onboarding-age','carry')),h('p.bl-caption','These are quick examples. Any breed or mix can be entered later in Profile.'));B.enter(ctx,body);
  });
  define('onboarding-age','Identity · optional age estimate',ctx=>{
    const p=state(ctx),body=frame(ctx,{back:'onboarding-breed',progress:35,title:`About how old is *${name(ctx)}?*`,sub:'An estimate is fine. Leave it blank if unknown.'}),list=h('div.guide-options');let locked=false;
    ['Under 1 year','1–3 years','4–7 years','8 years or older'].forEach((label,i)=>{const b=option(ctx,{label,sub:['Puppy','Young adult','Adult','Older dog'][i],key:['meal','walk','photo','mood'][i],selected:p.age===label,onTap:()=>{if(locked)return;locked=true;p.age=label;b.setAttribute('aria-pressed','true');ctx.at(340,()=>B.go(ctx,'onboarding-shortcuts','carry'));}});list.append(b);});body.append(list,B.link(ctx,'I’m not sure',()=>{p.age='';B.go(ctx,'onboarding-shortcuts','carry');}));B.enter(ctx,body);
  });
  define('onboarding-shortcuts','Preferences · two useful shortcuts',ctx=>{
    const p=state(ctx);p.shortcuts||=[];const body=frame(ctx,{back:'onboarding-age',progress:45,title:'Keep a little *closer.*',sub:'Pick up to two shortcuts for Home.'}),list=h('div.guide-options');
    shortcuts.forEach(([label,icon,key,to])=>{const b=option(ctx,{label,sub:{Medication:'Plans and recorded administrations',Training:'Short, reward-based sessions',Photos:'A local journal of small moments','Care tasks':'An agenda with optional reminders'}[label],key,icon,selected:p.shortcuts.includes(label),onTap:()=>{
      const on=p.shortcuts.includes(label);if(!on&&p.shortcuts.length===2)return B.toast(ctx,'Choose up to two. Tap a selected shortcut to change it.');
      p.shortcuts=on?p.shortcuts.filter(x=>x!==label):[...p.shortcuts,label];b.setAttribute('aria-pressed',String(!on));ctx.haptic('selection');
      const check=b.querySelector('.guide-option-check');F.move(check,{s:.82},{s:1},{spring:{response:.30,damping:.86},ctx});
    }});list.append(b);});body.append(list,B.button(ctx,'Continue',()=>B.go(ctx,'onboarding-practice','carry')),h('p.bl-caption','Poop, Pee, Meal and Walk always stay available. No reminders are enabled here.'));B.enter(ctx,body);
  });
  define('onboarding-practice','Practice · a tap becomes a dated record',ctx=>{
    const p=state(ctx),body=frame(ctx,{back:'onboarding-shortcuts',progress:58,title:'Try one little *log.*',sub:'Practice only. It won’t enter your journal.'}),line=B.dayLine(ctx,p.practiced?[{type:'walk',time:'18:20'}]:[],{now:'20:30',label:'Practice day, 14 October 2026'}),mark=B.logMark('walk',33),status=h('p.bl-caption',{role:'status'},p.practiced?'Practice walk · 18:20':'One tap keeps the time.');
    mark.dataset.shared='practice-record';const next=B.button(ctx,'Add a note',()=>B.go(ctx,'onboarding-notes','carry'),{disabled:!p.practiced,icon:'pencil'});
    const tap=B.button(ctx,p.practiced?'Practice walk logged':'Log a practice walk',()=>{
      if(p.practiced)return;p.practiced=true;tap.disabled=true;tap.textContent='Practice walk logged';
      const target=line.add({type:'walk',time:'18:20'},{hidden:true});
      B.fly(ctx,mark,target,{duration:580,lift:30,onLand:()=>{status.textContent='Practice walk · 18:20. The time is kept.';next.disabled=false;ctx.haptic('selection');}});
    },{secondary:true,icon:'footprints',disabled:!!p.practiced});
    body.append(h('div.guide-practice',h('div.bl-head',h('h2','14 October'),h('span.bl-caption','Practice')),mark,line,status,tap),next,B.link(ctx,'Skip practice',()=>B.go(ctx,'onboarding-storage','carry')));B.enter(ctx,body);
  });
  define('onboarding-notes','Practice · write a real note',ctx=>{
    const p=state(ctx),body=frame(ctx,{back:'onboarding-practice',progress:68,title:'Keep what you *noticed.*',sub:'A short note is often the useful part.'}),note=B.field(ctx,'Practice note',p.note||'',{multiline:true,maximum:2000,placeholder:'e.g. Took the shaded route. Stopped for water.'}),count=h('span.bl-caption',`${note.input.value.length} / 2,000`),mark=B.logMark('walk',25);mark.dataset.shared='practice-record';
    ctx.on(note.input,'input',()=>{p.note=note.input.value;count.textContent=`${p.note.length} / 2,000`;});
    body.append(h('div.guide-record-top',mark,h('div.bl-tight',h('h2','Walk · 18:20'),h('p.bl-caption','14 October 2026 · practice only'))),h('div.guide-notes.bl-tight',note.el,count),B.button(ctx,'Preview in Timeline',()=>B.go(ctx,'onboarding-timeline','carry'),{icon:'arrow-right'}),h('p.bl-caption','Notes are optional on every real log. You can edit the saved record later.'));B.enter(ctx,body);
  });
  define('onboarding-timeline','Practice · the note arrives in Timeline',ctx=>{
    const p=state(ctx),body=frame(ctx,{back:'onboarding-notes',progress:78,title:'One day, *together.*',sub:'Your time and note stay with the record.'}),record={type:'walk',time:'18:20',note:p.note||'Practice walk · no note added'},row=B.row(ctx,record,false);row.icon.dataset.shared='practice-record';
    body.append(h('div.guide-record',h('div.guide-record-top',h('strong','Wednesday · 14 October'),h('span.bl-caption','Practice')),row,h('p.guide-note-paper',p.note||'No note added. You can add one later.')),B.status('info','This was a practice record','Your actual journal will start empty.','notebook-pen'),B.button(ctx,'Continue',()=>B.go(ctx,'onboarding-storage','carry')));B.enter(ctx,body);
  });
  define('onboarding-storage','Local storage · an honest boundary',ctx=>{
    const body=frame(ctx,{back:state(ctx).practiced?'onboarding-timeline':'onboarding-shortcuts',progress:88,title:'Their journal. This *phone.*',sub:'No account, subscription or cloud sync.'});
    body.append(h('div.guide-storage',h('div.guide-file',{'data-shared':'local-journal'},B.paw(34),h('small',name(ctx))),h('span',F.icon('smartphone',{size:25}),'  Saved locally')),
      h('div.guide-facts',h('div.guide-fact',F.icon('wifi-off',{size:20}),h('div',h('strong','Log care offline'),'No connection or sign-in is needed.')),h('div.guide-fact',F.icon('file-down',{size:20}),h('div',h('strong','Export a copy when you need it'),'CSV and PDF export are free. Nothing is uploaded by BarkLog.')),h('div.guide-fact',F.icon('info',{size:20}),h('div',h('strong','Keep your own copy'),'Removing the app or its data can remove the journal. There is no cloud backup.'))),B.button(ctx,'Open our journal',()=>{saveDog(ctx);B.go(ctx,'onboarding-ready','carry');},{icon:'arrow-right'}));B.enter(ctx,body);
  });
  define('onboarding-ready','Ready · your choices become Home',ctx=>{
    const p=state(ctx),body=frame(ctx,{back:'onboarding-storage',progress:100});
    body.append(hero(ctx),B.heading(`${name(ctx)}’s journal is *ready.*`,'Your first real care record starts here.'),h('div.guide-ready-values',p.breed?h('span',p.breed):null,p.age?h('span',p.age):null,h('span','0 saved logs'),h('span','Local only')),...(p.shortcuts.length?[B.card(h('h2','Your Home shortcuts'),h('p.bl-sub',p.shortcuts.join(' · ')))]:[]),B.button(ctx,'Go to Home',()=>B.go(ctx,'home-coach','carry'),{icon:'arrow-right'}),h('p.bl-caption','Practice records were not saved. You can change dog details and shortcuts later.'));B.enter(ctx,body);
  });

  // Preferences arrive on a useful surface rather than staying in the onboarding demo.
  const originalHome=B.home;
  B.home=(ctx,o={})=>{
    originalHome(ctx,o);const p=ctx.answers.onboarding;if(!p?.shortcuts?.length)return;
    const links=h('div'),box=h('section.guide-home-shortcuts',{'aria-label':'Your shortcuts'},h('h2','Your shortcuts'),links);
    p.shortcuts.forEach(label=>{const s=shortcuts.find(x=>x[0]===label);if(s)links.append(B.press(ctx,h('button',{type:'button'},F.icon(s[1],{size:18}),label),()=>B.go(ctx,s[3])));});
    const body=ctx.root.querySelector('.bl-stack'),create=body.querySelector('.v4-create-action');if(create)create.after(box);else body.append(box);
  };
  screen('seq-onboarding').seq=['opening-value','dog-setup','onboarding-route','onboarding-identity','onboarding-breed','onboarding-age','onboarding-shortcuts','onboarding-practice','onboarding-notes','onboarding-timeline','onboarding-storage','onboarding-ready','home-coach'];
})();
