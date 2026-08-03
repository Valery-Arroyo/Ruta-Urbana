# Guion — Video Explicativo: Traductor (i18next) en Ruta Urbana

Duración objetivo: 7-9 minutos. Basado en el manual entregado y en el código real del proyecto (`appRutaUrbana/src`).

---

## 1. Introducción (0:00 – 0:40)

> "Hola, somos [nombres], y en este video les explicamos la funcionalidad de traducción que implementamos en Ruta Urbana, nuestro proyecto de Programación en Ambiente Web I. La aplicación está hecha en React con Vite en el frontend, PHP en el backend y MySQL como base de datos. Lo que agregamos es la posibilidad de que el usuario cambie la interfaz entre español e inglés, sin tocar el backend ni la base de datos."

Mostrar en pantalla: portada del manual o la app corriendo en el navegador.

---

## 2. El "nugget": qué es y por qué lo elegimos (0:40 – 2:00)

> "Para esto usamos dos paquetes de npm: **i18next** y **react-i18next**. i18next es el motor que administra los idiomas y las traducciones; react-i18next lo conecta con React mediante el hook `useTranslation`.
>
> La idea central es simple: en vez de escribir el texto directamente en cada componente, como `<button>Guardar</button>`, escribimos una *clave*, como `t("actions.save")`, y esa clave se resuelve según el idioma activo, buscando en un archivo JSON de español o uno de inglés."

Mostrar: `package.json` con `i18next` y `react-i18next` en `dependencies`.

> "Elegimos esta librería porque es el estándar de facto para internacionalización en React, no requiere tocar el backend, permite agregar idiomas nuevos solo agregando un archivo JSON más, y tiene un idioma de respaldo (`fallbackLng`) por si falta alguna clave."

---

## 3. Estructura e instalación (2:00 – 3:00)

> "La instalación fue con `npm install i18next react-i18next`. Creamos esta estructura dentro de `src`:"

Mostrar en el explorador de VS Code:
```
src/i18n/
├── i18n.js
└── locales/
    ├── es/translation.json
    └── en/translation.json
```

> "El archivo `i18n.js` es la configuración central."

Mostrar `src/i18n/i18n.js` y señalar en voz:

> "Aquí importamos los dos archivos de traducción, los registramos como recursos (`resources`), definimos que el idioma inicial se lee de `localStorage` con la clave `rutaUrbanaLanguage`, y que si no hay nada guardado, arranca en español. `fallbackLng: 'es'` significa que si una clave no existe en inglés, se muestra la versión en español para no dejar el texto vacío."

> "Este archivo se importa una sola vez, en `main.jsx`, antes de renderizar la app, así el traductor queda disponible en toda la aplicación desde el arranque."

Mostrar `src/main.jsx`, señalar la línea `import "./i18n/i18n";`.

---

## 4. Los archivos de traducción (3:00 – 4:15)

> "Los textos están organizados por secciones, o *namespaces*, dentro de cada JSON: `navigation` para el menú, `actions` para botones genéricos como ver, crear, editar, guardar; y después un bloque por cada módulo del sistema: `products`, `combos`, `menus`, `preparations`, `ingredientsPage`, `productTable`, `home`, `footer`, `notFound`, y `language` para el selector de idioma."

Mostrar lado a lado (o alternando) `locales/es/translation.json` y `locales/en/translation.json`, resaltando por ejemplo:

```json
"products": {
  "title": "Productos",
  "new": "Nuevo Producto",
  "edit": "Editar Producto",
  "confirmDeleteTitle": "Eliminar producto",
  "messages": {
    "deleted": "Producto eliminado correctamente"
  }
}
```

> "Las dos versiones, español e inglés, tienen exactamente las mismas claves, solo cambia el valor. Eso es importante: si una clave existe en un idioma y no en el otro, react-i18next no rompe, pero sí puede mostrar la clave en crudo, como texto sin traducir, que fue justo un error que corregimos durante el desarrollo."

*(Este es un buen momento para mencionar, si aplica, que al inicio tenían claves faltantes y las completaron — conecta con lo que se solucionó en el proyecto.)*

---

## 5. El selector de idioma (4:15 – 5:15)

> "Para que el usuario pueda cambiar de idioma, creamos el componente `LanguageSelector.jsx`."

Mostrar el código de `LanguageSelector.jsx`:

> "Usa el hook `useTranslation`, que nos da `t` para traducir texto e `i18n` para controlar el idioma activo. Cuando el usuario selecciona un idioma en el `Select` de Material UI, llamamos a `i18n.changeLanguage(language)`, que cambia el idioma en toda la app al instante, sin recargar la página, y guardamos la elección en `localStorage` para que se recuerde la próxima vez que entre."

Mostrar `Header.jsx`, señalar dónde se importa y se coloca `<LanguageSelector />` dentro del menú de navegación.

---

## 6. Traducción de componentes (5:15 – 6:45)

> "Con la configuración lista, el trabajo en cada componente fue: importar `useTranslation`, obtener la función `t`, y reemplazar los textos fijos por sus claves."

Mostrar un ejemplo antes/después, por ejemplo en `ListaProducto.jsx` o `DetalleProducto.jsx`:

```jsx
// Antes
<DialogTitle>Editar Producto</DialogTitle>

// Después
const { t } = useTranslation();
<DialogTitle>{t("products.edit")}</DialogTitle>
```

> "Hicimos esto en las 15 vistas principales de la aplicación: productos, combos, menús, preparaciones, ingredientes, la tabla de productos, el inicio, el pie de página y la página de error 404. En total son más de 200 usos de `t()` en todo el proyecto."

> "Un punto importante: **los datos que vienen de la base de datos no se traducen**. El nombre de un producto, su descripción, el precio, todo eso sigue mostrándose tal cual llega de MySQL a través de PHP. Solo se traduce el texto fijo de la interfaz: botones, títulos, etiquetas, mensajes de éxito o error."

Mostrar un ejemplo de esto en el código:

```jsx
// Se traduce: texto fijo de interfaz
<Button>{t("actions.edit")}</Button>

// No se traduce: dato dinámico de la base de datos
<Typography>{producto.Nombre}</Typography>
```

---

## 7. Demo en vivo (6:45 – 8:15)

> "Ahora vamos a verlo funcionando."

Correr `npm run dev`, abrir el navegador:

1. Mostrar la app en español (idioma por defecto).
2. Abrir el selector de idioma en el menú y cambiar a inglés.
3. Navegar por dos o tres páginas (por ejemplo Productos y Combos) mostrando que los títulos, botones y mensajes cambian a inglés.
4. Señalar que los nombres y precios de los productos, que vienen de la base de datos, **no cambiaron** — siguen igual en ambos idiomas.
5. Recargar la página (F5) y mostrar que el idioma elegido se mantiene, gracias a `localStorage`.

---

## 8. Cierre (8:15 – 9:00)

> "En resumen: integramos i18next y react-i18next para dar soporte de español e inglés en Ruta Urbana, sin modificar el backend en PHP ni las consultas a MySQL. La solución quedó organizada en archivos JSON por idioma, con un selector reutilizable en el menú, y queda preparada para agregar más idiomas en el futuro solo creando un archivo de traducción adicional. Gracias por ver el video."

Mostrar cierre: nombres de los integrantes y nombre del curso.

---

## Notas para grabar

- Si el video se pasa de 10 minutos, se puede recortar la sección 6 (mostrar solo 1-2 ejemplos de componente en vez de mencionar los 15).
- Si queda corto de 5 minutos, se puede ampliar la sección 4 mostrando el archivo JSON completo, o agregar en la demo un ejemplo de mensaje de error/éxito (toast) cambiando de idioma.
- Una vez subido el video (YouTube "no listado" o Google Drive con acceso por link), coloca el enlace en la sección **"Link Video Explicativo"** del documento del manual, que actualmente está vacía.
