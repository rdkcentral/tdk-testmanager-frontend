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
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, ViewChild, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from '../../../../material/material.module';
import { ApexChart, ApexDataLabels, ApexFill, ApexPlotOptions, ApexResponsive, ApexTitleSubtitle, ApexXAxis, ApexYAxis, ChartComponent, NgApexchartsModule } from 'ng-apexcharts';
import { FormsModule } from '@angular/forms';
import { LivelogDialogComponent } from '../livelog-dialog/livelog-dialog.component';
import { LogfileDialogComponent } from '../logfile-dialog/logfile-dialog.component';
import { ExecutionService } from '../../../../services/execution.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { firstValueFrom, interval, startWith, Subject, switchMap, takeUntil } from 'rxjs';
import { AnalyzeDialogComponent } from '../../analyze-dialog/analyze-dialog.component';
import { CrashlogfileDialogComponent } from '../crashlogfile-dialog/crashlogfile-dialog.component';
import { saveAs } from 'file-saver';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { LoaderComponent } from '../../loader/loader.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';

export type ChartOptions = {
  series: Array<{
    data: number[];
  }>;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  responsive: ApexResponsive[];
  legend: any | "";
  labels: any | "";
  colors: any | "";
  plotOptions: ApexPlotOptions;
  yaxis: ApexYAxis;
  xaxis: ApexXAxis;
  fill: ApexFill;
  title: ApexTitleSubtitle;
};

@Component({
  selector: 'app-details-exe-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    NgApexchartsModule,
    LoaderComponent,
    NgMultiSelectDropDownModule,
  ],
  templateUrl: './details-exe-dialog.component.html',
  styleUrl: './details-exe-dialog.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailsExeDialogComponent {
  @ViewChild('printableArea', { static: false }) printableArea!: ElementRef;
  @ViewChild('chart') chart!: ChartComponent;
  public chartOptions!: Partial<ChartOptions> | any;
  encapsulation!: ViewEncapsulation.None;
  public themeClass: string = 'ag-theme-quartz';
  rowData: any = [];
  rowDataSchudle: any = [];
  executionResultData: any;
  // panelOpenState = false;
  allChecked = false;
  selectedDetails: any[] = [];
  filteredData: any[] = [];
  filterStatus = 'all';
  scriptDetailsData: any;
  trendsArr: string[] = [];
  isFlipped = false;
  moduleTableTitle: any;
  moduleTableData: any;
  analysisTableData: any;
  analysisSummaryData: any;
  keys: string[] = [];
  analysisKeys: string[] = [];
  formatLogs!: string;
  executionResultId: any;
  logFileNames: string[] = [];
  executionId!: string;
  liveLogsData: any;
  liveLogDestroy$ = new Subject<void>();
  deviceDetails: any;
  loggedinUser: any;
  isExpanded = false;
  maxLength: number = 75;
  showAnalyzeLink = false;
  analysisResult: any;
  executionIdLocalStroge: any;
  showPopupFlag = false;
  detailKeys: string[] = ['testCaseCount', 'timeTaken', 'logs'];
  expandedIndexes: number[] = [];
  showFailedZipOption = false;
  safeHtmlContent: SafeHtml | undefined;
  exeLogs: any;
  htmlDetails: any;
  scriptStatus: any;
  showLoader = false;
  deviceList: any;
  selectedDevice: any;
  executionName: any;
  deviceNameArr: any;
  scriptNameArr: any;
  dropdownSettings = {};
  deviceListArray: any[] = [];
  selectedDevices: any[] = [];
  execName = '';
  isChartLoading: boolean = true;
  isAnalysisLoading: boolean = true;

  constructor(
    public dialogRef: MatDialogRef<DetailsExeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public liveLogDialog: MatDialog,
    public logFilesDialog: MatDialog,
    private executionservice: ExecutionService,
    private _snakebar: MatSnackBar,
    public analyzeDialog: MatDialog,
    private changeDetectorRef: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
    @Inject('APP_CONFIG') private config: any
  ) {
    this.executionIdLocalStroge = localStorage.getItem('executionId');
  }
  /**
   * Lifecycle hook that is called after data-bound properties of a directive are initialized.
   * Initializes the component by calling several methods to set up result details, pie chart data,
   * and module-wise execution summary. Additionally, it processes device details by replacing
   * newline characters with HTML line break elements.
   *
   * @returns {void}
   */
  ngOnInit(): void {
    this.loggedinUser = JSON.parse(
      localStorage.getItem('loggedinUser') || '{}'
    );
    this.resultDetails();
    this.isAnalysisLoading = true;
    this.isChartLoading = true;
    this.pieChartData();
    this.modulewiseExeSummary();
    this.analysisSummary();
    this.shwHideFailedDownload();
    this.getExelogDetails();
    let details = this.data.deviceDetails;
    this.deviceDetails = details.replace(/\n/g, '<br>');
    this.changeDetectorRef.detectChanges();
    this.execName = this.data.executionName;
    this.getDeviceByCategory(
      this.data.category,
      this.data.deviceThunderEnabled
    );

    this.dropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'deviceName',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 1,
      allowSearchFilter: true,
    };
  }

  /**
   * Handles the selection of a device item.
   * Checks if the selected device is already present in the `deviceListArray` by comparing device names.
   * If the device is not already selected, adds the device's name to the `deviceListArray`.
   *
   * @param item - The device item to be selected, expected to have a `deviceName` property.
   */
  onDeviceSelect(item: any): void {
    if (
      !this.deviceListArray.some(
        (selectedItem) => selectedItem.deviceName === item.deviceName
      )
    ) {
      this.deviceListArray.push(item.deviceName);
    }
  }

  /**
   * Handles the deselection of a device from the device list.
   *
   * Removes the specified device from the `deviceListArray` based on its `deviceName` property.
   *
   * @param item - The device object to be deselected, expected to have a `deviceName` property.
   */
  onDeviceDeSelect(item: any): void {
    let filterDevice = this.deviceListArray.filter(
      (name) => name != item.deviceName
    );
    this.deviceListArray = filterDevice;
  }

  /**
   * Handles the selection of all items from the provided list.
   * Filters out devices that are already present in `deviceListArray` based on their `id`,
   * then updates `deviceListArray` with the `deviceName` of the remaining devices.
   *
   * @param items - The array of items to select from.
   */
  onSelectAll(items: any[]): void {
    let devices = this.deviceList.filter(
      (item: any) =>
        !this.deviceListArray.find((selected) => selected.id === item.id)
    );
    this.deviceListArray = devices.map((item: any) => item.deviceName);
  }

  /**
   * Handles the event when all items are deselected.
   * Clears the `deviceListArray`, effectively removing all selected devices.
   *
   * @param item - The event or data associated with the deselection action.
   */
  onDeSelectAll(item: any): void {
    this.deviceListArray = [];
  }

  get displayContent(): string {
    return this.isExpanded
      ? this.deviceDetails
      : this.deviceDetails.slice(0, this.maxLength) +
          (this.deviceDetails.length > this.maxLength ? '...' : '');
  }
  toggleMoreLess(): void {
    this.isExpanded = !this.isExpanded;
  }
  /**
   * Generates and sets the options for a pie chart based on the summary data.
   *
   * This method extracts data from the `summaryData` object and dynamically creates
   * the series, labels, and colors for the pie chart. It filters out any data points
   * with a value of 0 and constructs the chart options accordingly.
   *
   * The chart options include:
   * - Series data
   * - Chart type and height
   * - Plot options to disable expand on click
   * - Labels for the pie slices
   * - Legend position
   * - Colors for the pie slices
   * - Data labels with custom formatting
   *
   * @returns {void}
   */
  pieChartData(): void {
    this.isChartLoading = true;
    const summaryData = this.data?.summary || {};
    const fullLabels = [
      'Success',
      'Failure',
      'InProgress',
      'N/A',
      'Timeout',
      'Pending',
      'Skipped',
      'Aborted',
    ];

    const fullColors = [
      '#5BC866',
      '#F87878',
      '#ffff00',
      '#cccccc',
      '#ff9933',
      '#5353c6',
      '#ffbf80',
      '#800000',
    ];

    // Extract data for series and labels dynamically
    const series = [
      summaryData.success || 0,
      summaryData.failure || 0,
      summaryData.inProgressCount || 0,
      summaryData.na || 0,
      summaryData.timeout || 0,
      summaryData.pending || 0,
      summaryData.skipped || 0,
      summaryData.aborted || 0,
    ];
    const filteredData = series
      .map((value, index) => ({
        value,
        label: fullLabels[index],
        color: fullColors[index],
      }))
      .filter((item) => item.value > 0);
    this.chartOptions = {
      series: filteredData.map((item) => item.value),
      chart: {
        height: 130,
        type: 'pie',
      },
      plotOptions: {
        pie: {
          expandOnClick: false,
        },
      },
      labels: filteredData.map((item) => item.label),
      legend: {
        position: 'right',
      },
      dcolors: filteredData.map((item) => item.color),
      dataLabels: {
        enabled: true,
        style: {
          fontSize: '10px',
          fontWeight: 'bold',
        },
        formatter: (val: number, opts: any) => {
          const index = opts.seriesIndex;
          const seriesValue = opts.w.config.series[index];
          return `${seriesValue.toString()}`;
        },
      },
    };
    setTimeout(() => {
      this.isChartLoading = false; // Hide loader after chart is ready
      this.changeDetectorRef.detectChanges();
    }, 500);
  }
  /**
   * Converts a date string into a localized date and time string.
   *
   * @param dateValue - The date string to be converted.
   * @returns The localized date and time string if the input is valid, otherwise an empty string.
   */
  convertDate(dateValue: string): string {
    return dateValue ? new Date(dateValue).toLocaleString() : '';
  }
  /**
   * Processes the execution results data by mapping each item to a new object
   * with additional properties `checked` and `details`. The `checked` property
   * is set to `false` and the `details` property is set to `null`. The processed
   * data is then assigned to `executionResultData` and a copy of it is assigned
   * to `filteredData`.
   *
   * @returns {void}
   */
  resultDetails(): void {
    this.executionResultData = this.data.executionResults.map((item: any) => ({
      ...item,
      checked: true,
      details: null,
    }));
    this.filteredData = [...this.executionResultData];
    for (let i = 0; i < this.filteredData.length; i++) {
      this.scriptStatus = this.filteredData[i];
      console.log(this.scriptStatus.status);
    }
    this.allChecked = true; // Set allChecked to true
    this.updateSelectedDetails(); // Update selected details initially
    this.updateScriptNames();
  }

  // Add new method to update script names array
  updateScriptNames(): void {
    this.scriptNameArr = this.selectedDetails.map((item) => item.name);
  }

  /**
   * Toggles the expansion state of a panel and fetches execution details if expanded.
   *
   * @param parent - The parent object containing the panel state and execution result ID.
   * @param id - The ID of the execution result.
   *
   * This method toggles the `expanded` state of the parent object and updates the `executionResultId`
   * and `panelOpenState` properties. If the panel is expanded and the `details` property of the parent
   * object is not set, it fetches the execution result details from the `executionservice` and parses
   * the response. If the `logs` property in the details is not null, it formats the logs by replacing
   * newline characters with `<br>` tags. If the panel is collapsed, it sets the `details` property of
   * the parent object to null.
   */
  togglePanel(parent: any, id: any, index: number): void {
    parent.expanded = !parent.expanded;
    this.executionResultId = id;
    if (parent.expanded) {
      this.expandedIndexes.push(index);
      if (!parent.details && parent.executionResultID) {
        parent.detailsLoading = true; // Start loading
        this.executionservice
          .scriptResultDetails(parent.executionResultID)
          .subscribe({
            next: (res) => {
              parent.details = res.data;
              const logs = parent.details.logs;
              if (parent.status === 'PENDING' && (!logs || logs === 'null')) {
                parent.formatLogs =
                  'Execution is yet to start, logs are not available.';
              } else {
                parent.formatLogs = logs ? logs.replace(/\n/g, '<br>') : '';
              }
              parent.detailsLoading = false; // Stop loading
              this.changeDetectorRef.detectChanges();
            },
            error: (err) => {
              parent.detailsLoading = false; // Stop loading on error
              this._snakebar.open(err.message, '', {
                duration: 2000,
                panelClass: ['err-msg'],
                horizontalPosition: 'end',
                verticalPosition: 'top',
              });
            },
          });
      }
    } else {
      parent.details = null;
      parent.formatLogs = '';
      parent.detailsLoading = false;
      this.expandedIndexes = this.expandedIndexes.filter((i) => i !== index);
    }
  }

  getExelogDetails() {
    this.executionservice
      .DetailsForHtmlReport(this.data.executionId)
      .subscribe((res) => {
        let details = res.data;
        this.htmlDetails = details;
        for (let i = 0; i < details.length; i++) {
          const element = details[i];
          // this.htmlDetails = element;
          const logs = element.executionLogs;
          const formatLogs = logs ? logs.replace(/\n/g, '<br>') : '';
          this.exeLogs = formatLogs;
          this.changeDetectorRef.detectChanges();
        }
      });
  }
  /**
   * Toggles the checked state of all items in the execution result data.
   *
   * @param {Event} event - The event triggered by the user interaction.
   *
   * This method updates the `allChecked` property based on the event's target checked state.
   * It then iterates through `executionResultData` and sets each item's `checked` property
   * to the value of `allChecked`. Finally, it calls `updateSelectedDetails` and `updateFilteredData`
   * to refresh the relevant data.
   */
  toggleAll(event: Event): void {
    this.allChecked = (event.target as HTMLInputElement).checked;
    this.executionResultData.forEach(
      (item: any) => (item.checked = this.allChecked)
    );
    this.updateSelectedDetails();
    this.updateFilteredData();
    this.updateScriptNames();
  }
  /**
   * Toggles the checkbox state for a specific item in the execution result data.
   *
   * @param index - The index of the item in the execution result data array.
   * @param event - The event object from the checkbox input.
   *
   * This method updates the `checked` property of the item at the specified index
   * based on the checkbox input's checked state. It also updates the `allChecked`
   * property to true if all items in the execution result data are checked, and
   * calls the `updateSelectedDetails` method to reflect the changes.
   */
  toggleCheckbox(index: number, event: Event): void {
    this.executionResultData[index].checked = (
      event.target as HTMLInputElement
    ).checked;
    this.allChecked = this.executionResultData.every(
      (item: any) => item.checked
    );
    this.updateSelectedDetails();
    this.updateScriptNames();
  }
  /**
   * Clears all selections in the execution result data.
   *
   * This method performs the following actions:
   * - Sets the `allChecked` flag to `false`.
   * - Iterates through `executionResultData` and sets the `checked` property of each item to `false`.
   * - Calls `updateSelectedDetails` to refresh the selected details.
   * - Sets the `filterStatus` to `'all'`.
   * - Calls `resultDetails` to update the result details.
   * - Calls `updateFilteredData` to refresh the filtered data.
   *
   * @returns {void}
   */
  clearSelections(): void {
    this.allChecked = false;
    this.executionResultData.forEach((item: any) => (item.checked = false));
    this.updateSelectedDetails();
    this.filterStatus = 'all';
    this.resultDetails();
    this.updateFilteredData();
  }
  /**
   * Applies a filter to the execution result data based on the current filter status.
   * If the filter status is 'all', all execution result data is included in the filtered data.
   * Otherwise, only the items with a status matching the filter status are included.
   * Additionally, updates the `allChecked` property to indicate whether all filtered items are checked,
   * and calls `updateSelectedDetails` to refresh the selected details.
   */
  applyFilter(): void {
    if (this.filterStatus === 'all') {
      this.filteredData = [...this.executionResultData];
    } else {
      this.filteredData = this.executionResultData.filter(
        (item: any) => item.status === this.filterStatus
      );
    }
    this.allChecked = this.filteredData.every((item) => item.checked);
    this.updateSelectedDetails();
  }
  /**
   * Updates the filtered data by applying the current filter criteria.
   * This method calls the `applyFilter` function to refresh the data based on the filter settings.
   *
   * @returns {void}
   */
  updateFilteredData(): void {
    this.applyFilter();
  }
  /**
   * Updates the `selectedDetails` property by filtering the `executionResultData` array.
   * Only items with the `checked` property set to true are included in `selectedDetails`.
   *
   * @returns {void}
   */
  updateSelectedDetails(): void {
    this.selectedDetails = this.executionResultData.filter(
      (item: any) => item.checked
    );
  }
  /**
   * Initiates a live log polling mechanism that fetches live logs every 5 seconds.
   * The polling continues until `liveLogDestroy$` emits a value.
   *
   * The fetched logs are stored in `liveLogsData` and if `liveLogsData` is not empty,
   * a dialog is opened to display the logs.
   *
   * @returns {void}
   */
  liveLogs(): void {
    this.liveLogDialog.open(LivelogDialogComponent, {
      width: '80%',
      height: '80vh',
      maxWidth: '100vw',
      panelClass: 'custom-modalbox',
      data: {
        logs: this.liveLogsData,
        executionId: this.executionResultId,
      },
    });
  }

  /**
   * Fetches device logs for the current execution result and opens a dialog to display them.
   *
   * This method calls the `getDeviceLogs` method of the `executionservice` with the current
   * `executionResultId`. Upon receiving the response, it opens a dialog using `logFilesDialog`
   * to display the log files. The dialog is configured with specific dimensions and a custom
   * panel class.
   *
   * @returns {void}
   */
  logFiles(): void {
    this.executionservice
      .getDeviceLogs(this.executionResultId)
      .subscribe((res) => {
        this.logFilesDialog.open(LogfileDialogComponent, {
          width: '50%',
          height: '70vh',
          maxWidth: '100vw',
          panelClass: 'custom-modalbox',
          data: {
            logFileNames: res.data,
            executionId: this.executionResultId,
          },
        });
      });
  }
  crashLogFiles(): void {
    this.executionservice
      .getCrashLogs(this.executionResultId)
      .subscribe((res) => {
        this.logFilesDialog.open(CrashlogfileDialogComponent, {
          width: '50%',
          height: '70vh',
          maxWidth: '100vw',
          panelClass: 'custom-modalbox',
          data: {
            logFileNames: res,
            executionId: this.executionResultId,
          },
        });
      });
  }
  /**
   * Closes the dialog and returns a value indicating that the action was not confirmed.
   *
   * @remarks
   * This method is typically called when the user cancels or closes the dialog without confirming the action.
   *
   * @returns {void} This method does not return a value.
   */
  onClose(): void {
    this.dialogRef.close(false);
    localStorage.removeItem('executionIdLocalStroge');
  }
  /**
   * Repeats the execution of a process using the execution service.
   *
   * This method calls the `repeatExecution` method of the `executionservice` with the provided execution ID.
   * It subscribes to the observable returned by the service and handles the response and error cases.
   *
   * On success, it displays a success message using the `_snakebar` service.
   * On error, it displays an error message using the `_snakebar` service.
   *
   * @returns {void}
   */
  repeatExecution(): void {
    this.executionservice
      .repeatExecution(this.data.executionId, this.loggedinUser.userName)
      .subscribe({
        next: (res) => {
          this._snakebar.open(res.message, '', {
            duration: 3000,
            panelClass: ['success-msg'],
            verticalPosition: 'top',
          });
        },
        error: (err) => {
          this._snakebar.open(err.message, '', {
            duration: 2000,
            panelClass: ['err-msg'],
            horizontalPosition: 'end',
            verticalPosition: 'top',
          });
        },
      });
  }
  /**
   * Triggers a rerun of a failed execution using the execution service.
   * Displays a success message if the rerun is successful, or an error message if it fails.
   *
   * @returns {void}
   */
  rerunFailure(): void {
    this.executionservice
      .rerunOnFailure(this.data.executionId, this.loggedinUser.userName)
      .subscribe({
        next: (res) => {
          this._snakebar.open(res.message, '', {
            duration: 3000,
            panelClass: ['success-msg'],
            verticalPosition: 'top',
          });
        },
        error: (err) => {
          this._snakebar.open(err.message, '', {
            duration: 2000,
            panelClass: ['err-msg'],
            horizontalPosition: 'end',
            verticalPosition: 'top',
          });
        },
      });
  }
  /**
   * Fetches the module-wise execution summary data from the execution service
   * and processes it to populate the module table data and titles.
   *
   * The method subscribes to the execution service's `modulewiseSummary` observable,
   * and on successful response, it parses the response data, extracts keys, and
   * constructs the module table title array. It also handles the 'Total' key separately
   * by pushing it to the end of the module table title array.
   *
   * In case of an error, it parses the error message and displays it using a snackbar.
   *
   * @returns {void}
   */
  modulewiseExeSummary(): void {
    this.isAnalysisLoading = true;
    this.executionservice.modulewiseSummary(this.data.executionId).subscribe({
      next: (res) => {
        this.moduleTableData = res.data;
        this.keys = Object.keys(this.moduleTableData);
        this.moduleTableTitle = this.keys
          .filter((key) => key !== 'Total')
          .map((key) => ({ name: key, ...this.moduleTableData[key] }));

        const totalData = this.moduleTableData['Total'];
        this.moduleTableTitle.push({ name: 'Total', ...totalData });
        this.isAnalysisLoading = false;
        this.changeDetectorRef.detectChanges();
      },
      error: (err) => {
        let errmsg = JSON.parse(err.error);
        this._snakebar.open(errmsg.message, '', {
          duration: 2000,
          panelClass: ['err-msg'],
          horizontalPosition: 'end',
          verticalPosition: 'top',
        });
      },
    });
  }
  /**
   * This method is for showing the table view of analysis summary .
   */
  analysisSummary(): void {
    this.executionservice
      .getModulewiseAnalysisSummary(this.data.executionId)
      .subscribe({
        next: (res) => {
          this.analysisTableData = res.data;
          this.keys = Object.keys(this.analysisTableData);
          this.analysisSummaryData = this.keys
            .filter((key) => key !== 'Total')
            .map((key) => ({ name: key, ...this.analysisTableData[key] }));

          const totalData = this.analysisTableData['Total'];
          this.analysisSummaryData.push({ name: 'Total', ...totalData });
        },
        error: (err) => {
          this._snakebar.open(err.message, '', {
            duration: 2000,
            panelClass: ['err-msg'],
            horizontalPosition: 'end',
            verticalPosition: 'top',
          });
        },
      });
  }
  /**
   * Updates the data by fetching result details from the execution service.
   * Parses the response and updates the component's data.
   * Calls methods to update the pie chart data and result details.
   *
   * @returns {void}
   */
  dataUpdate(): void {
    this.executionservice
      .resultDetails(this.executionIdLocalStroge)
      .subscribe((res) => {
        this.data = res.data;
        this.pieChartData();
        this.resultDetails();
        this.changeDetectorRef.detectChanges();
      });
  }
  /**
   * This method is for tabchange .
   */
  onTabClick(event: any): void {
    const label = event.tab.textLabel;
    this.changeDetectorRef.detectChanges();
  }
  /**
   * This method is open the modal for link the JIRA ticket.
   */
  openAnalyzeDialog(patent: any): void {
    const dialogRef = this.analyzeDialog.open(AnalyzeDialogComponent, {
      width: '99%',
      height: '96vh',
      maxWidth: '90vw',
      panelClass: 'custom-modalbox',
      data: { ...patent, category: this.data.category },
    });
    dialogRef.afterClosed().subscribe((result) => {
      this.dataUpdate();
      if (result) {
        this.dataUpdate();
      }
    });
  }
  /**
   * This method is LInk the JIRA ticket of the scripts.
   */
  openAnalyzeLinkDialog(parent: any, isAnalyze: any): void {
    if (parent.analysisTicket) {
      this.executionservice
        .getAnalysisResult(parent.executionResultID)
        .subscribe(async (res) => {
          this.analysisResult = res.data;
          this.analysisResult.name = parent.name;
          this.analysisResult.executionResultID = parent.executionResultID;
          this.analysisResult.category = this.data.category;
          const dialogRef = this.analyzeDialog.open(AnalyzeDialogComponent, {
            width: '99%',
            height: '96vh',
            maxWidth: '90vw',
            panelClass: 'custom-modalbox',
            data: this.analysisResult,
          });
          const dialogResult = await firstValueFrom(dialogRef.afterClosed());
          if (dialogResult) {
            this.dataUpdate();
          }
        });
    }
  }
  /**
   * This method is open the popup.
   */
  showPopup(): void {
    this.showPopupFlag = true;
  }
  /**
   * This method is close the popup.
   */
  closePopup(): void {
    this.showPopupFlag = false;
  }
  /**
   * This method is for download the raw Report of executions as excel format.
   */
  rawReportDownload(): void {
    if (this.data.executionId) {
      this.executionservice.rawExcelReport(this.data.executionId).subscribe({
        next: (blob) => {
          const xmlBlob = new Blob([blob], { type: 'application/xml' });
          const url = window.URL.createObjectURL(xmlBlob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `RawReport_${this.data.deviceName}_${this.data.executionId}.xlsx`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        },
        error: (err) => {
          let errmsg = JSON.parse(err.error);
          this._snakebar.open(errmsg, '', {
            duration: 2000,
            panelClass: ['err-msg'],
            horizontalPosition: 'end',
            verticalPosition: 'top',
          });
        },
      });
    }
  }
  /**
   * This method is for download the consolidatedReport of executions as excel format.
   */
  consolidatedReport(): void {
    if (this.data.executionId) {
      this.executionservice
        .excelReportConsolidated(this.data.executionId)
        .subscribe({
          next: (blob) => {
            const xmlBlob = new Blob([blob], { type: 'application/xml' });
            const url = window.URL.createObjectURL(xmlBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `ExecutionResults_${this.data.deviceName}_${this.data.executionId}.xlsx`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
          },
          error: (err) => {
            let errmsg = JSON.parse(err.error);
            this._snakebar.open(errmsg, '', {
              duration: 2000,
              panelClass: ['err-msg'],
              horizontalPosition: 'end',
              verticalPosition: 'top',
            });
          },
        });
    }
  }
  /**
   * This method is for download the executions as XML format.
   */
  XMLReportDownload() {
    if (this.data.executionId) {
      this.executionservice.XMLReport(this.data.executionId).subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `ExecutionReport_${this.data.deviceName}_${this.data.executionId}.xml`;

          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        },
        error: (err) => {
          let errmsg = JSON.parse(err.error);
          this._snakebar.open(errmsg, '', {
            duration: 2000,
            panelClass: ['err-msg'],
            horizontalPosition: 'end',
            verticalPosition: 'top',
          });
        },
      });
    }
  }
  /**
   * This method is for download all the execution results.
   */
  resultsZIP(): void {
    if (this.data.executionId) {
      this.executionservice.resultsZIP(this.data.executionId).subscribe({
        next: (blob) => {
          const xmlBlob = new Blob([blob], { type: 'application/zip' });
          const url = window.URL.createObjectURL(xmlBlob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `Execution_Logs_${this.data.deviceName}_${this.data.executionId}.zip`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        },
        error: (err) => {
          let errmsg = JSON.parse(err.error);
          this._snakebar.open(errmsg, '', {
            duration: 2000,
            panelClass: ['err-msg'],
            horizontalPosition: 'end',
            verticalPosition: 'top',
          });
        },
      });
    }
  }
  shwHideFailedDownload(): void {
    if (this.data.executionId) {
      this.executionservice
        .isfailedExecution(this.data.executionId)
        .subscribe((res) => {
          let resData = res.data;
          if (resData === true) {
            this.showFailedZipOption = true;
          } else {
            this.showFailedZipOption = false;
          }
        });
    }
  }
  /**
   * This method is for download all failed execution results.
   */
  failResultsZIP(): void {
    if (this.data.executionId) {
      this.executionservice.failedResultsZIP(this.data.executionId).subscribe({
        next: (blob) => {
          const xmlBlob = new Blob([blob], { type: 'application/zip' });
          const url = window.URL.createObjectURL(xmlBlob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `Failed_Execution_Logs_${this.data.deviceName}_${this.data.executionId}.zip`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        },
        error: (err) => {
          let errmsg = JSON.parse(err.error);
          this._snakebar.open(errmsg, '', {
            duration: 2000,
            panelClass: ['err-msg'],
            horizontalPosition: 'end',
            verticalPosition: 'top',
          });
        },
      });
    }
  }
  /**
   * This method is for download all options at a time.
   */
  downLoadAll(): void {
    this.rawReportDownload();
    this.consolidatedReport();
    this.XMLReportDownload();
    this.resultsZIP();
    this.failResultsZIP();
    this.downloadAsHtml();
  }
  closeLastExpanded() {
    if (this.expandedIndexes.length > 0) {
      const lastIndex = this.expandedIndexes.pop();
      if (lastIndex !== undefined) {
        this.filteredData[lastIndex].expanded = false;
      }
    }
  }

  scriptDownload(parent: any): void {
    if (parent.executionResultID) {
      this.executionservice.DownloadScript(parent.executionResultID).subscribe({
        next: (res) => {
          const filename = res.filename;
          const blob = new Blob([res.content], {
            type: res.content.type || 'application/json',
          });
          saveAs(blob, filename);
        },
        error: (err) => {
          // let errmsg = err.error;
          this._snakebar.open(err, '', {
            duration: 2000,
            panelClass: ['err-msg'],
            horizontalPosition: 'end',
            verticalPosition: 'top',
          });
        },
      });
    }
  }

  openDynamicLink(id: string) {
    const url = `${this.config.apiUrl}execution/getExecutionLogs?executionResultID=${id}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  openLogLink() {
    const url = `${this.config.apiUrl}execution/getExecutionLogs?executionResultID`;
    window.open(url, '_blank', 'noopener noreferrer');
  }

  downloadAsHtml() {
    const tableRows = this.moduleTableTitle
      .map(
        (key: any) => `
    <tr class="method">
      <td>${key.name}</td>
      <td>${key.totalScripts}</td>
      <td>${key.success}</td>
      <td>${key.failure}</td>
      <td>${key.aborted}</td>
      <td>${key.executed}</td>
      <td>${key.inProgressCount}</td>
      <td>${key.na}</td>
      <td>${key.pending}</td>
      <td>${key.skipped}</td>
      <td>${key.timeout}</td>
      <td class="passvalue">${key.successPercentage}</td>
    </tr>
  `
      )
      .join('');

    const scripNames = this.filteredData
      .map((script: any) => {
        // Find corresponding details from htmlDetails if available
        const scriptDetails = this.htmlDetails?.find(
          (detail: any) =>
            detail.executionResultID === script.executionResultID ||
            detail.executionScriptName === script.name
        );

        const executionLogs =
          scriptDetails?.executionLogs || script.logs || 'No logs available';

        return `
      <tr>
        <th>Script Name</th>
        <td>${script.name}</td>
      </tr>
      <tr>
        <th>Status</th>
        <td class="status-${script.status.toLowerCase()}">${script.status}</td>
      </tr>
      <tr>
        <th>Execution Log
          <div><a href="${
            this.config.apiUrl
          }execution/getExecutionLogs?executionResultID=${
          script.executionResultID
        }" target="_blank" rel="noopener noreferrer" class="log-link">View Full Log</a></div>
        </th>
        <td><div class="log-content">${executionLogs}</div></td>
      </tr>
      <tr class="separator-row"><td colspan="2"></td></tr>
    `;
      })
      .join('');

    const htmlContent = `
    <html>
    <head>
      <title>TDK Execution Result Report</title>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        /* Reset and Base Styles */
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          font-size: 14px;
          line-height: 1.6;
          color: #2c3e50;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          padding: 20px;
          min-height: 100vh;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          background: white;
          border-radius: 10px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        /* Header Styles */
        .report-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          text-align: center;
          position: relative;
        }

        .report-header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
        }

        .header-content {
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 1;
        }

        .tdk-logo {
          width: 60px;
          height: 60px;
          margin-right: 20px;
          background: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          color: #2980b9;
          font-size: 18px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }

        .header-text {
          text-align: left;
        }

        .report-title {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 10px;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }

        .report-subtitle {
          font-size: 1.1rem;
          opacity: 0.9;
        }

        /* Content Area */
        .content {
          padding: 30px;
        }

        /* Section Styles */
        .section {
          margin-bottom: 40px;
        }

        .section-title {
          color: #2980b9;
          font-size: 1.8rem;
          font-weight: 600;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 3px solid #3498db;
          position: relative;
        }

        .section-title::after {
          content: '';
          position: absolute;
          bottom: -3px;
          left: 0;
          width: 50px;
          height: 3px;
          background: #e74c3c;
        }

        /* Table Styles */
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 25px;
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          table-layout: fixed;
        }

        thead {
          background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
          color: white;
        }

        th {
          padding: 15px 12px;
          text-align: left;
          font-weight: 600;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-right: 1px solid rgba(255, 255, 255, 0.2);
        }

        th:last-child {
          border-right: none;
        }

        td {
          padding: 12px;
          border-bottom: 1px solid #ecf0f1;
          border-right: 1px solid #ecf0f1;
          transition: background-color 0.3s ease;
          vertical-align: top;
          word-wrap: break-word;
        }

        td:last-child {
          border-right: none;
        }

        tbody tr:hover {
          background-color: #f8f9fa;
        }

        tbody tr:nth-child(even) {
          background-color: #fdfdfd;
        }

        /* Details Table Specific Styles */
        .details-table {
          table-layout: fixed;
        }

        .details-table th {
          background: #34495e;
          color: white;
          width: 200px;
          font-weight: 600;
          vertical-align: top;
        }

        .details-table td {
          background: #ffffff;
          vertical-align: top;
          width: calc(100% - 200px);
        }

        /* Status Styles */
        .status-success {
          color: #27ae60;
          font-weight: 600;
          padding: 4px 8px;
          background: #d5f4e6;
          border-radius: 4px;
          display: inline-block;
        }

        .status-failure, .status-failed {
          color: #e74c3c;
          font-weight: 600;
          padding: 4px 8px;
          background: #fdf2f2;
          border-radius: 4px;
          display: inline-block;
        }

        .status-pending {
          color: #f39c12;
          font-weight: 600;
          padding: 4px 8px;
          background: #fef9e7;
          border-radius: 4px;
          display: inline-block;
        }

        .status-inprogress {
          color: #3498db;
          font-weight: 600;
          padding: 4px 8px;
          background: #ebf3fd;
          border-radius: 4px;
          display: inline-block;
        }

        /* Success Percentage Highlighting */
        .passvalue {
          font-weight: 700;
          color: #27ae60;
          background: linear-gradient(135deg, #a8e6cf 0%, #dcedc1 100%);
          text-align: center;
          border-radius: 4px;
        }

        /* Links */
        .log-link {
          color: #3498db;
          text-decoration: none;
          font-weight: 600;
          padding: 6px 12px;
          background: #ebf3fd;
          border-radius: 4px;
          display: inline-block;
          transition: all 0.3s ease;
          border: 1px solid #3498db;
          margin-bottom: 10px;
        }

        .log-link:hover {
          background: #3498db;
          color: white;
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(52, 152, 219, 0.3);
        }

        /* COMPLETELY FIXED: Log Content with proper scrolling */
        .log-content {
          font-family: 'Courier New', monospace;
          font-size: 0.8rem;
          background: #f8f9fa;
          border: 1px solid #dee2e6;
          border-radius: 4px;
          border-left: 4px solid #3498db;
          padding: 12px;
          
          /* Critical: Set dimensions and overflow */
          width: 100%;
          min-height: 100px;
          max-height: 300px;
          
          /* Enable both horizontal and vertical scrolling */
          overflow: auto;
          
          /* Preserve whitespace and formatting exactly as is */
          white-space: pre;
          
          /* Prevent text wrapping */
          word-wrap: normal;
          word-break: normal;
          
          /* Ensure content doesn't break container */
          box-sizing: border-box;
          
          /* Line height for readability */
          line-height: 1.4;
          
          /* Text selection */
          user-select: text;
          
          /* Custom scrollbar styling */
          scrollbar-width: thin;
          scrollbar-color: #3498db #f1f1f1;
        }

        /* Enhanced scrollbar for webkit browsers */
        .log-content::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        .log-content::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }

        .log-content::-webkit-scrollbar-thumb {
          background: #3498db;
          border-radius: 4px;
        }

        .log-content::-webkit-scrollbar-thumb:hover {
          background: #2980b9;
        }

        .log-content::-webkit-scrollbar-corner {
          background: #f1f1f1;
        }

        /* Separator Row */
        .separator-row td {
          padding: 15px 0;
          border-bottom: 3px solid #3498db;
          background: linear-gradient(90deg, transparent 0%, #3498db 50%, transparent 100%);
        }

        /* Summary Cards */
        .summary-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          body {
            padding: 10px;
            font-size: 12px;
          }

          .report-title {
            font-size: 2rem;
          }

          .content {
            padding: 20px;
          }

          .section-title {
            font-size: 1.5rem;
          }

          .header-content {
            flex-direction: column;
          }

          .tdk-logo {
            margin-right: 0;
            margin-bottom: 15px;
          }

          .header-text {
            text-align: center;
          }

          table {
            font-size: 0.8rem;
          }

          th, td {
            padding: 8px 6px;
          }

          .details-table th {
            width: 120px;
          }

          .log-content {
            font-size: 0.7rem;
            padding: 8px;
            max-height: 200px;
          }
        }

        /* Print Styles */
        @media print {
          body {
            background: white;
            padding: 0;
          }

          .container {
            box-shadow: none;
            border-radius: 0;
          }

          .report-header {
            background: #3498db !important;
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
          }

          .log-link {
            background: #ebf3fd !important;
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
          }

          .log-content {
            max-height: none !important;
            overflow: visible !important;
            white-space: pre-wrap !important;
            font-size: 0.6rem;
            border: 1px solid #ccc !important;
          }

          table {
            break-inside: avoid;
          }

          .section {
            break-inside: avoid;
          }
        }

        /* Animation */
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .section {
          animation: fadeIn 0.6s ease-out;
        }

        /* Additional utility classes for log handling */
        .log-container {
          position: relative;
          margin-top: 10px;
        }

        .log-header {
          background: #34495e;
          color: white;
          padding: 8px 12px;
          border-radius: 4px 4px 0 0;
          font-weight: 600;
          font-size: 0.9rem;
        }

        /* Force table cells containing logs to not overflow */
        .details-table td:has(.log-content) {
          max-width: 0;
          overflow: visible;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="report-header">
          <h1 class="report-title">📊 TDK Execution Result Report</h1>
          <p class="report-subtitle">Comprehensive Test Execution Analysis</p>
        </div>
        
        <div class="content">
          <div class="section">
            <h2 class="section-title">🔧 Execution Details: ${
              this.execName
            }</h2>
            <table class="details-table">
              <tbody>
                <tr>
                  <th>🖥️ Device Name</th>
                  <td>${this.data.deviceName}</td>
                </tr>
                <tr>
                  <th>🌐 IP / MAC</th>
                  <td>${this.data.deviceIP} / ${this.data.deviceMac}</td>
                </tr>
                <tr>
                  <th>💿 Image Details</th>
                  <td>${this.deviceDetails}</td>
                </tr>
                <tr>
                  <th>📅 Date of Execution</th>
                  <td>${this.convertDate(this.data.dateOfExecution)}</td>
                </tr>
                <tr>
                  <th>⏱️ Total Execution Time (min)</th>
                  <td>${this.data.totalExecutionTime}</td>
                </tr>
                <tr>
                  <th>🎯 Overall Result</th>
                  <td class="status-${this.data.result.toLowerCase()}">${
      this.data.result
    }</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div class="section">
            <h2 class="section-title">📈 Result Summary</h2>
            <table>
              <thead>
                <tr>
                  <th>📋 Module Name</th>
                  <th>📊 Total Scripts</th>
                  <th>✅ Success</th>
                  <th>❌ Failure</th>
                  <th>🚫 Aborted</th>
                  <th>🔄 Executed</th>
                  <th>⏳ In Progress</th>
                  <th>❓ N/A</th>
                  <th>⏸️ Pending</th>
                  <th>⏭️ Skipped</th>
                  <th>⏰ Timeout</th>
                  <th>📈 Success %</th>
                </tr>
              </thead>
              <tbody>
                ${tableRows}
              </tbody>
            </table>
          </div>
          
          <div class="section">
            <h2 class="section-title">📝 Detailed Results</h2>
            <table class="details-table">
              <tbody>
                ${scripNames}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${this.execName}.html`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  /**
   * Retrieves a list of devices based on the specified category and Thunder enablement status.
   *
   * @param category - The category of devices to retrieve.
   * @param isThunderEnable - A boolean indicating whether to filter devices by Thunder enablement.
   * @returns void
   *
   * @remarks
   * This method calls the execution service to fetch devices matching the given category and Thunder status,
   * and assigns the resulting device list to `this.deviceList`.
   */
  getDeviceByCategory(category: string, isThunderEnable: boolean): void {
    this.executionservice
      .getDeviceByCategory(category, isThunderEnable)
      .subscribe((res) => {
        this.deviceList = res.data;
      });
  }

  /**
   * Retrieves an execution name based on the current device list and a fixed test type ('Other').
   * Sends a request to the execution service and assigns the resulting execution name to `this.executionName`.
   *
   * @remarks
   * The method constructs an object containing the device names and test type, then calls the `geExecutionName`
   * method of the execution service. The response's `data` property is assigned to the `executionName` property.
   *
   * @returns {void}
   */
  getExecutionName(): void {
    let obj = {
      deviceNames: this.deviceListArray,
      testType: 'Other',
    };
    this.executionservice.geExecutionName(obj).subscribe((res) => {
      this.executionName = res.data;
    });
  }

  /**
   * Triggers the execution process based on the selected devices and scripts.
   *
   * This method constructs an execution trigger object with the current selection of devices,
   * scripts, user information, and execution parameters. It then calls the execution service
   * to initiate the execution. Upon successful triggering, it resets the device selection,
   * refreshes the device list, and displays a success message. If an error occurs, an error
   * message is shown to the user.
   *
   * @remarks
   * - Relies on `this.deviceListArray`, `this.scriptNameArr`, `this.loggedinUser`, and `this.data`.
   * - Uses Angular's ChangeDetectorRef and MatSnackBar for UI updates and notifications.
   *
   * @returns {void}
   */
  triggerExecution() {
    this.getExecutionName();
    let triggerObj = {
      deviceList: this.deviceListArray,
      scriptList: this.scriptNameArr,
      testSuite: [],
      testType: 'Other',
      individualRepeatExecution: false,
      user: this.loggedinUser.userName,
      category: this.data.category,
      executionName: this.executionName,
      repeatCount: 1,
      deviceLogsNeeded: false,
      diagnosticLogsNeeded: false,
      performanceLogsNeeded: false,
      rerunOnFailure: false,
    };

    this.executionservice.executioTrigger(triggerObj).subscribe({
      next: (res) => {
        if (
          res.statusCode === 200 &&
          res.data.executionTriggerStatus === 'TRIGGERED'
        ) {
          this.deviceListArray = [];
          this.selectedDevices = [];
          this.getDeviceByCategory(
            this.data.category,
            this.data.deviceThunderEnabled
          );
          this.changeDetectorRef.detectChanges();
          this._snakebar.open('Execution triggered', '', {
            duration: 3000,
            panelClass: ['success-msg'],
            verticalPosition: 'top',
          });
        }
      },
      error: (err) => {
        this._snakebar.open(err.message, '', {
          duration: 2000,
          panelClass: ['err-msg'],
          horizontalPosition: 'end',
          verticalPosition: 'top',
        });
      },
    });
  }
}
