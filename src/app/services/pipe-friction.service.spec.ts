import { TestBed } from '@angular/core/testing';

import { PipeFrictionService } from './pipe-friction.service';

describe('PipeFrictionService', () => {
  let service: PipeFrictionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PipeFrictionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
