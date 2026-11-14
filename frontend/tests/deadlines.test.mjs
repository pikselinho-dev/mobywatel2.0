import {test} from 'node:test';
import assert from 'node:assert/strict';
import {initial,transition,changeDeadline,daysLeft,demoDate,restore,readNotice} from '../src/workflow.mjs';
function prepared(){
 let s=changeDeadline(initial(),{advance:40});
 for(const [key,value] of Object.entries({office:'demo-north',photo:'demo-photo',signature:'yes',contact:'demo-email'}))s=transition(s,'identity','edit',{key,value});
 return s;
}
function submit(s){s=transition(s,'identity','review');return transition(s,'identity','submit',{confirmed:true});}
test('90 days triggers notice, not draft; 60 days creates draft once',()=>{
 let s=changeDeadline(initial(),{advance:10});assert.equal(daysLeft(s),90);assert.equal(s.cases.identity,undefined);assert.equal(s.notifications.length,1);
 s=changeDeadline(s,{advance:30});assert.equal(daysLeft(s),60);assert.equal(s.cases.identity.stage,'draft');assert.equal(s.cases.identity.values.applicant,'Anna Nowak');assert.equal(s.notifications.length,3);
 const old=s;s=changeDeadline(s,{});assert.deepEqual(s,old);
});
test('settings are independent and do not delete draft',()=>{
 let s=changeDeadline(initial(),{reminders:false,advance:40});assert.equal(s.cases.identity.stage,'draft');assert.equal(s.notifications.length,0);
 s=changeDeadline(s,{autoDraft:false});assert.equal(s.cases.identity.stage,'draft');
 s=changeDeadline(initial(),{autoDraft:false,advance:40});assert.equal(s.cases.identity,undefined);assert.equal(s.notifications.length,1);
 s=changeDeadline(s,{autoDraft:true});assert.equal(s.cases.identity.stage,'draft');
});
test('manual identity case independent of birth and missing fields block review',()=>{
 let s=transition(initial(),'identity','start');assert.equal(s.cases.identity.stage,'draft');assert.equal(transition(s,'identity','review'),s);assert.equal(transition(s,'identity','submit',{confirmed:true}),s);
});
test('identity requires explicit approval and physical visit before production',()=>{
 let s=transition(prepared(),'identity','review');assert.equal(transition(s,'identity','submit'),s);
 s=transition(s,'identity','submit',{confirmed:true});assert.equal(s.deadline.visitDue,s.deadline.day+30);
 s=transition(s,'identity','receive');assert.equal(s.cases.identity.stage,'visit_required');assert.equal(transition(s,'identity','finish'),s);assert.equal(transition(s,'identity','visit'),s);
 s=transition(s,'identity','visit',{confirmed:true});assert.equal(s.cases.identity.stage,'received');
 s=transition(s,'identity','inspect');s=transition(s,'identity','finish');assert.equal(s.cases.identity.stage,'collection_ready');assert.equal(s.deadline.renewed,false);
 assert.equal(transition(s,'identity','collect'),s);
 s=transition(s,'identity','collect',{confirmed:true});assert.equal(s.cases.identity.stage,'completed');assert.equal(s.deadline.renewed,true);assert.equal(demoDate(s.deadline.expiryDay),demoDate(s.deadline.day).replace('2026','2036'));assert.equal(transition(s,'identity','collect',{confirmed:true}),s);
});
test('visit deadline permits day 30; day 31 expires and permits restart',()=>{
 let s=transition(submit(prepared()),'identity','receive');s=changeDeadline(s,{advance:30});
 assert.equal(s.cases.identity.stage,'visit_required');assert.equal(transition(s,'identity','visit',{confirmed:true}).cases.identity.stage,'received');
 s=changeDeadline(s,{advance:1});assert.equal(s.cases.identity.stage,'expired');assert.equal(transition(s,'identity','visit',{confirmed:true}),s);
 s=transition(s,'identity','restart');assert.equal(s.cases.identity.stage,'draft');assert.equal(s.deadline.visitDue,null);
});
test('clock jump generates one relevant expiry reminder and a draft',()=>{
 let s=changeDeadline(initial(),{advance:100});assert.equal(daysLeft(s),0);assert.equal(s.cases.identity.stage,'draft');assert.equal(s.notifications.length,2);assert.equal(s.deadline.emitted.length,5);assert.equal(changeDeadline(s,{advance:10}).notifications.length,2);
});
test('persistence and v2 migration retain family data',()=>{
 let s=changeDeadline(initial(),{advance:40});s=readNotice(s,s.notifications[0].key);assert.deepEqual(restore(JSON.stringify(s)),s);
 let legacy=initial();delete legacy.deadline;assert.deepEqual(restore(JSON.stringify(legacy)),initial());
});
test('expired even if office receipt has not been simulated',()=>{
 let s=submit(prepared());s=changeDeadline(s,{advance:31});assert.equal(s.cases.identity.stage,'expired');
});

test('delayed collection does not extend document validity',()=>{
 let s=transition(submit(prepared()),'identity','receive');s=transition(s,'identity','visit',{confirmed:true});s=transition(s,'identity','inspect');s=transition(s,'identity','finish');
 const issued=demoDate(s.deadline.day);s=changeDeadline(s,{advance:7});s=transition(s,'identity','collect',{confirmed:true});
 assert.equal(demoDate(s.deadline.expiryDay),issued.replace('2026','2036'));
});
