# v20.1 · Formulario de solicitud

- Añadido **Estilo visual** al formulario inicial.
- Opciones: Canalla, Elegante, Videojuego, Mafia, Reality, Festival y Deportivo.
- Se conserva **Aún no lo sé** para no forzar una elección.
- El estilo se envía al Apps Script con `name="style"`; la v7.4.6 ya lo guarda en Leads, resumen y JSON de solicitud.
- Presupuesto actualizado a rangos coherentes con los precios públicos actuales: Hasta 200 €, 200–400 €, 400–700 €, 700–1.200 € y Más de 1.200 €, además de orientación.
- El presupuesto ocupa una fila completa para mantener limpio el formulario tras añadir Estilo.
- El botón/selector de estilos de la sección pública sincroniza la elección con el formulario si el usuario hace clic en un estilo.
- `Copiar resumen` incluye ahora el estilo visual.
- Bump de versión/cache a `v20.1-lead-style-budget` para evitar que navegador/service worker mantengan el formulario antiguo.
