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
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { BehaviorSubject, map, Observable, of } from 'rxjs';
import { saveAs } from 'file-saver';


@Injectable({
  providedIn: 'root'
})
export class RdkService {

  /**
   * Constructor for RdkService.
   * @param http HttpClient for HTTP requests
   * @param authService AuthService for authentication and API token
   * @param config Application configuration injected as APP_CONFIG
   */
  constructor(private http: HttpClient, private authService: AuthService,
    @Inject('APP_CONFIG') private config: any
  ) { }

  /**
   * Uploads a config file for RDK certification.
   * @param file The config file to upload.
   * @returns Observable with the upload result.
   */
  uploadConfigFile(file: File): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    const formData: FormData = new FormData();
    formData.append('pythonFile', file, file.name);
    return this.http.post(`${this.config.apiUrl}api/v1/rdkcertification/create`, formData, { headers });
  }

  /**
   * Gets all RDK certifications.
   * @returns Observable with the list of RDK certifications.
   */
  getallRdkCertifications(): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    return this.http.get(`${this.config.apiUrl}api/v1/rdkcertification/getall`, { headers});

  }

  /**
   * Downloads a config file by name.
   * @param name The name of the config file to download.
   * @returns Observable with the config file as a blob and status.
   */
  downloadConfig(name: any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    return this.http.get(`${this.config.apiUrl}api/v1/rdkcertification/download?fileName=${name}`, { headers, responseType: 'blob', observe: 'response' }).pipe(
      map((response: HttpResponse<Blob>) => {
        const contentDisposition = response.headers.get('content-disposition');
        let filename = 'script.py';
        if (contentDisposition) {
          const matches = /filename="([^"]*)"/.exec(contentDisposition);
          if (matches && matches[1]) {
            filename = matches[1];
          }
        }
        const status = {
          ...response.body,
          statusCode: response.status
        }
        return { filename, content: response.body, status }
      })
    )

  }

  /**
   * Gets the script template by primitive test name.
   * @param name The name of the primitive test.
   * @returns Observable with the script template as text.
   */
  scriptTemplate(name: string) {
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    return this.http.get(`${this.config.apiUrl}api/v1/script/getScriptTemplate?primitiveTestName=${name}`, { headers, responseType: 'text' })
  }

  /**
   * Creates a new script for RDK certification.
   * @param scriptFile The script file to create.
   * @returns Observable with the creation result.
   */
  createScript(scriptFile: File): Observable<any> {
    const formData = new FormData();
    formData.append('pythonFile', scriptFile);
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    return this.http.post(`${this.config.apiUrl}api/v1/rdkcertification/create`, formData, { headers});
  }

  /**
   * Updates a script for RDK certification.
   * @param scriptFile The script file to update.
   * @returns Observable with the update result.
   */
  updateScript(scriptFile: File): Observable<any> {
    const formData = new FormData();
    formData.append('pythonFile', scriptFile);
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    return this.http.post(`${this.config.apiUrl}api/v1/rdkcertification/update`, formData, { headers });
  }

  /**
   * Gets the content of a config file by name.
   * @param fileName The name of the config file.
   * @returns Observable with the file content as a blob and status.
   */
  getFileContent(fileName: any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    return this.http.get(`${this.config.apiUrl}api/v1/rdkcertification/getconfigfilecontent?fileName=${fileName}`, { headers, responseType: 'blob', observe: 'response' }).pipe(
      map((response: HttpResponse<Blob>) => {
        const status = {
          ...response.body,
          statusCode: response.status
        }
        return { content: response.body, status }
      })
    )

  }

  /**
   * Deletes an RDK certification by file name.
   * @param name The name of the file to delete.
   * @returns Observable with the deletion result.
   */
  deleteRdkCertification(name: any): Observable<any>{
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    return this.http.delete(`${this.config.apiUrl}api/v1/rdkcertification/delete?fileName=${name}`, { headers });
  }
}