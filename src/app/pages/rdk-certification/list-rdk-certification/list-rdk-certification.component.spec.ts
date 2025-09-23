import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListRdkCertificationComponent } from './list-rdk-certification.component';

describe('ListRdkCertificationComponent', () => {
  let component: ListRdkCertificationComponent;
  let fixture: ComponentFixture<ListRdkCertificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListRdkCertificationComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ListRdkCertificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
