import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListOemComponent } from './list-oem.component';

describe('ListOemComponent', () => {
  let component: ListOemComponent;
  let fixture: ComponentFixture<ListOemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListOemComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ListOemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
