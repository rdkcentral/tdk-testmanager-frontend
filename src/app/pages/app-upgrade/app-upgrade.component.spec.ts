import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppUpgradeComponent } from './app-upgrade.component';

describe('AppUpgradeComponent', () => {
  let component: AppUpgradeComponent;
  let fixture: ComponentFixture<AppUpgradeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppUpgradeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AppUpgradeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
