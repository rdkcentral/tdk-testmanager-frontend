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
import { Injectable,Inject} from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';
import { interval, map, Observable, Subject, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ExecutionService {

  /**
   * Constructor for ExecutionService.
   * @param http HttpClient for HTTP requests
   * @param authService AuthService for authentication and API token
   * @param config Application configuration injected as APP_CONFIG
   */
  constructor(private http: HttpClient,private authService: AuthService,
     @Inject('APP_CONFIG') private config: any
  ) { }

  /**
   * Gets all executions by category with pagination.
   * @param category The category to filter executions by.
   * @param page The page number.
   * @param size The page size.
   * @returns Observable with the executions.
   */
  getAllexecution(category: any,page: number, size: number): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    return this.http.get(`${this.config.apiUrl}execution/getExecutionsByCategory?category=${category}&page=${page}&size=${size}&sortBy=createdDate&sortDir=desc`, { headers });
  }

  /**
   * Gets the status of all devices for a category.
   * @param category The category to filter devices by.
   * @returns Observable with the device status as text.
   */
  getDeviceStatus(category: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    return this.http.get(`${this.config.apiUrl}api/v1/device/getalldevicestatus?category=${category}`, { headers, responseType: 'text' });
  }

  /**
   * Gets the status of all devices for a category and refreshes them.
   * @param category The category to filter devices by.
   * @returns Observable with the device status as text.
   */
  getDeviceStatusForRefresh(category: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    return this.http.put(`${this.config.apiUrl}api/v1/device/updateAndGetAllDeviceStatus?category=${category}`, { headers, responseType: 'text' });
  }

  /**
   * Toggles Thunder enabled status for a device by IP.
   * @param deviceIp The IP address of the device.
   * @returns Observable with the result.
   */
  toggleThunderEnabled(deviceIp:any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    return this.http.get(`${this.config.apiUrl}api/v1/device/toggleThunderEnabledStatus?deviceIp=${deviceIp}`, { headers });
  }
  
  /**
   * Gets devices by category and Thunder enabled status.
   * @param category The category to filter devices by.
   * @param isThunderEnabled Whether Thunder is enabled.
   * @returns Observable with the devices.
   */
  getDeviceByCategory(category:string,isThunderEnabled:boolean): Observable<any>{
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    return this.http.get(`${this.config.apiUrl}api/v1/device/getDeviceByCategoryAndThunderstatus?category=${category}&isThunderEnabled=${isThunderEnabled}`, { headers });
  }

  /**
   * Gets device status by IP address.
   * @param deviceIP The IP address of the device.
   * @returns Observable with the device status.
   */
  getDeviceStatusByIP(deviceIP: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    return this.http.get(
      `${this.config.apiUrl}api/v1/device/getDeviceStatusByIP?deviceIP=${deviceIP}`,
      { headers }
    );
  }
  
  /**
   * Gets scripts by category and Thunder enabled status.
   * @param category The category to filter scripts by.
   * @param isThunderEnabled Whether Thunder is enabled.
   * @returns Observable with the scripts.
   */
  getscriptByCategory(category:string,isThunderEnabled:boolean): Observable<any>{
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    return this.http.get(`${this.config.apiUrl}api/v1/script/getListofScriptByCategory?category=${category}&isThunderEnabled=${isThunderEnabled}`, { headers});
  }

  /**
   * Gets test suites by category and Thunder enabled status.
   * @param category The category to filter test suites by.
   * @param isThunderEnabled Whether Thunder is enabled.
   * @returns Observable with the test suites.
   */
  gettestSuiteByCategory(category:string,isThunderEnabled:boolean): Observable<any>{
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    return this.http.get(`${this.config.apiUrl}api/v1/testsuite/getListofTestSuiteByCategory?category=${category}&isThunderEnabled=${isThunderEnabled}`, { headers });
  }

  /**
   * Gets execution name for the given data.
   * @param data The data to get execution name for.
   * @returns Observable with the execution name.
   */
  geExecutionName(data:any): Observable<any>{
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    return this.http.post(`${this.config.apiUrl}execution/getExecutionName`,data, { headers });
  }

  /**
   * Triggers execution with the given data.
   * @param data The data to trigger execution.
   * @returns Observable with the trigger result.
   */
  executioTrigger(data:any):Observable<any>{
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    return this.http.post(`${this.config.apiUrl}execution/trigger`,data, { headers });
  }

  /**
   * Gets result details by execution ID.
   * @param id The execution ID.
   * @returns Observable with the result details.
   */
  resultDetails(id:any):Observable<any>{
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    return this.http.get(`${this.config.apiUrl}execution/getExecutionDetails?id=${id}`, { headers });
  }

  /**
   * Gets script result details by execution result ID.
   * @param id The execution result ID.
   * @returns Observable with the script result details.
   */
  scriptResultDetails(id:any):Observable<any>{
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    return this.http.get(`${this.config.apiUrl}execution/getExecutionResult?execResultId=${id}`, { headers });
  }

  /**
   * Gets execution details for HTML report by execution ID.
   * @param id The execution ID.
   * @returns Observable with the details for HTML report.
   */
  DetailsForHtmlReport(id:any):Observable<any>{
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    return this.http.get(`${this.config.apiUrl}execution/getExecutionDetailsForHtmlReport?executionId=${id}`, { headers });
  }

  /**
   * Schedules execution with the given data.
   * @param data The data to schedule execution.
   * @returns Observable with the scheduling result.
   */
  schedularExecution(data:any):Observable<any>{
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    return this.http.post(`${this.config.apiUrl}api/v1/executionScheduler/create`,data, { headers});
  }

  /**
   * Gets all execution schedulers by category.
   * @param category The category to filter schedulers by.
   * @returns Observable with the schedulers.
   */
  getAllexecutionScheduler(category:string):Observable<any>{
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    return this.http.get(`${this.config.apiUrl}api/v1/executionScheduler/getAll?category=${category}`,{ headers});
  }

  /**
   * Gets the list of users.
   * @returns Observable with the list of users.
   */
  getlistofUsers(): Observable<any>{
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    return this.http.get(`${this.config.apiUrl}execution/getUsers`, { headers });
  }

  /**
   * Gets all executions by execution name with pagination.
   * @param SearchString The execution name to search for.
   * @param category The category to filter executions by.
   * @param page The page number.
   * @param size The page size.
   * @returns Observable with the executions.
   */
  getAllExecutionByName(SearchString: any,category: any,page: number, size: number): Observable<any> {
    const headers = new HttpHeaders({
      // 'Content-Type': 'application/json',
      'Authorization': this.authService.getApiToken()
    });
    return this.http.get(`${this.config.apiUrl}execution/getExecutionsByExecutionName?executionName=${SearchString}&categoryName=${category}&page=${page}&size=${size}&sortBy=createdDate&sortDir=desc`, { headers });
  }

  /**
   * Gets all executions by device name with pagination.
   * @param SearchString The device name to search for.
   * @param category The category to filter executions by.
   * @param page The page number.
   * @param size The page size.
   * @returns Observable with the executions.
   */
  getAllExecutionByDevice(SearchString: any,category: any,page: number, size: number): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    return this.http.get(`${this.config.apiUrl}execution/getExecutionsByDevice?deviceName=${SearchString}&categoryName=${category}&page=${page}&size=${size}&sortBy=createdDate&sortDir=desc`, { headers });
  }
 
  /**
   * Gets all executions by script/test suite name with pagination.
   * @param SearchString The script or test suite name to search for.
   * @param category The category to filter executions by.
   * @param page The page number.
   * @param size The page size.
   * @returns Observable with the executions.
   */
  getAllExecutionByScript(SearchString: any,category: any,page: number, size: number): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    return this.http.get(`${this.config.apiUrl}execution/getExecutionsByScriptTestsuite?scriptTestSuiteName=${SearchString}&categoryName=${category}&page=${page}&size=${size}&sortBy=createdDate&sortDir=desc`, { headers});
  }
  /**
   * Gets all executions by user name with pagination.
   * @param userName The user name to search for.
   * @param category The category to filter executions by.
   * @param page The page number.
   * @param size The page size.
   * @returns Observable with the executions.
   */
  getAllExecutionByUser(userName: any,category: any,page: number, size: number): Observable<any> {
    const headers = new HttpHeaders({
      
      'Authorization': this.authService.getApiToken()
    });
    return this.http.get(`${this.config.apiUrl}execution/getExecutionsByUsername?username=${userName}&categoryName=${category}&page=${page}&size=${size}&sortBy=createdDate&sortDir=desc`, { headers });
  }
  /**
   * Deletes a list of executions.
   * @param data The data containing executions to delete.
   * @returns Observable with the deletion result.
   */
  deleteExecutions(data:any): Observable<any>{
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    return this.http.post(`${this.config.apiUrl}execution/deleteListOfExecutions`,data,{ headers });
  }

  /**
   * Reruns failed scripts for a given execution ID and user.
   * @param id The execution ID.
   * @param user The user name.
   * @returns Observable with the rerun result.
   */
  rerunOnFailure(id:string,user:string): Observable<any>{
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    return this.http.post(`${this.config.apiUrl}execution/rerunFailedScript?execId=${id}&user=${user}`,{},{ headers});
  }

  /**
   * Repeats execution for a given execution ID and user.
   * @param id The execution ID.
   * @param user The user name.
   * @returns Observable with the repeat result.
   */
  repeatExecution(id:string,user:string): Observable<any>{
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    return this.http.post(`${this.config.apiUrl}execution/repeatExecution?execId=${id}&user=${user}`,{},{ headers});
  }

  /**
   * Gets module-wise execution summary by execution ID.
   * @param id The execution ID.
   * @returns Observable with the summary.
   */
  modulewiseSummary(id:string): Observable<any>{
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    return this.http.get(`${this.config.apiUrl}execution/getModulewiseExecutionSummary?executionId=${id}`,{ headers});
  }

  /**
   * Gets live logs for a given execution result ID.
   * @param data The execution result ID.
   * @returns Observable with the live logs as text.
   */
  getLiveLogs(data:any): Observable<any>{
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    return this.http.get(`${this.config.apiUrl}execution/getExecutionLogs?executionResultID=${data}`,{ headers, responseType: 'text' });
  }
 
  /**
   * Gets device logs for a given execution result ID.
   * @param data The execution result ID.
   * @returns Observable with the device logs.
   */
  getDeviceLogs(data:any):  Observable<any>{
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    return this.http.get(`${this.config.apiUrl}execution/getDeviceLogFileNames?executionResultId=${data}`,{ headers});
  }

  /**
   * Gets crash logs for a given execution result ID.
   * @param data The execution result ID.
   * @returns Observable with the crash logs as text.
   */
  getCrashLogs(data:any): Observable<any>{
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    return this.http.get(`${this.config.apiUrl}execution/getCrashLogFileNames?executionResultId=${data}`, { headers, responseType: 'text' });
  }
  /**
   * Downloads a device log file by execution result ID and log file name.
   * @param executioResultId The execution result ID.
   * @param logFileName The log file name.
   * @returns Observable with the log file as a blob.
   */
  downloadLogFile(executioResultId:any, logFileName:any){
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    return this.http.get(`${this.config.apiUrl}execution/downloadDeviceLogFile?executionResId=${executioResultId}&fileName=${logFileName}`, { headers, responseType: 'blob' })
  }
  /**
   * Downloads a crash log file by execution result ID and log file name.
   * @param executioResultId The execution result ID.
   * @param logFileName The log file name.
   * @returns Observable with the crash log file as a blob.
   */
  downloadCrashLogFile(executioResultId:any, logFileName:any){
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    return this.http.get(`${this.config.apiUrl}execution/downloadCrashLogFile?executionResId=${executioResultId}&fileName=${logFileName}`, { headers, responseType: 'blob' })
  }
  /**
   * Deletes a scheduled execution by ID.
   * @param id The scheduled execution ID.
   * @returns Observable with the deletion result.
   */
  deleteScheduleExe(id:any): Observable<any>{
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    return this.http.get(`${this.config.apiUrl}api/v1/executionScheduler/delete?executionScueduleID=${id}`,{ headers});
  }

  /**
   * Deletes executions by date range.
   * @param fromdate The start date.
   * @param toDate The end date.
   * @returns Observable with the deletion result.
   */
  datewiseDeleteExe(fromdate:any,toDate:any): Observable<any>{
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    return this.http.delete(`${this.config.apiUrl}execution/deleteByDateRange?fromDate=${fromdate}&toDate=${toDate}`, { headers }); 
  }

  /**
   * Gets defect types for analysis.
   * @returns Observable with the defect types.
   */
  getDefectTypes(): Observable<any>{
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    return this.http.get(`${this.config.apiUrl}api/v1/analysis/getAnalysisDefectTypes`, { headers});
  }

  /**
   * Saves analysis result for a given execution result ID.
   * @param resultId The execution result ID.
   * @param data The analysis result data.
   * @returns Observable with the save result.
   */
  saveAnalysisResult(resultId:string, data:any):Observable<any>{
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    return this.http.post(`${this.config.apiUrl}api/v1/analysis/saveAnalysisResult?executionResultID=${resultId}`, data, { headers});
  }

  /**
   * Gets module-wise analysis summary for a given execution ID.
   * @param resultId The execution ID.
   * @returns Observable with the summary.
   */
  getModulewiseAnalysisSummary(resultId:string):Observable<any>{
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    return this.http.get(`${this.config.apiUrl}api/v1/analysis/getModulewiseAnalysisSummary?executionID=${resultId}`,  { headers });
  }
  
  /**
   * Gets analysis result for a given execution result ID.
   * @param resultId The execution result ID.
   * @returns Observable with the analysis result.
   */
  getAnalysisResult(resultId:string):Observable<any>{
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    return this.http.get(`${this.config.apiUrl}api/v1/analysis/getAnalysisResult?executionResultID=${resultId}`,  { headers });
  }

  /**
   * Aborts execution for a given execution ID.
   * @param exeId The execution ID.
   * @returns Observable with the abort result.
   */
  abortExecution(exeId:string):Observable<any>{
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': this.authService.getApiToken()
    });
    return this.http.post(`${this.config.apiUrl}execution/abortExecution?execId=${exeId}`,{}, { headers });
  }
  /**
   * Downloads consolidated Excel report for a given execution ID.
   * @param exeId The execution ID.
   * @returns Observable with the Excel report as a blob.
   */
  excelReportConsolidated(exeId:string):Observable<any>{
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    return this.http.get(`${this.config.apiUrl}execution/downloadConsolidatedExcelReport?executionId=${exeId}`, { headers, responseType: 'blob' });
  }
  /**
   * Downloads raw Excel report for a given execution ID.
   * @param exeId The execution ID.
   * @returns Observable with the raw Excel report as a blob.
   */
  rawExcelReport(exeId:string):Observable<any>{
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    return this.http.get(`${this.config.apiUrl}execution/rawExcelReport?executionId=${exeId}`, { headers, responseType: 'blob' });
  }
  /**
   * Downloads XML report for a given execution ID.
   * @param exeId The execution ID.
   * @returns Observable with the XML report as a blob.
   */
  XMLReport(exeId:string):Observable<any>{
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    return this.http.get(`${this.config.apiUrl}execution/downloadXMLReport?executionId=${exeId}`, { headers, responseType: 'blob' });
  }
  /**
   * Downloads all result logs as a ZIP for a given execution ID.
   * @param exeId The execution ID.
   * @returns Observable with the ZIP file as a blob.
   */
  resultsZIP(exeId:string):Observable<any>{
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    return this.http.get(`${this.config.apiUrl}execution/downloadAllResultLogsZip?executionId=${exeId}`, { headers, responseType: 'blob' });
  }
  /**
   * Downloads failed result logs as a ZIP for a given execution ID.
   * @param exeId The execution ID.
   * @returns Observable with the ZIP file as a blob.
   */
  failedResultsZIP(exeId:string):Observable<any>{
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    return this.http.get(`${this.config.apiUrl}execution/downloadFailedResultLogsZip?executionId=${exeId}`, { headers, responseType: 'blob' });
  }
  /**
   * Checks if execution result is failed for a given execution ID.
   * @param exeId The execution ID.
   * @returns Observable with the failure status.
   */
  isfailedExecution(exeId:string):Observable<any>{
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    return this.http.get(`${this.config.apiUrl}execution/isExecutionResultFailed?executionId=${exeId}`, { headers});
  }

  /**
   * Downloads script for a given execution result ID.
   * @param exeId The execution result ID.
   * @returns Observable with the script as a blob and status.
   */
  DownloadScript(exeId:string):Observable<any>{
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    return this.http.get(`${this.config.apiUrl}execution/downloadScript?executionResId=${exeId}`, { headers, responseType: 'blob', observe: 'response' }).pipe(
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
   * Gets execution logs links for a given execution result ID.
   * @param exeId The execution result ID.
   * @returns Observable with the logs as text.
   */
getExecutionLogsLinks(exeId:string):Observable<any>{
  const headers = new HttpHeaders({
    'Authorization': this.authService.getApiToken()
  });
  return this.http.get(`${this.config.apiUrl}execution/getExecutionLogs?executionResultID=${exeId}`, { headers, responseType: 'text' });
}

/**
 * Schedules execution again for a given execution ID.
 * @param executionId The execution ID.
 * @returns Observable with the scheduling result.
 */
scheduleAgain(executionId: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    return this.http.get(`${this.config.apiUrl}api/v1/executionScheduler/scheduleAgain?executionID=${executionId}`, { headers});
  }

/**
 * Cancels a scheduled task for a given execution ID.
 * @param executionId The execution ID.
 * @returns Observable with the cancel result.
 */
cancelTask(executionId: string): Observable<any> {
  const headers = new HttpHeaders({
    'Authorization': this.authService.getApiToken()
  });

  // Use executionID (uppercase ID) as required by backend
  return this.http.get(
    `${this.config.apiUrl}api/v1/executionScheduler/cancel?executionID=${executionId}`,
    { headers }
  );
}

/**
 * Triggers a refresh for the scheduler subject.
 */
private refreshSchedulerSubject = new Subject<void>();
 triggerRefreshScheduler(): void {
    this.refreshSchedulerSubject.next();
  }

  /**
   * Gets the observable for refresh scheduler.
   * @returns Observable for refresh scheduler.
   */
  getRefreshSchedulerObservable() {
    return this.refreshSchedulerSubject.asObservable();
  }
}
