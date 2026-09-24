import { Component, inject } from '@angular/core';
import { DatePipe, UpperCasePipe } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-perfil',
  imports: [DatePipe, UpperCasePipe],
  templateUrl: './perfil.html',
  styleUrl: './perfil.scss',
})
export class Perfil {
  auth = inject(AuthService);
}
