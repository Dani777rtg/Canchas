import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CanchasPageComponent } from './canchas-page.component';

describe('CanchasPageComponent', () => {
  let component: CanchasPageComponent;
  let fixture: ComponentFixture<CanchasPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CanchasPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CanchasPageComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
