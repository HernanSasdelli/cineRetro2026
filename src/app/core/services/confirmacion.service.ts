import { Injectable, signal } from '@angular/core';

// CARTEL DE CONFIRMACION GLOBAL (para el cambiosGuard)
// problema: el guard es una funcion, no tiene html donde poner un <app-modal>
// solucion: el guard le pide a este servicio que pregunte, y espera la respuesta (una promesa)
// el cartel vive una sola vez en app.html y lee la señal "pregunta" de este servicio
// en C# seria como un TaskCompletionSource: creo una tarea que se completa cuando el usuario contesta
@Injectable({ providedIn: 'root' })
export class ConfirmacionService {
  pregunta = signal('');   // el texto del cartel. vacio = cartel cerrado

  // aca guardo "a quien avisarle" cuando el usuario conteste
  private responder: ((si: boolean) => void) | null = null;

  // abre el cartel y devuelve una promesa que se cumple cuando tocan un boton
  preguntar(texto: string): Promise<boolean> {
    this.pregunta.set(texto);
    return new Promise(resolve => {
      this.responder = resolve;   // me guardo la forma de cumplir la promesa, para despues
    });
  }

  // lo llaman los botones del cartel: true = Salir, false = Quedarme
  contestar(si: boolean) {
    this.pregunta.set('');        // cierro el cartel
    if (this.responder) {
      this.responder(si);         // cumplo la promesa: el guard recibe la respuesta
    }
    this.responder = null;
  }
}