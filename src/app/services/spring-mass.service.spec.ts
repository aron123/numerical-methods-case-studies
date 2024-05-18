import { TestBed } from '@angular/core/testing';

import { SpringMassService } from './spring-mass.service';

describe('SpringMassService', () => {
  let service: SpringMassService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SpringMassService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
