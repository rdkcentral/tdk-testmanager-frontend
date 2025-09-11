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
import {ICellRendererParams} from "ag-grid-community";
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../material/material.module';

interface customcellRenderparams extends ICellRendererParams{
  selectedRowCount:()=> number;
  lastSelectedNodeId:string;
}

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [MaterialModule,CommonModule],
  template: `
    <button *ngIf="showHideAbort" class="btn btn-sm delete-btn" (click)="onAbortClick($event)" matTooltip="Abort" ><i class="bi bi-ban icons ban"></i></button>
    &nbsp;
    <button  class="btn  btn-sm delete-btn" (click)="onDownloadClick($event)" matTooltip="Download Consolidated Report(Excel)" >
      <img src="assets/icons/excel.png" class="icons report"/> 
    </button>
       &nbsp;
    <button  class="btn  btn-sm delete-btn" (click)="onViewClick($event)" matTooltip="Execution Result Details" ><i class="bi bi-eye-fill icons details"></i></button>

  `,  
  styles:[
    `.delete-btn{
        border: none;
        padding: 0px;
        background:none;
    }
    .icons{
      font-size: 1rem;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .viewer{
      color: #00B2DC;
    }
    .report{
      height: 19px;
      width: 19px;
    }
    .zip{
      color: #f58233;
    }
    .details{
      color: #fdb73b;
    }
    .ban{
      color:#f58233;
    }
    `
  ]
})
export class ExecutionButtonComponent implements OnInit{
  params:any
  selectedRowCount :number = 0;
  lastSelectedNodeId:string ='';
  currentNodeId: string | undefined;
  textforedit!:string;
  showHideAbort = true;

  /**
   * ag-Grid initialization method for the cell renderer component.
   * @param params The custom cell renderer parameters including selected row count and node IDs.
   */
  agInit(params:customcellRenderparams): void {
    this.params = params;
    this.selectedRowCount = params.selectedRowCount();
    this.lastSelectedNodeId = params.lastSelectedNodeId;
    this.currentNodeId = params.node.id
    
  }
  /**
   * Constructor for ExecutionButtonComponent.
   * @param route ActivatedRoute for accessing route parameters.
   */
  constructor(private route: ActivatedRoute) { }


  /**
   * Angular lifecycle hook called on component initialization.
   * Sets the visibility of the abort button based on params data.
   */
  ngOnInit(): void {
    if(this.params.data.abortNeeded === true){
      this.showHideAbort = true;
    }else{
      this.showHideAbort = false;
    }
  }
  //** Condition for disable edit and delete button to own user */
  /**
   * Determines if the edit and delete buttons should be disabled for the current user.
   * @returns True if the button should be disabled, false otherwise.
   */
  isButtonDisabled(): boolean {
    return !( this.selectedRowCount === 1 && this.lastSelectedNodeId === this.currentNodeId);
  }

  /**
   * ag-Grid refresh method for the cell renderer component.
   * @param params The custom cell renderer parameters.
   * @returns True to indicate the component should be refreshed.
   */
  refresh(params: customcellRenderparams): boolean {
    this.selectedRowCount = params.selectedRowCount();
    this.lastSelectedNodeId = params.lastSelectedNodeId;
    this.currentNodeId = params.node.id
    return true;
  }

  /**
   * Handles the edit button click event.
   * @param $event The event object from the button click.
   */
  onEditClick($event:any) {
    if (this.params.onEditClick instanceof Function) {
      this.params.onEditClick(this.params.node.data);
    }
  }
  /**
   * Handles the delete button click event.
   * @param $event The event object from the button click.
   */
  onDeleteClick($event:any){
    if (this.params.onDeleteClick instanceof Function) {
      this.params.onDeleteClick(this.params.node.data);
    }
    
  }
  /**
   * Handles the view button click event.
   * @param $event The event object from the button click.
   */
  onViewClick($event:any){
    if (this.params.onViewClick instanceof Function) {
      this.params.onViewClick(this.params.node.data);
    }
  }
  /**
   * Handles the download button click event.
   * @param $event The event object from the button click.
   */
  onDownloadClick($event:any){
    if (this.params.onDownloadClick instanceof Function) {
      this.params.onDownloadClick(this.params.node.data);
    }
  }
  /**
   * Handles the abort button click event.
   * @param $event The event object from the button click.
   */
  onAbortClick($event:any){
    if (this.params.onAbortClick instanceof Function) {
      this.params.onAbortClick(this.params.node.data);
    }
  }
}
