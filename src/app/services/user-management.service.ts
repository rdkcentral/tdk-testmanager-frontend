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
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { AuthService } from '../auth/auth.service';


@Injectable({
  providedIn: 'root'
})
export class UserManagementService {

  /**
   * Constructor for UserManagementService.
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
   * Gets all users.
   * @returns Observable with the list of users.
   */
  getAlluser(): Observable<any> {
    return this.http.get(`${this.config.apiUrl}api/v1/users/findAll`, this.options);
  }

  /**
   * Deletes a user by ID.
   * @param id The ID of the user to delete.
   * @returns Observable with the deletion result.
   */
  deleteUser(id: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    return this.http.delete(`${this.config.apiUrl}api/v1/users/delete?id=${id}`, { headers });
  }

  /**
   * Gets all group names.
   * @returns Observable with the list of group names.
   */
  getGroupName(): Observable<any> {
    return this.http.get(`${this.config.apiUrl}api/v1/usergroup/findall`, this.options);
  }

  /**
   * Gets all roles.
   * @returns Observable with the list of roles.
   */
  getAllRole(): Observable<any> {
    return this.http.get(`${this.config.apiUrl}api/v1/userrole/findall`, this.options);
  }

  /**
   * Creates a new user.
   * @param data The user data to create.
   * @returns Observable with the creation result.
   */
  createUser(data: any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    return this.http.post(`${this.config.apiUrl}api/v1/users/create`, data, { headers })
  }

  /**
   * Updates a user.
   * @param data The user data to update.
   * @returns Observable with the update result.
   */
  updateUser(data: any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    return this.http.put(`${this.config.apiUrl}api/v1/users/update`, data, { headers, observe: 'response'})
  }


}
