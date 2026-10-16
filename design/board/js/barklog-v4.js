/* Mobbin study → original BarkLog parts. Board-only proposal. */
(() => {
  'use strict';
  const F=window.F,B=window.B,h=F.h;
  document.documentElement.classList.toggle('bl-reduced-preview',F.reduced());
  B.go=(ctx,to,via)=>ctx.mode==='flow'?ctx.next({to,via}):F.board.openPlayer(to,ctx.answers);
  B.logInfo={
    poop:{title:'Poop',prompt:'What did you notice?',sub:'Consistency, colour and anything worth remembering.',icon:'circle-dashed',family:'Daily care'},
    pee:{title:'Pee',prompt:'A little more context.',sub:'Record the amount and what you observed.',icon:'droplet',family:'Daily care'},
    meal:{title:'Meal',prompt:'What was on the menu?',sub:'Food, portion and how much was eaten.',icon:'utensils',family:'Food & movement'},
    walk:{title:'Walk',prompt:'Keep the little details.',sub:'Time outside, the route and your own notes.',icon:'footprints',family:'Food & movement'},
    symptom:{title:'Symptom',prompt:'Write what you can see.',sub:'Describe the observation in your own words.',icon:'activity',family:'Observations'},
    mood:{title:'Mood',prompt:'How did they seem?',sub:'Choose what you noticed, then add context.',icon:'heart',family:'Observations'},
    behavior:{title:'Behavior',prompt:'The moment around it.',sub:'What happened before, during and after?',icon:'brain',family:'Observations'},
    grooming:{title:'Grooming',prompt:'A little care, recorded.',sub:'The activity, products and any notes.',icon:'sparkles',family:'Care & measures'},
    weight:{title:'Weight',prompt:'One measurement at a time.',sub:'Keep the measured value, unit and context.',icon:'gauge',family:'Care & measures'}
  };

  B.logMark=(key,size=28)=>B.paint(h('span.v4-log-mark',{style:{'--mark-size':size+'px'},'aria-hidden':'true'},F.icon(B.type(key).icon,{size})),key);

  // Shared feature folios give every family its own composition and keep forms quiet.
  const oldEnter=B.enter;
  const folios={profiles:['YOUR DOG, ALL TOGETHER','user-round','meal'],medications:['THE CARE RECORD','pill','medication'],calendar:['A LITTLE PLANNING','calendar','walk'],insights:['FROM YOUR RECORDS','chart-no-axes-column-increasing','photo'],safety:['READY WHEN IT MATTERS','shield','symptom'],exports:['BRING THE FACTS','file-text','photo'],training:['SMALL PRACTICE, OFTEN','graduation-cap','training'],photos:['MOMENTS TO KEEP','image','photo'],expenses:['THE COST OF CARE','receipt','behavior'],memory:['THE GOOD LITTLE THINGS','heart','mood']};
  B.enter=(ctx,body)=>{
    const heading=[...body.children].find(x=>x.classList.contains('bl-heading'));
    const spec=folios[ctx.screen.section];
    if(spec&&heading&&!heading.dataset.folio){
      heading.dataset.folio='true';heading.classList.add('v4-folio');
      heading.prepend(h('span.v4-eyebrow',spec[0]));
      heading.append(B.paint(h('span.v4-folio-mark',{'aria-hidden':'true'},F.icon(spec[1],{size:38})),spec[2]));
    }
    if(ctx.screen.id==='training-program'||ctx.screen.id==='training-catalog'){
      const card=body.querySelector('.bl-card,.bl-status');
      if(card&&!body.querySelector('.v4-dog-scene')){card.classList.add('v4-illustrated');card.prepend(B.scene(ctx,'training'));}
    }
    if(ctx.screen.id==='memory-book')body.querySelector('.bl-card')?.classList.add('v4-scrapbook');
    (B.choreograph||oldEnter)(ctx,body);
  };

  // A proper sheet is reusable for optional attachments and helper copy.
  B.sheet=(ctx,{title,text,content,action='Done',onAction})=>{
    const previous=document.activeElement,back=h('div.v4-sheet-back'),panel=h('section.v4-sheet',{role:'dialog','aria-modal':'true','aria-label':title});
    const close=()=>{back.remove();previous?.focus();};
    const x=B.press(ctx,h('button.bl-icon-btn',{type:'button','aria-label':'Close '+title},F.icon('x',{size:20})),close,.86,true);
    panel.append(h('span.v4-sheet-grab',{'aria-hidden':'true'}),h('div.bl-head',h('h2',title),x),text?h('p.bl-sub',text):null,content||null,B.button(ctx,action,()=>{onAction?.();close();}));
    back.append(panel);ctx.root.append(back);x.focus();
    ctx.on(back,'click',e=>{if(e.target===back)close();});
    ctx.on(back,'keydown',e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close();}if(e.key==='Tab'){const controls=[...panel.querySelectorAll('button,input,select,textarea')].filter(x=>!x.disabled);const i=controls.indexOf(document.activeElement);e.preventDefault();e.stopPropagation();controls[(i+(e.shiftKey?-1:1)+controls.length)%controls.length].focus();}});
    F.move(panel,{y:140,o:0},{y:0,o:1},{duration:480,curve:'emph',ctx});return {close,panel};
  };

  // Labeled choice cards, with a selection that blooms from the pointer.
  B.observationChoices=(ctx,{label,values,value='',onChange,icon=false})=>{
    const group=h('div.v4-choice-field',h('span.bl-label',label)),grid=h('div.v4-choice-grid',{role:'group','aria-label':label});
    const buttons=values.map((v,i)=>{
      const check=h('span.v4-choice-check',F.icon('check',{size:13}));
      const b=h('button.v4-choice',{type:'button','aria-pressed':String(v===value)},icon?(typeof icon==='string'?F.icon(icon,{size:21}):h('span.v4-observation-shape',{'data-shape':i,'aria-hidden':'true'})):null,h('span',v),check);
      F.press(ctx,b,{scale:.97,onTap:()=>{
        value=v;buttons.forEach((el,j)=>{if(el!==b&&el.getAttribute('aria-pressed')==='true')F.picked(ctx,el,false);});
        F.picked(ctx,b,true);F.move(check,{s:.65,o:0},{s:1,o:1},{spring:{response:.30,damping:.86},ctx,fill:'backwards'});onChange?.(v);
      }});if(v===value)b.classList.add('is-on');return b;
    });grid.append(...buttons);group.append(grid);return group;
  };

  B.savePreviewRecord=(ctx,record,{editing=false}={})=>{
    const list=[...(ctx.answers.records||B.example)].map((r,i)=>({...r,id:r.id||'example-'+i}));
    const old=ctx.answers.record;
    if(editing){const i=list.findIndex(r=>(old?.id&&r.id===old.id)||(!old?.id&&r.type===old?.type&&r.time===old?.time));if(i>=0)list[i]=record;else list.unshift(record);}
    else list.unshift(record);
    ctx.answers.records=list;ctx.answers.record=record;
    if(!editing)ctx.answers.dogLogPending={dogId:ctx.answers.selectedDogId||'bruno',recordId:record.id};
  };

  // Native-style choice sheet contained inside the phone; no desktop browser menu.
  let menuId=0;
  B.select=(ctx,label,choices,value='')=>{
    const id='bl-menu-'+ ++menuId,select=h('select',{hidden:true,'aria-hidden':'true',tabindex:-1},choices.map(c=>h('option',{value:c},c)));
    select.value=choices.includes(value)?value:choices[0];
    const text=h('span',select.value),button=B.press(ctx,h('button.bl-input.v5-select-btn',{id,type:'button','aria-haspopup':'dialog','aria-label':`${label}: ${select.value}`},text,F.icon('chevron-down',{size:18})),()=>{
      let sheet;const content=h('div.bl-menu',choices.map(c=>B.listRow(ctx,{icon:c===select.value?'circle-check':'circle',title:c,onTap:()=>{select.value=c;select.dispatchEvent(new Event('change',{bubbles:true}));sheet.close();}})));
      sheet=B.sheet(ctx,{title:label,content});
    });
    ctx.on(select,'change',()=>{text.textContent=select.value;button.setAttribute('aria-label',`${label}: ${select.value}`);});
    return h('div.bl-field',h('label',{for:id},label),select,button);
  };

  B.switchDog=(ctx,id)=>{
    const a=ctx.answers,old=a.selectedDogId||'bruno';a.dogData||={};
    const keys=['records','dogLogPending','plans','tasks','expenses','photos','vaccinations','trainingWins','trainingSessions','task','taskComplete','taskDeleted','medicationPlan','expense','expenseDraft','expenseReceipt','photoEntry','memoryCaption','memorySelected'];
    a.dogData[old]=Object.fromEntries(keys.map(k=>[k,k==='records'?(a.records||B.example):a[k]]));
    const data=a.dogData[id]||{records:[],plans:[],tasks:[],expenses:[],photos:[],vaccinations:[]};
    keys.forEach(k=>{if(data[k]===undefined)delete a[k];else a[k]=structuredClone(data[k]);});
    delete a.record;delete a.selectedTask;delete a.selectedPlan;delete a.selectedExpense;
    a.selectedDogId=id;a.dog=(a.dogs||[]).find(d=>d.id===id)?.name||'Your dog';
  };
  const sampleWeek=B.weekDays;
  B.weekDays=ctx=>{
    if(!ctx||!ctx.answers.freshJournal&&(ctx.answers.selectedDogId||'bruno')==='bruno')return sampleWeek(ctx);
    return B.week.map(d=>({...d,records:d.today?(ctx.answers.records||[]):[]}));
  };
})();
