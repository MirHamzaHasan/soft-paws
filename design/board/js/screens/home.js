(() => {
  const F=window.F, B=window.B, h=F.h, V=window.BARK_V3;
  B.seq('home',['home-before','home']);

  /** The October 14 reconstruction, kept only for comparison. */
  const before = ctx => {
    const body=B.frame(ctx,'home');ctx.root.classList.add('bl-before');
    const records=B.example;
    body.append(B.brand(ctx),B.heading(`${ctx.answers.dog||'Bruno'}'s day`,'Wednesday, 14 October'),B.card(h('span.bl-kicker',"Today's care"),h('strong.bl-total',`${records.length} care moments`),h('p.bl-sub','Every small moment, remembered.')));
    const grid=h('div.bl-grid');
    ['poop','pee','meal','walk'].forEach(key=>{const t=B.type(key),n=records.filter(e=>e.type===key).length;grid.append(B.press(ctx,B.paint(h('button.bl-care',{type:'button','aria-label':`Log ${t.label}. ${n} today.`},h('span.bl-care-label',`Log ${t.label}`),h('span.bl-care-count',`${n} today`)),key),()=>{},.86));});
    body.append(h('div.bl-tight',B.section('Quick care'),grid,B.button(ctx,'Add detailed log',()=>B.go(ctx,'log-chooser'),{secondary:true,icon:'plus'})),B.section('Recent care'),h('div.bl-tight',records.slice(0,3).map(e=>B.paint(h('div.bl-old-row.bl-tight',h('h3',B.type(e.type).label),h('p.bl-caption',`14 October · ${e.time}`),h('p',e.note)),e.type))));
  };

  B.home = (ctx,{empty=false,loading=false}={}) => {
    const body=B.frame(ctx,'home');body.classList.add('bl-home');
    const dog=ctx.answers.dog||'Bruno';
    const records=empty?[]:(ctx.answers.records||B.example.map(e=>({...e})));
    let total=records.length;

    // The day: one number, the dog, and the line every moment lands on.
    const countN=h('strong.v3-count-n',String(total)),unit=h('span.v3-count-unit',total===1?'care moment today':'care moments today');
    const dogArt=B.dogCharacter();
    const dogFrame=h('span.v4-home-scene',{'data-shared':'dog'},dogArt);
    const line=B.dayLine(ctx,loading?[]:records,{label:`${dog}’s day so far`});
    const lastText=()=>records.length?`Last at ${[...records].sort((a,b)=>V.mins(b.time)-V.mins(a.time))[0].time}`:'Nothing recorded yet today';
    const statusText=h('span.v3-day-status-text',loading?'Reading your journal':lastText());
    const status=h('div.v3-day-status',{role:'status','aria-live':'polite'},F.icon(loading?'refresh-cw':'circle-check',{size:14}),statusText);
    // Feedback lives where the moment landed, so nothing covers the care tiles. Undo stays six seconds.
    let undoBtn=null,undoTimer=null;
    const say=(text,undo)=>{
      undoBtn?.remove();undoBtn=null;clearTimeout(undoTimer);
      F.swapText(ctx,statusText,text);
      if(undo){
        undoBtn=B.press(ctx,h('button.v3-undo',{type:'button'},F.icon('rotate-ccw',{size:14}),'Undo'),()=>{const u=undoBtn;undoBtn=null;u?.remove();clearTimeout(undoTimer);undo();},.94);
        status.append(undoBtn);F.move(undoBtn,{o:0,x:-6},{o:1,x:0},{duration:320,delay:300,curve:'emph',ctx,fill:'backwards'});
        undoTimer=ctx.at(6000,()=>{if(!undoBtn)return;const u=undoBtn;undoBtn=null;const a=F.move(u,{o:1},{o:0},{duration:180,curve:'exit',ctx,fill:'forwards'});(a?a.finished:Promise.resolve()).then(()=>u.remove(),()=>{});F.swapText(ctx,statusText,lastText());});
      }
    };
    const day=h('section.bl-card.v3-day',{'aria-label':'Today so far'},
      h('div.v3-day-head',h('div.v3-day-copy',h('div.v3-count',countN,unit)),dogFrame),
      status,line);
    if(loading){countN.textContent='–';day.setAttribute('aria-busy','true');}

    body.append(B.brand(ctx,{safety:true}),B.heading(`*${dog}’s* day`,'Wednesday, 14 October',{display:true,shared:'dog-name'}),day);

    // Quick care: one tap records now. The count rolls under the finger; the moment flies to the day.
    const grid=h('div.v3-care-grid');
    const recent=h('div.bl-records.v3-recent');
    const renderRecent=()=>{
      if(!records.length)recent.replaceChildren(h('div.v3-fresh',h('h3','A fresh page'),h('p.bl-caption','Tap a care tile when it happens. It lands on today’s line.')));
      else recent.replaceChildren(...records.slice(0,3).map(e=>B.row(ctx,e)));
    };
    const pushRecent=record=>{
      const rows=[...recent.querySelectorAll('.v3-row')];
      if(!rows.length||F.reduced()){renderRecent();return;}
      const first=rows.map(r=>B.rel(r,ctx.root).y);
      recent.style.height=recent.offsetHeight+'px';
      const row=B.row(ctx,record);recent.prepend(row);
      const moved=[...recent.querySelectorAll('.v3-row')].slice(1);
      moved.forEach((r,i)=>{const dy=first[i]-B.rel(r,ctx.root).y;F.move(r,{y:dy},{y:0},{duration:420,curve:'emph',ctx,fill:'backwards'});});
      F.move(row,{o:0,y:-10},{o:1,y:0},{duration:460,delay:60,curve:'emph',ctx,fill:'backwards'});
      ctx.at(520,()=>{moved.slice(2).forEach(r=>r.remove());recent.style.height='';});
    };
    // Detailed saves keep their detail destination, then greet on the next Home.
    const pendingLog=ctx.answers.dogLogPending;
    if(!loading&&pendingLog?.dogId===(ctx.answers.selectedDogId||'bruno')){
      delete ctx.answers.dogLogPending;
      if(records.some(record=>record.id===pendingLog.recordId)){
        dogArt._characterResponded=true;
        document.fonts.ready.then(()=>{if(!ctx.dead)ctx.at(ctx.via==='back'?180:820,()=>{if(!dogArt._logAnimation)B.celebrateDogCharacter(ctx,dogArt);});});
      }
    }
    const setTotal=()=>{F.roll(countN,String(total));unit.textContent=total===1?'care moment today':'care moments today';};

    ['poop','pee','meal','walk'].forEach(key=>{
      const t=B.type(key);let n=records.filter(e=>e.type===key).length;
      const countEl=h('strong',String(n));
      const icon=h('span.v3-care-icon',F.icon(t.icon,{size:22}));
      const tile=B.paint(h('button.v3-care',{type:'button',disabled:loading,'aria-label':`Log ${t.label} now. ${n} today.`},
        h('span.v3-care-top',icon,h('span.v3-care-add',F.icon('plus',{size:18}))),
        h('span.v3-care-bottom',h('span.v3-care-label',t.label),h('span.v3-care-count',countEl,h('small','today')))),key);
      B.press(ctx,tile,()=>{
        if(loading)return;
        // In the app the local write commits first; everything below is the success feedback.
        const record={type:key,time:V.now,note:'Logged with one tap'};
        records.unshift(record);ctx.answers.records=records;n++;total++;
        F.roll(countEl,String(n));tile.setAttribute('aria-label',`Log ${t.label} now. ${n} today.`);
        if(!F.reduced()){F.move(icon,{sx:1,sy:1},{sx:1.1,sy:.9},{duration:90,curve:'strong',ctx,fill:'forwards'});ctx.at(92,()=>F.move(icon,{sx:1.1,sy:.9},{sx:1,sy:1},{spring:{response:.3,damping:.62},ctx,fill:'forwards'}));}
        const mark=line.add(record,{hidden:true});
        if(!records.slice(1).length)renderRecent();
        const undo=()=>{
          const i=records.indexOf(record);if(i<0)return;records.splice(i,1);n--;total--;
          F.roll(countEl,String(n));setTotal();tile.setAttribute('aria-label',`Log ${t.label} now. ${n} today.`);
          const a=F.move(mark,{s:1,o:1},{s:.4,o:0},{duration:220,curve:'exit',ctx,fill:'forwards'});
          (a?a.finished:Promise.resolve()).then(()=>line.remove(mark),()=>{});
          renderRecent();say(`${t.label} at ${V.now} removed`);ctx.at(2400,()=>F.swapText(ctx,statusText,lastText()));
          ctx.haptic('light');
        };
        B.fly(ctx,icon,mark,{onLand:()=>{if(!records.includes(record))return;setTotal();B.celebrateDogCharacter(ctx,dogArt);records.length>1?pushRecent(record):renderRecent();}});
        say(`${t.label} logged at ${V.now}`,undo);
      },.86);
      grid.append(tile);
    });

    body.append(h('div.bl-tight',B.section('Quick care',B.link(ctx,'Add details',()=>{if(!loading)B.go(ctx,'log-chooser');},'plus')),grid));
    if(loading){for(let i=0;i<3;i++)recent.append(h('div.bl-row',h('span.bl-mark'),h('div.bl-tight',{style:{flex:1}},h('div.bl-skeleton'),h('div.bl-skeleton',{style:{width:'45%'}}))));}
    else renderRecent();
    const create=B.press(ctx,h('button.v4-create-action',{type:'button'},h('span',F.icon('notebook-pen',{size:21})),h('span',h('strong','Create a log'),h('small','Observations, notes & the little details')),F.icon('arrow-right',{size:19})),()=>B.go(ctx,'log-chooser','cover'),.86);
    body.append(create,B.section('Recent care',B.link(ctx,'View all',()=>B.go(ctx,'timeline'),'arrow-right')),recent,h('p.bl-caption','Saved on this device. Works offline.'));

    if(!loading){B.enter(ctx,body);document.fonts.ready.then(()=>{if(!ctx.dead)line.reveal(260);});}
    return {body,line,grid};
  };
  F.def({id:'home-before',section:'home',name:'Before · current code reconstruction',intent:'Same example records, existing hierarchy and repeated colored rows. Not a simulator screenshot.',build(ctx){before(ctx);}});
  F.def({id:'home',section:'home',name:'Day line · tap a tile',flow:true,enter:'cut',intent:'H1 v3. The day as a line from 06:00 to 24:00; each record sits at its time. Tap a care tile: its icon arcs onto the line at now, the count rolls, the newest record slides into Recent care, and Undo is offered. In the app the SQLite write commits before any of this moves.',build(ctx){B.home(ctx);}});
})();
