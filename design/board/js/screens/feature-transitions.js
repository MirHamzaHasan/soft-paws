(() => {
  const F=window.F,B=window.B,h=F.h;
  const sources={'transition-setup-home':'dog-setup','transition-medication-given':'medication-detail','transition-calendar-edit':'care-task-detail','transition-trend-report':'trends-month','transition-photo-memory':'photo-detail'};
  const demo=(id,name,from,to,icon,copy)=>F.def({id,section:'motion',name,intent:`Real interactive journey, not a symbolic animation. Baton: ${copy} Open the card in the player and use its product controls. Reduced motion shows the same result.`,build(ctx){
    const source=F.SCREENS.find(s=>s.id===sources[id]);source.build({...ctx,screen:source});
  }});
  demo('transition-setup-home','Setup → Home','Dog name','Bruno’s day','user-round','The entered identity becomes the Home heading.');
  demo('transition-medication-given','Medication → administration','Example medication','Recorded as given','pill','The plan identity becomes a committed Timeline record.');
  demo('transition-calendar-edit','Calendar task → edit','20:00 task','Edit care task','calendar','The agenda item carries its name, date and recurrence.');
  demo('transition-trend-report','Trend → report','30-day range','Report preview','chart-no-axes-column-increasing','The selected dog, date range and exact values stay attached.');
  demo('transition-photo-memory','Photo → Memory Book','Local photo','October highlight','image','The chosen local photo becomes a traceable highlight.');
  F.def({id:'transition-notes-timeline',section:'motion',name:'Practice note → Timeline',intent:'Write a note and follow its dated walk mark into the real Timeline preview. No practice entry is persisted.',build(ctx){const source=F.SCREENS.find(s=>s.id==='onboarding-notes');source.build({...ctx,screen:source});}});
  for(const id of ['photo-detail','memory-highlight']){const s=F.SCREENS.find(x=>x.id===id),build=s.build;s.build=ctx=>{build(ctx);ctx.root.querySelector('.bl-photo')?.setAttribute('data-shared','local-photo');};}
  const given=F.SCREENS.find(s=>s.id==='medication-given'),buildGiven=given.build;given.build=ctx=>{buildGiven(ctx);ctx.root.querySelector('.bl-row .bl-event-icon')?.setAttribute('data-shared','medication');if(ctx.answers.medicationPlan)ctx.root.querySelector('.bl-status p').textContent=`14 October 2026 · 20:03 · ${ctx.answers.medicationPlan.name}`;};
  const task=F.SCREENS.find(s=>s.id==='care-task-form'),buildTask=task.build;task.build=ctx=>{buildTask(ctx);ctx.root.querySelector('.v4-folio-mark')?.setAttribute('data-shared','calendar-task');};
})();
