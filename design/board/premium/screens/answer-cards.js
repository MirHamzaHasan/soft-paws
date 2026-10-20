/* task041: authored board examples only. No journal, model, auth or network access. */
(() => {
  const N=window.NEXT,{F,B,h}=N;
  const SECTION='next-answer-cards',PERIOD='13–19 Oct',DAYS=['Tue','Wed','Thu','Fri','Sat','Sun','Mon'];
  const query=new URLSearchParams(location.search),theme=query.get('answerTheme');
  if(['light','dark'].includes(theme))window.addEventListener('load',()=>document.documentElement.dataset.theme=theme);
  BOARD.sections.splice(4,0,{id:SECTION,title:'04c · BarkLog AI · answer cards',intent:'19 Oct review: keep compact chat. Automatically include the current dog’s profile and seven days after clear AI consent. Answer first, exact related logs second, general guidance separate. Product placement is a separate future-only example.'});
  BOARD.researchTitles['answer-cards']='Answer cards · what we took';
  BOARD.research['answer-cards']=[
    {...BOARD.research['premium-chat'][0],took:'Reuse the already-reviewed writing column and compact composer. Add structure inside the response, keeping the existing chat shell.'},
    {...BOARD.research['premium-chat'][1],took:'Keep the question visible and a follow-up within reach. Original journal records remain separate from the conversation.'},
    {title:'BarkLog · a week with sources',took:'The owner requested automatic profile + seven days, relevant previous-log cards and the BarkLog AI name. Show an exact count, dates and readable original notes. Missing logs are unknown care, never proof a care action did not happen.'},
    {title:'Dogs Trust · general handling guidance',took:'The brushing example uses brief, reward-based handling and lets the dog move away. It is general education, separate from the caregiver’s recorded observations.',url:'https://www.dogstrust.org.uk/dog-advice/health-wellbeing/at-home/how-to-handle-your-dog'},
  ];
  // Deliberately authored, bounded fixture. Every displayed count derives from these rows.
  const FIXTURE=[
    ['13','08:10','walk','Morning loop · 18 minutes'],['13','18:20','walk','Evening loop · 22 minutes'],
    ['14','08:15','meal','Breakfast · usual food'],['14','19:10','grooming','A few brush strokes, then walked away'],
    ['15','18:05','walk','Quiet route · stopped to sniff'],['15','18:40','meal','Evening meal'],
    ['16','08:20','walk','Morning loop · 20 minutes'],['16','19:00','grooming','Short brush session · paused when he moved away'],
    ['17','08:10','meal','Breakfast · usual food'],
    ['18','08:05','walk','Morning loop · 15 minutes'],['18','18:30','walk','Park loop · sniffing breaks'],
    ['19','18:20','walk','Evening loop · 24 minutes'],
  ].map(([day,time,type,note],i)=>({id:'answer-example-'+i,date:'2026-10-'+day,time,type,note})).sort((a,b)=>(b.date+b.time).localeCompare(a.date+a.time));
  N.answerCardFixture=structuredClone(FIXTURE);
  // Keep a nested profile sheet's background out of keyboard and screen-reader order.
  const sheet=(ctx,options)=>{
    const previous=document.activeElement,behind=[...ctx.root.querySelectorAll('.n-sheet:not([inert])')];
    behind.forEach(el=>{el.inert=true;el.setAttribute('aria-hidden','true');});
    return N.modal(ctx,{...options,onDismiss:()=>{behind.forEach(el=>{el.inert=false;el.removeAttribute('aria-hidden');});if(previous?.isConnected)previous.focus({preventScroll:true});options.onDismiss?.();}});
  };
  const sourceRow=r=>h('div.ac-source-record',N.icon(B.type(r.type).icon,20),h('div',h('strong',B.type(r.type).label+' · '+r.date.slice(8)+' Oct, '+r.time),h('p',r.note)));
  const action=(ctx,label,fn)=>B.press(ctx,h('button.ac-action',{type:'button'},h('span',label),N.icon('chevron-right',16)),fn,.86,true);
  const sourceSheet=(ctx,records,title)=>sheet(ctx,{title,cls:'n-context',body:[h('p.bl-caption',PERIOD+' 2026 · authored example records'),...records.map(sourceRow)],actions:close=>[N.button(ctx,'Back to answer',close)]});
  const profileSheet=ctx=>sheet(ctx,{title:N.name(ctx)+'’s profile',cls:'n-context',body:[N.profileView(ctx),h('p.bl-caption','Profile details you saved. No condition is inferred from these notes.')],actions:close=>[N.button(ctx,'Back to chat',close)]});
  const weekSheet=(ctx,records)=>sheet(ctx,{title:'Included with every question',cls:'n-context',body:[
    h('p',N.name(ctx)+'’s saved profile and the past seven days of care records are included automatically while BarkLog AI is enabled.'),
    h('p.bl-caption',PERIOD+' 2026 · '+records.length+' records · current dog only'),
    action(ctx,'Review '+N.name(ctx)+'’s profile',()=>profileSheet(ctx)),
    ...records.map(sourceRow),
    h('p.bl-caption','Photos, documents, contacts, other dogs and older journal records are excluded. Saved observations cannot establish health. You can turn off online AI.'),
  ],actions:close=>[N.button(ctx,'Back to chat',close),N.link(ctx,'AI sharing settings',()=>{close();N.go(ctx,'next-ai-cards-consent');})]});
  const card=(...children)=>h('section.ac-card',...children);
  function logsCard(ctx,all,type){
    const relevant=all.filter(r=>r.type===type),label=type==='walk'?'walk':type==='grooming'?'grooming':'care';
    const c=card(h('div.ac-eyebrow',N.icon('notebook-pen',16),'From '+N.name(ctx)+'’s logs'),
      h('div.ac-summary',h('strong.ac-number',String(relevant.length)),h('span',label+(type==='walk'?'s':' entries')+' recorded')),
      h('p.ac-muted',PERIOD+' · past 7 days'));
    if(relevant.length){
      const counts=DAYS.map((_,i)=>relevant.filter(r=>r.date==='2026-10-'+(13+i)).length),max=Math.max(1,...counts);
      c.append(h('div.ac-week',{'role':'img','aria-label':DAYS.map((day,i)=>day+' '+(13+i)+' October: '+counts[i]+' '+label+' records').join('; ')},...counts.map((count,i)=>h('div.ac-day',{'aria-hidden':'true'},h('span.ac-day-track',h('i',{style:{height:(100*count/max)+'%'}})),h('strong',String(count)),h('span',DAYS[i])))),
        h('div.ac-latest',N.icon(B.type(type).icon,18),h('div',h('strong','Latest · '+relevant[0].date.slice(8)+' Oct, '+relevant[0].time),h('p','“'+relevant[0].note+'”'))),
        action(ctx,'View '+relevant.length+' '+label+' log'+(relevant.length===1?'':'s'),()=>sourceSheet(ctx,relevant,N.name(ctx)+'’s '+label+' logs')));
    }else c.append(h('p.ac-muted',all.length?'No '+label+' logs in this week. Other care records were included.':'No care records saved this week. '+N.name(ctx)+'’s profile is still included.'));
    return c;
  }
  const guidance=(ctx,type)=>{
    const brushing=type==='grooming';
    return card(h('div.ac-eyebrow',N.icon(brushing?'sparkles':'footprints',16),'General care ideas'),h('h3',brushing?'Keep brushing gentle':'Make room to explore'),
      h('div.ac-step',h('span','1'),h('p',brushing?'Let '+N.name(ctx)+' approach the brush. Begin with brief contact and reward calm participation.':'Give '+N.name(ctx)+' time to sniff along a familiar route. Let the outing be about exploring together.')),
      h('div.ac-step',h('span','2'),h('p',brushing?'Keep sessions short. Pause when '+N.name(ctx)+' moves away, and try again another time.':'Reward calm moments with praise or a reward '+N.name(ctx)+' already enjoys.')));
  };
  const futureProducts=()=>card(h('div.ac-eyebrow',N.icon('shopping-bag',16),'Future placement · design only'),h('h3','For brushing time'),
    h('div.ac-product-slot',h('span.ac-product-art',{'aria-hidden':'true'},N.icon('image',25)),h('div',h('strong','Relevant dog product'),h('p.ac-muted','Photo, name and suitability details'))),h('p.ac-muted','No products, prices, affiliate links or purchase actions are active.'));
  function answer(ctx,q,records,{products=false}={}){
    const type=/brush|groom/i.test(q)?'grooming':'walk',related=records.filter(r=>r.type===type),name=N.name(ctx);
    const intro=type==='grooming'?name+'’s notes describe short brushing sessions. Start small and let '+name+' set the pace.':related.length?'You’ve recorded '+related.length+' walks for '+name+' this week. The latest was '+related[0].date.slice(8)+' October at '+related[0].time+'.':name+' has no walk logs saved this week yet. I can help you start a record and share general routine ideas.';
    const el=h('article.n-assistant',{'aria-label':'BarkLog AI response'},h('div.n-assistant-mark',B.paw(18),'BarkLog AI'),h('p.ac-intro',intro),logsCard(ctx,records,type),guidance(ctx,type));
    if(!related.length&&type==='grooming')el.querySelector('.ac-intro').textContent='There are no brushing notes for '+name+' this week. Here’s a gentle way to start; this is general guidance.';
    if(products){const product=futureProducts();product.classList.add('ac-products');el.append(product);}
    el.append(h('p.ac-boundary','Care logs may be incomplete. A veterinarian can assess health concerns.'));
    return el;
  }
  const definitions=[
    ['next-chat-cards','Walk question · related log card',{}],
    ['next-chat-cards-brushing','Brushing question · relevant notes',{brushing:true}],
    ['next-chat-cards-no-match','No matching logs · useful guidance',{brushing:true,noMatch:true}],
    ['next-chat-cards-empty','No logs · profile still included',{empty:true}],
    ['next-chat-cards-products','Future product placement · inactive',{brushing:true,products:true}],
    ['next-chat-cards-loading','Reading the week · stop available',{loading:true}],
    ['next-chat-cards-error','Connection failure · retry',{failure:true}],
  ];
  definitions.forEach(([id,name,opts])=>N.def({id,section:SECTION,name,intent:'Authored preview. Current dog’s profile + rolling seven days after AI consent. No service request or product recommendation.',build(ctx){
    const s=N.state(ctx);s.plan='premium';s.chatConsent=true;s.profileContext=true;s.context=true;s.contextRange='week';
    s.breeds=['Cocker Spaniel'];s.ageYears='3';s.ageMonths='0';s.personality=['Curious'];
    const records=opts.empty?[]:FIXTURE.filter(r=>!opts.noMatch||r.type!=='grooming');
    const question=opts.brushing?'How can I make brushing calmer for '+N.name(ctx)+'?':'How is '+N.name(ctx)+' doing with his walks?';
    const body=N.frame(ctx);body.firstChild.remove();ctx.root.classList.add('n-chat','n-answer-cards');
    const back=B.press(ctx,h('button.n-icon',{type:'button','aria-label':'Back to journal'},N.icon('arrow-left')),()=>N.go(ctx,'next-home'));
    const options=B.press(ctx,h('button.n-icon',{type:'button','aria-label':'Chat options'},N.icon('ellipsis')),()=>sheet(ctx,{title:'BarkLog AI',body:[h('p','Design preview · authored answers and example records. No message leaves this board.')],actions:close=>[N.button(ctx,'Review included context',()=>{close();weekSheet(ctx,records);},{secondary:true}),N.button(ctx,'AI sharing settings',()=>{close();N.go(ctx,'next-ai-cards-consent');},{secondary:true}),N.link(ctx,'Back to chat',close)]}));
    ctx.root.insertBefore(h('header.n-chat-top',back,h('div',h('strong','Ask about '+N.name(ctx)),h('small','BarkLog AI · design preview')),options),body.parentElement);
    const messages=h('div.n-messages'),user=q=>h('div.n-user-message',h('span',q));
    messages.append(user(question));body.append(messages);
    let busy=false,generation=0,pending=null,lastQuestion=question;
    const scrollToReply=el=>requestAnimationFrame(()=>{if(!ctx.dead){const sc=body.parentElement;sc.scrollTop=Math.max(0,el.offsetTop-body.offsetTop-2);}});
    const text=h('textarea',{'aria-label':'Message BarkLog AI',placeholder:'Ask about '+N.name(ctx)+'…',rows:2,maxlength:4000});
    const context=B.press(ctx,h('button.n-context-button',{type:'button','aria-label':'Review automatic profile and seven-day context'},N.icon('notebook-pen',15),h('span','Profile + past 7 days'),N.icon('chevron-down',14)),()=>weekSheet(ctx,records));
    const attach=B.press(ctx,h('button.n-icon',{type:'button','aria-label':'Photo options'},N.icon('plus')),()=>sheet(ctx,{title:'Photos stay on this phone',body:[h('p','Images are not part of the automatic AI context. This card preview does not upload or analyze photos.')],actions:close=>[N.button(ctx,'Back to chat',close)]}));
    const setBusy=value=>{busy=value;send.setAttribute('aria-label',value?'Stop response':'Send message');send.replaceChildren(N.icon(value?'square':'arrow-up'));};
    const appendReply=q=>{const reply=answer(ctx,q,records,opts);messages.append(reply);reply.append(B.press(ctx,h('button.ac-follow',{type:'button'},N.icon('message-circle',16),h('span',/brush/i.test(q)?'Help me write a brushing note':'Show me the walk notes'),N.icon('arrow-up-right',15)),()=>{text.value=/brush/i.test(q)?'Help me write a factual brushing note for '+N.name(ctx):'Show me '+N.name(ctx)+'’s walk notes';text.focus();}));return reply;};
    const stopped=()=>{if(!busy)return;generation++;setBusy(false);pending.replaceChildren(h('p','Reply stopped. Your question is kept here.'),action(ctx,'Try again',()=>{pending.remove();start(lastQuestion);}));};
    const start=(q,{hold=false,failure=false}={})=>{
      lastQuestion=q;const current=++generation;setBusy(true);
      pending=h('section.ac-card.ac-progress',{'role':'status','aria-label':'Reading journal context'},h('div.ac-eyebrow',N.icon('notebook-pen',17),'BarkLog AI'),h('p','Reading '+N.name(ctx)+'’s week…'),h('p.ac-muted','Profile + '+records.length+' records · '+PERIOD));messages.append(pending);scrollToReply(pending);
      const finish=()=>{if(ctx.dead||current!==generation||!busy)return;setBusy(false);pending.remove();if(failure){pending=h('section.ac-card',{'role':'status'},h('h3','The reply didn’t arrive'),h('p.ac-muted','Your question is kept here. Your local journal still works.'),action(ctx,'Try again',()=>{pending.remove();start(q);}));messages.append(pending);scrollToReply(pending);}else{const reply=appendReply(q);if(!F.reduced())F.rise(ctx,reply,{distance:6,duration:360});scrollToReply(reply);}};
      if(!hold)ctx.at(F.reduced()?0:1100,finish);
    };
    const submit=()=>{if(busy){stopped();return;}const q=text.value.trim();if(!q)return;text.value='';messages.append(user(q));start(q);};
    const send=B.press(ctx,h('button.n-send',{type:'button','aria-label':'Send message'},N.icon('arrow-up')),submit);
    ctx.on(text,'keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();submit();}});
    const composer=h('div.n-composer',text,h('div.n-composer-tools',attach,context,send),h('p.n-composer-caption','General care · not diagnosis'));
    ctx.root.append(composer);
    const reserve=()=>{const header=ctx.root.querySelector('.n-chat-top'),height=header.offsetHeight;body.style.paddingTop=(height+18)+'px';body.parentElement.style.bottom=(ctx.root.clientHeight-composer.offsetTop+10)+'px';};
    const observer=new ResizeObserver(reserve);observer.observe(composer);observer.observe(ctx.root.querySelector('.n-chat-top'));
    const dispose=ctx.dispose;ctx.dispose=()=>{generation++;observer.disconnect();dispose();};
    if(opts.loading)start(question,{hold:true});else if(opts.failure)start(question,{failure:true});else appendReply(question);
    N.enter(ctx,body);document.fonts.ready.then(()=>{if(!ctx.dead){reserve();body.parentElement.scrollTop=0;}});
  }}));
  N.def({id:'next-ai-cards-consent',section:SECTION,name:'AI consent · automatic profile + week',intent:'New scope requires consent, including for users who approved the older manual selection. Declining preserves local journaling.',build(ctx){
    const body=N.frame(ctx,{back:'next-home'}),name=N.name(ctx),id='answer-cards-consent-'+ctx.mode;
    body.append(N.tag('BarkLog AI','paw-print'),N.head('A little context. A clearer answer.','Your dog’s week, ready when you ask.'),
      h('div.ac-consent-details',h('div',N.icon('paw-print'),h('div',h('strong',name+'’s profile'),h('p','Name, age, breed and the care details you’ve saved.'))),h('div',N.icon('notebook-pen'),h('div',h('strong','The past seven days'),h('p','This dog’s care records are included automatically with each question. No need to select logs.'))),h('div',N.icon('shield-check'),h('div',h('strong','You stay in control'),h('p','Online processing starts when you ask. Photos, contacts, other dogs and older records stay out. Turn off AI at any time.')))),
      h('p.bl-caption','BarkLog AI gives general care information and organizes observations. It cannot assess health, diagnose or prescribe. Your journal works without AI.'));
    const input=h('input',{id,type:'checkbox'}),next=N.button(ctx,'Enable BarkLog AI',()=>{N.state(ctx).answerCardsConsent=true;N.go(ctx,'next-chat-cards');},{disabled:true});
    ctx.on(input,'change',()=>next.disabled=!input.checked);
    body.append(h('label.ac-consent-check',{for:id},input,h('span','I agree to online AI processing of my messages, '+name+'’s profile and the past seven days of care records.')),N.foot(next,N.link(ctx,'Keep using my journal',()=>N.go(ctx,'next-home'))));
    N.enter(ctx,body);
  }});
  B.seq(SECTION,['next-ai-cards-consent',...definitions.map(([id])=>id)]);
})();
