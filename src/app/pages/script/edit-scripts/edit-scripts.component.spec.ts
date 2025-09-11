import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditScriptsComponent } from './edit-scripts.component';

describe('EditScriptsComponent', () => {
  let component: EditScriptsComponent;
  let fixture: ComponentFixture<EditScriptsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditScriptsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditScriptsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
