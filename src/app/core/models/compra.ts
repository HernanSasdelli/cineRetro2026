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
}