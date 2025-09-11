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

@Injectable({ providedIn: 'root' })
export class ConfigService {
  private config: any;


  /**
   * Constructor for ConfigService.
   * @param http HttpClient for HTTP requests
   */
  constructor(private http: HttpClient) {}



  /**
   * Loads the configuration from the config.json file.
   * @returns A promise that resolves when the config is loaded.
   */
  loadConfig(): Promise<void> {
    return this.http.get('/assets/config.json')
      .toPromise()
      .then(config => {
        this.config = config;
      });
  }


  /**
   * Gets the API URL from the loaded configuration.
   * @returns The API URL as a string.
   */
  get apiUrl(): string {
    return this.config?.apiUrl || '';
  }
}
