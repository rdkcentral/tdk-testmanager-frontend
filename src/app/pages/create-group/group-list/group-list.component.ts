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
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
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
import { ButtonComponent } from '../../../utility/component/ag-grid-buttons/button/button.component';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { UsergroupService } from '../../../services/usergroup.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaterialModule } from '../../../material/material.module';

@Component({
  selector: 'app-group-list',
  standalone: true,
  imports: [MaterialModule,CommonModule, ReactiveFormsModule, AgGridAngular],
  templateUrl: './group-list.component.html',
  styleUrl: './group-list.component.css'
})
export class GroupListComponent implements OnInit {


  public rowSelection: 'single' | 'multiple' = 'single';
  lastSelectedNodeId: string | undefined;
  rowData: any = [];
  public themeClass: string = "ag-theme-quartz";
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
  seletecUserGroup: any;

  public columnDefs: ColDef[] = [
    {
      headerName: 'Name',
      field: 'userGroupName',
      filter: 'agTextColumnFilter',
      flex: 1,
      filterParams: {
      } as IMultiFilterParams,
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
      })
    }
  ];
  public defaultColDef: ColDef = {
    flex: 1,
    menuTabs: ['filterMenuTab'],
  };
  gridOptions = {
    rowHeight: 36
  };

  /**
   * Constructor for GroupListComponent
   * @param router - Router instance
   * @param service - UsergroupService instance
   * @param _snakebar - MatSnackBar for notifications
   */
  constructor(private router: Router, private service: UsergroupService,
    private _snakebar: MatSnackBar
  ) { }


  /**
   * Initializes the component.
   * Retrieves the user group list from the service and assigns it to the rowData property.
   */
  ngOnInit(): void {
    this.service.getuserGroupList().subscribe((data) => (this.rowData = data));
  }


  /**
   * Event handler for when the grid is ready.
   * @param params The grid ready event parameters.
   */  
  onGridReady(params: GridReadyEvent<any>):void {
    this.gridApi = params.api;
  }


  /**
   * Deletes a user group.
   * @param data The data of the user group to delete.
   */
  delete(data: any) :void{
    if (confirm("Are you sure want to delete ? ")) {
      this.service.deleteUserGroup(data.userGroupId).subscribe({
        next: (res) => {
          this.rowData = this.rowData.filter((row: any) => row.userGroupId !== data.userGroupId);
          this.rowData = [...this.rowData];
          this._snakebar.open(res, '', {
            duration: 3000,
            panelClass: ['success-msg'],
            horizontalPosition: 'end',
            verticalPosition: 'top'
          })
          this.ngOnInit();
        },
        error: (err) => {
          let errmsg = JSON.parse(err.error)
          this._snakebar.open(errmsg.message, '', {
            duration: 3000,
            panelClass: ['err-msg'],
            horizontalPosition: 'end',
            verticalPosition: 'top'
          })
        }
      })
    }
  }


  /**
   * Event handler for when a row is selected.
   * @param event The row selected event.
   */  
  onRowSelected(event: RowSelectedEvent):void {
    this.isRowSelected = event.node.isSelected();
    this.rowIndex = event.rowIndex
  }


  /**
   * Event handler for when the selection is changed.
   * @param event The selection changed event.
   */
  onSelectionChanged(event: SelectionChangedEvent):void {
    this.selectedRowCount = event.api.getSelectedNodes().length;
    const selectedNodes = event.api.getSelectedNodes();
    this.lastSelectedNodeId = selectedNodes.length > 0 ? selectedNodes[selectedNodes.length - 1].id : '';
    this.selectedRow = this.isRowSelected ? selectedNodes[0].data : null;
    if (this.gridApi) {
      this.gridApi.refreshCells({ force: true })
    }
  }


  /**
   * Edits a user.
   * @param user The user to edit.
   */
  userEdit(user: any): void {
    localStorage.setItem('user', JSON.stringify(user))
    localStorage.setItem('userGroupId', user.userGroupId);
    this.service.currentUrl = user.userGroupId;
    this.router.navigate(['configure/group-edit/', user.userGroupId]);
  }


  /**
   * Navigates to the create group page.
   */  
  createGroup() :void{
    this.router.navigate(["configure/group-add"]);
  }

  
  /**
   * Navigates back to the previous page.
   */
  goBack() :void{
    this.router.navigate(["/configure"]);
  }


}
