/* Reviewer tools stay outside the phone. No credentials, purchases or permissions are used. */
(() => {
  const F=window.F,N=window.NEXT,h=F.h,query=new URLSearchParams(location.search);
  if(query.get('scenario')==='premium'){window.BOARD.answers.next.plan='premium';window.BOARD.answers.next.account=true;window.BOARD.answers.next.chatConsent=true;}
  const index=F.SCREENS.findIndex(s=>s.id===N.onboardingOrder[0]),ordered=N.onboardingOrder.map(id=>F.SCREENS.find(s=>s.id===id)).filter(Boolean);F.SCREENS=F.SCREENS.filter(s=>!N.onboardingOrder.includes(s.id));F.SCREENS.splice(index,0,...ordered);
  F.SCREENS.filter(s=>s.id.startsWith('next-')).forEach(s=>{
    window.BARK_SCREEN_MANIFEST[s.id]={id:s.id,productTask:s.section==='next-sounds'?'task042':s.section==='next-answer-cards'?'task041':s.section==='next-keepsakes'?'task033':'task025',implementationStatus:'Board proposal only · no native implementation',entryPoint:s.section,requiredStates:'Success, empty, cancellation, offline, denial, larger text and reduced motion as applicable',nativeParity:'Pending individual owner review; original task022 target unchanged'};
  });
  window.addEventListener('load',()=>{
    const note=h('aside.next-proposal-note','New direction · board proposal. Firebase sign-in, AI replies and native OS/store sheets are simulated. Prices are undecided; purchases are disabled. No account, chat or care content leaves this local prototype.');
    if(!document.body.classList.contains('is-solo'))document.querySelector('#board')?.prepend(note);
    const nav=h('nav.next-review-bar',{'aria-label':'Prototype review scenarios'});
    const open=(label,to,premium=false)=>{const a=h('a',{href:'premium/index.html?reducedMotion=false'+(premium?'&scenario=premium':'')+'#play-'+to},label);a.addEventListener('click',e=>{e.preventDefault();const current=N.activeContext;const answers=structuredClone(label!=='Opening'&&current&&!current.dead?current.answers:F.DEFAULT_ANSWERS);if(premium){answers.next.account=true;answers.next.plan='premium';if(to==='next-chat')answers.next.chatConsent=true;}if(label==='Free Home')answers.next.plan='free';F.board.openPlayer(to,answers);});return a;};
    nav.append(open('Sounds','next-sounds'),open('Answer cards','next-chat-cards',true),open('AI sharing','next-ai-cards-consent'),open('Future product slot','next-chat-cards-products',true),open('Opening','next-opening'),open('Free Home','next-home'),open('Premium Home','next-home-premium',true),open('Chat','next-chat',true),open('Reports','next-report-preview'),open('Video','next-highlight-editor'),open('Keepsakes','next-premium-library'),open('Paywall','next-paywall'),open('Trial','next-trial'),open('Ended','next-ended'));
    const email=h('a',{href:'#'},'Email link ↗');email.addEventListener('click',e=>{e.preventDefault();const ctx=N.activeContext;if(ctx&&!ctx.dead&&ctx.screen.id==='next-check-email')N.authDone(ctx);else F.board.openPlayer('next-check-email');});nav.append(email);
    const expired=h('a',{href:'#'},'Expired link');expired.addEventListener('click',e=>{e.preventDefault();const ctx=N.activeContext;if(ctx&&!ctx.dead)N.go(ctx,'next-email-expired');else F.board.openPlayer('next-email-expired');});nav.append(expired);
    document.body.append(nav);
  });
})();
