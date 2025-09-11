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
import { AuthService } from '../auth/auth.service';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class OemService {

  currentUrl: any;

  /**
   * Constructor for OemService.
   * @param http HttpClient for HTTP requests
   * @param authService AuthService for authentication and API token
   * @param config Application configuration injected as APP_CONFIG
   */
  constructor(private http: HttpClient, private authService: AuthService,
    @Inject('APP_CONFIG') private config: any
  ) { }

  /**
   * Options for HTTP requests with authorization header.
   */
  private options = { headers: new HttpHeaders().set('Authorization', this.authService.getApiToken()) };

  /**
   * Gets the list of all OEMs.
   * @returns Observable with the list of OEMs.
   */
  getOemList(): Observable<any> {
    return this.http.get(`${this.config.apiUrl}api/v1/boxmanufacturer/findall`, this.options);
  }

  /**
   * Gets the list of OEMs by category.
   * @param category The category to filter OEMs by.
   * @returns Observable with the list of OEMs.
   */
  getOemByList(category: any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    return this.http.get(`${this.config.apiUrl}api/v1/oem/findallbycategory?category=${category}`, { headers});
  }

  /**
   * Creates a new OEM.
   * @param data The OEM data to create.
   * @returns Observable with the creation result.
   */
  createOem(data: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this.authService.getApiToken()
    });

    return this.http.post(`${this.config.apiUrl}api/v1/oem/create`, data, { headers });
  }

  /**
   * Deletes an OEM by ID.
   * @param id The ID of the OEM to delete.
   * @returns Observable with the deletion result.
   */
  deleteOem(id: any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    return this.http.delete(`${this.config.apiUrl}api/v1/oem/delete?id=${id}`, { headers });
  }

  /**
   * Updates an OEM.
   * @param data The OEM data to update.
   * @returns Observable with the update result.
   */
  updateOem(data: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this.authService.getApiToken()
    });
    return this.http.put(`${this.config.apiUrl}api/v1/oem/update`, data, { headers});
 
  }

}
