import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomTestsuiteComponent } from './custom-testsuite.component';

describe('CustomTestsuiteComponent', () => {
  let component: CustomTestsuiteComponent;
  let fixture: ComponentFixture<CustomTestsuiteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomTestsuiteComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CustomTestsuiteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
