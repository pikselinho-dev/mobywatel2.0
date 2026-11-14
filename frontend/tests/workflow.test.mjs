import {test} from 'node:test';
import assert from 'node:assert/strict';
import {initial,transition,restore,canStart,readNotice,errors} from '../src/workflow.mjs';
const edit=(s,id,key,value)=>transition(s,id,'edit',{key,value});
function filled(delivery='digital'){
 let s=initial();for(const [k,v] of Object.entries({name:'Lena',surname:'Nowak',birthCard:'confirmed',address:'mother',delivery}))s=edit(s,'birth',k,v);
 return s;
}
function send(s,id){s=transition(s,id,'review');return transition(s,id,'submit',{confirmed:true});}
function inspect(s,id){s=transition(s,id,'receive');return transition(s,id,'inspect');}
function finish(s,id){return transition(inspect(send(s,id),id),id,'finish');}
test('blocks submit and finish from draft',()=>{let s=initial();assert.equal(transition(s,'birth','submit',{confirmed:true}),s);assert.equal(transition(s,'birth','finish'),s);});
test('missing birth card blocks review',()=>{let s=edit(filled(),'birth','birthCard','waiting');assert.ok(errors(s.cases.birth).length);assert.equal(transition(s,'birth','review'),s);});
test('requires explicit approval; review is read-only',()=>{let s=transition(filled(),'birth','review');assert.equal(transition(s,'birth','submit'),s);assert.equal(edit(s,'birth','name','Other'),s);assert.equal(transition(s,'birth','back').cases.birth.stage,'draft');});
test('digital delivery completes only after inspection',()=>{let s=send(filled(),'birth');assert.equal(transition(s,'birth','finish'),s);s=finish(filled(),'birth');assert.equal(s.cases.birth.stage,'completed');assert.equal(s.notifications.length,1);assert.equal(s.cases.birth.result.pesel,'DEMO-NIE-JEST-PESEL');});
test('office delivery waits for confirmed collection',()=>{let s=finish(filled('office'),'birth');assert.equal(s.cases.birth.stage,'collection_ready');assert.equal(canStart(s,'benefit'),true);assert.equal(transition(s,'birth','collect'),s);s=transition(s,'birth','collect',{confirmed:true});assert.equal(s.cases.birth.stage,'completed');assert.equal(canStart(s,'benefit'),true);});
test('supplement needs nonempty approved response',()=>{let s=inspect(send(filled(),'birth'),'birth');s=transition(s,'birth','request_info');assert.equal(s.cases.birth.stage,'needs_information');assert.equal(transition(s,'birth','finish'),s);assert.equal(transition(s,'birth','respond',{confirmed:true,response:'  '}),s);assert.equal(transition(s,'birth','respond',{response:'Potwierdzam'}),s);s=transition(s,'birth','respond',{response:'Potwierdzam',confirmed:true});assert.equal(s.cases.birth.stage,'in_review');assert.equal(s.cases.birth.response,'Potwierdzam');assert.equal(transition(s,'birth','finish').cases.birth.stage,'completed');});
test('dependent cases unavailable until birth complete',()=>{let s=filled();assert.equal(transition(s,'health','start'),s);assert.equal(transition(s,'benefit','start'),s);});
test('benefit, insurance and POZ have independent approvals and results',()=>{let s=finish(filled(),'birth');for(const [id,fields] of Object.entries({benefit:{account:'demo-account',care:'confirmed'},insurance:{route:'employer'},health:{clinic:'north',doctor:'demo-doctor'}})){s=transition(s,id,'start');for(const [k,v] of Object.entries(fields))s=edit(s,id,k,v);s=finish(s,id);assert.equal(s.cases[id].stage,'completed');assert.equal(s.cases.birth.stage,'completed');}assert.equal(s.notifications.length,4);});
test('no duplicates or accidental restart',()=>{let s=finish(filled(),'birth');assert.equal(transition(s,'birth','finish'),s);assert.equal(transition(s,'birth','start'),s);});
test('restore retains case history, result and notice; read notice persists',()=>{let s=finish(filled(),'birth');s=readNotice(s,s.notifications[0].key);assert.deepEqual(restore(JSON.stringify(s)),s);assert.equal(s.notifications[0].read,true);});
test('malformed storage and invalid states reset safely',()=>{assert.deepEqual(restore('not json'),initial());let s=filled();s.cases.birth.stage='bad';assert.deepEqual(restore(JSON.stringify(s)),initial());});
test('unknown event and invalid selection do not change data',()=>{let s=initial();assert.equal(edit(s,'birth','delivery','unknown'),s);assert.equal(transition(s,'birth','unknown'),s);assert.equal(transition(s,'unknown','start'),s);});

test('malformed history is rejected',()=>{let s=finish(filled(),'birth');s.cases.birth.history=[null];assert.deepEqual(restore(JSON.stringify(s)),initial());});
