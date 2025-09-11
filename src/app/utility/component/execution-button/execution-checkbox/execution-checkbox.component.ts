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
import { Component} from '@angular/core';
import { IHeaderParams } from 'ag-grid-community';
import { MaterialModule } from '../../../../material/material.module';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-execution-checkbox',
  standalone: true,
  imports: [MaterialModule,CommonModule],
  template: `
      <div class="header-container">
        <button class="btn btn-sm delete-btn" (click)="onDelete()"><mat-icon class="delete-icon">delete_forever</mat-icon></button>
      </div>
      <button [matMenuTriggerFor]="menu" class="btn btn-sm delete-arrow ">
        <i class="bi bi-caret-down-fill arrow-icon"></i>
        </button>
      <mat-menu #menu="matMenu">
        <button mat-menu-item (click)="openDialog()" class="btn-height"><span class="delete-text">Delete execution with date</span></button>
      </mat-menu>
  `,
  styles: [`
      .header-container {
        position: absolute;
        bottom: -15px;
        left: 0;
      }
      .delete-btn{
        border:none;
        padding:0;
      }
      .delete-arrow{
        border:none;
        padding:0;

      }
      .arrow-icon{
        position: absolute;
        bottom: -5px;
        left: 25px;
        font-size: 0.9rem;
      }
      .delete-icon{
        background-color: transparent;
        color: #808080;
        font-size: 0.9rem;
      }
      .delete-text{
        font-size:0.8rem;
      }
      .btn-height{
        min-height:25px;
      }
    `]
})
export class ExecutionCheckboxComponent {
  params:any
  isAllSelected = false;

  /**
   * ag-Grid initialization method for the header component.
   * @param params The header parameters including label and grid API.
   */
  agInit(params: IHeaderParams & { label: string }): void {
    this.params = params;
  }

  /**
   * Handles the select all checkbox event to select/deselect all rows.
   * @param event The event object from the checkbox change.
   */
  onSelectAll(event: Event) {
    this.isAllSelected = (event.target as HTMLInputElement).checked;
    this.params.api.forEachNode((node:any) => (node.setSelected(this.isAllSelected)));
  }

  /**
   * Calls the delete callback if provided in params to delete selected executions.
   */
  onDelete() {
    if (this.params.deleteCallback) {
      this.params.deleteCallback();
    }
  }

  /**
   * ag-Grid refresh method for the header component. Returns false to avoid re-render.
   * @returns false
   */
  refresh(): boolean {
    return false;
  }
  /**
   * Calls the openDialog callback if provided in params to open the delete dialog.
   */
  openDialog():void{
    if (this.params.openDialogCallback) { 
      this.params.openDialogCallback(); 
    }
  }
}
