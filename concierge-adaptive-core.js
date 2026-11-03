(function(root){
 'use strict';
 const VERSION='dv-concierge-local-rc2-1';
 const facets=['personality','competitiveness','lossReaction','embarrassment','humor','recurringJokes','groupHistory','catchphrases','songs','nicknames','rivalries','keyFriends','favorites','comicDislikes','partnerPreferences','characters','pastExperiences','limits'];
 const fold=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const questions={
  opening:'Cuéntame cómo es vuestro colega cuando está con vosotros. Una escena concreta nos da más juego que una lista de adjetivos.',
  competitionActivity:'¿En qué se pica más? Cuéntame una actividad concreta y qué suele pasar. No hace falta inventar una derrota.',
  competitionDetail:'Con «cualquier competición» aún no tenemos una escena. ¿Puedes dar un ejemplo concreto o prefieres dejarlo sin completar?',
  catchphrase:'¿Qué frase o broma autorizada le repetís cuando pasa eso? Si no hay ninguna, podemos seguir sin ella.',
  story:'¿Hay una historia pequeña del grupo que el protagonista autorice convertir en juego? Cuenta solo lo que podemos utilizar.',
  preference:'¿Qué afición u objeto cotidiano reconoce enseguida? Con pocos datos también podemos preparar algo propio.',
  humor:'¿Qué situación le hace reír? Puede ser un personaje, un tipo de absurdo o una broma recurrente aceptada.',
  theme:'¿Queréis un tema ficticio que una el desenlace? Por ejemplo, un museo de vuestras excusas. Es opcional: no añade recuerdos reales.',
  partner:'¿Queréis añadir un mensaje o respuesta exacta de la pareja? Solo si está autorizado para este uso; por defecto quedará reservado al comité.',
  done:'Ya hay material para diseñar. Puedes seguir añadiendo referencias opcionales, corregir lo que he recogido o revisar el recorrido rápido.'
 };
 function create(){return{version:VERSION,turns:[],candidates:[],asked:['opening'],skipped:[],current:'opening',nextId:1,ready:false,limitsConfirmed:false};}
 const sensitive=/\b(?:diagnostico|historia clinica|orientacion sexual|numero de tarjeta|contrasena|dni|pasaporte|domicilio exacto)\b/;
 function classify(text,context){const t=fold(text);if(context==='partner')return{kind:'partner',facet:'partnerPreferences'};if(context==='catchphrase'||/frase|le decimos|repetimos|broma/.test(t))return{kind:'insideJoke',facet:'catchphrases'};if(/cancion|playlist|tema musical/.test(t))return{kind:'song',facet:'songs'};if(context==='competitionActivity'||/ayer|aquella vez|en los karts|perdio|perdimos|ocurrio|una vez/.test(t))return{kind:'anecdote',facet:context==='competitionActivity'?'lossReaction':'groupHistory'};if(/rivalidad|rival amistos|amigos desde/.test(t))return{kind:'relationship',facet:'rivalries'};if(/competitiv|se pica/.test(t))return{kind:'preference',facet:'competitiveness'};if(context==='humor')return{kind:'preference',facet:'humor'};return{kind:'preference',facet:context==='opening'?'personality':'favorites'};}
 function next(s){const approved=s.candidates.filter(c=>c.status==='confirmed'),all=fold(approved.map(c=>c.text).join(' '));
  const choices=[];const competitive=/competitiv|se pica/.test(all)&&!/(?:no es|nada|poco) competitiv|no se pica/.test(all);if(competitive){choices.push('competitionActivity');if(approved.some(c=>c.question==='competitionActivity'&&/cualquier|de todo|todas/.test(fold(c.text)))&&!approved.some(c=>/karts|cartas|futbol|videojuego|ajedrez|deporte|torneo/.test(fold(c.text))))choices.push('competitionDetail');choices.push('catchphrase');}
  if(approved.length<2)choices.push('story','preference');choices.push('humor','theme','partner');
  const id=choices.find(q=>!s.asked.includes(q)&&!s.skipped.includes(q))||'done';s.current=id;if(!s.asked.includes(id))s.asked.push(id);s.ready=id==='done';return{ id,text:questions[id]};
 }
 function answer(s,text){if(s.version!==VERSION)throw Error('Borrador incompatible.');text=String(text||'').trim();if(text.length<3||text.length>1500)throw Error('Escribe entre 3 y 1500 caracteres.');if(s.candidates.length>=60)throw Error('Ya hay 60 referencias; revisa o elimina alguna antes de añadir.');
  if(/^(?:no (?:lo )?se|no tengo (?:nada|mas|informacion)|prefiero (?:no|pasar)|no hay ninguna)[.! ]*$/.test(fold(text))){skip(s);return{skipped:true,message:'Seguimos sin rellenar ese dato ni inventar una respuesta.'};}
  s.turns.push({role:'organizer',text,question:s.current});
  if(sensitive.test(fold(text))){s.turns.pop();return{blocked:true,message:'Esta información no es necesaria para diseñar el juego. Usa una anécdota o preferencia no sensible; no se ha guardado esta respuesta.'};}
  const duplicate=s.candidates.find(c=>fold(c.text)===fold(text));if(duplicate)return{duplicate:true,message:'Ya está recogido. Puedes corregir su ficha sin repetirlo.'};
  const type=classify(text,s.current),candidate={id:'local-'+s.nextId++,...type,text,status:'hypothesis',consent:false,visibility:type.kind==='partner'?'committee':'players',question:s.current};
  s.candidates.push(candidate);return{candidate,message:'He recogido tu texto literal. La categoría es una sugerencia local: confirma o corrige la ficha antes de usarla.'};
 }
 function confirm(s,id,{consent,visibility,kind,facet}){const c=s.candidates.find(c=>c.id===id);if(!c)throw Error('Referencia desconocida.');if(consent!==true)throw Error('Confirma que esta referencia y el uso de información de terceros están autorizados.');if(!['players','committee'].includes(visibility)||!['anecdote','insideJoke','preference','relationship','partner','song'].includes(kind)||!facets.includes(facet))throw Error('Revisa la categoría y la visibilidad.');Object.assign(c,{status:'confirmed',consent:true,visibility,kind,facet});s.limitsConfirmed=false;return next(s);}
 function correct(s,id,text){const c=s.candidates.find(c=>c.id===id);text=String(text||'').trim();if(!c||text.length<3||text.length>1500||sensitive.test(fold(text)))throw Error('Corrección no válida; usa información no sensible.');for(const t of s.turns)if(t.text===c.text)t.text=text;c.text=text;c.status='hypothesis';c.consent=false;s.limitsConfirmed=false;}
 function remove(s,id){const old=s.candidates.find(c=>c.id===id);s.candidates=s.candidates.filter(c=>c.id!==id);if(old)s.turns=s.turns.filter(t=>t.text!==old.text);s.limitsConfirmed=false;}
 function skip(s){if(!s.skipped.includes(s.current))s.skipped.push(s.current);return next(s);}
 function contradictions(s,base){const text=fold(s.candidates.filter(c=>c.status==='confirmed').map(c=>c.text).join(' ')),issues=[];for(const [pattern,flag,axis,label]of [[/\b(?:sin|no queremos|nada de) (?:alcohol|bebida)/,'allowDrinks','drink','bebida'],[/\b(?:sin|no queremos|nada de) (?:retos fisicos|fisico|movimiento)/,'allowPhysical','physical','físico'],[/\b(?:sin|no queremos|nada de) (?:fotos|fotografias)/,'allowPhotoChallenges',null,'fotografía'],[/\b(?:sin|no queremos|nada de) (?:calle|publico|exterior)/,'allowOutside','public','público/exterior']])if(pattern.test(text)&&(base[flag]||(axis&&Number(base.axes?.[axis])>0)))issues.push('La conversación excluye '+label+' y el recorrido rápido lo permite. Revisa y confirma el límite.');return issues;}
 function build(s,base,legacyCore){if(s.candidates.some(c=>c.status!=='confirmed'))throw Error('Confirma, corrige o elimina las hipótesis pendientes antes de exportar.');if(!s.limitsConfirmed)throw Error('Confirma los límites y la visibilidad antes de exportar.');const issues=contradictions(s,base);if(issues.length)throw Error(issues.join(' '));
  const confirmed=s.candidates.filter(c=>c.status==='confirmed'&&c.consent),all=[...(base.facts||[]),...confirmed];const unique=all.filter((f,i,a)=>a.findIndex(x=>x.kind===f.kind&&x.text===f.text&&x.visibility===f.visibility)===i);
  const result=legacyCore.build({...base,facts:unique}),b=result.input.brief;b.version='dv-brief-v6.1-rc2.1';b.profile={version:'dv-protagonist-profile-1',facets:confirmed.map(c=>({key:c.facet,factId:b.facts.find(f=>f.kind===c.kind&&f.text===c.text&&f.visibility===c.visibility).id}))};
  const theme=confirmed.find(c=>c.question==='theme');if(theme)b.profile.theme={title:theme.text.slice(0,100),factIds:[b.facts.find(f=>f.kind===theme.kind&&f.text===theme.text&&f.visibility===theme.visibility).id]};
  result.version='dv-concierge-6.1-rc2.1';result.mode='local-adaptive-rules';result.input.productionNotes.message='Brief RC2 preparado localmente. La conversación usa reglas locales; no hay llamadas de IA.\nDV_PREFS_V1='+JSON.stringify(result.input.contentPolicy)+'\nDV_BRIEF_V61='+JSON.stringify(b);return result;
 }
 const api={VERSION,facets,questions,create,answer,confirm,correct,remove,skip,next,contradictions,build};if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.DV_RC2_CONCIERGE=api;
})(typeof window==='object'?window:null);
