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
}

// el cupon que le toca al usuario (funcion mi_descuento de la base)
export interface Descuento {
  porcentaje: number;
  nombre: string;
}