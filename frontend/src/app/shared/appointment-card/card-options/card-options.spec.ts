import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CardOptions } from './card-options';

describe('CardOptions', () => {
  let component: CardOptions;
  let fixture: ComponentFixture<CardOptions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardOptions],
    }).compileComponents();

    fixture = TestBed.createComponent(CardOptions);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
