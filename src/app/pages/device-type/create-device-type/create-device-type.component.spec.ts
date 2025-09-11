import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateDeviceTypeComponent } from './create-device-type.component';

describe('CreateDeviceTypeComponent', () => {
  let component: CreateDeviceTypeComponent;
  let fixture: ComponentFixture<CreateDeviceTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateDeviceTypeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreateDeviceTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
