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
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Observable } from 'rxjs';
import { saveAs } from 'file-saver';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ModulesService {
  private paginationStates: {
    [key: string]: {
      currentPage: number;
      pageSize: number;
      shouldRestore: boolean;
    };
  } = {
    modules: { currentPage: 0, pageSize: 10, shouldRestore: false },
    functions: { currentPage: 0, pageSize: 10, shouldRestore: false },
    parameters: { currentPage: 0, pageSize: 10, shouldRestore: false },
  };

  /**
   * Constructor for ModulesService.
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
          !event.url.includes('/configure/modules-list') &&
          !event.url.includes('/configure/modules-create') &&
          !event.url.includes('/configure/modules-edit') &&
          !event.url.includes('/configure/function-list') &&
          !event.url.includes('/configure/function-create') &&
          !event.url.includes('/configure/function-edit') &&
          !event.url.includes('/configure/parameter-list') &&
          !event.url.includes('/configure/parameter-create') &&
          !event.url.includes('/configure/parameter-edit')
        ) {
          this.resetPaginationState('modules');
          this.resetPaginationState('functions');
          this.resetPaginationState('parameters');
        }
      });
  }

  /**
   * Saves the current pagination state for a specific page.
   * @param page The page identifier (e.g., 'modules', 'functions', 'parameters').
   * @param currentPage The current page number.
   * @param pageSize The current page size.
   */
  savePaginationState(
    page: string,
    currentPage: number,
    pageSize: number
  ): void {
    this.paginationStates[page] = {
      currentPage,
      pageSize,
      shouldRestore: true,
    };
  }

  /**
   * Gets the saved pagination state for a specific page.
   * @param page The page identifier (e.g., 'modules', 'functions', 'parameters').
   * @returns The saved pagination state or null.
   */
  getPaginationState(
    page: string
  ): { currentPage: number; pageSize: number } | null {
    const state = this.paginationStates[page];
    // Only return state if we should restore
    if (state && state.shouldRestore) {
      return { currentPage: state.currentPage, pageSize: state.pageSize };
    }
    return null;
  }

  /**
   * Resets the pagination state for a specific page to default.
   * @param page The page identifier (e.g., 'modules', 'functions', 'parameters').
   */
  resetPaginationState(page: string): void {
    this.paginationStates[page] = {
      currentPage: 0,
      pageSize: 10,
      shouldRestore: false,
    };
  }

  /**
   * Clears the restoration flag for a specific page after restoration.
   * @param page The page identifier (e.g., 'modules', 'functions', 'parameters').
   */
  clearRestorationFlag(page: string): void {
    if (this.paginationStates[page]) {
      this.paginationStates[page].shouldRestore = false;
    }
  }

  /**
   * Gets all test groups.
   * @returns Observable with the list of test groups.
   */
  getAllTestGroups(): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: this.authService.getApiToken(),
    });
    return this.http.get(
      `${this.config.apiUrl}api/v1/module/getAllTestGroups`,
      { headers }
    );
  }

  /**
   * Creates a new module.
   * @param data The module data to create.
   * @returns Observable with the creation result.
   */
  createModule(data: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: this.authService.getApiToken(),
    });
    return this.http.post(`${this.config.apiUrl}api/v1/module/create`, data, {
      headers,
    });
  }

  /**
   * Finds all modules by category.
   * @param category The category to filter modules by.
   * @returns Observable with the list of modules.
   */
  findallbyCategory(category: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: this.authService.getApiToken(),
    });
    return this.http.get(
      `${this.config.apiUrl}api/v1/module/findAllByCategory?category=${category}`,
      { headers }
    );
  }

  /**
   * Updates a module.
   * @param data The module data to update.
   * @returns Observable with the update result.
   */
  updateModule(data: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: this.authService.getApiToken(),
    });
    return this.http.put(`${this.config.apiUrl}api/v1/module/update`, data, {
      headers,
    });
  }

  /**
   * Deletes a module by ID.
   * @param id The ID of the module to delete.
   * @returns Observable with the deletion result.
   */
  deleteModule(id: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: this.authService.getApiToken(),
    });
    return this.http.delete(
      `${this.config.apiUrl}api/v1/module/delete?id=${id}`,
      { headers }
    );
  }

  /**
   * Creates a new function.
   * @param data The function data to create.
   * @returns Observable with the creation result.
   */
  createFunction(data: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: this.authService.getApiToken(),
    });
    return this.http.post(`${this.config.apiUrl}api/v1/function/create`, data, {
      headers,
    });
  }

  /**
   * Gets the list of functions by module name.
   * @param modulename The name of the module.
   * @returns Observable with the list of functions.
   */
  functionList(modulename: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: this.authService.getApiToken(),
    });
    return this.http.get(
      `${this.config.apiUrl}api/v1/function/findAllByModule?moduleName=${modulename}`,
      { headers }
    );
  }

  /**
   * Updates a function.
   * @param data The function data to update.
   * @returns Observable with the update result.
   */
  updateFunction(data: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: this.authService.getApiToken(),
    });
    return this.http.put(`${this.config.apiUrl}api/v1/function/update`, data, {
      headers,
    });
  }

  /**
   * Deletes a function by ID.
   * @param id The ID of the function to delete.
   * @returns Observable with the deletion result.
   */
  deleteFunction(id: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: this.authService.getApiToken(),
    });
    return this.http.delete(
      `${this.config.apiUrl}api/v1/function/delete?id=${id}`,
      { headers }
    );
  }

  /**
   * Gets the list of parameter enums.
   * @returns Observable with the list of parameter enums.
   */
  getListOfParameterEnums(): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: this.authService.getApiToken(),
    });
    return this.http.get(
      `${this.config.apiUrl}api/v1/parameter/getListOfParameterDatatypes`,
      { headers }
    );
  }

  /**
   * Creates a new parameter.
   * @param data The parameter data to create.
   * @returns Observable with the creation result.
   */
  createParameter(data: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: this.authService.getApiToken(),
    });
    return this.http.post(
      `${this.config.apiUrl}api/v1/parameter/create`,
      data,
      { headers }
    );
  }

  /**
   * Finds all parameters by function name.
   * @param functionName The name of the function.
   * @returns Observable with the list of parameters.
   */
  findAllByFunction(functionName: any, categoryName: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: this.authService.getApiToken(),
    });
    return this.http.get(
      `${this.config.apiUrl}api/v1/parameter/findAllByFunction?functionName=${functionName}&category=${categoryName}`,
      { headers }
    );
  }

  /**
   * Deletes a parameter by ID.
   * @param id The ID of the parameter to delete.
   * @returns Observable with the deletion result.
   */
  deleteParameter(id: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: this.authService.getApiToken(),
    });
    return this.http.delete(
      `${this.config.apiUrl}api/v1/parameter/delete?id=${id}`,
      { headers }
    );
  }

  /**
   * Updates a parameter.
   * @param data The parameter data to update.
   * @returns Observable with the update result.
   */
  updateParameter(data: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: this.authService.getApiToken(),
    });
    return this.http.put(`${this.config.apiUrl}api/v1/parameter/update`, data, {
      headers,
    });
  }

  /**
   * Downloads a module by category as a zip file.
   * @param category The category to download modules for.
   */
  downloadModuleByCategory(category: string): void {
    const headers = new HttpHeaders({
      Authorization: this.authService.getApiToken(),
    });
    this.http
      .get(
        `${this.config.apiUrl}api/v1/module/downloadzip?category=${category}`,
        { headers, responseType: 'blob' }
      )
      .subscribe((blob) => {
        saveAs(blob, `module_${category}.zip`);
      });
  }

  /**
   * Uploads a module XML file.
   * @param file The XML file to upload.
   * @returns Observable with the upload result.
   */
  uploadXMLFile(file: File): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: this.authService.getApiToken(),
    });
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post(
      `${this.config.apiUrl}api/v1/module/uploadxml`,
      formData,
      { headers }
    );
  }

  /**
   * Downloads a module XML by module name.
   * @param moduleName The name of the module.
   * @returns Observable with the XML file as a blob.
   */
  downloadXMLModule(moduleName: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: this.authService.getApiToken(),
    });
    return this.http.get(
      `${this.config.apiUrl}api/v1/module/downloadxml?moduleName=${moduleName}`,
      { headers, responseType: 'blob' }
    );
  }
}
