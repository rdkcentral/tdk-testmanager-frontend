import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListSocComponent } from './list-soc.component';

describe('ListSocComponent', () => {
  let component: ListSocComponent;
  let fixture: ComponentFixture<ListSocComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListSocComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ListSocComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
