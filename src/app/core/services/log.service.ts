import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { LogItem } from '../models/log';

// log de actividad. lo escriben los triggers de la base, nadie escribe desde aca
// la tabla no tiene policy de insert justamente por eso
@Injectable({ providedIn: 'root' })
export class LogService {
  private sb = inject(SupabaseService).client;

  async ver(limite = 200): Promise<LogItem[]> {
    const { data, error } = await this.sb.rpc('ver_log', { p_limite: limite });
    if (error) throw error;
    return data as LogItem[];
  }
}