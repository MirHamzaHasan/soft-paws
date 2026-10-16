(() => {
  const F=window.F,B=window.B,h=F.h;
  const N=window.NEXT={F,B,h};
  N.state=ctx=>ctx.answers.next||(ctx.answers.next=structuredClone(window.BOARD.answers.next));
  N.name=ctx=>ctx.answers.dog||'Bruno';
  N.syncDog=ctx=>{const dog=ctx.answers.dogs?.find(d=>d.id===ctx.answers.selectedDogId);if(dog){const s=N.state(ctx);dog.name=N.name(ctx);dog.detail=s.stage+' · '+s.breed;}};
  N.go=(ctx,to)=>B.go(ctx,to);
  N.icon=(name,size=22)=>['paw-print','dog'].includes(name)?B.paw(size):F.icon(({'help-circle':'circle-question-mark',sprout:'trees',settings:'settings-2'}[name]||name),{size});
  Object.assign(window.F_ICONS,{
    'credit-card':[['rect',{x:2,y:4,width:20,height:16,rx:3}],['path',{d:'M2 10h20M6 15h3'}]],
    'wifi-off':[['path',{d:'m2 2 20 20M5 12a11 11 0 0 1 5-2M2 8a17 17 0 0 1 5-3M12 4a17 17 0 0 1 10 4M8.5 15.5a5 5 0 0 1 7 0M12 19h.01'}]],
  });
  N.button=(ctx,label,fn,o={})=>B.button(ctx,label,fn,o);
  N.link=(ctx,label,fn)=>B.link(ctx,label,fn);
  N.top=(ctx,back,step)=>h('div.n-top',back?B.press(ctx,h('button.n-icon',{type:'button','aria-label':'Back'},N.icon('arrow-left')),()=>N.go(ctx,back)):h('span'),step?h('div.n-progress',{role:'progressbar','aria-valuenow':step,'aria-valuemin':0,'aria-valuemax':10,'aria-label':'Setup progress'},h('span',{style:{transform:`scaleX(${step/10})`}})):h('span.n-wordmark',B.paw(18),'BarkLog'));
  N.frame=(ctx,{back,step,tab}={})=>{const body=B.frame(ctx,tab);ctx.root.classList.add('n-screen');body.classList.add('n-body');body.append(N.top(ctx,back,step));return body;};
  N.head=(title,sub)=>h('div.n-head',h('h1',title),sub?h('p.bl-sub',sub):null);
  N.foot=(...els)=>h('div.n-foot',...els);
  N.tag=(text,icon)=>h('span.n-tag',icon?N.icon(icon,14):null,text);
  N.dog=(ctx,size='large')=>{const dog=B.dogCharacter();dog.setAttribute('aria-hidden','true');const el=h('div.n-dog.'+size,{'data-shared':'next-dog'},dog);document.fonts.ready.then(()=>{if(!ctx.dead)B.animateDogCharacter(ctx,dog,{start:120});});return el;};
  N.enter=(ctx,body)=>{document.fonts.ready.then(()=>{if(ctx.dead||F.reduced())return;F.rise(ctx,[...body.children].slice(1,6),{distance:10,duration:520,stagger:55});});};
  N.def=(s)=>F.def({flow:true,enter:'step',...s,build(ctx){if(ctx.mode==='flow')N.activeContext=ctx;s.build(ctx);}});
  N.choice=(ctx,{title,sub,icon='check',selected=false,onPick,cls=''})=>{const check=h('span.n-choice-check',selected?N.icon('check',17):null);const el=B.press(ctx,h('button.n-choice'+(cls?'.'+cls:''),{type:'button','aria-pressed':String(selected)},h('span.n-choice-icon',N.icon(icon,25)),h('span.n-choice-copy',h('strong',title),sub?h('small',sub):null),check),()=>onPick?.(el),.86,true);return el;};
  N.setPicked=(el,on)=>{el.setAttribute('aria-pressed',String(on));const c=el.querySelector('.n-choice-check');c.replaceChildren(...(on?[N.icon('check',17)]:[]));if(on&&!F.reduced())c.animate([{transform:'scale(.5)'},{transform:'scale(1)'}],{duration:320,easing:'cubic-bezier(.16,1,.3,1)'});};
  N.row=(ctx,title,sub,icon,onTap)=>{const el=B.listRow(ctx,{title,sub,icon:'circle-check',onTap});el.querySelector('.bl-menu-icon svg')?.replaceWith(N.icon(icon,20));return el;};
  N.modal=(ctx,{title,body,actions,cls='',onDismiss})=>{const prev=document.activeElement;const panel=h('section.n-sheet-panel',{'tabindex':'-1'},h('div.n-sheet-grab'),h('h2',title),...body);const layer=h('div.n-sheet'+(cls?'.'+cls:''),{role:'dialog','aria-modal':'true','aria-label':title},panel);const close=()=>{layer.remove();prev?.focus();onDismiss?.();};if(cls==='n-context'){const content=h('div.n-context-scroll',...body);panel.replaceChildren(h('div.n-sheet-grab'),h('h2',title),content,h('div.n-context-actions',...actions(close)));}else panel.append(...actions(close));ctx.root.append(layer);panel.focus();if(!F.reduced())F.move(panel,{y:38,o:0},{y:0,o:1},{duration:420,curve:'emph',ctx});ctx.on(layer,'keydown',e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close();}if(e.key==='Tab'){const list=[...panel.querySelectorAll('button:not([disabled]),input,textarea,a[href]')];if(!list.length)return;const i=list.indexOf(document.activeElement);e.preventDefault();e.stopPropagation();list[(i+(e.shiftKey?-1:1)+list.length)%list.length].focus();}});return {layer,panel,close};};
  N.policy=(ctx,kind)=>N.modal(ctx,{title:kind==='terms'?'Terms · design draft':'Privacy · design draft',body:[h('p','This proposal uses an account for access and Premium identity. Care records stay on this device unless you explicitly choose records for an AI request. No cloud journal backup is included.'),h('p','A named AI provider, retention terms, usage allowance, final subscription prices and legal review are still required before release. This local board transmits no account or chat content to a service.')],actions:close=>[N.button(ctx,'Close',close)]});
  N.legal=ctx=>h('div.n-legal',N.link(ctx,'Terms',()=>N.policy(ctx,'terms')),N.link(ctx,'Privacy',()=>N.policy(ctx,'privacy')));
  N.native=(ctx,kind,onResult)=>{const android=new URLSearchParams(location.search).get('platform')==='android';const camera=kind==='camera';let settled=false;return N.modal(ctx,{title:android?(camera?'Allow BarkLog to take pictures and record video?':'Allow BarkLog to send you notifications?'):(camera?'“BarkLog” Would Like to Access the Camera':'“BarkLog” Would Like to Send You Notifications'),cls:'n-native'+(android?'.android':'.ios'),onDismiss:()=>{if(!settled)onResult('not-requested');},body:camera?[h('p','Take a photo for your dog’s profile or a care record.')]:[h('p',android?'Notifications may include reminders you set.':'Notifications may include alerts, sounds and icon badges. These can be configured in Settings.')],actions:close=>[N.button(ctx,android?'Allow':camera?'Allow':'Allow',()=>{settled=true;close();onResult('allowed');}),N.button(ctx,android?'Don’t allow':'Don’t Allow',()=>{settled=true;close();onResult('denied');},{secondary:true})]});};
  N.picker=(ctx,done)=>N.modal(ctx,{title:'Choose a dog photo',body:[h('p.bl-caption','Only the photo you choose is added.'),B.photo('Example dog photo')],actions:close=>[N.button(ctx,'Use this photo',()=>{N.state(ctx).photo=true;close();done?.();}),N.button(ctx,'Cancel',close,{secondary:true})]});
  const go=B.go;B.go=(ctx,to,...args)=>go(ctx,to==='home'?'next-home':to==='profile-hub'?'next-account-settings':to,...args);
})();
