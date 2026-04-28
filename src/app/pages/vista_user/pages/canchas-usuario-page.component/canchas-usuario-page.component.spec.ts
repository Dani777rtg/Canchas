import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CanchasUsuarioPageComponent } from './canchas-usuario-page.component';

describe('CanchasUsuarioPageComponent', () => {
  let component: CanchasUsuarioPageComponent;
  let fixture: ComponentFixture<CanchasUsuarioPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CanchasUsuarioPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CanchasUsuarioPageComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
