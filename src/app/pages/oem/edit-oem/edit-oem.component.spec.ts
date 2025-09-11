import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditOemComponent } from './edit-oem.component';

describe('EditOemComponent', () => {
  let component: EditOemComponent;
  let fixture: ComponentFixture<EditOemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditOemComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditOemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
