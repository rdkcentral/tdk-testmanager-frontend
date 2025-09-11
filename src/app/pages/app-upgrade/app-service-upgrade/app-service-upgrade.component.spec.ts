import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppServiceUpgradeComponent } from './app-service-upgrade.component';

describe('AppServiceUpgradeComponent', () => {
  let component: AppServiceUpgradeComponent;
  let fixture: ComponentFixture<AppServiceUpgradeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppServiceUpgradeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AppServiceUpgradeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
