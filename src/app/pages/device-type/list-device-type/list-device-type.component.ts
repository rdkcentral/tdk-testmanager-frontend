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
import { Component, OnInit, HostListener} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AgGridAngular } from 'ag-grid-angular';
import {
  ColDef,
  GridApi,
  GridReadyEvent,
  IMultiFilterParams,
} from 'ag-grid-community';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../../utility/component/ag-grid-buttons/button/button.component';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { AuthService } from '../../../auth/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DevicetypeService } from '../../../services/devicetype.service';
import { MaterialModule } from '../../../material/material.module';
import { LoaderComponent } from '../../../utility/component/loader/loader.component';

@Component({
  selector: 'app-list-device-type',
  standalone: true,
  imports: [
    MaterialModule,
    CommonModule,
    ReactiveFormsModule,
    AgGridAngular,
    LoaderComponent,
  ],
  templateUrl: './list-device-type.component.html',
  styleUrl: './list-device-type.component.css',
})
export class ListDeviceTypeComponent implements OnInit {
  public rowSelection: 'single' | 'multiple' = 'single';
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
  /**
   * The column definitions for the grid.
   */
  public columnDefs: ColDef[] = [
    {
      headerName: 'Name',
      field: 'deviceTypeName',
      filter: 'agTextColumnFilter',
      flex: 1,
      filterParams: {} as IMultiFilterParams,
    },
    {
      headerName: 'Type',
      field: 'deviceType',
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
  configureName!: string;
  preferedCategory!: string;
  showLoader = false;

  /**
   * Constructor for ListDeviceTypeComponent.
   * @param router Angular Router for navigation
   * @param authservice Service for authentication and config
   * @param service Service for device type operations
   * @param _snakebar Service for showing snack bar notifications
   */
  constructor(
    private router: Router,
    private authservice: AuthService,
    private service: DevicetypeService,
    private _snakebar: MatSnackBar
  ) {
    this.preferedCategory = localStorage.getItem('preferedCategory') || '';
  }

  /**
   * Initializes the component and loads device types.
   */
  ngOnInit(): void {
    this.showLoader = true;
    this.service
      .getfindallbycategory(this.authservice.selectedConfigVal)
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
  onGridReady(params: GridReadyEvent<any>) {
    this.gridApi = params.api;
    this.adjustPaginationToScreenSize();
  }

  /**
   * Edit the user/device type.
   * @param user The user/device type to edit.
   */
  userEdit(user: any): void {
    localStorage.setItem('user', JSON.stringify(user));
    this.router.navigate(['configure/edit-devicetype']);
  }

  /**
   * Delete the device type.
   * @param data The device type data to delete.
   */
  delete(data: any): void {
    if (data) {
      if (confirm('Are you sure to delete ?')) {
        this.service.deleteDeviceType(data.deviceTypeId).subscribe({
          next: (res) => {
            this.rowData = this.rowData.filter(
              (row: any) => row.deviceTypeId !== data.deviceTypeId
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
   * Navigate to create device type page.
   */
  createDeviceType(): void {
    this.router.navigate(['configure/create-devicetype']);
  }

  /**
   * Go back to the previous page and set config values.
   */
  goBack(): void {
    this.authservice.selectedConfigVal = 'RDKV';
    this.authservice.showSelectedCategory = 'Video';
    this.router.navigate(['/configure']);
  }
}