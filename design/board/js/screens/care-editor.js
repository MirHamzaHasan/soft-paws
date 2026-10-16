/* Design 04: detailed logging. Overrides board renderers, never native source. */
(() => {
  'use strict';
  const F=window.F,B=window.B,h=F.h;
  const groups=[['The everyday things',['poop','pee','meal','walk']],['What you noticed',['symptom','mood','behavior']],['A little extra care',['grooming','weight']]];
  const library=F.SCREENS.find(s=>s.id==='log-chooser');
  Object.assign(library,{name:'Create a log · nine ways to remember',enter:'cover',intent:'Care library with nine informative editors. Notes belong to every log.',build(ctx){
    const body=B.frame(ctx);body.classList.add('v4-log-library');
    body.append(h('div.bl-head',B.back(ctx),B.dogChip(ctx)),h('div.bl-tight',h('span.v4-eyebrow','KEEP THE LITTLE DETAILS'),B.heading('Create a *log.*','A quick observation, a proper note, or both.',{display:true})));
    const scope='-'+(ctx.answers.selectedDogId||'bruno')+'-';
    const draft=Object.entries(ctx.answers.logDrafts||{}).find(([k,d])=>k.includes(scope)&&d.dirty);
    if(draft)body.append(B.press(ctx,h('button.v4-draft-banner',{type:'button'},F.icon('notebook-pen',{size:22}),h('span',h('strong',B.type(draft[1].type).label+' draft'),h('small','Your note and choices are still here.')),F.icon('arrow-right',{size:18})),()=>B.go(ctx,'form-'+draft[1].type),.86,true));
    groups.forEach(([title,keys])=>{
      const grid=h('div.v4-log-grid');
      keys.forEach(key=>{const info=B.logInfo[key];const tile=B.paint(h('button.v4-log-tile',{type:'button','aria-label':`Create ${info.title} log with observations and notes`},B.logMark(key,29),h('span.v4-log-tile-title',info.title),h('span.v4-log-tile-caption',info.sub),h('span.v4-tile-arrow',F.icon('arrow-up-right',{size:19}))),key);
        B.press(ctx,tile,()=>{ctx.root.querySelectorAll('[data-shared="log-mark"]').forEach(x=>x.removeAttribute('data-shared'));tile.firstChild.dataset.shared='log-mark';B.go(ctx,'form-'+key,'carry');},.86);grid.append(tile);
      });body.append(h('section.bl-tight',h('h2',title),grid));
    });
    body.append(h('p.bl-source',F.icon('shield-check',{size:16}),'Every log stays on this device. Add only what you observed.'));B.enter(ctx,body);
  }});

  B.form=(ctx,key,{editing=false,failure=false,example=false,saving=false}={})=>{
    const t=B.type(key),info=B.logInfo[key],body=B.frame(ctx),dog=ctx.answers.dog||'Bruno',old=editing?ctx.answers.record:null;
    ctx.root.classList.add('v4-log-editor');B.paint(ctx.root,key);
    const draftKey=(editing?'edit-':'new-')+(ctx.answers.selectedDogId||'bruno')+'-'+key;
    ctx.answers.logDrafts||={};
    let draft=ctx.answers.logDrafts[draftKey];const restored=!!draft?.dirty;
    if(!draft){draft={type:key,values:{...(old?.values||{})},note:old?.note||'',photo:old?.photo||false,date:old?.date||'2026-10-14',time:old?.time||'18:24',dirty:false};ctx.answers.logDrafts[draftKey]=draft;}
    if(example){draft.values={duration:'24',pace:'Easy stroll',location:'Riverside park'};draft.note='Took the quiet path by the river. Bruno stopped to sniff the leaves and stayed close when a cyclist passed.';draft.photo=true;draft.dirty=true;}
    const update=(k,v)=>{draft.values[k]=v;draft.dirty=true;};
    const returnTo=()=>B.go(ctx,editing?'record-detail':'log-chooser');
    const cancel=()=>{if(draft.dirty){const overlay=B.confirm(ctx,{title:'Keep this draft?',text:'Your notes and choices can wait here until you come back.',keep:'Keep draft',action:'Discard draft',danger:false,onAction:()=>{delete ctx.answers.logDrafts[draftKey];returnTo();}});const keep=overlay.querySelector('button');ctx.on(keep,'click',returnTo);}else returnTo();};
    const exit=B.press(ctx,h('button.bl-link',{type:'button'},F.icon('x',{size:17}),'Close'),cancel,.86,true);
    const header=h('div.bl-head.v4-editor-top',exit,h('span.bl-caption',dog+' · local journal'));
    const hero=h('div.v4-editor-hero',B.paint(h('span.v4-log-mark',{'data-shared':editing?'record-icon':'log-mark'},F.icon(t.icon,{size:34})),key),h('div.bl-tight',h('span.v4-eyebrow',info.family.toUpperCase()),B.heading((editing?'Edit ':'Log ')+t.label.toLowerCase(),info.sub)));
    body.append(header,hero);
    if(restored)body.append(h('div.v4-draft-notice',{role:'status'},F.icon('notebook-pen',{size:16}),'Draft restored · your notes and choices are here.'));
    const form=h('form.bl-stack.v4-editor-form');ctx.on(form,'submit',e=>e.preventDefault());
    const primary=h('section.v4-editor-section',h('div.v4-section-label',h('span','01'),h('h2',info.prompt)));
    const controls={};
    const field=(parent,k,label,initial='',opts={})=>{
      if(draft.values[k]===undefined&&initial!=='')draft.values[k]=initial;
      const f=B.field(ctx,label,draft.values[k]??initial,opts);f.input.dataset.field=k;controls[k]=f.input;
      ctx.on(f.input,'input',()=>update(k,f.input.value));parent.append(f.el);return f;
    };
    const choice=(parent,k,label,values,opts={})=>{const el=B.observationChoices(ctx,{label,values,value:draft.values[k]||'',onChange:v=>update(k,v),...opts});parent.append(el);return el;};
    if(key==='poop'){
      choice(primary,'consistency','Consistency · optional',['Firm','Formed','Soft','Loose','Watery','Not sure'],{icon:true});
      choice(primary,'colour','Colour observed · optional',['Brown','Dark','Pale','Other']);
    }
    if(key==='pee'){
      choice(primary,'amount','Amount · optional',['Small','Usual','Large','Not sure']);
      choice(primary,'appearance','Appearance · optional',['Pale yellow','Yellow','Dark','Other']);
    }
    if(key==='meal'){
      field(primary,'food','Food or recipe · optional',editing?'Dry food':'',{placeholder:'e.g. chicken kibble',maximum:200});
      const row=h('div.bl-fields');field(row,'portion','Portion · optional','',{placeholder:'e.g. 120',numeric:true,maximum:12});
      const unit=B.select(ctx,'Unit',['g','cups','mL','Other'],draft.values.unit||'g');ctx.on(unit.querySelector('select'),'change',e=>update('unit',e.target.value));row.append(unit);primary.append(row);
      choice(primary,'eaten','How much was eaten? · optional',['All','Most','Some','None']);
    }
    if(key==='walk'){
      const wrap=h('div.v4-duration');const f=field(wrap,'duration','Duration · optional',editing?'24':'',{placeholder:'24',numeric:true,maximum:4});f.el.append(h('span.v4-input-unit','minutes'));primary.append(wrap);
      choice(primary,'pace','Pace · optional',['Easy stroll','Brisk walk','Run','Mixed']);
    }
    if(key==='symptom'||key==='behavior'){
      field(primary,'observation','What did you observe?','',{placeholder:key==='symptom'?'e.g. coughed twice after drinking water':'e.g. barked when the doorbell rang',multiline:true,maximum:1000});
      if(key==='symptom')choice(primary,'frequency','How often? · optional',['Once','A few times','Ongoing','Not sure']);
      else field(primary,'trigger','What happened just before? · optional','',{placeholder:'A visitor arrived, a sound, a new place…',maximum:240});
    }
    if(key==='mood')choice(primary,'mood','Mood you observed',['Calm','Playful','Low energy','Restless','Unsure'],{icon:'heart'});
    if(key==='grooming')choice(primary,'activity','Grooming activity',['Brushing','Bath','Nails','Teeth','Ears','Other']);
    if(key==='weight'){
      const row=h('div.bl-fields');field(row,'weight','Measured weight','',{placeholder:'14.6',numeric:true,maximum:12});
      const unit=B.select(ctx,'Weight unit',['kg','lb'],draft.values.unit||'kg');ctx.on(unit.querySelector('select'),'change',e=>update('unit',e.target.value));row.append(unit);primary.append(row);
      primary.append(h('p.bl-caption','Use a measured value. BarkLog does not estimate weight.'));
    }
    const noteSection=h('section.v4-editor-section.v4-notes-section',h('div.v4-section-label',h('span','02'),h('h2','A note for later')));
    const notes=B.field(ctx,'Notes · optional',draft.note,{placeholder:({walk:'The route, a new place, a small moment…',meal:'Appetite, a new food, anything different…',poop:'Where it happened or anything else you noticed…',symptom:'When it began, what changed, what happened next…',behavior:'How you responded and what happened afterwards…'}[key]||'What would you like to remember?'),multiline:true,maximum:2000});notes.input.dataset.field='notes';
    const counter=h('span.v4-note-count',`${draft.note.length} / 2,000`);ctx.on(notes.input,'input',()=>{draft.note=notes.input.value;draft.dirty=true;counter.textContent=`${draft.note.length} / 2,000`;});
    const prompts=B.link(ctx,'What could I add?',()=>B.sheet(ctx,{title:'Make this note useful',text:'Write only the details you noticed.',content:h('ul.v4-help-list',h('li','Where you were and what was happening.'),h('li','Anything different from the usual routine.'),h('li','What happened before or afterwards.'))}),'info');
    noteSection.append(notes.el,h('div.bl-head',prompts,counter));
    const context=h('details.v4-context');const summary=h('summary',h('span',F.icon('sliders-horizontal',{size:19}),h('strong','Add context'),h('small','Time, place & attachment')),F.icon('plus',{size:18}));
    const extra=h('div.bl-stack.v4-context-fields');context.append(summary,extra);
    const stamp=h('span',draft.date+' · '+draft.time);
    const date=B.field(ctx,'Date',draft.date,{maximum:10}),time=B.field(ctx,'Time',draft.time,{maximum:5});date.input.dataset.field='date';time.input.dataset.field='time';
    ctx.on(date.input,'input',()=>{draft.date=date.input.value;draft.dirty=true;stamp.textContent=draft.date+' · '+draft.time;});ctx.on(time.input,'input',()=>{draft.time=time.input.value;draft.dirty=true;stamp.textContent=draft.date+' · '+draft.time;});
    extra.append(h('div.bl-fields',date.el,time.el),h('p.bl-caption','Asia/Karachi · UTC+05:00'));
    field(extra,'location','Place · optional','',{placeholder:'e.g. garden, park, at home',maximum:160});
    if(key==='grooming')field(extra,'product','Products or provider · optional','',{placeholder:'e.g. unscented shampoo',maximum:200});
    if(key==='weight')field(extra,'scale','Scale or setting · optional','',{placeholder:'e.g. home scale, clinic',maximum:160});
    const attachment=h('div.v4-attachment');
    const renderAttachment=()=>{attachment.replaceChildren(draft.photo?h('div.v4-attached',h('span.v4-attachment-thumb',B.dogPortrait(44)),h('span',h('strong','Sample photo attached'),h('small','Illustrative local sample')),B.press(ctx,h('button.bl-icon-btn',{type:'button','aria-label':'Remove sample photo'},F.icon('x',{size:18})),()=>{draft.photo=false;draft.dirty=true;renderAttachment();},.86,true)):
      B.button(ctx,'Attach a photo',()=>B.sheet(ctx,{title:'Add a photo',text:'The app opens the system picker. Try a local sample on this board.',content:B.photo('Sample image · design preview','one'),action:'Use sample photo',onAction:()=>{draft.photo=true;draft.dirty=true;renderAttachment();}}),{secondary:true,icon:'image'}));};renderAttachment();extra.append(attachment);
    ctx.on(context,'toggle',()=>{if(context.open)F.rise(ctx,extra,{duration:420,distance:8});});
    const error=h('div.bl-error',{role:'alert'},h('h3','Couldn’t save this record'),h('p','Your draft is still here. Try again.'));error.hidden=!failure;
    form.append(primary,noteSection,context,error,h('p.bl-source',F.icon('shield-check',{size:16}),'Caregiver observations. Saved locally with your dog’s journal.'));body.append(form);
    const validDate=v=>/^\d{4}-\d{2}-\d{2}$/.test(v)&&!Number.isNaN(new Date(v+'T12:00:00Z').getTime())&&new Date(v+'T12:00:00Z').toISOString().slice(0,10)===v;
    const showError=(message,input)=>{error.hidden=false;error.replaceChildren(h('h3','Check this log'),h('p',message));if(input){input.closest('details')?.setAttribute('open','');input.setAttribute('aria-invalid','true');input.focus();}error.scrollIntoView({block:'nearest'});};
    let pending=false;
    const save=B.button(ctx,editing?'Save changes':'Save '+t.label.toLowerCase(),()=>{
      if(pending)return;
      if(!validDate(draft.date))return showError('Enter a real date in YYYY-MM-DD format.',date.input);
      if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(draft.time))return showError('Enter a time from 00:00 to 23:59.',time.input);
      if(key==='weight'&&(!Number.isFinite(Number(draft.values.weight))||Number(draft.values.weight)<=0))return showError('Enter a measured weight above zero.',controls.weight);
      if((key==='symptom'||key==='behavior')&&!draft.values.observation?.trim())return showError('Describe what you observed.',controls.observation);
      if(key==='mood'&&!draft.values.mood)return showError('Choose the mood you observed.');
      if(key==='grooming'&&!draft.values.activity)return showError('Choose a grooming activity.');
      if(draft.values.duration&&(!/^\d+$/.test(draft.values.duration)||Number(draft.values.duration)<=0))return showError('Enter a whole number of minutes above zero.',controls.duration);
      if(draft.values.portion&&(!Number.isFinite(Number(draft.values.portion))||Number(draft.values.portion)<=0))return showError('Enter a portion above zero.',controls.portion);
      error.hidden=true;pending=true;save.disabled=true;save.setAttribute('aria-busy','true');save.replaceChildren(h('span.v4-saving-dot'),'Saving on this device…');
      ctx.at(620,()=>{
        const labels={consistency:'Consistency',colour:'Colour',amount:'Amount',appearance:'Appearance',food:'Food',portion:'Portion',eaten:'Eaten',duration:'Duration (min)',pace:'Pace',observation:'Observation',frequency:'Frequency',trigger:'Before',mood:'Mood',activity:'Activity',weight:'Weight',location:'Place',product:'Product or provider',scale:'Scale'};
        const details=Object.entries(draft.values).filter(([k,v])=>labels[k]&&String(v).trim()).map(([k,v])=>`${labels[k]}: ${v}${k==='weight'?' '+(draft.values.unit||'kg'):k==='portion'?' '+(draft.values.unit||'g'):''}`);
        const record={id:old?.id||'preview-'+Date.now(),type:key,date:draft.date,time:draft.time,details,note:draft.note.trim()||'No notes recorded',values:{...draft.values},photo:draft.photo,day:draft.date};
        B.savePreviewRecord(ctx,record,{editing});delete ctx.answers.logDrafts[draftKey];ctx.root.querySelector('[data-shared="log-mark"],[data-shared="record-icon"]').dataset.shared='record-icon';ctx.haptic('success');B.go(ctx,'record-detail','carry');
      });
    },{icon:'check'});
    const footer=h('div.v4-editor-footer',h('span.v4-footer-summary',F.icon('shield-check',{size:14}),stamp),save);ctx.root.append(footer);
    B.enter(ctx,body);if(example)context.open=true;
    if(failure)ctx.at(650,()=>error.scrollIntoView({block:'center'}));
    if(saving){pending=true;save.disabled=true;save.setAttribute('aria-busy','true');save.replaceChildren(h('span.v4-saving-dot'),'Saving on this device…');form.setAttribute('aria-busy','true');}
  };
  F.SCREENS.filter(s=>s.id.startsWith('form-')||s.id==='record-edit').forEach(s=>Object.assign(s,{enter:'carry',intent:'Design 04: structured observation, notes, optional context, sample attachment, retained draft and committed preview. Proposed design.'}));
  F.def({id:'form-notes-example',section:'forms',name:'Walk · a note worth keeping',flow:true,enter:'carry',intent:'Filled example: free text, duration, pace, place and a local sample photo belong to one record.',build(ctx){B.form(ctx,'walk',{example:true});}});
  F.SCREENS.find(s=>s.id==='seq-forms').seq=['log-chooser','form-walk','form-notes-example','record-detail'];
})();
