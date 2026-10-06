import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

// pide el mail y supabase le manda el link para cambiar la contraseña
@Component({
  selector: 'app-recuperar',
  imports: [RouterLink],
  templateUrl: './recuperar.html',
  styleUrl: './recuperar.scss',
})
export class Recuperar {
  private auth = inject(AuthService);

  email = signal('');
  mensaje = signal('');
  error = signal('');
  enviando = signal(false);

  escribirEmail(e: Event) {
    this.email.set((e.target as HTMLInputElement).value);
  }

  async enviar() {
    if (!this.email().includes('@')) {
      this.error.set('Escribí un mail válido.');
      return;
    }
    this.enviando.set(true);
    this.error.set('');
    try {
      await this.auth.recuperar(this.email());
      // no digo si el mail existe o no, asi nadie averigua quien tiene cuenta
      this.mensaje.set('Si ese mail tiene una cuenta, te mandamos un link para cambiar la contraseña.');
    } catch {
      this.error.set('No se pudo mandar el mail. Probá de nuevo en un rato.');
    } finally {
      this.enviando.set(false);
    }
  }
}