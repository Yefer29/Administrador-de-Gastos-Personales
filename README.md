# Administrador de Gastos Personales

Aplicación web sencilla para registrar y administrar **ingresos y gastos
personales**, con persistencia en el navegador mediante **LocalStorage**.

Desarrollada como taller de la asignatura **Desarrollo de Aplicaciones Web**
(NRC-93983) de UNIMINUTO, para practicar el despliegue de una aplicación en un
servicio de hosting gratuito (**Vercel**).

🔗 **App en línea:** https://administrador-de-gastos-personales.vercel.app/

## Funcionalidades

- Registrar ingresos y gastos.
- Editar y eliminar movimientos.
- Buscar por descripción o categoría.
- Filtrar por tipo (ingreso/gasto) y por categoría.
- Ver el **saldo disponible**, el **total de ingresos** y el **total de gastos**.
- Los datos se guardan en **LocalStorage** (persisten al cerrar el navegador).

## Tecnologías

- **HTML5** y **CSS3**
- **TypeScript**
- **Vite** (plantilla `vanilla-ts`)
- **LocalStorage** y **DOM API**
- **Vitest** (pruebas unitarias)

Sin frameworks y sin backend: toda la lógica se ejecuta en el cliente.

## Requisitos

- Node.js 18 o superior.

## Scripts

```bash
npm install       # Instalar dependencias
npm run dev       # Ejecutar en desarrollo (http://localhost:5173)
npm run build     # Compilar para producción (genera la carpeta dist/)
npm run preview   # Previsualizar el build de producción
npm test          # Ejecutar las pruebas unitarias
```

## Estructura

```
src/
  types.ts         Tipos y categorías
  format.ts        Formato de moneda (COP) y fecha
  finanzas.ts      Lógica pura: totales, saldo, filtros y CRUD
  finanzas.test.ts Pruebas unitarias (Vitest)
  storage.ts       Persistencia en LocalStorage
  main.ts          Render del DOM y manejo de eventos
  style.css        Estilos
index.html         Estructura de la página
```

## Despliegue en Vercel

1. Sube el proyecto a un repositorio de GitHub.
2. Entra a [vercel.com](https://vercel.com) e inicia sesión con GitHub.
3. **Add New Project** → importa el repositorio.
4. Vercel detecta **Vite** automáticamente:
   - Framework: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Presiona **Deploy**. En unos segundos la app queda publicada con una URL pública y HTTPS.

## Autor

Yeferson Velásquez Garcés — UNIMINUTO.
