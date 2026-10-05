import { Component, input, output } from '@angular/core';

// CARTEL REUTILIZABLE
// que necesito: un cartel con titulo, contenido y botones, que sirva para cualquier pantalla
// como lo resuelvo:
//  - input()  → el padre me pasa el titulo y el texto de los botones 
//  - output() → le aviso al padre que tocaron confirmar o cancelar
//  - <ng-content> → el padre mete adentro su propio contenido 
// el cartel NO decide nada: solo muestra y avisa. lo que pasa despues lo decide el padre
// para mostrarlo o esconderlo, el padre lo envuelve en un @if
@Component({
  selector: 'app-modal',
  imports: [],
  templateUrl: './modal.html',
  styleUrl: './modal.scss',
})
export class Modal {
  titulo = input.required<string>();
  textoConfirmar = input('Aceptar');   // si el padre no lo pasa, dice "Aceptar"
  textoCancelar = input('');           // vacio = no hay boton de cancelar
  ocupado = input(false);              // true = botones apagados (mientras guarda algo)

  confirmar = output<void>();   // el padre escucha (confirmar)="..."
  cancelar = output<void>();    // el padre escucha (cancelar)="..."
}