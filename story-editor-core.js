(function(root){
 'use strict';const contract=typeof module==='object'&&module.exports?require('./story-model.js'):root.DV_STORY_CONTRACT;
 const fields=contract.FIELDS,lists=contract.LISTS;
 function snapshot(d){return JSON.stringify({sourceText:d.sourceText,fields:d.fields,characters:d.characters,objects:d.objects,settings:d.settings,fiction:d.fiction,excludedUses:d.excludedUses});}
 function build(drafts,facts){if(!Array.isArray(drafts)||drafts.length>5)throw Error('Revisa las fichas de historia.');
  const model={version:contract.VERSION,items:drafts.map((d,n)=>{const f=facts.find(f=>f.text===d.sourceText&&f.visibility==='players'&&f.kind==='anecdote');if(!f)throw Error('La fuente de una ficha cambió o dejó de estar autorizada. Revísala o elimina la ficha.');const confirmed=d.confirmed===true&&d.confirmation===snapshot(d);const a=text=>text?{status:confirmed?'confirmed':'inferred',text,citations:[{factId:f.id,quote:text}]}:{status:'missing'};
   return{id:'story-'+(n+1),status:confirmed?'confirmed':'inferred',scope:'players',fields:Object.fromEntries(fields.map(k=>[k,a(String(d.fields?.[k]||'').trim())])),...Object.fromEntries(lists.map(k=>[k,String(d[k]||'').split('\n').map(t=>t.trim()).filter(Boolean).map((t,i)=>({...a(t),...(k==='characters'?{role:i===0?'protagonist':'companion'}:{})}))])),use:{game:confirmed,fiction:confirmed&&d.fiction===true,allowedFrames:d.fiction===true?[...contract.FRAMES]:['archive'],excludedUses:[...(d.excludedUses||[])]}};})};return contract.normalize(model,facts);
 }
 function confirm(d,facts){const copy={...d,confirmed:false};build([copy],facts);d.confirmed=true;d.confirmation=snapshot(d);return d;}
 const api={fields,lists,build,confirm,snapshot};if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.DV_STORY_EDITOR=api;
})(typeof window==='object'?window:null);
