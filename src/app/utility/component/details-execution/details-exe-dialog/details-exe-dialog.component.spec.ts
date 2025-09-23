import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsExeDialogComponent } from './details-exe-dialog.component';

describe('DetailsExeDialogComponent', () => {
  let component: DetailsExeDialogComponent;
  let fixture: ComponentFixture<DetailsExeDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailsExeDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DetailsExeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
