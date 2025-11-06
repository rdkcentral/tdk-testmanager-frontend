import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateJiraComponent } from './create-jira.component';

describe('CreateJiraComponent', () => {
  let component: CreateJiraComponent;
  let fixture: ComponentFixture<CreateJiraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateJiraComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreateJiraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
