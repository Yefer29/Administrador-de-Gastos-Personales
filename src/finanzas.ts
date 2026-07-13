import type { Movimiento, TipoMovimiento } from './types';

export function nuevoId(): string {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }
  return `${Date.now()}-${Math.trunc(performance.now() * 1000)}`;
}

export function agregar(lista: Movimiento[], datos: Omit<Movimiento, 'id'>): Movimiento[] {
  return [{ id: nuevoId(), ...datos }, ...lista];
}

export function editar(
  lista: Movimiento[],
  id: string,
  cambios: Partial<Omit<Movimiento, 'id'>>,
): Movimiento[] {
  return lista.map((m) => (m.id === id ? { ...m, ...cambios } : m));
}

export function eliminar(lista: Movimiento[], id: string): Movimiento[] {
  return lista.filter((m) => m.id !== id);
}

export function totalPorTipo(lista: Movimiento[], tipo: TipoMovimiento): number {
  return lista.filter((m) => m.tipo === tipo).reduce((acc, m) => acc + m.monto, 0);
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
  return lista.filter((m) => {
    if (tipo && tipo !== 'todos' && m.tipo !== tipo) return false;
    if (categoria && categoria !== 'todos' && m.categoria !== categoria) return false;
    if (texto && !`${m.descripcion} ${m.categoria}`.toLowerCase().includes(texto)) return false;
    return true;
  });
}
