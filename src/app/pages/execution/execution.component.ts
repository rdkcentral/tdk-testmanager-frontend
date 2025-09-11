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
import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../material/material.module';
import { AgGridAngular } from 'ag-grid-angular';
import {
  ColDef,
  GridApi,
  GridOptions,
  GridReadyEvent,
  IDateFilterParams,
} from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { AuthService } from '../../auth/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ExecutionButtonComponent } from '../../utility/component/execution-button/execution-button.component';
import { DetailsExeDialogComponent } from '../../utility/component/details-execution/details-exe-dialog/details-exe-dialog.component';
import { ExecutionService } from '../../services/execution.service';
import { ExecuteDialogComponent } from '../../utility/component/execute-dialog/execute-dialog.component';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { Clipboard } from '@angular/cdk/clipboard';
import { LoginService } from '../../services/login.service';
import { DateDialogComponent } from '../../utility/component/date-dialog/date-dialog.component';
import { MatPaginator } from '@angular/material/paginator';
import { ScheduleButtonComponent } from '../../utility/component/execution-button/schedule-button.component';
import { TdkInstallComponent } from '../../utility/component/tdk-install/tdk-install.component';
import { LoaderComponent } from '../../utility/component/loader/loader.component';

@Component({
  selector: 'app-execution',
  standalone: true,
  imports: [
    CommonModule,
    AgGridAngular,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    LoaderComponent,
  ],
  templateUrl: './execution.component.html',
  styleUrls: ['./execution.component.css'],
})
export class ExecutionComponent implements OnInit, OnDestroy {
  @ViewChild('deviceSearchInput') deviceSearchInput!: ElementRef;
  @ViewChild('tableSearchInput') tableSearchInput!: ElementRef;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('historyTable') historyTable: any;

  executeName: string = 'Execute';
  selectedCategory: string = 'All';
  public themeClass: string = 'ag-theme-quartz ag-theme-quartz-copyable';
  rowData: any = [];
  rowDataSchudle: any = [];
  selectedRowCount = 0;
  totalItems = 0;
  currentPage = 0;
  pageSize = 10;
  schedulePageSize = 10;
  schedulePageSizeSelector: number[] | boolean = [10, 20, 50];
  public gridApi!: GridApi;
  selectedRowIds: Set<number> = new Set();

  filterParams: IDateFilterParams = {
    comparator: (filterLocalDateAtMidnight: Date, cellValue: string) => {
      var dateAsString = cellValue;
      if (dateAsString == null) return -1;
      var dateParts = dateAsString.split('-');
      var cellDate = new Date(
        Number(dateParts[2]),
        Number(dateParts[1]) - 1,
        Number(dateParts[0])
      );
      if (filterLocalDateAtMidnight.getTime() === cellDate.getTime()) {
        return 0;
      }
      if (cellDate < filterLocalDateAtMidnight) {
        return -1;
      }
      if (cellDate > filterLocalDateAtMidnight) {
        return 1;
      }
      return 0;
    },
    minValidYear: 2000,
    maxValidYear: 2024,
    inRangeFloatingFilterDateFormat: 'DD MMM YYYY',
  };
  public columnDefs: ColDef[] = [
    {
      headerCheckboxSelection: true,
      checkboxSelection: true,
      headerCheckboxSelectionFilteredOnly: true,
      headerComponentParams: {
        label: 'Select All',
      },
      width: 45,
      resizable: false,
    },
    {
      headerName: 'Execution Name',
      field: 'executionName',
      filter: 'agTextColumnFilter',
      sortable: true,
      tooltipField: 'executionName',
      cellClass: 'selectable',
      flex: 2,
      cellStyle: { 'white-space': 'normal', ' word-break': 'break-word' },
      wrapText: true,
      headerClass: 'header-center',
      resizable: false,
      cellRenderer: (params: any) => {
        const text = params.value || '';
        if (text.length > 50) {
          return `${text.slice(0, 50)}...`;
        }
        return text;
      },
      valueFormatter: (params) => {
        if (params.value) {
          return params.value.toString().toUpperCase();
        }
        return '';
      },
    },
    {
      headerName: 'Scripts/Testsuite',
      field: 'scriptTestSuite',
      filter: 'agTextColumnFilter',
      sortable: true,
      tooltipField: 'scriptTestSuite',
      flex: 2,
      resizable: false,
      cellRenderer: (params: any) => {
        const text = params.value || '';
        if (text.length > 30) {
          return `${text.slice(0, 30)}...`;
        }
        return text;
      },
      cellClass: (params: any) => {
        return params.value.length > 30 ? 'text-ellipsis' : 'text-two-line';
      },
      valueFormatter: (params) => {
        if (params.value) {
          return params.value.toString().toUpperCase();
        }
        return '';
      },
    },
    {
      headerName: 'Device',
      field: 'device',
      filter: 'agTextColumnFilter',
      sortable: true,
      tooltipField: 'device',
      cellClass: 'selectable',
      width: 130,
      cellStyle: { 'white-space': 'normal', ' word-break': 'break-word' },
      wrapText: true,
      resizable: false,
      valueFormatter: (params) => {
        if (params.value) {
          return params.value.toString().toUpperCase();
        }
        return '';
      },
    },
    {
      headerName: 'Date Of Execution',
      field: 'executionDate',
      filter: 'agDateColumnFilter',
      filterParams: this.filterParams,
      flex: 1.8,
      sortable: true,
      cellClass: 'selectable',
      resizable: false,
      cellRenderer: (data: any) => {
        return data.value ? new Date(data.value).toLocaleString() : '';
      },
    },
    {
      headerName: 'User',
      field: 'user',
      filter: 'agTextColumnFilter',
      filterParams: this.filterParams,
      width: 90,
      sortable: true,
      cellClass: 'selectable',
      resizable: false,
      valueFormatter: (params) => {
        if (params.value) {
          return params.value.toString().toUpperCase();
        }
        return '';
      },
    },
    {
      headerName: 'Result',
      field: 'status',
      filter: 'agTextColumnFilter',
      flex: 1,
      cellStyle: { textAlign: 'center' },
      sortable: true,
      resizable: false,
      cellClass: 'selectable',
      cellRenderer: (params: any) => {
        const status = params.value;
        let iconHtml = '';
        switch (status) {
          case 'SUCCESS':
            iconHtml = `<span style="color:#5BC866; font-size:0.66rem; font-weight:500;" title="Success">SUCCESS</span>`;
            break;
          case 'FAILURE':
            iconHtml = `<span style="color:#F87878; font-size:0.66rem; font-weight:500;" title="Failure">FAILURE</span>`;
            break;
          case 'INPROGRESS':
            iconHtml = `<span style=" color:#6460C1; font-size:0.66rem; font-weight:500;" title="Inprogress">INPROGRESS</span>`;
            break;
          case 'ABORTED':
            iconHtml = `<span style="color:#FFB237; font-size:0.66rem; font-weight:500;" title="Aborted">ABORTED</span>`;
            break;
          case 'PAUSED':
            iconHtml = `<span style="color:gray; font-size:0.66rem; font-weight:500;" title="Paused">PAUSED</span>`;
            break;
          default:
            return;
        }
        return iconHtml;
      },
    },
    {
      headerName: 'Action',
      field: '',
      width: 115,
      sortable: false,
      headerClass: 'no-sort header-center',
      resizable: false,
      cellRenderer: ExecutionButtonComponent,
      cellRendererParams: (params: any) => ({
        onViewClick: this.openDetailsModal.bind(this),
        onDownloadClick: this.downloadExcel.bind(this),
        onAbortClick: this.onAbort.bind(this),
        selectedRowCount: () => this.selectedRowCount,
      }),
    },
  ];
  defaultColDef = {
    sortable: true,
    headerClass: 'header-center',
  };
  public columnSchudle: ColDef[] = [
    {
      headerName: 'Job Name',
      field: 'jobName',
      flex: 1.7,
      filter: 'agTextColumnFilter',
      width: 190,
      sortable: true,
      headerClass: 'header-center',
      resizable: false,
      cellClass: 'ag-cell-selectable',
      cellRenderer: (params: any) => {
        const text = params.value || '';
        if (text.length > 40) {
          return `${text.slice(0, 40)}...`;
        }
        return text;
      },
    },
    {
      headerName: 'Execution/Start Time',
      field: 'executionStartTime',
      filter: 'agDateColumnFilter',
      flex: 1.5,
      width: 180,
      minWidth: 180,
      sortable: true,
      resizable: true,
      headerClass: 'header-center',
      wrapHeaderText: true,
      autoHeaderHeight: true,
      cellStyle: { 'white-space': 'normal', 'text-align': 'center' },

      // This is used for sorting/filtering, not display
      valueGetter: (params: any) => {
        const value = params.data.cronStartTime || params.data.executionTime;
        return value ? new Date(value) : null; // Make sure it's a Date object for correct sorting
      },

      // This is used only for display
      cellRenderer: (params: any) => {
        const value = params.data.cronStartTime || params.data.executionTime;
        if (value) {
          const formattedValue = this.formatTime(value);
          const [date, time] = formattedValue.split(', ');
          return `<div style="white-space: normal; text-align: center;">
                <span>${date}</span><br>
                <span>${time}</span>
              </div>`;
        }
        return '';
      },

      // Optional: explicitly set a comparator if you want control
      comparator: (valueA: Date, valueB: Date) => {
        if (!valueA) return -1;
        if (!valueB) return 1;
        return valueA.getTime() - valueB.getTime();
      },
    },
    {
      headerName: 'End Time',
      field: 'executionEndTime',
      filter: 'agTextColumnFilter',
      width: 180,
      sortable: true,
      resizable: false,
      headerClass: 'header-center',
      cellRenderer: (params: any) => {
        // If cronEndTime exists, it's a recurring schedule
        if (params.data.cronEndTime) {
          return this.formatTime(params.data.cronEndTime);
        }
        // Otherwise, it's one-time
        return 'N/A';
      },
      cellClass: 'ag-cell-selectable',
    },
    {
      headerName: 'Scripts/Testsuite',
      field: 'scriptTestSuite',
      filter: 'agTextColumnFilter',
      flex: 2.5,
      sortable: true,
      resizable: false,
      headerClass: 'header-center',
      cellClass: 'ag-cell-selectable',
      cellRenderer: (params: any) => {
        const text = params.value || '';
        if (text.length > 40) {
          return `${text.slice(0, 40)}...`;
        }
        return text;
      },
    },
    {
      headerName: 'Device',
      field: 'device',
      filter: 'agTextColumnFilter',
      flex: 1.5,
      sortable: true,
      resizable: false,
      headerClass: 'header-center',
      cellClass: 'ag-cell-selectable',
    },
    {
      headerName: 'Details',
      field: 'details',
      filter: 'agDateColumnFilter',
      filterParams: this.filterParams,
      flex: 1.5,
      sortable: true,
      resizable: false,
      headerClass: 'header-center',
      cellClass: 'ag-cell-selectable',
    },
    {
      headerName: 'Status',
      field: 'status',
      filter: 'agTextColumnFilter',
      flex: 1.5,
      sortable: true,
      resizable: false,
      headerClass: 'header-center',
      cellClass: 'status-nowrap', // <-- Add this line
      cellRenderer: (params: any) => {
        const status = params.value;
        let colorClass = '';
        if (status === 'SCHEDULED') colorClass = 'scheduled-color';
        else if (status === 'CANCELLED') colorClass = 'cancelled-color';
        else if (status === 'COMPLETED') colorClass = 'completed-color';
        return `<span class="status-text ${colorClass}" title="${status}">${status}</span>`;
      },
      cellStyle: {
        'text-align': 'center',
      },
    },
    {
      headerName: 'Action',
      field: '',
      sortable: false,
      resizable: false,
      headerClass: 'no-sort header-center',
      flex: 1.5,
      cellRenderer: ScheduleButtonComponent,
      cellRendererParams: (params: any) => ({
        onDeleteClick: this.deleteSchedule.bind(this),
        onStopClick: this.stopSchedule.bind(this),
        onStartClick: this.scheduleAgain.bind(this),
        selectedRowCount: () => this.selectedRowCount,
      }),
    },
  ];
  gridOptions = {
    rowHeight: 55,
  };
  gridOptionsHistory: GridOptions = {
    getRowId: (params: any) => {
      return params.data.id;
    },
  };

  deviceStausArray: any[] = [];
  panelOpenState = false;
  selectedValue!: string;
  loggedinUser: any;
  userCategory!: string;
  preferedCategory!: string;
  selectedDfaultCategory!: string;
  categoryName!: string;
  toolTipText: string = '';
  resultDetailsData: any;
  private deviceStatusDestroy$ = new Subject<void>();
  executionDestroy$ = new Subject<void>();
  searchValue: string = '';
  selectedOption: string = '';
  dynamicList: string[] = [];
  defaultCategory!: string;
  private refreshSubscription!: Subscription;
  private scheduleSubscription!: Subscription;
  tabName!: string;
  searchTerm: string = '';
  filteredDeviceStausArray: any[] = [];
  sortOrder: string = 'asc';
  private refreshdestroy$ = new Subject<void>();
  private allExecutionHistory$ = new Subject<void>();
  exeRefresh = true;
  scheduleRefresh = false;
  searchDevice = '';
  historyInterval: any;
  deviceInterval: any;
  showLoader = false;
  noDataFound: string = '';
  isNoDataVisible = false;

  /**
   * Constructor for ExecutionComponent.
   * @param authservice AuthService for authentication and user info.
   * @param _snakebar MatSnackBar for notifications.
   * @param loginService LoginService for logout and user events.
   * @param resultDialog MatDialog for result dialogs.
   * @param triggerDialog MatDialog for execution trigger dialogs.
   * @param dialogTDK MatDialog for TDK install dialogs.
   * @param deleteDateDialog MatDialog for delete by date dialogs.
   * @param executionservice ExecutionService for execution-related API calls.
   * @param clipboard Clipboard service for copying text.
   */
  constructor(
    private authservice: AuthService,
    private _snakebar: MatSnackBar,
    private loginService: LoginService,
    public resultDialog: MatDialog,
    public triggerDialog: MatDialog,
    public dialogTDK: MatDialog,
    public deleteDateDialog: MatDialog,
    private executionservice: ExecutionService,
    private clipboard: Clipboard
  ) {
    this.loggedinUser = JSON.parse(
      localStorage.getItem('loggedinUser') || '{}'
    );
    this.userCategory = this.loggedinUser.userCategory;
    this.preferedCategory = localStorage.getItem('preferedCategory') || '';
  }

  /**
   * Initializes the component.
   */
  ngOnInit(): void {
    this.selectedDfaultCategory = this.preferedCategory
      ? this.preferedCategory
      : this.userCategory;
    this.listenForLogout();
    this.getDeviceStatus();
    this.getAllExecutions();
    this.allExecutionScheduler();
    this.historyInterval = setInterval(() => {
      this.getAllExecutions();
    }, 60000);
    this.deviceInterval = setInterval(() => {
      this.getDeviceStatus();
    }, 10000);
    //Resets the view for scripts when moving to other tabs
    localStorage.setItem('viewName', 'scripts');
    this.executionservice.getRefreshSchedulerObservable().subscribe(() => {
      this.allExecutionScheduler(); // Refresh the schedule list
    });
    this.onResize(null);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    // Adjust page size based on screen height
    const height = window.innerHeight;
    // Handle 4K and other very high resolution displays
    if (height > 2000) {
      this.pageSize = 30;
      this.schedulePageSize = 30;
    } else if (height > 1500) {
      this.pageSize = 25;
      this.schedulePageSize = 25;
    } else if (height > 1200) {
      this.pageSize = 20;
      this.schedulePageSize = 20;
    } else if (height > 900) {
      this.pageSize = 20;
      this.schedulePageSize = 20;
    } else if (height > 768) {
      this.pageSize = 15;
      this.schedulePageSize = 15;
    } else {
      this.pageSize = 10;
      this.schedulePageSize = 10;
    }

    // Update grid if initialized
    if (this.gridApi) {
      setTimeout(() => {
        this.gridApi.sizeColumnsToFit();
      }, 100);
    }

    // Refresh the current data with new page size
    this.getAllExecutions();
    this.allExecutionScheduler();
  }
  /**
   * Refreshes the execution history and restores selection after data reload.
   */
  refreshExeHistory(): void {
    this.storeSelection();
    setTimeout(() => {
      this.getAllExecutions();
      setTimeout(() => {
        this.reSoreSelection();
      }, 100);
    }, 500);
  }

  /**
   * Refreshes the schedule list.
   */
  refreshSchedule(): void {
    this.allExecutionScheduler();
  }
  @HostListener('window:popstate', ['$event'])

  /**
   * Handles browser popstate event to prevent navigation.
   * @param event The popstate event object.
   */
  onPopState(event: Event) {
    history.pushState(null, '', location.href);
  }

  /**
   * Initializes all the execution list based on selected filters and search.
   */
  getAllExecutions(): void {
    this.storeSelection();
    if (this.selectedCategory === 'ExecutionName' && this.searchValue != '') {
      this.executionservice
        .getAllExecutionByName(
          this.searchValue,
          this.selectedDfaultCategory,
          this.currentPage,
          this.pageSize
        )
        .subscribe({
          next: (res) => {
            const data = res.data;
            if (data === null || data === undefined) {
              this.rowData = [];
              this.totalItems = 0;
            } else {
              this.rowData = data.executions;
              this.totalItems = data.totalItems;
            }
            setTimeout(() => {
              this.reSoreSelection();
            }, 100);
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
    } else if (
      this.selectedCategory === 'Scripts/Testsuite' &&
      this.searchValue != ''
    ) {
      this.executionservice
        .getAllExecutionByScript(
          this.searchValue,
          this.selectedDfaultCategory,
          this.currentPage,
          this.pageSize
        )
        .subscribe({
          next: (res) => {
            const data = res.data;
            if (data === null || data === undefined) {
              this.rowData = [];
              this.totalItems = 0;
            } else {
              this.rowData = data.executions;
              this.totalItems = data.totalItems;
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
    } else if (this.selectedCategory === 'Device' && this.searchValue != '') {
      this.executionservice
        .getAllExecutionByDevice(
          this.searchValue,
          this.selectedDfaultCategory,
          this.currentPage,
          this.pageSize
        )
        .subscribe({
          next: (res) => {
            let data = res.data;
            if (data === null || data === undefined) {
              this.rowData = [];
              this.totalItems = 0;
            } else {
              this.rowData = data.executions;
              this.totalItems = data.totalItems;
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
    } else if (this.selectedCategory === 'User' && this.selectedOption != '') {
      this.executionservice
        .getAllExecutionByUser(
          this.selectedOption,
          this.selectedDfaultCategory,
          this.currentPage,
          this.pageSize
        )
        .subscribe({
          next: (res) => {
            let data = res.data;
            if (data === null || data === undefined) {
              this.rowData = [];
              this.totalItems = 0;
            } else {
              this.rowData = data.executions;
              this.totalItems = data.totalItems;
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
    } else {
      this.executionservice
        .getAllexecution(
          this.selectedDfaultCategory,
          this.currentPage,
          this.pageSize
        )
        .subscribe({
          next: (res) => {
            let data = res.data;
            if (data === null || data === undefined) {
              this.rowData = [];
              this.totalItems = 0;
            } else {
              this.rowData = data.executions;
              this.totalItems = data.totalItems;
            }
            setTimeout(() => {
              this.reSoreSelection();
            }, 0);
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
    this.stayFocus();
  }

  /**
   * Restores focus to the appropriate search input after data reload.
   */
  stayFocus() {
    setTimeout(() => {
      if (document.activeElement === this.deviceSearchInput?.nativeElement) {
        this.deviceSearchInput.nativeElement.focus();
      } else if (
        document.activeElement === this.tableSearchInput?.nativeElement
      ) {
        this.tableSearchInput.nativeElement.focus();
      }
    }, 100);
  }

  /**
   * Handles page change event for the paginator.
   * @param event The page event object containing pageIndex and pageSize.
   */
  onPageChange(event: any): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.getAllExecutions();
  }

  /**
   * Event handler for when the grid is ready.
   * @param params The GridReadyEvent object containing the grid API.
   */
  onGridReady(params: GridReadyEvent): void {
    this.gridApi = params.api;
  }

  /**
   * Handles selection change in the grid and updates selected row IDs.
   */
  onSelectionChange(): void {
    this.selectedRowIds.clear();
    this.gridApi.getSelectedRows().forEach((node) => {
      if (node.data) {
        this.selectedRowIds.add(node.data.executionId);
      }
    });
    // const selectedNode = this.gridApi.getSelectedNodes()[0];
    // this.selectedRowIds = this.gridApi.getSelectedNodes().map(node => node.data.executionId);
  }

  /**
   * Stores the currently selected row IDs from the grid.
   */
  storeSelection() {
    this.selectedRowIds.clear();
    if (this.gridApi) {
      this.gridApi
        .getSelectedRows()
        .forEach((row) => this.selectedRowIds.add(row.executionId));
    }
  }

  /**
   * Restores the selection of rows in the grid based on stored IDs.
   */
  reSoreSelection(): void {
    if (!this.gridApi) return;
    this.gridApi.forEachNode((node: any) => {
      if (this.selectedRowIds.has(node.data.executionId)) {
        node.setSelected(true);
      }
    });
  }

  /**
   * Handles category change event and updates data accordingly.
   * @param event The event object containing the selected value.
   */
  onCategoryChange(event: any): void {
    let val = event.target.value;
    this.deviceStausArray = [];
    this.rowData = [];
    this.selectedCategory = '';
    this.searchValue = '';
    this.selectedOption = '';
    if (this.tableSearchInput) {
      this.tableSearchInput.nativeElement.value = '';
    }
    if (val === 'RDKB') {
      this.categoryName = 'Broadband';
      this.selectedDfaultCategory = 'RDKB';
      this.authservice.selectedCategory = this.selectedDfaultCategory;
      localStorage.setItem('preferedCategory', 'RDKB');
      this.deviceStatusDestroy$.next();
      this.executionDestroy$.next();
      this.getDeviceStatus();
      this.getAllExecutions();
      this.allExecutionScheduler();
    } else if (val === 'RDKC') {
      this.categoryName = 'Camera';
      this.selectedDfaultCategory = 'RDKC';
      this.authservice.selectedCategory = this.selectedDfaultCategory;
      this.deviceStatusDestroy$.next();
      this.executionDestroy$.next();
      this.getDeviceStatus();
      this.getAllExecutions();
      this.allExecutionScheduler();
    } else {
      this.selectedDfaultCategory = 'RDKV';
      localStorage.setItem('preferedCategory', 'RDKV');
      this.categoryName = 'Video';
      this.authservice.selectedCategory = this.selectedDfaultCategory;
      this.deviceStatusDestroy$.next();
      this.executionDestroy$.next();
      this.getDeviceStatus();
      this.getAllExecutions();
      this.allExecutionScheduler();
    }
  }

  /**
   * Initializes the device status and updates the device status array.
   */
  getDeviceStatus(): void {
    const isInputFocused =
      document.activeElement === this.deviceSearchInput?.nativeElement;
    this.executionservice
      .getDeviceStatus(this.selectedDfaultCategory)
      .subscribe({
        next: (res) => {
          this.deviceStausArray = this.formatData(JSON.parse(res));
          this.filteredDeviceStausArray = [...this.deviceStausArray];
          if (isInputFocused) {
            setTimeout(() => {
              if (this.deviceSearchInput) {
                this.deviceSearchInput.nativeElement.focus();
                this.deviceSearchInput.nativeElement.setSelectionRange(
                  this.deviceSearchInput.nativeElement.value.length,
                  this.deviceSearchInput.nativeElement.value.length
                );
              }
            }, 0);
          }
          this.filterAndSortDevices(this.searchDevice);
          this.deviceStausArray[0].childData.forEach((element: any) => {
            this.toolTipText +=
              element.deviceName +
              '\n' +
              element.ip +
              '\n' +
              element.deviceType +
              '\n' +
              element.status +
              '\n';
          });
        },
        error: (err) => {
          this._snakebar.open(err, '', {
            duration: 2000,
            panelClass: ['err-msg'],
            horizontalPosition: 'end',
            verticalPosition: 'top',
          });
        },
      });
    this.stayFocus();
  }

  /**
   * TODO -This method is for initialize the device status for Refresh.
   */
  getDeviceStatusForRefresh(): void {
    const isInputFocused =
      document.activeElement === this.deviceSearchInput?.nativeElement;
    this.executionservice
      .getDeviceStatusForRefresh(this.selectedDfaultCategory)
      .subscribe({
        next: (res) => {
          this.deviceStausArray = this.formatData(JSON.parse(res));
          this.filteredDeviceStausArray = [...this.deviceStausArray];
          if (isInputFocused) {
            setTimeout(() => {
              if (this.deviceSearchInput) {
                this.deviceSearchInput.nativeElement.focus();
                this.deviceSearchInput.nativeElement.setSelectionRange(
                  this.deviceSearchInput.nativeElement.value.length,
                  this.deviceSearchInput.nativeElement.value.length
                );
              }
            }, 0);
          }
          this.filterAndSortDevices(this.searchDevice);
          this.deviceStausArray[0].childData.forEach((element: any) => {
            this.toolTipText +=
              element.deviceName +
              '\n' +
              element.ip +
              '\n' +
              element.deviceType +
              '\n' +
              element.status +
              '\n';
          });
        },
        error: (err) => {
          this._snakebar.open(err, '', {
            duration: 2000,
            panelClass: ['err-msg'],
            horizontalPosition: 'end',
            verticalPosition: 'top',
          });
        },
      });
    this.stayFocus();
  }

  /**
   * Formats the tree view data for device status.
   * @param data The array of device status data.
   * @returns The formatted tree view data.
   */
  formatData(data: any[]): any[] {
    return [
      {
        name: 'Devices',
        childData: data,
        isOpen: true,
      },
    ];
  }

  /**
   * Refreshes the device status by reloading data.
   */
  refreshDevice(): void {
    this.getDeviceStatus();
  }

  /**
   * Subscribes to logout events and destroys device status subjects.
   */
  listenForLogout(): void {
    this.loginService.onLogout$
      .pipe(takeUntil(this.deviceStatusDestroy$))
      .subscribe(() => {
        this.deviceStatusDestroy$.next();
        this.deviceStatusDestroy$.complete();
      });
    this.destroyExecution();
  }

  /**
   * Subscribes to logout events and destroys execution subjects.
   */
  destroyExecution(): void {
    this.loginService.onLogout$
      .pipe(takeUntil(this.executionDestroy$))
      .subscribe(() => {
        this.executionDestroy$.next();
        this.executionDestroy$.complete();
      });
  }

  /**
   * Angular lifecycle hook for component destruction. Cleans up subscriptions and intervals.
   */
  ngOnDestroy(): void {
    this.deviceStatusDestroy$.next();
    this.deviceStatusDestroy$.complete();
    this.executionDestroy$.next();
    this.executionDestroy$.complete();
    this.allExecutionHistory$.next();
    this.allExecutionHistory$.complete();
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
    if (this.scheduleSubscription) {
      this.scheduleSubscription.unsubscribe();
    }
    this.refreshdestroy$.next();
    this.refreshdestroy$.complete();
    if (this.deviceInterval) {
      clearInterval(this.deviceInterval);
    }
    if (this.historyInterval) {
      clearInterval(this.historyInterval);
    }
  }

  /**
   * Initializes the execution scheduler and loads schedule data.
   */
  allExecutionScheduler() {
    this.showLoader = true;
    this.isNoDataVisible = false;
    this.rowDataSchudle = [];
    this.executionservice
      .getAllexecutionScheduler(this.selectedDfaultCategory)
      .subscribe({
        next: (res) => {
          let data = res.data;
          this.rowDataSchudle = data;
          this.showLoader = false;
          if (this.rowDataSchudle.length == 0) {
            this.isNoDataVisible = true;
            this.noDataFound = 'No Rows to Show';
          } else {
            this.isNoDataVisible = false;
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

  /**
   * Converts UTC time to local browser time string.
   * @param utcDate The UTC date string to format.
   * @returns The formatted local date and time string.
   */
  formatTime(utcDate: string) {
    const utcDateTime = new Date(utcDate);
    return utcDateTime.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }

  /**
   * Enables or disables Thunder for a device by IP.
   * @param deviceIP The IP address of the device.
   */
  enableDisable(deviceIP: any): void {
    this.executionservice.toggleThunderEnabled(deviceIP).subscribe({
      next: (res) => {
        if (res.message) {
          this.getDeviceStatus();
        }

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
   * Copies the device IP to clipboard and shows a notification.
   * @param deviceIp The device IP to copy.
   */
  copyToClipboard(deviceIp: any): void {
    this.clipboard.copy(deviceIp);
    this._snakebar.open(`Copied: ${deviceIp}`, '', {
      duration: 3000,
      panelClass: ['success-msg'],
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });
  }

  /**
   * Handles global search input changes for the grid.
   */
  onFilterTextBoxChanged() {
    this.gridApi.setGridOption(
      'quickFilterText',
      (document.getElementById('filter-text-box') as HTMLInputElement).value
    );
  }

  /**
   * Handles the change event for the filter selection.
   * @param event The event object containing the selected filter value.
   */
  onFilterChange(event: any): void {
    this.selectedCategory = event.target.value;
    if (this.selectedCategory === 'User') {
      this.executionservice.getlistofUsers().subscribe((res) => {
        this.dynamicList = res.data;
      });
    } else if (
      this.selectedCategory === 'Device' ||
      this.selectedCategory === 'Scripts/Testsuite' ||
      this.selectedCategory === 'ExecutionName'
    ) {
      this.searchValue = '';
    } else {
      this.getAllExecutions();
    }
  }
  /**
   * Handles the search button click event.
   * Logs the search value and triggers the appropriate search function
   * based on the selected category.
   *
   * If the selected category is 'Device', it calls `getAllExecutionByDevice`.
   * If the selected category is 'Scripts/Testsuite', it calls `getAllExecutionByScript`.
   *
   * @returns {void}
   */
  /**
   * Handles the search button click event and triggers search based on selected category.
   */
  onSearchClick(): void {
    if (
      this.selectedCategory === 'ExecutionName' ||
      this.selectedCategory === 'Scripts/Testsuite' ||
      (this.selectedCategory === 'Device' && this.searchValue)
    ) {
      this.currentPage = 0;
      this.paginator.firstPage();
      this.getAllExecutions();
    }
    if (this.searchValue === '') {
      this.getAllExecutions();
    }
  }
  /**
   * Handles the event when the user selection changes.
   * If a user is selected, it fetches all executions for the selected user,
   * the current category, and the current pagination settings.
   */
  onUserChange(): void {
    if (this.selectedOption != '') {
      this.currentPage = 0;
      this.paginator.firstPage();
      this.getAllExecutions();
    } else {
      this.getAllExecutions();
    }
  }

  /**
   * Opens the result details modal for a given execution.
   * @param params The parameters containing executionId and other info.
   */
  openDetailsModal(params: any): void {
    localStorage.setItem('executionId', params.executionId);
    this.executionservice.resultDetails(params.executionId).subscribe({
      next: (res) => {
        this.resultDetailsData = res.data;
        this.resultDetailsData.executionId = params.executionId;
        this.resultDetailsData.category = this.selectedDfaultCategory;
        if (this.resultDetailsData) {
          let resultDetailsModal = this.resultDialog.open(
            DetailsExeDialogComponent,
            {
              width: '99%',
              height: '96vh',
              maxWidth: '100vw',
              panelClass: 'custom-modalbox',
              data: this.resultDetailsData,
            }
          );
          resultDetailsModal.afterClosed().subscribe(() => {
            this.getAllExecutions();
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

  /**
   * Downloads the consolidated Excel report for a given execution.
   * @param params The parameters containing executionId and executionName.
   */
  downloadExcel(params: any): void {
    if (params.executionId) {
      this.executionservice
        .excelReportConsolidated(params.executionId)
        .subscribe({
          next: (blob) => {
            const xmlBlob = new Blob([blob], { type: 'application/xml' });
            const url = window.URL.createObjectURL(xmlBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `ExecutionResult_${params.executionName}.xlsx`;
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
   * Opens the execute modal for a device if it is free.
   * @param params The parameters containing device info and status.
   */
  openModalExecute(params: any) {
    if (params.status === 'FREE') {
      this.executionservice.getDeviceStatusByIP(params.ip).subscribe({
        next: (res) => {
          if (res.data && res.data.status === 'FREE') {
            const deviceExeModal = this.triggerDialog.open(
              ExecuteDialogComponent,
              {
                width: '68%',
                height: '96vh',
                maxWidth: '100vw',
                panelClass: 'custom-modalbox',
                data: { params },
                autoFocus: false,
              }
            );

            deviceExeModal.afterClosed().subscribe(() => {
              this.getAllExecutions();
              this.getDeviceStatus();
            });
          } else {
            this._snakebar.open(
              'The device is not available for execution',
              '',
              {
                duration: 2000,
                panelClass: ['err-msg'],
                horizontalPosition: 'end',
                verticalPosition: 'top',
              }
            );
            return;
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
    } else {
      this._snakebar.open('The device is not available for execution', '', {
        duration: 2000,
        panelClass: ['err-msg'],
        horizontalPosition: 'end',
        verticalPosition: 'top',
      });
    }
  }

  /**
   * Expands or collapses the accordion panel for a parent item.
   * @param parent The parent object whose panel is toggled.
   */
  togglePanel(parent: any) {
    parent.isOpen = !parent.isOpen;
    // this.panelOpenState = !this.panelOpenState;
  }

  /**
   * Opens the trigger execution modal dialog.
   * @param normalExecutionClick The data for normal execution click.
   */
  openDialog(normalExecutionClick: any) {
    const normalExeModal = this.triggerDialog.open(ExecuteDialogComponent, {
      width: '68%',
      height: '96vh',
      maxWidth: '100vw',
      panelClass: 'custom-modalbox',
      restoreFocus: false,
      data: {
        normalExecutionClick,
      },
    });
    normalExeModal.afterClosed().subscribe(() => {
      setTimeout(() => {
        this.getAllExecutions();
      }, 2000);
    });
  }

  /**
   * Deletes the selected execution rows after confirmation.
   */
  deleteSelectedRows(): void {
    const selectedRows = this.gridApi.getSelectedRows();
    let executionArr = [];
    for (let i = 0; i < selectedRows.length; i++) {
      const element = selectedRows[i].executionId;
      executionArr.push(element);
    }
    if (selectedRows.length === 0) {
      this._snakebar.open('Please select the executions', '', {
        duration: 2000,
        panelClass: ['err-msg'],
        horizontalPosition: 'end',
        verticalPosition: 'top',
      });
    } else {
      if (confirm('Are you sure to delete ?')) {
        this.executionservice.deleteExecutions(executionArr).subscribe({
          next: (res) => {
            this._snakebar.open(res.message, '', {
              duration: 3000,
              panelClass: ['success-msg'],
              horizontalPosition: 'end',
              verticalPosition: 'top',
            });
            this.getAllExecutions();
          },
          error: (err) => {
            let errmsg = err.message;
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
  }

  /**
   * Opens the modal for deleting executions by date.
   */
  deleteDateModal(): void {
    const deletedateModal = this.deleteDateDialog.open(DateDialogComponent, {
      width: '50%',
      height: '70vh',
      maxWidth: '100vw',
      panelClass: 'custom-modalbox',
      data: {},
    });
    deletedateModal.afterClosed().subscribe(() => {
      this.getAllExecutions();
    });
  }

  /**
   * Deletes a scheduled execution after confirmation.
   * @param data The data object containing schedule id.
   */
  deleteSchedule(data: any): void {
    if (confirm('Are you sure to delete ?')) {
      if (data) {
        this.executionservice.deleteScheduleExe(data.id).subscribe({
          next: (res) => {
            this._snakebar.open(res.message, '', {
              duration: 1000,
              panelClass: ['success-msg'],
              horizontalPosition: 'end',
              verticalPosition: 'top',
            });
            this.allExecutionScheduler();
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
  }

  /**
   * Handles tab click event and switches between execution and schedule tabs.
   * @param event The tab click event object.
   */
  onTabClick(event: any): void {
    const label = event.tab.textLabel;
    this.tabName = label;
    if (this.tabName === 'Execution Schedules') {
      this.allExecutionScheduler();
      this.exeRefresh = false;
      this.scheduleRefresh = true;
    } else {
      this.exeRefresh = true;
      this.scheduleRefresh = false;
    }
  }

  /**
   * Aborts an in-progress execution.
   * @param params The parameters containing executionId.
   */
  onAbort(params: any): void {
    this.executionservice.abortExecution(params.executionId).subscribe({
      next: (res) => {
        this._snakebar.open(res.message, '', {
          duration: 1000,
          panelClass: ['success-msg'],
          horizontalPosition: 'end',
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
   * Filters and sorts the device status array based on search term.
   * @param seachDevice The search term for filtering devices.
   */
  filterAndSortDevices(seachDevice: string) {
    this.performSearch(seachDevice);
    this.sortDevices();
  }

  /**
   * Handles device search input changes and updates filtered device list.
   * @param event The input event from the search box.
   */
  searchDevices(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.searchDevice = inputElement.value.toLowerCase();
    this.performSearch(this.searchDevice);
    setTimeout(() => {
      if (this.deviceSearchInput) {
        this.deviceSearchInput.nativeElement.focus();
        this.deviceSearchInput.nativeElement.setSelectionRange(
          this.deviceSearchInput.nativeElement.value.length,
          this.deviceSearchInput.nativeElement.value.length
        );
      }
    }, 0);
  }

  /**
   * Performs search on the device status array based on the search term.
   * @param term The search term for filtering devices.
   */
  performSearch(term: string): void {
    const lowerTerm = term.toLowerCase();
    const filteredChildData = this.deviceStausArray[0].childData.filter(
      (device: any) => {
        return Object.values(device).some((value) => {
          if (value === null || value === undefined) {
            return false;
          }

          if (typeof value === 'string') {
            return value.toLowerCase().includes(lowerTerm);
          } else if (typeof value === 'number') {
            return value.toString().includes(lowerTerm);
          } else if (typeof value === 'boolean') {
            return value.toString().includes(lowerTerm);
          }
          return false;
        });
      }
    );

    this.filteredDeviceStausArray = [
      {
        name: 'Devices',
        childData: filteredChildData,
        isOpen: this.deviceStausArray[0].isOpen,
      },
    ];
    this.sortDevices();
  }

  /**
   * Clears the device search and resets the filtered device list.
   */
  clearSearch(): void {
    this.searchTerm = '';
    this.filteredDeviceStausArray = [...this.deviceStausArray];
    this.sortDevices();
  }

  /**
   * Toggles the sort order for device status list.
   */
  toggleSortOrder(): void {
    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    this.sortDevices();
  }
  /**
   * Sorts the filtered device status array by status and device name.
   */
  sortDevices(): void {
    const order = this.sortOrder;
    const statusOrder: { [key: string]: number } = {
      busy: 1,
      in_use: 2,
      free: 3,
      not_found: 4,
      hang: 5,
    };
    this.filteredDeviceStausArray[0].childData.sort((a: any, b: any) => {
      const firstStatus = a.status.toLowerCase();
      const secondStatus = b.status.toLowerCase();

      const firstValue = statusOrder[firstStatus] || 999;
      const secondValue = statusOrder[secondStatus] || 999;

      if (firstValue !== secondValue) {
        return order === 'asc'
          ? firstValue - secondValue
          : secondValue - firstValue;
      } else {
        const firstDeviceName = a.deviceName.toLowerCase();
        const secondDeviceName = b.deviceName.toLowerCase();
        return order === 'asc'
          ? firstDeviceName.localeCompare(secondDeviceName)
          : secondDeviceName.localeCompare(firstDeviceName);
      }
    });
  }

  /**
   * Opens the TDK install modal dialog for a given device name.
   * @param deviceName The name of the device for TDK install.
   */
  installTDKModal(deviceName: string) {
    const dialogModal = this.dialogTDK.open(TdkInstallComponent, {
      width: '68%',
      height: '96vh',
      maxWidth: '100vw',
      panelClass: 'custom-modalbox',
      restoreFocus: false,
      data: deviceName,
    });
    dialogModal.afterClosed().subscribe(() => {});
  }

  /**
   * Stops a scheduled execution after confirmation.
   * @param data The data object containing schedule id.
   */
  stopSchedule(data: any): void {
    if (confirm('Are you sure you want to stop this schedule?')) {
      if (data) {
        this.executionservice.cancelTask(data.id).subscribe({
          next: (res) => {
            console.log('Backend response:', res);
            this._snakebar.open(res.message, '', {
              // <-- Use res.message here
              duration: 1000,
              panelClass: ['success-msg'],
              horizontalPosition: 'end',
              verticalPosition: 'top',
            });
            this.allExecutionScheduler();
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
  }

  /**
   * Starts a scheduled execution again after confirmation.
   * @param data The data object containing schedule id.
   */
  scheduleAgain(data: any): void {
    if (confirm('Are you sure you want to start this schedule again?')) {
      if (data) {
        this.executionservice.scheduleAgain(data.id).subscribe({
          next: (res) => {
            this._snakebar.open(res.message, '', {
              duration: 1000,
              panelClass: ['success-msg'],
              horizontalPosition: 'end',
              verticalPosition: 'top',
            });
            this.allExecutionScheduler();
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
  }
}
