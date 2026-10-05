import { Component ,inject} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './layout/header/header';

import { ConfirmacionService } from './core/services/confirmacion.service';
import { Modal } from './shared/components/modal/modal';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Modal],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {


    // el cartel de "cambios sin guardar" vive aca, una sola vez para toda la app
  protected confirmacion = inject(ConfirmacionService);
}
