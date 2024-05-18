import { TestBed } from '@angular/core/testing';

import { LUDecompositionService } from './l-u-decomposition.service';

describe('LUDecompositionService', () => {
  let service: LUDecompositionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LUDecompositionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
