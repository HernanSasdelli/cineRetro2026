import { Pipe, PipeTransform } from '@angular/core';

// 4 queda ★★★★☆
@Pipe({ name: 'estrellas' })
export class EstrellasPipe implements PipeTransform {
  transform(n: number): string {
    let texto = '';
    for (let i = 1; i <= 5; i++) {
      texto += i <= n ? '★' : '☆';
    }
    return texto;
  }
}