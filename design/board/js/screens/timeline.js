(() => {
  const F=window.F,B=window.B,h=F.h;
  B.seq('timeline',['timeline','timeline-filters','timeline-local-events','timeline-pagination']);
  const chipTypes=['poop','pee','meal','walk','mood','weight'];

  /** One day: its name, its line, then its records. The line is the same object Home shows. */
  const dayGroup=(ctx,{title,date,records,today})=>{
    const sorted=[...records].sort((a,b)=>window.BARK_V3.mins(b.time)-window.BARK_V3.mins(a.time));
    const line=B.dayLine(ctx,records,{compact:true,now:today?undefined:null,label:`${title}, ${date}`});
    const el=h('section.v3-day-group',{'aria-label':`${title}, ${date}`},
      h('div.v3-day-group-head',h('h2',title),h('span.bl-caption',`${date} · ${records.length} ${records.length===1?'record':'records'}`)),
      line,h('div.bl-records',sorted.map(e=>B.row(ctx,{...e,day:`${today?'Wednesday':'Tuesday'} ${date}`,dayList:records}))));
    el.line=line;return el;
  };

  B.timeline = (ctx,open=false) => {
    const body=B.frame(ctx,'timeline');let dog=ctx.answers.dog||'Bruno',days=B.weekDays(ctx);
    const heading=B.heading('Timeline',`${dog} · newest first`,{display:true});body.append(B.brand(ctx),heading);
    const saved=ctx.answers.timelineFilters||{};let selected=saved.type||'all',from=saved.from||'',through=saved.through||'';
    const groups=h('div.bl-stack');
    const result=h('span.bl-caption');
    const render=(animate)=>{
      const keep=r=>selected==='all'||r.type===selected;
      const source=from||through?days:[days[5],days[6]];
      const list=[...source].reverse().filter(d=>{const iso='2026-10-'+d.date.split(' ')[0].padStart(2,'0');return (!from||iso>=from)&&(!through||iso<=through);}).map(d=>({title:d.today?'Today':d.day==='Tue'?'Yesterday':d.day,date:d.date,records:d.records.filter(keep),today:d.today})).filter(g=>g.records.length);
      const count=list.reduce((n,g)=>n+g.records.length,0);
      result.textContent=`${count} ${count===1?'record':'records'} shown`;
      groups.replaceChildren(...(list.length?list.map(g=>dayGroup(ctx,g)):[h('div.bl-empty',h('h3','No matching records'),h('p.bl-sub','No observations match this dog, type and date range. Clear filters to see the journal.'))]));
      if(animate&&!F.reduced())F.rise(ctx,[...groups.children].slice(0,3),{distance:8,duration:420,stagger:70});
      document.fonts.ready.then(()=>{if(!ctx.dead)groups.querySelectorAll('.dl').forEach((l,i)=>l.reveal?.(animate?80:300+i*120));});
    };
    // Bind reveal to each line after render (dayGroup returns the line on the group).
    const chips=[['all','All'],...chipTypes.map(k=>[k,B.type(k).label])].map(([key,label])=>{
      const chip=h('button.bl-chip',{type:'button','aria-pressed':key===selected?'true':'false'},key==='all'?null:h('i.v3-chip-dot'),label);
      if(key!=='all')B.paint(chip,key);
      F.press(ctx,chip,{scale:.95,onTap:()=>{
        if(key===selected)return;
        const prev=chipsEl.querySelector('[aria-pressed="true"]');
        if(prev){prev.classList.add('is-on');F.picked(ctx,prev,false);}
        selected=key;F.picked(ctx,chip,true);render(true);
      }});
      if(key===selected)chip.classList.add('is-on');
      return chip;
    });
    const chipsEl=h('div.v3-filter-row',{role:'group','aria-label':'Show record type'},chips);
    const panel=B.card(B.select(ctx,'Dog',(ctx.answers.dogs||[{name:dog}]).map(d=>d.name),dog),B.select(ctx,'Event type',['All types',...B.timelineTypes.map(t=>t.label)],selected==='all'?'All types':B.type(selected).label),
      B.field(ctx,'From date',from,{placeholder:'YYYY-MM-DD',maximum:10}).el,B.field(ctx,'Through date',through,{placeholder:'YYYY-MM-DD',maximum:10}).el,
      h('p.bl-caption','Dates use your device timezone: Asia/Karachi.'));
    panel.hidden=!open;let shown=open;
    const more=B.press(ctx,h('button.bl-chip',{type:'button','aria-expanded':open?'true':'false'},F.icon('sliders-horizontal',{size:16}),'Dates & dog'),()=>{shown=!shown;panel.hidden=!shown;more.setAttribute('aria-expanded',shown?'true':'false');if(shown)F.rise(ctx,panel,{distance:8,duration:360});},.86);
    panel.append(B.button(ctx,'Apply filters',()=>{
      const inputs=panel.querySelectorAll('input'),a=inputs[0].value.trim(),b=inputs[1].value.trim();
      if([a,b].some(d=>d&&!/^2026-\d{2}-\d{2}$/.test(d))||a&&b&&a>b)return B.toast(ctx,'Enter valid YYYY-MM-DD dates, with From before Through.');
      const selects=panel.querySelectorAll('select'),chosen=(ctx.answers.dogs||[]).find(d=>d.name===selects[0].value);if(chosen&&chosen.id!==ctx.answers.selectedDogId){B.switchDog(ctx,chosen.id);dog=chosen.name;days=B.weekDays(ctx);heading.querySelector('.bl-sub').textContent=`${dog} · newest first`;}
      const t=B.timelineTypes.find(x=>x.label===selects[1].value);selected=t?t.key:'all';from=a;through=b;ctx.answers.timelineFilters={type:selected,from,through};
      chips.forEach((c,i)=>{const k=i?chipTypes[i-1]:'all';c.classList.toggle('is-on',k===selected);c.setAttribute('aria-pressed',String(k===selected));});render(true);shown=false;panel.hidden=true;more.setAttribute('aria-expanded','false');
    }),B.link(ctx,'Clear filters',()=>{const sel=panel.querySelectorAll('select')[1];sel.selectedIndex=0;sel.dispatchEvent(new Event('change'));panel.querySelectorAll('input').forEach(i=>i.value='');selected='all';from='';through='';delete ctx.answers.timelineFilters;chips.forEach((c,i)=>{c.classList.toggle('is-on',i===0);c.setAttribute('aria-pressed',String(i===0));});render(true);}));
    body.append(chipsEl,h('div.bl-head',more,result),panel,groups,h('p.bl-caption','Example records. Older days load in pages of 20.'));
    render(false);B.enter(ctx,body);
  };
  F.def({id:'timeline',section:'timeline',name:'Timeline · days you can read',flow:true,enter:'cut',intent:'T1 v3. Type chips filter in place; each day shows its line, then its records, newest first. Tap a row: its icon carries into the record.',build(ctx){B.timeline(ctx);}});
  F.def({id:'timeline-filters',section:'timeline',name:'Timeline · dates and dog',intent:'Functional in-memory dog, event type and inclusive date filtering. No database reads.',build(ctx){B.timeline(ctx,true);}});
  F.def({id:'timeline-local-events',section:'timeline',name:'Timeline · local-v1 event types',flow:true,enter:'cut',intent:'Medication, training and photo entries use the same factual row grammar and remain labeled in text.',build(ctx){const body=B.frame(ctx,'timeline'),events=[{type:'photo',time:'18:44',note:'Park walk · local example photo'},{type:'training',time:'18:42',note:'Name response · 4 min · 3 responses'},{type:'medication',time:'08:02',note:'Example medication · 5 mg · recorded as given'}];body.append(B.brand(ctx),B.heading('Timeline',`${ctx.answers.dog||'Bruno'} · all recorded care`,{display:true}),B.status('info','Dog scope · '+(ctx.answers.dog||'Bruno'),'Changing dog updates this Timeline and every dog-scoped destination.','user-round'),h('section.v3-day-group',h('div.v3-day-group-head',h('h2','Today'),h('span.bl-caption','14 October · 3 records')),B.dayLine(ctx,events,{compact:true}),h('div.bl-records',events.map(e=>B.row(ctx,e)))),h('p.bl-caption','Type name, icon, time and description remain readable without event colour.'));B.enter(ctx,body);}});
  F.def({id:'timeline-pagination',section:'timeline',name:'Timeline · bounded older records',flow:true,enter:'cut',intent:'Older local records load in bounded pages with clear completion and retry behavior.',build(ctx){const body=B.frame(ctx,'timeline'),rows=h('div.bl-records',B.example.slice(0,4).map(e=>B.row(ctx,e))),more=B.button(ctx,'Load 20 older records',()=>{more.disabled=true;more.textContent='Loading…';ctx.at(650,()=>{const added=B.example.slice(4).map(e=>B.row(ctx,e));rows.append(...added);F.rise(ctx,added,{distance:8,stagger:60});more.replaceWith(h('p.bl-caption','All example records loaded.'));});},{secondary:true,icon:'arrow-down'});body.append(B.brand(ctx),B.heading('Timeline',`${ctx.answers.dog||'Bruno'} · newest first`,{display:true}),rows,more,h('p.bl-caption','Loading another page never blocks new care logging.'));B.enter(ctx,body);}});
})();
