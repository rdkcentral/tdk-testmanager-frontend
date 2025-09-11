import { Component ,HostListener} from '@angular/core';
import { OemService } from '../../../services/oem.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GridApi, ColDef, IMultiFilterParams, GridReadyEvent, RowSelectedEvent, SelectionChangedEvent } from 'ag-grid-community';
import { AuthService } from '../../../auth/auth.service';
import { ButtonComponent } from '../../../utility/component/ag-grid-buttons/button/button.component';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { AgGridAngular } from 'ag-grid-angular';
import { MaterialModule } from '../../../material/material.module';
import { LoaderComponent } from '../../../utility/component/loader/loader.component';

@Component({
  selector: 'app-list-oem',
  standalone: true,
  imports: [
    MaterialModule,
    CommonModule,
    ReactiveFormsModule,
    AgGridAngular,
    HttpClientModule,
    LoaderComponent,
  ],
  templateUrl: './list-oem.component.html',
  styleUrl: './list-oem.component.css',
})
export class ListOemComponent {
  selectedConfig!: string | null;
  lastSelectedNodeId: string | undefined;
  rowData: any = [];
  public themeClass: string = 'ag-theme-quartz';
  public paginationPageSize = 10;
  public paginationPageSizeSelector: number[] | boolean = [10, 15, 30, 50];
  public tooltipShowDelay = 500;
  isRowSelected: any;
  selectedRow: any;
  isCheckboxSelected: boolean = false;
  public gridApi!: GridApi;
  rowIndex!: number | null;
  selectedRowCount = 0;
  showUpdateButton = false;
  categoryName!: string;
  configureName!: string;
  showLoader = false;
  public columnDefs: ColDef[] = [
    {
      headerName: 'Name',
      field: 'oemName',
      filter: 'agTextColumnFilter',
      flex: 1,
      sort: 'asc',
      filterParams: {} as IMultiFilterParams,
    },
    {
      headerName: 'Action',
      field: '',
      sortable: false,
      cellRenderer: ButtonComponent,
      headerClass: 'no-sort',
      cellRendererParams: (params: any) => ({
        onEditClick: this.userEdit.bind(this),
        onDeleteClick: this.delete.bind(this),
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

  /**
   * Constructor for ListOemComponent.
   * @param router Router instance for navigation.
   * @param authservice AuthService instance for authentication and config value.
   * @param service OemService instance for OEM operations.
   * @param _snakebar MatSnackBar instance for notifications.
   */
  constructor(
    private router: Router,
    private authservice: AuthService,
    private service: OemService,
    private _snakebar: MatSnackBar
  ) {}

  /**
   * Initializes the component and sets up initial state.
   * No parameters.
   */
  ngOnInit(): void {
    this.showLoader = true;
    this.service
      .getOemByList(this.authservice.selectedConfigVal)
      .subscribe((res) => {
        this.rowData = res.data;
        if (
          this.rowData == null ||
          this.rowData == undefined ||
          this.rowData.length > 0
        ) {
          this.showLoader = false;
        }
      });
    this.configureName = this.authservice.selectedConfigVal;
    this.authservice.currentRoute = this.router.url.split('?')[0];
    if (this.configureName === 'RDKB') {
      this.categoryName = 'Broadband';
    } else {
      this.categoryName = 'Video';
    }
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
   * Event handler for when the grid is ready.
   * @param params The grid ready event parameters.
   */
  onGridReady(params: GridReadyEvent<any>): void {
    this.gridApi = params.api;
    this.adjustPaginationToScreenSize();
  }

  /**
   * Deletes an OEM record.
   * @param data The data of the record to delete.
   */
  delete(data: any): void {
    if (confirm('Are you sure to delete ?')) {
      this.service.deleteOem(data.oemId).subscribe({
        next: (res) => {
          this.rowData = this.rowData.filter(
            (row: any) => row.oemId !== data.oemId
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
   * Edits an OEM record.
   * @param user The user/OEM to edit.
   */
  userEdit(user: any): void {
    localStorage.setItem('user', JSON.stringify(user));
    this.service.currentUrl = user.userGroupId;
    this.router.navigate(['configure/oem-edit']);
  }

  /**
   * Navigates to the OEM creation page.
   * No parameters.
   */
  createOem(): void {
    this.router.navigate(['/configure/create-oem']);
  }

  /**
   * Navigates back to the previous page.
   * No parameters.
   */
  goBack(): void {
    this.authservice.selectedConfigVal = 'RDKV';
    this.authservice.showSelectedCategory = 'Video';
    this.router.navigate(['/configure']);
  }
}
