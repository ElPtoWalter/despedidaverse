# Concierge adaptativo RC2

Esta rama parte del commit RC1 `a9afd4964279da0090228bcc3c64a427fb4a3ba1`. No cambia precios, formularios comerciales ni Esencial. Live continúa fuera del recorrido.

Ejecutar `node scripts/serve-review.cjs` y abrir `http://127.0.0.1:4180/concierge`. El servidor es de lectura y bloquea envíos externos. No publicar esta revisión.

Demostración con datos ficticios: elegir el recorrido rápido para nombre, límites, Puteómetro y contexto; volver a Hablar con el diseñador. Contar que el protagonista es competitivo, confirmar la categoría y permiso. El Concierge pregunta por una actividad: contestar con los karts; después pregunta por la frase del grupo. Confirmar cada referencia y usar Revisar límites y preparar el brief. Se pueden corregir los textos, cambiar categorías, reservar material al comité, pasar preguntas y conservar un borrador solo por elección.

La conversación usa reglas locales y extracción limitada, no IA generativa. El perfil recoge hasta dieciocho aspectos opcionales, siempre mediante referencias autorizadas que el organizador confirma. No fabrica hechos para completar un campo. Las hipótesis pendientes, contradicciones de límites y falta de confirmación final bloquean la exportación.

El archivo local contiene también las referencias reservadas elegidas: es material privado del organizador. Exporta `dv-brief-v6.1-rc2` y el transporte `DV_BRIEF_V61`, conservando `dv-preferences-v1`. Factory vuelve a validar y selecciona explícitamente el catálogo RC2. No se ha certificado el CRM real.

QA: pruebas Node, recorrido rápido, conversación ramificada con corrección y guardado, cinco anchuras, WebKit a 390 px, exportación local y ausencia de peticiones externas. La descarga nativa se comprueba estrictamente en Linux CI y WebKit; Chromium local de Windows puede cancelar descargas automatizadas y ofrece la alternativa de copiar el archivo.
