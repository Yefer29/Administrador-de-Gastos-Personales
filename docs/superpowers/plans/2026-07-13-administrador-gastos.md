# Administrador de Gastos Personales — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** App web en Vite `vanilla-ts` para registrar/administrar ingresos y gastos con persistencia en LocalStorage, lista para desplegar en Vercel.

**Architecture:** Lógica pura en `finanzas.ts` (sin DOM ni storage), persistencia aislada en `storage.ts`, formato en `format.ts`, y `main.ts` como capa de UI que une todo manipulando el DOM. Pruebas con Vitest sobre la lógica pura.

**Tech Stack:** Vite 8, TypeScript 6, HTML5, CSS3, LocalStorage, DOM API, Vitest.

## Global Constraints

- Plantilla Vite `vanilla-ts`. Sin frameworks (no React/Vue), sin backend.
- `tsconfig` estricto: `verbatimModuleSyntax` → imports de tipos con `import type`.
- `erasableSyntaxOnly` → prohibido `enum`, `namespace`, parámetros-propiedad. Usar `type`/`interface` y objetos planos.
- `noUnusedLocals`/`noUnusedParameters` activos → sin variables/params sin usar.
- Moneda COP, idioma español, fechas `yyyy-mm-dd`.
- Clave LocalStorage: `agp:movimientos`.
- Build: `npm run build` → salida `dist`.

---

### Task 1: Tipos y formato

**Files:**
- Create: `src/types.ts`
- Create: `src/format.ts`

**Interfaces:**
- Produces: `type TipoMovimiento = 'ingreso' | 'gasto'`; `interface Movimiento { id: string; tipo: TipoMovimiento; descripcion: string; categoria: string; monto: number; fecha: string }`; `const CATEGORIAS: Record<TipoMovimiento, string[]>`; `formatearCOP(n: number): string`; `formatearFecha(iso: string): string`.

- [ ] **Step 1: Crear `src/types.ts`**

```ts
export type TipoMovimiento = 'ingreso' | 'gasto';

export interface Movimiento {
  id: string;
  tipo: TipoMovimiento;
  descripcion: string;
  categoria: string;
  monto: number; // positivo, en COP
  fecha: string; // yyyy-mm-dd
}

export const CATEGORIAS: Record<TipoMovimiento, string[]> = {
  ingreso: ['Salario', 'Ventas', 'Inversiones', 'Otros'],
  gasto: ['Alimentación', 'Transporte', 'Vivienda', 'Servicios', 'Entretenimiento', 'Salud', 'Otros'],
};
```

- [ ] **Step 2: Crear `src/format.ts`**

```ts
const monedaCOP = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

export function formatearCOP(monto: number): string {
  return monedaCOP.format(monto);
}

export function formatearFecha(iso: string): string {
  const [anio, mes, dia] = iso.split('-');
  if (!anio || !mes || !dia) return iso;
  return `${dia}/${mes}/${anio}`;
}
```

- [ ] **Step 3: Commit** — `git add -A && git commit -m "feat: tipos y utilidades de formato"`

---

### Task 2: Lógica financiera pura (TDD)

**Files:**
- Create: `src/finanzas.ts`
- Test: `src/finanzas.test.ts`

**Interfaces:**
- Consumes: `Movimiento`, `TipoMovimiento` de `types.ts`.
- Produces:
  - `agregar(lista, datos): Movimiento[]` donde `datos: Omit<Movimiento,'id'>` — genera id y antepone el movimiento.
  - `editar(lista, id, cambios): Movimiento[]` con `cambios: Partial<Omit<Movimiento,'id'>>`.
  - `eliminar(lista, id): Movimiento[]`.
  - `totalPorTipo(lista, tipo): number`.
  - `saldo(lista): number` (ingresos − gastos).
  - `filtrar(lista, { texto?, categoria?, tipo? }): Movimiento[]` — `categoria`/`tipo` vacío o `'todos'` = sin filtro; `texto` busca en descripción y categoría (case-insensitive).
  - `nuevoId(): string`.

- [ ] **Step 1: Escribir pruebas que fallan (`src/finanzas.test.ts`)**

```ts
import { describe, it, expect } from 'vitest';
import { agregar, editar, eliminar, totalPorTipo, saldo, filtrar } from './finanzas';
import type { Movimiento } from './types';

const base: Movimiento[] = [
  { id: '1', tipo: 'ingreso', descripcion: 'Salario mayo', categoria: 'Salario', monto: 3000, fecha: '2026-05-01' },
  { id: '2', tipo: 'gasto', descripcion: 'Mercado', categoria: 'Alimentación', monto: 500, fecha: '2026-05-03' },
  { id: '3', tipo: 'gasto', descripcion: 'Bus', categoria: 'Transporte', monto: 100, fecha: '2026-05-04' },
];

describe('finanzas', () => {
  it('totalPorTipo suma solo el tipo pedido', () => {
    expect(totalPorTipo(base, 'ingreso')).toBe(3000);
    expect(totalPorTipo(base, 'gasto')).toBe(600);
  });

  it('saldo = ingresos - gastos', () => {
    expect(saldo(base)).toBe(2400);
  });

  it('agregar antepone un movimiento con id nuevo sin mutar el original', () => {
    const res = agregar(base, { tipo: 'gasto', descripcion: 'Cine', categoria: 'Entretenimiento', monto: 50, fecha: '2026-05-05' });
    expect(res.length).toBe(4);
    expect(res[0].descripcion).toBe('Cine');
    expect(res[0].id).toBeTruthy();
    expect(base.length).toBe(3); // no mutación
  });

  it('editar cambia solo el movimiento indicado', () => {
    const res = editar(base, '2', { monto: 800 });
    expect(res.find(m => m.id === '2')!.monto).toBe(800);
    expect(res.find(m => m.id === '1')!.monto).toBe(3000);
  });

  it('eliminar quita por id', () => {
    const res = eliminar(base, '3');
    expect(res.length).toBe(2);
    expect(res.some(m => m.id === '3')).toBe(false);
  });

  it('filtrar por categoria', () => {
    expect(filtrar(base, { categoria: 'Transporte' }).length).toBe(1);
  });

  it('filtrar por tipo', () => {
    expect(filtrar(base, { tipo: 'gasto' }).length).toBe(2);
  });

  it('filtrar por texto en descripción o categoría (case-insensitive)', () => {
    expect(filtrar(base, { texto: 'sala' }).length).toBe(1); // "Salario"
    expect(filtrar(base, { texto: 'ALIMENT' }).length).toBe(1);
  });

  it('filtros combinados', () => {
    expect(filtrar(base, { tipo: 'gasto', texto: 'bus' }).length).toBe(1);
  });
});
```

- [ ] **Step 2: Ejecutar y ver fallar** — `npm test` → FAIL (módulo no existe).

- [ ] **Step 3: Implementar `src/finanzas.ts`**

```ts
import type { Movimiento, TipoMovimiento } from './types';

export function nuevoId(): string {
  return (globalThis.crypto?.randomUUID?.() ??
    `${performance.now()}-${Math.trunc(performance.now() * 1000) % 1000}`);
}

export function agregar(lista: Movimiento[], datos: Omit<Movimiento, 'id'>): Movimiento[] {
  return [{ id: nuevoId(), ...datos }, ...lista];
}

export function editar(lista: Movimiento[], id: string, cambios: Partial<Omit<Movimiento, 'id'>>): Movimiento[] {
  return lista.map(m => (m.id === id ? { ...m, ...cambios } : m));
}

export function eliminar(lista: Movimiento[], id: string): Movimiento[] {
  return lista.filter(m => m.id !== id);
}

export function totalPorTipo(lista: Movimiento[], tipo: TipoMovimiento): number {
  return lista.filter(m => m.tipo === tipo).reduce((acc, m) => acc + m.monto, 0);
}

export function saldo(lista: Movimiento[]): number {
  return totalPorTipo(lista, 'ingreso') - totalPorTipo(lista, 'gasto');
}

export interface Filtros {
  texto?: string;
  categoria?: string;
  tipo?: TipoMovimiento | 'todos' | '';
}

export function filtrar(lista: Movimiento[], filtros: Filtros): Movimiento[] {
  const texto = (filtros.texto ?? '').trim().toLowerCase();
  const categoria = filtros.categoria ?? '';
  const tipo = filtros.tipo ?? '';
  return lista.filter(m => {
    if (tipo && tipo !== 'todos' && m.tipo !== tipo) return false;
    if (categoria && categoria !== 'todos' && m.categoria !== categoria) return false;
    if (texto && !(`${m.descripcion} ${m.categoria}`.toLowerCase().includes(texto))) return false;
    return true;
  });
}
```

- [ ] **Step 4: Ejecutar y ver pasar** — `npm test` → PASS.

- [ ] **Step 5: Commit** — `git add -A && git commit -m "feat: lógica financiera pura con pruebas"`

---

### Task 3: Persistencia en LocalStorage

**Files:**
- Create: `src/storage.ts`

**Interfaces:**
- Consumes: `Movimiento`.
- Produces: `cargar(): Movimiento[]` (tolerante a datos corruptos → `[]`), `guardar(lista: Movimiento[]): void`.

- [ ] **Step 1: Implementar `src/storage.ts`**

```ts
import type { Movimiento } from './types';

const CLAVE = 'agp:movimientos';

export function cargar(): Movimiento[] {
  try {
    const raw = localStorage.getItem(CLAVE);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return Array.isArray(data) ? (data as Movimiento[]) : [];
  } catch {
    return [];
  }
}

export function guardar(lista: Movimiento[]): void {
  localStorage.setItem(CLAVE, JSON.stringify(lista));
}
```

- [ ] **Step 2: Commit** — `git add -A && git commit -m "feat: persistencia en LocalStorage"`

---

### Task 4: Interfaz (HTML + estilos + wiring)

**Files:**
- Modify: `index.html` (estructura del dashboard)
- Create/replace: `src/style.css` (estilos dashboard moderno)
- Modify: `src/main.ts` (render + eventos)

**Interfaces:**
- Consumes: todo lo anterior (`cargar`, `guardar`, `agregar`, `editar`, `eliminar`, `saldo`, `totalPorTipo`, `filtrar`, `formatearCOP`, `formatearFecha`, `CATEGORIAS`).

- [ ] **Step 1: `index.html`** — Estructura semántica: `<header>` con título; `<section>` de 3 tarjetas resumen con ids `#saldo`, `#totalIngresos`, `#totalGastos`; `<form id="formMovimiento">` con: hidden `#editId`, radios/segmented `tipo` (ingreso/gasto), `#descripcion`, `<select id="categoria">`, `#monto`, `#fecha`, botón submit `#btnGuardar`, botón `#btnCancelar` (oculto); barra de controles con `#buscar`, `<select id="filtroCategoria">`, `<select id="filtroTipo">`; contenedor de lista `#lista`. `<script type="module" src="/src/main.ts">`. Idioma `lang="es"`, `<meta name="viewport">`.

- [ ] **Step 2: `src/style.css`** — Reset básico, variables CSS (colores: fondo neutro claro, superficie blanca, primario índigo `#4f46e5`, verde `#16a34a`, rojo `#dc2626`), layout responsive (grid de tarjetas, formulario en grid, lista tipo tabla/tarjetas). Estados hover, foco accesible, estado vacío. Debe verse limpio para capturas.

- [ ] **Step 3: `src/main.ts`** — Estado en memoria `let movimientos = cargar()`; función `render()` que recalcula saldo/totales (con `formatearCOP`), llena selects de categoría según tipo y filtros, y pinta la lista aplicando `filtrar`. `persistir()` = `guardar(movimientos)` + `render()`. Handlers: submit del form (si `editId` → `editar`, si no → `agregar`, con validación de campos y monto > 0), click en lista (delegación) para Editar (cargar valores al form, mostrar Cancelar) y Eliminar (con `confirm`), Cancelar edición, inputs de búsqueda/filtros → `render()`. Actualizar opciones de `#categoria` cuando cambia el tipo. Poner fecha de hoy por defecto.

- [ ] **Step 4: Verificar typecheck y build** — `npm run build` → sin errores TS, genera `dist/`.

- [ ] **Step 5: Verificar en el navegador** — `npm run dev`, abrir `http://localhost:5173`, agregar/editar/eliminar/buscar/filtrar, recargar y confirmar persistencia.

- [ ] **Step 6: Commit** — `git add -A && git commit -m "feat: interfaz del administrador de gastos"`

---

### Task 5: Documentación y despliegue

**Files:**
- Create: `README.md`

- [ ] **Step 1: `README.md`** — Descripción, stack, scripts (`npm install`, `npm run dev`, `npm run build`, `npm test`), y pasos de despliegue en Vercel.
- [ ] **Step 2: Commit** — `git add -A && git commit -m "docs: README"`
- [ ] **Step 3: Añadir remote y push** — `git remote add origin git@github.com:Yefer29/Administrador-de-Gastos-Personales.git && git push -u origin main`
- [ ] **Step 4: Guía de despliegue en Vercel** (el usuario ejecuta los clics y toma capturas).

## Self-Review

- **Cobertura del spec:** tipos ✓ (T1), formato ✓ (T1), finanzas/totales/saldo/filtro/buscar/CRUD ✓ (T2), LocalStorage ✓ (T3), UI con las 10 funciones ✓ (T4), despliegue ✓ (T5). Pruebas ✓ (T2).
- **Placeholders:** ninguno en lógica/pruebas; la UI describe estructura e ids exactos.
- **Consistencia de tipos:** nombres de funciones e ids de DOM usados consistentemente entre tareas.
