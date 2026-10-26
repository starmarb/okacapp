import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkDoneCard } from './work-done-card';

describe('WorkDoneCard', () => {
  let component: WorkDoneCard;
  let fixture: ComponentFixture<WorkDoneCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkDoneCard],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkDoneCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
