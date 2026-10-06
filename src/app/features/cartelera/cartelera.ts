import { Component, OnInit, inject, signal } from '@angular/core';

import { Genero, Pelicula } from '../../core/models/pelicula';
import { Producto } from '../../core/models/candy';
import { Destacado } from '../../core/models/destacado';

import { RouterLink } from '@angular/router';
import { BuscarPipe } from '../../shared/pipes/buscar.pipe';
import { TarjetaPelicula } from './tarjeta-pelicula/tarjeta-pelicula';
import { TarjetaProducto } from '../../shared/components/tarjeta-producto/tarjeta-producto';

import { estadoPelicula } from '../../shared/utils/estreno';

import { PeliculasService } from '../../core/services/peliculas.service';
import { AuthService } from '../../core/services/auth.service';
import { AlertasService } from '../../core/services/alertas.service';
import { ResenasService } from '../../core/services/resenas.service';
import { CandyService } from '../../core/services/candy.service';

import { SliderDestacadas } from './slider-destacadas/slider-destacadas';
import { FilaPeliculas } from './fila-peliculas/fila-peliculas';

import { FilaProductos } from './fila-productos/fila-productos';



@Component({
  selector: 'app-cartelera',
  imports: [BuscarPipe, TarjetaPelicula, RouterLink, SliderDestacadas, FilaPeliculas, FilaProductos],
  templateUrl: './cartelera.html',
  styleUrl: './cartelera.scss',
})
export class Cartelera implements OnInit {
  private pelisService = inject(PeliculasService);
  private auth = inject(AuthService);
  private alertasService = inject(AlertasService);
  private resenasService = inject(ResenasService);
  private candyService = inject(CandyService);

  peliculas = signal<Pelicula[]>([]);
  generos = signal<Genero[]>([]);
  texto = signal('');
  generoId = signal<number | null>(null);
  cargando = signal(true);
  error = signal('');
  destacadas = signal<Pelicula[]>([]);   // las 3 mas vendidas
  avisos = signal<Pelicula[]>([]);   // pelis con alerta que ya salieron a la venta
  productosCandy = signal<Producto[]>([]);   // para la fila de candy de abajo
  destacadosSlider = signal<Destacado[]>([]);   // las 3 pelis mas vistas y los 2 combos mas pedidos



  // al entrar: traigo peliculas, generos, las 3 mas vendidas, el candy y armo el slider
  async ngOnInit() {
    //aca esta el cach que no entendia!! es igual que en c#
    try {
      const pelis = await this.pelisService.listar();
      // le pego a cada peli su promedio de estrellas, si tiene
      const proms = await this.resenasService.promedios();
      for (const p of pelis) {
        for (const x of proms) {
          if (x.pelicula_id === p.id) p.promedio = x.promedio;
        }
      }
      this.peliculas.set(pelis);
      this.generos.set(await this.pelisService.generos());

      // busco en la lista que ya tengo las 3 mas vendidas, en el orden que vienen
      const ids = await this.pelisService.masVendidas();
      const lista: Pelicula[] = [];
      for (const id of ids) {
        for (const p of this.peliculas()) {
          if (p.id === id) lista.push(p);
        }
      }
      this.destacadas.set(lista);


      //---CANDY---

      // candy para la fila de abajo
      const candy = await this.candyService.activos();
            // en la fila del candy van primero los combos y despues los productos
      const ordenado: Producto[] = [];
      for (const c of candy) {
        if (c.tipo === 'combo') ordenado.push(c);
      }
      for (const c of candy) {
        if (c.tipo === 'producto') ordenado.push(c);
      }
      this.productosCandy.set(ordenado);

      // los 2 combos mas pedidos
      const idsCombos = await this.candyService.combosMasPedidos();
      const combos: Producto[] = [];
      for (const id of idsCombos) {
        for (const c of candy) {
          if (c.id === id) combos.push(c);
        }
      }
      // si todavia no hay 2 pedidos, completo con los mas nuevos
      if (combos.length < 2) {
        for (const c of await this.candyService.combosNuevos()) {
          let yaEsta = false;
          for (const x of combos) {
            if (x.id === c.id) yaEsta = true;
          }
          if (!yaEsta && combos.length < 2) combos.push(c);
        }
      }


      //---SLIDER---

      // armo lo que muestra el slider: primero las pelis, despues los combos
      const slider: Destacado[] = [];
      for (const p of this.destacadas()) {
        slider.push({ titulo: p.titulo, imagen: p.banner_url, link: ['/pelicula', p.id] });
      }
      for (const c of combos) {
        slider.push({ titulo: c.nombre, imagen: c.banner_url, link: null });
      }
      this.destacadosSlider.set(slider);


      //---ALERTAS---

      // si esta logueado, busco sus alertas de pelis que ya salieron a la venta
      await this.auth.listo;
      if (this.auth.logueado()) {
        const idsAlertas = await this.alertasService.pendientes();
        const conAviso: Pelicula[] = [];
        for (const p of this.peliculas()) {
          if (idsAlertas.includes(p.id) && estadoPelicula(p) !== 'proximamente') conAviso.push(p);
        }
        this.avisos.set(conAviso);
      }
    } catch {
      this.error.set('No se pudo cargar la cartelera. Revisá la conexión y recargá la página.');
    } finally {
      this.cargando.set(false);
    }
  }

  // las que ya se pueden ver, van en la grilla grande
  enCartelera() {
    const lista: Pelicula[] = [];
    for (const p of this.peliculas()) {
      if (estadoPelicula(p) === 'cartelera') lista.push(p);
    }
    return lista;
  }

  // las que estan en preventa, fila de abajo
  enPreventa() {
    const lista: Pelicula[] = [];
    for (const p of this.peliculas()) {
      if (estadoPelicula(p) === 'preventa') lista.push(p);
    }
    return lista;
  }

  // las que todavia no se venden, ultima fila
  proximamente() {
    const lista: Pelicula[] = [];
    for (const p of this.peliculas()) {
      if (estadoPelicula(p) === 'proximamente') lista.push(p);
    }
    return lista;
  }

  buscar(e: Event) {
    this.texto.set((e.target as HTMLInputElement).value);
  }

  // cerro el aviso: lo marco en la base y lo saco de la lista
  async cerrarAviso(p: Pelicula) {
    try {
      await this.alertasService.marcarAvisada(p.id);
    } catch {
      // si falla no pasa nada, la proxima vez le vuelve a aparecer
    }
    const lista: Pelicula[] = [];
    for (const x of this.avisos()) {
      if (x.id !== p.id) lista.push(x);
    }
    this.avisos.set(lista);
  }
}