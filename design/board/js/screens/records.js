(() => {
  const F=window.F,B=window.B,h=F.h;
  B.seq('records',['record-detail','record-edit']);
  B.detail=(ctx,confirm=false)=>{
    const body=B.frame(ctx),record=ctx.answers.record||B.example[0],t=B.type(record.type),dog=ctx.answers.dog||'Bruno';B.paint(ctx.root,t.key);
    const day=record.dayList||(ctx.answers.records||B.example),when=record.day||'Wednesday 14 October';
    const onDay=day.some(r=>r.time===record.time&&r.type===record.type)?day:[record,...day];
    body.append(B.back(ctx,'timeline'),h('div.v3-record-hero',B.paint(h('span.v3-record-icon',{'data-shared':'record-icon'},F.icon(t.icon,{size:28})),t.key),B.heading(t.label,`${dog} · ${when} · ${record.time}`)));
    const fact=(k,v)=>h('div.v3-fact',h('dt',k),h('dd',v));
    const details=record.details?.length?record.details.join(' · '):(record.details?'No additional details recorded.':record.note);
    const line=B.dayLine(ctx,onDay,{highlight:record.time,label:`${t.label} at ${record.time} among ${dog}’s day`});
    const notes=B.card(h('span.v4-eyebrow','A NOTE FOR LATER'),h('p.v4-record-note',record.details?record.note:'No additional notes recorded.'));notes.classList.add('v4-record-notes-card');
    if(record.details?.length)body.append(h('div.v4-record-tags',record.details.map(v=>h('span',v))));
    body.append(notes,
      B.card(h('div.bl-head',h('h2','On the day'),h('span.bl-caption',`${onDay.length} records`)),line),
      B.card(h('dl.v3-facts',{style:{margin:0}},fact('Details',details),fact('Recorded',`${when.replace(/^\w+ /,'')} · ${record.time}`),fact('Saved','On this device · original record'))));
    if(record.photo)body.append(B.photo('Sample attachment · local design example','one'));
    document.fonts.ready.then(()=>{if(!ctx.dead)line.reveal(ctx.via==='carry'?520:260);});
    const edit=B.button(ctx,'Edit record',()=>B.go(ctx,'record-edit'),{icon:'pencil'});
    const remove=B.link(ctx,'Delete record',()=>dialog(),'trash');remove.classList.add('bl-danger');
    body.append(edit,remove);B.enter(ctx,body);
    function dialog(){
      const previous=document.activeElement;
      const overlay=h('div.bl-dialog',{role:'dialog','aria-modal':'true','aria-label':`Delete this ${t.label.toLowerCase()} record?`});
      const close=()=>{overlay.remove();previous?.focus();};
      const keep=B.button(ctx,'Keep record',close),del=B.button(ctx,'Delete permanently',()=>{const list=[...(ctx.answers.records||B.example)],index=list.findIndex(r=>(record.id&&r.id===record.id)||(!record.id&&r.type===record.type&&r.time===record.time));if(index>=0)list.splice(index,1);ctx.answers.records=list;delete ctx.answers.record;close();B.go(ctx,'timeline');},{secondary:true});del.classList.add('bl-danger');
      overlay.append(h('div.bl-dialog-panel',h('h2',`Delete this ${t.label.toLowerCase()} record?`),h('p.bl-sub',`Removes this record for ${ctx.answers.dog||'Bruno'} at ${record.time}. Other records stay saved. This cannot be undone.`),keep,del));
      ctx.root.append(overlay);keep.focus();
      ctx.on(overlay,'keydown',e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close();}if(e.key==='Tab'){e.preventDefault();e.stopPropagation();(document.activeElement===keep?del:keep).focus();}});
    }
    if(confirm)ctx.at(100,dialog);
  };
  F.def({id:'record-detail',section:'records',name:'Record · facts and actions',flow:true,enter:'push',intent:'T2. Observation, notes and recorded time. Destructive action is separate and confirmed.',build(ctx){B.detail(ctx);}});
  F.def({id:'delete-confirmation',section:'records',name:'Delete · safer action first',intent:'A preview dialog only. Never deletes the device journal.',build(ctx){B.detail(ctx,true);}});
})();
