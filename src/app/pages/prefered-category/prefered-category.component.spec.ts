import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreferedCategoryComponent } from './prefered-category.component';

describe('PreferedCategoryComponent', () => {
  let component: PreferedCategoryComponent;
  let fixture: ComponentFixture<PreferedCategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreferedCategoryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PreferedCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
