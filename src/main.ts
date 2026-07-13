import './style.css';
import type { Movimiento, TipoMovimiento } from './types';
import { CATEGORIAS } from './types';
import { cargar, guardar } from './storage';
import { agregar, editar, eliminar, filtrar, saldo, totalPorTipo } from './finanzas';
import { formatearCOP, formatearFecha } from './format';

// ---- Estado ----
let movimientos: Movimiento[] = cargar();

// ---- Referencias al DOM ----
function el<T extends HTMLElement>(id: string): T {
  const nodo = document.getElementById(id);
  if (!nodo) throw new Error(`No se encontró el elemento #${id}`);
  return nodo as T;
}

const form = el<HTMLFormElement>('formMovimiento');
const editId = el<HTMLInputElement>('editId');
const descripcion = el<HTMLInputElement>('descripcion');
const categoria = el<HTMLSelectElement>('categoria');
const monto = el<HTMLInputElement>('monto');
const fecha = el<HTMLInputElement>('fecha');
const formError = el<HTMLParagraphElement>('formError');
const tituloForm = el<HTMLHeadingElement>('tituloForm');
const btnGuardar = el<HTMLButtonElement>('btnGuardar');
const btnCancelar = el<HTMLButtonElement>('btnCancelar');

const buscar = el<HTMLInputElement>('buscar');
const filtroTipo = el<HTMLSelectElement>('filtroTipo');
const filtroCategoria = el<HTMLSelectElement>('filtroCategoria');
const lista = el<HTMLDivElement>('lista');

const saldoEl = el<HTMLElement>('saldo');
const totalIngresosEl = el<HTMLElement>('totalIngresos');
const totalGastosEl = el<HTMLElement>('totalGastos');

// ---- Utilidades ----
function tipoSeleccionado(): TipoMovimiento {
  const marcado = document.querySelector<HTMLInputElement>('input[name="tipo"]:checked');
  return marcado?.value === 'gasto' ? 'gasto' : 'ingreso';
}

function opcion(valor: string, texto: string): HTMLOptionElement {
  const o = document.createElement('option');
  o.value = valor;
  o.textContent = texto;
  return o;
}

function hoyISO(): string {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
}

// ---- Poblado de selects ----
function poblarCategoriasForm(): void {
  const seleccion = categoria.value;
  categoria.replaceChildren();
  for (const cat of CATEGORIAS[tipoSeleccionado()]) {
    categoria.appendChild(opcion(cat, cat));
  }
  // Conserva la categoría si sigue siendo válida (útil al editar).
  if (seleccion && CATEGORIAS[tipoSeleccionado()].includes(seleccion)) {
    categoria.value = seleccion;
  }
}

function poblarFiltroCategoria(): void {
  const todas = [...new Set([...CATEGORIAS.ingreso, ...CATEGORIAS.gasto])];
  // Mantiene la opción "Todas" y agrega el resto.
  for (const cat of todas) {
    filtroCategoria.appendChild(opcion(cat, cat));
  }
}

// ---- Render ----
function actualizarResumen(): void {
  saldoEl.textContent = formatearCOP(saldo(movimientos));
  totalIngresosEl.textContent = formatearCOP(totalPorTipo(movimientos, 'ingreso'));
  totalGastosEl.textContent = formatearCOP(totalPorTipo(movimientos, 'gasto'));
}

function crearFila(m: Movimiento): HTMLElement {
  const fila = document.createElement('div');
  fila.className = `movimiento movimiento--${m.tipo}`;
  fila.dataset.id = m.id;

  const icono = document.createElement('div');
  icono.className = 'movimiento__icono';
  icono.textContent = m.tipo === 'ingreso' ? '+' : '−';

  const info = document.createElement('div');
  info.className = 'movimiento__info';
  const desc = document.createElement('div');
  desc.className = 'movimiento__desc';
  desc.textContent = m.descripcion;
  const meta = document.createElement('div');
  meta.className = 'movimiento__meta';
  const chip = document.createElement('span');
  chip.className = 'chip';
  chip.textContent = m.categoria;
  const fechaSpan = document.createElement('span');
  fechaSpan.textContent = formatearFecha(m.fecha);
  meta.append(chip, fechaSpan);
  info.append(desc, meta);

  const montoEl = document.createElement('div');
  montoEl.className = 'movimiento__monto';
  montoEl.textContent = `${m.tipo === 'ingreso' ? '+' : '−'}${formatearCOP(m.monto)}`;

  const acciones = document.createElement('div');
  acciones.className = 'movimiento__acciones';
  const btnEditar = document.createElement('button');
  btnEditar.className = 'icon-btn';
  btnEditar.dataset.accion = 'editar';
  btnEditar.type = 'button';
  btnEditar.textContent = '✏️ Editar';
  const btnEliminar = document.createElement('button');
  btnEliminar.className = 'icon-btn icon-btn--eliminar';
  btnEliminar.dataset.accion = 'eliminar';
  btnEliminar.type = 'button';
  btnEliminar.textContent = '🗑️ Eliminar';
  acciones.append(btnEditar, btnEliminar);

  fila.append(icono, info, montoEl, acciones);
  return fila;
}

function renderLista(): void {
  const filtrados = filtrar(movimientos, {
    texto: buscar.value,
    categoria: filtroCategoria.value,
    tipo: filtroTipo.value as TipoMovimiento | 'todos',
  });

  lista.replaceChildren();

  if (movimientos.length === 0) {
    lista.innerHTML =
      '<div class="vacio"><span class="vacio__emoji">📭</span>Aún no hay movimientos. ¡Agrega tu primer ingreso o gasto!</div>';
    return;
  }
  if (filtrados.length === 0) {
    lista.innerHTML =
      '<div class="vacio"><span class="vacio__emoji">🔍</span>No hay movimientos que coincidan con la búsqueda o filtros.</div>';
    return;
  }

  for (const m of filtrados) {
    lista.appendChild(crearFila(m));
  }
}

function render(): void {
  actualizarResumen();
  renderLista();
}

function persistir(): void {
  guardar(movimientos);
  render();
}

// ---- Modo edición / reset ----
function reiniciarForm(): void {
  form.reset();
  editId.value = '';
  poblarCategoriasForm();
  fecha.value = hoyISO();
  formError.hidden = true;
  btnCancelar.hidden = true;
  tituloForm.textContent = 'Nuevo movimiento';
  btnGuardar.textContent = 'Agregar';
}

function cargarEnForm(m: Movimiento): void {
  const radio = document.querySelector<HTMLInputElement>(`input[name="tipo"][value="${m.tipo}"]`);
  if (radio) radio.checked = true;
  poblarCategoriasForm();
  categoria.value = m.categoria;
  descripcion.value = m.descripcion;
  monto.value = String(m.monto);
  fecha.value = m.fecha;
  editId.value = m.id;
  formError.hidden = true;
  btnCancelar.hidden = false;
  tituloForm.textContent = 'Editar movimiento';
  btnGuardar.textContent = 'Guardar cambios';
  form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ---- Eventos ----
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const desc = descripcion.value.trim();
  const valor = Number(monto.value);

  if (!desc) return mostrarError('Escribe una descripción.');
  if (!Number.isFinite(valor) || valor <= 0) return mostrarError('El monto debe ser mayor que 0.');
  if (!fecha.value) return mostrarError('Selecciona una fecha.');

  const datos = {
    tipo: tipoSeleccionado(),
    descripcion: desc,
    categoria: categoria.value,
    monto: valor,
    fecha: fecha.value,
  };

  movimientos = editId.value
    ? editar(movimientos, editId.value, datos)
    : agregar(movimientos, datos);

  reiniciarForm();
  persistir();
});

function mostrarError(mensaje: string): void {
  formError.textContent = mensaje;
  formError.hidden = false;
}

form.addEventListener('change', (e) => {
  const objetivo = e.target as HTMLElement;
  if (objetivo instanceof HTMLInputElement && objetivo.name === 'tipo') {
    poblarCategoriasForm();
  }
});

btnCancelar.addEventListener('click', () => reiniciarForm());

lista.addEventListener('click', (e) => {
  const boton = (e.target as HTMLElement).closest<HTMLButtonElement>('button[data-accion]');
  if (!boton) return;
  const fila = boton.closest<HTMLElement>('.movimiento');
  const id = fila?.dataset.id;
  if (!id) return;

  if (boton.dataset.accion === 'editar') {
    const m = movimientos.find((x) => x.id === id);
    if (m) cargarEnForm(m);
  } else if (boton.dataset.accion === 'eliminar') {
    const m = movimientos.find((x) => x.id === id);
    if (m && confirm(`¿Eliminar "${m.descripcion}"?`)) {
      movimientos = eliminar(movimientos, id);
      if (editId.value === id) reiniciarForm();
      persistir();
    }
  }
});

buscar.addEventListener('input', renderLista);
filtroTipo.addEventListener('change', renderLista);
filtroCategoria.addEventListener('change', renderLista);

// ---- Inicialización ----
poblarFiltroCategoria();
reiniciarForm();
render();
