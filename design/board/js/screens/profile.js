(() => {
  const F=window.F,B=window.B,h=F.h;
  B.seq('profile',['profile','insights']);
  F.def({id:'profile',section:'profile',name:'Profile · dog and local journal',flow:true,enter:'cut',intent:'P1. Name, journal start, real-record count, storage limits. No fake settings, export or add-dog action.',build(ctx){
    const body=B.frame(ctx,'profile');body.append(B.brand(),B.heading('Profile','Your dog. Your journal.'),h('div.bl-identity',h('span.bl-avatar',B.paw(34)),h('div.bl-tight',h('h2',ctx.answers.dog||'Bruno'),h('p.bl-caption','Journal started 14 October'))),
      B.card(h('span.bl-kicker','Care journal'),h('strong.bl-total',`${(ctx.answers.records||B.example).length} saved records`),h('p.bl-sub','Profile editing and adding more dogs are not available in this build.')),
      B.card(h('div.bl-head',h('h2','Stored on this device'),F.icon('shield-check',{size:24})),h('p.bl-sub','Profiles and care logs stay here. No cloud sync or backup.'),h('hr.bl-rule'),h('p.bl-caption','Deleting the app or clearing its data loses this journal. Manual exports are not available yet.')),
      h('p.bl-caption','BarkLog · 1.0.0 early journal build'));B.enter(ctx,body);
  }});
  F.def({id:'insights',section:'profile',name:'Insights · honest early state',flow:true,enter:'cut',intent:'I1. Factual trends are not implemented. Do not turn example counts into health interpretation.',build(ctx){
    const body=B.frame(ctx,'insights');body.append(B.brand(),B.heading('Insights','Patterns from your recorded care.'),h('div.bl-empty',h('span.bl-mark',F.icon('chart-no-axes-column-increasing',{size:25})),h('h2','Trends are not ready yet'),h('p.bl-sub','Your logs are saved. Factual summaries are coming in a later update.'),B.button(ctx,'View your timeline',()=>B.go(ctx,'timeline'),{secondary:true,icon:'list'})),h('p.bl-caption','BarkLog organizes observations. It does not diagnose or prescribe treatment.'));B.enter(ctx,body);
  }});
})();
