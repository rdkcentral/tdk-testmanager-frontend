import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScriptListComponent } from './script-list.component';

describe('ScriptListComponent', () => {
  let component: ScriptListComponent;
  let fixture: ComponentFixture<ScriptListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScriptListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ScriptListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
