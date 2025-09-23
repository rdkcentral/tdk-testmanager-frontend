import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditRdkCertificationComponent } from './edit-rdk-certification.component';

describe('EditRdkCertificationComponent', () => {
  let component: EditRdkCertificationComponent;
  let fixture: ComponentFixture<EditRdkCertificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditRdkCertificationComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(EditRdkCertificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
