import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppointmentPartOut } from '@app/api/models';
import { PartGroup } from './part-group';

const usage: AppointmentPartOut = {
  id: 1,
  appointment: 1,
  quantity: 2,
  serial_numbers: ['SN-0001', 'SN-0002'],
  part: {
    id: 7,
    brand: 'Bosch',
    name: 'Brake Pad',
    model_number: 'BP-100',
    warranty: '12 months',
  },
};

describe('PartGroup', () => {
  let component: PartGroup;
  let fixture: ComponentFixture<PartGroup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PartGroup],
    }).compileComponents();

    fixture = TestBed.createComponent(PartGroup);
    fixture.componentRef.setInput('usage', usage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders the part details, quantity and serials', () => {
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(text).toContain('Brake Pad');
    expect(text).toContain('Bosch');
    expect(text).toContain('BP-100');
    expect(text).toContain('×2');
    expect(text).toContain('SN-0001');
    expect(text).toContain('SN-0002');
  });
});
