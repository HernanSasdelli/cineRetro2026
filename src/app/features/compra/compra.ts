import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe, TitleCasePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { FuncionesService } from '../../core/services/funciones.service';
import { ComprasService } from '../../core/services/compras.service';
import { FuncionConDatos } from '../../core/models/funcion';
import { Descuento } from '../../core/models/compra';   // NUEVO cupon
import { ConCambios } from '../../core/guards/cambios.guard';
import { CandyService } from '../../core/services/candy.service';
import { Categoria, Producto } from '../../core/models/candy';
import { TarjetaProducto } from '../../shared/components/tarjeta-producto/tarjeta-producto';

// PANTALLA DE COMPRA
// que necesito: la funcion (peli, sala, hora, precio) y las butacas ya vendidas
// que hace: dibuja el mapa A-T x 28, el usuario toca butacas, ve el total y compra
// el precio que muestro es solo para ver: el de verdad lo calcula la base
// no pide login: se puede comprar sin cuenta dejando el mail
@Component({
  selector: 'app-compra',
  imports: [CurrencyPipe, DatePipe, TitleCasePipe, RouterLink, TarjetaProducto],
  templateUrl: './compra.html',
  styleUrl: './compra.scss',
})
export class Compra implements OnInit, ConCambios {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  protected auth = inject(AuthService);   // protected: el html pregunta si esta logueado
  private funcionesService = inject(FuncionesService);
  private comprasService = inject(ComprasService);
  private candyService = inject(CandyService);

  productos = signal<Producto[]>([]);

  // lo que eligio del candy: el producto y cuantos
  candyElegido = signal<{ producto: Producto; cantidad: number }[]>([]);
  categorias: Categoria[] = ['Pochoclos', 'Bebidas', 'Golosinas'];

  // el id viene en la url: /compra/7. snapshot porque no cambia estando aca
  private funcionId = Number(this.route.snapshot.paramMap.get('funcionId'));

  funcion = signal<FuncionConDatos | null>(null);
  ocupadas = signal<string[]>([]);   // vendidas, en gris
  elegidas = signal<string[]>([]);   // las que toca el usuario, en naranja
  email = signal('');
  confirmaEdad = signal(false);
  descuento = signal<Descuento | null>(null);   // NUEVO cupon: el que le toca, solo para mostrar
  error = signal('');
  comprando = signal(false);
  private comprado = false;   // para que el guard no pregunte despues de comprar

  // el mapa: 20 filas de 28 butacas. pasillos despues de la 4 y de la 24
  filas = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'
           , 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T'];
  numeros: number[] = [];
 numerosJ: number[] = []; 
  //construyo la grilla
  //ssaque la k Y LA j es diferente
  /*constructor() {
    // 1, 2, 3 ... 28
    for (let i = 1; i <= 28; i++) {
      this.numeros.push(i);
    }
  }*/

      //construyo la grilla
  constructor() {
    for (let i = 1; i <= 28; i++) {
      this.numeros.push(i);
    }
    for (let i = 1; i <= 14; i++) {
      this.numerosJ.push(i);
    }
  }

  // al entrar: espero la sesion (por el F5), traigo la funcion y las vendidas
  async ngOnInit() {
    try {
      await this.auth.listo;
      this.funcion.set(await this.funcionesService.obtener(this.funcionId));
      this.ocupadas.set(await this.comprasService.ocupadas(this.funcionId));
      this.productos.set(await this.candyService.activos());

      // si esta logueado uso su mail y busco si le toca algun cupon
      // sin cuenta: escribe el mail y no tiene cupon
      const usuario = this.auth.usuario();
      if (usuario?.email) {
        this.email.set(usuario.email);
        this.descuento.set(await this.comprasService.miDescuento());   // NUEVO cupon
      }
    } catch {
      this.error.set('No se pudo cargar la función.');
    }
  }

  // arma el nombre de la butaca: 'F' + 12 = 'F12'
  butaca(fila: string, n: number) {
    return fila + n;
  }

  // ultimas 3 filas = VIP (mail del cliente)
  esVip(fila: string) {
    return fila === 'R' || fila === 'S' || fila === 'T';
  }

  
 // la J es la fila para sillas de ruedas, quedaron 2, 10 y 2 butacas
  esAccesible(fila: string) {
    return fila === 'J';
  }

  // cuantas butacas tiene cada fila
  numerosDe(fila: string) {
    if (fila === 'J') return this.numerosJ;
    return this.numeros;
  }

  // despues de que butaca va el pasillo
  esPasillo(fila: string, n: number) {
    if (fila === 'J') return n === 2 || n === 12;
    return n === 4 || n === 24;
  }

  // toco una butaca: si estaba elegida la saco, si no la agrego (igual que los dias de funciones)
  tocar(b: string) {
    if (this.ocupadas().includes(b)) return;   // vendida, no se puede

    const nueva: string[] = [];
    for (const x of this.elegidas()) {
      if (x !== b) nueva.push(x);
    }
    if (!this.elegidas().includes(b)) {
      if (nueva.length >= 10) {
        this.error.set('Máximo 10 butacas por compra.');
        return;
      }
      nueva.push(b);
    }
    this.error.set('');
    this.elegidas.set(nueva);
        // si saco todas las butacas, se va el candy. si quedan menos butacas que combos, saco los combos
    if (nueva.length === 0) {
      this.candyElegido.set([]);
    } else if (this.combosElegidos() > nueva.length) {
      this.sacarCombos();
      this.error.set('Cada combo incluye una entrada: volvé a elegir los combos.');
    }
  }

    // ---------- CANDY ----------

  combos() {
    const lista: Producto[] = [];
    for (const p of this.productos()) {
      if (p.tipo === 'combo') lista.push(p);
    }
    return lista;
  }

  productosDe(cat: Categoria) {
    const lista: Producto[] = [];
    for (const p of this.productos()) {
      if (p.tipo === 'producto' && p.categoria === cat) lista.push(p);
    }
    return lista;
  }

  // cuantos lleva de ese producto
  cantidadDe(p: Producto) {
    for (const x of this.candyElegido()) {
      if (x.producto.id === p.id) return x.cantidad;
    }
    return 0;
  }

  // total de combos elegidos (cada uno usa una butaca)
  combosElegidos() {
    let n = 0;
    for (const x of this.candyElegido()) {
      if (x.producto.tipo === 'combo') n += x.cantidad;
    }
    return n;
  }

  // un combo mas solo si quedan butacas sin combo
  puedeSumar(p: Producto) {
    if (p.tipo === 'combo') return this.combosElegidos() < this.elegidas().length;
    return true;
  }

  // arma la lista nueva con la cantidad cambiada, si queda en 0 lo saco
  private cambiarCantidad(p: Producto, cuanto: number) {
    const nueva: { producto: Producto; cantidad: number }[] = [];
    let estaba = false;
    for (const x of this.candyElegido()) {
      if (x.producto.id === p.id) {
        estaba = true;
        if (x.cantidad + cuanto > 0) nueva.push({ producto: x.producto, cantidad: x.cantidad + cuanto });
      } else {
        nueva.push(x);
      }
    }
    if (!estaba && cuanto > 0) nueva.push({ producto: p, cantidad: cuanto });
    this.candyElegido.set(nueva);
  }

  sumar(p: Producto) {
    if (!this.puedeSumar(p)) return;
    this.error.set('');
    this.cambiarCantidad(p, 1);
  }

  restar(p: Producto) {
    this.cambiarCantidad(p, -1);
  }

  private sacarCombos() {
    const nueva: { producto: Producto; cantidad: number }[] = [];
    for (const x of this.candyElegido()) {
      if (x.producto.tipo !== 'combo') nueva.push(x);
    }
    this.candyElegido.set(nueva);
  }

  // ---------- CUENTA (solo para mostrar, la de verdad la hace la base) ----------

  // entradas sin las que van dentro de un combo
  entradasSueltas() {
    return this.total() - this.entradasEnCombos();
  }

    // lo que se descuenta por las entradas que van dentro de los combos (precio comun de la funcion sin el vop)
  entradasEnCombos() {
    return this.combosElegidos() * (this.funcion()?.precio ?? 0);
  }

  // el cupon solo se aplica a las entradas sueltas
  descuentoMonto() {
    const porcentaje = this.descuento()?.porcentaje ?? 0;
    return this.entradasSueltas() * porcentaje / 100;
  }

  totalCandy() {
    let suma = 0;
    for (const x of this.candyElegido()) {
      suma += x.producto.precio * x.cantidad;
    }
    return suma;
  }

  // precio de una butaca, SOLO para mostrar. b[0] = la letra de la fila
  precioDe(b: string) {
    const base = this.funcion()?.precio ?? 0;
    return this.esVip(b[0]) ? base * 1.5 : base;
  }

  // suma de las elegidas, sin descuento
  total() {
    let suma = 0;
    for (const b of this.elegidas()) {
      suma += this.precioDe(b);
    }
    return suma;
  }

  /*
  // NUEVO cupon: total con el descuento aplicado (solo para mostrar, la base calcula el real)
  totalFinal() {
    const porcentaje = this.descuento()?.porcentaje ?? 0;
    return this.total() * (100 - porcentaje) / 100;
  }*/


    //BARDO
   // entradas sueltas - cupon + combos + candy
  totalFinal() {
    return this.entradasSueltas() - this.descuentoMonto() + this.totalCandy();
  }

  // EDAD
  // si la peli es +13 o +18: logueado → calculo con su fecha de nacimiento
  // sin cuenta → tiene que tildar "confirmo que soy mayor"
  edadOk() {
    const minima = this.funcion()?.peliculas.restriccion_edad ?? 0;
    if (minima === 0) return true;
    const perfil = this.auth.perfil();
    if (perfil) {
      return this.calcularEdad(perfil.fecha_nacimiento) >= minima;
    }
    return this.confirmaEdad();
  }

  private calcularEdad(fecha: string) {
    const nac = new Date(fecha + 'T00:00');
    const hoy = new Date();
    let edad = hoy.getFullYear() - nac.getFullYear();
    // si este año todavia no cumplio, uno menos
    const yaCumplio = hoy.getMonth() > nac.getMonth() ||
      (hoy.getMonth() === nac.getMonth() && hoy.getDate() >= nac.getDate());
    if (!yaCumplio) edad--;
    return edad;
  }

  // el mail es un solo campo: no hace falta un form reactivo (como el buscador)
  escribirEmail(e: Event) {
    this.email.set((e.target as HTMLInputElement).value);
  }

  // la llama el cambiosGuard: si eligio butacas y no compro, pregunta antes de salir
  tieneCambios() {
    return this.elegidas().length > 0 && !this.comprado;
  }

  // COMPRAR
  // 1. reviso que haya butacas, mail y edad
  // 2. le pido a la base que compre (todo o nada). el descuento lo aplica la base
  // 3. si sale bien → a la pantalla de la entrada con el QR
  // 4. atajo el error 23505 de la base si alguien me gano de mano y cancelo todas las butacas elegidas
  ///agregar tiempo de reserva tipo cinemark
  async comprar() {
        // el admin no compra, la base igual lo rechaza
    if (this.auth.rol() === 'admin') {
      this.error.set('Las cuentas de administrador no pueden comprar entradas.');
      return;
    }
    if (this.elegidas().length === 0) {
      this.error.set('Elegí al menos una butaca.');
      return;
    }
    if (!this.email().includes('@')) {
      this.error.set('Escribí un mail válido para recibir la entrada.');
      return;
    }
    if (!this.edadOk()) {
      this.error.set('Esta película es para mayores de ' + this.funcion()?.peliculas.restriccion_edad + ' años.');
      return;
    }

    this.error.set('');
    this.comprando.set(true);
    try {

      // del candy mando solo que productos y cuantos, el precio lo pone la base
      const items: { id: number; cantidad: number }[] = [];
      for (const x of this.candyElegido()) {
        items.push({ id: x.producto.id, cantidad: x.cantidad });
      }
      const codigo = await this.comprasService.comprar(this.funcionId, this.elegidas(), this.email(), items);
      this.comprado = true;
      this.router.navigate(['/entrada', codigo]);
    } catch (e: any) {
      if (e.code === '23505') {
        this.error.set('Alguien compró una de esas butacas recién. Elegí otras.');
        this.elegidas.set([]);
        this.ocupadas.set(await this.comprasService.ocupadas(this.funcionId));
      } else {
        this.error.set('No se pudo hacer la compra.');
      }
    } finally {
      this.comprando.set(false);
    }
  }
}