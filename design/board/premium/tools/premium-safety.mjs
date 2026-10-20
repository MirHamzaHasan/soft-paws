// Task046 synthetic board journeys. No authenticated browser, journal or service calls.
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.argv[2]||'http://localhost:4278/premium/index.html',out=process.argv[3]||'.verify-build/task046-board-journeys';await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true});const page=await browser.newPage({viewport:{width:1200,height:1100}});
const errors=[],external=[],checks=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url())&&!['localhost','127.0.0.1'].includes(new URL(r.url()).hostname))external.push(r.url());});
let sequence=0;const phone=()=>page.locator('.player .ph').last();
const go=async id=>{await page.goto(base+'?task046='+(++sequence)+'#play-'+id);await page.waitForFunction(id=>NEXT.activeContext?.screen.id===id,id);await page.evaluate(()=>document.fonts.ready);await phone().scrollIntoViewIfNeeded();await page.waitForTimeout(900);};
const click=async label=>{await phone().getByRole('button',{name:label,exact:true}).click();await page.waitForTimeout(550);};
await go('next-paywall');for(const label of ['Weekly, $2.99 US dollars per week','Monthly, $6.99 US dollars per month','Yearly, $39.99 US dollars per year'])assert(await phone().getByRole('button',{name:label,exact:true}).isVisible());
await phone().getByRole('button',{name:'Weekly, $2.99 US dollars per week',exact:true}).click();assert.equal(await page.evaluate(()=>NEXT.state(NEXT.activeContext).billing),'weekly');
assert(await phone().getByRole('button',{name:'Continue with weekly',exact:true}).isDisabled());checks.push('three full USD prices, weekly selection and unconfigured purchase disabled');
await go('next-triage');await phone().getByText('Possible poisoning',{exact:true}).click();await page.waitForFunction(()=>NEXT.activeContext?.screen.id==='next-emergency');assert(!await phone().getByRole('button',{name:'See Premium',exact:true}).count());checks.push('free poisoning route directly reaches emergency contacts');
await phone().getByLabel('Emergency service country').selectOption('GB');assert(await phone().getByText('01202 509000',{exact:true}).count());await phone().getByLabel('Emergency service country').selectOption('');assert(await phone().getByText(/No bundled number is verified/).count());checks.push('manual country selection and unsupported-country honesty');
await go('next-toxicity');assert(await phone().getByRole('button',{name:'See Premium',exact:true}).count());assert(await phone().getByRole('button',{name:'Open emergency contacts',exact:true}).count());checks.push('free call entry remains above toxicity Premium gate');
await page.evaluate(()=>{NEXT.state(NEXT.activeContext).plan='premium';NEXT.go(NEXT.activeContext,'next-safety-topics');});await page.waitForFunction(()=>NEXT.activeContext?.screen.id==='next-safety-topics');await click('Preview an answer card');assert(await phone().getByText('DESIGN PREVIEW · NOT A LIVE ANSWER',{exact:true}).count());checks.push('paid safety example is labelled as a preview');
await go('next-train-dog');assert(await phone().getByText('Premium · coming soon',{exact:true}).count());assert(await phone().getByText(/not available with a subscription yet/).count());checks.push('training Coming soon is not sold as delivered');
assert.deepEqual(errors,[]);assert.deepEqual(external,[]);await writeFile(out+'/results.json',JSON.stringify({checks,errors,external},null,2));console.log(checks.length+' journey checks passed');await browser.close();
