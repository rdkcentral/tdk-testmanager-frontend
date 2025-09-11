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
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { AgGridAngular } from 'ag-grid-angular';
import {
  ColDef,
  GridApi,
  GridReadyEvent,
  IMultiFilterParams,
  RowSelectedEvent,
  SelectionChangedEvent
} from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../auth/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PrimitiveTestService } from '../../../services/primitive-test.service';
import { InputComponent } from '../../../utility/component/ag-grid-buttons/input/input.component';

/**
 * Component for editing a primitive test.
 */
@Component({
  selector: 'app-edit-primitive-test',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, NgMultiSelectDropDownModule, FormsModule, AgGridAngular],
  templateUrl: './edit-primitive-test.component.html',
  styleUrl: './edit-primitive-test.component.css'
})

export class EditPrimitiveTestComponent {

  [x: string]: any;
  dropdownSettings = {};
  submitted = false;
  editPrimitiveTestForm!: FormGroup;
  dropdownList: any;
  configureName!: string;
  selectedSubBox: any[] = []
  userGroupName: any;
  selectedValue?: string;
  selectedFunctionValue?: string;
  functionValues: any[] = [];
  selectedConfig!: string | null;
  public rowSelection: 'single' | 'multiple' = 'single';
  lastSelectedNodeId: string | undefined;
  rowData: any = [];
  public themeClass: string = "ag-theme-quartz";
  public paginationPageSize = 7;
  public paginationPageSizeSelector: number[] | boolean = [7, 15, 30, 50];
  public tooltipShowDelay = 500;
  isRowSelected: any;
  selectedRow: any;
  moduleNames: any;
  functionNames: any;
  isCheckboxSelected: boolean = false;
  public gridApi!: GridApi;
  rowIndex!: number | null;
  selectedRowCount = 0;
  showUpdateButton = false;
  public frameworkComponents: any;
  parameterListMapObj!: { parameterName: any; parameterValue: any; }[];
  user: any;
  loggedinUser: any = {};
  primitiveTestId!: number;
  errElement!: { key: any; };
  isDisabled = true
  categoryName!: string;

  public columnDefs: ColDef[] = [
    {
      headerName: 'Parameter Name',
      field: 'parameterName',
      filter: 'agMultiColumnFilter',
      flex: 2,
      filterParams: {
        filters: [
          {
            filter: 'agTextColumnFilter',
            display: 'subMenu',
          },
          {
            filter: 'agSetColumnFilter',
          },
        ],
      } as IMultiFilterParams,
    },
    {
      headerName: 'Type',
      field: 'parameterType',
      filter: 'agMultiColumnFilter',
      flex: 2,
      filterParams: {
        filters: [
          {
            filter: 'agTextColumnFilter',
            display: 'accordion',
            title: 'Expand Me for Text Filters',
          },
          {
            filter: 'agSetColumnFilter',
            display: 'accordion',
          },
        ],
      } as IMultiFilterParams,
    },
    {
      headerName: 'Range',
      field: 'parameterrangevalue',
      filter: 'agMultiColumnFilter',
      flex: 2,
      filterParams: {
        filters: [
          {
            filter: 'agTextColumnFilter',
            display: 'accordion',
            title: 'Expand Me for Text Filters',
          },
          {
            filter: 'agSetColumnFilter',
            display: 'accordion',
          },
        ],
      } as IMultiFilterParams,
    },
    {
      headerName: 'Value',
      field: 'parameterValue',
      cellRenderer: 'inputCellRenderer'
    }
  ];

  public defaultColDef: ColDef = {
    flex: 1,
    menuTabs: ['filterMenuTab'],
  };

  /**
   * Constructor for EditPrimitiveTestComponent.
   * @param formBuilder FormBuilder instance for reactive forms.
   * @param router Router instance for navigation.
   * @param authservice AuthService instance for authentication and config value.
   * @param _snakebar MatSnackBar instance for notifications.
   * @param service PrimitiveTestService instance for primitive test operations.
   */
  constructor(private formBuilder: FormBuilder, private router: Router, private authservice: AuthService, private _snakebar: MatSnackBar,
    private service: PrimitiveTestService) {
    this.user = JSON.parse(localStorage.getItem('user') || '{}');
    this.loggedinUser = JSON.parse(localStorage.getItem('loggedinUser') || '{}');
    this.frameworkComponents = {
      inputCellRenderer: InputComponent
    }
  }


  /**
   * Initializes the component and sets up initial state.
   * No parameters.
   */
  ngOnInit(): void {
    this.service.allPassedData.subscribe(res => {
      this.editPrimitiveTestForm = this.formBuilder.group({
        testName: [{ value: this.user.primitiveTestName, disabled: true }, [Validators.required, Validators.minLength(4)]],
        selectModule: [{ value: res['primitivetestModule'], disabled: true }],
        selectFunction: [{ value: res['primitiveTestfunction'], disabled: true }]
      });
      this.primitiveTestId = res['primitiveTestId'];
      this.rowData = res.primitiveTestParameters;
    })
    this.configureName = this.authservice.selectedConfigVal;
    if (this.configureName === 'RDKB') {
      this.categoryName = 'Broadband';
    } else {
      this.categoryName = 'Video';
    }
  }


  /**
   * Handles form submission to update the primitive test.
   * No parameters.
   */
  editPrimitiveTest(): void {
    this.submitted = true;
    if (this.editPrimitiveTestForm.invalid) {
      return
    } else {
      const tableData: any[] = [];
      this.gridApi.forEachNode((element: any) => {
        tableData.push(element.data);
        this.parameterListMapObj = tableData.map((i: any) => ({
          parameterName: i.parameterName,
          parameterValue: i.parameterValue
        }));
      });

      let obj = {
        primitiveTestId: this.primitiveTestId,
        primitiveTestParameters: this.parameterListMapObj
      }
      this.service.updatePrimitiveTest(obj).subscribe({
        next: (res) => {
          this._snakebar.open(res.body.message, '', {
            duration: 3000,
            panelClass: ['success-msg'],
            verticalPosition: 'top'
          })
          setTimeout(() => {
            this.router.navigate(["configure/list-primitivetest"]);
          }, 1000);
        },
        error: (err) => {
          const res = Object.keys(err).map(key => {
            return { key: err[key] }
          });
          for (let i = 0; i < res.length; i++) {
            this.errElement = res[i];
          }
          this._snakebar.open(err.message ? err.message : this.errElement.key, '', {
            duration: 2000,
            panelClass: ['err-msg'],
            horizontalPosition: 'end',
            verticalPosition: 'top'
          })
        }
      })
    }
  }


  /**
   * Getter for the form controls.
   * No parameters.
   */
  get f() { return this.editPrimitiveTestForm.controls; }


  /**
   * Event handler for when the grid is ready.
   * @param params The grid ready event parameters.
   */
  onGridReady(params: GridReadyEvent<any>): void {
    this.gridApi = params.api;
  }


  /**
   * Event handler for when a row is selected.
   * @param event The row selected event.
   */
  onRowSelected(event: RowSelectedEvent): void {
    this.isRowSelected = event.node.isSelected();
    this.rowIndex = event.rowIndex
  }


  /**
   * Event handler for when the selection is changed.
   * @param event The selection changed event.
   */
  onSelectionChanged(event: SelectionChangedEvent): void {
    this.selectedRowCount = event.api.getSelectedNodes().length;
    const selectedNodes = event.api.getSelectedNodes();
    this.lastSelectedNodeId = selectedNodes.length > 0 ? selectedNodes[selectedNodes.length - 1].id : '';
    this.selectedRow = this.isRowSelected ? selectedNodes[0].data : null;
    if (this.gridApi) {
      this.gridApi.refreshCells({ force: true })
    }
  }

  /**
   * Navigates back to the list of primitive tests.
   * No parameters.
   */
  goBack(): void {
    this.router.navigate(["configure/list-primitivetest"]);
  }


}
