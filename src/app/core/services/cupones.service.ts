import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Cupon } from '../models/compra';

// cupones de descuento. solo el admin los puede cambiar, eso lo controla la RLS
@Injectable({ providedIn: 'root' })
export class CuponesService {
  private sb = inject(SupabaseService).client;

  // todos, activos e inactivos
  async listar(): Promise<Cupon[]> {
    const { data, error } = await this.sb.from('cupones').select('*').order('id');
    if (error) throw error;
    return data;
  }

  // el id lo pone la base y nace activo
  async crear(cupon: Omit<Cupon, 'id' | 'activo'>) {
    const { error } = await this.sb.from('cupones').insert(cupon);
    if (error) throw error;
  }

  async cambiarPorcentaje(id: number, porcentaje: number) {
    const { error } = await this.sb.from('cupones').update({ porcentaje }).eq('id', id);
    if (error) throw error;
  }

  // no se borran, se apagan, asi los pedidos viejos siguen estando.
  async cambiarActivo(id: number, activo: boolean) {
    const { error } = await this.sb.from('cupones').update({ activo }).eq('id', id);
    if (error) throw error;
  }
}