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
import { Component } from '@angular/core';
import { MaterialModule } from '../../../material/material.module';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../auth/auth.service';
import { Router } from '@angular/router';
import { ModulesService } from '../../../services/modules.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-modules-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './modules-create.component.html',
  styleUrl: './modules-create.component.css'
})
export class ModulesCreateComponent {

  categoryName!:string;
  createModuleForm!:FormGroup;
  moduleFormSubmitted = false;
  testGroupArr:any;
  crashFilesArr: string[] = [];
  logFilesArr: string[] = [];
  isThunder :boolean = false;
  loggedinUser: any;
  displayName!: string;

  /**
   * Constructor for ModulesCreateComponent.
   * @param authservice AuthService instance for authentication.
   * @param router Router instance for navigation.
   * @param moduleservice ModulesService for module operations.
   * @param _snakebar MatSnackBar for notifications.
   */
  constructor(private authservice: AuthService,private router: Router,
    private moduleservice: ModulesService,private _snakebar :MatSnackBar,
  ) {
    this.loggedinUser = JSON.parse(localStorage.getItem('loggedinUser')|| '{}');
    
  }


  /**
   * Initializes the component and sets up the initial values.
   * No parameters.
   */
  ngOnInit(): void {
    this.categoryName = this.authservice.selectedConfigVal;
    this.displayName = this.authservice.showSelectedCategory;
    if(this.categoryName === 'RDKB'){
      this.displayName = 'Broadband';
    }else{
      this.displayName = 'Video';
    }
    if(this.categoryName == "RDKB"){
      this.crashFilesArr = ['/rdklogs/logs'];
      this.logFilesArr = ['/rdklogs/logs'];
    }
    this.moduleservice.getAllTestGroups().subscribe((res:any) => {
      this.testGroupArr = res.data;
    });
    this.createModuleForm = new FormGroup({
      moduleName: new FormControl<string | null>('', { validators: Validators.required }),
      testGroup: new FormControl<string | null>('', { validators: Validators.required }),
      executionTime: new FormControl<string | null>('', { validators: Validators.required }),
      thundrShowHide: new FormControl<boolean | null>({value: false, disabled: false}),
      crashFilesPath: new FormControl<string | null>(''),
      logFilesPath: new FormControl<string | null>('')
    })

  }
  /**
   * Submits the create module form.
   * No parameters.
   */
  moduleSubmit():void{
    this.moduleFormSubmitted = true;
    if(this.createModuleForm.invalid){
      return
     }else{
      let moduleObj = {
          moduleName:this.createModuleForm.value.moduleName,
          testGroup: this.createModuleForm.value.testGroup,
          executionTime: this.createModuleForm.value.executionTime,
          moduleLogFileNames:this.logFilesArr?this.logFilesArr:[],
          moduleCrashLogFiles:this.crashFilesArr?this.crashFilesArr:[],
          moduleCategory: this.loggedinUser.userCategory,
          moduleThunderEnabled:this.isThunder?true:false
        }
        this.moduleservice.createModule(moduleObj).subscribe({
          next:(res)=>{
            this._snakebar.open(res.message, '', {
            duration: 3000,
            panelClass: ['success-msg'],
            verticalPosition: 'top'
            })
            setTimeout(() => {
              this.createModuleForm.reset();
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
   */
  goBack():void{
    this.router.navigate(["/configure/modules-list"]);

  }

  /**
   * Resets the createModuleForm to its initial state.
   * No parameters.
   */
  reset():void{
    this.createModuleForm.reset();

  }

  /**
   * Toggles the value of `isThunder` property.
   * @param event The event object triggered by the checkbox.
   */
  thundrEnable(event: any):void{
    const inputEle = event.target as HTMLInputElement;
    this.isThunder = inputEle.checked;

  }
  /**
   * Removes a crash file from the `crashFilesArr` array at the specified index.
   * @param index The index of the crash file to remove.
   */
  removeCrash(index: number):void {
    this.crashFilesArr.splice(index, 1);

  }
  /**
   * Removes a log file from the logFilesArr array at the specified index.
   * @param index The index of the log file to remove.
   */
  removeLogs(index: number):void {
    this.logFilesArr.splice(index, 1);

  }
  /**
   * Adds a crash file to the `crashFilesArr` array.
   * No parameters.
   */
  addCrash(): void {
    const value = this.createModuleForm.get('crashFilesPath')?.value.trim();
    if (value) {
      this.crashFilesArr.push(value);
      this.createModuleForm.get('crashFilesPath')?.setValue('');
    }

  }
  /**
   * Modifies a crash file entry in the crashFilesArr array.
   * @param item The crash file path to set.
   * @param index The index of the crash file to modify.
   */
  modifyCrash(item: any, index: number){
    if(item != ""){
      this.createModuleForm.get('crashFilesPath')?.setValue(item);
      this.removeCrash(index);
    }

  }
  /**
   * Adds a log file to the logFilesArr array.
   * No parameters.
   */
  addLogs(): void {
    const value = this.createModuleForm.get('logFilesPath')?.value.trim();
    if (value) {
      this.logFilesArr.push(value);
      this.createModuleForm.get('logFilesPath')?.setValue('');
      
    }

  }
  /**
   * Modifies a log file entry in the logFilesArr array.
   * @param item The log file path to set.
   * @param index The index of the log file to modify.
   */
  modifyLogs(item: any, index: number):void{
    if(item != ""){
      this.createModuleForm.get('logFilesPath')?.setValue(item);
      this.removeLogs(index);
    }

  }

}
