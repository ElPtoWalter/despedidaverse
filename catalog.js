(function (root) {
  'use strict';
  // Public price reference, never an authority for charging or releasing production.
  // Existing accepted proposals retain their server-verified amount and revision.
  const plans = Object.freeze([
    Object.freeze({ id: 'esencial', name: 'Esencial', amountMinor: 7900, tagline: 'Vuestra historia, en privado.', description: 'Fotos, mensajes y recuerdos para sorprender al protagonista.', features: Object.freeze(['Historia y mensajes del grupo', 'Recuerdos privados para descubrir', 'QR de acceso y cierre personalizado']), identities: null }),
    Object.freeze({ id: 'juego', name: 'Juego', amountMinor: 12900, tagline: 'La web también juega.', description: 'Retos, ruleta y secretos que se convierten en parte de la despedida.', features: Object.freeze(['18 retos, tokens y ruleta', 'Hasta 12 identidades y misión final', 'QR de jugadores y acceso del comité']), identities: 12 }),
    Object.freeze({ id: 'universo', name: 'Universo', amountMinor: 17900, tagline: 'Un mundo para vuestro grupo.', description: 'Una experiencia más amplia para vivir la despedida de principio a fin.', features: Object.freeze(['36 retos y hasta 30 identidades', 'Archivo, radio, mapa y progresión', 'Comité, acta y desenlace ampliado']), identities: 30 })
  ]);
  const styles = Object.freeze(['Canalla', 'Elegante', 'Videojuego', 'Mafia', 'Reality', 'Festival', 'Deportivo']);
  const extras = Object.freeze(['Vídeo promocional', 'Pack visual avanzado', 'Canción personalizada', 'Minijuego nuevo', 'Álbum colaborativo', 'Soporte durante evento']);
  function findPlan(id) { return plans.find(plan => plan.id === id || plan.name === id) || null; }
  function validPeople(value) {
    if (typeof value !== 'string' && typeof value !== 'number') return null;
    if (String(value).trim() === '') return null;
    const number = Number(value);
    return Number.isInteger(number) && number >= 2 && number <= 300 ? number : null;
  }
  function money(minor, decimals = false) {
    if (!Number.isFinite(minor) || minor < 0) throw new RangeError('Invalid amount');
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: decimals ? 2 : 0, maximumFractionDigits: decimals ? 2 : 0 }).format(minor / 100).replace(/\u00a0/g, ' ');
  }
  function quote(id, people) {
    const plan = findPlan(id);
    const count = validPeople(people);
    if (!plan || count === null) return null;
    return Object.freeze({ plan, people: count, totalMinor: plan.amountMinor, perPersonMinor: Math.round(plan.amountMinor / count) });
  }
  const catalog = Object.freeze({ version: '2026-09-03', currency: 'EUR', vatIncluded: true, defaultPeople: 12, plans, styles, extras, findPlan, validPeople, money, quote });
  if (typeof module === 'object' && module.exports) module.exports = catalog;
  if (root) root.DV_CATALOG = catalog;
})(typeof window === 'object' ? window : null);
