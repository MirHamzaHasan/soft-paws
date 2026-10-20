/* task033: paid-output proposal. These are review screens, not native MP4 export. */
(() => {
  const N=window.NEXT,{F,B,h}=N;
  // Same outline icon grammar as the existing kit (Lucide film).
  window.F_ICONS.film=[['rect',{x:2,y:2,width:20,height:20,rx:2.18}],['path',{d:'M7 2v20M17 2v20M2 7h5M2 12h20M2 17h5M17 17h5M17 7h5'}]];
  const def=(id,name,build)=>N.def({id,name,section:'next-keepsakes',intent:name+' · owner-requested paid outputs; prices undecided; video encoder not installed.',build});
  const note=()=>h('p.bl-caption','Example journal · your real records stay on your phone.');
  const request=(ctx,kind,origin)=>{const s=N.state(ctx);s.premiumOutput=kind;s.premiumReturn=origin;N.go(ctx,'next-paywall');};
  N.outputRequest=request;
  def('next-premium-library','Premium · useful things to keep',ctx=>{
    const body=N.frame(ctx,{back:'next-home'});
    body.append(N.head('More from their moments.','Choose what would help with '+N.name(ctx)+'.'),h('div.bl-menu',
      N.row(ctx,'Ask about '+N.name(ctx),'Questions, chosen context and source records','message-circle',()=>N.openChat(ctx)),
      N.row(ctx,'A report to take','Read here free · PDF export with Premium','file-text',()=>N.go(ctx,'next-report-preview')),
      N.row(ctx,'A little film of them','Try a photo preview · MP4 export with Premium','film',()=>N.go(ctx,'next-highlight-editor')),
      N.row(ctx,'A Memory Book to keep','Read here free · designed PDF with Premium','image',()=>N.go(ctx,'next-memory-export'))),
      h('p.n-note',N.icon('shield-check',20),'Daily care, reminders, factual charts and raw CSV stay free.'),
      N.foot(N.button(ctx,'Back to journal',()=>N.go(ctx,'next-home'),{secondary:true})));
    N.enter(ctx,body);
  });
  def('next-report-preview','Report · free mobile preview',ctx=>{
    const body=N.frame(ctx,{back:'next-home'}),records=N.records(ctx,'today');
    const report=h('article.k-report',h('header',h('h2',N.name(ctx)+'’s care report'),B.paw(28)),h('p.bl-caption','14 October 2026 · selected records'));
    [['Recorded care',records.length],['Walks',records.filter(r=>r.type==='walk').length],['Meals',records.filter(r=>r.type==='meal').length]].forEach(([label,value])=>report.append(h('div.k-fact',h('span',label),h('strong',String(value)))));
    report.append(h('p.bl-caption','Caregiver observations. No health assessment is inferred.'));
    body.append(N.head('Their care, on one page.','Read your report here for free.'),note(),report,
      N.button(ctx,'PDF & sharing · Premium',()=>N.go(ctx,'next-report-export')),
      N.button(ctx,'CSV export · Free',()=>N.modal(ctx,{title:'Your raw records stay free',body:[h('p','CSV export stays available in the native app. This design preview does not export a journal file.')],actions:close=>[N.button(ctx,'Back to report',close)]}),{secondary:true}),
      N.foot(N.link(ctx,'Change report scope',()=>N.go(ctx,'report-scope'))));N.enter(ctx,body);
  });
  const pdfGate=(ctx,memory=false)=>{
    const body=N.frame(ctx,{back:memory?'next-premium-library':'next-report-preview'});
    const title=memory?'Keep a copy of their memories.':'Take their report with you.';
    body.append(N.tag('BarkLog Premium','file-text'),N.head(title,'PDF export, printing and sharing with Premium.'),
      h('article.k-report',h('header',h('h2',N.name(ctx)+(memory?'’s Memory Book':'’s care report')),B.paw(28)),h('p.bl-caption',memory?'Selected photos, your captions and their dates.':'The records and dates you chose.'),
        h('div.k-fact',N.icon('file-text'),h('span','A readable PDF')),h('div.k-fact',N.icon('send'),h('span','Share through your phone'))),
      N.foot(N.button(ctx,'See Premium',()=>request(ctx,memory?'memory':'report',memory?'next-memory-export':'next-report-preview')),
        N.button(ctx,'Keep reading here',()=>N.go(ctx,memory?'next-premium-library':'next-report-preview'),{secondary:true}),h('p.bl-caption','Your records and mobile preview stay free. No charge starts here.')));N.enter(ctx,body);
  };
  def('next-report-export','Report · paid PDF and sharing',ctx=>pdfGate(ctx));
  def('next-memory-export','Memory Book · paid PDF keepsake',ctx=>pdfGate(ctx,true));
  def('next-highlight-editor','Photo highlights · free preview, paid MP4',ctx=>{
    const body=N.frame(ctx,{back:'next-premium-library'}),s=N.state(ctx);
    const draft=s.highlight||(s.highlight={ratio:'portrait',selected:0,photos:[]});
    let selected=Math.min(draft.selected,Math.max(0,draft.photos.length-1)),playing=false,elapsed=0,token=0;
    const source=()=>draft.photos.length?draft.photos:(draft.examples||(draft.examples=[{name:'Example illustration 1'},{name:'Example illustration 2'},{name:'Example illustration 3'}]));
    const film=h('div.k-film',{role:'img','aria-label':'Photo highlight preview'}),time=h('span'),track=h('i'),strip=h('div.k-photos',{'aria-label':'Photos in your highlight'}),status=h('p.bl-caption',{role:'status'}),selectionLabel=h('p.bl-caption');
    let earlier,later;
    const caption=B.field(ctx,'Caption for this photo','',{placeholder:'Add your own words',maximum:100});
    ctx.on(caption.input,'input',()=>{source()[selected].caption=caption.input.value;paint();});
    const play=B.press(ctx,h('button',{type:'button','aria-label':'Play photo preview'},'Play preview'),()=>{
      playing=!playing;token++;play.textContent=playing?'Pause':'Play preview';play.setAttribute('aria-label',playing?'Pause photo preview':'Play photo preview');
      if(playing){if(F.reduced()){playing=false;status.textContent='Reduced motion is on. Choose each photo below to review it.';play.textContent='Play preview';play.setAttribute('aria-label','Play photo preview');return;}tick(token);}
      else film.classList.remove('is-playing');
    });
    const paint=()=>{
      const p=source()[selected];film.replaceChildren(h('img.k-visual',{src:p.url||'refinements/rive-dog/dog.svg',alt:p.name}));
      film.firstChild.classList.add('k-visual');film.classList.toggle('portrait',draft.ratio==='portrait');film.classList.toggle('is-playing',playing&&!F.reduced());
      if(p.caption)film.append(h('p.k-film-caption',p.caption));caption.input.value=p.caption||'';
      selectionLabel.textContent=draft.photos.length?'Your selected photos':'Example illustrations · choose your photos below';
      if(earlier)earlier.disabled=selected===0;if(later)later.disabled=selected===source().length-1;
      film.setAttribute('aria-label','Photo '+(selected+1)+' of '+source().length+': '+p.name);
      time.textContent=(selected+1)+' / '+source().length+' photos';track.style.transform='scaleX('+((selected+1)/source().length)+')';
      strip.replaceChildren(...source().map((p,i)=>B.press(ctx,h('button',{type:'button','aria-pressed':String(i===selected),'aria-label':'Preview photo '+(i+1)},h('img',{src:p.url||'refinements/rive-dog/dog.svg',alt:'',loading:'lazy',decoding:'async'}),h('span',String(i+1))),()=>{playing=false;token++;elapsed=0;selected=i;draft.selected=i;play.textContent='Play preview';play.setAttribute('aria-label','Play photo preview');paint();})));
    };
    const tick=current=>ctx.at(100,()=>{if(ctx.dead||!playing||current!==token)return;elapsed+=100;if(elapsed>=2800){elapsed=0;selected=(selected+1)%source().length;draft.selected=selected;paint();}tick(current);});
    const formats=h('div.k-format',{'role':'group','aria-label':'Video format'}),buttons=[['portrait','Portrait · 9:16'],['square','Square · 1:1']].map(([key,label])=>B.press(ctx,h('button',{type:'button','aria-pressed':String(draft.ratio===key)},label),()=>{draft.ratio=key;buttons.forEach((b,i)=>b.setAttribute('aria-pressed',String(['portrait','square'][i]===key)));paint();}));formats.append(...buttons);
    const input=h('input',{type:'file',accept:'image/*',multiple:true,hidden:true,'aria-label':'Choose highlight photos'});
    ctx.on(input,'change',()=>{const files=[...input.files].filter(f=>f.type.startsWith('image/')&&f.size<=20*1024*1024).slice(0,12);if(!files.length){status.textContent='Choose images up to 20 MB each. Your preview is unchanged.';return;}draft.photos.forEach(p=>URL.revokeObjectURL(p.url));draft.photos=files.map(f=>({name:f.name,url:URL.createObjectURL(f)}));selected=0;draft.selected=0;elapsed=0;playing=false;token++;play.textContent='Play preview';play.setAttribute('aria-label','Play photo preview');status.textContent=files.length+' photos selected. They stay in this local preview.';paint();});
    const reorder=delta=>{const photos=source(),next=selected+delta;if(next<0||next>=photos.length)return;[photos[selected],photos[next]]=[photos[next],photos[selected]];selected=next;draft.selected=next;playing=false;token++;play.textContent='Play preview';play.setAttribute('aria-label','Play photo preview');paint();};
    earlier=N.button(ctx,'Move earlier',()=>reorder(-1),{secondary:true});later=N.button(ctx,'Move later',()=>reorder(1),{secondary:true});
    body.append(N.head('Make a little film.','Their photos, in a moment to keep.'),h('p.bl-caption','Preview free · video export with Premium'),h('div.k-player',film,h('div.k-progress',track),h('div.k-play-row',play,time)),
      selectionLabel,strip,h('div.k-format',earlier,later),caption.el,formats,input,
      N.button(ctx,'Choose photos',()=>input.click(),{secondary:true}),status,
      N.foot(N.button(ctx,'Export video · Premium',()=>N.go(ctx,'next-highlight-gate')),N.link(ctx,'Keep my journal',()=>N.go(ctx,'next-home'))));paint();
    const pause=()=>{playing=false;token++;film.classList.remove('is-playing');play.textContent='Play preview';play.setAttribute('aria-label','Play photo preview');};
    ctx.on(document,'visibilitychange',()=>{if(document.hidden)pause();});
    const reduce=matchMedia('(prefers-reduced-motion: reduce)');ctx.on(reduce,'change',()=>{if(reduce.matches)pause();});
    const visible=new IntersectionObserver(entries=>{if(!entries[0].isIntersecting)pause();});visible.observe(film);
    const dispose=ctx.dispose;ctx.dispose=()=>{pause();visible.disconnect();dispose?.();};N.enter(ctx,body);
  });
  def('next-highlight-gate','Photo highlights · Premium export value',ctx=>{
    const body=N.frame(ctx,{back:'next-highlight-editor'}),s=N.state(ctx),count=s.highlight?.photos.length||3;
    body.append(N.tag('BarkLog Premium','film'),N.head('Keep their moments moving.','Export a film from the photos you choose.'),h('article.k-report',h('header',h('h2',N.name(ctx)+'’s highlights'),N.icon('film',30)),h('p.bl-caption',s.highlight?.photos.length?count+' selected photos':'Example: 3 illustrated moments'),h('div.k-fact',h('span','Export'),h('span','MP4 video')),h('div.k-fact',h('span','Format'),h('span',s.highlight?.ratio==='square'?'Square · 1:1':'Portrait · 9:16'))),
      N.foot(N.button(ctx,'See Premium',()=>request(ctx,'video','next-highlight-editor')),N.button(ctx,'Back to my preview',()=>N.go(ctx,'next-highlight-editor'),{secondary:true}),h('p.bl-caption','Design preview only. Native video rendering is the next implementation step.')));N.enter(ctx,body);
  });
  def('next-highlight-empty','Photo highlights · empty and permission recovery',ctx=>{
    const body=N.frame(ctx,{back:'next-premium-library'});body.append(N.head('Start with their photos.','Choose a few moments from your phone.'),h('div.k-empty',N.icon('image',44),h('p','Your photos will appear here.')),N.foot(N.button(ctx,'Choose photos',()=>N.go(ctx,'next-highlight-editor')),N.button(ctx,'Back to journal',()=>N.go(ctx,'next-home'),{secondary:true}),h('p.bl-caption','Only chosen photos are used. Cancelling keeps your journal unchanged.')));N.enter(ctx,body);
  });
  // Make the new outputs discoverable without changing the liked mascot/care card.
  const home=N.home;N.home=(ctx,options)=>{home(ctx,options);ctx.root.querySelector('.bl-home')?.append(h('div.bl-menu',N.row(ctx,'Reports & keepsakes','Mobile previews free · exports with Premium','file-text',()=>N.go(ctx,'next-premium-library'))));};
})();
