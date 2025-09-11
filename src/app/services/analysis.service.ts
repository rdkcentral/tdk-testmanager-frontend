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
import { AuthService } from '../auth/auth.service';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root',
})
export class AnalysisService {

  /**
   * Constructor for AnalysisService.
   * @param http HttpClient for HTTP requests
   * @param authService AuthService for authentication and API token
   * @param config Application configuration injected as APP_CONFIG
   */
  constructor(private http: HttpClient, private authService: AuthService,
    @Inject('APP_CONFIG') private config: any
  ) {}



  /**
   * Fetches execution details by filter.
   * @param details The filter details for the request.
   * @returns Observable with the filtered execution details.
   */
  getcombinedByFilter(details: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: this.authService.getApiToken(),
    });
    return this.http.post(
      `${this.config.apiUrl}execution/getExecutionDetailsByFilter`,
      details,
      { headers }
    );
  }


  /**
   * Generates a combined report as a blob.
   * @param data The data for the report generation.
   * @returns Observable with the report blob.
   */
  combinnedReportGenerate(data: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: this.authService.getApiToken(),
    });
    return this.http.post(`${this.config.apiUrl}execution/combinedExcel`, data, {
      headers,
      responseType: 'blob',
    });
  }


  /**
   * Generates a comparison report as a blob.
   * @param execId The execution ID to compare.
   * @param data The data for the report generation.
   * @returns Observable with the comparison report blob.
   */
  compReportGenerate(execId: string, data: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: this.authService.getApiToken(),
    });
    return this.http.post(
      `${this.config.apiUrl}execution/comparisonExcel?baseExecId=${execId}`,
      data,
      {
        headers,
        responseType: 'blob',
      }
    );
  }


  /**
   * Gets the list of project names for a category.
   * @param category The category to fetch project names for.
   * @returns Observable with the list of project names.
   */
  getProjectNames(category: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: this.authService.getApiToken(),
    });
    return this.http.get(`${this.config.apiUrl}api/v1/analysis/getListOfProjectIDs?category=${category}`, {
      headers
    });
  }


  /**
   * Gets the list of priorities for a category.
   * @param category The category to fetch priorities for.
   * @returns Observable with the list of priorities.
   */
  getPriorities(category: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: this.authService.getApiToken(),
    });
    return this.http.get(`${this.config.apiUrl}api/v1/analysis/getPriorities?category=${category}`, {
      headers
    });
  }


  /**
   * Gets the list of labels for a category.
   * @param category The category to fetch labels for.
   * @returns Observable with the list of labels.
   */
  listOfLabels(category: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: this.authService.getApiToken(),
    });
    return this.http.get(`${this.config.apiUrl}api/v1/analysis/getListOfLabels?category=${category}`, {
      headers
    });
  }


  /**
   * Gets the list of release versions for a category.
   * @param category The category to fetch release versions for.
   * @returns Observable with the list of release versions.
   */
  getReleaseVersions(category: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: this.authService.getApiToken(),
    });
    return this.http.get(`${this.config.apiUrl}api/v1/analysis/getReleaseVersions?category=${category}`, {
      headers
    });
  }


  /**
   * Gets the hardware configuration for a category.
   * @param category The category to fetch hardware configuration for.
   * @returns Observable with the hardware configuration.
   */
  getHardware(category: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: this.authService.getApiToken(),
    });
    return this.http.get(`${this.config.apiUrl}api/v1/analysis/getHardwareConfiguration?category=${category}`, {
      headers
    });
  }

  /**
   * Gets ticket details for a given execution ID.
   * @param exeId The execution result ID.
   * @returns Observable with the ticket details.
   */
  ticketDetails(exeId:string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: this.authService.getApiToken(),
    });
    return this.http.get(`${this.config.apiUrl}api/v1/analysis/getDetailsForPopulatingTicketDetails?execResultID=${exeId}`, {
      headers
  });
  }

  /**
   * Gets the list of impacted platforms for a category.
   * @param category The category to fetch impacted platforms for.
   * @returns Observable with the list of impacted platforms.
   */
  getImpactedPlatforms(category: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: this.authService.getApiToken(),
    });
    return this.http.get(`${this.config.apiUrl}api/v1/analysis/getImpactedPlatforms?category=${category}`, {
      headers
    });
  }

  /**
   * Gets the list of fixed-in versions for a category.
   * @param category The category to fetch fixed-in versions for.
   * @returns Observable with the list of fixed-in versions.
   */
  getFixedInVersions(category: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: this.authService.getApiToken(),
    });
    return this.http.get(`${this.config.apiUrl}api/v1/analysis/getFixedInVersions?category=${category}`, {
      headers
    });
  }


  /**
   * Gets the list of RDK versions for a category.
   * @param category The category to fetch RDK versions for.
   * @returns Observable with the list of RDK versions.
   */
  getRDKVersions(category: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: this.authService.getApiToken(),
    });
    return this.http.get(`${this.config.apiUrl}api/v1/analysis/getRDKVersions?category=${category}`, {
      headers
    });
  }


  /**
   * Gets the list of severities for a category.
   * @param category The category to fetch severities for.
   * @returns Observable with the list of severities.
   */
  getSeverities(category: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: this.authService.getApiToken(),
    });
    return this.http.get(`${this.config.apiUrl}api/v1/analysis/getSeverities?category=${category}`, {
      headers
    });
  }


  /**
   * Gets the list of impacted components for a category.
   * @param category The category to fetch impacted components for.
   * @returns Observable with the list of impacted components.
   */
  getComponentsImpacted(category: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: this.authService.getApiToken(),
    });
    return this.http.get(`${this.config.apiUrl}api/v1/analysis/getComponentsImpacted?category=${category}`, {
      headers
    });
  }


  /**
   * Gets the steps to reproduce for a given script name.
   * @param scriptName The script name to fetch steps for.
   * @returns Observable with the steps to reproduce (as text).
   */
  setpstoReproduce(scriptName:string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: this.authService.getApiToken(),
    });
    return this.http.get(`${this.config.apiUrl}api/v1/analysis/getStepsToReproduce?scriptName=${scriptName}`, {
      headers,
      responseType: 'text',
    });
  }

  /**
   * Checks if a project ID is a platform for a given category.
   * @param prjectId The project ID to check.
   * @param category The category to check in.
   * @returns Observable with the platform check result.
   */
  isPlatform(prjectId:string ,category: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: this.authService.getApiToken(),
    });
    return this.http.get(`${this.config.apiUrl}api/v1/analysis/isPlatformProjectID?projectID=${prjectId}&category=${category}`, {
      headers
    });
  }


  /**
   * Creates a Jira ticket with the provided data.
   * @param data The data for the Jira ticket.
   * @returns Observable with the creation result.
   */
  createJira(data:any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: this.authService.getApiToken(),
    });
    return this.http.post(`${this.config.apiUrl}api/v1/analysis/createJiraTicket`, data ,{
      headers
    });
  }

  /**
   * Gets ticket details from Jira for a given execution ID and project name.
   * @param exeId The execution result ID.
   * @param projectname The project name.
   * @returns Observable with the ticket details from Jira.
   */
  getTicketDetaisFromJira(exeId:string, projectname:string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: this.authService.getApiToken(),
    });
    return this.http.get(`${this.config.apiUrl}api/v1/analysis/getTicketDetaisFromJira?executionResultID=${exeId}&projectName=${projectname}`, {
      headers
    });
  }


  /**
   * Updates a Jira ticket with the provided data.
   * @param data The data for updating the Jira ticket.
   * @returns Observable with the update result.
   */
  updateJiraTicket(data:any): Observable<any> {
  const headers = new HttpHeaders({
    Authorization: this.authService.getApiToken(),
  });
  return this.http.post(`${this.config.apiUrl}api/v1/analysis/updateJiraTicket`, data ,{
    headers
  });
}


  /**
   * Checks if Jira automation is implemented.
   * @returns Observable indicating if Jira automation is implemented.
   */
isJiraAutomation():Observable<any>{
  const headers = new HttpHeaders({
    'Authorization': this.authService.getApiToken()
  });
  return this.http.get(`${this.config.apiUrl}api/v1/analysis/isJiraAutomationImplemented`, { headers});
 }

  /**
   * Generates a comparison Excel report by execution names.
   * @param baseExecutionName The base execution name for comparison.
   * @param comparisonExecutionNames The list of execution names to compare.
   * @returns Observable with the comparison Excel report blob.
   */
  comparisonExcelByNames(baseExecutionName: string, comparisonExecutionNames: string[]): Observable<any> {
    const headers = new HttpHeaders({
        Authorization: this.authService.getApiToken(),
    });

    // Construct the API endpoint with baseExecName as a query parameter
    const url = `${this.config.apiUrl}execution/comparisonExcelByNames?baseExecName=${baseExecutionName}`;

    // Send executionNames in the request body
    return this.http.post(url, comparisonExecutionNames, {
        headers,
        responseType: 'blob', // Expecting a file (Excel) as the response
    });
}
}
