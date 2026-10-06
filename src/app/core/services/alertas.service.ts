import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';


// alertas de "avisame cuando salga a la venta"
// cada usuario solo ve y toca las suyas, eso lo controla la RLS
@Injectable({ providedIn: 'root' })
export class AlertasService {
  private sb = inject(SupabaseService).client;

  // si el usuario ya tiene alerta para esa peli
  async tengo(peliculaId: number): Promise<boolean> {
    const { data, error } = await this.sb
      .from('alertas')
      .select('pelicula_id')
      .eq('pelicula_id', peliculaId);
    if (error) throw error;
    return data.length > 0;
  }

  // el usuario lo pone la base sola con auth.uid()
  async activar(peliculaId: number) {
    const { error } = await this.sb.from('alertas').insert({ pelicula_id: peliculaId });
    if (error) throw error;
  }

  async quitar(peliculaId: number) {
    const { error } = await this.sb.from('alertas').delete().eq('pelicula_id', peliculaId);
    if (error) throw error;
  }

  // ids de las pelis con alerta que todavia no le avise
  // los datos de cada peli ya los tiene la cartelera, no hace falta traerlos de nuevo
  async pendientes(): Promise<number[]> {
    const { data, error } = await this.sb
      .from('alertas')
      .select('pelicula_id')
      .eq('avisada', false);
    if (error) throw error;
    const ids: number[] = [];
    for (const a of data) {
      ids.push(a.pelicula_id);
    }
    return ids;
  }

  // cerro el cartel, no se lo muestro mas
  async marcarAvisada(peliculaId: number) {
    const { error } = await this.sb
      .from('alertas')
      .update({ avisada: true })
      .eq('pelicula_id', peliculaId);
    if (error) throw error;
  }
}