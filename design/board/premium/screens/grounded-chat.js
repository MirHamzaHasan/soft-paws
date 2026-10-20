/* task038 review only. Authored examples; never model output or a health assessment. */
(() => {
  const N=window.NEXT,{B,h}=N;
  // Transient review variant, without changing the reviewer's saved theme.
  const reviewTheme=new URLSearchParams(location.search).get('groundedTheme');
  if(['light','dark'].includes(reviewTheme))window.addEventListener('load',()=>document.documentElement.dataset.theme=reviewTheme);
  window.BOARD.sections.splice(4,0,{id:'next-grounded-chat',title:'04b · Grounded answers · review',intent:'Answer the question first. The saved dog profile and relevant journal evidence are separate from an exact recent-care summary. New card awaits native review.'});
  const card=(ctx,records)=>{
    const counts=[...new Set(['walk','meal','pee','poop',...records.map(r=>r.type)])].map(type=>({type,count:records.filter(r=>r.type===type).length}));
    const max=Math.max(1,...counts.map(r=>r.count));
    const el=h('section.n-care-reading',{'aria-label':N.name(ctx)+' recent care, example records'},
      h('div.n-reading-title',N.icon('notebook-pen',18),h('h3',N.name(ctx)+'’s recent care')),
      h('p.n-reading-period','8–14 Oct · '+records.length+' saved records'),
      records.length?h('div.n-reading-bars',counts.map(({type,count})=>h('div.n-reading-row',
        h('span',B.type(type).label),h('span.n-reading-track',{'aria-hidden':'true'},h('i',{style:{width:(100*count/max)+'%'}})),h('strong',String(count))))):
        h('p.n-reading-empty','No care saved in these 7 days. Older logs can still support an answer.'),
      records.length?h('div.n-reading-latest',h('span','Latest saved'),h('strong',B.type(records[0].type).label+' · 14 Oct, '+records[0].time),h('p',records[0].note)):null,
      h('p.n-reading-caption','Saved observations · not a health score'));
    return el;
  };
  [['next-chat-grounded','Question first · retrieved evidence','walk'],['next-chat-grounded-general','General care · relevant answer','general'],['next-chat-grounded-empty','Older evidence · no recent care','empty']].forEach(([id,name,kind])=>N.def({id,section:'next-grounded-chat',name,intent:'task038 proposal · authored example, exact local counts, no inference or upload.',build(ctx){
    const s=N.state(ctx),profile=N.profileSnapshot(ctx),records=N.records(ctx,'today').sort((a,b)=>b.time.localeCompare(a.time));
    const originalWalk=records.find(r=>r.type==='walk'),walk=originalWalk?{...originalWalk,date:kind==='empty'?'2026-10-07':'2026-10-14'}:null,recent=kind==='empty'?[]:records;
    const question=kind==='general'?'How can I make brushing calmer?':'When was the last walk?';
    const text=kind==='general'?'Keep '+N.name(ctx)+'’s brushing sessions short and pause when they pull away. Let them approach the brush, and reward calm participation.\n\nFor painful skin or persistent discomfort, ask your vet.':walk?N.name(ctx)+'’s latest recorded walk was '+(kind==='empty'?'7 October':'14 October')+' at '+walk.time+'. Your note says “'+walk.note+'.”':'There’s no saved walk in this range.';
    s.plan='premium';s.chatConsent=true;s.profileContext=true;s.context=true;s.messages=[{role:'user',text:question},{role:'assistant',text,profile,records:kind==='general'?[]:walk?[walk]:[]}];
    N.chat(ctx);
    ctx.root.querySelector('.n-chat-top small').textContent='Grounded chat · design example';
    const answer=ctx.root.querySelector('.n-assistant');
    const identity=h('p.n-reading-identity',N.icon('paw-print',15),N.name(ctx)+' · your dog · '+(profile.breeds?.join(' × ')||'Breed not saved'));
    answer.querySelector('.n-assistant-mark').after(identity);
    answer.querySelector('.n-answer').after(card(ctx,recent));
    ctx.root.querySelector('.n-composer-caption').textContent='Design example · saved facts stay separate from advice';
  }}));
})();
