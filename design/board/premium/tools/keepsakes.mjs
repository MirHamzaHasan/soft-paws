// Local board journeys. Does not connect to journals, auth, stores or an encoder.
import assert from 'node:assert/strict';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.argv[2]||'http://localhost:4278/premium/index.html';
const out=process.argv[3]||'.verify-build/task033/journeys';await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1080},deviceScaleFactor:1});
const errors=[],external=[],checks=[],timings=[];
page.on('pageerror',e=>errors.push(e.message));
page.on('request',r=>{if(/^https?:/.test(r.url())&&new URL(r.url()).hostname!=='localhost')external.push(r.url());});
const phone=()=>page.locator('.player .ph').last();
const wait=id=>page.waitForFunction(id=>NEXT.activeContext?.screen.id===id,id);
const go=async(id,query='')=>{await page.goto(base+'?keepsake-qa='+id+query+'#play-'+id);await wait(id);await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(800);};
const click=async label=>{await phone().getByRole('button',{name:label,exact:true}).click();await page.waitForTimeout(800);};
const state=()=>page.evaluate(()=>NEXT.activeContext.answers.next);
const capture=name=>phone().screenshot({path:out+'/'+name+'.png'});
try {
  await go('next-home');await click('Ask about Bruno with Premium');await wait('next-ai-gate');
  await click('Keep using free journal');await wait('next-home');
  checks.push('Free Home Ask entry opens the value screen and returns to the journal');
  await go('next-report-preview');await click('PDF & sharing · Premium');await wait('next-report-export');
  await click('See Premium');await wait('next-paywall');
  assert.equal((await state()).premiumOutput,'report');assert.equal(await phone().getByRole('button',{name:'Start Premium',exact:true}).isDisabled(),true);
  await capture('report-premium');await click('Back to my preview');await wait('next-report-preview');
  assert.notEqual((await state()).plan,'premium');checks.push('PDF gate gives a contextual offer; prices stay undecided/purchase disabled; dismiss preserves the free preview');
  await go('next-highlight-editor');
  const png=await readFile('shared/src/commonMain/composeResources/drawable/spaniel_rest.png');
  await phone().getByLabel('Choose highlight photos',{exact:true}).setInputFiles([
    {name:'First-moment.png',mimeType:'image/png',buffer:png},
    {name:'Second-moment.png',mimeType:'image/png',buffer:png},
    {name:'Third-moment.png',mimeType:'image/png',buffer:png},
  ]);
  await phone().getByLabel('Caption for this photo',{exact:true}).fill('A little moment with Bruno');
  assert.equal(await phone().getByRole('button',{name:'Move earlier',exact:true}).isDisabled(),true);
  assert.equal(await phone().getByText('Your selected photos',{exact:true}).count(),1);
  await click('Move later');assert.equal((await state()).highlight.photos[1].name,'First-moment.png');
  assert.equal((await state()).highlight.photos[1].caption,'A little moment with Bruno');
  await phone().getByRole('button',{name:'Preview photo 1',exact:true}).click();
  await click('Square · 1:1');assert.equal((await state()).highlight.ratio,'square');
  await phone().getByRole('button',{name:'Play photo preview',exact:true}).click();
  const began=await page.evaluate(()=>performance.now());
  for(const [name,target] of [['pan-25',700],['pan-50',1400],['pan-75',2100]]) {
    const elapsed=await page.evaluate(()=>performance.now())-began;
    if(elapsed<target)await page.waitForTimeout(target-elapsed);
    timings.push({name,targetMs:target,observedMs:await page.evaluate(()=>performance.now())-began});
    await phone().locator('.k-player').screenshot({path:out+'/'+name+'.png'});
  }
  await click('Pause photo preview');await capture('photo-editor');
  const still=await phone().locator('.k-film').screenshot();await page.waitForTimeout(400);
  assert.equal(still.equals(await phone().locator('.k-film').screenshot()),true,'Pause must freeze actual preview pixels');
  const selectedBefore=(await state()).highlight.selected;
  await page.waitForTimeout(600);assert.equal((await state()).highlight.selected,selectedBefore);
  await click('Export video · Premium');await wait('next-highlight-gate');await capture('video-premium');
  await click('See Premium');await wait('next-paywall');assert.equal((await state()).premiumOutput,'video');
  await click('Back to my preview');await wait('next-highlight-editor');
  assert.equal((await state()).highlight.photos.length,3);assert.equal((await state()).highlight.photos[1].caption,'A little moment with Bruno');
  checks.push('Real local PNG selection, caption, reorder, square format, play/pause and three mid-pan captures; cancelling the video offer preserves the draft');
  await go('next-highlight-editor','&reducedMotion=true');await click('Play photo preview');
  assert.equal(await phone().getByRole('button',{name:'Pause photo preview',exact:true}).count(),0);
  await phone().getByRole('button',{name:'Preview photo 2',exact:true}).click();
  assert.match(await phone().locator('.k-film').getAttribute('aria-label'),/Photo 2 of 3/);
  await capture('reduced-editor');checks.push('Reduced motion keeps the preview still and manual photo selection remains available');
  await go('next-report-export');await click('See Premium');await wait('next-paywall');
  await phone().getByRole('button',{name:'Back to my preview',exact:true}).focus();await page.keyboard.press('Enter');await wait('next-report-preview');
  checks.push('Keyboard activation dismisses the offer to the original report');
  assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
} finally {
  await writeFile(out+'/results.json',JSON.stringify({checks,errors,external,timings,nativeVideoImplemented:false},null,2));
  await browser.close();
}
console.log(JSON.stringify({checks,errors,external},null,2));
