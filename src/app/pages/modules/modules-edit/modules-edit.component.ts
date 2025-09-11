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
import { testGroupModel } from '../../models/manageusermodel';
import { AuthService } from '../../../auth/auth.service';
import { Router } from '@angular/router';
import { ModulesService } from '../../../services/modules.service';
import { MatSnackBar } from '@angular/material/snack-bar';

/**
 * ModulesEditComponent is responsible for handling the update of existing modules.
 * It manages the form, submission, and navigation logic for the module update page.
 */
@Component({
  selector: 'app-modules-edit',
  standalone: true,
  imports: [CommonModule, HttpClientModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './modules-edit.component.html',
  styleUrl: './modules-edit.component.css'
})
export class ModulesEditComponent {

  configureName!:string;
  updateModuleForm!:FormGroup;
  moduleFormSubmitted = false;
  testGroupArr:testGroupModel[] = [];
  crashFilesArr: string[] = [];
  logFilesArr: string[] = [];
  isThunder :boolean = false;
  isAdvanced :boolean = false;
  moduleDetails:any;
  loggedinUser: any;
  categoryName!: string;

  /**
   * Constructor for ModulesEditComponent.
   * @param authservice AuthService instance for authentication and config values
   * @param router Router instance for navigation
   * @param moduleservice ModulesService instance for module operations
   * @param _snakebar MatSnackBar instance for notifications
   */
  constructor(private authservice: AuthService,private router: Router,
    private moduleservice: ModulesService,private _snakebar :MatSnackBar,
  ) {
    let data = JSON.parse(localStorage.getItem('modules') || '{}');
    this.moduleDetails = data;
    this.loggedinUser = JSON.parse(localStorage.getItem('loggedinUser')|| '{}');
   }

  /**
   * Initializes the component and sets up the initial values.
   * No parameters.
   * No return value.
   */
  ngOnInit(): void {
    this.configureName = this.authservice.selectedConfigVal;
    if(this.configureName === 'RDKB'){
      this.categoryName = 'Broadband';
    }else{
      this.categoryName = 'Video';
    }
    this.moduleservice.getAllTestGroups().subscribe((res:any) => {
      this.testGroupArr = res.data;
    });
    this.updateModuleForm = new FormGroup({
      moduleName: new FormControl<string | null>(this.moduleDetails.moduleName, { validators: Validators.required }),
      testGroup: new FormControl<string | null>(this.moduleDetails.testGroup, { validators: Validators.required }),
      executionTime: new FormControl<string | null>(this.moduleDetails.executionTime, { validators: Validators.required }),
      thundrShowHide: new FormControl<boolean | null>({value: this.isThunder?this.isThunder:this.moduleDetails.moduleThunderEnabled, disabled: false}),
      crashFiles: new FormControl<string | null>(''),
      logFiles: new FormControl<string | null>('')
    })
    this.crashFilesArr = this.moduleDetails.moduleCrashLogFiles;
    this.logFilesArr = this.moduleDetails.moduleLogFileNames;
  }
  
  /**
   * Toggles the value of `thundrEnable` property.
   * @param event The event object triggered by the checkbox.
   * No return value.
   */
  thundrEnable(event: any):void{
    const inputEle = event.target as HTMLInputElement;
    this.isThunder = inputEle.checked;
  }
  
  /**
   * Removes a crash file from the `crashFilesArr` array at the specified index.
   * @param index The index of the crash file to remove.
   * No return value.
   */
  removeCrash(index: number):void {
    this.crashFilesArr.splice(index, 1);
  }
  
  /**
   * Removes a log file from the logFilesArr array at the specified index.
   * @param index The index of the log file to remove.
   * No return value.
   */
  removeLogs(index: number):void {
    this.logFilesArr.splice(index, 1);
  }
  
  /**
   * Adds a crash file to the `crashFilesArr` array.
   * No parameters.
   * No return value.
   */
  addCrash(): void {
    const value = this.updateModuleForm.get('crashFiles')?.value.trim();
    if (value) {
      this.crashFilesArr.push(value);
      this.updateModuleForm.get('crashFiles')?.setValue('');
    }
  }
  
  /**
   * Adds logs to the logFilesArr array.
   * No parameters.
   * No return value.
   */
  addLogs(): void {
    const value = this.updateModuleForm.get('logFiles')?.value.trim();
    if (value) {
      this.logFilesArr.push(value);
      this.updateModuleForm.get('logFiles')?.setValue('');
    }
  }
  
  /**
   * Submits the update module form.
   * No parameters.
   * No return value.
   */
  moduleUpdate():void{
    this.moduleFormSubmitted = true;
    if(this.updateModuleForm.invalid){
      return;
    }else{
      let moduleObj = {
        id:this.moduleDetails.id,
        moduleName:this.updateModuleForm.value.moduleName,
        testGroup: this.updateModuleForm.value.testGroup,
        executionTime: this.updateModuleForm.value.executionTime,
        userGroup: this.loggedinUser.userGroupName,
        moduleLogFileNames:this.logFilesArr?this.logFilesArr:[],
        moduleCrashLogFiles:this.crashFilesArr?this.crashFilesArr:[],
        moduleCategory: this.configureName,
        moduleThunderEnabled: this.updateModuleForm.value.thundrShowHide,
        moduleAdvanced: this.updateModuleForm.value.isAdvanced
      }
      this.moduleservice.updateModule(moduleObj).subscribe({
        next:(res)=>{
          this._snakebar.open(res.message, '', {
          duration: 3000,
          panelClass: ['success-msg'],
          verticalPosition: 'top'
          })
          setTimeout(() => {
            this.router.navigate(["configure/modules-list"]);
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
  }
  
  /**
   * Navigates back to the modules list page.
   * No parameters.
   * No return value.
   */
  goBack():void{
    this.router.navigate(["/configure/modules-list"]);
    localStorage.removeItem('modules');
  }

}
