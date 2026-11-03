# Concierge RC3 — fichas de historia confirmadas

Base Web #6 `85471213689c241ca9fbc22242aa2a55803d3007`. El recorrido exporta `dv-brief-v6.1-rc3` y conserva precios, paquetes, `dv-preferences-v1`, consentimiento y visibilidad.

En el paso de hilo narrativo hay fichas opcionales. Se selecciona una anécdota compartida autorizada, se copian fragmentos exactos para acontecimiento, situación cómica, conflicto, frase, objetos, escenarios, personajes y desenlace, y se confirma su interpretación. Los campos ausentes no se rellenan. Editar cualquier dato revoca la confirmación. Una ficha pendiente no autoriza personalización profunda; sigue disponible el recorrido genérico local. La interfaz no pide diseñar pruebas o soluciones.

`story-model.js` es idéntico al contrato de Factory. `story-editor-core.js` conserva estados y citas al remapear IDs del brief. `concierge-semantic-client.js` define un cliente opcional desactivado por defecto; no se invoca desde la interfaz. La ruta futura solo propone hipótesis y requiere autorización externa separada. No hay proveedor, identidad real, secretos o créditos conectados.

QA: cuarenta y cuatro pruebas Node, recorridos rápidos/adaptativos conservados, editor de historias en cinco anchuras Chromium y WebKit móvil. El editor valida citas, exclusiones, revocación y ausencia de solicitudes externas. Las capturas no sustituyen iPhone físico o validación humana del humor.

Revisión local: `node scripts/serve-review.cjs 4184` y abrir `http://127.0.0.1:4184/concierge`. Usar datos ficticios. No fusionar, publicar, activar IA/Live/pagos ni ejecutar el Piloto Cero.
