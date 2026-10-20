/* task047 · board-only review pass. Native screens wait for the owner's review. */
(() => {
  const N=window.NEXT,{h,F,B}=N;
  const plans=[{key:'weekly',name:'Weekly',price:'$2.99',period:'week'},{key:'monthly',name:'Monthly',price:'$6.99',period:'month'},{key:'yearly',name:'Yearly',price:'$39.99',period:'year'}];
  const replace=(id,build)=>{const screen=F.SCREENS.find(s=>s.id===id);screen.build=ctx=>{if(ctx.mode==='flow')N.activeContext=ctx;build(ctx);};};
  const frame=(ctx,back)=>{const body=N.frame(ctx,{back});ctx.root.classList.add('p47-screen');ctx.on(window,'barklog-motion-change',()=>{if(F.reduced())ctx.root.getAnimations({subtree:true}).forEach(a=>{try{a.finish();}catch{a.cancel();}});});return body;};
  const eyebrow=text=>h('p.p47-eyebrow',text);
  const heading=(title,sub)=>h('div.p47-intro',h('h1.p47-title',title),sub?h('p.p47-caption',sub):null);
  const note=text=>h('p.p47-free-note',N.icon('shield-check',18),h('span',text));
  const enter=(ctx,items)=>document.fonts.ready.then(()=>{if(!ctx.dead&&!F.reduced())F.rise(ctx,items,{duration:620,stagger:70,distance:16,curve:'emph'});});
  const dogHead=(ctx,kicker,name,detail)=>h('div.p47-dog-head',h('div.p47-dog-copy',eyebrow(kicker),h('strong.p47-dog-name',name),h('p.p47-dog-detail',detail)),N.planDog(ctx));
  const careRow=(icon,label,value,i)=>h('div.p47-care-row',N.icon(icon,21),h('div',h('small',label),h('span.p47-care-value',{'data-shared':'next-answer-'+i},value)));
  const premiumMark=()=>h('div.p47-premium-mark',h('span',B.paw(13)),'BarkLog Premium');
  const upcoming=()=>h('aside.p47-coming',{'aria-label':'Planned Premium feature · not available yet'},N.icon('scan-line',24),h('div',h('small','COMING SOON · PREMIUM'),h('strong','Pet food scanner'),h('p','Plain-English cat and dog food labels. Recall alerts for your saved pantry.'),h('small','Planned feature · not available yet.')));
  const benefits=()=>h('div.p47-benefits',[
    ['message-circle','Answers with their week in view','BarkLog AI & safety · shared with your consent.'],
    ['paw-print','A journal for every dog','Each new dog gets their own complete profile.'],
    ['file-text','Moments to keep and share','PDFs, Memory Books and video exports.'],
    ['map-pin','Find a vet nearby','Choose a clinic in Maps, then call.']
  ].map(([icon,title,sub])=>h('div.p47-benefit',h('span',N.icon(icon,17)),h('div',h('strong',title),h('p',sub)))));
  const free=(ctx)=>{const s=N.state(ctx);if(s.premiumReturn){const to=s.premiumReturn;delete s.premiumReturn;delete s.premiumOutput;N.go(ctx,to);return;}s.plan='free';N.go(ctx,s.account?'next-home':'next-ready');};
  replace('next-plan',ctx=>{
    const s=N.state(ctx),body=frame(ctx,'next-login');
    const intro=heading('A plan for '+N.name(ctx)+'.','The little things you want to keep track of.');
    const card=h('section.p47-care-card',{'aria-label':N.name(ctx)+'’s care plan'},dogHead(ctx,'Your everyday',N.name(ctx),[s.stage,s.breed].filter(Boolean).join(' · ')));
    const rows=[
      careRow('heart','What matters to you',s.goals.join(' · ')||'Daily care',0),
      careRow('clock','Your check-ins',s.rhythm,1),
      careRow('bell','Reminders',s.notifications==='allowed'&&s.remindersEnabled?s.days.join(', ')+' · '+s.time:'Off · add one whenever it helps',2),
      careRow('message-circle','Questions you’re curious about',s.focuses.join(' · ')||'Your questions',3)
    ];
    card.append(...rows,B.press(ctx,h('button.p47-profile-link',{type:'button'},'Review '+N.name(ctx)+'’s full profile',N.icon('arrow-up-right',18)),()=>N.modal(ctx,{title:N.name(ctx)+'’s profile details',cls:'n-context',body:[N.profileView(ctx)],actions:close=>[N.button(ctx,'Close profile',close)]}),.86,true));
    const foot=N.foot(N.button(ctx,'Compare plans',()=>N.go(ctx,'next-paywall'),{icon:'arrow-right'}),N.link(ctx,'Start with the free journal',()=>free(ctx)));
    body.append(intro,card,note('Your journal, on-phone reports and raw CSV stay free.'),foot);
    document.fonts.ready.then(()=>{if(ctx.dead||F.reduced())return;
      F.move(intro,{y:10,o:0},{y:0,o:1},{duration:520,curve:'strong',ctx,fill:'backwards'});
      F.move(card,{y:24,o:0},{y:0,o:1},{duration:620,delay:80,curve:'emph',ctx,fill:'backwards'});
      rows.forEach((row,i)=>F.move(row.querySelector('.p47-care-value'),{y:25,o:0},{y:0,o:1},{duration:900,delay:180+i*170,curve:'emph',ctx,fill:'backwards'}));
      F.move(foot,{y:10,o:0},{y:0,o:1},{duration:520,delay:650,curve:'decel',ctx,fill:'backwards'});
    });
  });
  replace('next-paywall',ctx=>{
    const s=N.state(ctx),body=frame(ctx,s.premiumReturn||'next-plan');
    ctx.root.classList.add('p47-paywall');
    body.firstChild.append(B.press(ctx,h('button.n-icon',{type:'button','aria-label':'Continue with free journal'},N.icon('x')),()=>free(ctx)));
    const dog=N.planDog(ctx),hero=h('div.p47-hero',h('div',premiumMark(),h('h1.p47-title','More for',h('br'),N.name(ctx)+'.')),dog);
    const grid=h('div.p47-price-grid',{role:'group','aria-label':'Subscription plans · full recurring prices in USD'}),pick=h('span.p47-price-pick',{'aria-hidden':'true'});grid.append(pick);
    const price=h('strong',plans.find(p=>p.key===s.billing)?.price||'$6.99'),period=h('span');
    const summary=h('p.p47-price-summary',{'aria-live':'polite','aria-atomic':'true'},price,period),buttons=[];
    let animation,disposed=false;
    const locate=(animate=true)=>{
      if(ctx.dead||disposed)return;
      const index=Math.max(0,plans.findIndex(p=>p.key===s.billing)),target=buttons[index];if(!target)return;
      const x=target.offsetLeft-6,w=target.offsetWidth;
      const current=new DOMMatrix(getComputedStyle(pick).transform);animation?.cancel();
      pick.style.width=w+'px';
      if(!animate||F.reduced()){pick.style.transform=F.tf({x});return;}
      animation=F.move(pick,{x:current.e},{x},{spring:{response:.42,damping:.86},ctx,keep:true});
    };
    const select=(p,animate=true)=>{
      s.billing=p.key;buttons.forEach((button,i)=>{const on=plans[i].key===p.key;button.setAttribute('aria-pressed',String(on));button.querySelector('.p47-pick-check').replaceChildren(...(on?[N.icon('check',10)]:[]));});
      price.getAnimations({subtree:true}).forEach(a=>a.cancel());
      if(animate){F.roll(price,p.price);price.getAnimations({subtree:true}).forEach(a=>ctx.track(a));}else{price.textContent=p.price;price._text=p.price;}
      period.textContent='USD / '+p.period;locate(animate);if(animate){ctx.haptic('selection');dog.motion.act('curious');}
    };
    plans.forEach(p=>{const button=B.press(ctx,h('button.p47-price-choice',{type:'button','aria-label':p.name+', '+p.price+' US dollars per '+p.period,'aria-pressed':'false'},h('span.p47-price-label',h('span.p47-pick-check',{'aria-hidden':'true'}),p.name),h('strong',p.price),h('small','/ '+p.period)),()=>select(p),.86,true);buttons.push(button);grid.append(button);});
    const billing=h('section.p47-billing',{'aria-label':'Choose billing frequency'},grid,summary);
    const cta=N.button(ctx,'Continue with '+s.billing,()=>{},{disabled:true});
    billing.append(cta);
    const foot=h('div.p47-pay-actions',N.button(ctx,'Continue with free journal',()=>free(ctx),{secondary:true}),h('p.p47-purchase-note','Store setup pending · no payment starts here.'));
    body.append(hero,billing,benefits(),upcoming(),note('Existing dog journals and emergency contacts stay free.'),h('div.p47-legal',N.link(ctx,'Restore',()=>N.go(ctx,'next-restore')),N.link(ctx,'Terms',()=>N.policy(ctx,'terms')),N.link(ctx,'Privacy',()=>N.policy(ctx,'privacy'))),h('p.p47-purchase-note','Subscriptions renew until cancelled in your store.'));ctx.root.append(foot);
    ctx.on(grid,'click',()=>{cta.textContent='Continue with '+s.billing;});
    const resize=new ResizeObserver(()=>{locate(false);ctx.root.style.setProperty('--p47-actions-height',foot.offsetHeight+'px');});resize.observe(grid);resize.observe(foot);
    ctx.on(window,'barklog-motion-change',()=>{locate(false);if(F.reduced()){price.getAnimations({subtree:true}).forEach(a=>a.cancel());price.textContent=plans.find(p=>p.key===s.billing).price;}});
    const oldDispose=ctx.dispose.bind(ctx);ctx.dispose=()=>{disposed=true;resize.disconnect();animation?.cancel();oldDispose();};
    select(plans.find(p=>p.key===s.billing)||plans[1],false);
    document.fonts.ready.then(()=>locate(false));enter(ctx,[hero,billing,body.querySelector('.p47-benefits')]);
  });
  replace('next-manage-plan',ctx=>{
    const s=N.state(ctx),paid=s.plan==='premium',body=frame(ctx,'next-account-settings');
    const intro=heading('Your BarkLog.','A home for '+N.name(ctx)+'’s everyday.');
    const card=h('section.p47-membership',{'aria-label':'Your current plan'},dogHead(ctx,paid?'Premium · preview':'Your plan',paid?'Premium':'Free journal','For '+N.name(ctx)+' · '+s.breed),h('div.p47-member-status',h('div',h('strong',paid?'Example Premium access':'No subscription'),h('p.p47-caption',paid?'Design preview · no purchase or renewal.':'Keep logging at your own pace.')),h('span.p47-status-dot',N.icon('check',16))));
    const included=h('section.p47-included',h('h2',paid?'Alongside your journal':'Always here for you'),(paid?['BarkLog AI & safety, with your consent','Additional dog profiles','PDFs, Memory Books & video exports']:['Care logs, photos and reminders','Timelines, charts and on-phone reports','Your records, with raw CSV export']).map(text=>h('div.p47-included-item',N.icon('check',17),h('span',text))));
    const foot=N.foot(N.button(ctx,paid?'Manage in store':'Explore Premium',()=>{if(!paid)s.premiumReturn='next-manage-plan';N.go(ctx,paid?'next-store-manage':'next-paywall');},{icon:paid?'external-link':'arrow-right'}),paid?N.button(ctx,'Cancel subscription',()=>N.go(ctx,'next-cancel'),{secondary:true}):N.link(ctx,'Restore purchases',()=>N.go(ctx,'next-restore')),N.link(ctx,'Back to my journal',()=>N.go(ctx,'next-home')));
    body.append(intro,card,included);if(paid)body.append(upcoming());body.append(note('Your existing dog journals stay with you, whatever you choose.'),foot);enter(ctx,[intro,card,included,foot]);
  });
})();
