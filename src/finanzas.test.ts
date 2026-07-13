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
    const res = agregar(base, {
      tipo: 'gasto',
      descripcion: 'Cine',
      categoria: 'Entretenimiento',
      monto: 50,
      fecha: '2026-05-05',
    });
    expect(res.length).toBe(4);
    expect(res[0].descripcion).toBe('Cine');
    expect(res[0].id).toBeTruthy();
    expect(base.length).toBe(3); // no mutación
  });

  it('editar cambia solo el movimiento indicado', () => {
    const res = editar(base, '2', { monto: 800 });
    expect(res.find((m) => m.id === '2')!.monto).toBe(800);
    expect(res.find((m) => m.id === '1')!.monto).toBe(3000);
  });

  it('eliminar quita por id', () => {
    const res = eliminar(base, '3');
    expect(res.length).toBe(2);
    expect(res.some((m) => m.id === '3')).toBe(false);
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
