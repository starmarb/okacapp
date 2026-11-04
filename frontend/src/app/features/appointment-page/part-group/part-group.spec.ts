import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PartInstanceWithPartOut, PartOut } from '@app/api/models';
import { PartGroup, PartUsageGroup } from './part-group';

const part: PartOut = {
  id: 7,
  brand: 'Bosch',
  name: 'Brake Pad',
  model_number: 'BP-100',
  warranty: '12 months',
};

const group: PartUsageGroup = {
  part,
  instances: [
    { id: 1, part, appointment: 1, serial_number: 'SN-0001' },
    { id: 2, part, appointment: 1, serial_number: '' } satisfies PartInstanceWithPartOut,
  ],
};

describe('PartGroup', () => {
  let component: PartGroup;
  let fixture: ComponentFixture<PartGroup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PartGroup],
    }).compileComponents();

    fixture = TestBed.createComponent(PartGroup);
    fixture.componentRef.setInput('group', group);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders the part details and one entry per instance', () => {
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(text).toContain('Brake Pad');
    expect(text).toContain('Bosch');
    expect(text).toContain('BP-100');
    expect(text).toContain('SN-0001');
    expect(text).toContain('No serial');
  });
});
