import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

function fechaValida(g: AbstractControl): ValidationErrors | null {
  const { dia, mes, anio } = g.value;
  if (!dia || !mes || !anio) return null; // de eso se encarga required

  const f = new Date(anio, mes - 1, dia);
  // new Date(2000, 1, 31) no tira error, se pasa a marzo. por eso comparo
  const existe = f.getFullYear() === anio && f.getMonth() === mes - 1 && f.getDate() === dia;
  if (!existe) return { fechaInvalida: true };
  if (f > new Date()) return { fechaFutura: true };
  return null;
}

@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './registro.html',
  styleUrl: './registro.scss',
})
export class Registro {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  tiposSangre = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', '0+', '0-'];
  coloresOjos = ['Marrón', 'Negro', 'Verde', 'Azul', 'Gris', 'Otro'];

  error = signal('');
  enviando = signal(false);

  form = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    nacimiento: this.fb.group(
      {
        dia: [null as number | null, [Validators.required, Validators.min(1), Validators.max(31)]],
        mes: [null as number | null, [Validators.required, Validators.min(1), Validators.max(12)]],
        anio: [null as number | null, [Validators.required, Validators.min(1900)]],
      },
      { validators: fechaValida },
    ),
    tipo_sangre: [''], // opcional, es dato sensible
    color_ojos: ['', Validators.required],
    dias_vacaciones: [0, [Validators.required, Validators.min(0), Validators.max(365)]],
  });

  get nac() {
    return this.form.controls.nacimiento;
  }

  elegir(campo: 'tipo_sangre' | 'color_ojos', valor: string) {
    const c = this.form.controls[campo];
    c.setValue(valor);
    c.markAsTouched();
  }

  async registrar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.enviando.set(true);
    this.error.set('');

    const { nacimiento, ...resto } = this.form.getRawValue();
    const dos = (n: number | null) => String(n).padStart(2, '0');
    const fecha_nacimiento = `${nacimiento.anio}-${dos(nacimiento.mes)}-${dos(nacimiento.dia)}`;

    try {
      await this.auth.registro({ ...resto, fecha_nacimiento });
      this.router.navigate(['/cartelera']);
    } catch (e: any) {
      console.error('error registro', e);
      this.error.set(
        e?.message?.includes('registered')
          ? 'Ese email ya tiene una cuenta. Ingresá desde "Ingresar".'
          : 'No se pudo crear la cuenta: ' + e?.message,
      );
    } finally {
      this.enviando.set(false);
    }
  }
}
