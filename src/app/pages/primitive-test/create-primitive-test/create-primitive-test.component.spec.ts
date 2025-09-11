import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatePrimitiveTestComponent } from './create-primitive-test.component';

describe('CreatePrimitiveTestComponent', () => {
  let component: CreatePrimitiveTestComponent;
  let fixture: ComponentFixture<CreatePrimitiveTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreatePrimitiveTestComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreatePrimitiveTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
