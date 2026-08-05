# Publicar DespedidaVerse en Cloudflare Pages

## Método recomendado: GitHub + Cloudflare Pages
1. Crea un repositorio para la web comercial.
2. Sube todos los archivos de esta carpeta a la raíz.
3. En Cloudflare: Workers & Pages > Create > Pages > Connect to Git.
4. Selecciona el repositorio.
5. Framework preset: None.
6. Build command: déjalo vacío.
7. Build output directory: la raíz del proyecto.
8. Publica y comprueba la URL `*.pages.dev`.

Cloudflare generará vistas previas para ramas y nuevos despliegues cuando cambie el repositorio.

## Dominio
Cuando compres `despedidaverse.com`:
1. Añádelo a Cloudflare y cambia los nameservers si el registrador lo solicita.
2. En el proyecto Pages: Custom domains > Set up a custom domain.
3. Añade `despedidaverse.com`.
4. Redirige `www` al dominio principal.
5. Cambia `siteUrl` en `config.js`, el canonical de `index.html`, `robots.txt` y `sitemap.xml`.

## CRM
Después de desplegar Google Apps Script, pega su URL `/exec` en `config.js` como `appsScriptUrl`.
