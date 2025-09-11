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
import { AuthService } from '../auth/auth.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsergroupService {
  currentUrl: any;
  isEdit = false;

  /**
   * Constructor for UsergroupService.
   * @param http HttpClient for HTTP requests
   * @param authService AuthService for authentication and API token
   * @param config Application configuration injected as APP_CONFIG
   */
  constructor(private http: HttpClient, private authService: AuthService,
    @Inject('APP_CONFIG') private config: any
  ) {
  }

  /**
   * Options for HTTP requests with authorization header.
   */
  private options = { headers: new HttpHeaders().set('Authorization', this.authService.getApiToken()) };

  /**
   * Gets the list of user groups.
   * @returns Observable with the list of user groups.
   */
  getuserGroupList(): Observable<any> {
    return this.http.get(`${this.config.apiUrl}api/v1/usergroup/findall`, this.options);
  }

  /**
   * Creates a new user group.
   * @param data The user group name to create.
   * @returns Observable with the creation result as text.
   */
  createuserGroup(data: any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    let params = new HttpParams();
    params = params.set('userGroupName', data);

    return this.http.post(`${this.config.apiUrl}api/v1/usergroup/create`, params, { headers, responseType: 'text' })
  }

  /**
   * Updates a user group.
   * @param data The user group data to update.
   * @returns Observable with the update result as text.
   */
  updateUserGroup(data: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this.authService.getApiToken()
    });
    return this.http.put(`${this.config.apiUrl}api/v1/usergroup/update`, data, { headers, responseType: 'text' })
  }

  /**
   * Deletes a user group by ID.
   * @param id The ID of the user group to delete.
   * @returns Observable with the deletion result as text.
   */
  deleteUserGroup(id: any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    return this.http.delete(`${this.config.apiUrl}api/v1/usergroup/delete/${id}`, { headers, responseType: 'text' });
  }

  /**
   * Gets the application version.
   * @returns Observable with the application version.
   */
  appVersion(): Observable<any> {
    return this.http.get(`${this.config.apiUrl}api/v1/users/getappversion`);
  }
}
