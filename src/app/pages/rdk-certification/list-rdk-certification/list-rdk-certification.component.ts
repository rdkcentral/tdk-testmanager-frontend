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
import { Component, ElementRef, Renderer2, ViewChild, HostListener} from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AgGridAngular } from 'ag-grid-angular';
import {
  ColDef,
  GridApi,
  GridReadyEvent,
  IMultiFilterParams,
} from 'ag-grid-community';
import { HttpClient } from '@angular/common/http';
import { ButtonComponent } from '../../../utility/component/ag-grid-buttons/button/button.component';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { AuthService } from '../../../auth/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaterialModule } from '../../../material/material.module';
import { RdkService } from '../../../services/rdk-certification.service';
import { saveAs } from 'file-saver';
import { CdkStepperModule } from '@angular/cdk/stepper';
import { LoaderComponent } from '../../../utility/component/loader/loader.component';

@Component({
  selector: 'app-list-rdk-certification',
  standalone: true,
  imports: [
    MaterialModule,
    CommonModule,
    ReactiveFormsModule,
    AgGridAngular,
    CdkStepperModule,
    LoaderComponent,
  ],
  templateUrl: './list-rdk-certification.component.html',
  styleUrl: './list-rdk-certification.component.css',
})
/**
 * Component for listing RDK certifications.
 */
export class ListRdkCertificationComponent {
  @ViewChild('certificateModal', { static: false })
  certificateModal?: ElementRef;
  public rowSelection: 'single' | 'multiple' = 'single';
  lastSelectedNodeId: string | undefined;
  rowData: any = [];
  public themeClass: string = 'ag-theme-quartz';
  public paginationPageSize = 7;
  public paginationPageSizeSelector: number[] | boolean = [7, 15, 30, 50];
  public tooltipShowDelay = 500;
  isRowSelected: any;
  selectedRow: any;
  isCheckboxSelected: boolean = false;
  public gridApi!: GridApi;
  rowIndex!: number | null;
  selectedRowCount = 0;
  showUpdateButton = false;
  categoryName!: string;
  uploadConfigurationForm!: FormGroup;
  uploadFormSubmitted = false;
  uploadFileName: File | undefined;
  configureName!: string;
  showLoader = false;
  /**
   * Column definitions for the ag-Grid table in the RDK Certification List component.
   *
   * @type {ColDef[]}
   * @property {ColDef} columnDefs[].headerName - The header name of the column.
   * @property {ColDef} columnDefs[].field - The field name of the column.
   * @property {ColDef} columnDefs[].filter - The filter type for the column.
   * @property {ColDef} columnDefs[].flex - The flex property to adjust column width.
   * @property {IMultiFilterParams} columnDefs[].filterParams - Parameters for the filter.
   * @property {boolean} columnDefs[].sortable - Indicates if the column is sortable.
   * @property {any} columnDefs[].cellRenderer - The component used to render cells in this column.
   * @property {Function} columnDefs[].cellRendererParams - Function to return parameters for the cell renderer.
   * @property {Function} columnDefs[].cellRendererParams.onEditClick - Callback for the edit button click event.
   * @property {Function} columnDefs[].cellRendererParams.onDownloadClick - Callback for the download button click event.
   * @property {Function} columnDefs[].cellRendererParams.selectedRowCount - Function to get the count of selected rows.
   */
  public columnDefs: ColDef[] = [
    {
      headerName: 'Name',
      field: 'name',
      filter: 'agTextColumnFilter',
      flex: 1,
      filterParams: {} as IMultiFilterParams,
    },
    {
      headerName: 'Action',
      field: '',
      sortable: false,
      cellRenderer: ButtonComponent,
      cellRendererParams: (params: any) => ({
        onEditClick: this.userEdit.bind(this),
        onDownloadClick: this.downloadConfigFile.bind(this),
        // Hide delete icon for RDK Certification
        showDelete: false,
        selectedRowCount: () => this.selectedRowCount,
      }),
    },
  ];
  public defaultColDef: ColDef = {
    flex: 1,
    menuTabs: ['filterMenuTab'],
  };

  /**
   * Constructor for ListRdkCertificationComponent.
   * @param http HttpClient instance for HTTP requests.
   * @param router Router instance for navigation.
   * @param renderer Renderer2 for DOM manipulation.
   * @param authservice AuthService instance for authentication.
   * @param service RdkService for RDK certification operations.
   * @param _snakebar MatSnackBar for notifications.
   */
  constructor(
    private http: HttpClient,
    private router: Router,
    private renderer: Renderer2,
    private authservice: AuthService,
    private service: RdkService,
    private _snakebar: MatSnackBar
  ) {}

  /**
   * Initializes the component by fetching all RDK certifications and setting up the form.
   *
   * - Fetches all RDK certifications from the service and maps them to `rowData`.
   * - Sets the `configureName` and `categoryName` from the authentication service.
   * - Initializes the `uploadConfigurationForm` with a required `uploadConfig` control.
   *
   * @returns {void}
   */
  ngOnInit(): void {
    this.configureName = this.authservice.selectedConfigVal;
    if (this.configureName === 'RDKB') {
      this.categoryName = 'Broadband';
    } else {
      this.categoryName = 'Video';
    }
    this.uploadConfigurationForm = new FormGroup({
      uploadConfig: new FormControl<string | null>('', {
        validators: Validators.required,
      }),
    });
    this.getAllCerificate();
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
   * Fetches all RDK certifications and updates the row data.
   */
  getAllCerificate(): void {
    this.showLoader = true;
    this.service.getallRdkCertifications().subscribe((res) => {
      const certificationNames = res.data;
      this.rowData = null;
      if (
        certificationNames != null &&
        certificationNames != undefined &&
        certificationNames.length > 0
      ) {
        this.rowData = certificationNames.map((name: any) => ({ name }));
      }
      if (
        this.rowData == null ||
        this.rowData == undefined ||
        this.rowData.length > 0
      ) {
        this.showLoader = false;
      }
    });
  }
  /**
   * Event handler for when the grid is ready.
   *
   * @param {GridReadyEvent<any>} params - The event parameters containing the grid API.
   */
  onGridReady(params: GridReadyEvent<any>): void {
    this.gridApi = params.api;
    this.adjustPaginationToScreenSize();
  }

  /**
   * Navigates to the edit RDK certifications page after storing the user information in local storage.
   *
   * @param user - The user object containing information to be stored in local storage.
   * @returns void
   */
  userEdit(user: any): void {
    localStorage.setItem('user', JSON.stringify(user));
    this.router.navigate(['configure/edit-rdk-certifications']);
  }

  /**
   * Navigates to the "create RDK certifications" configuration page.
   * This method is triggered when the user wants to create a new RDK certification.
   * It uses the Angular Router to navigate to the specified route.
   */
  createRdkCertification(): void {
    this.router.navigate(['configure/create-rdk-certifications']);
  }

  /**
   * Handles the file input change event.
   *
   * This method is triggered when a user selects a file. It checks if the selected file
   * is a Python (.py) file. If it is, the file is assigned to `uploadFileName`. Otherwise,
   * an alert is shown to the user indicating that a valid Python file must be selected.
   *
   * @param event - The file input change event containing the selected file.
   */
  onFileChange(event: any): void {
    const file: File = event.target.files[0];
    this.uploadConfigurationForm.get('uploadConfig')?.setValue(file || null);
  }

  /**
   * Resets the upload configuration form and clears the file input element.
   */
  resetUploadForm(): void {
    this.uploadConfigurationForm.reset();
    this.uploadFormSubmitted = false;
    // Clear the file input element
    const fileInput = document.getElementById('uploadfile') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  /**
   * Closes the certificate modal by setting its display style to 'none'.
   * Also removes the 'overflow' and 'padding-right' styles from the document body.
   */
  /**
   * Closes the certificate modal and removes body styles.
   */
  close(): void {
    (this.certificateModal?.nativeElement as HTMLElement).style.display =
      'none';
    this.renderer.removeStyle(document.body, 'overflow');
    this.renderer.removeStyle(document.body, 'padding-right');
  }

  /**
   * Handles the submission of the upload configuration form.
   *
   * This method sets the `uploadFormSubmitted` flag to true and checks if the form is valid.
   * If the form is invalid, it returns early. If the form is valid and a file name is provided,
   * it calls the `uploadConfigFile` method of the service with the file name.
   *
   * On successful upload, it displays a success message using `_snakebar`, closes the form,
   * and reinitializes the component by calling `ngOnInit`.
   *
   * On error, it displays an error message using `_snakebar`, reinitializes the component,
   * closes the form, and resets the upload configuration form.
   */
  uploadConfigurationSubmit(): void {
    this.uploadFormSubmitted = true;
    if (this.uploadConfigurationForm.invalid) {
      return;
    }
    const file = this.uploadConfigurationForm.get('uploadConfig')?.value;
    if (file) {
      this.service.uploadConfigFile(file).subscribe({
        next: (res) => {
          this._snakebar.open(res.message, '', {
            duration: 1000,
            panelClass: ['success-msg'],
            horizontalPosition: 'end',
            verticalPosition: 'top',
          });
          this.close();
          this.ngOnInit();
          this.uploadConfigurationForm.reset();
          this.uploadFormSubmitted = false;
        },
        error: (err) => {
          let errmsg = err.message;
          this._snakebar.open(errmsg, '', {
            duration: 2000,
            panelClass: ['err-msg'],
            horizontalPosition: 'end',
            verticalPosition: 'top',
          });
          this.ngOnInit();
          this.uploadConfigurationForm.reset();
        },
      });
    }
  }

  /**
   * Downloads a configuration file based on the provided parameters.
   *
   * @param params - The parameters containing the name of the configuration file to download.
   *
   * If the `params` object contains a `name` property, this method will call the `downloadConfig`
   * method of the service with the provided name. Upon successful download, it will create a
   * Blob from the response content and trigger a file save with the appropriate filename.
   *
   * In case of an error during the download process, an error message will be displayed using
   * a snackbar with a duration of 2000 milliseconds.
   */
  downloadConfigFile(params: any): void {
    if (params.name) {
      this.service.downloadConfig(params.name).subscribe({
        next: (res) => {
          const filename = res.filename;
          const blob = new Blob([res.content], {
            type: res.content.type || 'application/json',
          });
          saveAs(blob, filename);
        },
        error: (err) => {
          let errmsg = err.error;
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
   * Navigates back to the configuration page and sets the selected configuration
   * value and category in the authentication service.
   *
   * @remarks
   * This method updates the `selectedConfigVal` to 'RDKV' and the `showSelectedCategory`
   * to 'Video' in the `authservice`. It then navigates to the '/configure' route.
   */
  goBack(): void {
    this.authservice.selectedConfigVal = 'RDKV';
    this.authservice.showSelectedCategory = 'Video';
    this.router.navigate(['/configure']);
  }

  /**
   * Deletes an RDK certification after user confirmation.
   * @param data The data object containing the certification name to delete.
   */
  delete(data: any): void {
    if (confirm('Are you sure to delete ?')) {
      this.service.deleteRdkCertification(data.name).subscribe({
        next: (res) => {
          this.rowData = this.rowData.filter(
            (row: any) => row.name !== data.name
          );
          this.rowData = [...this.rowData];
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
  }
}
