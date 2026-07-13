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
  gasto: [
    'Alimentación',
    'Transporte',
    'Vivienda',
    'Servicios',
    'Entretenimiento',
    'Salud',
    'Otros',
  ],
};
