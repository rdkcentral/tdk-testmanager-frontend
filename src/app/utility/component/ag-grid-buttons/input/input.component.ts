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
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-input',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `<input type="text" [(ngModel)]="value" class="editOcapinput" [class.invalid]="showError" (ngModelChange)="onValueChange($event)" required>`, 
  styles: [
    ` 
   .editOcapinput{
      height: 30px;
      width: 100%;
    }
    .invalid{
      border-color:red;
    }
    ::ng-deep.form-select:focus, .form-control:focus{
    border-color: gray !important;
    box-shadow: none !important;
}
    `
  ]
})
export class InputComponent implements OnInit{

  /**
   * The value bound to the input field.
   */
  public value:any;

  /**
   * Parameters passed to the cell renderer.
   */
  private params:any;

  /**
   * Indicates whether to show an error state for the input.
   */
  public showError:boolean = false;

  /**
   * Initializes the cell renderer with parameters.
   * @param params The parameters for the cell renderer.
   */
  agInit(params:any): void {
    this.params = params;
    this.value = this.params.value;
    this.showError = !this.value;
  }

  /**
   * Refreshes the cell renderer with new parameters.
   * @param params The parameters for the cell renderer.
   * @returns True if refresh is successful.
   */
  refresh(params:any):boolean{
    this.params = params
    this.value = params.value;
    this.showError = !this.value;
    return true;
  }
  /**
   * Handles the value change event for the input field.
   * @param newValue The new value entered in the input field.
   */
  onValueChange(newValue:any){
    this.value = newValue;
    this.showError = !newValue;
    if(this.params && this.params.colDef && this.params.data){
      this.params.data[this.params.colDef.field] = newValue;
    }
  }

  /**
   * Angular lifecycle hook for component initialization.
   */
  ngOnInit(): void {
      
  }

}
