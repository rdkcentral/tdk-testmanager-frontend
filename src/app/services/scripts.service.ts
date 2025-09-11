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
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';


@Injectable({
  providedIn: 'root'
})
export class ScriptsService {

  private dataSubjectTestSuite   = new BehaviorSubject<any>(null);
  data$ = this.dataSubjectTestSuite.asObservable();

  /**
   * Constructor for ScriptsService.
   * @param http HttpClient for HTTP requests
   * @param authService AuthService for authentication and API token
   * @param config Application configuration injected as APP_CONFIG
   */
  constructor(private http: HttpClient,private authService: AuthService,
    @Inject('APP_CONFIG') private config: any
  ) { }

  /**
   * Sets the data for the test suite.
   * @param data The data to set.
   */
  setData(data: any) {
    this.dataSubjectTestSuite.next(data);
  }

  /**
   * Gets all executions from the local assets.
   * @returns Observable with the executions data.
   */
  getAllexecution(): Observable<any> {
    return this.http.get('assets/execution.json');
  }

  /**
   * Gets all devices from the local assets.
   * @returns Observable with the devices data.
   */
  getAllDevice(): Observable<any> {
    return this.http.get('assets/leftpanel.json');
  }

  /**
   * Gets all scripts by modules for a category.
   * @param category The category to filter modules by.
   * @returns Observable with the scripts data.
   */
  getallbymodules(category: any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    return this.http.get(`${this.config.apiUrl}api/v1/script/findAllByModuleWithCategory?category=${category}`, { headers });
  }

  /**
   * Downloads test cases as Excel by module name.
   * @param moduleName The name of the module.
   * @returns Observable with the Excel file as a blob.
   */
  downloadTestcases(moduleName: any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    return this.http.get(`${this.config.apiUrl}api/v1/script/downloadTestCaseAsExcelByModule?moduleName=${moduleName}`, { headers, responseType: 'blob' })
  }

  /**
   * Uploads a zip file containing script data.
   * @param file The zip file to upload.
   * @returns Observable with the upload result.
   */
  uploadZipFile(file: File): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);

    return this.http.post(`${this.config.apiUrl}api/v1/script/uploadScriptDataZip`, formData, { headers});
  }

  /**
   * Downloads a script data zip by script name.
   * @param name The name of the script.
   * @returns Observable with the zip file as a blob.
   */
  downloadScript(name: any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    return this.http.get(`${this.config.apiUrl}api/v1/script/downloadScriptDataZip?scriptName=${name}`, { headers, responseType: 'blob' })
  }

  /**
   * Downloads all test cases as a zip by category.
   * @param category The category to download test cases for.
   * @returns Observable with the zip file as a blob.
   */
  downloadTestCasesZip(category:any) :Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    return this.http.get(`${this.config.apiUrl}api/v1/script/downloadAllTestcaseZipByCategory?category=${category}`, { headers, responseType: 'blob' })
  }

  /**
   * Gets the script template by primitive test name.
   * @param name The name of the primitive test.
   * @returns Observable with the script template as text.
   */
  scriptTemplate(name:string) : Observable<any>{
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    return this.http.get(`${this.config.apiUrl}api/v1/script/getScriptTemplate?primitiveTestName=${name}`, { headers, responseType: 'text' })
  }
  
  /**
   * Creates a new script.
   * @param scriptCreateData The script creation data.
   * @param scriptFile The script file to upload.
   * @returns Observable with the creation result.
   */
  createScript(scriptCreateData:any,scriptFile:File):Observable<any>{
    const formData = new FormData();
    formData.append('scriptCreateData', new Blob([JSON.stringify(scriptCreateData)], { type: 'application/json' }));
    formData.append('scriptFile', scriptFile); 
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
   return this.http.post(`${this.config.apiUrl}api/v1/script/create`,formData,  { headers });
  }

  /**
   * Updates a script.
   * @param scriptUpdateData The script update data.
   * @param scriptFile The script file to upload.
   * @returns Observable with the update result.
   */
  updateScript(scriptUpdateData:any,scriptFile:File):Observable<any>{
    const formData = new FormData();
    formData.append('scriptUpdateData', new Blob([JSON.stringify(scriptUpdateData)], { type: 'application/json' }));
    formData.append('scriptFile', scriptFile); 
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
   return this.http.put(`${this.config.apiUrl}api/v1/script/update`,formData,  { headers  });
  }

  /**
   * Deletes a script by ID.
   * @param id The ID of the script to delete.
   * @returns Observable with the deletion result.
   */
  delete(id:any):Observable<any>{
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    return this.http.delete(`${this.config.apiUrl}api/v1/script/delete?id=${id}`, { headers });
  }

  /**
   * Finds a script by ID.
   * @param id The ID of the script.
   * @returns Observable with the script data.
   */
  scriptFindbyId(id:any):Observable<any>{
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    return this.http.get(`${this.config.apiUrl}api/v1/script/findById?id=${id}`, { headers});
  }

  /**
   * Downloads a script data zip by script name.
   * @param name The name of the script.
   * @returns Observable with the zip file as a blob.
   */
  downloadSriptZip(name:string):Observable<any>{
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    return this.http.get(`${this.config.apiUrl}api/v1/script/downloadScriptDataZip?scriptName=${name}`, { headers, responseType: 'blob' })
  }

  /**
   * Downloads a markdown file by script name.
   * @param name The name of the script.
   * @returns Observable with the markdown file as a blob.
   */
   downloadMdFile(name:string):Observable<any>{
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    
    return this.http.get(`${this.config.apiUrl}api/v1/script/downloadmdfilebyname?scriptName=${name}`, { headers, responseType: 'blob' })
  }

  /**
   * Finds test suites by category.
   * @param category The category to filter test suites by.
   * @returns Observable with the list of test suites.
   */
  findTestSuitebyCategory(category:string):Observable<any>{
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    return this.http.get(`${this.config.apiUrl}api/v1/script/findListByCategory?category=${category}`, { headers });
  }

  /**
   * Creates a new test suite.
   * @param data The test suite data to create.
   * @returns Observable with the creation result.
   */
  cretaeTestSuite(data:any):Observable<any>{
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
   return this.http.post(`${this.config.apiUrl}api/v1/testsuite/create`,data,  { headers  });
  }

  /**
   * Gets the list of custom test suites by category.
   * @param category The category to filter custom test suites by.
   * @returns Observable with the list of custom test suites.
   */
  getModuleCustomTestSuite(category:string):Observable<any>{
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    return this.http.get(`${this.config.apiUrl}api/v1/module/findAllModuleNamesBySubCategory?category=${category}`, { headers}); 
  }

  /**
   * Gets all test suites by category.
   * @param category The category to filter test suites by.
   * @returns Observable with the list of test suites.
   */
  getAllTestSuite(category:string):Observable<any>{
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    return this.http.get(`${this.config.apiUrl}api/v1/testsuite/findAllByCategory?category=${category}`, { headers }); 
  }

  /**
   * Downloads all test suite XML files as a zip by category.
   * @param category The category to download test suite XML files for.
   * @returns Observable with the zip file as a blob.
   */
  downloadalltestsuitexmlZip(category:string):Observable<any>{
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    return this.http.get(`${this.config.apiUrl}api/v1/testsuite/downloadAllTestSuiteXml?category=${category}`, { headers, responseType: 'blob' })
  }

  /**
   * Downloads a test suite XML by test suite name.
   * @param testsuite The name of the test suite.
   * @returns Observable with the XML file as a blob.
   */
  downloadTestSuiteXML(testsuite:string):Observable<any>{
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    return this.http.get(`${this.config.apiUrl}api/v1/testsuite/downloadTestSuiteXml?testSuite=${testsuite}`, { headers, responseType: 'blob' })
  }

  /**
   * Downloads a test suite XLSX by test suite name.
   * @param testsuite The name of the test suite.
   * @returns Observable with the XLSX file as a blob.
   */
  downloadTestSuiteXLSX(testsuite:string):Observable<any>{
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    return this.http.get(`${this.config.apiUrl}api/v1/testsuite/downloadTestCases?testSuite=${testsuite}`, { headers, responseType: 'blob' })
  }

  /**
   * Deletes a test suite by ID.
   * @param id The ID of the test suite to delete.
   * @returns Observable with the deletion result.
   */
  deleteTestSuite(id:any): Observable<any>{
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    return this.http.delete(`${this.config.apiUrl}api/v1/testsuite/delete?id=${id}`, { headers }); 
  }

  /**
   * Uploads a test suite XML file.
   * @param file The XML file to upload.
   * @returns Observable with the upload result.
   */
  uploadTestSuiteXML(file:File): Observable<any>{
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    const formData: FormData = new FormData();
    formData.append('testSuite', file, file.name);
    return this.http.post(`${this.config.apiUrl}api/v1/testsuite/uploadTestSuiteXml`, formData, { headers});
  }

  /**
   * Updates a test suite.
   * @param data The test suite data to update.
   * @returns Observable with the update result.
   */
  updateTestSuite(data:any): Observable<any>{
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
   return this.http.put(`${this.config.apiUrl}api/v1/testsuite/update`,data,  { headers });
  
  }

  /**
   * Creates a custom test suite.
   * @param data The custom test suite data to create.
   * @returns Observable with the creation result.
   */
  createCustomTestSuite(data:any): Observable<any>{
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
   return this.http.post(`${this.config.apiUrl}api/v1/testsuite/createCustomTestSuite`,data,  { headers});
  
  }



}
