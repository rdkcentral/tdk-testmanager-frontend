import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComparisonModalComponent } from './comparison-modal.component';

describe('ComparisonModalComponent', () => {
  let component: ComparisonModalComponent;
  let fixture: ComponentFixture<ComparisonModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComparisonModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ComparisonModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
