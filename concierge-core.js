(function(root){
 'use strict';
 const axes=['embarrassment','physical','drink','public','duration','competition'];
 function build(state){
  const error=message=>{throw new Error(message);};
  if(typeof state.protagonist!=='string'||state.protagonist.trim().length<2)error('Indica cómo se llama el protagonista.');
  if(!['Juego','Universo'].includes(state.package))error('Elige Juego o Universo para este recorrido. Esencial conserva su propuesta de recuerdos.');
  const maxIntensity=Number(state.maxIntensity);if(![1,2,3].includes(maxIntensity))error('Elige una intensidad acordada.');
  const policy={version:'dv-preferences-v1',maxIntensity,allowPhotoChallenges:state.allowPhotoChallenges===true,allowPhysical:state.allowPhysical===true,allowDrinks:state.allowDrinks===true,allowOutside:state.allowOutside===true,blockedTopics:String(state.blockedTopics||'').split(',').map(s=>s.trim()).filter(Boolean)};
  if(policy.blockedTopics.length>20||policy.blockedTopics.some(t=>t.length>80))error('Acorta los temas excluidos.');
  if(!state.axes||axes.some(k=>!Number.isInteger(Number(state.axes[k]))||Number(state.axes[k])<0||Number(state.axes[k])>5))error('Revisa las seis dimensiones del Puteómetro.');
  const profile=Object.fromEntries(axes.map(k=>[k,Number(state.axes[k])]));
  for(const [flag,axis]of [['allowPhysical','physical'],['allowDrinks','drink'],['allowOutside','public']])if(!policy[flag]&&profile[axis]>0)error('El Puteómetro contradice un límite. Revisa '+axis+'.');
  if(profile.embarrassment>[0,1,3,5][maxIntensity])error('Vergüenza supera la intensidad acordada.');
  const environment=state.environment;if(!['private-indoor','private-outdoor','public-authorized'].includes(environment))error('Elige el entorno del evento.');if(environment==='public-authorized'&&!policy.allowOutside)error('El entorno público necesita permiso de exterior.');
  const list=(value,max,label)=>{const arr=Array.isArray(value)?value:String(value||'').split(/[,\n]/);const values=arr.map(v=>String(v).trim()).filter(Boolean);if(values.length>max||values.some(v=>v.length>100)||new Set(values).size!==values.length)error('Revisa '+label+'.');return values;};
  const participants=list(state.participants,80,'los participantes');if(participants.length<2)error('Indica al menos dos participantes voluntarios.');
  const resources=list(state.resources,40,'los materiales');
  const facts=(state.facts||[]).filter(f=>String(f.text||'').trim()).map((f,index)=>{
   if(!['anecdote','insideJoke','song','preference','relationship','partner','photo'].includes(f.kind)||f.consent!==true||!['players','committee'].includes(f.visibility)||String(f.text).length>1500)error('Cada referencia necesita autorización y visibilidad. No añadas recuerdos ni respuestas inventadas.');
   if(f.kind==='photo'&&(!policy.allowPhotoChallenges||!f.assetId))error('La fotografía necesita permiso y el nombre del recurso autorizado.');
   return{id:'concierge-'+f.kind+'-'+(index+1),kind:f.kind,text:String(f.text).trim(),visibility:f.visibility,consent:true,...(f.kind==='photo'?{assetId:f.assetId}: {})};
  });
  if(!facts.length)error('Aporta al menos una referencia autorizada para preparar un cierre propio. Puede ser una preferencia sencilla.');
  const brief={version:'dv-brief-v6.1',puteometer:profile,environment,resources,participants,nickname:String(state.nickname||'').trim().slice(0,100),facts,selectedRuleIds:list(state.selectedRuleIds||[],3,'las reglas'),selectedMissionIds:list(state.selectedMissionIds||[],4,'las misiones'),selectedModifierIds:list(state.selectedModifierIds||[],3,'los modificadores')};
  const limits=String(state.limits||'').trim();if(limits.length>2000)error('Acorta los límites libres.');
  const message='Preferencias y brief preparados localmente. Los límites libres requieren revisión de Factory.\nDV_PREFS_V1='+JSON.stringify(policy)+'\nDV_BRIEF_V61='+JSON.stringify(brief);
  return{version:'dv-concierge-6.1',protagonist:state.protagonist.trim(),package:state.package,input:{brief,contentPolicy:policy,productionNotes:{limits,message}}};
 }
 const api={axes,build};if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.DV61_CONCIERGE=api;
})(typeof window==='object'?window:null);
