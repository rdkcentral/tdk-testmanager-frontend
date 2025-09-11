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
import { Component, ElementRef,Renderer2, ViewChild, HostListener} from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef,GridApi,GridReadyEvent,IMultiFilterParams } from 'ag-grid-community';
import '../../../../node_modules/ag-grid-community/styles/ag-grid.css';
import '../../../../node_modules/ag-grid-community/styles/ag-theme-quartz.css';
import { ButtonComponent } from '../../utility/component/ag-grid-buttons/button/button.component';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DeviceService } from '../../services/device.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MaterialModule } from '../../material/material.module';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../auth/auth.service';
import { LoaderComponent } from '../../utility/component/loader/loader.component';

@Component({
  selector: 'app-devices',
  standalone: true,
  imports: [
    CommonModule,
    AgGridAngular,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    LoaderComponent,
  ],
  templateUrl: './devices.component.html',
  styleUrl: './devices.component.css',
})
export class DevicesComponent {
  @ViewChild('staticBackdrop', { static: false }) staticBackdrop?: ElementRef;
  rowData: any = [];
  public themeClass: string = 'ag-theme-quartz';
  public paginationPageSize = 10;
  public paginationPageSizeSelector: number[] | boolean = [10, 20, 50];
  configureName!: string;
  selectedRowCount = 0;
  selectedDeviceCategory: string = 'RDKV';
  uploadXMLForm!: FormGroup;
  uploadFormSubmitted = false;
  uploadFileName!: File | null;
  categoryName!: string | null;
  uploadFileError: string | null = null;
  loggedinUser: any;
  preferedCategory!: string;
  userCategory!: string;
  showLoader = false;
  uploadXml!: File | null;

  public gridApi!: GridApi;
  public columnDefs: ColDef[] = [
    {
      headerName: 'Name',
      field: 'deviceName',
      filter: 'agTextColumnFilter',
      flex: 1,
      sortable: true,
    },
    {
      headerName: 'Device IP',
      field: 'deviceIp',
      filter: 'agTextColumnFilter',
      flex: 1,
      filterParams: {} as IMultiFilterParams,
    },
    {
      headerName: 'Device Type',
      field: 'deviceTypeName',
      filter: 'agTextColumnFilter',
      flex: 1,
      filterParams: {} as IMultiFilterParams,
    },
    {
      headerName: 'Action',
      field: '',
      sortable: false,
      headerClass: 'no-sort',
      cellRenderer: ButtonComponent,
      cellRendererParams: (params: any) => ({
        onEditClick: this.userEdit.bind(this),
        onDeleteClick: this.delete.bind(this),
        onDownloadClick: this.downloadXML.bind(this),
        selectedRowCount: () => this.selectedRowCount,
      }),
    },
  ];
  public defaultColDef: ColDef = {
    flex: 1,
    menuTabs: ['filterMenuTab'],
  };
  gridOptions = {
    rowHeight: 36,
  };

  /**
   * Constructor for DevicesComponent.
   * @param router - Angular Router for navigation
   * @param service - DeviceService for device operations
   * @param fb - FormBuilder for reactive forms
   * @param authservice - AuthService for authentication
   * @param _snakebar - MatSnackBar for notifications
   * @param dialog - MatDialog for dialogs
   * @param renderer - Renderer2 for DOM manipulation
   */
  constructor(
    private router: Router,
    private service: DeviceService,
    private fb: FormBuilder,
    private authservice: AuthService,
    private _snakebar: MatSnackBar,
    public dialog: MatDialog,
    private renderer: Renderer2
  ) {
    this.loggedinUser = JSON.parse(
      localStorage.getItem('loggedinUser') || '{}'
    );
    this.userCategory = this.loggedinUser.userCategory;
    this.preferedCategory = localStorage.getItem('preferedCategory') || '';
  }

  /**
   * Closes the modal by click on button.
   * No parameters.
   */
  close() {
    (this.staticBackdrop?.nativeElement as HTMLElement).style.display = 'none';
    this.renderer.removeStyle(document.body, 'overflow');
    this.renderer.removeStyle(document.body, 'padding-right');
  }

  /**
   * Initializes the component and performs necessary setup tasks.
   * No parameters.
   */
  ngOnInit(): void {
    this.selectedDeviceCategory = this.userCategory;
    this.authservice.selectedConfigVal = this.preferedCategory
      ? this.preferedCategory
      : this.userCategory;
    const deviceCategory = this.preferedCategory
      ? this.preferedCategory
      : this.userCategory;
    if (deviceCategory === 'RDKB') {
      this.categoryName = 'Broadband';
    } else {
      this.categoryName = 'Video';
    }
    if (deviceCategory === null) {
      this.configureName = this.selectedDeviceCategory;
      this.findallbyCategory();
    }
    if (deviceCategory) {
      this.selectedDeviceCategory = deviceCategory;
      this.findallbyCategory();
    }
    this.uploadXMLForm = this.fb.group({
      uploadXml: [null, Validators.required],
    });
    //Resets the view for scripts when moving to other tabs
    localStorage.setItem('viewName', 'scripts');
    this.adjustPaginationToScreenSize();
  }

  /**
   * Listens for window resize events to adjust the grid
   */
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
      this.paginationPageSize = 25;
    } else if (height > 900) {
      this.paginationPageSize = 20;
    } else if (height > 700) {
      this.paginationPageSize = 15;
    } else {
      this.paginationPageSize = 10;
    }

    // Update the pagination size selector options based on the current pagination size
    this.paginationPageSizeSelector = [
      this.paginationPageSize,
      this.paginationPageSize * 2,
      this.paginationPageSize * 5,
    ];

    // Apply changes to grid if it's already initialized
    if (this.gridApi) {
      // Use the correct method to update pagination page size
      this.gridApi.setGridOption('paginationPageSize', this.paginationPageSize);
    }
  }

  /**
   * Finds all devices by category.
   * No parameters.
   */
  findallbyCategory() {
    this.showLoader = true;
    this.service.findallbyCategory(this.selectedDeviceCategory).subscribe({
      next: (res) => {
        this.rowData = [];
        let data = res.data;
        this.rowData = data;
        if (
          this.rowData == null ||
          this.rowData == undefined ||
          this.rowData.length > 0 ||
          this.rowData.length == 0
        ) {
          this.showLoader = false;
        }
        if (
          this.rowData == null ||
          this.rowData == undefined ||
          this.rowData.length == 0
        ) {
          this.rowData = [];
        }
      },
      error: (err) => {
        this.showLoader = false;
      },
    });
  }
  /**
   * Handles the event when a device category is checked.
   * @param event - The event object containing the checked value.
   */
  categoryChange(event: any) {
    let val = event.target.value;
    if (val === 'RDKB') {
      this.categoryName = 'Broadband';
      this.selectedDeviceCategory = 'RDKB';
      this.authservice.selectedConfigVal = 'RDKB';
      this.authservice.showSelectedCategory = 'Broadband';
      localStorage.setItem('preferedCategory', 'RDKB');
      this.findallbyCategory();
    } else {
      this.selectedDeviceCategory = 'RDKV';
      this.categoryName = 'Video';
      this.authservice.selectedConfigVal = 'RDKV';
      this.authservice.showSelectedCategory = 'Video';
      localStorage.setItem('preferedCategory', 'RDKV');
      this.findallbyCategory();
    }
  }

  /**
   * Event handler for when the grid is ready.
   * @param params - The GridReadyEvent object containing the grid API.
   */
  onGridReady(params: GridReadyEvent<any>) {
    this.gridApi = params.api;
    this.adjustPaginationToScreenSize();
  }

  /**
   * Event handler for when the filter text box value changes.
   * No parameters.
   */
  onFilterTextBoxChanged() {
    this.gridApi.setGridOption(
      'quickFilterText',
      (document.getElementById('filter-text-box') as HTMLInputElement).value
    );
  }

  /**
   * Edits the user and navigates to the device edit page.
   * @param user - The user object to be edited.
   * @returns The edited user object.
   */
  userEdit(user: any): void {
    localStorage.setItem('user', JSON.stringify(user));
    this.router.navigate(['/devices/device-edit']);
  }

  /**
   * Deletes a device.
   * @param data - The data of the device to be deleted.
   */
  delete(data: any) {
    if (confirm('Are you sure to delete ?')) {
      if (data) {
        this.service.deleteDevice(data.id).subscribe({
          next: (res) => {
            this._snakebar.open(res.message, '', {
              duration: 1000,
              panelClass: ['success-msg'],
              horizontalPosition: 'end',
              verticalPosition: 'top',
            });
            const rowToRemove = this.rowData.find(
              (row: any) => row.id === data.id
            );
            if (rowToRemove) {
              this.gridApi.applyTransaction({ remove: [rowToRemove] });
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
  }

  /**
   * Navigates to the device creation page.
   * No parameters.
   */
  createDevice() {
    this.router.navigate(['/devices/device-create']);
  }

  /**
   * Handles the file change event when a file is selected for upload.
   * @param event - The file change event object.
   */
  onFileChange(event: any) {
    this.uploadFileName = event.target.files[0].name;
    const file: File = event.target.files[0];
    if (file) {
      if (file.type === 'text/xml') {
        this.uploadXMLForm.patchValue({ file: file });
        this.uploadFileName = file;
        this.uploadFileError = null;
      } else {
        this.uploadXMLForm.patchValue({ file: null });
        this.uploadFileError = 'Please upload a valid XML file.';
      }
    }
  }

  /**
   * Resets the upload form and related state variables.
   * No parameters.
   */
  resetUploadForm() {
    this.uploadXMLForm.reset();
    this.uploadXml = null;
    this.uploadFileError = '';
    this.uploadFormSubmitted = false;
  }

  /**
   * Handles the submission of the uploadXMLForm.
   * No parameters.
   */
  uploadXMLSubmit() {
    this.uploadFormSubmitted = true;
    if (this.uploadXMLForm.invalid || this.uploadFileError != null) {
      return;
    } else {
      if (this.uploadFileName) {
        this.uploadFileError = null;
        this.service.uploadXMLFile(this.uploadFileName).subscribe({
          next: (res) => {
            this._snakebar.open(res.message, '', {
              duration: 1000,
              panelClass: ['success-msg'],
              horizontalPosition: 'end',
              verticalPosition: 'top',
            });
            this.resetUploadForm();
            this.close();
            this.ngOnInit();
          },
          error: (err) => {
            this._snakebar.open(err.message, '', {
              duration: 2000,
              panelClass: ['err-msg'],
              horizontalPosition: 'end',
              verticalPosition: 'top',
            });
            this.ngOnInit();
            this.close();
            this.resetUploadForm();
          },
        });
      }
    }
  }

  /**
   * Download all device details as zip format based on device category selection.
   * No parameters.
   */
  downloadAllDevice() {
    if (this.rowData.length > 0) {
      this.service.downloadDeviceByCategory(this.selectedDeviceCategory);
    } else {
      this._snakebar.open('No data available for download', '', {
        duration: 2000,
        panelClass: ['err-msg'],
        horizontalPosition: 'end',
        verticalPosition: 'top',
      });
    }
  }

  /**
   * Download device details as xml format based on device name.
   * @param params - The parameters containing device name.
   */
  downloadXML(params: any): void {
    if (params.deviceName) {
      this.service.downloadDevice(params.deviceName).subscribe((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${params.deviceName}.xml`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      });
    }
  }
}
