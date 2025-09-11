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
import { Observable, Subject } from 'rxjs';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  isloggedIn = false;
  private logoutSubject = new Subject<void>();
  onLogout$ = this.logoutSubject.asObservable();

  /**
   * Constructor for LoginService.
   * @param http HttpClient for HTTP requests
   * @param authService AuthService for authentication and API token
   * @param config Application configuration injected as APP_CONFIG
   */
  constructor(
    private http: HttpClient,
    private authService: AuthService,
    @Inject('APP_CONFIG') private config: any  // <-- Inject runtime config
  ) {}

  /**
   * Logs in the user with provided credentials.
   * @param data The login credentials.
   * @returns Observable with the login result.
   */
  userlogin(data: any): Observable<any> {
    return this.http.post(`${this.config.apiUrl}api/v1/auth/signin`, data);
  }

  /**
   * Gets the list of user groups.
   * @returns Observable with the list of user groups.
   */
  getuserGroup(): Observable<any> {
    return this.http.get(`${this.config.apiUrl}api/v1/auth/getList`);
  }

  /**
   * Gets the authenticated user from local storage.
   * @returns The authenticated user object.
   */
  getAuthenticatedUser() {
    const current_user = <string>localStorage.getItem('loggedinUser');
    return JSON.parse(current_user);
  }

  /**
   * Logs out the current user and clears local storage.
   */
  logoutUser(): void {
    this.logoutSubject.next();
    this.isloggedIn = false;
    localStorage.clear();
  }

  /**
   * Resets the user's password.
   * @param data The password reset data.
   * @returns Observable with the reset result.
   */
  restPassword(data: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this.authService.getApiToken()
    });
    return this.http.post(`${this.config.apiUrl}api/v1/users/changepassword`, data, { headers });
  }

  /**
   * Changes the user's category preference.
   * @param username The username to change preference for.
   * @param category The new category preference.
   * @returns Observable with the change result.
   */
  changePrefernce(username:any,category:any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    return this.http.post(`${this.config.apiUrl}api/v1/auth/changecategorypreference?userName=${username}&category=${category}`, {}, { headers });
  }

}
