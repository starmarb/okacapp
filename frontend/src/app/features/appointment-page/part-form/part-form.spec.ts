import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PartForm } from './part-form';

describe('PartForm', () => {
  let component: PartForm;
  let fixture: ComponentFixture<PartForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PartForm],
    }).compileComponents();

    fixture = TestBed.createComponent(PartForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
