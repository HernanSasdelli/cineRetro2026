import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Pedido, Descuento} from '../models/compra';

// todo lo de comprar entradas. es el unico que toca pedidos y entradas
@Injectable({ providedIn: 'root' })
export class ComprasService {
  private sb = inject(SupabaseService).client;

  // butacas ya vendidas de una funcion, como texto 'F12' (fila + numero)
  // asi despues pregunto ocupadas.includes('F12') para pintarla gris
  async ocupadas(funcionId: number): Promise<string[]> {
    const { data, error } = await this.sb
      .from('entradas')
      .select('fila, numero')
      .eq('funcion_id', funcionId);
    if (error) throw error;

    const lista: string[] = [];
    for (const e of data) {
      lista.push(e.fila + e.numero);
    }
    return lista;
  }

  // COMPRAR
  // no inserto yo en las tablas: la RLS no me deja (no hay policy de insert)
  // llamo a la funcion comprar de la base con rpc (como llamar un procedimiento almacenado)
  // la base calcula el precio (VIP +50%) y crea pedido + entradas todo junto o nada, al reces que el de crear funcion
  // si una butaca ya estaba vendida tira error 23505 y no se crea ninguna
  // devuelve el codigo del pedido, que es lo que va en el QR
  /*async comprar(funcionId: number, butacas: string[], email: string): Promise<string> {
    const { data, error } = await this.sb.rpc('comprar', {
      p_funcion_id: funcionId,
      p_butacas: butacas,
      p_email: email,
    });
    if (error) throw error;
    return data;
  }*/

    //--COMPRA NUEVA CON CANDY AGREGADO
      // compra: la base calcula todo. el candy va como [{ id, cantidad }], el precio lo pone la base
  async comprar(funcionId: number, butacas: string[], email: string,
                items: { id: number; cantidad: number }[]): Promise<string> {
    const { data, error } = await this.sb.rpc('comprar', {
      p_funcion_id: funcionId,
      p_butacas: butacas,
      p_email: email,
      p_items: items,
    });
    if (error) throw error;
    return data;
  }


    // trae una compra por su codigo. si no existe, la base devuelve null
  async verPedido(codigo: string): Promise<Pedido> {
    const { data, error } = await this.sb.rpc('ver_pedido', { p_codigo: codigo });
    if (error) throw error;
    if (!data) throw new Error('No existe esa compra');
    return data;
  }
    // que descuento le toca al usuario logueado. null = ninguno (o compra sin cuenta)
  // es solo para MOSTRARLO: al comprar, la base lo vuelve a calcular y lo aplica
  async miDescuento(): Promise<Descuento | null> {
    const { data, error } = await this.sb.rpc('mi_descuento');
    if (error) throw error;
    return data;
  }

    // valida la entrada en la puerta. la base revisa todo: que sea personal, que no este usada, que sea de hoy
  async validar(codigo: string): Promise<Pedido> {
    const { data, error } = await this.sb.rpc('validar_entrada', { p_codigo: codigo });
    if (error) throw error;
    return data;
  }


    // busca por el codigo corto. solo el personal, si no la base devuelve vacio
  async verPedidoCorto(corto: string): Promise<Pedido> {
    const { data, error } = await this.sb.rpc('ver_pedido_corto', { p_corto: corto });
    if (error) throw error;
    if (!data) throw new Error('No existe esa compra');
    return data;
  }
    // entrega el candy en el mostrador. la base revisa todo, igual que validar
  async entregarCandy(codigo: string): Promise<Pedido> {
    const { data, error } = await this.sb.rpc('entregar_candy', { p_codigo: codigo });
    if (error) throw error;
    return data;
  }
  
}