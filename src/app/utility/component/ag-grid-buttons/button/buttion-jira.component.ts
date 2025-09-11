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
  imports: [MaterialModule,CommonModule],
  template: `
    <button   class="btn  btn-sm delete-btn" (click)="onEditClick($event)" matTooltip="{{textforedit}}"><mat-icon class="extra-icon edit">edit</mat-icon></button>
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
    .download{
      color: #00B2DC;
    }
    .download-config{
      margin-left: -15px;
    }
    `
  ]
})
export class ButtonJiraComponent implements OnInit{
  params:any
  selectedRowCount :number = 0;
  lastSelectedNodeId:string ='';
  currentNodeId: string | undefined;
  downloadShowHide = false
  viewShowHide = true;
  textforedit!:string;
  downloadSriptZip = false;
  deleteShowHide = true;
  downloadConfigShow =  false;

  /**
   * Initializes the cell renderer with parameters.
   * @param params The custom cell renderer parameters.
   */
  agInit(params:customcellRenderparams): void {
    this.params = params;
    this.selectedRowCount = params.selectedRowCount();
    this.lastSelectedNodeId = params.lastSelectedNodeId;
    this.currentNodeId = params.node.id
    
  }

  /**
   * Constructor for ButtonJiraComponent.
   * @param route ActivatedRoute for route information
   */
  constructor(private route: ActivatedRoute) { }

  /**
   * Angular lifecycle hook for component initialization.
   */
  ngOnInit(): void {

  }

  /**
   * Condition for disabling edit and delete button for own user.
   * @returns True if the button should be disabled, false otherwise.
   */
  isButtonDisabled(): boolean {
    return !( this.selectedRowCount === 1 && this.lastSelectedNodeId === this.currentNodeId);
  }

  /**
   * Refreshes the cell renderer with new parameters.
   * @param params The custom cell renderer parameters.
   * @returns True if refresh is successful.
   */
  refresh(params: customcellRenderparams): boolean {
    this.selectedRowCount = params.selectedRowCount();
    this.lastSelectedNodeId = params.lastSelectedNodeId;
    this.currentNodeId = params.node.id
    return true;
  }

  /**
   * Handles the edit button click event.
   * @param $event The click event object.
   */
  onEditClick($event:any) {
    if (this.params.onEditClick instanceof Function) {
      this.params.onEditClick(this.params.node.data);
    }
  }

}
