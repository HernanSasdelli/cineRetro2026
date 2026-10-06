import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { clavesIguales } from '../../../shared/validators/claves';

// llega desde el link del mail. supabase ya lo dejo entrar con ese link, aca elige la nueva
@Component({
  selector: 'app-nueva-clave',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './nueva-clave.html',
  styleUrl: './nueva-clave.scss',
})
export class NuevaClave {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);

  mensaje = signal('');
  error = signal('');
  guardando = signal(false);

  form = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(6)]],
    password2: ['', Validators.required],
  }, { validators: clavesIguales });

  async guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.guardando.set(true);
    this.error.set('');
    try {
      await this.auth.cambiarClave(this.form.value.password ?? '');
      this.mensaje.set('Listo, ya cambiaste tu contraseña.');
    } catch {
      this.error.set('El link venció o ya se usó. Pedí uno nuevo.');
    } finally {
      this.guardando.set(false);
    }
  }
}