import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CuponesService } from '../../../core/services/cupones.service';
import { ConCambios } from '../../../core/guards/cambios.guard';

// form para crear un cupon, en su propia pantalla como el de peliculas
@Component({
  selector: 'app-cupon-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './cupon-form.html',
  styleUrl: './cupon-form.scss',
})
export class CuponForm implements ConCambios {
  private fb = inject(FormBuilder);
  private cuponesService = inject(CuponesService);
  private router = inject(Router);

  error = signal('');
  guardando = signal(false);

  form = this.fb.group({
    nombre: ['', Validators.required],
    porcentaje: [10, [Validators.required, Validators.min(1), Validators.max(100)]],
    solo_primera_compra: [false],
    edad_minima: [null as number | null, [Validators.min(1), Validators.max(120)]],
  });

  // lo pregunta el cambiosGuard al salir
  tieneCambios() {
    return this.form.dirty;
  }

  async crear() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.error.set('');
    this.guardando.set(true);
    const v = this.form.value;
    try {
      await this.cuponesService.crear({
        nombre: v.nombre ?? '',
        porcentaje: Number(v.porcentaje),
        solo_primera_compra: v.solo_primera_compra ?? false,
        edad_minima: v.edad_minima ? Number(v.edad_minima) : null,
      });
      this.form.markAsPristine();   // ya guarde, que el guard no pregunte
      this.router.navigate(['/admin/cupones']);
    } catch {
      this.error.set('No se pudo crear el cupón. Probá de nuevo.');
    } finally {
      this.guardando.set(false);
    }
  }
}