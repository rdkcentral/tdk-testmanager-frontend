import { TestBed } from '@angular/core/testing';
import { PrimitiveTestService } from './primitive-test.service';



describe('PrimitiveTestService', () => {
  let service: PrimitiveTestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PrimitiveTestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
