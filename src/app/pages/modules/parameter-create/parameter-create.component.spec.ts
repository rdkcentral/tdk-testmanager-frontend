import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParameterCreateComponent } from './parameter-create.component';

describe('ParameterCreateComponent', () => {
  let component: ParameterCreateComponent;
  let fixture: ComponentFixture<ParameterCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParameterCreateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ParameterCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
