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
import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MaterialModule } from '../../../material/material.module';
import { AuthService } from '../../../auth/auth.service';
import { Router } from '@angular/router';
import { ModulesService } from '../../../services/modules.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-function-edit',
  standalone: true,
  imports: [CommonModule, HttpClientModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './function-edit.component.html',
  styleUrl: './function-edit.component.css'
})

/**
 * FunctionEditComponent is responsible for handling the update of existing functions.
 * It manages the form, submission, and navigation logic for the function update page.
 */
export class FunctionEditComponent {
  configureName!:string;
  updateFunctionForm!:FormGroup;
  functionFormSubmitted = false;
  functionData:any;

  /**
   * Constructor for FunctionEditComponent.
   * @param authservice AuthService instance for authentication and config values
   * @param router Router instance for navigation
   * @param moduleservice ModulesService instance for module operations
   * @param _snakebar MatSnackBar instance for notifications
   */
  constructor(private authservice: AuthService,private router: Router,
    private moduleservice: ModulesService,private _snakebar :MatSnackBar,
  ) {
    this.functionData = JSON.parse(localStorage.getItem('functions') || '{}');
   }

  /**
   * Initializes the component and sets up the initial values.
   * No parameters.
   * No return value.
   */
  ngOnInit(): void {
    this.configureName = this.authservice.selectedConfigVal;
    this.updateFunctionForm = new FormGroup({
      functionName: new FormControl<string | null>(this.functionData.functionName, { validators: Validators.required }),
      moduleName: new FormControl<string | null>({value: this.functionData.moduleName, disabled: true}, { validators: Validators.required}),
    })
  }
  
  /**
   * Submits the update function form.
   * No parameters.
   * No return value.
   */
  updateFunctionSubmit():void{
    this.functionFormSubmitted = true;
    if(this.updateFunctionForm.invalid){
      return;
    }
    let data = {
      id: this.functionData.id,
      functionName: this.updateFunctionForm.value.functionName,
      moduleName: this.functionData.moduleName,
      functionCategory: this.functionData.functionCategory
    }
    this.moduleservice.updateFunction(data).subscribe({
      next:(res)=>{
        this._snakebar.open(res.message, '', {
        duration: 3000,
        panelClass: ['success-msg'],
        verticalPosition: 'top'
        })
        setTimeout(() => {
          this.updateFunctionForm.reset();
          this.router.navigate(["/configure/function-list"]);
        }, 1000);
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
  
  /**
   * Navigates back to the function list page.
   * No parameters.
   * No return value.
   */
  goBack():void{
    this.router.navigate(["/configure/function-list"]);
  }

}
