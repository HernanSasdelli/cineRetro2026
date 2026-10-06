import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Reporte } from '../models/reporte';

// reporte del admin. la cuenta la hace la base con un group by
// la RLS no alcanza para esto, por eso la funcion chequea es_admin adentro
@Injectable({ providedIn: 'root' })
export class ReportesService {
  private sb = inject(SupabaseService).client;

  async ver(desde: string, hasta: string): Promise<Reporte> {
    const { data, error } = await this.sb.rpc('reporte', { p_desde: desde, p_hasta: hasta });
    if (error) throw error;
    return data as Reporte;
  }
}