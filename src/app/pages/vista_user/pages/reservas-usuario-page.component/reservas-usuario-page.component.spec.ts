import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservasUsuarioPageComponent } from './reservas-usuario-page.component';

describe('ReservasUsuarioPageComponent', () => {
  let component: ReservasUsuarioPageComponent;
  let fixture: ComponentFixture<ReservasUsuarioPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReservasUsuarioPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ReservasUsuarioPageComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
