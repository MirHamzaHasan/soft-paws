/* Owner-requested board direction, 16 Oct 2026. Native local-v1 is unchanged. */
(() => {
  const C=window.BOARD;
  C.id='barklog-premium-proposal-20261016';
  C.defaultTheme='light';
  // A one-time default migration preserves subsequent explicit theme choices.
  try{const key='design-board:'+C.id+':theme',migration=key+':light-default-025';if(!localStorage.getItem(migration)){const old=localStorage.getItem(key);if(!old||old==='auto')localStorage.setItem(key,'light');localStorage.setItem(migration,'1');}}catch{}
  C.name='BarkLog · care, understood · proposal';
  C.sections=[
    {id:'next-onboarding',title:'01 · Meet your dog',intent:'Light by default. Flexible breed/mix entry, multiple priorities and topics, optional dog details and care context, notification switches and a practice log. Every answer has a visible destination.'},
    {id:'next-account',title:'02 · Your account',intent:'Required account after value, Apple / Google / email link, returning access, cancellation and offline recovery. Firebase is the intended provider; this is a local prototype.'},
    {id:'next-premium',title:'03 · Free or Premium',intent:'Your setup becomes a named-dog care plan. USD $2.99/week, $6.99/month and $39.99/year are visible together. Store setup is pending; no payment starts here. Review the 20 October Rive/motion refinement before its native port.'},
    {id:'next-chat',title:'04 · Ask about your dog',intent:'A persistent Home entry, readable conversation, explicit journal context, streaming, stop, sources and recovery. All responses are authored examples.'},
    {id:'next-settings',title:'05 · Account & subscription',intent:'See what stays free, restore a purchase, manage renewal, end access and delete an account without losing the distinction between billing and journal storage.'},
    {id:'next-keepsakes',title:'06 · Reports & keepsakes · new review',intent:'17 Oct owner direction: mobile reports stay free; PDF/print/sharing are Premium. Preview photo films locally; native MP4 export is a later reviewed slice. CSV remains free; prices undecided.'},
    ...C.sections,
  ];
  C.researchTitles={...C.researchTitles,'premium-onboarding':'Onboarding · what we learned','premium-chat':'Conversation · what we took','premium-business':'Revenue · hypotheses to test','premium-platform':'Accounts & permissions · platform facts'};
  C.research={
    'premium-plan-047':[
      {title:'Answers become a care card',took:'Reuse the already-reviewed Headspace answers → recommendation structure. BarkLog brings back only the entered dog details, priorities, check-in rhythm, reminder status and AI topics; no invented scores or subscription recommendation.',src:'premium/research/headspace-goals.webp',url:'https://mobbin.com/flows/31b21791-dec6-448a-8253-648f5ebbba3e'},
      {title:'The same companion, quietly present',took:'Reuse the reviewed Finch companion continuity, with BarkLog’s own approved Rive spaniel. One short greeting and a bounded touch response, then rest. No borrowed art, scenery or reward economy.',src:'premium/research/finch-reminders.webp',url:'https://mobbin.com/flows/80ef83ef-f872-4825-b18d-6b193d60a9aa'},
      {title:'Visible prices and a permanent free return',took:'All three full recurring USD prices, one moving checked selection and a visible free-journal action. No configured trial or payment. Motion, ownership and later Compose mapping are recorded in the refinement notes.',url:'premium/research/plan-paywall-047.md'}
    ],
    'premium-onboarding':[
      {title:'Finch · identity before an ask',took:'The reviewed 21-screen flow introduces a companion, creates a shared identity, then asks about reminders. We take the visible reason for each ask, with fewer gates and no reward economy.',src:'premium/research/finch-reminders.webp',url:'https://mobbin.com/flows/80ef83ef-f872-4825-b18d-6b193d60a9aa'},
      {title:'Headspace · answers become a recommendation',took:'The reviewed onboarding moves from a brief opening to account, goals, a personal result and a recommended course. BarkLog moves account later and reuses the dog’s stage, experience and goal in the journal and AI starters.',src:'premium/research/headspace-goals.webp',url:'https://mobbin.com/flows/31b21791-dec6-448a-8253-648f5ebbba3e'},
      {title:'Headspace · explain the trial before billing',took:'The premium flow puts a dated trial timeline before a store sheet, then reminds and starts a useful action. We retain visible dates and a first useful action, show both billing options together and keep the free path visible.',src:'premium/research/headspace-trial.webp',url:'https://mobbin.com/flows/ccf14439-4c45-4d56-b031-45173490cafe'},
    ],
    'premium-chat':[
      {title:'Claude · writing gets the space',took:'A quiet conversation canvas and a bottom composer keep attention on the message. We borrow the open reading column and attachment affordance; the type, dog identity and care-record sources remain BarkLog’s.',src:'premium/research/claude-composer.webp',url:'https://mobbin.com/flows/4bf99c87-ab26-48dd-ba9c-03650ac1a898'},
      {title:'ChatGPT · conversations stay findable',took:'A compact thread list, a clear new-conversation action and a persistent composer separate starting from finding. This reference covers project/thread organization, not evidence of conversion or animation timing.',src:'premium/research/chatgpt-threads.webp',url:'https://mobbin.com/flows/0f538b27-9afb-4f7f-8c52-d10f51e3218e'},
      {title:'BarkLog · show the evidence',took:'A journal answer names its date range and links to the records used. No data becomes a clear empty state. AI summarizes caregiver observations; it does not diagnose, prescribe or claim a dog is healthy.'},
    ],
    'premium-business':[
      {title:'RevenueCat 2026 · first-session value',took:'The report observes that 55% of 3-day trial cancellations happen on day zero. Our hypothesis: a hands-on journal and grounded AI sample explain value before price. This is a hypothesis, not a promised conversion lift.',url:'https://www.revenuecat.com/state-of-subscription-apps'},
      {title:'RevenueCat 2026 · earning a return visit',took:'AI apps in the dataset earn more per payer but churn faster. Sell a repeatable task—review this week’s records—not a generic AI badge. Measure weekly use, cost and retained paid users.',url:'https://www.revenuecat.com/state-of-subscription-apps'},
      {title:'The free / paid boundary',took:'Updated by the owner on 17 Oct: free logging, notes, timeline, factual charts, reminders, mobile reports and CSV. Premium: AI, PDF/print/sharing and proposed photo-film export. This supersedes the earlier free-PDF boundary.'},
      {title:'Profitability is a model to validate',took:'Prices, AI usage allowance, provider, trial eligibility and costs are undecided. Use the research memo’s contribution formula and experiment plan before committing. A longer quiz or stronger paywall cannot guarantee profit.',url:'premium/research/strategy.md'},
    ],
    'premium-platform':[
      {title:'Firebase · passwordless email links',took:'Apple, Google and email-link sign-in are the proposed doors. New native integration must use the supported Hosting/App Links/Universal Links path, not retired Firebase Dynamic Links.',url:'https://firebase.google.com/docs/auth/ios/email-link-migration'},
      {title:'Apple · account and AI boundaries',took:'Include an equivalent private login, in-app deletion, clear subscription details and explicit consent before sharing with third-party AI. Required login is the owner’s proposal; the account-based value still needs store-review justification.',url:'https://developer.apple.com/app-store/review/guidelines/'},
      {title:'Android · photo picker',took:'Select a dog photo through the system picker without requesting the entire library. Camera is optional and asked only when Take photo is tapped.',url:'https://developer.android.com/training/data-storage/shared/photo-picker'},
      {title:'Apple & Android · reminders in context',took:'Offer reminder setup in onboarding, then request notification authorization only when enabled. Denial leaves the journal usable. This board simulates both platform sheets; it cannot grant native permissions.',url:'https://developer.android.com/develop/ui/compose/notifications/notification-permission'},
    ],
    ...C.research,
  };
  C.answers={...C.answers,next:{stage:'Adult',breed:'Mixed breed',experience:'Some experience',goals:['Remember daily care'],rhythm:'Morning & evening',focus:'Daily routines',days:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],time:'19:00',notifications:'not-requested',remindersEnabled:false,camera:'not-requested',photo:false,account:false,plan:'free',billing:'monthly',chatConsent:false,context:true,contextRange:'today',threads:[],messages:[]}};
  window.F.SCREENS.forEach(s=>s.flow=false);
})();
