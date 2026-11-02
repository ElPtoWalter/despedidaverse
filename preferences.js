(function(root){
 'use strict';
 function fromForm(data){
  const maxIntensity=Number(data.get('maxIntensity')||2);
  if(!Number.isInteger(maxIntensity)||maxIntensity<1||maxIntensity>3)throw new Error('Elige una intensidad válida.');
  const blockedTopics=String(data.get('blockedTopics')||'').split(',').map(x=>x.trim()).filter(Boolean);
  if(blockedTopics.length>20||blockedTopics.some(x=>x.length>80))throw new Error('Acorta los temas excluidos.');
  return {version:'dv-preferences-v1',maxIntensity,allowPhotoChallenges:data.get('excludePhotos')!=='yes',allowPhysical:data.get('excludePhysical')!=='yes',allowDrinks:data.get('excludeDrinks')!=='yes',allowOutside:false,blockedTopics};
 }
 function summary(policy){
  const intensity=['','Suave','Gamberra','Muy gamberra'][policy.maxIntensity];
  const excluded=[!policy.allowPhotoChallenges&&'retos de foto/vídeo',!policy.allowPhysical&&'actividad física',!policy.allowDrinks&&'bebidas','interacción con desconocidos'].filter(Boolean);
  return `Intensidad: ${intensity}\nActividades excluidas: ${excluded.join(', ')}\nTemas excluidos: ${policy.blockedTopics.join(', ')||'Ninguno indicado'}`;
 }
 function withMessage(data){
  const policy=fromForm(data),message=String(data.get('message')||'').replace(/\n\nPreferencias acordadas:[\s\S]*$/,'');
  data.set('contentPolicy',JSON.stringify(policy));
  data.set('message',message+'\n\nPreferencias acordadas:\n'+summary(policy)+'\nDV_PREFS_V1='+JSON.stringify(policy));
  return data;
 }
 const api={fromForm,summary,withMessage};if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.DV_PREFERENCES=api;
})(typeof window==='object'?window:null);
