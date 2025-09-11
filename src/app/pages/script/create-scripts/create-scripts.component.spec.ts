import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateScriptsComponent } from './create-scripts.component';

describe('CreateScriptsComponent', () => {
  let component: CreateScriptsComponent;
  let fixture: ComponentFixture<CreateScriptsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateScriptsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreateScriptsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
