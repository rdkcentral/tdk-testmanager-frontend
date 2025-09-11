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
import { Component, Inject ,HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MaterialModule } from '../../../material/material.module';
import { AuthService } from '../../../auth/auth.service';
import {
  ColDef,
  GridApi,
  GridOptions,
  GridReadyEvent,
  IDateFilterParams,
} from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { AgGridAngular } from 'ag-grid-angular';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import moment from 'moment-timezone';
import { DevicetypeService } from '../../../services/devicetype.service';
import { AnalysisService } from '../../../services/analysis.service';
import { LoaderComponent } from '../../../utility/component/loader/loader.component';

@Component({
  selector: 'app-base-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    AgGridAngular,
    LoaderComponent,
  ],
  templateUrl: './base-modal.component.html',
  styleUrl: './base-modal.component.css',
})
export class BaseModalComponent {
  filterSubmitted = false;
  filterForm!: FormGroup;
  public themeClass: string = 'ag-theme-quartz';
  rowData: any = [];
  selectedRowCount = 0;
  public gridApi!: GridApi;
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
      headerCheckboxSelection: false,
      checkboxSelection: true,
      headerCheckboxSelectionFilteredOnly: false,
      flex: 0.5,
      minWidth: 40,
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
      minWidth: 150,
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
    },
    {
      headerName: 'Scripts/Testsuite',
      field: 'scriptTestSuite',
      filter: 'agTextColumnFilter',
      sortable: true,
      flex: 2.5,
      minWidth: 150,
      tooltipField: 'scriptTestSuite',
      resizable: false,
      cellRenderer: (params: any) => {
        const text = params.value || '';
        if (text.length > 50) {
          return `${text.slice(0, 50)}...`;
        }
        return text;
      },
      cellClass: (params: any) => {
        return params.value.length > 50 ? 'text-ellipsis' : 'text-two-line';
      },
    },
    {
      headerName: 'Device',
      field: 'device',
      filter: 'agTextColumnFilter',
      sortable: true,
      tooltipField: 'device',
      flex: 2,
      minWidth: 150,
      cellClass: 'selectable',
      cellStyle: { 'white-space': 'normal', ' word-break': 'break-word' },
      wrapText: true,
      resizable: false,
    },
    {
      headerName: 'Date Of Execution',
      field: 'executionDate',
      filter: 'agTextColumnFilter',
      filterParams: this.filterParams,
      sortable: true,
      cellClass: 'selectable',
      flex: 2.5,
      minWidth: 150,
      resizable: false,
      cellRenderer: (data: any) => {
        return data.value ? new Date(data.value).toLocaleString() : '';
      },
    },
    {
      headerName: 'Result',
      field: 'status',
      filter: 'agTextColumnFilter',
      cellStyle: { textAlign: 'center' },
      sortable: true,
      resizable: false,
      flex: 1,
      minWidth: 150,
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
          case 'PAUSE':
            iconHtml = `<span style="color:gray; font-size:0.66rem; font-weight:500;" title="Paused">PAUSE</span>`;
            break;
          default:
            return;
        }
        return iconHtml;
      },
    },
  ];
  defaultColDef = {
    sortable: true,
    headerClass: 'header-center',
  };
  selectedBaseRow: any;
  baseModalName: string | null = null;
  pageSize = 10;
  pageSizeSelector: number[] | boolean = [10, 20, 30, 50];
  fromUTCTime!: string;
  toUTCTime!: string;
  selectedDfaultCategory!: string;
  allDeviceType: any;
  deviceName!: string;
  showScript = false;
  testSuiteShow = false;
  executionTypeName!: string;
  showTable = false;
  showLoader = false;

  /**
   * Constructor for BaseModalComponent.
   * @param fb FormBuilder instance for reactive forms.
   * @param deviceTypeService Service for device type operations.
   * @param dialogRef Reference to the dialog.
   * @param data Data passed to the dialog.
   * @param anlysisService Service for analysis operations.
   */
  constructor(
    private fb: FormBuilder,
    private deviceTypeService: DevicetypeService,
    public dialogRef: MatDialogRef<BaseModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private anlysisService: AnalysisService
  ) {}

  /**
   * Initializes the component and sets up the filter form.
   */
  ngOnInit(): void {
    this.selectedDfaultCategory = this.data.category;
    this.filterForm = this.fb.group(
      {
        fromDate: ['', Validators.required],
        toDate: ['', Validators.required],
        deviceType: ['', Validators.required],
        scriptType: ['', Validators.required],
        category: [{ value: this.data.category, disabled: true }],
        scriptSingle: [''],
        testSuiteSingke: [''],
      },
      {
        validators: this.dateRangeValidator,
      }
    );
    this.getDeviceByCategory();
    this.adjustPaginationToScreenSize();
  }

  @HostListener('window:resize')
  onResize() {
    this.adjustPaginationToScreenSize();
  }

  /**
   * Adjusts pagination size based on screen dimensions
   */
  private adjustPaginationToScreenSize() {
    const height = window.innerHeight;

    if (height > 1200) {
      this.pageSize = 25;
    } else if (height > 900) {
      this.pageSize = 20;
    } else if (height > 700) {
      this.pageSize = 15;
    } else {
      this.pageSize = 10;
    }

    // Update the pagination size selector options based on the current pagination size
    this.pageSizeSelector = [
      this.pageSize,
      this.pageSize * 2,
      this.pageSize * 5,
    ];

    // Apply changes to grid if it's already initialized
    if (this.gridApi) {
      // Use the correct method to update pagination page size
      this.gridApi.setGridOption('paginationPageSize', this.pageSize);
    }
  }

  /**
   * Validates the date range in the filter form.
   * @param group The form group containing date fields.
   * @returns Validation error if the range exceeds 30 days.
   */
  dateRangeValidator(group: AbstractControl): { [key: string]: any } | null {
    const fromDate = group.get('fromDate')?.value;
    const toDate = group.get('toDate')?.value;
    if (fromDate && toDate) {
      const diff = moment(toDate).diff(moment(fromDate), 'days');
      return diff > 30 ? { maxDaysExceeded: true } : null;
    }
    return null;
  }

  /**
   * Fetches device types by category.
   */
  getDeviceByCategory(): void {
    this.deviceTypeService
      .getfindallbycategory(this.selectedDfaultCategory)
      .subscribe((res) => {
        this.allDeviceType = res.data;
      });
  }

  /**
   * Handles device type change event.
   * @param event The change event object.
   */
  deviceChange(event: any): void {
    let val = event.target.value;
    this.deviceName = val;
  }

  /**
   * Handles execution type change event.
   * @param event The change event object.
   */
  changeExecutionType(event: any): void {
    let val = event.target.value;
    this.executionTypeName = val;
    if (this.executionTypeName === 'SINGLESCRIPT') {
      this.showScript = true;
    } else {
      this.showScript = false;
    }
    if (this.executionTypeName === 'TESTSUITE') {
      this.testSuiteShow = true;
    } else {
      this.testSuiteShow = false;
    }
  }

  /**
   * Event handler for when the grid is ready.
   * @param params - The GridReadyEvent object containing the grid API.
   */
  onGridReady(params: GridReadyEvent): void {
    this.gridApi = params.api;
    this.adjustPaginationToScreenSize();
  }

  /**
   * Handles row selection in the grid.
   */
  onrowSelected(): void {
    const selectedNodes = (this.gridApi as any).getSelectedNodes();
    if (selectedNodes.length > 0) {
      this.selectedBaseRow = selectedNodes[0].data;
      this.baseModalName = this.selectedBaseRow.executionName;
    } else {
      this.selectedBaseRow = null;
    }
  }

  /**
   * Closes the modal dialog.
   */
  close(): void {
    this.dialogRef.close(false);
  }

  /**
   * Submits the filter form and fetches filtered executions.
   */
  filterDataSubmit(): void {
    this.filterSubmitted = true;
    if (this.filterForm.invalid) {
      return;
    } else {
      const locaFromDateTime = this.filterForm.get('fromDate')?.value;
      const locaToDateTime = this.filterForm.get('toDate')?.value;

      if (locaFromDateTime) {
        const utcMoment = moment
          .tz(locaFromDateTime, moment.tz.guess())
          .startOf('day');
        this.fromUTCTime = utcMoment.format('YYYY-MM-DDTHH:mm:ss[Z]');
      }
      if (locaToDateTime) {
        const utcMoment = moment
          .tz(locaToDateTime, moment.tz.guess())
          .endOf('day');
        this.toUTCTime = utcMoment.format('YYYY-MM-DDTHH:mm:ss[Z]');
      }
      const scriptSingle = this.filterForm.get('scriptSingle')?.value;
      const testSuiteSingke = this.filterForm.get('testSuiteSingke')?.value;

      let obj = {
        startDate: this.fromUTCTime,
        endDate: this.toUTCTime,
        executionType: this.executionTypeName,
        scriptTestSuite:
          this.executionTypeName === 'SINGLESCRIPT'
            ? scriptSingle
            : this.executionTypeName === 'TESTSUITE'
            ? testSuiteSingke
            : '',
        deviceType: this.deviceName,
        category: this.selectedDfaultCategory,
      };
      this.showLoader = true;
      this.anlysisService.getcombinedByFilter(obj).subscribe((res) => {
        let response = res.data;
        if (response) {
          this.rowData = response;
          this.showTable = true;
          this.showLoader = false;
        } else {
          this.rowData = [];
          this.showLoader = false;
          this.showTable = true;
        }
      });
    }
  }

  /**
   * Confirms the selected base execution and closes the dialog.
   */
  onConfirm(): void {
    this.dialogRef.close(this.selectedBaseRow);
  }
}
