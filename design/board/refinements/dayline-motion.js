/* A separate board proposal. Only Home's crowded marks change composition.
 * The rest demonstrates already-selected Firm / Feel 07 motion for the KMP pass.
 * Preview records are in memory; no native database is accessed. */
(() => {
  const F=window.F,B=window.B,h=F.h,original=B.dayLine;
  window.BOARD.name='BarkLog · readable care strip · proposal 09';
  const home=window.BOARD.sections.find(s=>s.id==='home');
  home.intent='Proposal 09: each moment has a name and time. Swipe or use Earlier / Latest; tap a moment for its record. Quick care earns one icon landing and dog response after commit. Other compositions stay selected.';
  B.dayLine=(ctx,records=[],o={})=>{
    if(!['home','home-empty','home-loading','home-coach'].includes(ctx.screen.id)) return original(ctx,records,o);
    const list=[],loading=ctx.screen.id==='home-loading';
    const scroll=h('div.care-rail-scroll',{'aria-label':'Today’s care records'});
    let scrollFrame=0;
    const stop=()=>{cancelAnimationFrame(scrollFrame);scroll.style.scrollSnapType='';};
    const glide=to=>{
      cancelAnimationFrame(scrollFrame);
      scroll.style.scrollSnapType='none';
      const from=scroll.scrollLeft,target=Math.max(0,Math.min(to,scroll.scrollWidth-scroll.clientWidth));
      if(F.reduced()){scroll.scrollLeft=target;stop();return;}
      const start=performance.now(),duration=460*F.k(),ease=F.bezier('emph');
      const frame=now=>{if(ctx.dead)return;if(F.reduced()){scroll.scrollLeft=target;stop();return;}const t=Math.min(1,(now-start)/duration);scroll.scrollLeft=from+(target-from)*ease(t);if(t<1)scrollFrame=requestAnimationFrame(frame);else stop();};
      scrollFrame=requestAnimationFrame(frame);
    };
    ctx.on(scroll,'pointerdown',stop);
    ctx.on(scroll,'wheel',stop);
    const earlier=B.press(ctx,h('button',{type:'button','aria-label':'Show earlier care records'},F.icon('arrow-left',{size:14}),'Earlier'),()=>glide(scroll.scrollLeft-Math.max(110,scroll.clientWidth-40)),.86);
    const latest=B.press(ctx,h('button',{type:'button','aria-label':'Show latest care records'},'Latest',F.icon('arrow-right',{size:14})),()=>glide(scroll.scrollWidth),.86);
    [earlier,latest].forEach((button,i)=>{
      const arrow=button.querySelector('svg');let animation=null;
      const pose=()=>{const value=getComputedStyle(arrow).transform;return value==='none'?0:new DOMMatrix(value).m41;};
      const move=(x,spring=false)=>{const from=pose();animation?.cancel();animation=F.move(arrow,{x:from},{x},{...(spring?{spring:{response:.30,damping:.86}}:{duration:90,curve:'strong'}),ctx,fill:'forwards'});};
      ctx.on(button,'pointerdown',()=>{if(!button.disabled&&!F.reduced())move(i?4:-4);});
      ['pointerup','pointercancel','pointerleave','blur'].forEach(type=>ctx.on(button,type,()=>move(0,true)));
      ctx.on(button,'keydown',e=>{if(['Enter',' '].includes(e.key)&&!F.reduced())move(i?4:-4);});
      ctx.on(button,'keyup',()=>move(0,true));
    });
    const heading=h('div.care-rail-heading',earlier,h('strong','Today so far'),latest);
    const empty=h('p.care-rail-empty','Your first record will appear here.');
    const el=h('section.care-rail',{'aria-label':'Today so far'},heading,scroll,empty);
    const sync=()=>{earlier.disabled=scroll.scrollLeft<3;latest.disabled=scroll.scrollLeft+scroll.clientWidth>=scroll.scrollWidth-3;empty.hidden=loading||list.length>0;heading.hidden=loading||list.length===0;};
    ctx.on(scroll,'scroll',sync);
    el.add=(rec,ao={})=>{
      const t=B.type(rec.type);
      const mark=B.paint(h('span.care-rail-mark',{'aria-hidden':'true'},F.icon(t.icon,{size:14})),t.key);
      mark.style.background=`var(--${t.key}-dot)`;
      if(ao.hidden)mark.style.visibility='hidden';
      const button=B.paint(B.press(ctx,h('button.care-rail-entry',{type:'button','aria-label':`${t.label} at ${rec.time}. View record`},h('time',rec.time),h('span.care-rail-label',mark,t.label)),()=>{ctx.answers.record={...rec};mark.dataset.shared='record-icon';B.go(ctx,'record-detail','carry');},.86),t.key);
      scroll.append(button);list.push({rec,mark,button});
      if(ao.hidden){scroll.scrollLeft=scroll.scrollWidth;sync();}
      else sync();
      return mark;
    };
    el.remove=mark=>{const i=list.findIndex(x=>x.mark===mark);if(i>=0){list[i].button.remove();list.splice(i,1);}sync();};
    el.describe=sync;
    el.marks=()=>list.map(x=>x.mark);
    [...records].sort((a,b)=>BARK_V3.mins(a.time)-BARK_V3.mins(b.time)).forEach(rec=>el.add(rec));
    document.fonts.ready.then(()=>{if(ctx.dead)return;requestAnimationFrame(()=>{scroll.scrollLeft=scroll.scrollWidth;sync();});});
    el.reveal=(delay=0)=>{
      if(F.reduced())return;
      const visible=list.filter(({button})=>button.offsetLeft+button.offsetWidth>=scroll.scrollLeft&&button.offsetLeft<scroll.scrollLeft+scroll.clientWidth).slice(-5);
      visible.forEach(({button},i)=>F.move(button,{o:0,y:6},{o:1,y:0},{duration:420,delay:delay+i*55,curve:'decel',ctx,fill:'backwards'}));
    };
    if(ctx.screen.id==='home-loading'){
      el.classList.add('is-loading');heading.hidden=true;empty.hidden=true;
      el.insertBefore(h('div.care-rail-loading-head',{'aria-hidden':'true'},h('span'),h('span'),h('span')),scroll);
      for(let i=0;i<3;i++)scroll.append(h('div.care-rail-entry',{'aria-hidden':'true'}));
      el.setAttribute('aria-label','Reading today’s records');
    }
    return el;
  };
})();
