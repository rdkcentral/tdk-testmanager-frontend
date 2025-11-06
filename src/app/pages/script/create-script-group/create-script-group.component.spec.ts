import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateScriptGroupComponent } from './create-script-group.component';

describe('CreateScriptGroupComponent', () => {
  let component: CreateScriptGroupComponent;
  let fixture: ComponentFixture<CreateScriptGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateScriptGroupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreateScriptGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
