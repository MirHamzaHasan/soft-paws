(() => {
  const F=window.F,B=window.B,h=F.h;
  const dogs=ctx=>ctx.answers.dogs||window.BOARD.answers.dogs;
  const menu=(ctx,rows)=>h('div.bl-menu',rows.map(r=>B.listRow(ctx,r)));
  B.seq('profiles',['profile-hub','dog-switcher','profile-settings']);
  F.def({id:'profile-hub',section:'profiles',name:'Profile hub · local v1',flow:true,enter:'cut',intent:'The dog, their health records and supporting tools are grouped without turning Profile into a fifth dashboard.',build(ctx){
    const body=B.frame(ctx,'profile'),dog=dogs(ctx).find(d=>d.id===(ctx.answers.selectedDogId||'bruno'))||dogs(ctx)[0];
    body.append(B.brand(ctx,{safety:true}),B.heading('Profile','Dog details and this device’s journal.',{display:true}),B.press(ctx,h('button.v3-profile-hero',{type:'button','aria-label':`Switch dog. ${dog.name} selected.`},h('span.v3-day-dog',{'data-shared':'dog'},B.dogPortrait(92,dog.id==='luna'?'luna':'bruno')),h('div.bl-tight',h('h2',dog.name),h('p.bl-caption',dog.detail||'Details optional'),h('span.v3-switch','Switch dog',F.icon('chevron-right',{size:14})))),()=>B.go(ctx,'dog-switcher'),.86,true),
      menu(ctx,[
        {icon:'pill',title:'Health records',sub:'Medication and vaccination',onTap:()=>B.go(ctx,'health-records')},
        {icon:'calendar',title:'Care calendar',sub:'Tasks and opt-in reminders',onTap:()=>B.go(ctx,'care-calendar')},
        {icon:'graduation-cap',title:'Training',sub:'Positive-reinforcement sessions',tone:'training',onTap:()=>B.go(ctx,'training-catalog')},
        {icon:'image',title:'Photo journal',sub:'Photos and baselines',tone:'photo',onTap:()=>B.go(ctx,'photo-journal')},
        {icon:'receipt',title:'Expenses',sub:'Local receipts and totals',onTap:()=>B.go(ctx,'expenses-list')},
        {icon:'heart',title:'Memory Book',sub:'Highlights from your records',onTap:()=>B.go(ctx,'memory-book')},
        {icon:'shield',title:'Safety Center',sub:'Offline guidance and contacts',onTap:()=>B.go(ctx,'safety-home')},
      ]),menu(ctx,[{icon:'settings-2',title:'Settings & storage',sub:'Accessibility, export and deletion',onTap:()=>B.go(ctx,'profile-settings')}]),h('p.bl-caption','All examples on this board are local preview data.'));
    B.enter(ctx,body);
  }});
  F.def({id:'dog-switcher',section:'profiles',name:'Dog switcher · every scope updates',flow:true,enter:'push',intent:'A dog selection updates Home, Timeline, Insights, Calendar, records and exports in the same preview state.',build(ctx){
    const body=B.frame(ctx);body.append(B.back(ctx,'profile-hub'),B.heading('Choose a dog','Every dog-scoped screen follows this choice.'));
    const list=h('div.bl-menu');dogs(ctx).forEach(d=>list.append(B.listRow(ctx,{icon:d.id===(ctx.answers.selectedDogId||'bruno')?'circle-check':'user-round',title:d.name,sub:d.detail,meta:d.id===(ctx.answers.selectedDogId||'bruno')?'Selected':'',onTap:()=>{B.switchDog(ctx,d.id);B.toast(ctx,`${d.name} selected · preview only`);ctx.at(280,()=>B.go(ctx,'profile-hub'));}})));body.append(list,B.button(ctx,'Add another dog',()=>B.go(ctx,'dog-add'),{secondary:true,icon:'plus'}));B.enter(ctx,body);
  }});
  const dogForm=(ctx,editing)=>{
    const dog=dogs(ctx).find(d=>d.id===(ctx.answers.selectedDogId||'bruno'))||{},body=B.frame(ctx),name=B.field(ctx,'Dog’s name',editing?(ctx.answers.dog||'Bruno'):'',{placeholder:'e.g. Luna',maximum:80}),breed=B.field(ctx,'Breed or mix · optional',editing?(dog.breed||''):'',{maximum:100}),age=B.field(ctx,'Birthday or estimate · optional',editing?(dog.age||''):'',{placeholder:'A date or your estimate',maximum:60}),sex=B.select(ctx,'Sex · optional',['Not recorded','Female','Male'],dog.sex);
    body.append(B.back(ctx,editing?'profile-settings':'dog-switcher'),B.heading(editing?'Edit dog':'Add a dog','Only the name is required.'),name.el,breed.el,age.el,sex,B.button(ctx,editing?'Save details':'Add dog',()=>{
      if(!name.input.value.trim())return B.toast(ctx,'Enter a dog name.');
      const id=editing?(ctx.answers.selectedDogId||'bruno'):'dog-'+Date.now(),next={id,name:name.input.value.trim(),breed:breed.input.value.trim(),age:age.input.value.trim(),sex:sex.querySelector('select').value};
      next.detail=[next.breed,next.age].filter(Boolean).join(' · ')||'Details optional';
      ctx.answers.dogs=editing?dogs(ctx).map(d=>d.id===id?{...d,...next}:d):[...dogs(ctx),next];
      if(!editing)B.switchDog(ctx,id);ctx.answers.dog=next.name;B.toast(ctx,'Preview saved · example only');ctx.at(260,()=>B.go(ctx,'profile-hub'));
    }),h('p.bl-caption','You can add or change optional details later.'));B.enter(ctx,body);
  };
  F.def({id:'dog-add',section:'profiles',name:'Add dog · name first',intent:'A second dog starts with the same minimal requirement as first run.',build(ctx){dogForm(ctx,false);}});
  F.def({id:'dog-edit',section:'profiles',name:'Edit profile · optional later details',intent:'Optional identity details stay editable and never block logging.',build(ctx){dogForm(ctx,true);}});
  F.def({id:'profile-settings',section:'profiles',name:'Settings · storage and access',flow:true,enter:'push',intent:'Local-storage truth, export access and accessibility settings live together; there are no account or cloud controls.',build(ctx){
    const body=B.frame(ctx);body.append(B.back(ctx,'profile-hub'),B.heading('Settings','This device and how BarkLog feels.'),menu(ctx,[{icon:'pencil',title:'Edit '+(ctx.answers.dog||'Bruno'),onTap:()=>B.go(ctx,'dog-edit')},{icon:'file-down',title:'Export journal',sub:'CSV or PDF before deletion',onTap:()=>B.go(ctx,'vet-prep')}]),B.card(h('div.bl-head',h('h2','Stored on this device'),F.icon('shield-check',{size:24})),h('p.bl-sub','No account, cloud sync or remote backup. Deleting the app or its data can remove this journal.')),
      B.card(h('h2','Accessibility'),B.toggle(ctx,'Reduce motion','Use final states without travel.',!!ctx.answers.reduceMotion,on=>{ctx.answers.reduceMotion=on;B.toast(ctx,on?'Reduced-motion setting on · preview only':'Reduced-motion setting off · preview only');}),B.toggle(ctx,'Stronger contrast','Preview uses system theme and clear borders.',!!ctx.answers.strongerContrast,on=>{ctx.answers.strongerContrast=on;ctx.root.classList.toggle('bl-strong-contrast',on);})),menu(ctx,[{icon:'trash',title:'Delete this dog',sub:`${ctx.answers.dog||'Bruno'} and their records`,tone:'danger',onTap:()=>B.go(ctx,'delete-dog')},{icon:'trash',title:'Delete all local data',sub:'Every dog and record on this device',tone:'danger',onTap:()=>B.go(ctx,'delete-all-data')}]),h('p.bl-caption','BarkLog · local v1 design preview'));B.enter(ctx,body);
  }});
  const deleteScreen=(id,title,text,action)=>F.def({id,section:'profiles',name:title,intent:'The exact scope and permanence are stated. Export remains available before the destructive action.',build(ctx){const dog=ctx.answers.dog||'Bruno',heading=id==='delete-dog'?`Delete ${dog}?`:title,description=id==='delete-dog'?`Removes ${dog} and every record linked to them. Other dogs stay saved.`:text;const body=B.frame(ctx);body.append(B.back(ctx,'profile-settings'),B.heading(heading,'This cannot be undone.'),B.status('bad','Local data would be removed',description,'trash'),B.button(ctx,'Export first',()=>B.go(ctx,'vet-prep'),{secondary:true,icon:'file-down'}),B.button(ctx,action,()=>B.confirm(ctx,{title:heading,text:description,action,onAction:()=>B.toast(ctx,'Preview only · no device data changed')}),{secondary:true}),h('p.bl-caption','The design board never reads or deletes the app database.'));B.enter(ctx,body);}});
  deleteScreen('delete-dog','Dog deletion · scoped confirmation','Removes this dog and every record linked to them. Other dogs stay saved.','Delete dog permanently');
  deleteScreen('delete-all-data','Delete every local journal?','Removes all dogs, care records, tasks, photos, expenses and settings from this device.','Delete all data permanently');
  const hub=F.SCREENS.find(s=>s.id==='profile-hub'),buildHub=hub.build;hub.build=ctx=>{buildHub(ctx);const dog=dogs(ctx).find(d=>d.id===ctx.answers.selectedDogId);if(dog?.samplePhoto)ctx.root.querySelector('.v3-day-dog')?.replaceChildren(B.sampleAvatar(92));};
})();
