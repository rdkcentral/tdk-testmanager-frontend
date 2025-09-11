import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TdkInstallComponent } from './tdk-install.component';

describe('TdkInstallComponent', () => {
  let component: TdkInstallComponent;
  let fixture: ComponentFixture<TdkInstallComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TdkInstallComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TdkInstallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
