import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearCanchaPageComponent } from './crear-cancha-page.component';

describe('CrearCanchaPageComponent', () => {
  let component: CrearCanchaPageComponent;
  let fixture: ComponentFixture<CrearCanchaPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearCanchaPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CrearCanchaPageComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
