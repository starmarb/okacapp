import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppointmentPage } from './appointment-page';

describe('AppointmentPage', () => {
  let component: AppointmentPage;
  let fixture: ComponentFixture<AppointmentPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppointmentPage],
    }).compileComponents();

    fixture = TestBed.createComponent(AppointmentPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
