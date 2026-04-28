import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsuarioPageComponent } from './usuario-page.component';

describe('UsuarioPageComponent', () => {
  let component: UsuarioPageComponent;
  let fixture: ComponentFixture<UsuarioPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsuarioPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UsuarioPageComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
