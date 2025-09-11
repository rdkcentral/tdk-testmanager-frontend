import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateJiraComponent } from './update-jira.component';

describe('UpdateJiraComponent', () => {
  let component: UpdateJiraComponent;
  let fixture: ComponentFixture<UpdateJiraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateJiraComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UpdateJiraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
