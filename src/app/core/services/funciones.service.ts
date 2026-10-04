import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Funcion, Sala } from '../models/funcion';

@Injectable({ providedIn: 'root' }) //esta clase se puede injectar, como adsington en ASP.NET
export class FuncionesService {
  private sb = inject(SupabaseService).client;//le pido al servicio que tiene la conexion a supobase.

  // salas activas, para el desplegable del formulario
  async salas(): Promise<Sala[]> {//es el task de c#, devuelve array de salas
    const { data, error } = await this.sb
      .from('salas')
      .select('*')
      .eq('activa', true)
      .order('nombre');
    if (error) throw error; // si viene error lo hago una excepction.
    return data;
  }

  // guarda una funcion nueva. si se pisa con otra, la base tira error 23P01
  async crear(funcion: Omit<Funcion, 'id'>) { //omit es omitir, le saco el id, porque la base lo genera sola
    const { error } = await this.sb.from('funciones').insert(funcion);
    if (error) throw error;
  }
}