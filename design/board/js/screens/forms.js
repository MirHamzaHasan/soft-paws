(() => {
  const F=window.F,B=window.B,h=F.h;
  B.seq('forms',['log-chooser','form-meal','form-mood','form-weight']);
  F.def({id:'log-chooser',section:'forms',name:'Choose a care log',flow:true,enter:'push',intent:'The nine detailed record types already implemented. No medication or training placeholder.',build(ctx){
    const body=B.frame(ctx);body.append(B.back(ctx),B.heading('Add a care log','Choose what you observed.'),h('div.bl-records',B.types.map(t=>B.press(ctx,h('button.bl-row',{type:'button'},B.paint(h('span.bl-event-icon',F.icon(t.icon)),t.key),h('span.bl-row-content',t.label),F.icon('chevron-right',{size:16})),()=>B.go(ctx,'form-'+t.key),.86,true))));B.enter(ctx,body);
  }});
  B.form=(ctx,key,{editing=false,failure=false}={})=>{
    const t=B.type(key),body=B.frame(ctx),when=h('div.bl-fields',B.field(ctx,'Date','2026-10-14',{maximum:10}).el,B.field(ctx,'Time','18:20',{maximum:5}).el);
    body.append(B.back(ctx,editing?'record-detail':'log-chooser'),B.heading(`${editing?'Edit':'Log'} ${t.label.toLowerCase()}`,'Record what you observed.'));
    const form=h('form.bl-stack.bl-form');ctx.on(form,'submit',e=>e.preventDefault());
    const fields=h('div.bl-tight'),detailValues=[];
    const addField=(label,value='',o={})=>{const f=B.field(ctx,label,value,o);fields.append(f.el);detailValues.push(f.input);return f;};
    if(key==='poop')fields.append(B.choices(ctx,'Consistency · optional',['Not recorded','Firm','Formed','Soft','Loose','Watery'],'Not recorded'));
    if(key==='pee')fields.append(B.choices(ctx,'Amount · optional',['Not recorded','Small','Usual','Large'],'Not recorded'));
    if(key==='meal'){addField('Food · optional',editing?'Dry food':'',{placeholder:'e.g. dry food',maximum:200});addField('Portion and unit · optional',editing?'120 g':'',{placeholder:'e.g. 120 g',maximum:200});}
    if(key==='walk')addField('Duration in minutes · optional',editing?'24':'',{placeholder:'e.g. 24',numeric:true,maximum:4});
    if(key==='symptom'||key==='behavior')addField('What did you observe?','',{placeholder:key==='symptom'?'Describe what you noticed':'Describe what happened',multiline:true});
    if(key==='mood')fields.append(B.select(ctx,'Mood you observed',['Choose a mood','Calm','Playful','Low energy','Restless','Unsure']));
    if(key==='grooming')fields.append(B.select(ctx,'Grooming activity',['Choose an activity','Brushing','Bath','Nails','Other']));
    if(key==='weight'){addField('Measured weight','',{placeholder:'e.g. 14.6',numeric:true,maximum:16});fields.append(B.select(ctx,'Weight unit',['Choose kg or lb','kg','lb']));}
    const notes=B.field(ctx,'Notes · optional',editing?'Evening loop. Took the quieter path.':'',{placeholder:'Add anything you want to remember.',multiline:true});
    const timeDetails=h('div.bl-caption','Asia/Karachi · UTC+05:00. Newly entered repeated daylight-saving times use the first occurrence.');timeDetails.hidden=true;
    const timeLink=B.link(ctx,'Asia/Karachi · Time details',()=>{timeDetails.hidden=!timeDetails.hidden;},'chevron-down');timeLink.classList.add('bl-back');
    form.append(when,h('div.bl-tight',timeLink,timeDetails),h('hr.bl-rule'),fields,notes.el);
    const error=h('div.bl-error',{role:'alert'},h('h3',"Couldn't save this record"),h('p','Your draft is still here. Try again.'));error.hidden=!failure;form.append(error);
    const save=B.button(ctx,editing?'Save changes':'Save record',()=>{
      const message=key==='weight'&&!(Number(detailValues[0].value)>0)?'Enter a measured weight above zero.':
        (key==='symptom'||key==='behavior')&&!detailValues[0].value.trim()?'Describe what you observed.':
        fields.querySelector('select')?.selectedIndex===0?'Choose '+(key==='weight'?'kg or lb.':key==='mood'?'an observed mood.':'a grooming activity.'):null;
      if(message){error.hidden=false;error.replaceChildren(h('h3','Check this record'),h('p',message));error.scrollIntoView({block:'nearest'});return;}
      error.hidden=true;
      const detailLines=Array.from(fields.querySelectorAll('.bl-field')).map(field=>{
        const value=field.querySelector('input,textarea,select')?.value.trim();
        return value?`${field.querySelector('label').textContent.replace(' · optional','')}: ${value}`:null;
      }).filter(Boolean);
      const choice=fields.querySelector('button[aria-pressed="true"]')?.textContent;
      if(choice&&choice!=='Not recorded')detailLines.push(`${key==='poop'?'Consistency':'Amount'}: ${choice}`);
      ctx.answers.record={type:key,time:when.querySelectorAll('input')[1].value,details:detailLines,note:notes.input.value||'No notes recorded'};
      B.toast(ctx,'Preview saved · example only');ctx.at(300,()=>B.go(ctx,'record-detail'));
    });
    form.append(save,B.link(ctx,'Cancel',()=>B.go(ctx,editing?'record-detail':'home')));body.append(form,h('p.bl-caption','Caregiver observations, not a diagnosis.'));B.enter(ctx,body);
    if(failure)ctx.at(650,()=>error.scrollIntoView({block:'center'}));
  };
  F.def({id:'record-edit',section:'records',name:'Edit · keep the observation',flow:true,enter:'push',intent:'Existing identity/type stays unchanged. Date, time, typed detail and notes remain editable.',build(ctx){B.form(ctx,ctx.answers.record?.type||'walk',{editing:true});}});
  B.types.forEach(t=>F.def({id:'form-'+t.key,section:'forms',name:`${t.label} · detail form`,flow:true,enter:'push',intent:'Existing record fields only. Prototype controls and example data; no SQLite writes.',build(ctx){B.form(ctx,t.key);}}));
})();
