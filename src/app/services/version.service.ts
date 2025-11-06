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
import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class VersionService {

  /**
   * Constructor for VersionService.
   * @param http HttpClient for HTTP requests
   * @param authService AuthService for authentication and API token
   * @param config Application configuration injected as APP_CONFIG
   */
  constructor(
    private http: HttpClient,
    private authService: AuthService,
    @Inject('APP_CONFIG') private config: any
  ) {}

  /**
   * Gets the TDK Backend Service version.
   * @returns Observable with the TDK Backend Service version.
   */
  getTDKBackendVersion(): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    return this.http.get(`${this.config.apiUrl}api/v1/version/getTDKServiceVersion`, { headers });
  }

  /**
   * Gets the TDK Core version.
   * @returns Observable with the TDK Core version.
   */
  getTDKCoreVersion(): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    return this.http.get(`${this.config.apiUrl}api/v1/version/getTdkCoreVersion`, { headers });
  }

  /**
   * Gets the TDK Video version.
   * @returns Observable with the TDK Video version.
   */
  getTDKVideoVersion(): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    return this.http.get(`${this.config.apiUrl}api/v1/version/getTdkCoreVersion`, { headers });
  }

  /**
   * Gets the TDK Broadband version.
   * @returns Observable with the TDK Broadband version.
   */
  getTDKBroadbandVersion(): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    return this.http.get(`${this.config.apiUrl}api/v1/version/getTdkBroadbandScriptVersion`, { headers });
  }

  /**
   * Gets the TDK Frontend App version from config.json.
   * @returns Observable with the frontend version from config.
   */
  getTDKFrontendVersion(): Observable<any> {
    return this.http.get('/assets/config.json');
  }

  /**
   * Gets all version information in a single call.
   * @returns Object with all version observables.
   */
  getAllVersions() {
    return {
      backend: this.getTDKBackendVersion(),
      frontend: this.getTDKFrontendVersion(),
      core: this.getTDKCoreVersion(),
      video: this.getTDKVideoVersion(),
      broadband: this.getTDKBroadbandVersion()
    };
  }
}