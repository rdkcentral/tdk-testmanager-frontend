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
import {Component, Inject, OnInit, ViewChild } from '@angular/core';
import {  FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from '../../../material/material.module';
import { AgGridAngular } from 'ag-grid-angular';
import {
  ColDef,
  GridApi,
  GridReadyEvent
} from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { ExecutionService } from '../../../services/execution.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DetailsExeDialogComponent } from '../details-execution/details-exe-dialog/details-exe-dialog.component';
import { CreateJiraComponent } from './create-jira/create-jira.component';
import { AnalysisService } from '../../../services/analysis.service';
import { ButtonJiraComponent } from '../ag-grid-buttons/button/buttion-jira.component';
import { UpdateJiraComponent } from './update-jira/update-jira.component';

@Component({
  selector: 'app-analyze-dialog',
  standalone: true,
  imports: [CommonModule,FormsModule, ReactiveFormsModule, MaterialModule,AgGridAngular],
  templateUrl: './analyze-dialog.component.html',
  styleUrl: './analyze-dialog.component.css'
})
export class AnalyzeDialogComponent implements OnInit{
  @ViewChild('detailsExeDialog') detailsExeDialog!: DetailsExeDialogComponent;
  public themeClass: string = 'ag-theme-quartz';
  rowData: any = [];
  selectedRowCount = 0;
  lastSelectedNodeId: string | undefined;
  pageSize = 10;
  schedulePageSizeSelector: number[] | boolean = [5, 10, 30, 50];
  public gridApi!: GridApi;
  public columnSchudle: ColDef[] = [
    {
      headerName: 'TicketNumber',
      field: 'ticketNumber',
      filter: 'agTextColumnFilter',
      flex: 1,
      sortable: true,
      cellRenderer: (params: any) => {
        if (params.data && params.data.link) {
          return `<a href="${params.data.link}" target="_blank">${params.value}</a>`;
        } else {
          return params.value;
        }
      },
    },
    {
      headerName: 'Summary',
      field: 'summary',
      filter: 'agTextColumnFilter',
      flex: 1,
      sortable: true,
      autoHeight: true
    },      
    {
      headerName: 'Status',
      field: 'status',
      filter: 'agTextColumnFilter',
      flex: 1,
      sortable: true,
    },
    {
      headerName: 'Action',
      field: '',
      sortable: false,
      headerClass: 'no-sort',
      width: 130,
      cellRenderer: ButtonJiraComponent,
      cellRendererParams: (params: any) => ({
        onEditClick: this.userEdit.bind(this),
        selectedRowCount: () => this.selectedRowCount,
        lastSelectedNodeId: this.lastSelectedNodeId,
        })
    },
  ];
  gridOptions = {
    rowHeight: 40,
  };
  allDeftesTypes:any;
  analysisFormSubmitted = false;
  analysisForm!: FormGroup;
  loggedinUser:any;
  isCreateJira = false;
  allProjectNames: any[] = [];
  jiraTitel = 'Map Tickets';
  showJiraTab: boolean = false;

  /**
   * Constructor for AnalyzeDialogComponent.
   * @param dialogRef Reference to the dialog opened.
   * @param data Data injected into the dialog.
   * @param executionservice Service for execution operations.
   * @param fb FormBuilder for reactive forms.
   * @param _snakebar MatSnackBar for notifications.
   * @param jiraCreateDialog MatDialog for opening create JIRA dialog.
   * @param updateDialod MatDialog for opening update JIRA dialog.
   * @param analysiservice Service for analysis operations.
   */
  
  constructor(
    public dialogRef: MatDialogRef<AnalyzeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private executionservice:ExecutionService,
    private fb: FormBuilder,
    private _snakebar: MatSnackBar,
    public jiraCreateDialog :MatDialog,
    public updateDialod: MatDialog,
    private analysiservice: AnalysisService,
    ) {
      this.loggedinUser = JSON.parse(localStorage.getItem('loggedinUser')|| '{}');
      console.log(data);
      
  }

  /**
   * Angular lifecycle hook called on component initialization.
   */
  
  ngOnInit(): void {
      this.analysisForm = this.fb.group({
        scriptName: [{ value: this.data.name, disabled: true}],
        ticketDetails: [this.data.analysisTicketID || '', Validators.required],
        defectType: [this.data.analysisDefectType || '', Validators.required],
        remarks: [this.data.analysisRemark || '', Validators.required]
      });
    this.getAllDefects();
    this.listProjectNAmes();
    this.analysiservice.getTicketDetaisFromJira(this.data.executionResultID,'').subscribe(res=>{      
      this.rowData = res.data;
    })
    this.isJiraPresent();
  }

  /**
   * Getter for analysis form controls.
   */
  
  get f() { return this.analysisForm.controls; }

  /**
   * Handles the grid ready event for AG Grid.
   * @param params GridReadyEvent containing the grid API.
   */
  
  onGridReady(params: GridReadyEvent<any>):void {
    this.gridApi = params.api;
  }

  /**
   * Checks if JIRA automation is present and updates the tab visibility.
   */
  
  isJiraPresent(){
    this.analysiservice.isJiraAutomation().subscribe(res=>{
      
      if(res.data === false){
        this.showJiraTab = false;
      }else{
        this.showJiraTab = true;
      }
    })
  }

  /**
   * Handles tab click event to switch between tabs.
   * @param event Tab change event.
   */
  
  onTabClick(event: any): void {
    const label = event.tab.textLabel;
    if(label ==="JIRA Integration"){
      this.isCreateJira = true;
      this.jiraTitel = 'Map Tickets(JIRA)';
    }
    else{
      this.isCreateJira = false;
      this.jiraTitel = 'Map Tickets';
    }
  }
  /**
   * Closes the dialog.
   */
  
  onClose():void {
    this.dialogRef.close(false);
  }

  /**
   * Fetches all defect types from the execution service.
   */
  
  getAllDefects():void{
    this.executionservice.getDefectTypes().subscribe(res=>{
      this.allDeftesTypes = res.data ;
    })
  }

  /**
   * Fetches the list of project names from the analysis service.
   */
  
  listProjectNAmes() {
    this.analysiservice.getProjectNames(this.data.category).subscribe((res) => {
      this.allProjectNames = res.data;
    });
  }
  /**
   * Handles project change event and updates the ticket details grid.
   * @param event Event triggered when the user selects a project.
   */
  
  onProjectChange(event:any){
    let prjName = event.target.value;
    let projectName = prjName?prjName:" ";
    this.analysiservice.getTicketDetaisFromJira(this.data.executionResultID,projectName).subscribe(res=>{
      
      let ticketDetails = res.data;
      if(ticketDetails != null){
        this.rowData = ticketDetails;
      }else{
        this.rowData = [];
      }
    })
  }
  /**
   * Handles form submission for analysis data.
   */
  
  analysisSubmit():void{
    this.analysisFormSubmitted = true;
    if (this.analysisForm.invalid) {
      return;
    } else {
      let analysisData = {
        analysisUser:this.loggedinUser.userName,
        analysisDefectType:this.analysisForm.value.defectType,
        analysisTicketID: this.analysisForm.value.ticketDetails,
        analysisRemark:this.analysisForm.value.remarks
      }
      this.executionservice.saveAnalysisResult(this.data.executionResultID,analysisData).subscribe({
        next:(res)=>{
          this._snakebar.open(res.message, '', {
            duration: 1000,
            panelClass: ['success-msg'],
            verticalPosition: 'top'
          })
         
          setTimeout(() => {
          this.onClose();
          }, 2000);
        },
        error:(err)=>{
          this._snakebar.open(err.message, '', {
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
   * Opens the create JIRA dialog.
   */
  
  createJira():void{
     this.jiraCreateDialog.open(CreateJiraComponent, {
          width: '72%',
          height: '96vh',
          maxWidth: '100vw',
          panelClass: 'custom-modalbox',
          data:this.data,
    });
  }
  /**
   * Opens the update JIRA dialog with the provided update data.
   * @param update Data for updating the JIRA ticket.
   */
  
  userEdit(update:any){
    this.updateDialod.open(UpdateJiraComponent,{
      width: '72%',
      height: '96vh',
      maxWidth: '100vw',
      panelClass: 'custom-modalbox',
      data:{updateDetails:this.data,update}
    })
  }
}
