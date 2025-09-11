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
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MaterialModule } from '../../../material/material.module';
import { ScriptsService } from '../../../services/scripts.service';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth/auth.service';
import { DevicetypeService } from '../../../services/devicetype.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-custom-testsuite',
  standalone: true,
  imports: [CommonModule,HttpClientModule,ReactiveFormsModule,MaterialModule,FormsModule,],
  templateUrl: './custom-testsuite.component.html',
  styleUrl: './custom-testsuite.component.css'
})
export class CustomTestsuiteComponent {

  formSubmitted = false;
  customFormGroup!:FormGroup;
  masterSelected = false;
  modulesArr:any[] = [];
  messages = [];
  getCategory!: string;
  videoCategory!:string;
  allDeviceType:any;
  selectedVideoCategory : string = 'RDKV';
  loggedinUser:any;
  selectedCategory: string = '';

  /**
   * Constructor for CustomTestsuiteComponent.
   * @param scriptservice ScriptsService instance for script operations.
   * @param router Router instance for navigation.
   * @param deviceTypeService DevicetypeService instance for device type operations.
   * @param fb FormBuilder instance for creating form groups.
   * @param authservice AuthService instance for authentication.
   * @param _snakebar MatSnackBar instance for showing messages.
   */
  constructor(
    private scriptservice: ScriptsService,
    private router: Router,
    private deviceTypeService: DevicetypeService,
    private fb: FormBuilder,
    private authservice: AuthService,
    private _snakebar: MatSnackBar
  ) {
    this.loggedinUser = JSON.parse(localStorage.getItem('loggedinUser') || '{}');
    const nav = this.router.getCurrentNavigation();
  this.selectedCategory = nav?.extras?.state?.['category'] || '';
  }

  /**
   * Initializes the component, sets up the form, loads modules and device types.
   * @returns void
   */
  ngOnInit(): void {

    this.masterSelected = false;
    this.customFormGroup = this.fb.group({
      category:[],
      name:['', Validators.required],
      description:['', Validators.required],
      deviceType:['', Validators.required],
      longdurationtest:[],
      modules:[[], [Validators.required, this.arrayNotEmptyValidator]]
    })
   
    this.getCategory = localStorage.getItem('preferedCategory') || this.loggedinUser.userCategory;
    this.getAllModule(this.getCategory);
    this.getAlldeviceType();
  }
  /**
   * Validator to ensure the modules array is not empty.
   * @param control The form control to validate.
   * @returns An error object if invalid, otherwise null.
   */
  arrayNotEmptyValidator(control: any) {

    return Array.isArray(control.value) && control.value.length > 0 ? null : { required: true };
  }
  /**
   * Handles category change when a radio button is clicked.
   * @param val The selected category value.
   * @returns void
   */
  categoryChange(val: any): void {

    this.selectedVideoCategory = val;
    this.getAllModule(this.selectedVideoCategory);
    this.customFormGroup.controls['modules'].setValue([]);
    this.updateSelectAllCheckbox();
  }
  /**
   * Loads all modules for the given category.
   * @param category The selected category.
   * @returns void
   */
  getAllModule(category: string): void {

    this.scriptservice.getModuleCustomTestSuite(category).subscribe(res=>{
      this.modulesArr = res.data;
    })
  }
  /**
   * Loads all device types for the selected category.
   * @returns void
   */
  getAlldeviceType(): void {

    this.deviceTypeService.getfindallbycategory(this.getCategory).subscribe(res=>{
      this.allDeviceType = res.data
    })
  }
  /**
   * Handles change event for device type selection.
   * @param event The change event from the device type select field.
   * @returns void
   */
  devicetypeChange(event: any): void {

    let value = event.target.value;
  }
  /**
   * Checks if a module is selected in the modules array.
   * @param item The module item to check.
   * @returns boolean
   */
  modulesChecked(item: string): boolean {

    const modules = this.customFormGroup.value.modules || [];
    return modules.includes(item);
  }
  /**
   * Handles checkbox change, adds or removes the item from the modules array.
   * @param event The change event from the checkbox.
   * @param item The module item being checked/unchecked.
   * @returns void
   */
  onChange(event: any, item: any): void {

    const isChecked = event.target.checked;
    let selectedModules: string[] = this.customFormGroup.value.modules || [];

    if (isChecked) {
      if (!selectedModules.includes(item)) {
        selectedModules.push(item);
      }
    } else {
      const index = selectedModules.indexOf(item);
      if (index !== -1) {
        selectedModules.splice(index, 1);
      }
    }
    this.customFormGroup.controls['modules'].setValue([...selectedModules]);
    this.updateSelectAllCheckbox();
  }
  /**
   * Handles check/uncheck all modules action.
   * @param event The change event from the select all checkbox.
   * @returns void
   */
  checkUncheckAll(event: any): void {

    const isChecked = event.target.checked;
    const allModules = isChecked ? [...this.modulesArr] : [];
    this.customFormGroup.controls['modules'].setValue(allModules);
  }
  /**
   * Updates the select all checkbox state based on selected modules.
   * @returns void
   */
  updateSelectAllCheckbox(): void {

    const selectAllCheckbox = document.querySelector('.selectall input[type="checkbox"]') as HTMLInputElement;
    const selectedModules = this.customFormGroup.value.modules || [];
    selectAllCheckbox.checked = selectedModules.length === this.modulesArr.length;
    selectAllCheckbox.indeterminate = selectedModules.length > 0 && selectedModules.length < this.modulesArr.length;
  }
  /**
   * Handles change event for long duration test checkbox.
   * @param event The change event from the long duration checkbox.
   * @returns void
   */
  durationChecked(event: any): void {

    let duration = event.target.checked;
  }
  /**
   * Navigates back to the script page.
   * @returns void
   */
  goBack(): void {

    this.router.navigate(['/script']);
  }
  /**
   * Handles submission for creating a custom test suite, gathers form data and sends to the server.
   * @returns void
   */
  customFormSubmit(): void {

    this.formSubmitted= true;
    if(this.customFormGroup.invalid){
      return
    }else{
      let obj={
        testSuiteName: this.customFormGroup.value.name,
        description:this.customFormGroup.value.description,
        deviceType:this.customFormGroup.value.deviceType,
        modules: this.customFormGroup.value.modules,
        category:this.selectedCategory,
        userGroup: this.loggedinUser.userGroupName,
        longDurationScripts: this.customFormGroup.value.longdurationtest,
      }
      this.scriptservice.createCustomTestSuite(obj).subscribe({
        next: (res) => {
          this._snakebar.open(res.message, '', {
            duration: 2000,
            panelClass: ['success-msg'],
            verticalPosition: 'top'
          })
          setTimeout(() => {
            this.router.navigate(["/script"]);
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
  }

}
