import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideApiConfiguration } from '@app/api/api-configuration';
import { AppointmentPartOut } from '@app/api/models';
import { PartsUsedCard } from './parts-used-card';

const usage: AppointmentPartOut = {
  id: 1,
  appointment: 1,
  quantity: 3,
  serial_numbers: ['SN-0001'],
  part: {
    id: 7,
    brand: 'Bosch',
    name: 'Brake Pad',
    model_number: 'BP-100',
    warranty: '',
  },
};

describe('PartsUsedCard', () => {
  let component: PartsUsedCard;
  let fixture: ComponentFixture<PartsUsedCard>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PartsUsedCard],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideApiConfiguration('')],
    }).compileComponents();

    fixture = TestBed.createComponent(PartsUsedCard);
    fixture.componentRef.setInput('appointmentId', 1);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('lists the parts used and sums their quantity', async () => {
    fixture.detectChanges();

    httpMock.expectOne('/api/appointments/1/parts').flush([usage]);
    await fixture.whenStable();

    expect(component.parts.value()).toHaveLength(1);
    expect(component.totalQuantity()).toBe(3);
  });
});
