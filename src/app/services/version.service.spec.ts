/*
* If not stated otherwise in this file or this component's LICENSE file the
* following copyright and licenses apply:
*
* Copyright 2025 RDK Management
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*
http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { VersionService } from './version.service';
import { AuthService } from '../auth/auth.service';

describe('VersionService', () => {
  let service: VersionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        VersionService,
        { provide: AuthService, useValue: { getApiToken: () => 'mock-token' } },
        { provide: 'APP_CONFIG', useValue: { apiUrl: 'http://localhost:8080/' } }
      ]
    });
    service = TestBed.inject(VersionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have getTDKBackendVersion method', () => {
    expect(service.getTDKBackendVersion).toBeDefined();
  });

  it('should have getTDKCoreVersion method', () => {
    expect(service.getTDKCoreVersion).toBeDefined();
  });

  it('should have getTDKVideoVersion method', () => {
    expect(service.getTDKVideoVersion).toBeDefined();
  });

  it('should have getTDKBroadbandVersion method', () => {
    expect(service.getTDKBroadbandVersion).toBeDefined();
  });

  it('should have getTDKFrontendVersion method', () => {
    expect(service.getTDKFrontendVersion).toBeDefined();
  });

  it('should have getAllVersions method', () => {
    expect(service.getAllVersions).toBeDefined();
  });
});