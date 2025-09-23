import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FunctionCreateComponent } from './function-create.component';

describe('FunctionCreateComponent', () => {
  let component: FunctionCreateComponent;
  let fixture: ComponentFixture<FunctionCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FunctionCreateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FunctionCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
