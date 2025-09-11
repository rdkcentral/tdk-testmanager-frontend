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

export class RdkVersionsService {

    currentUrl: any;

    /**
     * Constructor for RdkVersionsService.
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
     * Creates a new RDK version.
     * @param data The RDK version data to create.
     * @returns Observable with the creation result as text.
     */
    createRdkVersion(data: any): Observable<any> {
        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': this.authService.getApiToken()
        });
    
        return this.http.post(`${this.config.apiUrl}api/v1/rdkversion/create`, data, { headers, responseType: 'text' })
      }

    /**
     * Gets the list of RDK versions by category.
     * @param category The category to filter RDK versions by.
     * @returns Observable with the list of RDK versions as text.
     */
    getRdkVersionByList(category: any): Observable<any> {
        const headers = new HttpHeaders({
          'Authorization': this.authService.getApiToken()
        });
        return this.http.get(`${this.config.apiUrl}api/v1/rdkversion/findallbycategory?category=${category}`, { headers, responseType: 'text' });
      }

    /**
     * Updates an RDK version.
     * @param data The RDK version data to update.
     * @returns Observable with the update result as text.
     */
    updateRdkVersion(data: any): Observable<any> {
        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': this.authService.getApiToken()
        });
        return this.http.put(`${this.config.apiUrl}api/v1/rdkversion/update`, data, { headers,  responseType: 'text'})
      }

    /**
     * Deletes an RDK version by ID.
     * @param id The ID of the RDK version to delete.
     * @returns Observable with the deletion result as text.
     */
    deleteRdkVersion(id: any): Observable<any>{
        const headers = new HttpHeaders({
          'Authorization': this.authService.getApiToken()
        });
        return this.http.delete(`${this.config.apiUrl}api/v1/rdkversion/delete/${id}`, { headers, responseType: 'text' });
      }
}