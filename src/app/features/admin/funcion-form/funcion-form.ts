import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink} from '@angular/router';
import { Pelicula } from '../../../core/models/pelicula';

import { PeliculasService } from '../../../core/services/peliculas.service';
import { FuncionesService } from '../../../core/services/funciones.service';
import { ConCambios } from '../../../core/guards/cambios.guard';
import { Formato, Idioma, Sala, Precio } from '../../../core/models/funcion';

import { TitleCasePipe } from '@angular/common';


@Component({
  selector: 'app-funcion-form',
  imports: [ReactiveFormsModule, RouterLink, TitleCasePipe],
  templateUrl: './funcion-form.html',
  styleUrl: './funcion-form.scss',
})
export class FuncionForm implements OnInit, ConCambios {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private pelisService = inject(PeliculasService);
  private funcionesService = inject(FuncionesService);

  peliculas = signal<Pelicula[]>([]);
  salas = signal<Sala[]>([]);
  precios = signal<Precio[]>([]);
  formatos: Formato[] = ['2D', '3D', '4D', '5D'];
  idiomas: Idioma[] = ['castellano', 'subtitulada'];
  horarios = ['15:30', '18:00', '20:00', '22:30'];
  diasSemana = [1, 2, 3, 4, 5, 6, 0];   // orden de los botones: Lun..Dom (0 = domingo)
  semanasOpciones = [1, 2, 3, 4];
  error = signal('');
  guardando = signal(false);
  private guardado = false;


  //private no lo dejaba ver.
 protected nombresDias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  hoy = this.aTexto(new Date());
  proximosDias = this.armarProximosDias();

  form = this.fb.group({
    pelicula_id: ['', Validators.required],
    sala_id: ['', Validators.required],
    desde: [this.hoy, Validators.required],
        dias: [[new Date().getDay()], Validators.required],
    semanas: [1],
    hora: ['', Validators.required],

    formato: ['2D', Validators.required],
    idioma: ['castellano', Validators.required],
    precio: [0, [Validators.required, Validators.min(1)]],
  });

  // al entrar cargo peliculas y salas para los desplegables
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


    // marca el formato y pone el precio de ese formato
  elegirFormato(f: Formato) {
    this.form.controls.formato.setValue(f);
    this.sugerirPrecio(f);
    this.form.markAsDirty();
  }

  // busca en la tabla precios el de ese formato
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

  elegirDesde(fecha: string) {
    this.form.controls.desde.setValue(fecha);
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
  //     // 23P01 = la base dice que se pisa con otra funcion en esa sala
  //     if (e.code === '23P01') {
  //       this.error.set('Esa sala ya tiene una función en ese horario (contando 30 min de limpieza).');
  //     } else {
  //       this.error.set('No se pudo guardar la función.');
  //     }
  //   } finally {
  //     this.guardando.set(false);
  //   }
  // }

  // // este guardar simplifica la carga como pide la consigna
  // // recorre los dias del rango y crea una funcion por cada dia marcado
  // // si alguna choca con otra en esa sala, la anoto y sigo con las demas
  // async guardar() {
  //   if (this.form.invalid) {
  //     this.form.markAllAsTouched();
  //     return;
  //   }
  //   this.error.set('');
  //   this.guardando.set(true);

  //   const v = this.form.value;
  //   const dias = v.dias ?? [];
  //   const totalDias = (v.semanas ?? 1) * 7;
  //   const fallidas: string[] = [];
  //   let creadas = 0;

  //   for (let i = 0; i < totalDias; i++) {
  //     // el dia i contando desde "desde", a la hora elegida
  //     const d = new Date(v.desde + 'T' + v.hora);
  //     d.setDate(d.getDate() + i);

  //     if (!dias.includes(d.getDay())) continue;   // ese dia de la semana no esta marcado
  //     if (d < new Date()) continue;                // ese horario ya paso

  //     const texto = this.nombresDias[d.getDay()] + ' ' + d.getDate() + '/' + (d.getMonth() + 1);
  //     try {
  //       await this.funcionesService.crear({
  //         pelicula_id: Number(v.pelicula_id),
  //         sala_id: Number(v.sala_id),
  //         inicio: d.toISOString(),
  //         formato: v.formato as Formato,
  //         idioma: v.idioma as Idioma,
  //         precio: Number(v.precio),
  //       });
  //       creadas++;
  //     } catch (e: any) {
  //       // 23P01 = se pisa con otra funcion en esa sala

  //       //guarda las fallidas para mostrarlas, pero las que si entraban se guardaron
  //       if (e.code === '23P01') {
  //         fallidas.push(texto + ' (sala ocupada)');
  //       } else {
  //         fallidas.push(texto + ' (error)');
  //       }
  //     }
  //   }

  //   this.guardando.set(false);
  //   // si se creo alguna, ya hay algo guardado: que el guard no pregunte
  //   this.guardado = creadas > 0;

  //   if (creadas === 0 && fallidas.length === 0) {
  //     this.error.set('Con esos días y fechas no queda ninguna función por crear.');
  //   } else if (fallidas.length === 0) {
  //     this.router.navigate(['/admin']);
  //   } else {
  //     this.error.set('Se crearon ' + creadas + ' funciones. No se pudieron crear: ' + fallidas.join(', '));
  //   }
  // }UNCION DEMASIADO LARGA, la atomise

    // arma la lista de fechas a crear: los dias marcados dentro del rango, que no hayan pasado
    //OJO SI CAMBIO LA FECHA DE LA MAQUINA CAMBIAA TAMBIEN LA LECTURA!!
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

  // "Mié 14/10", para avisar cuál no se pudo crear
  private textoFecha(d: Date) {
    return this.nombresDias[d.getDay()] + ' ' + d.getDate() + '/' + (d.getMonth() + 1);
  }

  // crea una funcion por cada fecha; las que chocan se anotan y sigo con las demas
  //SIGUE LARGA. 
  async guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    //error total, no guarda nada
    const fechas = this.calcularFechas();
    if (fechas.length === 0) {
      this.error.set('Con esos días y fechas no queda ninguna función por crear.');
      return;
    }

    this.error.set('');
    this.guardando.set(true);
    const v = this.form.value;
    const fallidas: string[] = [];

    for (const d of fechas) {
      try {
        await this.funcionesService.crear({
          pelicula_id: Number(v.pelicula_id),
          sala_id: Number(v.sala_id),
          inicio: d.toISOString(),
          formato: v.formato as Formato,
          idioma: v.idioma as Idioma,
          precio: Number(v.precio),
        });
      } catch (e: any) {
        // 23P01 = se pisa con otra funcion en esa sala
        if (e.code === '23P01') {
          fallidas.push(this.textoFecha(d) + ' (sala ocupada)');
        } else {
          fallidas.push(this.textoFecha(d) + ' (error)');
        }
      }
    }

    this.guardando.set(false);
    const creadas = fechas.length - fallidas.length;
    this.guardado = creadas > 0;   // si se creo alguna, que el guard no pregunte

    if (fallidas.length === 0) {
      this.router.navigate(['/admin/funciones']);
    } else {
      this.error.set('Se crearon ' + creadas + ' funciones. No se pudieron crear: ' + fallidas.join(', '));
    }
  }

}
