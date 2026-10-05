import { Directive, TemplateRef, ViewContainerRef, effect, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

// muestra el elemento solo si el usuario logueado es admin
@Directive({ selector: '[appSoloAdmin]' }) //que es? directiva, donde se usa? en el admin


export class SoloAdmin {


  //que necesito
  //lo que quiero mostrar(el template)
  private template = inject(TemplateRef);   

  //en donde lo quiero mostrar 
  private contenedor = inject(ViewContainerRef);
  
  //a quien se lo quiero mostrar
  private auth = inject(AuthService);


  //constructor que crea la directiva, es una clase, se queda escuchando cambios en el dom, ES ADMIN? 

  constructor() {
    // se vuelve a ejecutar sola cada vez que cambia el rol
    effect(() => {
      this.contenedor.clear();//aca se limpia
      //y solo si el el rol es el admin te lo muestra
      if (this.auth.rol() === 'admin') {
        this.contenedor.createEmbeddedView(this.template);
      }
    });
  }
}