/*
* If not stated otherwise in this file or this component's Licenses.txt file the
* following copyright and licenses apply:
*
* Copyright 2024 RDK Management
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
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';

/**
 * AppUpgradeService
 * -------------------------------------------------
 * This service provides methods for uploading WAR/build files, triggering backend/frontend upgrades,
 * checking backend health, and fetching deployment logs for both backend and frontend upgrade processes.
 * It communicates with both Java (Spring Boot) and Node.js backend APIs.
 */
@Injectable({
  providedIn: 'root',
})
export class AppUpgradeService {
  /**
   * Constructor: Injects HttpClient, AuthService, and app configuration.
   */
  constructor(
    private http: HttpClient,
    private authService: AuthService,
    @Inject('APP_CONFIG') private config: any
  ) {}

  /**
   * Uploads a WAR file to the backend for service upgrade.
   * @param file The WAR file to upload
   * @returns Observable of the upload progress and response
   */
  uploadWarFile(file: File): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: this.authService.getApiToken(),
    });
    const formData: FormData = new FormData();
    formData.append('uploadFile', file, file.name);

    return this.http.post(
      `${this.config.apiUrl}api/v1/app-upgrade/uploadWarFile`,
      formData,
      { headers, reportProgress: true, observe: 'events' }
    );
  }

  /**
   * Triggers the backend service upgrade process.
   * @param backupLocation The backup location for the upgrade
   * @param warLocation The uploaded WAR file location
   * @returns Observable of the upgrade response
   */
  upgradeServiceApplication(
    backupLocation: string,
    warLocation: string
  ): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: this.authService.getApiToken(),
    });
    return this.http.post(
      `${this.config.apiUrl}api/v1/app-upgrade/upgradeApplication?backupLocation=${backupLocation}&uploadLocation=${warLocation}`,
      { headers }
    );
  }

  /**
   * Checks if the backend service is upgraded and running by calling the health endpoint.
   * @returns Observable of the health check response
   */
  isBackendServiceUpgraded(): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: this.authService.getApiToken(),
    });
    return this.http.get(`${this.config.apiUrl}actuator/health`, { headers });
  }

  /**
   * Fetches deployment logs for the backend upgrade process.
   * @returns Observable containing deployment logs
   */
  getDeploymentLogs(): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: this.authService.getApiToken(),
    });
    return this.http.get(
      `${this.config.apiUrl}api/v1/app-upgrade/deploymentLogs`,
      { headers }
    );
  }

  /**
   * Uploads a build file (zip/tar.gz) for frontend upgrade.
   * @param file The build file to upload
   * @returns Observable of the upload progress and response
   */
  uploadBuildFile(file: File): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: this.authService.getApiToken(),
    });
    const formData: FormData = new FormData();
    formData.append('build', file, file.name);

    return this.http.post(
      `${this.config.nodeApiUrl}appupgrade/tdkUIUpgrade/uploadBuild`,
      formData,
      { headers, reportProgress: true, observe: 'events' }
    );
  }

  /**
   * Triggers the frontend application upgrade process.
   * @param uploadLocation The uploaded build file location
   * @returns Observable of the upgrade response
   */
  upgradeFrontendApplication(uploadLocation: string, backupLocation :String): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: this.authService.getApiToken(),
    });
    return this.http.post(
      `${this.config.nodeApiUrl}appupgrade/tdkUIUpgrade/upgradeApplication?backupPath=${backupLocation}&uploadLocation=${uploadLocation}`,
      { headers }
    );
  }

  /**
   * Fetches deployment logs for the frontend upgrade process.
   * @param deploymentLogPath The path to the deployment log file
   * @returns Observable containing frontend deployment logs
   */
  getFrontEndDeploymentLogs(deploymentLogPath: String): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: this.authService.getApiToken(),
    });
    return this.http.get(
      `${this.config.nodeApiUrl}appupgrade/tdkUIUpgrade/deploymentLog?path=${deploymentLogPath}`,
      { headers }
    );
  }
}
