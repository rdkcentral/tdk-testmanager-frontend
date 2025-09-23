import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListPrimitiveTestComponent } from './list-primitive-test.component';

describe('ListPrimitiveTestComponent', () => {
  let component: ListPrimitiveTestComponent;
  let fixture: ComponentFixture<ListPrimitiveTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListPrimitiveTestComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ListPrimitiveTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
