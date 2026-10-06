// lo que muestra el slider de arriba: una peli (con link al detalle) o un combo (sin link)
export interface Destacado {
  titulo: string;
  imagen: string | null;
  link: (string | number)[] | null;
}