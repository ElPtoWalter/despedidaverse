const test=require('node:test'),assert=require('node:assert/strict');
const {fromForm,withMessage}=require('../preferences.js');
test('structured exclusions are booleans and survive in the existing CRM message',()=>{
 const data=new FormData();data.set('message','Idea original');data.set('maxIntensity','1');for(const key of ['excludePhotos','excludePhysical','excludeDrinks'])data.set(key,'yes');data.set('blockedTopics','trabajo, exparejas');
 const policy=fromForm(data);assert.equal(policy.allowPhotoChallenges,false);assert.equal(policy.allowPhysical,false);assert.equal(policy.allowDrinks,false);assert.equal(policy.allowOutside,false);assert.deepEqual(policy.blockedTopics,['trabajo','exparejas']);
 withMessage(data);assert(data.get('message').startsWith('Idea original'));assert.equal(JSON.parse(data.get('contentPolicy')).maxIntensity,1);assert.deepEqual(JSON.parse(data.get('message').split('DV_PREFS_V1=')[1]),policy);withMessage(data);assert.equal(data.get('message').match(/DV_PREFS_V1=/g).length,1);
});
test('invalid preference payloads are rejected before transport',()=>{const data=new FormData();data.set('maxIntensity','4');assert.throws(()=>fromForm(data));data.set('maxIntensity','2');data.set('blockedTopics','x'.repeat(81));assert.throws(()=>fromForm(data));});
