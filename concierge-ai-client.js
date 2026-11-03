(function(root){'use strict';
 function createAiClient({enabled=false,endpoint='/api/concierge-ai',fetchImpl=globalThis.fetch}={}){
  return{async suggest({turns,sessionToken,externalConsent=false,requestId}={}){
   if(!enabled)return{mode:'local',reason:'disabled'};
   // Only same-origin routes are supported. Neither provider URL nor API key
   // is accepted by the client; the bearer is a short-lived user session.
   if(typeof endpoint!=='string'||!/^\/api\/[a-z-]+$/.test(endpoint)||!sessionToken||!externalConsent)return{mode:'local',reason:'consent-or-session'};
   if(!Array.isArray(turns)||turns.length>12)return{mode:'local',reason:'invalid-turns'};
   const selected=turns.filter(t=>t&&t.visibility==='players'&&t.kind!=='partner'&&t.useConsent===true&&t.externalConsent===true).map(t=>({id:t.id,text:t.text,kind:t.kind,visibility:'players',useConsent:true,externalConsent:true}));
   if(!selected.length)return{mode:'local',reason:'no-shared-consented-turns'};
   const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),10000);
   try{const r=await fetchImpl(endpoint,{method:'POST',credentials:'same-origin',cache:'no-store',signal:controller.signal,headers:{'content-type':'application/json',authorization:'Bearer '+sessionToken},body:JSON.stringify({version:'dv-ai-request-1',requestId:requestId||crypto.randomUUID(),externalConsent:true,turns:selected})});if(!r.ok)return{mode:'local',reason:'backend-unavailable'};const value=await r.json(),s=value.suggestion;if(value.mode!=='ai-suggestion'||s?.status!=='hypothesis'||s?.consent!==false||s?.requiresOrganizerConfirmation!==true||!Array.isArray(s.suggestions)||s.suggestions.length>8||s.suggestions.some(q=>!selected.some(t=>t.id===q.sourceTurnId&&typeof q.quote==='string'&&q.quote.length>=3&&t.text.includes(q.quote))))return{mode:'local',reason:'backend-fallback'};return value;}catch{return{mode:'local',reason:'connection'};}finally{clearTimeout(timer);}
  }};
 }
 const api={createAiClient};if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.DV_CONCIERGE_AI=api;
})(typeof window==='object'?window:null);
