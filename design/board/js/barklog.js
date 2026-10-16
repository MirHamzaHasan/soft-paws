(() => {
  'use strict';
  const F = window.F, h = F.h, M = window.BARK_MOTION;
  const qa = new URLSearchParams(location.search);
  if (qa.has('textScale')) document.documentElement.style.setProperty('--text-scale', Math.max(1, Math.min(2, Number(qa.get('textScale')) || 1)));
  if (qa.get('reducedMotion') === 'true') F.setReduced(true);
  if (qa.get('reducedMotion') === 'false') F.setReduced(false);
  // Lucide paths from lucide-icons/lucide, ISC; same set as the template.
  Object.assign(window.F_ICONS, {
    utensils: [['path', { d: 'M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2' }], ['path', { d: 'M7 2v20' }], ['path', { d: 'M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7' }]],
    droplet: [['path', { d: 'M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z' }]],
    footprints: [['path', { d: 'M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 10 3.8 10 5.5c0 3.11-2 5.66-2 8.68V16a2 2 0 1 1-4 0Z' }], ['path', { d: 'M20 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C14.63 6 14 7.8 14 9.5c0 3.11 2 5.66 2 8.68V20a2 2 0 1 0 4 0Z' }], ['path', { d: 'M16 17h4' }], ['path', { d: 'M4 13h4' }]],
    pill: [['path', { d: 'm10.5 20.5 10-10a4.95 4.95 0 0 0-7-7l-10 10a4.95 4.95 0 0 0 7 7Z' }], ['path', { d: 'm8.5 8.5 7 7' }]],
  });
  const B = window.B = {};
  B.types = [['poop','Poop','circle-dashed'],['pee','Pee','droplet'],['meal','Meal','utensils'],['walk','Walk','footprints'],['symptom','Symptom','activity'],['mood','Mood','heart'],['behavior','Behavior','brain'],['grooming','Grooming','sparkles'],['weight','Weight','gauge']].map(([key,label,icon]) => ({key,label,icon}));
  B.timelineTypes = B.types.concat([
    {key:'medication',label:'Medication',icon:'pill'},
    {key:'training',label:'Training',icon:'graduation-cap'},
    {key:'photo',label:'Photo',icon:'image'},
  ]);
  B.type = key => B.timelineTypes.find(t => t.key === key) || {key:'note',label:'Care note',icon:'notebook-pen'};
  B.example = [
    { type: 'walk', time: '18:20', note: 'Evening loop · 24 minutes' }, { type: 'meal', time: '17:45', note: 'Dry food · 120 g' },
    { type: 'mood', time: '16:10', note: 'Calm after a nap' }, { type: 'pee', time: '13:05', note: 'Usual amount' },
    { type: 'meal', time: '08:15', note: 'Breakfast · 120 g' }, { type: 'poop', time: '07:40', note: 'Formed' }, { type: 'pee', time: '07:32', note: 'Morning garden break' },
  ];
  B.paw = (size = 20) => F.svg('svg', {width:size,height:size,viewBox:'0 0 32 32',fill:'currentColor','aria-hidden':'true'}, F.svg('ellipse',{cx:16,cy:23,rx:8,ry:6}),F.svg('ellipse',{cx:6,cy:14,rx:3.2,ry:4.2,transform:'rotate(-25 6 14)'}),F.svg('ellipse',{cx:12,cy:7,rx:3.2,ry:4.2}),F.svg('ellipse',{cx:21,cy:7,rx:3.2,ry:4.2}),F.svg('ellipse',{cx:27,cy:14,rx:3.2,ry:4.2,transform:'rotate(25 27 14)'}));
  B.dogPortrait = (size = 72, variant = 'bruno') => F.svg('svg', {
    width:size,height:size,viewBox:'0 0 96 96',class:`bl-dog-art is-${variant}`,role:'img','aria-label':'Illustrated dog portrait'
  },
    F.svg('path',{d:'M24 43C8 38 8 16 19 12c11-4 19 9 21 19',fill:'var(--dog-ear)'}),
    F.svg('path',{d:'M72 43c16-5 16-27 5-31-11-4-19 9-21 19',fill:'var(--dog-ear)'}),
    F.svg('path',{d:'M19 48c0-24 12-37 29-37s29 13 29 37c0 22-12 37-29 37S19 70 19 48Z',fill:'var(--dog-fur)'}),
    F.svg('path',{d:'M48 42c14 0 23 9 23 21 0 13-10 22-23 22s-23-9-23-22c0-12 9-21 23-21Z',fill:'var(--dog-muzzle)'}),
    F.svg('ellipse',{cx:37,cy:43,rx:3.3,ry:4.2,fill:'var(--dog-ink)'}),
    F.svg('ellipse',{cx:59,cy:43,rx:3.3,ry:4.2,fill:'var(--dog-ink)'}),
    F.svg('path',{d:'M41 58c2-4 12-4 14 0 1 4-3 7-7 7s-8-3-7-7Z',fill:'var(--dog-ink)'}),
    F.svg('path',{d:'M39 69c5 5 13 5 18 0',fill:'none',stroke:'var(--dog-ink)','stroke-width':'2.5','stroke-linecap':'round'}),
    F.svg('path',{d:'M30 79c7 7 29 7 36 0v10H30Z',fill:'var(--dog-collar)'})
  );
  B.paint = (el,key) => { ['bg','line','ink'].forEach(part => el.style.setProperty('--event-'+part,`var(--${key}-${part})`)); return el; };
  B.go = (ctx,to) => ctx.mode === 'flow' ? ctx.next({to}) : F.board.openPlayer(to);
  B.press = (ctx,el,onTap,tuning=M.releaseDamping,row=false) => {
    let anim, down=false;
    const move = target => { if(F.reduced()){anim?.cancel();el.style.transform='none';return;} const matrix=new DOMMatrix(getComputedStyle(el).transform), from={s:matrix.a,y:matrix.f}; anim?.cancel(); anim=F.move(el,from,target,down?{duration:M.pressDownMs,curve:'strong',ctx}:{spring:{response:M.releaseResponse,damping:tuning},ctx}); };
    ctx.on(el,'pointerdown',()=>{ if(el.disabled)return; down=true; el.classList.add('is-down'); if(!row)move({s:M.pressScale,y:M.pressDepth}); });
    const release=()=>{ if(!down)return; down=false; el.classList.remove('is-down'); if(!row)move({s:1,y:0}); };
    ['pointerup','pointerleave','pointercancel'].forEach(ev=>ctx.on(el,ev,release));
    ctx.on(el,'click',e=>{ if(!el.disabled){ctx.lastTap=el;onTap?.(e);} }); return el;
  };
  B.button = (ctx,label,onTap,o={}) => B.press(ctx,h('button.bl-btn'+(o.secondary?'.secondary':''),{type:'button',disabled:o.disabled,'aria-busy':o.busy?'true':undefined},o.icon?F.icon(o.icon,{size:18}):null,label),onTap,o.tuning);
  B.link = (ctx,label,onTap,icon) => B.press(ctx,h('button.bl-link',{type:'button'},label,icon?F.icon(icon,{size:16}):null),onTap,.86,true);
  B.brand = (ctx,o={}) => h('div.bl-brand',h('span.bl-wordmark',B.paw(),'BarkLog'),o.safety&&ctx?B.press(ctx,h('button.bl-brand-action',{type:'button','aria-label':'Open offline Safety Center'},F.icon('shield',{size:14}),'Safety'),()=>B.go(ctx,'safety-home'),.86,true):h('span.bl-local',F.icon('shield-check',{size:14}),'On this device'));
  B.heading = (title,sub) => {
    const words=String(title).trim().split(/\s+/),last=words.length>1?words.pop():null;
    const heading=last?h('h1',words.join(' ')+' ',h('span.bl-accent-word',last)):h('h1',title);
    return h('div.bl-tight.bl-heading',heading,sub?h('p.bl-sub',sub):null);
  };
  B.card = (...children) => h('div.bl-card.bl-tight',...children);
  B.section = (title,action) => h('div.bl-head',h('h2',title),action);
  B.frame = (ctx,tab) => {
    F.frame(ctx,{cls:'bark'+(!tab?' no-tabs':'')});
    ctx.root.classList.add(`bl-section-${ctx.screen.section}`,`bl-screen-${ctx.screen.id}`);
    const body=h('main.bl-scroll',{'aria-label':ctx.screen.name},h('div.bl-stack'));
    ctx.root.append(body);if(tab)ctx.root.append(B.tabs(ctx,tab));return body.firstChild;
  };
  B.tabs = (ctx,selected) => h('nav.bl-tabs',{'aria-label':'Journal tabs'},[['home','Home','layout-dashboard','home'],['timeline','Timeline','list','timeline'],['insights','Insights','chart-no-axes-column-increasing','insights-overview'],['profile','Profile','user-round','profile-hub']].map(([key,label,icon,target])=>B.press(ctx,h('button.bl-tab',{type:'button','aria-current':selected===key?'page':undefined},F.icon(icon,{size:21}),label),()=>{ if(key!==selected){ctx.haptic('selection');B.go(ctx,target);} },.86,true)));
  B.back = (ctx,to='home') => B.press(ctx,h('button.bl-link.bl-back',{type:'button'},F.icon('arrow-left',{size:16}),'Back'),()=>B.go(ctx,to),.86,true);
  B.row = (ctx,event,clickable=true) => { const t=B.type(event.type); const el=h(clickable?'button.bl-row':'div.bl-row',clickable?{type:'button','aria-label':`${t.label}, ${event.time}. ${event.note}. View record.`}:{}, B.paint(h('span.bl-event-icon',F.icon(t.icon,{size:21})),t.key),h('div.bl-row-content',h('div.bl-row-title',t.label,h('span.bl-row-time',event.time)),h('p.bl-row-note',event.note)),clickable?F.icon('chevron-right',{size:16}):null); return clickable?B.press(ctx,el,()=>{ctx.answers.record={...event};B.go(ctx,'record-detail');},.86,true):el; };
  B.toast = (ctx,text) => { ctx.root.querySelector('.bl-toast')?.remove(); const toast=h('div.bl-toast',{role:'status','aria-live':'polite'},F.icon('check',{size:18}),text); ctx.root.append(toast); F.rise(ctx,toast,{duration:240,stagger:0}); ctx.at(5000,()=>{ const a=F.move(toast,{o:1,y:0},{o:0,y:-6},{duration:180,curve:'exit',ctx}); a.finished.then(()=>toast.remove(),()=>{}); }); };
  B.enter = (ctx,body) => document.fonts.ready.then(()=>{if(!ctx.dead)F.rise(ctx,Array.from(body.children).slice(1,5),{duration:M.riseMs,stagger:M.riseStaggerMs,distance:M.riseDistance});});
  let nextField=0;
  B.field = (ctx,label,value='',o={}) => { const id='bl-field-'+ ++nextField; const input=h(o.multiline?'textarea.bl-input':'input.bl-input',{id,type:o.multiline?undefined:'text',placeholder:o.placeholder,inputmode:o.numeric?'decimal':undefined,maxlength:o.maximum||2000,disabled:o.disabled,'aria-invalid':o.error||undefined}); input.value=value; return {el:h('div.bl-field',h('label',{for:id},label),input),input}; };
  B.select = (ctx,label,choices,value='') => { const id='bl-field-'+ ++nextField; const select=h('select.bl-input',{id},choices.map(c=>h('option',{value:c},c))); if(value)select.value=value; return h('div.bl-field',h('label',{for:id},label),select); };
  B.choices = (ctx,label,values,initial) => { let selected=initial; const el=h('div.bl-tight',h('span.bl-label',label)); const buttons=values.map(value=>B.press(ctx,h('button.bl-chip',{type:'button','aria-pressed':value===selected?'true':'false'},value===selected?F.icon('check',{size:14}):null,value),()=>{ selected=value; buttons.forEach((b,i)=>{b.setAttribute('aria-pressed',values[i]===selected?'true':'false');b.replaceChildren(...(values[i]===selected?[F.icon('check',{size:14})]:[]),document.createTextNode(values[i]));});ctx.haptic('selection');},.86)); el.append(h('div.bl-choice-wrap',{role:'group','aria-label':label},buttons)); return el; };
  B.listRow = (ctx,{icon='circle-check',title,sub='',meta='',tone='',onTap,shared}) => {
    const tag=onTap?'button.bl-menu-row':'div.bl-menu-row';
    const el=h(tag,onTap?{type:'button','aria-label':[title,sub,meta].filter(Boolean).join('. ')}:{},h('span.bl-menu-icon.bl-icon-'+icon+(tone?'.'+tone:''),F.icon(icon,{size:20})),h('span.bl-menu-copy',h('span.bl-menu-title',title,meta?h('span.bl-menu-meta',meta):null),sub?h('span.bl-caption',sub):null),onTap?F.icon('chevron-right',{size:16}):null);
    if(shared)el.dataset.shared=shared;
    return onTap?B.press(ctx,el,onTap,.86,true):el;
  };
  B.status = (tone,title,text,icon) => h('div.bl-status.'+tone,F.icon(icon||({good:'circle-check-big',warn:'bell',bad:'circle-x',info:'info'}[tone]||'info'),{size:22}),h('div.bl-tight',h('h3',title),text?h('p.bl-caption',text):null));
  B.metric = (label,value,sub='') => h('div.bl-metric',h('span.bl-kicker',label),h('strong.bl-total',value),sub?h('span.bl-caption',sub):null);
  B.toggle = (ctx,label,sub,initial=false,onChange) => {
    let on=initial;
    const knob=h('span.bl-toggle-knob'),track=h('span.bl-toggle-track',knob),control=h('button.bl-toggle',{type:'button',role:'switch','aria-checked':String(on),'aria-label':label},track);
    const row=h('div.bl-toggle-row',h('div.bl-tight',h('h3',label),sub?h('p.bl-caption',sub):null),control);
    const render=(animate=false)=>{
      control.setAttribute('aria-checked',String(on));control.classList.toggle('is-on',on);
      const to=on?20:0,from=on?0:20;
      knob.style.transform=`translateX(${to}px)`;
      if(animate&&!F.reduced()){
        const motion=knob.animate([
          {transform:`translateX(${from}px) scaleX(1)`},
          {transform:`translateX(${from+(to-from)*.58}px) scaleX(1.24)`,offset:.48},
          {transform:`translateX(${to}px) scaleX(.94)`,offset:.76},
          {transform:`translateX(${to}px) scaleX(1)`}
        ],{duration:420,easing:'cubic-bezier(.23,1,.32,1)'});
        ctx.track(motion);
      }
    };
    B.press(ctx,control,()=>{on=!on;render(true);ctx.haptic('selection');onChange?.(on,row);},.86,true);render();row.control=control;return row;
  };
  B.confirm = (ctx,{title,text,keep='Keep it',action='Delete',danger=true,onAction}) => {
    const previous=document.activeElement,overlay=h('div.bl-dialog',{role:'dialog','aria-modal':'true','aria-label':title});
    const close=()=>{overlay.remove();previous?.focus();};
    const keepButton=B.button(ctx,keep,close),actionButton=B.button(ctx,action,()=>{close();onAction?.();},{secondary:true});
    if(danger)actionButton.classList.add('bl-danger');
    overlay.append(h('div.bl-dialog-panel',h('h2',title),h('p.bl-sub',text),keepButton,actionButton));ctx.root.append(overlay);keepButton.focus();
    ctx.on(overlay,'keydown',e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close();}if(e.key==='Tab'){e.preventDefault();e.stopPropagation();(document.activeElement===keepButton?actionButton:keepButton).focus();}});return overlay;
  };
  B.handoff = (ctx,{icon='smartphone',title,text,action='Continue',onTap}) => B.card(h('span.bl-handoff-icon',F.icon(icon,{size:28})),h('h2',title),h('p.bl-sub',text),B.button(ctx,action,onTap||(()=>B.toast(ctx,'Platform handoff · preview only')),{secondary:true}));
  B.photo = (label='Example photo · Bruno on a blue blanket',variant='one') => h('figure.bl-photo.'+variant,{'aria-label':label,role:'img'},h('div.bl-photo-scene',h('span.bl-photo-sun'),h('span.bl-photo-hill.is-back'),h('span.bl-photo-hill.is-front'),h('span.bl-photo-dog',B.dogPortrait(92,variant==='two'?'luna':'bruno'))),h('figcaption',label));
  B.chart = (values,labels,{max=Math.max(...values,1),label='Recorded care by week'}={}) => h('div.bl-chart',{role:'img','aria-label':`${label}. ${labels.map((l,i)=>`${l}: ${values[i]}`).join(', ')}.`},values.map((v,i)=>h('div.bl-chart-col',h('div.bl-chart-bar',{style:{height:`${Math.max(6,v/max*100)}%`}},h('span.bl-chart-value',String(v))),h('span.bl-caption',labels[i]))));
  B.seq = (section,ids) => F.def({id:'seq-'+section,section,name:'Play this section',seq:ids,intent:'Review sequence using example data only.'});
})();
