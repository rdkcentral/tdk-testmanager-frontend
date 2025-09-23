import { TestBed } from '@angular/core/testing';
import { SocService } from './soc.service';


describe('SocService', () => {
  let service: SocService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SocService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});