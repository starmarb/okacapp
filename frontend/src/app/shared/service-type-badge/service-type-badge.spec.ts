import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ServiceTypeBadge } from './service-type-badge';

describe('ServiceTypeBadge', () => {
  let fixture: ComponentFixture<ServiceTypeBadge>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ServiceTypeBadge] }).compileComponents();

    fixture = TestBed.createComponent(ServiceTypeBadge);
    fixture.componentRef.setInput('service_type', 'REPAIR');
    fixture.detectChanges();
  });

  it('renders the service type label and attribute', () => {
    const badge = fixture.nativeElement.querySelector('.service-type-badge') as HTMLElement;
    expect(badge.textContent?.trim()).toBe('Repair');
    expect(badge.dataset['serviceType']).toBe('REPAIR');
  });
});
