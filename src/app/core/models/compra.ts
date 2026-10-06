// un item del candy de una compra
export interface ItemPedido {
  nombre: string;
  tipo: 'producto' | 'combo';
  cantidad: number;
}


// una compra como la devuelve la base (funcion ver_pedido)
export interface Pedido {
  codigo: string;      // el que va en el QR
  email: string;
  total: number;
  pelicula: string;
  sala: string;
  inicio: string;
  formato: string;
  idioma: string;
  butacas: string[];   // ['F12', 'F13']
  descuento: number;   // porcentaje que se le desconto (0 = ninguno)
  restriccion_edad: number;   // 0 es ATP
  usada_en: string | null;   // null es que todavia no se uso
  codigo_corto: string;   // el de 5 para tipear a mano
  duracion_min: number;   // para saber cuando termina la funcion
  candy_entregado_en: string | null;   // null es que todavia no lo retiro
  items: ItemPedido[];   // el candy, vacio si no compro
}

// el cupon que le toca al usuario (funcion mi_descuento de la base)
export interface Descuento {
  porcentaje: number;
  nombre: string;
}

//------------------CUPONES------------------

// un cupon de la tabla cupones
export interface Cupon {
  id: number;
  nombre: string;
  porcentaje: number;
  solo_primera_compra: boolean;
  edad_minima: number | null;   // null es cualquier edad
  activo: boolean;
}