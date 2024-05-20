import { TestBed } from '@angular/core/testing';

import { RootFinderService } from './root-finder.service';

describe('PipeFrictionService', () => {
  let service: RootFinderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RootFinderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
