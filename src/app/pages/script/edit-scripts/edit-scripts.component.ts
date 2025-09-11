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
import { Component, inject, TemplateRef, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, FormArray, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MaterialModule } from '../../../material/material.module';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { MonacoEditorModule } from '@materia-ui/ngx-monaco-editor';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '../../../auth/auth.service';
import { Router } from '@angular/router';
import { ModulesService } from '../../../services/modules.service';
import { PrimitiveTestService } from '../../../services/primitive-test.service';
import { ScriptsService } from '../../../services/scripts.service';
import { DevicetypeService } from '../../../services/devicetype.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatStepper, MatStepperIntl } from '@angular/material/stepper';

import { distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-edit-scripts',
  standalone: true,
  imports: [CommonModule, HttpClientModule, ReactiveFormsModule, MaterialModule, FormsModule,
    NgMultiSelectDropDownModule, MonacoEditorModule],
  templateUrl: './edit-scripts.component.html',
  styleUrl: './edit-scripts.component.css'
})
export class EditScriptsComponent {
  firstFormGroup!: FormGroup;
  secondFormGroup!: FormGroup;
  thirdFormGroup!: FormGroup;
  allDeviceType: any;
  selectedDeviceCategory: string = 'RDKV';
  allsocVendors!: any[]
  deviceTypeSettings = {};
  code: string = '';
  editorOptions = { theme: 'vs-dark', language: 'python' };
  selectedCategoryName!: string;
  private _matStepperIntl = inject(MatStepperIntl);
  optionalLabelText!: string;
  newtestDialogRef!: MatDialogRef<any>;
  @ViewChild('newtestCaseTemplate', { static: true }) newtestCaseTemplate!: TemplateRef<any>;
  @ViewChild('stepper', { static: true }) stepper!: MatStepper;
  isLinear = false;
  allModules: any;
  allPrimitiveTest: any[] = [];
  loggedinUser: any;
  deviceNameArr: any[] = []
  defaultPrimitive: any;
  changePriorityValue!: string;
  scriptDeatilsObj: any;
  RDKFlavor: any;

  /**
   * Constructor for EditScriptsComponent.
   * @param authservice AuthService instance for authentication.
   * @param router Router instance for navigation.
   * @param fb FormBuilder instance for reactive forms.
   * @param dialog MatDialog instance for dialogs.
   * @param modulesService ModulesService for module operations.
   * @param deviceTypeService DevicetypeService for device type operations.
   * @param primitiveTestService PrimitiveTestService for primitive test operations.
   * @param scriptservice ScriptsService for script operations.
   * @param _snakebar MatSnackBar for notifications.
   */
  constructor(private authservice: AuthService, private router: Router, private fb: FormBuilder,
    public dialog: MatDialog, private modulesService: ModulesService, private deviceTypeService: DevicetypeService,
    private primitiveTestService: PrimitiveTestService, private scriptservice: ScriptsService, private _snakebar: MatSnackBar,) {
    this.loggedinUser = JSON.parse(localStorage.getItem('loggedinUser') || '{}');

  }
  /**
   * Angular lifecycle hook for component initialization.
   */
  ngOnInit(): void {
    this.scriptDeatilsObj = JSON.parse(localStorage.getItem('scriptDetails') || '{}');
    this.deviceTypeSettings = {
      singleSelection: false,
      idField: 'deviceTypeName',
      textField: 'deviceTypeName',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3,
      allowSearchFilter: false,
    };
    const selectedCategory = localStorage.getItem('category');
    this.RDKFlavor = selectedCategory;
    if (selectedCategory === 'RDKB') {
      this.selectedCategoryName = 'Broadband';
    } else {
      this.selectedCategoryName = 'Video';
    }
    this.getAllModules();
    this.getAlldeviceType();
    this.deviceNameArr = this.scriptDeatilsObj.deviceTypes;
    this.getAllPrimitiveTest(this.scriptDeatilsObj.moduleName);
    this.code = this.scriptDeatilsObj.scriptContent;
    this.initializeForm();
    this.loadData();
    this.setUpValidation();
  }
  /**
   * Initializes the form groups for the component.
   */
  initializeForm() {
    this.firstFormGroup = this.fb.group({
      scriptname: ['', [Validators.required, this.noSpacesValidator]],
      module: [{ value: '', disabled: true }],
      primitiveTest: [{ value: '', disabled: true }],
      devicetype: [[], [Validators.required, this.mindeviceValidator(1)]],
      executiontimeout: ['', [Validators.required, this.onlyNumbersValidator]],
      longdurationtest: [''],
      skipexecution: [''],
      synopsis: ['', [Validators.required, this.noSpacesValidator]]
    });

    this.secondFormGroup = this.fb.group({
      testcaseID: ['', [Validators.required, this.noSpacesValidator]],
      testObjective: ['', [Validators.required, this.noSpacesValidator]],
      priority: ['', [Validators.required]],
      preconditions: this.fb.array([], [Validators.required]), 
      steps: this.fb.array([], [Validators.required]),         
      releaseVersion: ['']
    });

    this.thirdFormGroup = this.fb.group({
      pythonEditor: ['', Validators.required]
    });
  }

  /**
   * Loads data from local storage and populates the form fields.
   */
  loadData() {
    if (this.scriptDeatilsObj) {
      this.firstFormGroup.patchValue({
        scriptname: this.scriptDeatilsObj.name,
        module: this.scriptDeatilsObj.moduleName,
        primitiveTest: this.scriptDeatilsObj.primitiveTestName,
        devicetype: this.scriptDeatilsObj.deviceTypes,
        executiontimeout: this.scriptDeatilsObj.executionTimeOut,
        longdurationtest: this.scriptDeatilsObj.longDuration,
        skipexecution: this.scriptDeatilsObj.skipExecution,
        synopsis: this.scriptDeatilsObj.synopsis
      });
      this.secondFormGroup.patchValue({
        testcaseID: this.scriptDeatilsObj.testId,
        testObjective: this.scriptDeatilsObj.objective,
        priority: this.scriptDeatilsObj.priority,
        releaseVersion: this.scriptDeatilsObj.releaseVersion

      });

      this.preconditions.clear();
      if (this.scriptDeatilsObj.preConditions && Array.isArray(this.scriptDeatilsObj.preConditions)) {
        this.scriptDeatilsObj.preConditions.forEach((pre: any) => this.addPrecondition(pre));
      } else {
        this.addPrecondition(); // Add an empty one if none exist
      }


      this.steps.clear();
      if (this.scriptDeatilsObj.testSteps && Array.isArray(this.scriptDeatilsObj.testSteps)) {
        this.scriptDeatilsObj.testSteps.forEach((step: any) => this.addStep(step));
      } else {
        this.addStep(); // Add an empty one if none exist
      }


      this.thirdFormGroup.patchValue({
        pythonEditor: this.scriptDeatilsObj.scriptContent
      });

      setTimeout(() => {
        this.markFormFieldsTouched(this.firstFormGroup);
        this.markFormFieldsTouched(this.secondFormGroup);
        this.markFormFieldsTouched(this.thirdFormGroup);
      });

      setTimeout(() => {
        this.updateDeviceTypeValidity();
      });
    }
  }


  /**
   * Sets up validation for the form groups and subscribes to value changes.
   */
  setUpValidation() {
    this.firstFormGroup.valueChanges.pipe(distinctUntilChanged()).subscribe(() => {
      this.firstFormGroup.updateValueAndValidity();
    });

    this.secondFormGroup.valueChanges.pipe(distinctUntilChanged()).subscribe(() => {
      this.secondFormGroup.updateValueAndValidity();
    });

    this.thirdFormGroup.valueChanges.pipe(distinctUntilChanged()).subscribe(() => {
      this.thirdFormGroup.updateValueAndValidity();
    });
  }

  /**
   * Marks all controls in a form group as touched and dirty.
   * @param formGroup The FormGroup to mark.
   */
  markFormFieldsTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      control.markAsDirty();
      control.updateValueAndValidity();
    });
  }



  //Getter for easy access to the preconditions FormArray
  /**
   * Getter for easy access to the preconditions FormArray.
   * @returns The FormArray of preconditions.
   */
  get preconditions(): FormArray {
    return this.secondFormGroup.get('preconditions') as FormArray;
  }

  // Method to add a new precondition to the FormArray
  /**
   * Adds a new precondition to the FormArray.
   * @param pre Optional precondition object to initialize the form group.
   */
  addPrecondition(pre?: any): void {
    this.preconditions.push(this.fb.group({
      preConditionId: [pre?.preConditionId || ''],
      preConditionDetails: [pre?.preConditionDetails || '', Validators.required]
    }));
  }

  // Method to remove a precondition from the FormArray
  /**
   * Removes a precondition from the FormArray.
   * @param index The index of the precondition to remove.
   */
  removePrecondition(index: number): void {
    this.preconditions.removeAt(index);
  }


  // Getter for easy access to the steps FormArray
  /**
   * Getter for easy access to the steps FormArray.
   * @returns The FormArray of steps.
   */
  get steps(): FormArray {
    return this.secondFormGroup.get('steps') as FormArray;
  }




  // Method to add a new step to the FormArray
  /**
   * Adds a new step to the FormArray.
   * @param step Optional step object to initialize the form group.
   */
  addStep(step?: any): void {
    this.steps.push(this.fb.group({
      testStepId: [step?.testStepId || ''],
      stepName: [step?.stepName || '', Validators.required],
      stepDescription: [step?.stepDescription || '', Validators.required],
      expectedResult: [step?.expectedResult || '', Validators.required]
    }));
  }


  // Method to remove a step from the FormArray
  /**
   * Removes a step from the FormArray.
   * @param index The index of the step to remove.
   */
  removeStep(index: number): void {
    this.steps.removeAt(index);
  }




  /**
   * Navigates to the next step in the stepper if the current form group is valid.
   * @param stepIndex The index of the current step.
   */
  goToNext(stepIndex: number) {
    if (stepIndex === 1 && this.firstFormGroup.valid) {
      this.stepper.next();
    } else if (stepIndex === 2 && this.secondFormGroup.valid) {
      this.stepper.next();
    }
  }

  /**
     * Get the controls of the register form.
     * @returns The controls of the register form.
  */
  /**
   * Get the controls of the first form group.
   * @returns The controls of the first form group.
   */
  get f() { return this.firstFormGroup.controls; }
  /**
       * This method is no space is allow.
  */
  /**
   * Validator to ensure no leading spaces in the input.
   * @param control The form control to validate.
   * @returns ValidationErrors or null.
   */
  noSpacesValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return { required: true };
    }
    return control.value.startsWith(' ') ? { noLeadingSpaces: true } : null;

  }
  /**
   * Validator to ensure a minimum number of device types are selected.
   * @param min The minimum number of selections required.
   * @returns ValidatorFn for the control.
   */
  mindeviceValidator(min: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value || control.value.length < min) {
        return { minSelection: true };
      }
      return null;
    };
  }
  /**
   * Validator to ensure only numbers are entered.
   * @param control The form control to validate.
   * @returns ValidationErrors or null.
   */
  onlyNumbersValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value ? control.value.toString().trim() : '';
    if (!value) {
      return { required: true };
    }
    return /^[0-9]+$/.test(value) ? null : { onlyNumbers: true };
  }
  /**
   * Handles input event for number-only fields.
   * @param event The input event.
   */
  onNumberInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    let value = inputElement.value.replace(/\D/g, '');
    const control = this.firstFormGroup.get('executiontimeout');
    control?.setValue(value, { emitEvent: true });
    control?.updateValueAndValidity();
  }
  /**
   * Handles input event for synopsis field, trimming leading spaces.
   * @param event The input event.
   */
  onInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement | HTMLTextAreaElement;
    const value = inputElement.value;
    const trimmedValue = value.replace(/^\s+/, '');
    this.firstFormGroup.get('synopsis')?.setValue(trimmedValue, { emitEvent: false });
  }
  /**
   * Handles input event for script name, trimming leading spaces.
   * @param event The input event.
   */
  onScritName(event: Event): void {
    const inputElement = event.target as HTMLTextAreaElement;
    const value = inputElement.value;
    if (value.startsWith(' ')) {
      this.firstFormGroup.get('scriptname')?.setValue(value.trimStart(), { emitEvent: false });
    }
  }
  /**
   * Handles input event for testcase ID, trimming leading spaces.
   * @param event The input event.
   */
  onTestcaseID(event: Event): void {
    const inputElement = event.target as HTMLTextAreaElement;
    const value = inputElement.value;
    if (value.startsWith(' ')) {
      this.secondFormGroup.get('testcaseID')?.setValue(value.trimStart(), { emitEvent: false });
    }
  }
  /**
   * Handles input event for test objective, trimming leading spaces.
   * @param event The input event.
   */
  onTestObjective(event: Event): void {
    const inputElement = event.target as HTMLTextAreaElement;
    const value = inputElement.value;
    if (value.startsWith(' ')) {
      this.secondFormGroup.get('testObjective')?.setValue(value.trimStart(), { emitEvent: false });
    }
  }

  /**
   * Fetches all modules by category from the service.
   */
  getAllModules(): void {
    this.modulesService.findallbyCategory(this.RDKFlavor).subscribe(res => {
      this.allModules = res.data;
    })
  }

  /**
   * Handles module change event and fetches primitive tests for the selected module.
   * @param event The change event.
   */
  changeModule(event: any): void {
    let moduleName = event.target.value;
    this.getAllPrimitiveTest(moduleName);
  }

  /**
   * Fetches all primitive tests for the given module value.
   * @param value The module name or value.
   */
  getAllPrimitiveTest(value: any): void {
    this.primitiveTestService.getParameterNames(value).subscribe({
      next: (res) => {
        this.allPrimitiveTest = res.data;
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
   * Handles change event for primitive test selection.
   * @param event The change event.
   */
  onChangePrimitive(event: any): void {
    let primitiveValue = event.target.value;
    this.defaultPrimitive = primitiveValue;
  }
  /**
   * Handles change event for priority selection.
   * @param event The change event.
   */
  changePriority(event: any): void {
    const priorityValue = event.target.value;
    this.changePriorityValue = priorityValue;
  }

  /**
   * Fetches all device types by category from the service.
   */
  getAlldeviceType(): void {
    this.deviceTypeService.getfindallbycategory(this.RDKFlavor).subscribe(res => {
      this.allDeviceType = res.data
    })
  }

  /**
   * Handles item selection for device types.
   * @param item The selected device type item.
   */
  onItemSelect(item: any): void {
    if (!this.deviceNameArr.some(selectedItem => selectedItem.deviceTypeName === item.deviceTypeName)) {
      this.deviceNameArr.push(item.deviceTypeName);
    }
    this.updateDeviceTypeValidity();
  }

  /**
   * Handles item deselection for device types.
   * @param item The deselected device type item.
   */
  onDeSelect(item: any): void {
    let filterDevice = this.deviceNameArr.filter(name => name != item.deviceTypeName);
    this.deviceNameArr = filterDevice;
    this.updateDeviceTypeValidity();
  }

  /**
   * Handles select all event for device types.
   * @param items The array of all device type items.
   */
  onSelectAll(items: any[]): void {
    let devices = this.allDeviceType.filter(
      (item: any) => !this.deviceNameArr.find((selected) => selected.deviceTypeId === item.deviceTypeId)
    );
    this.deviceNameArr = devices.map((item: any) => item.deviceTypeName);
    this.updateDeviceTypeValidity();
  }
  /**
   * Handles deselect all event for device types.
   * @param item The deselect all event or item.
   */
  onDeSelectAll(item: any): void {
    this.deviceNameArr = [];
    this.firstFormGroup.get('devicetype')?.setValue([]);
    this.updateDeviceTypeValidity();
  }

  /**
   * Updates the validity state of the device type form control.
   */
  updateDeviceTypeValidity() {
    const control = this.firstFormGroup.get('devicetype');
    if (!control) return;
    control.markAsTouched();
    control.updateValueAndValidity();
  }
  // You can also change editor options dynamically if needed
  /**
   * Handles code editor changes.
   * @param value The new code value.
   */
  onCodeChange(value: string): void {
    let val = value;
  }
  /**
   * navigate to script page
  */
  /**
   * Navigates back to the script page and clears related local storage items.
   */
  back(): void {
    this.router.navigate(["/script"]);
    localStorage.removeItem('scriptCategory');
    localStorage.removeItem('category');
    localStorage.removeItem('categoryname');
  }
  /**
   * Submission for customSuite update
  */
  /**
   * Handles submission for custom suite update.
   */
  onSubmit(): void {

    const preConditionsArray = this.preconditions.value.map((p: any) => ({
      preConditionId: p.preConditionId,
      preConditionDetails: p.preConditionDetails
    }));

    const testStepsArray = this.steps.value.map((s: any) => ({
      testStepId: s.testStepId,
      stepName: s.stepName,
      stepDescription: s.stepDescription,
      expectedResult: s.expectedResult
    }));

    const scriptUpdateData = {
      id: this.scriptDeatilsObj.id,
      name: this.firstFormGroup.value.scriptname,
      synopsis: this.firstFormGroup.value.synopsis,
      executionTimeOut: this.firstFormGroup.value.executiontimeout,
      primitiveTestName: this.defaultPrimitive ? this.defaultPrimitive : this.scriptDeatilsObj.primitiveTestName,
      deviceTypes: this.deviceNameArr,
      skipExecution: this.firstFormGroup.value.skipexecution,
      longDuration: this.firstFormGroup.value.longdurationtest,
      testId: this.secondFormGroup.value.testcaseID,
      objective: this.secondFormGroup.value.testObjective,
      priority: this.changePriorityValue ? this.changePriorityValue : this.scriptDeatilsObj.priority,
      preConditions: preConditionsArray,
      releaseVersion: this.secondFormGroup.value.releaseVersion,
      userGroup: this.loggedinUser.userGroupName,
      testSteps: testStepsArray,
    };
    const pythonContent = this.thirdFormGroup.value.pythonEditor;
    const filename = `${this.firstFormGroup.value.scriptname}.py`;
    const scriptFile = new File([pythonContent], filename, { type: 'text/x-python' });
    this.scriptservice.updateScript(scriptUpdateData, scriptFile).subscribe({
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
  /**
   * Navigate to script page
  */
  /**
   * Navigates back to the script page and clears script details from local storage.
   */
  goBack(): void {
    localStorage.removeItem('scriptDetails');
    localStorage.removeItem('category');
    this.router.navigate(["/script"]);
  }


}
