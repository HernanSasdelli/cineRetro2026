import { Directive, TemplateRef, ViewContainerRef, effect, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

// muestra el elemento solo si el usuario logueado es admin
@Directive({ selector: '[appSoloAdmin]' })
export class SoloAdmin {
  private template = inject(TemplateRef);         // el elemento envuelto en <ng-template>
  private contenedor = inject(ViewContainerRef);  // el lugar del DOM donde se pinta
  private auth = inject(AuthService);

  constructor() {
    // se vuelve a ejecutar sola cada vez que cambia el rol
    effect(() => {
      this.contenedor.clear();
      if (this.auth.rol() === 'admin') {
        this.contenedor.createEmbeddedView(this.template);
      }
    });
  }
}