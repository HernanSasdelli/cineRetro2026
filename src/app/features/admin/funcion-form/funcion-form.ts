import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TitleCasePipe } from '@angular/common';
import { Pelicula } from '../../../core/models/pelicula';
import { Formato, Idioma, Precio, Sala } from '../../../core/models/funcion';
import { PeliculasService } from '../../../core/services/peliculas.service';
import { FuncionesService } from '../../../core/services/funciones.service';
import { ConCambios } from '../../../core/guards/cambios.guard';
import { Modal } from '../../../shared/components/modal/modal';

// CARGA DE FUNCIONES (admin)
// el admin elige: pelicula, desde cuando, que dias, cuantas semanas, hora, formato, idioma y precio
// el sistema elige la SALA (mail del cliente): prueba sala por sala y la base dice si esta libre
// la regla de horarios (no pisarse + 30 min de limpieza) esta en la base, no aca
@Component({
  selector: 'app-funcion-form',
  imports: [ReactiveFormsModule, RouterLink, TitleCasePipe, Modal],
  templateUrl: './funcion-form.html',
  styleUrl: './funcion-form.scss',
})
export class FuncionForm implements OnInit, ConCambios {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private pelisService = inject(PeliculasService);
  private funcionesService = inject(FuncionesService);

  // lo que viene de la base
  peliculas = signal<Pelicula[]>([]);
  salas = signal<Sala[]>([]);
  precios = signal<Precio[]>([]);

  // opciones fijas de los botones (no cambian, por eso no son señales)
  formatos: Formato[] = ['2D', '3D', '4D', '5D'];
  idiomas: Idioma[] = ['castellano', 'subtitulada'];
  horarios = ['15:30', '18:00', '20:00', '22:30'];
  diasSemana = [1, 2, 3, 4, 5, 6, 0];   // orden de los botones: Lun..Dom (0 = domingo)
  semanasOpciones = [1, 2, 3, 4];

  error = signal('');
  guardando = signal(false);
    //-------MODAL------
    // en que paso esta el cartel: cerrado, sin funciones para crear, confirmando, creando o mostrando el resultado
  paso = signal<'cerrado' | 'vacio' | 'confirmar' | 'creando' | 'resultado'>('cerrado');
  aCrear = signal<Date[]>([]);          // las fechas que se listan en el cartel de confirmar
  creadasLista = signal<string[]>([]);  // "Mié 7/10 en Sala 1"
  fallidasLista = signal<string[]>([]); // "Vie 16/10: no hay salas libres a esa hora"

  private guardado = false;   // para que el guard no pregunte despues de guardar

  // ojo el orden: el form usa hoy, y proximosDias usa nombresDias
  protected nombresDias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];   // protected: lo usa el html
  hoy = this.aTexto(new Date());
  proximosDias = this.armarProximosDias();

  // cada campo: [valor inicial, validaciones]
  form = this.fb.group({
    pelicula_id: ['', Validators.required],
    desde: [this.hoy, Validators.required],
    dias: [[new Date().getDay()], Validators.required],   // arranca con el dia de hoy marcado
    semanas: [1],
    hora: ['', Validators.required],
    formato: ['2D', Validators.required],
    idioma: ['castellano', Validators.required],
    precio: [0, [Validators.required, Validators.min(1)]],
  });

  // al entrar cargo peliculas, salas y precios. el precio arranca con el de 2D
  async ngOnInit() {
    try {
      this.peliculas.set(await this.pelisService.listar());
      this.salas.set(await this.funcionesService.salas());
      this.precios.set(await this.funcionesService.precios());
      this.sugerirPrecio('2D');
    } catch {
      this.error.set('No se pudieron cargar las películas o las salas.');
    }
  }

  // la llama el cambiosGuard antes de salir
  tieneCambios() {
    return this.form.dirty && !this.guardado;
  }

  // ---------- BOTONES ----------

  // setValue desde codigo NO marca dirty (solo cuando el usuario escribe)
  // por eso markAsDirty a mano, si no el cambiosGuard no pregunta al salir
  elegirFormato(f: Formato) {
    this.form.controls.formato.setValue(f);
    this.sugerirPrecio(f);
    this.form.markAsDirty();
  }

  // busca en la tabla precios el de ese formato. sin markAsDirty: al entrar no cuenta como cambio
  private sugerirPrecio(f: Formato) {
    for (const p of this.precios()) {
      if (p.formato === f) {
        this.form.controls.precio.setValue(p.precio);
      }
    }
  }

  elegirIdioma(i: Idioma) {
    this.form.controls.idioma.setValue(i);
    this.form.markAsDirty();
  }

  elegirHora(h: string) {
    this.form.controls.hora.setValue(h);
    this.form.markAsDirty();
  }
/*
  elegirDesde(fecha: string) {
    this.form.controls.desde.setValue(fecha);
    this.form.markAsDirty();
  }*/
  marcarDiaDeDesde() {
    const d = new Date(this.form.value.desde + 'T00:00');
    this.form.controls.dias.setValue([d.getDay()]);
  }

      // el dirty sigue el boton que toco del dia, para evitar confunciones
  elegirDesde(fecha: string) {
    this.form.controls.desde.setValue(fecha);
    this.marcarDiaDeDesde();
    this.form.markAsDirty();
  }

  // marca o desmarca un dia de la semana
  toggleDia(n: number) {
    const actuales = this.form.controls.dias.value ?? [];
    const nueva: number[] = [];
    for (const d of actuales) {
      if (d !== n) nueva.push(d);            // copio todos menos el que toque
    }
    if (!actuales.includes(n)) nueva.push(n); // si no estaba marcado, lo agrego
    this.form.controls.dias.setValue(nueva);
    this.form.markAsDirty();
  }

  elegirSemanas(s: number) {
    this.form.controls.semanas.setValue(s);
    this.form.markAsDirty();
  }

  // ---------- FECHAS ----------

  // pasa un Date de js a texto 'aaaa-mm-dd', que es lo que usa el input date
  private aTexto(d: Date) {
    const mes = String(d.getMonth() + 1).padStart(2, '0');   // getMonth arranca en 0
    const dia = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '-' + mes + '-' + dia;
  }

  // hoy y los 6 dias siguientes, para los botones de "desde"
  private armarProximosDias() {
    const lista = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      lista.push({
        fecha: this.aTexto(d),
        etiqueta: i === 0 ? 'Hoy' : this.nombresDias[d.getDay()] + ' ' + d.getDate(),
      });
    }
    return lista;
  }

  // arma la lista de fechas a crear: los dias marcados dentro del rango, que no hayan pasado
  // (semanas * 7 dias desde "desde", y me quedo con los que caen en un dia marcado)
  private calcularFechas(): Date[] {
    const v = this.form.value;
    const dias = v.dias ?? [];
    const totalDias = (v.semanas ?? 1) * 7;
    const fechas: Date[] = [];

    for (let i = 0; i < totalDias; i++) {
      const d = new Date(v.desde + 'T' + v.hora);
      d.setDate(d.getDate() + i);
      if (dias.includes(d.getDay()) && d > new Date()) {
        fechas.push(d);
      }
    }
    return fechas;
  }

  // "Mié 14/10", para avisar cual no se pudo crear
  protected textoFecha(d: Date) {
    return this.nombresDias[d.getDay()] + ' ' + d.getDate() + '/' + (d.getMonth() + 1);
  }


    // busca el nombre de una sala por su id ("Sala 2"), para los mensajes
  private nombreSala(id: number) {
    for (const s of this.salas()) {
      if (s.id === id) return s.nombre;
    }
    return '';
  }

  // texto para que el admin vea ANTES de guardar que funciones se van a crear
  // usa el mismo calcularFechas que guardar(): lo que ve es exactamente lo que se crea
  resumen() {
    if (!this.form.value.hora) {
      return 'Elegí la hora para ver qué funciones se van a crear.';
    }
    const fechas = this.calcularFechas();
    if (fechas.length === 0) {
      return 'Con esa combinación no se crea ninguna función (fechas u horarios que ya pasaron).';
    }
    const textos: string[] = [];
    for (const d of fechas) {
      textos.push(this.textoFecha(d));
    }
    return 'Se van a crear ' + fechas.length + ' funciones: ' + textos.join(', ');
  }

  // ---------- SALA AUTOMATICA ----------

  // si la peli ya tiene funciones con el mismo idioma y formato, uso esa sala primero
  // (el cartel ya esta puesto: la version en castellano no cambia de sala cada dia)
  // si no tiene ninguna, devuelvo 0 y se prueba en orden desde la Sala 1
  private async salaDeLaPelicula(): Promise<number> {
    const v = this.form.value;
    const existentes = await this.funcionesService.dePelicula(Number(v.pelicula_id));
    for (const f of existentes) {
      if (f.idioma === v.idioma && f.formato === v.formato) {
        return f.sala_id;
      }
    }
    return 0;
  }

  // prueba crear la funcion de esa fecha sala por sala, hasta que una este libre
  // empieza por la sala que vengo usando, asi la peli queda en la misma sala si se puede
  // no reviso yo los horarios: le pregunto a la base, si dice 23P01 esa sala esta ocupada
  // devuelve el id de la sala que uso, o 0 si estaban todas ocupadas
  private async crearEnAlgunaSala(d: Date, salaAnterior: number): Promise<number> {
    const v = this.form.value;

    // el orden en que pruebo: primero la que vengo usando, despues el resto
    const orden: number[] = [];
    if (salaAnterior > 0) orden.push(salaAnterior);
    for (const s of this.salas()) {
      if (s.id !== salaAnterior) orden.push(s.id);
    }

    for (const salaId of orden) {
      try {
        await this.funcionesService.crear({
          pelicula_id: Number(v.pelicula_id),
          sala_id: salaId,
          inicio: d.toISOString(),
          formato: v.formato as Formato,
          idioma: v.idioma as Idioma,
          precio: Number(v.precio),
        });
        return salaId;   // entro en esta sala: listo
      } catch (e: any) {
        // 23P01 = ocupada a esa hora → sigo con la proxima sala
        // cualquier otro error → lo tiro para arriba, no tiene sentido seguir probando
        if (e.code !== '23P01') throw e;
      }
    }
    return 0;   // probe todas y ninguna estaba libre
  }

  // ---------- GUARDAR ----------
 //Guardar original que guarda de a una funcion!!
    // arma la funcion con los datos del form y la manda a la base
  // async guardar() {
  //   if (this.form.invalid) {
  //     this.form.markAllAsTouched();   // pinta en rojo lo que falta, buscar en el video de la 4
  //     return;
  //   }
  //   this.error.set('');
  //   this.guardando.set(true);
  //   const v = this.form.value;
  //   try {
  //     await this.funcionesService.crear({
  //       pelicula_id: Number(v.pelicula_id),
  //       sala_id: Number(v.sala_id),
  //       inicio: new Date(v.desde + 'T' + v.hora).toISOString(),
  //       formato: v.formato as Formato,
  //       idioma: v.idioma as Idioma,
  //       precio: Number(v.precio),
  //     });
  //     this.guardado = true;
  //     this.router.navigate(['/admin']);
  //   } catch (e: any) {
   // 23P01 = la base dice que se pisa con otra funcion en esa sala
  //     if (e.code === '23P01') {
  //       this.error.set('Esa sala ya tiene una función en ese horario (contando 30 min de limpieza).');
  //     } else {
  //       this.error.set('No se pudo guardar la función.');
  //     }
  //   } finally {
  //     this.guardando.set(false);
  //   }
  // }

  //anoto donde quedo cada funcion segun peli.
  // crea una funcion por cada fecha, cada una en la sala que encuentre libre
  // las que no entran en ninguna sala se anotan y sigo con las demas 
  /*async guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();   // pinta en rojo lo que falta
      return;
    }
    const fechas = this.calcularFechas();
    if (fechas.length === 0) {
      this.error.set(this.resumen());   // mismo texto que ya ve abajo, explica por que no hay nada
      return;
    }

    this.error.set('');
    this.guardando.set(true);
    const fallidas: string[] = [];
    const creadasTexto: string[] = [];   // "Lun 5/10 en Sala 1"
    let salaUsada = await this.salaDeLaPelicula();   // arranco por la sala de la peli, si ya tiene

    for (const d of fechas) {
      try {
        const sala = await this.crearEnAlgunaSala(d, salaUsada);
        if (sala === 0) {
          fallidas.push(this.textoFecha(d) + ' (no hay salas libres)');
        } else {
          salaUsada = sala;
          creadasTexto.push(this.textoFecha(d) + ' en ' + this.nombreSala(sala));
        }
      } catch {
        fallidas.push(this.textoFecha(d) + ' (error)');
      }
    }

    this.guardando.set(false);
    this.guardado = creadasTexto.length > 0;   // si se creo alguna, que el guard no pregunte

    if (fallidas.length === 0) {
      // salio todo bien: en la lista se ve la sala de cada una
      this.router.navigate(['/admin/funciones']);
    } else if (creadasTexto.length === 0) {
      this.error.set('No se pudo crear ninguna: ' + fallidas.join(', '));
    } else {
      this.error.set('Se crearon: ' + creadasTexto.join(', ') + '. No se pudieron crear: ' + fallidas.join(', '));
    }
  }*/

    ///--------GUARDAR ATOMINZADO POR CARTEL----

  guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();   // pinta en rojo lo que falta
      return;
    }
    const fechas = this.calcularFechas();
    this.aCrear.set(fechas);
    if (fechas.length === 0) {
      this.paso.set('vacio');      // cartel: "no hay funciones para crear"
    } else {
      this.paso.set('confirmar');  // cartel: lista + [Cancelar] [Crear]
    }
  }

    ///-------FUNCIONES QUE ACOMPAÑAN A GUARDAR, van en el cartel de confirmacion

    // tocaron "Crear" en el cartel: recien ahora se crean, cada una en la sala que encuentre libre
  // las que no entran se anotan con el motivo y sigo con las demas (opcion B)
  async confirmarCreacion() {
    this.paso.set('creando');   // apaga los botones del cartel mientras guarda
    const creadas: string[] = [];
    const fallidas: string[] = [];

    // arranco por la sala de la peli si ya tiene; si falla la consulta, arranco de cero
    let salaUsada = 0;
    try {
      salaUsada = await this.salaDeLaPelicula();
    } catch {
      salaUsada = 0;
    }

    for (const d of this.aCrear()) {
      try {
        const sala = await this.crearEnAlgunaSala(d, salaUsada);
        if (sala === 0) {
          fallidas.push(this.textoFecha(d) + ': no hay salas libres a esa hora');
        } else {
          salaUsada = sala;
          creadas.push(this.textoFecha(d) + ' en ' + this.nombreSala(sala));
        }
      } catch {
        fallidas.push(this.textoFecha(d) + ': error al guardar');
      }
    }

    this.creadasLista.set(creadas);
    this.fallidasLista.set(fallidas);
    this.guardado = creadas.length > 0;   // si se creo alguna, que el guard no pregunte
    this.paso.set('resultado');           // cartel: que se creo y que no
  }

  // cierra el cartel sin hacer nada (cancelar, o "no hay funciones")
  cerrarCartel() {
    this.paso.set('cerrado');
  }

  // boton del cartel de resultado: si se creo algo voy a la lista, si no me quedo a corregir
  cerrarResultado() {
    if (this.creadasLista().length > 0) {
      this.router.navigate(['/admin/funciones']);
    } else {
      this.paso.set('cerrado');
    }
  }

  // titulo de la peli elegida, para el texto del cartel
  tituloPelicula() {
    const id = Number(this.form.value.pelicula_id);
    for (const p of this.peliculas()) {
      if (p.id === id) return p.titulo;
    }
    return '';
  }

}