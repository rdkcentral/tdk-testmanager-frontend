import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalyzeDialogComponent } from './analyze-dialog.component';

describe('AnalyzeDialogComponent', () => {
  let component: AnalyzeDialogComponent;
  let fixture: ComponentFixture<AnalyzeDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnalyzeDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AnalyzeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
