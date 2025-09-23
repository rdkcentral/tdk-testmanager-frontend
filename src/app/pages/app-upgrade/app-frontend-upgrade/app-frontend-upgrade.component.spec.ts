import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppFrontendUpgradeComponent } from './app-frontend-upgrade.component';

describe('AppFrontendUpgradeComponent', () => {
  let component: AppFrontendUpgradeComponent;
  let fixture: ComponentFixture<AppFrontendUpgradeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppFrontendUpgradeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AppFrontendUpgradeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
