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
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RegisterService {
  /**
   * Constructor for RegisterService.
   * @param http HttpClient for HTTP requests
   * @param config Application configuration injected as APP_CONFIG
   */
  constructor(private http: HttpClient,@Inject('APP_CONFIG') private config: any) { }

  /**
   * Registers a new user.
   * @param user The user data to register.
   * @returns Observable with the registration result.
   */
  registerUser(user: any): Observable<any> {

    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(`${this.config.apiUrl}api/v1/auth/signup`, user, { headers: headers});
   
  }

}
