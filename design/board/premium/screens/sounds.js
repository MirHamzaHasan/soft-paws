/* task042 · listen locally; no audio assets, calls or care records are downloaded. */
(() => {
  const N=window.NEXT,{B,F,h}=N;
  BOARD.sections.splice(5,0,{id:'next-sounds',title:'04d · Soft interaction sounds',intent:'Optional, quiet tactile audio. Compare a wood tap with a soft pop; selections get a lighter tick and committed saves a warm paired note. Typing, scrolling and background activity stay silent.'});
  N.def({id:'next-sounds',section:'next-sounds',name:'Soft sounds · optional & adjustable',intent:'Original local sound synthesis. Off until enabled; independent from motion and haptics. Listen to samples, then try normal controls.',build(ctx){
    const audio=window.BarkSounds,body=N.frame(ctx,{back:'next-home'});
    ctx.root.classList.add('n-sounds');
    const toggle=N.switch(ctx,{label:'Interaction sounds',on:audio.state().enabled,onToggle:()=>{const on=!audio.state().enabled;audio.setEnabled(on);if(on)void audio.play('tap');}});toggle.button.dataset.soundControl='true';
    const slider=h('input',{type:'range',min:0,max:100,step:5,'aria-label':'Interaction sound volume','data-sound-control':'true'}),value=h('output',{'aria-hidden':'true'}),status=h('p.s-sound-status',{role:'status','aria-live':'polite'});
    ctx.on(slider,'input',()=>audio.setVolume(Number(slider.value)/100));
    ctx.on(slider,'change',()=>void audio.play('selection'));
    const style=N.segment(ctx,'Sound texture',[['wood','Soft wood'],['pop','Soft pop']],audio.state().style,choice=>{audio.setStyle(choice);void audio.play('tap');});style.dataset.soundControl='true';
    const samples=h('div.s-sound-samples');
    const sampleButtons=[['tap','Button tap','A small, rounded touch','paw-print'],['selection','Selection tick','A lighter sound for a choice','check'],['saved','Saved','A warm note after a completed save','notebook-pen']].map(([kind,title,sub,icon])=>{
      const button=B.press(ctx,h('button.s-sound-sample',{type:'button','data-sound-control':'true','aria-label':'Preview '+title.toLowerCase()+' sound'},N.icon(icon,22),h('span',h('strong',title),h('small',sub)),N.icon('play',17)),()=>void audio.play(kind),.86,true);samples.append(button);return button;
    });
    const unsubscribe=audio.subscribe(s=>{
      toggle.set(s.enabled,{animate:true});toggle.button.disabled=!s.available;slider.value=String(Math.round(s.volume*100));value.textContent=slider.value+'%';slider.setAttribute('aria-valuetext',slider.value+' percent');
      sampleButtons.forEach(button=>button.disabled=!s.enabled||s.volume===0||!s.available);
      status.dataset.error=String(!!s.error);
      status.textContent=!s.available?'Sounds aren’t available in this browser.':s.error?s.error:!s.enabled?'Sounds are off.':s.volume===0?'Muted. Raise the volume to hear a sample.':'Sounds are on · '+Math.round(s.volume*100)+'%';
    });
    const dispose=ctx.dispose;ctx.dispose=()=>{unsubscribe();dispose();};
    body.append(N.tag('Make it feel like BarkLog','paw-print'),N.head('A softer little tap.','Quiet sounds for the things you touch.'),
      h('section.s-sound-card',h('div.s-sound-head',h('div',h('h3','Interaction sounds'),h('p.s-sound-copy','Optional. Start quiet and adjust to suit you.')),toggle.button),h('div.s-sound-range',h('div',h('label',{for:'sound-volume-'+ctx.mode},'Volume'),value),slider),style,status),
      h('section.s-sound-card',h('h3','Try the sounds'),samples),
      h('p.s-sound-copy','Typing, scrolling and loading stay silent. Sound never replaces a visible confirmation.'),
      N.foot(N.button(ctx,'Try in AI chat',()=>N.go(ctx,'next-chat-cards')),N.link(ctx,'Back to journal',()=>N.go(ctx,'next-home'))));
    slider.id='sound-volume-'+ctx.mode;N.enter(ctx,body);
  }});
})();
