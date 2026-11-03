# Concierge RC2.2

Parte de Web RC2.1 `d44ef80c3b7753a30390d38c3a5d7dc87a6e7e42`. Exporta únicamente el brief explícito `dv-brief-v6.1-rc2.2` para el nuevo acabado editorial de Factory. Se conservan `DV_BRIEF_V61`, `dv-preferences-v1`, los ejes, fuentes, consentimiento, visibilidad, precios y formularios comerciales.

La conversación continúa por reglas locales. El cliente de IA sigue construido con `enabled:false`, sin solicitudes a proveedores o consumo de créditos. Los documentos RC2.1 se conservan como historia de esa versión.

QA: cuarenta pruebas Node; recorridos rápido/adaptativo a cinco anchuras Chromium y WebKit adaptativo a 390. La descarga nativa se comprueba en CI/WebKit; en Chromium Windows se comprueba copia cuando el entorno cancela la descarga automatizada.

Revisión local: `node scripts/serve-review.cjs 4184` y abrir `http://127.0.0.1:4184/concierge`. Usar exclusivamente datos ficticios. No fusionar, desplegar, activar IA, pagos o Live ni ejecutar piloto humano.
