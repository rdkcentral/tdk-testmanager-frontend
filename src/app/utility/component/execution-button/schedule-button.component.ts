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
import { Component, OnInit } from '@angular/core';
import { MaterialModule } from '../../../material/material.module';
import { ActivatedRoute } from '@angular/router';
import { ICellRendererParams } from 'ag-grid-community';

interface customcellRenderparams extends ICellRendererParams{
  selectedRowCount:()=> number;
  lastSelectedNodeId:string;
}

@Component({
  selector: 'app-schedule-button',
  standalone: true,
  imports: [MaterialModule,CommonModule],
  template: `
  <div class="action-btn-group-row">
  <!-- Delete button -->
  <button class="icon-btn" matTooltip="Delete" (click)="onDeleteClick(params.data)">
    <mat-icon [ngClass]="{
        'completed-color': params.data.status === 'COMPLETED',
        'cancelled-color': params.data.status === 'CANCELLED',
        'scheduled-color': params.data.status === 'SCHEDULED'
      }"
      class="delete-icon icons extra-icon">delete_forever</mat-icon>
  </button>

  <!-- Start button (for CANCELLED status) -->
  <button *ngIf="params.data.status === 'CANCELLED'" class="icon-btn" matTooltip="Start" (click)="params.onStartClick(params.data)">
    <mat-icon [ngClass]="'cancelled-color'">play_circle</mat-icon>
  </button>

  <!-- Stop button (for SCHEDULED status) -->
  <button *ngIf="params.data.status === 'SCHEDULED'" class="icon-btn" matTooltip="Stop" (click)="params.onStopClick(params.data)">
    <mat-icon [ngClass]="'scheduled-color'">stop_circle</mat-icon>
  </button>
</div>
  `,
  styles: [
    `.action-btn-group-row {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: flex-start; /* Align buttons to the left */
        gap: 3px; /* Adjust spacing between buttons */
    }
    .icon-btn {
        border: none;
        background: none;
        padding: 0;
        margin: 0;
        cursor: pointer;
        outline: none;
        box-shadow: none;
        min-width: unset;
        min-height: unset;
        line-height: 1;
        display: inline-flex;
        align-items: center;
        justify-content: center;
    }
    .icons{
      font-size: 1.3rem;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .scheduled-color {
      color: #1976d2;
    }
    .cancelled-color {
      color: #ffa000;
    }
    .completed-color {
      color: #388e3c;
    }
    .delete-icon {
  color: gray !important;
  vertical-align: middle !important; /* Align icon vertically */
  margin-top: 0px !important; /* Move the icon slightly down */
  
}
    `
  ]
  })
export class ScheduleButtonComponent implements OnInit{
  params:any
  selectedRowCount :number = 0;
  lastSelectedNodeId:string ='';
  currentNodeId: string | undefined;
  textforedit!:string;

  /**
   * ag-Grid initialization method for the cell renderer component.
   * @param params The custom cell renderer parameters including selected row count and node IDs.
   */
  agInit(params: customcellRenderparams): void {
    this.params = params;
    this.selectedRowCount = params.selectedRowCount();
    this.lastSelectedNodeId = params.lastSelectedNodeId;
    this.currentNodeId = params.node.id
  }
  /**
   * Constructor for ScheduleButtonComponent.
   * @param route ActivatedRoute for accessing route parameters.
   */
  constructor(private route: ActivatedRoute) { }


  /**
   * Angular lifecycle hook called on component initialization.
   */
  ngOnInit(): void {}


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
   * Handles the delete button click event.
   * @param $event The event object or data for the delete action.
   */
  onDeleteClick($event: any) {
    if (this.params.onDeleteClick instanceof Function) {
      this.params.onDeleteClick(this.params.node.data);
    }
  }
}

