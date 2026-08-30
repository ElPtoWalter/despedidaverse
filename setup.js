document.querySelector('#setup-form').addEventListener('submit', event => {
  event.preventDefault();
  const d = Object.fromEntries(new FormData(event.currentTarget));
  const config = `window.DV_CONFIG = Object.freeze(${JSON.stringify({companyName:'DespedidaVerse Studio',contactEmail:d.email,siteUrl:d.siteUrl,appsScriptUrl:d.appsScriptUrl,tallyFormUrl:d.tallyFormUrl,whatsappNumber:d.whatsapp,paymentLinks:{esencial:d.paymentEssential,juego:d.paymentGame,universo:d.paymentUniverse,live:''},clientAreaEnabled:true,onboardingEnabled:true,directSubmitEnabled:true,siteVersion:'v21-three-pack-freeze'}, null, 2)});\n`;
  const blob = new Blob([config], {type:'text/javascript'});
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'config.js'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
});
