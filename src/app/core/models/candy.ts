export type TipoProducto = 'producto' | 'combo';
export type Categoria = 'Pochoclos' | 'Bebidas' | 'Golosinas';

// un producto del candy. los combos incluyen una entrada y tienen banner
export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  tipo: TipoProducto;
  categoria: Categoria | null;   // los combos no tienen
  precio: number;
  imagen_url: string;            // cuadrada, todos
  banner_url: string | null;     // solo combos
  activo: boolean;
  creado_en?: string;
}