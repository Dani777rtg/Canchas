import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservasAdminPageComponent } from './reservas-admin-page.component';

describe('ReservasAdminPageComponent', () => {
  let component: ReservasAdminPageComponent;
  let fixture: ComponentFixture<ReservasAdminPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReservasAdminPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ReservasAdminPageComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
