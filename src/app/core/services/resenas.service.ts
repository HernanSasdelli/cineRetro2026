import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { MiPelicula, Promedio, Resena } from '../models/resena';

// reseñas y mis peliculas
@Injectable({ providedIn: 'root' })
export class ResenasService {
  private sb = inject(SupabaseService).client;

  async dePelicula(peliculaId: number): Promise<Resena[]> {
    const { data, error } = await this.sb.rpc('resenas_de_pelicula', { p_pelicula_id: peliculaId });
    if (error) throw error;
    return data;
  }

  async promedios(): Promise<Promedio[]> {
    const { data, error } = await this.sb.rpc('promedios');
    if (error) throw error;
    return data;
  }

  async misPeliculas(): Promise<MiPelicula[]> {
    const { data, error } = await this.sb.rpc('mis_peliculas');
    if (error) throw error;
    return data;
  }

  // si no la vio la RLS no deja, y si ya la puntuo tampoco (una por peli)
  async publicar(peliculaId: number, estrellas: number, comentario: string) {
    const { error } = await this.sb.from('resenas').insert({
      pelicula_id: peliculaId,
      estrellas: estrellas,
      comentario: comentario || null,
    });
    if (error) throw error;
  }
}