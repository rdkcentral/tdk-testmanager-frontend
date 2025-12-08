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
import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class DevicetypeService {
  private paginationState = {
    currentPage: 0,
    pageSize: 10,
  };

  private shouldRestorePagination = false; // Add this flag

  /**
   * Constructor for DevicetypeService.
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
          !event.url.includes('/configure/list-devicetype') &&
          !event.url.includes('/configure/create-devicetype') &&
          !event.url.includes('/configure/edit-devicetype')
        ) {
          this.resetPaginationState();
        }
      });
  }

  /**
   * Saves the current pagination state including page number and page size.
   * Sets a flag to indicate that pagination should be restored on next load.
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
   * @returns The pagination state object containing current page and page size,
   *          or null if pagination restoration is disabled or no state exists.
   */
  getPaginationState(): { currentPage: number; pageSize: number } | null {
    // Only return state if we should restore
    if (this.shouldRestorePagination) {
      return this.paginationState;
    }
    return null;
  }

  /**
   * Resets the pagination state to its initial values and clears the restore flag.
   *
   * Sets the current page to 0, page size to 10, and disables pagination restoration.
   * This method is typically called when starting a fresh pagination sequence or
   * when clearing existing pagination data.
   */
  resetPaginationState(): void {
    this.paginationState = { currentPage: 0, pageSize: 10 };
    this.shouldRestorePagination = false; // Clear flag
  }

  /**
   * Clears the restoration flag by setting shouldRestorePagination to false.
   * This method is typically called when pagination state should not be restored,
   * such as when navigating to a new context or resetting the current view.
   */
  clearRestorationFlag(): void {
    this.shouldRestorePagination = false;
  }
  /**
   * Gets the list of device types by category.
   * @param category The category to filter device types by.
   * @returns Observable with the list of device types.
   */
  getlistbycategory(category: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: this.authService.getApiToken(),
    });
    return this.http.get(
      `${this.config.apiUrl}api/v1/devicetype/getlistbycategory?category=${category}`,
      { headers }
    );
  }

  /**
   * Finds all device types by category.
   * @param category The category to filter device types by.
   * @returns Observable with the list of device types.
   */
  getfindallbycategory(category: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: this.authService.getApiToken(),
    });
    return this.http.get(
      `${this.config.apiUrl}api/v1/devicetype/findallbycategory?category=${category}`,
      { headers }
    );
  }

  /**
   * Creates a new device type.
   * @param data The device type data to create.
   * @returns Observable with the creation result.
   */
  createDeviceType(data: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: this.authService.getApiToken(),
    });

    return this.http.post(
      `${this.config.apiUrl}api/v1/devicetype/create`,
      data,
      { headers }
    );
  }

  /**
   * Deletes a device type by ID.
   * @param id The ID of the device type to delete.
   * @returns Observable with the deletion result.
   */
  deleteDeviceType(id: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: this.authService.getApiToken(),
    });
    return this.http.delete(
      `${this.config.apiUrl}api/v1/devicetype/delete?id=${id}`,
      { headers }
    );
  }

  /**
   * Updates a device type.
   * @param data The device type data to update.
   * @returns Observable with the update result.
   */
  updateDeviceType(data: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: this.authService.getApiToken(),
    });
    return this.http.put(
      `${this.config.apiUrl}api/v1/devicetype/update`,
      data,
      { headers }
    );
  }
}
