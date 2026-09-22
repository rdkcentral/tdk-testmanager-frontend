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
import { Injectable,Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class PackageManagerService {

  /**
   * Constructor for PackageManagerService.
   * @param http HttpClient for HTTP requests
   * @param authService AuthService for authentication and API token
   * @param config Application configuration injected as APP_CONFIG
   */
  constructor(private http: HttpClient, private authService: AuthService,
    @Inject('APP_CONFIG') private config: any
  ) { }

  /**
   * Creates a package.
   * @param type The type of the package to create.
   * @param device The device for which the package is created.
   * @returns Observable of the HTTP response.
   */
  createPackage(type:string,device:string):Observable<any>{
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    return this.http.post(`${this.config.apiUrl}/api/v1/packagemanager/createPackageAPI?type=${type}&device=${device}`, {},{ headers })
  }

  /**
   * Gets the list of available packages.
   * @param type The type of package to fetch.
   * @param device The device for which the package is fetched.
   * @returns Observable of the HTTP response.
   */
  getPackageList(type:string,device:string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    return this.http.get(`${this.config.apiUrl}/api/v1/packagemanager/getAvailablePackages?type=${type}&device=${device}`, { headers });
  }

  /**
   * Starts an asynchronous package installation job on a specified device.
   * The backend responds immediately (HTTP 202) with a `jobId` that must be
   * polled via `getInstallStatus` to track progress and retrieve the result.
   * @param type The type of the package to be installed.
   * @param device The target device where the package will be installed.
   * @param packageName The name of the package to be installed.
   * @returns Observable that emits the job creation response `{ jobId, phase, status, result }`.
   */
  installPackages(type:string,device:string,packageName:string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
     const body = new URLSearchParams({ type, device, packageName });
    return this.http.post(`${this.config.apiUrl}api/v1/packagemanager/installPackage`, body.toString(), {
      headers: headers.set('Content-Type', 'application/x-www-form-urlencoded'),
    });
  }

  /**
   * Uploads a package to the server.
   * @param type The type of the package being uploaded.
   * @param device The target device for the package.
   * @param uploadFile The file to be uploaded.
   * @returns Observable that emits the server's response.
   */
  uploadPackage(type:string,device:string,uploadFile:File): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    const formData: FormData = new FormData();
    formData.append('uploadFile', uploadFile, uploadFile.name);

      return this.http.post(`${this.config.apiUrl}api/v1/packagemanager/uploadPackage?type=${type}&device=${device}`,formData, {
      headers,
      reportProgress: true,
      observe: 'events',
    });
  }

  /**
   * Uploads a generic package to the server.
   * @param type The type of the package being uploaded.
   * @param device The target device for the package.
   * @param uploadFile The file to be uploaded.
   * @returns Observable that emits the server's response.
   */
  uploadGenericPackage(type:string,device:string,uploadFile:File): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    const formData: FormData = new FormData();
    formData.append('uploadFile', uploadFile, uploadFile.name);

     return this.http.post(`${this.config.apiUrl}api/v1/packagemanager/uploadGenericPackage?type=${type}&device=${device}`,formData, {
      headers,
      reportProgress: true,
      observe: 'events',
    });
  }

  /**
   * Checks whether a Generic Package is already present on the server for the
   * given package type and device.
   * @param type The type of the package (e.g. TDK / VTS).
   * @param device The device for which the check is performed.
   * @returns Observable emitting the backend response. The service consumer
   *          should read the boolean flag (typically `res.data` or
   *          `res.isPresent`) from the response.
   */
  isGenericPackagePresent(type: string, device: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    return this.http.get(
      `${this.config.apiUrl}api/v1/packagemanager/isGenericPackagePresent?type=${type}&device=${device}`,
      { headers }
    );
  }

  /**
   * Polls the status of an in-progress or completed package installation job.
   * @param jobId The job identifier returned by `installPackages`.
   * @returns Observable that emits the job status response `{ jobId, phase, status, result }`.
   */
  getInstallStatus(jobId: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    return this.http.get(`${this.config.apiUrl}api/v1/packagemanager/installPackage/status?jobId=${jobId}`, { headers });
  }

}
