import { TestBed } from '@angular/core/testing';

import { DevicetypeService } from './devicetype.service';

describe('DevicetypeService', () => {
  let service: DevicetypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DevicetypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
