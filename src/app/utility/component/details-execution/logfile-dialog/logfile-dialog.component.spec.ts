import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogfileDialogComponent } from './logfile-dialog.component';

describe('LogfileDialogComponent', () => {
  let component: LogfileDialogComponent;
  let fixture: ComponentFixture<LogfileDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LogfileDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LogfileDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
