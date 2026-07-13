# Administrador de Gastos Personales — Diseño

**Fecha:** 2026-07-13
**Curso:** Desarrollo de Aplicaciones Web (NRC-93983) — UNIMINUTO
**Autor:** Yeferson Velásquez Garcés

## Objetivo

Aplicación web sencilla para registrar y administrar ingresos y gastos
personales, con persistencia local. Su propósito principal en el taller es
servir de aplicación real para practicar el proceso de **despliegue en un
hosting gratuito (Vercel)**.

## Stack (obligatorio según el taller)

HTML5, CSS3, TypeScript, Vite (plantilla `vanilla-ts`), LocalStorage y DOM API.
Sin frameworks (no React/Vue) y sin backend. Toda la lógica corre en el cliente.

## Modelo de datos

```ts
type TipoMovimiento = 'ingreso' | 'gasto';

interface Movimiento {
  id: string;          // identificador único
  tipo: TipoMovimiento;
  descripcion: string;
  categoria: string;
  monto: number;       // positivo, en COP
  fecha: string;       // ISO yyyy-mm-dd
}
```

## Arquitectura (módulos con una sola responsabilidad)

| Archivo | Responsabilidad | Depende de |
|---|---|---|
| `src/types.ts` | Tipos `Movimiento`, `TipoMovimiento` y categorías | — |
| `src/format.ts` | Formato de moneda (COP) y de fecha | — |
| `src/finanzas.ts` | Lógica **pura**: agregar, editar, eliminar, buscar, filtrar, totales y saldo | `types` |
| `src/storage.ts` | Cargar/guardar la lista en LocalStorage | `types` |
| `src/main.ts` | Render del DOM y manejo de eventos (une todo) | todos |
| `index.html`, `src/style.css` | Estructura y estilos | — |
| `src/finanzas.test.ts` | Pruebas unitarias (Vitest) de la lógica pura | `finanzas` |

`finanzas.ts` no toca el DOM ni LocalStorage: recibe arreglos y devuelve
arreglos/valores nuevos (inmutable). Eso lo hace fácil de probar.

## Funcionalidades (las 10 del taller)

1. Registrar ingresos
2. Registrar gastos
3. Editar registros
4. Eliminar movimientos
5. Buscar movimientos (por descripción/categoría)
6. Filtrar por categoría (y por tipo)
7. Visualizar el saldo disponible
8. Mostrar el total de ingresos
9. Mostrar el total de gastos
10. Almacenar la información en LocalStorage

## Interfaz (dashboard financiero moderno)

- Encabezado con título de la app.
- Tres tarjetas de resumen: **Saldo disponible** (destacado), **Total ingresos**
  (verde), **Total gastos** (rojo).
- Formulario para agregar/editar: tipo (ingreso/gasto), descripción, categoría,
  monto, fecha. Botón *Guardar*; en modo edición aparece *Cancelar*.
- Controles: buscador de texto + filtro por categoría + filtro por tipo.
- Lista de movimientos: fecha, descripción, categoría, tipo y monto (con color),
  con acciones *Editar* y *Eliminar*. Estado vacío cuando no hay datos.
- Responsive; se ve bien en capturas de pantalla.

## Categorías por defecto

- Ingresos: Salario, Ventas, Inversiones, Otros.
- Gastos: Alimentación, Transporte, Vivienda, Servicios, Entretenimiento, Salud,
  Otros.

## Persistencia

Clave de LocalStorage: `agp:movimientos`. Se carga al iniciar y se guarda tras
cada cambio (agregar, editar, eliminar). Manejo tolerante a datos corruptos
(si el JSON no se puede leer, se inicia con lista vacía).

## Pruebas

Vitest sobre `finanzas.ts`: totales de ingresos y gastos, saldo, filtrado por
categoría y tipo, búsqueda, y agregar/editar/eliminar. Comando `npm test`.

## Despliegue (Vercel)

Vercel detecta Vite automáticamente. Configuración: Framework **Vite**,
Build Command `npm run build`, Output Directory `dist`. Base `/` (sin router,
no requiere reglas de rewrite). No se necesita `vercel.json`.

## Fuera de alcance (YAGNI)

Sin backend, sin autenticación, sin gráficos, sin múltiples cuentas/usuarios,
sin exportación. El foco es una app funcional y clara para desplegar.
