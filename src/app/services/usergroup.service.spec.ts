import { TestBed } from '@angular/core/testing';

import { UsergroupService } from './usergroup.service';

describe('UsergroupService', () => {
  let service: UsergroupService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UsergroupService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
