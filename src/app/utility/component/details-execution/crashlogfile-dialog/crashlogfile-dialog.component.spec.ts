import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrashlogfileDialogComponent } from './crashlogfile-dialog.component';

describe('CrashlogfileDialogComponent', () => {
  let component: CrashlogfileDialogComponent;
  let fixture: ComponentFixture<CrashlogfileDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrashlogfileDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CrashlogfileDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
