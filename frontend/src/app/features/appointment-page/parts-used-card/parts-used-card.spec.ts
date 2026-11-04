import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideApiConfiguration } from '@app/api/api-configuration';
import { PartInstanceWithPartOut, PartOut } from '@app/api/models';
import { PartsUsedCard } from './parts-used-card';

const part: PartOut = {
  id: 7,
  brand: 'Bosch',
  name: 'Brake Pad',
  model_number: 'BP-100',
  warranty: '',
};

const instances: PartInstanceWithPartOut[] = [
  { id: 1, part, appointment: 1, serial_number: 'SN-0001' },
  { id: 2, part, appointment: 1, serial_number: 'SN-0002' },
];

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

  it('groups returned instances by part', async () => {
    fixture.detectChanges();

    httpMock.expectOne('/api/appointments/1/part_instances').flush([...instances, ...instances]);
    await fixture.whenStable();

    expect(component.groups()).toHaveLength(1);
    expect(component.groups()[0].instances).toHaveLength(4);
  });
});
