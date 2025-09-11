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
  selector: 'app-parameter-edit',
  standalone: true,
  imports: [CommonModule, HttpClientModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './parameter-edit.component.html',
  styleUrl: './parameter-edit.component.css'
})
export class ParameterEditComponent {

  configureName!:string;
  updateParameterForm!:FormGroup;
  paraFormSubmitted = false;
  parameterType:string[] = [];
  dynamicModuleName!:string;
  dynamicFunctionName!:string;
  parameterData:any;


  /**
   * Constructor for ParameterEditComponent.
   * @param authservice AuthService instance for authentication and config value.
   * @param router Router instance for navigation.
   * @param moduleservice ModulesService instance for module operations.
   * @param _snakebar MatSnackBar instance for notifications.
   */
  constructor(private authservice: AuthService, private router: Router,
    private moduleservice: ModulesService, private _snakebar: MatSnackBar,
  ) {
    this.parameterData = JSON.parse(localStorage.getItem('parameters') || '{}');
  }



    /**
     * Initializes the component and sets up the initial state.
     * No parameters.
     */
    ngOnInit(): void {
      let functiondata = JSON.parse(localStorage.getItem('function') || '{}');
      this.dynamicModuleName = functiondata.moduleName;
      this.dynamicFunctionName = functiondata.functionName;
      this.configureName = this.authservice.selectedConfigVal;
      this.updateParameterForm = new FormGroup({
        parameterName: new FormControl<string | null>(this.parameterData.parameterName, { validators: Validators.required }),
        module: new FormControl<string | null>({ value: this.dynamicModuleName, disabled: true }, { validators: Validators.required }),
        function: new FormControl<string | null>({ value: this.dynamicFunctionName, disabled: true }, { validators: Validators.required }),
        parameterType: new FormControl<string | null>(this.parameterData.parameterDataType, { validators: Validators.required }),
        rangeVal: new FormControl<string | null>(this.parameterData.parameterRangeVal, { validators: Validators.required })
      })

      this.moduleservice.getListOfParameterEnums().subscribe((data) => {
        this.parameterType = data.data
      })
    }


    /**
     * Handles the form submission for updating a parameter.
     * No parameters.
     */
    updateParaFormSubmit(): void {
      this.paraFormSubmitted = true;
      if (this.updateParameterForm.invalid) {
        return;
      }
      let data = {
        id: this.parameterData.id,
        parameterName: this.updateParameterForm.value.parameterName,
        parameterDataType: this.updateParameterForm.value.parameterType,
        parameterRangeVal: this.updateParameterForm.value.rangeVal,
        function: this.dynamicFunctionName
      }
      this.moduleservice.updateParameter(data).subscribe({
        next: (res) => {
          this._snakebar.open(res.message, '', {
            duration: 3000,
            panelClass: ['success-msg'],
            verticalPosition: 'top'
          })
          setTimeout(() => {
            this.updateParameterForm.reset();
            this.router.navigate(["/configure/parameter-list"]);
          }, 1000);
        },
        error: (err) => {
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
   * Navigates back to the parameter list page.
   * No parameters.
   */
  goBack(): void {
    this.router.navigate(["/configure/parameter-list"]);
  }

}
