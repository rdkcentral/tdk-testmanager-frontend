import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateRdkCertificationComponent } from './create-rdk-certification.component';

describe('CreateRdkCertificationComponent', () => {
  let component: CreateRdkCertificationComponent;
  let fixture: ComponentFixture<CreateRdkCertificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateRdkCertificationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreateRdkCertificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
