import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LivelogDialogComponent } from './livelog-dialog.component';

describe('LivelogDialogComponent', () => {
  let component: LivelogDialogComponent;
  let fixture: ComponentFixture<LivelogDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LivelogDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LivelogDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
