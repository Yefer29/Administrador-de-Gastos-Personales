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
