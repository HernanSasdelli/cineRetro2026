import { Injectable, computed, inject, signal } from '@angular/core';
import { User } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';
import { Perfil, RegistroDatos } from '../models/perfil';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private sb = inject(SupabaseService).client;

  readonly usuario = signal<User | null>(null);
  readonly perfil = signal<Perfil | null>(null);
  readonly logueado = computed(() => this.usuario() !== null);
  readonly rol = computed(() => this.perfil()?.rol ?? null);

  // los guards esperan esto. sin esto el F5 te manda al login
  readonly listo: Promise<void>;

  constructor() {
    this.listo = this.cargarSesion();

    // ojo: no llamar a supabase adentro de este callback, se traba
    this.sb.auth.onAuthStateChange((evento, sesion) => {
      this.usuario.set(sesion?.user ?? null);
      if (evento === 'SIGNED_OUT') this.perfil.set(null);
    });
  }

  private async cargarSesion() {
    const { data } = await this.sb.auth.getSession();
    const user = data.session?.user ?? null;
    this.usuario.set(user);
    if (user) await this.cargarPerfil(user.id);
  }

  private async cargarPerfil(id: string) {
    const { data } = await this.sb.from('perfiles').select('*').eq('id', id).single();
    this.perfil.set(data as Perfil | null);
  }

  async login(email: string, password: string) {
    const { data, error } = await this.sb.auth.signInWithPassword({ email, password });
    if (error) throw error;
    this.usuario.set(data.user);
    await this.cargarPerfil(data.user.id);
  }

  async registro(datos: RegistroDatos) {
    const { email, password, ...resto } = datos;
    // resto viaja como metadata y el trigger arma el perfil
    const { data, error } = await this.sb.auth.signUp({
      email,
      password,
      options: { data: resto },
    });
    if (error) throw error;
    if (data.user && data.session) {
      this.usuario.set(data.user);
      await this.cargarPerfil(data.user.id);
    }
  }

  async logout() {
    await this.sb.auth.signOut();
  }
}
