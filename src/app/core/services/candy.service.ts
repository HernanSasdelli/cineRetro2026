import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Producto } from '../models/candy';

// productos y combos del candy. solo el admin los cambia (RLS)
@Injectable({ providedIn: 'root' })
export class CandyService {
  private sb = inject(SupabaseService).client;

  // todos, para el admin
  async listar(): Promise<Producto[]> {
    const { data, error } = await this.sb.from('productos').select('*').order('tipo').order('nombre');
    if (error) throw error;
    return data;
  }

  // solo los activos, para la compra y la cartelera
  async activos(): Promise<Producto[]> {
    const { data, error } = await this.sb.from('productos').select('*').eq('activo', true).order('nombre');
    if (error) throw error;
    return data;
  }

  async crear(producto: Omit<Producto, 'id' | 'activo'>) {
    const { error } = await this.sb.from('productos').insert(producto);
    if (error) throw error;
  }

  async cambiarPrecio(id: number, precio: number) {
    const { error } = await this.sb.from('productos').update({ precio }).eq('id', id);
    if (error) throw error;
  }

  // no se borran, se apagan
  async cambiarActivo(id: number, activo: boolean) {
    const { error } = await this.sb.from('productos').update({ activo }).eq('id', id);
    if (error) throw error;
  }

    // ids de los 2 combos mas pedidos, lo cuenta la base
  async combosMasPedidos(): Promise<number[]> {
    const { data, error } = await this.sb.rpc('combos_mas_pedidos');
    if (error) throw error;
    return data;
  }

  // los 2 combos mas nuevos, para cuando todavia no se vendio ninguno
  async combosNuevos(): Promise<Producto[]> {
    const { data, error } = await this.sb
      .from('productos')
      .select('*')
      .eq('tipo', 'combo')
      .eq('activo', true)
      .order('creado_en', { ascending: false })
      .limit(2);
    if (error) throw error;
    return data;
  }
}