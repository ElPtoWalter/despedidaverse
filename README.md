# DespedidaVerse Studio v4 · Web automatizable

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
- `setup.html`: genera la configuración sin editar código.

## Seguridad
No publiques el ZIP privado de automatización, secretos de Stripe, IDs internos ni copias del CRM. `config.js` solo debe contener enlaces públicos.

## Modo de emergencia
Si `appsScriptUrl` está vacío, los formularios preparan un correo a `fdez.edu00@gmail.com`.
