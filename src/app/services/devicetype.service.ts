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
import { Injectable,Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class DevicetypeService {

  /**
   * Constructor for DevicetypeService.
   * @param http HttpClient for HTTP requests
   * @param authService AuthService for authentication and API token
   * @param config Application configuration injected as APP_CONFIG
   */
  constructor(private http: HttpClient, private authService: AuthService,
    @Inject('APP_CONFIG') private config: any
  ) { }

  /**
   * Gets the list of device types by category.
   * @param category The category to filter device types by.
   * @returns Observable with the list of device types.
   */
  getlistbycategory(category: any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    return this.http.get(`${this.config.apiUrl}api/v1/devicetype/getlistbycategory?category=${category}`, { headers});
  }

  /**
   * Finds all device types by category.
   * @param category The category to filter device types by.
   * @returns Observable with the list of device types.
   */
  getfindallbycategory(category: any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    return this.http.get(`${this.config.apiUrl}api/v1/devicetype/findallbycategory?category=${category}`, { headers });
  }

  /**
   * Creates a new device type.
   * @param data The device type data to create.
   * @returns Observable with the creation result.
   */
  createDeviceType(data: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this.authService.getApiToken()
    });

    return this.http.post(`${this.config.apiUrl}api/v1/devicetype/create`, data, { headers})
  }

  /**
   * Deletes a device type by ID.
   * @param id The ID of the device type to delete.
   * @returns Observable with the deletion result.
   */
  deleteDeviceType(id: any) : Observable<any>{
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    return this.http.delete(`${this.config.apiUrl}api/v1/devicetype/delete?id=${id}`, { headers});
  }

  /**
   * Updates a device type.
   * @param data The device type data to update.
   * @returns Observable with the update result.
   */
  updateDeviceType(data: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this.authService.getApiToken()
    });
    return this.http.put(`${this.config.apiUrl}api/v1/devicetype/update`, data, { headers});
  }


}
