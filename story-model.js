(function(root){
 'use strict';
 const VERSION='dv-story-model-1',FIELDS=['event','comicSituation','conflict','recognizablePhrase','realOutcome'],LISTS=['characters','objects','settings'],FRAMES=['archive','appeal','broadcast','redesign','alternate-plan','decoding'],USES=[...FIELDS,...LISTS,...FRAMES];
 const err=message=>{throw Error('RC3_STORY_CONTRACT: '+message);};
 const object=(v,keys)=>{if(!v||typeof v!=='object'||Array.isArray(v)||Object.keys(v).some(k=>!keys.includes(k)))err('Campos desconocidos.');};
 const safe=s=>typeof s==='string'&&s.length>=1&&s.length<=360&&!/[<>\u0000-\u001f]/.test(s)&&!/(?:https?:\/\/|[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}|\b\d[\d ()-]{8,}\d\b)/i.test(s);
 function atom(raw,facts,scope){
  if(raw===undefined)return{status:'missing'};object(raw,['status','text','citations','role']);
  if(!['confirmed','inferred','missing'].includes(raw.status))err('Estado no válido.');
  if(raw.status==='missing'){if(Object.keys(raw).some(k=>k!=='status'))err('Un dato ausente no contiene texto.');return{status:'missing'};}
  if(!safe(raw.text)||!Array.isArray(raw.citations)||!raw.citations.length||raw.citations.length>3)err('Cada dato necesita texto breve y citas.');
  const citations=raw.citations.map(c=>{object(c,['factId','quote']);const fact=facts.find(f=>f.id===c.factId);if(!fact||fact.consent!==true||!safe(c.quote)||!fact.text.includes(c.quote)||!c.quote.includes(raw.text)||scope==='players'&&(fact.visibility!=='players'||fact.kind==='partner'))err('Cita o alcance no autorizado.');return{factId:c.factId,quote:c.quote};});
  if(raw.role!==undefined&&!['protagonist','companion','counterpart','narrator'].includes(raw.role))err('Papel de narración no válido.');
  return{status:raw.status,text:raw.text,citations,...(raw.role?{role:raw.role}:{})};
 }
 function normalize(raw,facts){
  if(raw===undefined)return{version:VERSION,items:[]};object(raw,['version','items']);if(raw.version!==VERSION||!Array.isArray(raw.items)||raw.items.length>5||JSON.stringify(raw).length>36000)err('Modelo o tamaño no válido.');
 const ids=new Set(),events=new Set(),fold=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();return{version:VERSION,items:raw.items.map(s=>{object(s,['id','status','scope','fields','characters','objects','settings','use']);if(!/^[-A-Za-z0-9_]{1,60}$/.test(s.id)||ids.has(s.id)||!['confirmed','inferred'].includes(s.status)||!['players','committee'].includes(s.scope))err('Identidad o estado de historia.');ids.add(s.id);object(s.fields||{},FIELDS);object(s.use,['game','fiction','allowedFrames','excludedUses']);if(typeof s.use.game!=='boolean'||typeof s.use.fiction!=='boolean'||!Array.isArray(s.use.allowedFrames)||s.use.allowedFrames.some(f=>!FRAMES.includes(f))||new Set(s.use.allowedFrames).size!==s.use.allowedFrames.length||!Array.isArray(s.use.excludedUses)||s.use.excludedUses.length>12||s.use.excludedUses.some(x=>!safe(x)))err('Permisos de historia incompletos.');
   if(s.use.excludedUses.some(x=>!USES.includes(x)))err('Un límite libre necesita revisión: utiliza los campos y usos definidos.');
   const result={id:s.id,status:s.status,scope:s.scope,fields:Object.fromEntries(FIELDS.map(k=>[k,atom(s.fields?.[k],facts,s.scope)])),use:structuredClone(s.use)};
   for(const key of LISTS){if(s[key]!==undefined&&(!Array.isArray(s[key])||s[key].length>6))err('Lista demasiado larga.');result[key]=(s[key]||[]).map(a=>atom(a,facts,s.scope));const values=result[key].filter(a=>a.status!=='missing').map(a=>fold(a.text));if(new Set(values).size!==values.length)err('Una lista no repite el mismo elemento.');}if(result.fields.event.status!=='missing'){const event=fold(result.fields.event.text);if(events.has(event))err('No dupliques el mismo acontecimiento en varias fichas.');events.add(event);}return result;})};
 }
 const confirmed=s=>s.status==='confirmed'&&s.scope==='players'&&s.use.game===true;
 const get=(s,key)=>!s.use.excludedUses.includes(key)&&s.fields[key]?.status==='confirmed'?s.fields[key].text:null;
 const values=(s,key)=>s.use.excludedUses.includes(key)?[]:(s[key]||[]).filter(a=>a.status==='confirmed').map(a=>a.text);
 function report(model){return model.items.map(s=>({id:s.id,usable:confirmed(s),confirmedFields:FIELDS.filter(k=>get(s,k)),missingFields:FIELDS.filter(k=>s.fields[k].status==='missing'),inferredFields:FIELDS.filter(k=>s.fields[k].status==='inferred'),confirmedCharacters:values(s,'characters').length,confirmedObjects:values(s,'objects').length,confirmedSettings:values(s,'settings').length,fictionAllowed:s.use.fiction}));}
 const api={VERSION,FIELDS,LISTS,FRAMES,normalize,confirmed,get,values,report};if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.DV_STORY_CONTRACT=api;
})(typeof window==='object'?window:null);
