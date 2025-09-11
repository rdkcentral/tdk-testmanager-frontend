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
import { MaterialModule } from '../../../../material/material.module';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

interface customcellRenderparams extends ICellRendererParams{
  selectedRowCount:()=> number;
  lastSelectedNodeId:string;
}

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [MaterialModule, CommonModule],
  template: `
    <!-- <button [disabled]="isButtonDisabled()" class="btn btn-primary btn-sm delete-btn" (click)="onEditClick($event)"><mat-icon class="delete-icon">edit</mat-icon></button> -->
    <button *ngIf="editShowHide" class="btn btn-sm delete-btn" matTooltip="Edit/View" (click)="onEditClick($event)"><mat-icon class="extra-icon edit">edit</mat-icon></button>
    &nbsp;
    <button *ngIf="deleteShowHide" class="btn btn-sm delete-btn" matTooltip="Delete" (click)="onDeleteClick($event)"><mat-icon class="extra-icon delete-icon">delete_forever</mat-icon></button>
   
    <!-- <button *ngIf="viewShowHide" class="btn btn-sm delete-btn" matTooltip="View" (click)="onViewClick($event)"><i class="bi bi-eye extra-icon view"></i></button> -->
    &nbsp;
    <button *ngIf="functionShowHide" class="btn btn-sm delete-btn" matTooltip="Functions and Parameters" (click)="onFunctionClick($event)"><i class="bi bi-gear extra-icon create"></i></button>
    &nbsp;
    <button *ngIf="paraMeterShowHide" class="btn btn-sm delete-btn" matTooltip="Parameters" (click)="onParameterClick($event)"><i class="bi bi-braces extra-icon create"></i></button>
    &nbsp;
    <button *ngIf="downloadShowHide" class="btn btn-sm delete-btn" matTooltip="Download Module XML" (click)="onModuleXMLClick($event)"><i class="bi bi-cloud-arrow-down-fill extra-icon download"></i></button>
    &nbsp;
    <button *ngIf="downloadExcel" class="btn btn-sm delete-btn" (click)="onDownloadClick($event)" matTooltip="Download testcases(excel) " ><i class="bi bi-file-earmark-excel excel-icon download-xlsx"></i></button>
  `,  
  styles:[
    `.delete-btn{
        border: none;
        padding: 0px;
        background:none;
    }
    .extra-icon{
      font-size: 1.3rem;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .edit{
      color: #00B2DC;
    }
    .delete-icon{
      color: #808080;
    }
    .view{
      color: #fdb73b;
    }
    .create{
      color: #92c849;
      
    }
    .download{
      color: #00B2DC;
    }
    .download-xlsx{
      color: green;

    }
    `
  ]
})
export class ModuleButtonComponent implements OnInit{
  params:any
  selectedRowCount :number = 0;
  lastSelectedNodeId:string ='';
  currentNodeId: string | undefined;
  functionShowHide = true;
  paraMeterShowHide = false;
  downloadShowHide = false;
  downloadExcel = false;
  viewShowHide = true;
  editShowHide = true;
  deleteShowHide = true;

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
   * Constructor for ModuleButtonComponent.
   * @param route ActivatedRoute for accessing route parameters.
   */
  constructor(private route: ActivatedRoute) { }


  /**
   * Angular lifecycle hook called on component initialization.
   * Sets the visibility of various buttons based on the current route.
   */
  ngOnInit(): void {
    if(this.route.snapshot.url[1]){
      if(this.route.snapshot.url[1].path === 'modules-list'){
        this.functionShowHide = true;
        this.paraMeterShowHide = false;
        this.downloadShowHide = true;
        this.downloadExcel = false;
        this.viewShowHide = true;
        this.editShowHide = true;
        this.deleteShowHide = true;
    }else if(this.route.snapshot.url[1].path === 'function-list'){
        this.functionShowHide = false;
        this.paraMeterShowHide = true;
        this.downloadShowHide = false;
        this.downloadExcel = false;
        this.viewShowHide = true;
        this.editShowHide = true;
        this.deleteShowHide = true;
    }else if(this.route.snapshot.url[1].path === 'parameter-list'){
      this.functionShowHide = false;
      this.paraMeterShowHide = false;
      this.downloadShowHide = false;
      this.downloadExcel = false;
      this.viewShowHide = true;
      this.editShowHide = true;
      this.deleteShowHide = true;
    }
    }else{
      this.functionShowHide = false;
      this.paraMeterShowHide = false;
      this.downloadShowHide = false;
      this.viewShowHide = false;
      this.editShowHide = false;
      this.deleteShowHide = false;
      this.downloadExcel = true;
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
   * Handles the function button click event.
   * @param $event The event object from the button click.
   */
  onFunctionClick($event:any){  
    if (this.params.onFunctionClick instanceof Function) {
      this.params.onFunctionClick(this.params.node.data);
    }
  }
  /**
   * Handles the parameter button click event.
   * @param $event The event object from the button click.
   */
  onParameterClick($event:any){
    if (this.params.onParameterClick instanceof Function) {
      this.params.onParameterClick(this.params.node.data);
    }
  }

  /**
   * Handles the download button click event for testcases (Excel).
   * @param $event The event object from the button click.
   */
  onDownloadClick($event:any){
    if (this.params.onDownloadClick instanceof Function) {
      this.params.onDownloadClick(this.params.node.data);
    }
  }
  /**
   * Handles the download button click event for module XML.
   * @param $event The event object from the button click.
   */
  onModuleXMLClick($event:any){
    if (this.params.onModuleXMLClick instanceof Function) {
      this.params.onModuleXMLClick(this.params.node.data);
    }
  }
  
}
