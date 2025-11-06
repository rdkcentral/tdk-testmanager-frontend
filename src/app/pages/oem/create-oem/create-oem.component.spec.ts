import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateOemComponent } from './create-oem.component';

describe('CreateOemComponent', () => {
  let component: CreateOemComponent;
  let fixture: ComponentFixture<CreateOemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateOemComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreateOemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
