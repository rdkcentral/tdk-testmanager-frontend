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
import { Component, ElementRef, Renderer2, ViewChild ,HostListener} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AgGridAngular } from 'ag-grid-angular';
import {
  ColDef,
  GridApi,
  GridReadyEvent,
  IMultiFilterParams,
  RowSelectedEvent,
  SelectionChangedEvent
} from 'ag-grid-community';
import { Router } from '@angular/router';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../auth/auth.service';
import { ModuleButtonComponent } from '../../../utility/component/modules-buttons/button/button.component';
import { MatDialog } from '@angular/material/dialog';
import { ModulesService } from '../../../services/modules.service';
import { MaterialModule } from '../../../material/material.module';
import { LoaderComponent } from '../../../utility/component/loader/loader.component';

/**
 * ModulesListComponent is responsible for displaying and managing the list of modules.
 * It handles table rendering, navigation, file upload, and CRUD operations for modules.
 */
@Component({
  selector: 'app-modules-list',
  standalone: true,
  imports: [
    MaterialModule,
    CommonModule,
    ReactiveFormsModule,
    AgGridAngular,
    LoaderComponent,
  ],
  templateUrl: './modules-list.component.html',
  styleUrl: './modules-list.component.css',
})
export class ModulesListComponent {
  @ViewChild('moduleListModal', { static: false }) moduleListModal?: ElementRef;
  public themeClass: string = 'ag-theme-quartz';
  public paginationPageSize = 10;
  public paginationPageSizeSelector: number[] | boolean = [10, 15, 30, 50];
  public tooltipShowDelay = 500;
  public gridApi!: GridApi;
  selectedDeviceCategory: string = 'RDKV';
  uploadXMLForm!: FormGroup;
  uploadFormSubmitted = false;
  uploadFileName!: File | null;
  configureName!: string;
  selectedConfig!: string | null;
  lastSelectedNodeId: string | undefined;
  rowData: any = [];
  isRowSelected: any;
  selectedRow: any;
  isCheckboxSelected: boolean = false;
  rowIndex!: number | null;
  selectedRowCount = 0;
  categoryName!: string;
  uploadFileError: string | null = null;
  public columnDefs: ColDef[] = [
    {
      headerName: 'Name',
      field: 'moduleName',
      filter: 'agTextColumnFilter',
      sort: 'asc',
      filterParams: {} as IMultiFilterParams,
    },
    {
      headerName: 'Test Group',
      field: 'testGroup',
      filter: 'agTextColumnFilter',
      filterParams: {} as IMultiFilterParams,
    },
    {
      headerName: 'Execution TimeOut',
      field: 'executionTime',
      filter: 'agTextColumnFilter',
      filterParams: {} as IMultiFilterParams,
    },
    {
      headerName: 'Action',
      field: '',
      sortable: false,
      headerClass: 'no-sort',
      cellRenderer: ModuleButtonComponent,
      cellRendererParams: (params: any) => ({
        onEditClick: this.userEdit.bind(this),
        onDeleteClick: this.delete.bind(this),
        onFunctionClick: this.createFunction.bind(this),
        onModuleXMLClick: this.downloadModuleXML.bind(this),
        selectedRowCount: () => this.selectedRowCount,
        lastSelectedNodeId: this.lastSelectedNodeId,
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
  loggedInUser: any;
  defaultCategory!: string;
  preferedCategory!: string;
  showLoader = false;

  /**
   * Constructor for ModulesListComponent.
   * @param router Router instance for navigation
   * @param authservice AuthService instance for authentication and config values
   * @param fb FormBuilder instance for reactive forms
   * @param _snakebar MatSnackBar instance for notifications
   * @param dialog MatDialog instance for dialogs
   * @param moduleservice ModulesService instance for module operations
   * @param renderer Renderer2 instance for DOM manipulation
   */
  constructor(
    private router: Router,
    private authservice: AuthService,
    private fb: FormBuilder,
    private _snakebar: MatSnackBar,
    public dialog: MatDialog,
    private moduleservice: ModulesService,
    private renderer: Renderer2
  ) {
    this.loggedInUser = JSON.parse(
      localStorage.getItem('loggedinUser') || '{}'
    );
    this.defaultCategory = this.loggedInUser.userCategory;
    this.preferedCategory = localStorage.getItem('preferedCategory') || '';
  }

  /**
   * Initializes the component and sets up the initial values.
   * No parameters.
   * No return value.
   */
  ngOnInit(): void {
    this.configureName = this.authservice.selectedConfigVal;
    if (this.configureName === 'RDKB') {
      this.categoryName = 'Broadband';
    } else {
      this.categoryName = 'Video';
    }
    this.findallbyCategory();
    this.uploadXMLForm = this.fb.group({
      uploadXml: [null, Validators.required],
    });
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
   * Finds all modules by category.
   * No parameters.
   * No return value.
   */
  findallbyCategory(): void {
    this.showLoader = true;
    this.moduleservice
      .findallbyCategory(this.configureName)
      .subscribe((res) => {
        this.rowData = res.data;
        if (
          this.rowData == null ||
          this.rowData == undefined ||
          this.rowData.length > 0 ||
          this.rowData.length == 0
        ) {
          this.showLoader = false;
        }
      });
  }

  /**
   * Event handler for when the grid is ready.
   * @param params The grid ready event parameters.
   */
  onGridReady(params: GridReadyEvent<any>): void {
    this.gridApi = params.api;
    this.adjustPaginationToScreenSize();
  }

  /**
   * Event handler for when a row is selected.
   * @param event The row selected event.
   */
  onRowSelected(event: RowSelectedEvent): void {
    this.isRowSelected = event.node.isSelected();
    this.rowIndex = event.rowIndex;
  }

  /**
   * Event handler for when the selection is changed.
   * @param event The selection changed event.
   */
  onSelectionChanged(event: SelectionChangedEvent): void {
    this.selectedRowCount = event.api.getSelectedNodes().length;
    const selectedNodes = event.api.getSelectedNodes();
    this.lastSelectedNodeId =
      selectedNodes.length > 0
        ? selectedNodes[selectedNodes.length - 1].id
        : '';
    this.selectedRow = this.isRowSelected ? selectedNodes[0].data : null;
    if (this.gridApi) {
      this.gridApi.refreshCells({ force: true });
    }
  }

  /**
   * Navigates to the create module page.
   * No parameters.
   * No return value.
   */
  createModule(): void {
    this.router.navigate(['/configure/modules-create']);
  }

  /**
   * Edits a module.
   * @param modules The module object to edit.
   * No return value.
   */
  userEdit(modules: any): void {
    localStorage.setItem('modules', JSON.stringify(modules));
    this.router.navigate(['configure/modules-edit']);
  }

  /**
   * Deletes a module record.
   * @param data The data of the record to delete.
   * No return value.
   */
  delete(data: any): void {
    if (confirm('Are you sure to delete ?')) {
      if (data) {
        this.moduleservice.deleteModule(data.id).subscribe({
          next: (res) => {
            this.rowData = this.rowData.filter(
              (row: any) => row.id !== data.id
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

  /**
   * Downloads all modules as XML files based on the selected device category.
   * No parameters.
   * No return value.
   */
  dowloadAllModule(): void {
    if (this.rowData.length > 0) {
      this.moduleservice.downloadModuleByCategory(this.selectedDeviceCategory);
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
   * Handles the file change event when a file is selected for upload.
   * @param event The file change event object.
   * No return value.
   */
  onFileChange(event: any): void {
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
   * Submits the XML upload form.
   * No parameters.
   * No return value.
   */
  uploadXMLSubmit(): void {
    this.uploadFormSubmitted = true;
    if (this.uploadXMLForm.invalid) {
      return;
    } else {
      if (this.uploadFileName) {
        this.uploadFileError = null;
        this.moduleservice.uploadXMLFile(this.uploadFileName).subscribe({
          next: (res) => {
            this._snakebar.open(res.message, '', {
              duration: 1000,
              panelClass: ['success-msg'],
              horizontalPosition: 'end',
              verticalPosition: 'top',
            });
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
            this.uploadXMLForm.reset();
          },
        });
      }
    }
  }

  /**
   * Downloads a module as an XML file based on module name.
   * @param params The parameters containing the module name.
   * No return value.
   */
  downloadModuleXML(params: any): void {
    if (params.moduleName) {
      this.moduleservice
        .downloadXMLModule(params.moduleName)
        .subscribe((blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${params.moduleName}.xml`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        });
    }
  }

  /**
   * Creates a function and stores the user data in the local storage.
   * Navigates to the '/configure/function-list' route.
   * @param data The data to be stored in the local storage.
   * No return value.
   */
  createFunction(data: any): void {
    localStorage.setItem('modules', JSON.stringify(data));
    this.router.navigate(['/configure/function-list']);
  }

  /**
   * Creates a parameter and navigates to the parameter list page.
   * @param data The data to be stored in the local storage.
   * No return value.
   */
  createParameter(data: any): void {
    localStorage.setItem('user', JSON.stringify(data));
    this.router.navigate(['/configure/parameter-list']);
  }

  /**
   * Closes the modal by clicking on the button.
   * No parameters.
   * No return value.
   */
  close(): void {
    (this.moduleListModal?.nativeElement as HTMLElement).style.display = 'none';
    this.renderer.removeStyle(document.body, 'overflow');
    this.renderer.removeStyle(document.body, 'padding-right');
  }

  /**
   * Navigates back to the previous page.
   * No parameters.
   * No return value.
   */
  goBack(): void {
    this.authservice.selectedConfigVal = 'RDKV';
    this.authservice.showSelectedCategory = 'Video';
    this.router.navigate(['/configure']);
  }
}
