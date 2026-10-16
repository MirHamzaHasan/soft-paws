(() => {
  const F=window.F,B=window.B,h=F.h;
  const truth=()=>h('p.bl-source',F.icon('info',{size:15}),'Recorded observations only. BarkLog does not diagnose or fill gaps with assumptions.');
  B.seq('insights',['insights-overview','trends-month','report-preview']);
  /*
   * The week as seven day lines, one under another, so when care happened is visible at a glance.
   * Every number and the summary sentence are computed from B.week; nothing is typed by hand.
   */
  F.def({id:'insights-overview',section:'insights',name:'Insights · a week of days',flow:true,enter:'cut',intent:'Insights v3. Seven day lines show when care was recorded; totals sit beside one comparable bar each; one sentence says what the records show. No scores, stat-card grids or health judgments.',build(ctx){
    const body=B.frame(ctx,'insights'),dog=ctx.answers.dog||'Bruno',V=window.BARK_V3,days=B.weekDays(ctx);
    const all=days.flatMap(d=>d.records);
    if(!all.length){body.append(B.brand(ctx),B.heading('This *week*',`${dog} · 8–14 October · example records`,{display:true}),B.status('info','No observations in this range','The journal does not infer a health pattern from missing observations.','chart-no-axes-column-increasing'),B.button(ctx,'Record care',()=>B.go(ctx,'home'),{icon:'plus'}),B.button(ctx,'Choose another range',()=>B.go(ctx,'trends-month'),{secondary:true}),truth());B.enter(ctx,body);return;}
    const count=k=>all.filter(r=>r.type===k).length;
    const walks=all.filter(r=>r.type==='walk'),walkMin=walks.reduce((n,r)=>n+(parseInt((r.note.match(/(\d+) minutes/)||[])[1])||0),0);
    const meals=all.filter(r=>r.type==='meal').map(r=>V.mins(r.time)).sort((a,b)=>a-b);
    const am=meals.filter(m=>m<12*60),pm=meals.filter(m=>m>=12*60),fmt=m=>`${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`;
    const busiest=days.reduce((a,d)=>d.records.length>a.records.length?d:a,days[0]);
    const weights=all.filter(r=>r.type==='weight').map(r=>parseFloat(r.note)).sort((a,b)=>a-b);

    const rows=days.map(d=>h('div.v3-week-row'+(d.today?'.is-today':''),h('span',d.today?'Today':d.day),B.dayLine(ctx,d.records,{compact:true,now:d.today?undefined:null,label:`${d.day} ${d.date}`}),h('b',String(d.records.length))));
    const axis=h('div.dl-axis',{'aria-hidden':'true'},[6,9,12,15,18,21,24].map(hr=>h('span',{style:{left:V.pct(`${hr}:00`)+'%'}},String(hr%24).padStart(2,'0'))));
    const chart=h('div.v3-week-chart',...rows);
    const legend=h('div.v3-legend',{'aria-hidden':'true'},['poop','pee','meal','walk','mood','weight'].map(k=>B.paint(h('span',h('i'),B.type(k).label),k)));
    const mealDays=days.filter(d=>d.records.some(r=>r.type==='meal')).length;
    const mealRange=[am.length?`before noon at ${fmt(am[0])}–${fmt(am[am.length-1])}`:null,pm.length?`after noon at ${fmt(pm[0])}–${fmt(pm[pm.length-1])}`:null].filter(Boolean).join(' and ');
    const sentence=`${all.length} care logs over 7 days. ${mealDays?`Meals were logged on ${mealDays} days, ${mealRange}.`:'No meals were recorded.'} ${busiest.today?'Today':busiest.day} has the most, with ${busiest.records.length}.`;
    const rhythm=B.card(h('div.bl-head',h('h2','When care happened'),h('span.bl-caption',`${all.length} logs`)),h('div.v3-week',chart,axis),legend,h('p.bl-sub',sentence));

    const kinds=[['meal',count('meal'),`${mealDays} days recorded`],['pee',count('pee'),''],['walk',walks.length,`${walkMin} minutes`],['poop',count('poop'),''],['other',count('mood')+count('weight'),`${count('mood')} mood · ${count('weight')} weight${weights.length?' · '+weights[0]+'–'+weights[weights.length-1]+' kg':''}`]];
    const max=Math.max(...kinds.map(k=>k[1]));
    const bars=kinds.map(([k,n,note])=>{const t=k==='other'?{key:'weight',label:'Other',icon:'gauge'}:B.type(k);const fill=h('i',{style:{width:`${n/max*100}%`}});return B.paint(h('div.v3-bar-row',{role:'img','aria-label':`${t.label}: ${n} recorded${note?', '+note:''}.`},B.paint(h('span.bl-event-icon',F.icon(t.icon,{size:18})),t.key),h('div.v3-bar-copy',h('span',t.label,note?h('small',note):null),h('div.v3-bar',fill)),h('b',String(n))),t.key);});
    const totals=B.card(h('div.bl-head',h('h2','Recorded this week'),B.link(ctx,'Month',()=>B.go(ctx,'trends-month'),'arrow-right')),h('div.v3-bars',bars));

    body.append(B.brand(ctx),B.heading('This *week*',`${dog} · 8–14 October · example records`,{display:true}),rhythm,totals,B.button(ctx,'Prepare a vet report',()=>B.go(ctx,'vet-prep'),{secondary:true,icon:'file-text'}),truth());
    B.enter(ctx,body);
    document.fonts.ready.then(()=>{
      if(ctx.dead||F.reduced())return;
      // The week draws in one sweep with each day's line; then each bar grows from its label.
      rows.forEach(r=>r.querySelector('.dl').reveal(240));
      bars.forEach((b,i)=>F.move(b.querySelector('.v3-bar > i'),{sx:0},{sx:1},{duration:700,delay:520+i*60,curve:'emph',ctx,fill:'backwards'}));
    });
  }});
  F.def({id:'trends-month',section:'insights',name:'Trends · range and text equivalent',flow:true,enter:'push',intent:'Range selection changes the actual chart and its exact text equivalent; scope carries into report preparation.',build(ctx){
    const body=B.frame(ctx,'insights'),ranges={'7 days':{from:'2026-10-08',to:'2026-10-14',values:[31,0,33,0,0,28,24],labels:['8','9','10','11','12','13','14']},'30 days':{from:'2026-09-15',to:'2026-10-14',values:[38,72,49,116],labels:['15–21 Sep','22–28 Sep','29 Sep–5 Oct','6–14 Oct']},'90 days':{from:'2026-07-17',to:'2026-10-14',values:[64,138,164,157],labels:['17–31 Jul','Aug','Sep','1–14 Oct']}};
    let range=ctx.answers.trendRange||'30 days';const content=h('div'),segment=h('div.bl-segment',{role:'group','aria-label':'Trend date range'}),heading=B.heading('Recorded walk minutes',`${ctx.answers.dog||'Bruno'} · example observations`);
    const render=()=>{const r=ranges[range],empty=ctx.answers.freshJournal||(ctx.answers.selectedDogId||'bruno')!=='bruno',values=empty?r.values.map(()=>0):r.values,total=values.reduce((a,b)=>a+b,0);content.replaceChildren(B.card(B.section('Walk minutes'),B.chart(values,r.labels,{max:Math.max(...values,1),label:'Recorded walk minutes: '+range}),h('p.bl-sub','Text summary'),h('p.bl-caption',r.labels.map((l,i)=>`${l}: ${values[i]} min`).join('. ')+`. Total: ${total} minutes. Missing observations are not zero activity.`)));};
    Object.keys(ranges).forEach(label=>{const b=B.press(ctx,h('button',{type:'button','aria-pressed':String(label===range)},label),()=>{range=label;ctx.answers.trendRange=range;segment.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));render();F.rise(ctx,content,{duration:420,distance:6});},.86,true);segment.append(b);});
    body.append(B.brand(ctx),B.back(ctx,'insights-overview'),heading,segment,content,B.button(ctx,'Use this range in report',()=>{const r=ranges[range];ctx.answers.exportScope={dog:ctx.answers.dog||'Bruno',from:r.from,through:r.to,include:{care:true,medication:true}};B.go(ctx,'vet-prep');},{secondary:true,icon:'file-text'}),truth());render();B.enter(ctx,body);
  }});
  F.def({id:'trends-sparse',section:'insights',name:'Trends · sparse observations',intent:'Sparse data is named without implying stability, improvement or decline.',build(ctx){const body=B.frame(ctx,'insights');body.append(B.brand(ctx),B.heading('Weight observations',`${ctx.answers.dog||'Bruno'} · October 2026`),B.status('info','Two recorded weights','There are not enough dates to describe a pattern.','chart-no-axes-column-increasing'),h('div.bl-metrics',B.metric('8 Oct','14.5 kg'),B.metric('14 Oct','14.6 kg')),B.button(ctx,'View weight records',()=>B.go(ctx,'timeline'),{secondary:true}),truth());B.enter(ctx,body);}});
  F.def({id:'trends-empty',section:'insights',name:'Trends · no observations',intent:'An empty chart never invents a baseline or labels the dog healthy.',build(ctx){const body=B.frame(ctx,'insights');body.append(B.brand(ctx),B.heading('Insights',`${ctx.answers.dog||'Bruno'} · recorded care`),h('div.bl-empty',h('span.bl-mark',F.icon('chart-no-axes-column-increasing',{size:25})),h('h2','No observations in this range'),h('p.bl-sub','Choose another date range or record care when it happens.'),B.button(ctx,'Go to Home',()=>B.go(ctx,'home'),{secondary:true})),truth());B.enter(ctx,body);}});
})();
