import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditTestsuiteComponent } from './edit-testsuite.component';

describe('EditTestsuiteComponent', () => {
  let component: EditTestsuiteComponent;
  let fixture: ComponentFixture<EditTestsuiteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditTestsuiteComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditTestsuiteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
