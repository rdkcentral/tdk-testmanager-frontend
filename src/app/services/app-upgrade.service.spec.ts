import { TestBed } from '@angular/core/testing';

import { AppUpgradeService } from './app-upgrade.service';

describe('AppUpgradeService', () => {
  let service: AppUpgradeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppUpgradeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
