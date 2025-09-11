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
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class SocService {

  currentUrl: any;

  /**
   * Constructor for SocService.
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
   * Gets the list of SoCs by category.
   * @param category The category to filter SoCs by.
   * @returns Observable with the list of SoCs.
   */
  getSoc(category: any): Observable<any> {

    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    return this.http.get(`${this.config.apiUrl}api/v1/soc/findallbycategory?category=${category}`, { headers });
  }

  /**
   * Creates a new SoC.
   * @param data The SoC data to create.
   * @returns Observable with the creation result.
   */
  createSoc(data: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this.authService.getApiToken()
    });

    return this.http.post(`${this.config.apiUrl}api/v1/soc/create`, data, { headers })
  }

  /**
   * Updates a SoC.
   * @param data The SoC data to update.
   * @returns Observable with the update result.
   */
  updateSoc(data: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this.authService.getApiToken()
    });
    return this.http.put(`${this.config.apiUrl}api/v1/soc/update`, data, { headers});
  }

  /**
   * Deletes a SoC by ID.
   * @param id The ID of the SoC to delete.
   * @returns Observable with the deletion result.
   */
  deleteSoc(id: any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    return this.http.delete(`${this.config.apiUrl}api/v1/soc/delete?id=${id}`, { headers });
  }

}