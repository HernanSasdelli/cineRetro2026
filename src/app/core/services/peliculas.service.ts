import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Genero, NuevaPelicula, Pelicula } from '../models/pelicula';

@Injectable({ providedIn: 'root' })
export class PeliculasService {
  private sb = inject(SupabaseService).client;

  async listar(soloActivas = true): Promise<Pelicula[]> {
    // generos(...) lo resuelve supabase por la tabla intermedia
    let q = this.sb.from('peliculas').select('*, generos(id, nombre)').order('titulo');
    if (soloActivas) q = q.eq('activa', true);
    const { data, error } = await q;
    if (error) throw error;
    return data as Pelicula[];
  }

  async generos(): Promise<Genero[]> {
    const { data, error } = await this.sb.from('generos').select('*').order('nombre');
    if (error) throw error;
    return data as Genero[];
  }

  async crear(peli: NuevaPelicula, generoIds: number[]) {
    const { data, error } = await this.sb.from('peliculas').insert(peli).select('id').single();
    if (error) throw error;

    const filas = generoIds.map(genero_id => ({ pelicula_id: data.id, genero_id }));
    const { error: e2 } = await this.sb.from('pelicula_genero').insert(filas);
    if (e2) throw e2;
  }
}
