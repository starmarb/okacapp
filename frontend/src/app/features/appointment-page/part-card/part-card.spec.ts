import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PartCard } from './part-card';

describe('PartCard', () => {
  let component: PartCard;
  let fixture: ComponentFixture<PartCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PartCard],
    }).compileComponents();

    fixture = TestBed.createComponent(PartCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
