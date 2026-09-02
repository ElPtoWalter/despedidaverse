# DespedidaVerse Studio v25 · Precios por grupo y portada móvil

## Web comercial actual

- Portada de siete bloques; la información extensa vive en `/paquetes`, `/estilos`, `/como-funciona`, `/caso-real` y `/presupuesto`.
- Demo ficticia pública en `/demo/`, sin redirección a la portada. No se publican los códigos de las experiencias privadas.
- Esencial **79 €**, Juego **129 €** y Universo **179 €**, por grupo y con IVA incluido. `catalog.js` es la referencia única de importes; páginas y calculadora se alimentan de ella.
- El reparto por persona es orientativo y redondeado a céntimos. El número de personas no añade recargos ni amplía los límites de identidades/contenido del paquete.
- Los extras se solicitan para una propuesta separada: la calculadora no añade importes no acordados ni rangos automáticos.
- La propuesta exploratoria «Universo Total · 199 €» no se convierte en un SKU vendible: falta definir un alcance distinto. No equivale automáticamente a LIVE, que continúa fuera de venta.
- Estas tarifas públicas nuevas no modifican propuestas ya aceptadas, cobros anteriores ni las comprobaciones de pago del servidor. La activación real de pagos conserva sus requisitos pendientes.

## Edición y comprobaciones

Se mantiene la arquitectura estática y el alojamiento existente. No hay dependencias de compilación nuevas.

1. Editar el contenido de `_content/`, `catalog.js` o el marco común en `scripts/build-commercial.cjs`.
2. Ejecutar `npm run build` (equivalente: `node scripts/build-commercial.cjs`).
3. Ejecutar `npm test`. Los tests verifican precios, reparto, formulario, enlaces, accesibilidad estructural, compatibilidad de enlaces antiguos y que las páginas generadas coincidan con el código fuente.
4. Publicar juntos fuentes y HTML generado. No editar directamente los seis HTML generados.

La solicitud mantiene el transporte y los campos del CRM, añade `catalogVersion` y transmite el precio del paquete como referencia en `estimate`. El servidor sigue siendo la única autoridad para presupuestos aceptados y pagos.

## Historial de la base v24

Esta carpeta es la web pública. Se puede publicar tal cual y seguirá funcionando con correo.

## Activación gradual
1. Publica la web.
2. Configura el sistema privado incluido en el ZIP de automatización.
3. Abre `setup.html`, pega la URL del Apps Script y descarga `config.js`.
4. Sustituye únicamente `config.js` en GitHub.

## Nuevas páginas
- `cliente.html`: seguimiento privado mediante identificador y código.
- `onboarding.html`: entrega estructurada de materiales.
- `gracias.html`: confirmación.
- `pago.html`: retorno seguro; nunca confirma el cobro desde el navegador.
- `piloto.html`: evaluación privada con invitación temporal y datos mínimos.
- `setup.html`: genera la configuración sin editar código.

## Seguridad
No publiques el ZIP privado de automatización, secretos de Stripe, IDs internos ni copias del CRM. `config.js` solo debe contener enlaces públicos.

## v22 · Presentación premium y preparación de cobro

- Jerarquía, profundidad, estados de foco y composición móvil refinados en la web comercial y el área de cliente.
- Los tres productos tienen una identidad visual propia y un ejemplo completo con código de acceso visible.
- El contrato comercial declara EUR, IVA incluido y pago verificado por servidor como requisito de producción.
- El proveedor de pagos permanece desactivado hasta la fase específica de integración; no se simulan cobros desde el navegador.

## v23 · Dirección de arte máxima

- Marco comercial más sobrio, editorial y contemporáneo, con menos brillo decorativo y más jerarquía tipográfica.
- Esencial adopta una gramática editorial cálida; Juego, una interfaz táctica; Universo, un atlas inmersivo.
- Geometría, paletas, densidad, estados interactivos y composición responsive tratados de forma independiente por producto.
- Se conserva la propuesta, el contenido, los accesos privados y la preparación de cobro existentes.

## v24 · Commerce verificable + piloto privado

- Stripe se abre únicamente después de aceptar la propuesta y desde el flujo privado.
- La vuelta del navegador es informativa; la autorización real depende del webhook firmado y de la conciliación del servidor.
- El formulario piloto no pide nombre ni correo y solo funciona con invitaciones aleatorias, temporales y de uso limitado.
- `config.js` conserva las URLs públicas, pero ningún secret de Stripe, Cloudflare o Apps Script.

## Modo de emergencia
Si `appsScriptUrl` está vacío, los formularios preparan un correo a `fdez.edu00@gmail.com`.


## Identidad visual v5
- Nuevo logotipo profesional integrado en cabecera, pie y área privada.
- Nuevo icono de navegador y PWA.
- Vista previa social actualizada.
- El archivo principal utilizado por la web es `assets/logo-final.webp`.
- También se incluye `assets/logo-final.png` para otros usos.


## v21 · Cierre comercial
- Primera versión de precios públicos con IVA incluido (sustituida por el catálogo v25).
- Calculadora inicial (sustituida por el reparto transparente v25).
- Demo limpia incluida en `/demo/`.
- Preparación para Cloudflare Pages mediante `_headers`, `_redirects` y `404.html`.
- Guía `CLOUDFLARE_PAGES.md`.
- LIVE permanece fuera de venta hasta superar su propio cierre y QA.


## v15 · Caso real y QR físico (14/08/2026)

- Nueva sección **Así se vive** con fotografías reales de Antonverse.
- QR de la despedida explicado como elemento físico: camiseta, cartel, acreditación, pegatina o invitación.
- Fotos optimizadas a WebP.
- Vídeo vertical de Antonverse integrado como demostración de lo que vive detrás del QR.
- Sin testimonios inventados; preparada una política de prueba social verificable.
- Precios/productos alineados: Esencial, Juego y Universo cerrados; Live marcado como desarrollo/a medida.
- Juego actualizado a 18 putadas / hasta 12 identidades.
- Universo actualizado a 36 putadas / hasta 30 identidades.
