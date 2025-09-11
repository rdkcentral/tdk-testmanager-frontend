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
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from './config.service'; // adjust path

@Injectable({ providedIn: 'root' })
export class ApiService {

  /**
   * Constructor for ApiService.
   * @param http HttpClient for HTTP requests
   * @param configService ConfigService for API configuration
   */
  constructor(private http: HttpClient, private configService: ConfigService) {}


  /**
   * Fetches data from the configured API URL.
   * @returns Observable with the API response data.
   */
  getData() {
    const apiUrl = this.configService.apiUrl;
    return this.http.get(`${apiUrl}`);
  }
}
