import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditSocComponent } from './edit-soc.component';

describe('EditSocComponent', () => {
  let component: EditSocComponent;
  let fixture: ComponentFixture<EditSocComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditSocComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditSocComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
