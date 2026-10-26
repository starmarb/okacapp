import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppointmentCard } from './appointment-card';

describe('AppointmentCard', () => {
  let component: AppointmentCard;
  let fixture: ComponentFixture<AppointmentCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppointmentCard],
    }).compileComponents();

    fixture = TestBed.createComponent(AppointmentCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
