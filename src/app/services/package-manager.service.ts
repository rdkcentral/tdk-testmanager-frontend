/*
* If not stated otherwise in this file or this component's Licenses.txt file the
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
    return this.http.post(`${this.config.apiUrl}/api/v1/packagemanager/createPackageAPI?type=${type}&device=${device}`, { headers })
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
   * Installs a package on a specified device.
   * @param type The type of the package to be installed.
   * @param device The target device where the package will be installed.
   * @param packageName The name of the package to be installed.
   * @returns Observable that emits the response of the installation request.
   */
  installPackages(type:string,device:string,packageName:string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    return this.http.post(`${this.config.apiUrl}/api/v1/packagemanager/installPackage?type=${type}&device=${device}&packageName=${packageName }`, { headers });
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

    return this.http.post(`${this.config.apiUrl}/api/v1/packagemanager/uploadPackage?type=${type}&device=${device}`,formData, { headers });
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

    return this.http.post(`${this.config.apiUrl}/api/v1/packagemanager/uploadGenericPackage?type=${type}&device=${device}`,formData, { headers });
  }

}
