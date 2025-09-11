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
import { ApplicationRef, ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, NgZone, Output, Renderer2, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MaterialModule } from '../../../material/material.module';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { ButtonComponent } from '../../../utility/component/ag-grid-buttons/button/button.component';
import { ScriptsService } from '../../../services/scripts.service';
import { LoaderComponent } from '../../../utility/component/loader/loader.component';

interface Script {
  id: string;
  name: string;
}
interface Module {
  moduleId: string;
  moduleName: string;
  scripts: Script[];
  testGroupName: string;
  expanded?: boolean;
}
interface SuiteModule {
  id: string;
  name: string;
  scripts: Script[];
  description: string;
  expanded?: boolean;
}
@Component({
  selector: 'app-script-list',
  standalone: true,
  imports: [
    CommonModule,
    AgGridAngular,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    ScrollingModule,
    LoaderComponent,
  ],
  templateUrl: './script-list.component.html',
  styleUrl: './script-list.component.css',
})
export class ScriptListComponent {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('filterInput') filterInput!: ElementRef;
  @ViewChild('filterInputSuite') filterInputSuite!: ElementRef;
  @ViewChild('filterButton') filterButton!: ElementRef;
  @ViewChild('filterButtonSuite') filterButtonSuite!: ElementRef;
  @ViewChild('scriptModal', { static: false }) scriptModal?: ElementRef;
  @ViewChild('testSuiteModal', { static: false }) testSuiteModal?: ElementRef;
  categories = ['Video', 'Broadband', 'Camera'];
  selectedCategory!: string;
  categoryName!: string;
  uploadScriptForm!: FormGroup;
  uploadtestSuiteForm!: FormGroup;
  uploadFormSubmitted = false;
  xmlFormSubmitted = false;
  uploadFileName!: File | null;
  xmlFileName!: File | null;
  viewName: string = 'scripts';
  testsuitTable = false;
  scriptTable = true;
  category: any;
  selectedRowCount = 0;
  rowData: any = [];
  public themeClass: string = 'ag-theme-quartz';
  scriptPageSize = 10;
  testsuitePageSize = 10;
  public gridApi!: GridApi;
  allPageSize = 10;
  currentPage = 0;
  paginatedSuiteData: SuiteModule[] = [];
  paginatedScriptData: Module[] = [];
  filterText: string = '';
  filterTextSuite: string = '';
  globalSearchTerm: string = '';
  showFilterInput = false;
  showFilterInputsuite = false;
  scriptFilteredData: Module[] = [];
  testSuiteFilteredData: SuiteModule[] = [];
  scriptDataArr: Module[] = [];
  testSuiteDataArr: SuiteModule[] = [];
  panelOpenState = false;
  suitePanelOpen = false;
  sortOrder: 'asc' | 'desc' = 'asc';
  gridColumnApi: any;
  noScriptFound!: string;
  scriptDetails: any;
  uploadFileError: string | null = null;
  loggedinUser: any;
  preferedCategory!: string;
  userCategory!: string;
  showLoader = false;
  debounceTimer: any = null;

  public columnDefs: ColDef[] = [
    {
      headerName: 'Sl. No.',
      valueGetter: (params) =>
        params.node?.childIndex ? params.node?.childIndex + 1 : '1',
      flex: 1,
      pinned: 'left',
    },
    {
      headerName: 'Script Name',
      field: 'name',
      filter: 'agTextColumnFilter',
      flex: 2,
      sortable: true,
      cellRenderer: (params: any) => {
        return `<span style="user-select: text;">${params.value}</span>`;
      },
    },
    {
      headerName: 'Action',
      field: '',
      sortable: false,
      flex: 1,
      headerClass: 'no-sort',
      cellRenderer: ButtonComponent,
      cellRendererParams: (params: any) => ({
        onEditClick: this.editScript.bind(this),
        onDeleteClick: this.deleteScript.bind(this),
        onDownloadZip: this.downloadScriptZip.bind(this),
        onDownloadMd: this.downloadMdFile.bind(this),
        selectedRowCount: () => this.selectedRowCount,
      }),
    },
  ];
  public testSutiteColumn: ColDef[] = [
    {
      headerName: 'Sl. No.',
      valueGetter: (params) =>
        params.node?.childIndex ? params.node?.childIndex + 1 : '1',
      flex: 1,
      pinned: 'left',
    },
    {
      headerName: 'Script Name',
      field: 'name',
      filter: 'agTextColumnFilter',
      flex: 1,
      sortable: true,
      cellRenderer: (params: any) => {
        return `<span style="user-select: text;">${params.value}</span>`;
      },
    },
  ];
  gridOptions = {
    rowHeight: 30,
  };
  /**
   * Constructor for ScriptListComponent.
   * @param router Router instance for navigation.
   * @param authservice AuthService instance for authentication.
   * @param fb FormBuilder instance for reactive forms.
   * @param _snakebar MatSnackBar for notifications.
   * @param dialog MatDialog instance for dialogs.
   * @param cdRef ChangeDetectorRef for change detection.
   * @param scriptservice ScriptsService for script operations.
   * @param renderer Renderer2 for DOM manipulation.
   * @param appRef ApplicationRef for application reference.
   */
  constructor(
    private router: Router,
    private authservice: AuthService,
    private fb: FormBuilder,
    private _snakebar: MatSnackBar,
    public dialog: MatDialog,
    private cdRef: ChangeDetectorRef,
    private scriptservice: ScriptsService,
    private renderer: Renderer2,
    private appRef: ApplicationRef
  ) {
    this.loggedinUser = JSON.parse(
      localStorage.getItem('loggedinUser') || '{}'
    );
    this.userCategory = this.loggedinUser.userCategory;
    this.preferedCategory = localStorage.getItem('preferedCategory') || '';
  }
  /**
   * Initializes the component. This method is called once the component has been initialized.
   * It sets up the initial state of the component by determining the selected category, view name,
   * and category name from either the component's properties or local storage.
   * Depending on the view name, it configures the visibility of the test suite and script tables
   * and triggers the appropriate data fetching and sorting methods.
   * It also initializes the forms for uploading scripts and test suites.
   *
   * @returns {void}
   */
  ngOnInit(): void {
    this.selectedCategory = this.preferedCategory
      ? this.preferedCategory
      : this.userCategory;
    let localViewName = localStorage.getItem('viewName') || 'scripts';
    localStorage.setItem('category', this.selectedCategory);
    this.setCategoryName(this.selectedCategory);
    this.viewChange(localViewName);
    this.onResize(null);
    this.uploadScriptForm = new FormGroup({
      uploadZip: new FormControl<string | null>('', {
        validators: Validators.required,
      }),
    });
    this.uploadtestSuiteForm = this.fb.group({
      uploadXML: [null, Validators.required],
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    // Adjust page size based on screen height
    const height = window.innerHeight;
    // Handle 4K and other very high resolution displays
    if (height > 2000) {
      this.allPageSize = 30;
    } else if (height > 1500) {
      this.allPageSize = 25;
    } else if (height > 1200) {
      this.allPageSize = 20;
    } else if (height > 900) {
      this.allPageSize = 20;
    } else if (height > 768) {
      this.allPageSize = 15;
    } else {
      this.allPageSize = 10;
    }

    // Update grid if initialized
    if (this.gridApi) {
      setTimeout(() => {
        this.gridApi.sizeColumnsToFit();
      }, 100);
    }

    // Refresh the pagination based on the current view
    if (this.viewName === 'testsuites') {
      this.paginateSuiteData();
    } else {
      this.scriptDataPagination();
    }
  }
  /**
   * Event handler for the grid's "ready" event.
   *
   * This method is called when the grid has finished initializing and is ready to be interacted with.
   * It sets the grid API instance to the component's `gridApi` property.
   *
   * @param params - The event parameters containing the grid API instance.
   */
  onGridReady(params: GridReadyEvent<any>) {
    this.gridApi = params.api;
  }
  /**
   * Finds all scripts by the given category.
   *
   * This method calls the script service to fetch all scripts associated with the specified category.
   * The fetched scripts are then parsed and stored in `scriptDataArr` and `scriptFilteredData`.
   * If an error occurs during the fetch, the error message is stored in `noScriptFound`.
   *
   * @param category - The category to filter scripts by.
   */
  findallScriptsByCategory(category: any) {
    this.showLoader = true;
    this.scriptservice.getallbymodules(category).subscribe({
      next: (res) => {
        if (res) {
          this.scriptDataArr = res.data;
          this.cdRef.detectChanges();
          this.filterScript();
          this.scriptSorting();
          this.showLoader = false;
        } else {
          this.cdRef.detectChanges();
          this.scriptDataArr = [];
          this.showLoader = false;
        }
      },
      error: (err) => {
        let errmsg = err.message;
        if (errmsg && errmsg.includes('No script found for category')) {
          this.noScriptFound = 'No Rows To Show';
        }
      },
    });
  }

  /**
   * Sets the category name based on the provided category value.
   * @param category The category value ('RDKB', 'RDKC', or other).
   */
  setCategoryName(category: string) {
    if (category === 'RDKB') {
      this.categoryName = 'Broadband';
    } else if (category === 'RDKC') {
      this.categoryName = 'Camera';
    } else {
      this.categoryName = 'Video';
    }
  }
  /**
   * Handles the change of category selection and updates the relevant data and view accordingly.
   *
   * This method clears existing data arrays and sets the view name from local storage.
   * Depending on the view name ('testsuites' or 'scripts') and the selected category ('RDKB', 'RDKC', or other),
   * it updates the category name, selected category, and calls the appropriate methods to fetch data.
   *
   * @param val - The selected category value ('RDKB', 'RDKC', or other).
   *
   * Side Effects:
   * - Updates `scriptDataArr`, `scriptFilteredData`, `testSuiteDataArr`, and `paginatedSuiteData` to empty arrays.
   * - Sets `viewName` from local storage.
   * - Updates `categoryName`, `selectedCategory`, and `authservice.selectedCategory` based on the selected category.
   * - Calls `allTestSuilteListByCategory` or `findallScriptsByCategory` based on the view name and selected category.
   * - Updates local storage with the selected category and category name.
   * - Resets `authservice.videoCategoryOnly` to an empty string.
   */
  categoryChange(event: any): void {
    let val = event.target.value;
    this.scriptDataArr = [];
    this.testSuiteDataArr = [];
    this.paginatedSuiteData = [];
    this.paginatedScriptData = [];
    if (this.viewName === 'testsuites') {
      if (val === 'RDKB') {
        this.categoryName = 'Broadband';
        this.selectedCategory = 'RDKB';
        localStorage.setItem('preferedCategory', 'RDKB');
        this.authservice.selectedCategory = this.selectedCategory;
        this.allTestSuilteListByCategory();
      } else {
        this.selectedCategory = 'RDKV';
        this.categoryName = 'Video';
        localStorage.setItem('preferedCategory', 'RDKV');
        this.authservice.selectedCategory = this.selectedCategory;
        this.allTestSuilteListByCategory();
      }
    }
    if (this.viewName === 'scripts') {
      if (val === 'RDKB') {
        this.categoryName = 'Broadband';
        this.selectedCategory = 'RDKB';
        localStorage.setItem('preferedCategory', 'RDKB');
        this.findallScriptsByCategory(this.selectedCategory);
      } else {
        this.selectedCategory = 'RDKV';
        this.categoryName = 'Video';
        localStorage.setItem('preferedCategory', 'RDKV');
        this.findallScriptsByCategory(this.selectedCategory);
      }
    }
    localStorage.setItem('category', this.selectedCategory);
    localStorage.setItem('categoryname', this.categoryName);
    this.authservice.videoCategoryOnly = '';
  }
  /**
   * Changes the current view based on the provided name.
   * Updates the view name, clears the global search term, and stores the view name in local storage.
   * Depending on the view name, it toggles the visibility of the testsuite and script tables,
   * and fetches the relevant data by category.
   *
   * @param name - The name of the view to switch to. Expected values are 'testsuites' or 'scripts'.
   */
  viewChange(name: string): void {
    this.viewName = name;
    this.globalSearchTerm = '';
    this.showLoader = true; // Show loader immediately

    localStorage.setItem('viewName', this.viewName);
    if (name === 'testsuites') {
      this.testsuitTable = true;
      this.scriptTable = false;

      this.allTestSuilteListByCategory();
      if (this.paginatedSuiteData.length > 0) {
        this.showLoader = false;
      }
    }
    if (name === 'scripts') {
      this.testsuitTable = false;
      this.scriptTable = true;

      this.findallScriptsByCategory(this.selectedCategory);
      if (this.paginatedScriptData.length > 0) {
        this.showLoader = false;
      }
    }
  }
  /**
   * Fetches all test suites for the selected category from the script service.
   *
   * This method makes an HTTP request to retrieve all test suites associated with the currently
   * selected category. Upon receiving a response, it updates the `testSuiteDataArr` with the
   * parsed data and triggers change detection. It also applies filters and sorting to the test
   * suite data. If no data is received, it clears the `testSuiteDataArr` and triggers change
   * detection.
   *
   * In case of an error, it parses the error message and sets the `noScriptFound` property.
   *
   * @returns {void}
   */
  allTestSuilteListByCategory() {
    this.showLoader = true;
    this.scriptservice.getAllTestSuite(this.selectedCategory).subscribe({
      next: (res) => {
        if (res) {
          this.testSuiteDataArr = res.data;
          this.cdRef.detectChanges();
          this.applyFilterSuite();
          this.toggleSortSuite();
          this.showLoader = false;
        } else {
          this.cdRef.detectChanges();
          this.testSuiteDataArr = [];
        }
      },
      error: (err) => {
        let errmsg = err.message;
        if (errmsg.message === " Test suite - 'RDKB' doesnt exist") {
          this.noScriptFound = 'No Rows To Show';
        }
        if (errmsg.message === " Test suite - 'RDKV' doesnt exist") {
          this.noScriptFound = 'No Rows To Show';
        }
      },
    });
  }
  /**
   * Paginates the script data based on the current page index and page size of the paginator.
   * If the paginator is not available, the function returns without making any changes.
   *
   * The function calculates the start and end indices for the current page and slices the
   * `scriptFilteredData` array accordingly. After updating the `scriptFilteredData`, it triggers
   * change detection to update the view.
   *
   * @returns {void}
   */
  scriptDataPagination() {
    if (!this.paginator) {
      return;
    }
    const start = this.paginator.pageIndex * this.paginator.pageSize;
    const end = start + this.paginator.pageSize;
    this.paginatedScriptData = this.scriptFilteredData.slice(start, end);
    this.cdRef.detectChanges();
  }
  /**
   * Paginates the filtered test suite data based on the current page index and page size.
   * Updates the `paginatedSuiteData` property with the sliced data and triggers change detection.
   *
   * @remarks
   * This method relies on the `paginator` object to determine the current page index and page size.
   * If the `paginator` is not available, the method returns early without performing any operations.
   *
   * @returns {void}
   */
  paginateSuiteData() {
    if (!this.paginator) {
      return;
    }
    const start = this.paginator.pageIndex * this.paginator.pageSize;
    const end = start + this.paginator.pageSize;
    this.paginatedSuiteData = this.testSuiteFilteredData.slice(start, end);
    this.cdRef.detectChanges();
  }
  /**
   * Handles the page change event from the paginator.
   * Updates the current page index and triggers the appropriate data pagination method.
   *
   * @param event - The page change event object.
   */
  onPageChange(event: any): void {
    this.currentPage = event.pageIndex;
    if (this.viewName === 'testsuites') {
      this.paginateSuiteData();
    }
  }
  /**
   * Handles the page change event for the script table paginator.
   * @param event The page change event object.
   */
  onPageChangeScript(event: any): void {
    this.currentPage = event.pageIndex;
    this.scriptDataPagination();
  }
  /**
   * Sorts the script data based on the module name in ascending or descending order.
   * The sort order toggles between 'asc' (ascending) and 'desc' (descending) each time the method is called.
   * After sorting, the script data is paginated.
   *
   * @remarks
   * This method modifies the `sortOrder` property of the component and sorts the `scriptFilteredData` array.
   * It then calls the `scriptDataPagination` method to update the pagination of the sorted data.
   */
  scriptSorting() {
    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    this.scriptFilteredData.sort((a, b) => {
      if (this.sortOrder === 'asc') {
        return a.moduleName.localeCompare(b.moduleName);
      } else {
        return b.moduleName.localeCompare(a.moduleName);
      }
    });
    this.scriptDataPagination();
  }
  /**
   * Toggles the sort order of the test suite data between ascending and descending.
   * Sorts the `testSuiteFilteredData` array based on the current sort order.
   * After sorting, it calls the `paginateSuiteData` method to update the displayed data.
   */
  toggleSortSuite() {
    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    this.testSuiteFilteredData.sort((a, b) => {
      if (this.sortOrder === 'asc') {
        return a.name.localeCompare(b.name);
      } else {
        return b.name.localeCompare(a.name);
      }
    });
    this.paginateSuiteData();
  }
  /**
   * Toggles the visibility of the filter input field.
   * If the filter input is hidden, it resets the filter text,
   * applies the filter to the script list, and sorts the scripts.
   */
  toggleFilterInput() {
    this.showFilterInput = !this.showFilterInput;
    if (!this.showFilterInput) {
      this.filterText = '';
      this.filterScript();
      this.scriptSorting();
    }
  }
  /**
   * Toggles the visibility of the filter input field for test suites.
   * If the filter input is hidden, it resets the filter text,
   * applies the filter to the test suite list, and sorts the test suites.
   */
  toggleFilterInputSuite() {
    this.showFilterInputsuite = !this.showFilterInputsuite;
    if (!this.showFilterInputsuite) {
      this.filterTextSuite = '';
      this.applyFilterSuite();
      this.toggleSortSuite();
    }
  }
  /**
   * Filters the script data based on the provided filter text.
   *
   * If `filterText` is provided, it filters the `scriptDataArr` to include only those
   * items whose `moduleName` includes the `filterText` (case insensitive).
   * If `filterText` is not provided, it resets the filtered data to the original `scriptDataArr`
   * and sorts the scripts.
   *
   * After filtering, it resets the paginator to the first page and updates the paginated data.
   */
  filterScript() {
    if (this.filterText) {
      this.scriptFilteredData = this.scriptDataArr.filter((parent: any) =>
        parent.moduleName.toLowerCase().includes(this.filterText.toLowerCase())
      );
    } else {
      this.scriptFilteredData = [...this.scriptDataArr];
      this.scriptSorting();
    }
    this.paginator.firstPage();
    this.scriptDataPagination();
  }
  /**
   * Applies a filter to the test suite data based on the filter text.
   *
   * If `filterTextSuite` is provided, it filters the `testSuiteDataArr` to include only those
   * items whose `name` property includes the `filterTextSuite` (case-insensitive).
   * If `filterTextSuite` is not provided, it resets the filtered data to the original array
   * and toggles the sorting of the suite.
   *
   * After filtering, it resets the paginator to the first page and paginates the filtered data.
   */
  applyFilterSuite() {
    if (this.filterTextSuite) {
      this.testSuiteFilteredData = this.testSuiteDataArr.filter((parent: any) =>
        parent.name.toLowerCase().includes(this.filterTextSuite.toLowerCase())
      );
    } else {
      this.testSuiteFilteredData = [...this.testSuiteDataArr];
      this.toggleSortSuite();
    }
    this.paginator.firstPage();
    this.paginateSuiteData();
  }

  /**
   * Handles the input event for the global search box with debounce.
   */
  onSearchInput() {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    this.debounceTimer = setTimeout(() => {
      this.globalSearch();
    }, 2000); // 2 seconds debounce
  }

  /**
   * Performs a global search on the test suites or scripts based on the view name.
   *
   * If the view name is 'testsuites', it filters the test suites and their scripts
   * based on the global search term. If the search term is empty, it resets the
   * paginated suite data to the original test suite data array.
   *
   * If the view name is not 'testsuites', it filters the scripts within the modules
   * based on the global search term. If the search term is empty, it resets the
   * script filtered data to the original script data array.
   *
   * @returns {void}
   */
  globalSearch() {
    const searchTerm = this.globalSearchTerm.toLowerCase();
    if (this.viewName === 'testsuites') {
      if (searchTerm) {
        this.paginatedSuiteData = this.testSuiteDataArr.map(
          (suite: SuiteModule) => {
            const filteredScripts = suite.scripts.filter((script) =>
              script.name.toLowerCase().includes(searchTerm)
            );
            return {
              ...suite,
              scripts: filteredScripts,
              expanded: filteredScripts.length > 0,
            };
          }
        );
        this.paginatedSuiteData = this.paginatedSuiteData.filter(
          (suite) => suite.scripts.length > 0
        );
      } else {
        this.paginatedSuiteData = [...this.testSuiteDataArr];
        this.paginateSuiteData();
      }
    } else {
      if (searchTerm) {
        this.paginatedScriptData = this.scriptDataArr.map((module: Module) => {
          const filteredScripts = module.scripts.filter((script) =>
            script.name.toLowerCase().includes(searchTerm)
          );
          return {
            ...module,
            scripts: filteredScripts,
            expanded: filteredScripts.length > 0,
          };
        });
        this.paginatedScriptData = this.paginatedScriptData.filter(
          (module) => module.scripts.length > 0
        );
      } else {
        this.paginatedScriptData = [...this.scriptDataArr];
        this.scriptDataPagination();
      }
    }
  }
  /**
   * Closes the modal  by click on button .
   */
  close() {
    (this.scriptModal?.nativeElement as HTMLElement).style.display = 'none';
    this.renderer.removeStyle(document.body, 'overflow');
    this.renderer.removeStyle(document.body, 'padding-right');
  }
  /**
   * Closes the modal  by click on button .
   */
  closeSuiteModal() {
    this.uploadtestSuiteForm.value.uploadXML = '';
    (this.testSuiteModal?.nativeElement as HTMLElement).style.display = 'none';
    this.renderer.removeStyle(document.body, 'overflow');
    this.renderer.removeStyle(document.body, 'padding-right');
  }
  /**
   * Handles the file change event when a file is selected for upload.
   * @param event - The file change event object.
   */
  onFileChange(event: any) {
    this.uploadFileName = event.target.files[0].name;
    const file: File = event.target.files[0];
    if (file) {
      if (file.name.endsWith('.zip')) {
        this.uploadScriptForm.patchValue({ file: file });
        this.uploadFileName = file;
        this.uploadFileError = null;
      } else {
        this.uploadScriptForm.patchValue({ file: null });
        this.uploadFileError = 'Please upload a valid zip file.';
      }
    }
  }
  /**
   * Handles the submission of the upload script form.
   *
   * This method sets the form submission flag to true and checks if the form is valid.
   * If the form is invalid, it returns early. If the form is valid and a file name is provided,
   * it attempts to upload the file using the script service.
   *
   * On successful upload, it displays a success message using the snackbar, closes the form,
   * and reinitializes the component.
   *
   * On upload error, it parses the error message, displays it using the snackbar, reinitializes
   * the component, closes the form, and resets the upload form.
   *
   * @returns {void}
   */
  uploadScriptSubmit() {
    this.uploadFormSubmitted = true;
    if (this.uploadScriptForm.invalid) {
      return;
    } else {
      if (this.uploadFileName) {
        this.uploadFileError = null;
        this.scriptservice.uploadZipFile(this.uploadFileName).subscribe({
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
            this.uploadScriptForm.reset();
          },
        });
      }
    }
  }
  /**
   * Handles the file input event for uploading a test suite XML file.
   *
   * @param event - The file input event containing the selected file.
   *
   * This method performs the following actions:
   * - Extracts the file name from the event and assigns it to `xmlFileName`.
   * - Checks if the file is of type 'text/xml'.
   *   - If the file is a valid XML file, it updates the form with the file and clears any upload errors.
   *   - If the file is not a valid XML file, it resets the form file value and sets an upload error message.
   */
  testSuiteXMLFile(event: any) {
    this.xmlFileName = event.target.files[0].name;
    const file: File = event.target.files[0];
    if (file) {
      if (file.type === 'text/xml') {
        this.uploadtestSuiteForm.patchValue({ file: file });
        this.xmlFileName = file;
        this.uploadFileError = null;
      } else {
        this.uploadtestSuiteForm.patchValue({ file: null });
        this.uploadFileError = 'Please upload a valid XML file.';
      }
    }
  }
  /**
   * Submits the test suite file.
   *
   * This method handles the submission of the test suite XML file. It first sets the `xmlFormSubmitted` flag to true.
   * If the form is invalid, it returns early. Otherwise, it proceeds to check if the `xmlFileName` is present.
   *
   * If the `xmlFileName` is present, it calls the `uploadTestSuiteXML` method of the `scriptservice` to upload the file.
   * On successful upload, it displays a success message using `_snakebar`, resets the form, closes the suite modal, and
   * refreshes the list of test suites by category.
   *
   * In case of an error during the upload, it parses the error message, displays it using `_snakebar`, reinitializes the component,
   * closes the modal, and resets the form.
   *
   * @returns {void}
   */
  testSuiteFileSubmit() {
    this.xmlFormSubmitted = true;
    if (this.uploadtestSuiteForm.invalid) {
      return;
    } else {
      if (this.xmlFileName) {
        this.uploadFileError = null;
        this.scriptservice.uploadTestSuiteXML(this.xmlFileName).subscribe({
          next: (res) => {
            this._snakebar.open(res.message, '', {
              duration: 1000,
              panelClass: ['success-msg'],
              horizontalPosition: 'end',
              verticalPosition: 'top',
            });
            this.uploadtestSuiteForm.reset();
            this.closeSuiteModal();
            this.allTestSuilteListByCategory();
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
            this.uploadtestSuiteForm.reset();
          },
        });
      }
    }
  }
  /**
   * Navigates to the 'create-scripts' page.
   * This method is triggered to initiate the creation of new scripts.
   */
  createScripts(): void {
    this.router.navigate(['script/create-scripts']);
  }
  /**
   * Navigates to the 'create-script-group' route.
   * This method is used to initiate the creation of a new script group.
   */
  createScriptGroup(): void {
    this.router.navigate(['script/create-script-group']);
  }
  /**
   * Navigates to the script creation group page with the specified video category.
   *
   * @param value - The category of the video to be used for script creation.
   */
  createScriptVideo(value: string) {
    let onlyVideoCategory = value;
    this.authservice.videoCategoryOnly = onlyVideoCategory;
    this.router.navigate(['script/create-script-group']);
  }
  /**
   * Navigates to the custom test suite page.
   * This method uses the Angular Router to navigate to the 'script/custom-testsuite' route.
   */
  customTestSuite() {
    this.router.navigate(['script/custom-testsuite'], {
      state: { category: this.selectedCategory },
    });
  }
  /**
   * Edits a script by fetching its details using the provided edit data.
   *
   * This method retrieves the script details from the server based on the
   * provided `editData`'s `id`, parses the response, stores the script details
   * in the local storage, and navigates to the script editing page.
   *
   * @param editData - The data containing the ID of the script to be edited.
   */
  editScript(editData: any): void {
    this.scriptservice.scriptFindbyId(editData.id).subscribe({
      next: (res) => {
        this.scriptDetails = res.data;
        localStorage.setItem(
          'scriptDetails',
          JSON.stringify(this.scriptDetails)
        );
        this.router.navigate(['script/edit-scripts']);
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
   * Deletes a script after user confirmation.
   *
   * @param data - The data object containing the script information.
   *
   * This method prompts the user for confirmation before proceeding to delete the script.
   * If the user confirms, it calls the script service to delete the script by its ID.
   *
   * On successful deletion, it displays a success message using the snackbar and refreshes the script list by category.
   * On error, it displays an error message using the snackbar.
   */
  deleteScript(data: any) {
    if (confirm('Are you sure to delete ?')) {
      if (data) {
        this.scriptservice.delete(data.id).subscribe({
          next: (res) => {
            this._snakebar.open(res.message, '', {
              duration: 1000,
              panelClass: ['success-msg'],
              horizontalPosition: 'end',
              verticalPosition: 'top',
            });
            this.findallScriptsByCategory(this.selectedCategory);
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
   * Downloads a script as a ZIP file.
   *
   * This method triggers the download of a ZIP file containing the script specified
   * in the `downloadData` parameter. It creates a blob from the response, generates
   * a URL for the blob, and programmatically creates and clicks an anchor element
   * to initiate the download.
   *
   * @param downloadData - An object containing the name of the script to be downloaded.
   */
  downloadScriptZip(downloadData: any) {
    this.scriptservice.downloadSriptZip(downloadData.name).subscribe((blob) => {
      const xmlBlob = new Blob([blob], { type: 'application/zip' });
      const url = window.URL.createObjectURL(xmlBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${downloadData.name}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    });
  }

  /**
   * Downloads a Markdown file for the specified script.
   *
   * @param params - The parameters containing the script name.
   * @param params.name - The name of the script for which to download the Markdown file.
   *
   * This method calls the `downloadMdFile` service method with the provided script name,
   * subscribes to the resulting blob, and creates a downloadable Markdown file.
   * The file is named using the script name with an `.md` extension.
   */
  downloadMdFile(downloadData: any) {
    this.scriptservice.downloadMdFile(downloadData.name).subscribe((blob) => {
      const mdBlob = new Blob([blob], { type: 'text/markdown' });
      const url = window.URL.createObjectURL(mdBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${downloadData.name}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    });
  }

  /**
   * Downloads an XML file for the specified module.
   *
   * @param params - The parameters containing the module name.
   * @param params.moduleName - The name of the module for which to download the XML file.
   *
   * This method calls the `downloadTestcases` service method with the provided module name,
   * subscribes to the resulting blob, and creates a downloadable XML file.
   * The file is named using the module name with an `.xlsx` extension.
   */
  downloadXML(params: any): void {
    if (params.moduleName) {
      this.scriptservice
        .downloadTestcases(params.moduleName)
        .subscribe((blob) => {
          const xmlBlob = new Blob([blob], { type: 'application/xml' }); // Ensure correct MIME type
          const url = window.URL.createObjectURL(xmlBlob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `Testcases_Module-${params.moduleName}.xlsx`;
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        });
    }
  }
  /**
   * Downloads a script file.
   *
   * @param params - The parameters containing the script name.
   * @param params.name - The name of the script to be downloaded.
   *
   * This method calls the `downloadScript` service method with the provided script name,
   * subscribes to the resulting blob, and creates a downloadable script file.
   * The file is named using the script name with an `.zip` extension.
   */
  downloadScript(params: any): void {
    if (params.name) {
      this.scriptservice.downloadScript(params.name).subscribe((blob) => {
        const xmlBlob = new Blob([blob], { type: 'application/zip' }); // Ensure correct MIME type
        const url = window.URL.createObjectURL(xmlBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${params.name}.zip`;
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      });
    }
  }
  /**
   * Downloads test cases as a ZIP file.
   *
   * This method retrieves the selected configuration value from the authentication service,
   * requests the test cases ZIP file from the script service, and triggers a download of the file.
   *
   * The downloaded file is named using the format `Testcase_<category>.zip`, where `<category>`
   * is the selected configuration value.
   *
   * @returns {void}
   */
  downloadTestCases() {
    console.log('Download button clicked');

    this.scriptservice
      .downloadTestCasesZip(this.selectedCategory)
      .subscribe((blob) => {
        const xmlBlob = new Blob([blob], { type: 'application/zip' });
        const url = window.URL.createObjectURL(xmlBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Testcase_${this.selectedCategory}.zip`;
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      });
  }
  /**
   * Initiates the download of all test suite XML files as a ZIP archive for the selected category.
   *
   * This method calls the `downloadalltestsuitexmlZip` service method, which returns a blob containing
   * the ZIP file. The blob is then converted into a downloadable URL, and an anchor element is created
   * and triggered to start the download. The anchor element is removed from the DOM after the download
   * is initiated, and the object URL is revoked to free up memory.
   *
   * @returns {void}
   */
  downloadAllSuitesZIP() {
    this.scriptservice
      .downloadalltestsuitexmlZip(this.selectedCategory)
      .subscribe((blob) => {
        const xmlBlob = new Blob([blob], { type: 'application/zip' });
        const url = window.URL.createObjectURL(xmlBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `TestSuites_${this.selectedCategory}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      });
  }
  /**
   * Downloads a test suite XML file based on the provided parameters.
   *
   * @param params - An object containing the parameters for the download.
   * @param params.name - The name of the test suite to be downloaded.
   *
   * This method uses the `scriptservice` to download the test suite XML file.
   * It creates a temporary anchor element to trigger the download of the file.
   * The file is named using the `params.name` value with an `.xml` extension.
   * After the download is triggered, the temporary anchor element is removed
   * from the document and the object URL is revoked.
   */
  downloadSuiteXML(params: any) {
    if (params.name) {
      this.scriptservice.downloadTestSuiteXML(params.name).subscribe((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${params.name}.xml`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      });
    }
  }
  /**
   * Downloads an Excel file for the given test suite.
   *
   * @param params - An object containing the parameters for the download.
   * @param params.name - The name of the test suite to download.
   */
  downloadSuiteExcel(params: any) {
    if (params.name) {
      this.scriptservice
        .downloadTestSuiteXLSX(params.name)
        .subscribe((blob) => {
          const xmlBlob = new Blob([blob], { type: 'application/xml' });
          const url = window.URL.createObjectURL(xmlBlob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `Suite_Testcases_${params.name}.xlsx`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        });
    }
  }
  /**
   * Deletes a test suite after user confirmation.
   *
   * @param params - The parameters containing the ID of the test suite to be deleted.
   *
   * The function first asks for user confirmation before proceeding with the deletion.
   * If the user confirms and the `params` object contains an `id`, it calls the `deleteTestSuite` method
   * from the `scriptservice` to delete the test suite.
   *
   * On successful deletion, it displays a success message using `_snakebar` and updates the view by
   * calling `allTestSuilteListByCategory` after detecting changes with `cdRef.detectChanges`.
   *
   * If an error occurs during the deletion process, it parses the error message and displays it using `_snakebar`.
   */
  deleteSuite(params: any) {
    if (confirm('Are you sure to delete ?')) {
      if (params.id) {
        this.scriptservice.deleteTestSuite(params.id).subscribe({
          next: (res) => {
            this._snakebar.open(res.message, '', {
              duration: 1000,
              panelClass: ['success-msg'],
              horizontalPosition: 'end',
              verticalPosition: 'top',
            });
            const rowToRemove = this.paginatedSuiteData.find(
              (row: any) => row.id === params.id
            );
            if (rowToRemove) {
              this.cdRef.detectChanges();
              this.allTestSuilteListByCategory();
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
   * Navigates to the edit test suite page with the provided test suite data.
   *
   * @param testSuiteData - The data of the test suite to be edited.
   */
  editTestSuite(testSuiteData: any) {
    this.router.navigate(['script/edit-testsuite'], {
      state: { testSuiteData },
    });
  }

  @HostListener('document:click', ['$event'])
  /**
   * Handles the click event outside of the filter input and filter button.
   * If the click is detected outside of these elements, it hides the filter input.
   *
   * @param event - The click event triggered by the user.
   */
  onClickOutside(event: Event) {
    // Hide script filter input if click is outside
    if (
      this.showFilterInput &&
      this.filterInput &&
      !this.filterInput.nativeElement.contains(event.target) &&
      this.filterButton &&
      !this.filterButton.nativeElement.contains(event.target)
    ) {
      this.showFilterInput = false;
    }
    // Hide suite filter input if click is outside
    if (
      this.showFilterInputsuite &&
      this.filterInputSuite &&
      !this.filterInputSuite.nativeElement.contains(event.target) &&
      this.filterButtonSuite &&
      !this.filterButtonSuite.nativeElement.contains(event.target)
    ) {
      this.showFilterInputsuite = false;
    }
  }
  /**
   * Toggles the expansion state of a given parent panel and updates the component's panel open state.
   *
   * @param parent - The parent object whose expanded state is to be toggled.
   */
  togglePanel(parent: any) {
    parent.expanded = !parent.expanded;
    this.panelOpenState = !this.panelOpenState;
  }
  /**
   * Toggles the expanded state of a test suite and updates the suite panel state.
   *
   * @param suite - The test suite object whose expanded state is to be toggled.
   */
  toggleTestSuite(suite: any) {
    suite.expanded = !suite.expanded;
    this.suitePanelOpen = !this.suitePanelOpen;
  }
}
