import { TestBed } from '@angular/core/testing';

import { WowApiService } from './wow-api.service';

describe('WowApiService', () => {
  let service: WowApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WowApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
