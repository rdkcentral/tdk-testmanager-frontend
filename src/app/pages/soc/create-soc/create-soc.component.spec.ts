import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateSocComponent } from './create-soc.component';

describe('CreateSocComponent', () => {
  let component: CreateSocComponent;
  let fixture: ComponentFixture<CreateSocComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateSocComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreateSocComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
