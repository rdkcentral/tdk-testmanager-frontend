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
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class OemService {
  currentUrl: any;
  private paginationState = {
    currentPage: 0,
    pageSize: 10,
  };
  private shouldRestorePagination = false; // Add this flag

  /**
   * Constructor for OemService.
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
          !event.url.includes('/configure/list-oem') &&
          !event.url.includes('/configure/create-oem') &&
          !event.url.includes('/configure/oem-edit')
        ) {
          this.resetPaginationState();
        }
      });
  }

  /**
   * Saves the current pagination state and sets a flag to indicate that pagination should be restored.
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
   * @returns The pagination state containing current page and page size if restoration
   *          is enabled, otherwise null
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
   *
   * Sets the current page to 0, page size to 10, and disables pagination restoration.
   * This method is typically called when initializing a new data set or clearing filters.
   */
  resetPaginationState(): void {
    this.paginationState = { currentPage: 0, pageSize: 10 };
    this.shouldRestorePagination = false; // Clear flag
  }

  /**
   * Clears the restoration flag by setting shouldRestorePagination to false.
   * This method is typically called when pagination state should not be restored,
   * such as after a fresh search or when resetting the component state.
   */
  clearRestorationFlag(): void {
    this.shouldRestorePagination = false;
  }

  /**
   * Options for HTTP requests with authorization header.
   */
  private options = {
    headers: new HttpHeaders().set(
      'Authorization',
      this.authService.getApiToken()
    ),
  };

  /**
   * Gets the list of all OEMs.
   * @returns Observable with the list of OEMs.
   */
  getOemList(): Observable<any> {
    return this.http.get(
      `${this.config.apiUrl}api/v1/boxmanufacturer/findall`,
      this.options
    );
  }

  /**
   * Gets the list of OEMs by category.
   * @param category The category to filter OEMs by.
   * @returns Observable with the list of OEMs.
   */
  getOemByList(category: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: this.authService.getApiToken(),
    });
    return this.http.get(
      `${this.config.apiUrl}api/v1/oem/findallbycategory?category=${category}`,
      { headers }
    );
  }

  /**
   * Creates a new OEM.
   * @param data The OEM data to create.
   * @returns Observable with the creation result.
   */
  createOem(data: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: this.authService.getApiToken(),
    });

    return this.http.post(`${this.config.apiUrl}api/v1/oem/create`, data, {
      headers,
    });
  }

  /**
   * Deletes an OEM by ID.
   * @param id The ID of the OEM to delete.
   * @returns Observable with the deletion result.
   */
  deleteOem(id: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: this.authService.getApiToken(),
    });
    return this.http.delete(`${this.config.apiUrl}api/v1/oem/delete?id=${id}`, {
      headers,
    });
  }

  /**
   * Updates an OEM.
   * @param data The OEM data to update.
   * @returns Observable with the update result.
   */
  updateOem(data: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: this.authService.getApiToken(),
    });
    return this.http.put(`${this.config.apiUrl}api/v1/oem/update`, data, {
      headers,
    });
  }
}
