import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilaProductos } from './fila-productos';

describe('FilaProductos', () => {
  let component: FilaProductos;
  let fixture: ComponentFixture<FilaProductos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilaProductos],
    }).compileComponents();

    fixture = TestBed.createComponent(FilaProductos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
