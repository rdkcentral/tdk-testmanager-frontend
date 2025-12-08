/*
* If not stated otherwise in this file or this component's LICENSE file the
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
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class RdkService {
  private paginationState = {
    currentPage: 0,
    pageSize: 10,
  };
  private shouldRestorePagination = false; // Add this flag

  /**
   * Constructor for RdkService.
   * @param http HttpClient for HTTP requests
   * @param authService AuthService for authentication and API token
   * @param config Application configuration injected as APP_CONFIG
   */
  constructor(
    private http: HttpClient,
    private authService: AuthService,
    @Inject('APP_CONFIG') private config: any,
    private router: Router
  ) {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        // If the new URL is not an OEM-related page, reset the pagination
        if (
          !event.url.includes('/configure/list-rdk-certifications') &&
          !event.url.includes('/configure/create-rdk-certifications') &&
          !event.url.includes('/configure/edit-rdk-certifications')
        ) {
          this.resetPaginationState();
        }
      });
  }

  /**
   * Saves the current pagination state (page number and page size) and sets a flag
   * to indicate that pagination should be restored later.
   *
   * @param currentPage - The current page number to save
   * @param pageSize - The number of items per page to save
   * @returns void
   */
  savePaginationState(currentPage: number, pageSize: number): void {
    this.paginationState = { currentPage, pageSize };
    this.shouldRestorePagination = true; // Set flag when saving
  }

  /**
   * Retrieves the current pagination state if restoration is enabled.
   *
   * @returns An object containing the current page number and page size if pagination
   *          should be restored, otherwise returns null.
   */
  getPaginationState(): { currentPage: number; pageSize: number } | null {
    // Only return state if we should restore
    if (this.shouldRestorePagination) {
      return this.paginationState;
    }
    return null;
  }

  /**
   * Resets the pagination state to its default values and clears the restoration flag.
   * Sets the current page to 0, page size to 10, and disables pagination restoration.
   */
  resetPaginationState(): void {
    this.paginationState = { currentPage: 0, pageSize: 10 };
    this.shouldRestorePagination = false; // Clear flag
  }

  /**
   * Clears the restoration flag by setting shouldRestorePagination to false.
   * This method is typically called when pagination state should no longer be restored,
   * such as after a successful restoration or when starting a fresh pagination session.
   */
  clearRestorationFlag(): void {
    this.shouldRestorePagination = false;
  }

  /**
   * Uploads a config file for RDK certification.
   * @param file The config file to upload.
   * @returns Observable with the upload result.
   */
  uploadConfigFile(file: File): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: this.authService.getApiToken(),
    });
    const formData: FormData = new FormData();
    formData.append('pythonFile', file, file.name);
    return this.http.post(
      `${this.config.apiUrl}api/v1/rdkcertification/create`,
      formData,
      { headers }
    );
  }

  /**
   * Gets all RDK certifications.
   * @returns Observable with the list of RDK certifications.
   */
  getallRdkCertifications(): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: this.authService.getApiToken(),
    });
    return this.http.get(
      `${this.config.apiUrl}api/v1/rdkcertification/getall`,
      { headers }
    );
  }

  /**
   * Downloads a config file by name.
   * @param name The name of the config file to download.
   * @returns Observable with the config file as a blob and status.
   */
  downloadConfig(name: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: this.authService.getApiToken(),
    });
    return this.http
      .get(
        `${this.config.apiUrl}api/v1/rdkcertification/download?fileName=${name}`,
        { headers, responseType: 'blob', observe: 'response' }
      )
      .pipe(
        map((response: HttpResponse<Blob>) => {
          const contentDisposition = response.headers.get(
            'content-disposition'
          );
          let filename = 'script.py';
          if (contentDisposition) {
            const matches = /filename="([^"]*)"/.exec(contentDisposition);
            if (matches && matches[1]) {
              filename = matches[1];
            }
          }
          const status = {
            ...response.body,
            statusCode: response.status,
          };
          return { filename, content: response.body, status };
        })
      );
  }

  /**
   * Gets the script template by primitive test name.
   * @param name The name of the primitive test.
   * @returns Observable with the script template as text.
   */
  scriptTemplate(name: string) {
    const headers = new HttpHeaders({
      Authorization: this.authService.getApiToken(),
    });
    return this.http.get(
      `${this.config.apiUrl}api/v1/script/getScriptTemplate?primitiveTestName=${name}`,
      { headers, responseType: 'text' }
    );
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
      Authorization: this.authService.getApiToken(),
    });
    return this.http.post(
      `${this.config.apiUrl}api/v1/rdkcertification/create`,
      formData,
      { headers }
    );
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
      Authorization: this.authService.getApiToken(),
    });
    return this.http.post(
      `${this.config.apiUrl}api/v1/rdkcertification/update`,
      formData,
      { headers }
    );
  }

  /**
   * Gets the content of a config file by name.
   * @param fileName The name of the config file.
   * @returns Observable with the file content as a blob and status.
   */
  getFileContent(fileName: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: this.authService.getApiToken(),
    });
    return this.http
      .get(
        `${this.config.apiUrl}api/v1/rdkcertification/getconfigfilecontent?fileName=${fileName}`,
        { headers, responseType: 'blob', observe: 'response' }
      )
      .pipe(
        map((response: HttpResponse<Blob>) => {
          const status = {
            ...response.body,
            statusCode: response.status,
          };
          return { content: response.body, status };
        })
      );
  }

  /**
   * Deletes an RDK certification by file name.
   * @param name The name of the file to delete.
   * @returns Observable with the deletion result.
   */
  deleteRdkCertification(name: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: this.authService.getApiToken(),
    });
    return this.http.delete(
      `${this.config.apiUrl}api/v1/rdkcertification/delete?fileName=${name}`,
      { headers }
    );
  }
}
