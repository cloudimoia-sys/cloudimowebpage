# Cloudimo — sitio web

Sitio estático, sin framework ni proceso de build. HTML + CSS + un único fichero JS,
sin dependencias externas ni peticiones a terceros. Se despliega copiando la carpeta.

## Estructura

```
/
├── index.html                    Portada (español)
├── en/index.html                 Portada (inglés)
├── legal/                        Aviso legal y privacidad (ES)
├── en/legal/                     Legal notice y privacy (EN)
├── 404.html                      Página de error
├── assets/
│   ├── css/styles.css            Todos los estilos
│   ├── js/main.js                Todas las animaciones e interacciones
│   └── brand/                    Logos SVG y PNG del kit de marca
├── favicon.ico, apple-touch-icon.png, android-chrome-*.png
├── site.webmanifest              Metadatos de aplicación web
├── robots.txt, sitemap.xml       SEO
├── _headers                      Cabeceras de seguridad y caché (Cloudflare Pages)
└── .dev/serve.mjs                Servidor local de pruebas (no se despliega)
```

Las carpetas que empiezan por punto (`.dev`, `.claude`) no se publican en Cloudflare Pages.

## Ver el sitio en local

```bash
node .dev/serve.mjs . 4321
```

Luego abre <http://localhost:4321>. No hace falta instalar nada: usa sólo Node.

## Antes de publicar — pendientes

1. **Formulario de contacto.** Crea un formulario gratuito en
   [formspree.io](https://formspree.io), copia su ID y sustituye
   `TU_ID_DE_FORMSPREE` en `index.html` y en `en/index.html`.
   Mientras no lo hagas, el formulario hace un envío normal del navegador en vez de
   enviarlo en segundo plano.
2. **Datos fiscales.** Completa los campos marcados con `todo` en los cuatro ficheros de
   `legal/` y `en/legal/`: nombre fiscal, NIF, domicilio, fecha y jurisdicción.
   Los textos son una plantilla base: conviene que los revise un asesor.
3. **Revisa el listado de tecnologías** (sección "Tecnología" en ambos idiomas) y quita
   las que no uses.
4. **Dominio.** Si el dominio final no es `cloudimo.es`, actualiza las URL absolutas en
   `sitemap.xml`, `robots.txt` y las etiquetas `canonical` / `og:url` / `hreflang` de
   cada página.

## Publicar en Cloudflare Pages

```bash
git init && git add -A && git commit -m "Sitio web de Cloudimo"
```

Después crea un repositorio en GitHub, súbelo, y en el panel de Cloudflare:
**Workers & Pages → Create → Pages → Connect to Git**.

Configuración del proyecto:

| Campo | Valor |
|---|---|
| Framework preset | None |
| Build command | *(vacío)* |
| Build output directory | `/` |

Cada `git push` vuelve a desplegar automáticamente.

## Editar el contenido

Todo el texto está directamente en el HTML, sin plantillas ni JSON intermedio.
Los dos idiomas son ficheros independientes: **si cambias un texto en `index.html`,
cámbialo también en `en/index.html`**.

- Colores, tipografías y espaciados: variables CSS al principio de `assets/css/styles.css`.
- Animaciones: `assets/js/main.js`, cada bloque comentado por función.
- Todas las animaciones se desactivan solas si el sistema tiene activado
  "reducir movimiento".

## Paleta de marca

| Uso | Hex |
|---|---|
| Azul principal | `#185FA5` |
| Acento | `#378ADD` |
| Fondo claro | `#E6F1FB` |
| Tinta | `#0B0B0B` |
