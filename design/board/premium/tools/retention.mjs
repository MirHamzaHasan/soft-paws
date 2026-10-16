import assert from 'node:assert/strict';import{mkdir,writeFile}from'node:fs/promises';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const out=process.argv[2]||'.verify-build/task025';await mkdir(out,{recursive:true});
const b=await chromium.launch(),p=await b.newPage({viewport:{width:1440,height:1080}});const errors=[];p.on('pageerror',e=>errors.push(e.message));
const ph=()=>p.locator('.player .ph').last(),click=async name=>{await ph().getByRole('button',{name,exact:true}).click();await p.waitForTimeout(850);};
try{
await p.goto('http://localhost:4278/premium/index.html?retention=025&scenario=premium#play-next-dog-profile');await p.waitForTimeout(1200);
await p.evaluate(()=>{const a=NEXT.activeContext.answers;a.records=[{id:'kept',type:'walk',time:'18:20',note:'Keep this original note'}];});
await click('Edit Breed or mix');await ph().getByLabel('Search or enter a breed').fill('Desi shepherd mix');await ph().getByLabel('Search or enter a breed').press('Enter');await click('Continue');await click('Save profile details');
assert.equal(await p.evaluate(()=>NEXT.activeContext.answers.records[0].id),'kept');
await click('Edit Name');await ph().getByLabel('Your dog’s name',{exact:true}).fill('Bruno Blue');await click('Continue');await click('Save profile details');assert.equal(await p.evaluate(()=>NEXT.activeContext.answers.dog),'Bruno Blue');
await click('Back');await click('Sign out');await ph().getByRole('dialog').getByRole('button',{name:'Sign out',exact:true}).click();await p.waitForTimeout(850);await click('Continue with Apple');await click('Approve example sign-in');assert.equal(await p.evaluate(()=>NEXT.activeContext.screen.id),'next-home');assert.equal(await p.evaluate(()=>NEXT.activeContext.answers.records.length),1);assert.equal(await p.evaluate(()=>NEXT.activeContext.answers.records[0].note),'Keep this original note');
await ph().screenshot({path:out+'/retained-journal.png'});assert.deepEqual(errors,[]);await writeFile(out+'/retention.json',JSON.stringify({result:'passed',journey:'Edit breed and name → review/save → sign out/in → original journal retained',records:1,errors},null,2));console.log('Dog context edits and sign-in preserve the original journal');
}finally{await b.close();}
