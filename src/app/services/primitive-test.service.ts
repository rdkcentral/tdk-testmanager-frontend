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
import { Inject, inject, Injectable } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class PrimitiveTestService {
  currentUrl: any;
  allPassedData: BehaviorSubject<any> = new BehaviorSubject<any>([]);
  private dropdownValueSubject = new BehaviorSubject<any>(null);
  private paginationState = {
    currentPage: 0,
    pageSize: 10,
  };
  private shouldRestorePagination = false; // Add this flag

  /**
   * Constructor for PrimitiveTestService.
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
          !event.url.includes('/configure/list-primitivetest') &&
          !event.url.includes('/configure/create-primitivetest') &&
          !event.url.includes('/configure/edit-primitivetest')
        ) {
          this.resetPaginationState();
        }
      });
  }

  /**
   * Saves the current pagination state including page number and page size.
   * Sets a flag to indicate that pagination should be restored when needed.
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
   * @returns The current pagination state containing page number and size if restoration
   * is enabled, otherwise null
   */
  getPaginationState(): { currentPage: number; pageSize: number } | null {
    // Only return state if we should restore
    if (this.shouldRestorePagination) {
      return this.paginationState;
    }
    return null;
  }

  /**
   * Resets the pagination state to its initial values and clears the restoration flag.
   *
   * This method sets the current page to 0, page size to 10, and disables pagination restoration.
   * Typically called when starting a new search or clearing filters.
   */
  resetPaginationState(): void {
    this.paginationState = { currentPage: 0, pageSize: 10 };
    this.shouldRestorePagination = false; // Clear flag
  }

  /**
   * Clears the restoration flag by setting shouldRestorePagination to false.
   * This method is typically called when pagination state should not be restored,
   * such as after a successful restoration or when starting fresh pagination.
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
   * Gets the list of modules by category.
   * @param category The category to filter modules by.
   * @returns Observable with the list of modules.
   */
  getlistofModules(category: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: this.authService.getApiToken(),
    });
    return this.http.get(
      `${this.config.apiUrl}api/v1/module/findAllModuleNamesByCategory?category=${category}`,
      { headers }
    );
  }

  /**
   * Gets the list of functions by module name.
   * @param moduleName The name of the module.
   * @returns Observable with the list of functions.
   */
  getlistofFunction(moduleName: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: this.authService.getApiToken(),
    });
    return this.http.get(
      `${this.config.apiUrl}api/v1/function/getlistoffunctionbymodulename?moduleName=${moduleName}`,
      { headers }
    );
  }

  /**
   * Creates a new primitive test.
   * @param data The primitive test data to create.
   * @returns Observable with the creation result.
   */
  createPrimitiveTest(data: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: this.authService.getApiToken(),
    });
    return this.http.post(
      `${this.config.apiUrl}api/v1/primitivetest/create`,
      data,
      { headers }
    );
  }

  /**
   * Gets parameter names by module name.
   * @param moduleName The name of the module.
   * @returns Observable with the parameter names.
   */
  getParameterNames(moduleName: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: this.authService.getApiToken(),
    });
    return this.http.get(
      `${this.config.apiUrl}api/v1/primitivetest/getlistbymodulename?moduleName=${moduleName}`,
      { headers }
    );
  }

  /**
   * Gets the list of parameters by function name.
   * @param functionName The name of the function.
   * @returns Observable with the list of parameters.
   */
  getParameterList(functionName: any, categoryName: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: this.authService.getApiToken(),
    });
    return this.http.get(
      `${this.config.apiUrl}api/v1/parameter/findAllByFunction?functionName=${functionName}&category=${categoryName}`,
      { headers }
    );
  }

  /**
   * Gets the parameter list for update by ID.
   * @param id The ID of the primitive test.
   * @returns Observable with the parameter list for update.
   */
  getParameterListUpdate(id: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: this.authService.getApiToken(),
    });
    return this.http.get(
      `${this.config.apiUrl}api/v1/primitivetest/findbyid?id=${id}`,
      { headers }
    );
  }

  /**
   * Updates a primitive test.
   * @param data The primitive test data to update.
   * @returns Observable with the update result.
   */
  updatePrimitiveTest(data: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: this.authService.getApiToken(),
    });
    return this.http.put(
      `${this.config.apiUrl}api/v1/primitivetest/update`,
      data,
      { headers, observe: 'response' }
    );
  }

  /**
   * Deletes a primitive test by ID.
   * @param id The ID of the primitive test to delete.
   * @returns Observable with the deletion result.
   */
  deletePrimitiveTest(id: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: this.authService.getApiToken(),
    });
    return this.http.delete(
      `${this.config.apiUrl}api/v1/primitivetest/delete?id=${id}`,
      { headers }
    );
  }

  /**
   * Observable for dropdown value changes.
   */
  dropdownValue$ = this.dropdownValueSubject.asObservable();

  /**
   * Sets the dropdown value.
   * @param value The value to set.
   */
  setDropdownValue(value: string) {
    this.dropdownValueSubject.next(value);
  }

  /**
   * Gets the current dropdown value.
   * @returns The current dropdown value.
   */
  getDropdownValue() {
    return this.dropdownValueSubject.value;
  }
}
