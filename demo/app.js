(()=>{
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const challenges=[
    {id:'brindis',cost:1,title:'Brindis presidencial',desc:'Da un brindis de 30 segundos como si hubieras ganado unas elecciones.'},
    {id:'estatua',cost:2,title:'Modo estatua',desc:'Cuando alguien diga tu nombre, congélate 5 segundos durante la siguiente ronda.'},
    {id:'portada',cost:3,title:'Portada de disco',desc:'El grupo debe recrear una portada de álbum usando lo que tenga a mano.'},
    {id:'rueda',cost:3,title:'Rueda de prensa',desc:'Responde cinco preguntas absurdas del comité manteniendo tono totalmente serio.'},
    {id:'documental',cost:5,title:'Documental de naturaleza',desc:'Durante un minuto alguien narrará tus movimientos como si fueras una especie salvaje.'},
    {id:'teletienda',cost:5,title:'Teletienda humana',desc:'Vende un objeto cotidiano durante un minuto como si costara miles de euros.'}
  ];
  const wheelPool=['brindis','estatua','portada','rueda','documental','teletienda'];
  const secrets=new Map([['peseta','PESETA'],['parlita','PARLITA'],['consigliere','IL CONSIGLIERE'],['il consigliere','IL CONSIGLIERE']]);
  const state={name:'',tokens:5,cart:[],bought:[],found:[],memories:[],wheel:false,wheelHit:'',rotation:0};
  let shopFilter='all',toastTimer=null;
  const milestones=()=>({wheel:state.wheel,buy:state.bought.length>0,name:state.found.length>0,memory:state.memories.length>0});
  const progress=()=>Object.values(milestones()).filter(Boolean).length;
  function showToast(text){const t=$('#toast');t.textContent=text;t.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),1800)}
  function switchView(id){$$('[data-panel]').forEach(v=>v.classList.toggle('active',v.dataset.panel===id));$$('[data-view]').forEach(b=>b.classList.toggle('active',b.dataset.view===id));scrollTo({top:0,behavior:'smooth'});if(id==='final')renderFinal()}
  $$('[data-view]').forEach(b=>b.addEventListener('click',()=>switchView(b.dataset.view)));
  function render(){
    $('#token-count').textContent=state.tokens;$('#home-bought').textContent=state.bought.length;$('#home-names').textContent=state.found.length;$('#home-memory').textContent=state.memories.length;
    const m=milestones();for(const k of Object.keys(m))$(`#milestone-${k}`)?.classList.toggle('done',m[k]);$('#global-progress').style.width=`${progress()*25}%`;
    $('#cart-count').textContent=state.cart.length;$('#cart-total').textContent=cartTotal();renderShop();renderSecrets();renderMemories();renderFinal();
  }
  $('#gate-form').addEventListener('submit',e=>{e.preventDefault();state.name=$('#player-name').value.trim()||'Jugador';$('#hello-title').textContent=`Buenas, ${state.name}.`;$('#gate').hidden=true;$('#app').hidden=false;render();setTimeout(()=>openOverlay('help-overlay'),220)});
  function openOverlay(id){$(`#${id}`).hidden=false;document.body.style.overflow='hidden'} function closeOverlay(id){$(`#${id}`).hidden=true;document.body.style.overflow=''}
  $$('[data-close]').forEach(b=>b.addEventListener('click',()=>closeOverlay(b.dataset.close)));$('#how-btn').addEventListener('click',()=>openOverlay('help-overlay'));
  const wheel=$('#wheel');$('#spin').addEventListener('click',()=>{const btn=$('#spin');btn.disabled=true;state.rotation+=1440+Math.floor(Math.random()*720);wheel.style.transform=`rotate(${state.rotation}deg)`;$('#roulette-result h3').textContent='La ruleta está decidiendo…';$('#roulette-result p').textContent='';setTimeout(()=>{const id=wheelPool[Math.floor(Math.random()*wheelPool.length)],c=challenges.find(x=>x.id===id);state.wheel=true;state.wheelHit=id;$('#roulette-result h3').textContent=c.title;$('#roulette-result p').textContent=`${c.cost} tokens · ${c.desc}`;btn.textContent='Girar otra vez';btn.disabled=false;render();showToast('Putada seleccionada');},matchMedia('(prefers-reduced-motion:reduce)').matches?120:3050)});
  function cartTotal(){return state.cart.reduce((a,id)=>a+(challenges.find(c=>c.id===id)?.cost||0),0)}
  function renderShop(){
    $('#shop-tabs').querySelectorAll('button').forEach(b=>b.classList.toggle('active',b.dataset.cost===shopFilter));
    const filtered=challenges.filter(c=>shopFilter==='all'||String(c.cost)===shopFilter);
    $('#shop-grid').innerHTML=filtered.map(c=>{const added=state.cart.includes(c.id),bought=state.bought.includes(c.id),highlight=state.wheelHit===c.id;return `<article class="shop-card ${highlight?'highlight':''}" data-shop="${c.id}"><small>${highlight?'TE HA TOCADO · ':''}${c.cost} TOKEN${c.cost===1?'':'S'}</small><h3>${c.title}</h3><p>${c.desc}</p><button class="primary ${added||bought?'added':''}" data-add="${c.id}" ${bought?'disabled':''}>${bought?'Comprada ✓':added?'En carrito ✓':'Añadir al carrito'}</button></article>`}).join('');
    $$('[data-add]').forEach(b=>b.addEventListener('click',()=>toggleCart(b.dataset.add)));
  }
  $('#shop-tabs').addEventListener('click',e=>{const b=e.target.closest('[data-cost]');if(!b)return;shopFilter=b.dataset.cost;renderShop()});
  function toggleCart(id){if(state.bought.includes(id))return;const i=state.cart.indexOf(id);if(i>=0){state.cart.splice(i,1);render();return}const c=challenges.find(x=>x.id===id);if(cartTotal()+c.cost>state.tokens){showToast('Ese carrito supera tus tokens');return}state.cart.push(id);render();showToast('Añadida al carrito')}
  $('#cart-button').addEventListener('click',()=>{renderCart();openOverlay('cart-overlay')});
  function renderCart(){const lines=$('#cart-lines');lines.innerHTML=state.cart.length?state.cart.map(id=>{const c=challenges.find(x=>x.id===id);return `<article class="cart-line"><div><strong>${c.title}</strong><small>${c.cost} tokens</small></div><button data-remove="${id}">Quitar</button></article>`}).join(''):'<p>El carrito está vacío.</p>';$('#cart-modal-total').textContent=cartTotal();$('#checkout').disabled=!state.cart.length;$$('[data-remove]',lines).forEach(b=>b.addEventListener('click',()=>{state.cart=state.cart.filter(x=>x!==b.dataset.remove);render();renderCart()}))}
  $('#checkout').addEventListener('click',()=>{const total=cartTotal();if(!state.cart.length||total>state.tokens)return;const ids=[...state.cart];state.tokens-=total;ids.forEach(id=>{if(!state.bought.includes(id))state.bought.push(id)});state.cart=[];closeOverlay('cart-overlay');$('#purchase-title').textContent=total>=5?'Compra gorda. Se viene liada.':'Compra completada.';$('#purchase-lines').innerHTML=ids.map(id=>{const c=challenges.find(x=>x.id===id);return `<article class="purchase-line"><strong>${c.title}</strong><span>${c.cost} t</span></article>`}).join('');openOverlay('purchase-overlay');render();showToast(`-${total} tokens`)});
  $('#secret-form').addEventListener('submit',e=>{e.preventDefault();const input=$('#secret-input'),key=input.value.trim().toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu,''),hit=secrets.get(key),feedback=$('#secret-feedback');if(!hit){feedback.textContent='No es una identidad de esta demo.';feedback.style.color='var(--red)';input.value='';return}if(!state.found.includes(hit))state.found.push(hit);feedback.textContent=`Identidad descubierta: ${hit} · +2 tokens`;feedback.style.color='';if(!input.dataset.rewarded?.includes(hit)){state.tokens+=2;input.dataset.rewarded=(input.dataset.rewarded||'')+'|'+hit}input.value='';render();showToast('+2 tokens')});
  function renderSecrets(){const list=[...state.found].slice(0,3);$('#secret-grid').innerHTML=[0,1,2].map(i=>list[i]?`<span class="found">${list[i]}</span>`:'<span>???</span>').join('')}
  $$('#memory-grid [data-memory]').forEach(card=>card.querySelector('button').addEventListener('click',()=>revealMemory(Number(card.dataset.memory))));
  function revealMemory(i){if(state.memories.includes(i))return;const card=$(`[data-memory="${i}"]`);if(i===1){if(state.tokens<2){showToast('Necesitas 2 tokens');return}state.tokens-=2;showToast('-2 tokens')}else{state.tokens+=1;showToast('+1 token')}state.memories.push(i);card.classList.add('revealed');card.querySelector('button').textContent='Revelado ✓';card.querySelector('button').disabled=true;render()}
  function renderMemories(){state.memories.forEach(i=>{const c=$(`[data-memory="${i}"]`);c?.classList.add('revealed');if(c){const b=c.querySelector('button');b.textContent='Revelado ✓';b.disabled=true}})}
  function renderFinal(){const n=progress(),open=n===4;$('#final-kicker').textContent=open?'DESBLOQUEADA':`PROGRESO ${n}/4`;$('#final-title').textContent=open?'El expediente final está preparado.':`Completa ${4-n} acción${4-n===1?'':'es'} más.`;$('#final-copy').textContent=open?'En el producto real este momento puede tener animación, sonido y contenido totalmente personalizado.':'Ruleta + compra + nombre + recuerdo.';$('#final-open').disabled=!open}
  $('#final-open').addEventListener('click',()=>openOverlay('final-overlay'));
  $('#reset-demo').addEventListener('click',()=>{Object.assign(state,{tokens:5,cart:[],bought:[],found:[],memories:[],wheel:false,wheelHit:'',rotation:0});wheel.style.transform='rotate(0deg)';$('#secret-input').dataset.rewarded='';$('#roulette-result h3').textContent='Hazla girar.';$('#roulette-result p').textContent='La ruleta escogerá una putada de esta demo.';$$('[data-memory]').forEach(c=>{c.classList.remove('revealed');const b=c.querySelector('button');b.disabled=false;b.textContent=Number(c.dataset.memory)===0?'Revelar':'Desbloquear'});closeOverlay('final-overlay');switchView('home');render();showToast('Demo reiniciada')});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')$$('.overlay:not([hidden])').forEach(o=>closeOverlay(o.id))});
})();
