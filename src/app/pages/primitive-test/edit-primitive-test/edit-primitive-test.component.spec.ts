import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditPrimitiveTestComponent } from './edit-primitive-test.component';

describe('EditPrimitiveTestComponent', () => {
  let component: EditPrimitiveTestComponent;
  let fixture: ComponentFixture<EditPrimitiveTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditPrimitiveTestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditPrimitiveTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
