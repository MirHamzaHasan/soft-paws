(() => {
  const sectionMeta={
    kit:{task:'Design system',status:'Review artifact',entry:'Kit view',states:'Light, dark, larger text, reduced motion',native:'Generate equivalent Compose tokens and parts only after approval.'},
    onboarding:{task:'Task 003',status:'Proposed design 05',entry:'Fresh first run / Make it yours',states:'Six-second opening, fast start, optional identity/photo/breed/age, shortcuts, practice log, notes, Timeline preview, local-storage boundary, ready, skip/back, coach',native:'The opening is at most six seconds. Guided steps are user-paced and optional. No practice data is saved; no account or permission gate.'},
    home:{task:'Task 003 / task020',status:'Approved mechanics · design 04 visual proposal',entry:'Home tab',states:'Populated, empty, loading, committed quick log, Undo, detailed editor',native:'Native tokens stay pinned. Review the proposed composition before porting; retain Firm interaction and local commit-before-success.'},
    forms:{task:'Task 004 / task012 / task020',status:'Proposed design 04 · Mobbin-informed editor',entry:'Home · Create a log / Add details',states:'Observation, notes, context, attachment sample, validation, keyboard, saving, retry, retained draft, cancel',native:'Existing native notes stay intact; new context and attachment fields need a later vertical slice. Commit SQLite write before success feedback.'},
    timeline:{task:'Task 004 / task020',status:'Approved core + proposed scope',entry:'Timeline tab',states:'Filters, filtered empty, pagination, multi-dog, new event types',native:'Local Flow data; inclusive local dates; bounded paging.'},
    records:{task:'Task 004 / task020',status:'Approved core + proposed conflicts',entry:'Timeline row',states:'Detail, edit, delete confirm, retry, stale revision',native:'Never silently overwrite a newer local revision.'},
    profile:{task:'Task 003 / task020',status:'Approved reference',entry:'Profile/Insights tabs',states:'Current early-v1 availability',native:'Keep as reference while later slices remain unimplemented.'},
    profiles:{task:'Task 005',status:'Proposed design',entry:'Profile tab',states:'Switch, add, edit, storage, accessibility, delete one/all',native:'Dog selection scopes all destinations; export remains available first.'},
    medications:{task:'Task 006',status:'Proposed design',entry:'Profile · Health records',states:'Active, history, create/edit, given, archive, vaccination',native:'Caregiver values only; no dose calculator or automatic prompt.'},
    calendar:{task:'Task 007',status:'Proposed design',entry:'Profile · Care calendar',states:'Complete, overdue, recurrence, denial, scheduling failure, delete',native:'Persist task independently from OS notification permission/scheduling.'},
    insights:{task:'Task 008',status:'Proposed design',entry:'Insights tab',states:'Weekly, monthly, sparse, empty, text summaries',native:'Charts require semantic text equivalents and non-colour cues.'},
    safety:{task:'Task 009',status:'Proposed design',entry:'Home/Profile · Safety',states:'Emergency, contacts, known/unknown toxicity, first aid, escalation',native:'Bundled versioned sources; no diagnosis, dose or AI decision.'},
    exports:{task:'Task 010',status:'Proposed design',entry:'Insights · Prepare report',states:'Scope, preview, format, progress, cancel, retry, complete, share/print',native:'Free local CSV/PDF; real platform share/print handoff.'},
    training:{task:'Task 011',status:'Proposed design',entry:'Profile · Training',states:'Catalog, detail, active, complete, cancel, empty, error',native:'Session progress and Timeline record commit together.'},
    photos:{task:'Task 012',status:'Proposed design',entry:'Profile/Timeline · Photos',states:'Picker, metadata, edit, baseline, cancel/denial, missing file',native:'Use native user-triggered picker; no broad photo permission or upload.'},
    expenses:{task:'Task 013',status:'Proposed design',entry:'Profile · Expenses',states:'Month, category, add/edit, attachment, detail, delete, precision error, empty',native:'Explicit ISO date and stored currency/decimal precision.'},
    memory:{task:'Task 019',status:'Proposed design',entry:'Profile · Memory Book',states:'Month, detail, sparse, missing photo, export/share',native:'Every highlight references a persisted record/photo; no generated medical story.'},
    states:{task:'Cross-cutting',status:'Proposed design',entry:'Any affected journey',states:'Startup, empty, read/save failure, offline, permission, stale data, reduced motion',native:'Prove semantics, focus, cancellation and persistence per vertical slice.'},
    motion:{task:'Cross-cutting / task020',status:'Firm interaction approved',entry:'Transition view',states:'Rest, 25/50/75%, final, reduced-motion final',native:'Transform, opacity, clip and blur only; map to Compose curves/springs.'},
  };
  window.BARK_SCREEN_MANIFEST={};
  window.F.SCREENS.forEach(screen=>{
    const meta=sectionMeta[screen.section]||{task:'Board only',status:'Review artifact',entry:'Direct board link',states:'Default',native:'No production parity claim.'};
    window.BARK_SCREEN_MANIFEST[screen.id]={id:screen.id,productTask:meta.task,implementationStatus:meta.status,entryPoint:meta.entry,requiredStates:meta.states,nativeParity:meta.native};
  });
})();
