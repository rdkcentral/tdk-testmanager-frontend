import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModulesEditComponent } from './modules-edit.component';

describe('ModulesEditComponent', () => {
  let component: ModulesEditComponent;
  let fixture: ComponentFixture<ModulesEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModulesEditComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModulesEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
