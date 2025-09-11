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
import { AbstractControl, FormBuilder, FormGroup, FormsModule, FormArray, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MaterialModule } from '../../../material/material.module';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { MONACO_PATH, MonacoEditorModule } from '@materia-ui/ngx-monaco-editor';
import { Router } from '@angular/router';
import { MatStepperIntl } from '@angular/material/stepper';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ModulesService } from '../../../services/modules.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DevicetypeService } from '../../../services/devicetype.service';
import { PrimitiveTestService } from '../../../services/primitive-test.service';
import { ScriptsService } from '../../../services/scripts.service';
@Component({
  selector: 'app-create-scripts',
  standalone: true,
  imports: [CommonModule, HttpClientModule, ReactiveFormsModule, MaterialModule, FormsModule,
    NgMultiSelectDropDownModule, MonacoEditorModule],
  templateUrl: './create-scripts.component.html',
  styleUrl: './create-scripts.component.css',
  providers: [
    { provide: MONACO_PATH, useValue: 'assets/monaco-editor/' }
  ]
})
export class CreateScriptsComponent {

  firstFormGroup!: FormGroup;
  secondFormGroup!: FormGroup;
  thirdFormGroup!: FormGroup;
  configureName!: string;
  allDeviceType: any;
  selectedDeviceCategory: string = 'RDKV';
  allsocVendors!: any[]
  deviceTypeSettings = {};
  sampleFile: string = '';
  editorOptions = { theme: 'vs-dark', language: 'python' };
  selectedCategoryName!: string;
  private _matStepperIntl = inject(MatStepperIntl);
  optionalLabelText!: string;
  newtestDialogRef!: MatDialogRef<any>;
  @ViewChild('newtestCaseTemplate', { static: true }) newtestCaseTemplate!: TemplateRef<any>;
  isLinear = true;
  allModules: any;
  allPrimitiveTest: any[] = [];
  userGroupName: any;
  deviceNameArr: any[] = []
  defaultPrimitive: any;
  changePriorityValue!: string;
  longDurationValue!: boolean;
  skipExecutionValue!: boolean;
  selectedCategory!: string;


  /**
   * Constructor for CreateScriptsComponent.
   * @param router Router instance for navigation.
   * @param fb FormBuilder instance for creating form groups.
   * @param dialog MatDialog instance for dialog operations.
   * @param modulesService ModulesService instance for module operations.
   * @param deviceTypeService DevicetypeService instance for device type operations.
   * @param primitiveTestService PrimitiveTestService instance for primitive test operations.
   * @param scriptservice ScriptsService instance for script operations.
   * @param _snakebar MatSnackBar instance for showing messages.
   */
  constructor(
    private router: Router,
    private fb: FormBuilder,
    public dialog: MatDialog,
    private modulesService: ModulesService,
    private deviceTypeService: DevicetypeService,
    private primitiveTestService: PrimitiveTestService,
    private scriptservice: ScriptsService,
    private _snakebar: MatSnackBar,
  ) {
    this.userGroupName = JSON.parse(localStorage.getItem('loggedinUser') || '{}');
  }

  /**
   * Initializes the component and forms, sets up device type settings, category, and loads modules and device types.
   * @returns void
   */
  ngOnInit(): void {

    let category = localStorage.getItem('category') || '';
    this.selectedCategory = category ? category : 'RDKV';
    this.deviceTypeSettings = {
      singleSelection: false,
      idField: 'deviceTypeId',
      textField: 'deviceTypeName',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3,
      allowSearchFilter: false,
    };
    const selectedCategory = localStorage.getItem('category');
    if (selectedCategory === 'RDKB') {
      this.selectedCategoryName = 'Broadband';
    } else if (selectedCategory === 'RDKC') {
      this.selectedCategoryName = 'Camera';
    } else {
      this.selectedCategoryName = 'Video';
    }
    this.getAllModules();
    this.getAlldeviceType();

    this.firstFormGroup = this.fb.group({
      scriptname: ['', [Validators.required, this.noSpacesValidator]],
      module: ['', Validators.required],
      primitiveTest: [{ value: this.defaultPrimitive, disabled: true }],
      devicetype: ['', Validators.required],
      executiontimeout: ['', Validators.required],
      longdurationtest: [''],
      skipexecution: [''],
      synopsis: ['', [Validators.required, this.noSpacesValidator]]
    });
    this.secondFormGroup = this.fb.group({
      testcaseID: ['', Validators.required],
      testObjective: ['', Validators.required],
      priority: ['', Validators.required],
      steps: this.fb.array([], [Validators.required]),
      releaseVersion: ['', Validators.required],
      preconditions: this.fb.array([], [Validators.required]),
    });

    this.addPrecondition();
    this.addStep();
    this.thirdFormGroup = this.fb.group({
      pythonEditor: [this.sampleFile, Validators.required],
    });

    this.firstFormGroup.get('module')?.valueChanges.subscribe(value => {
      if (value) {
        this.getAllPrimitiveTest(value);
        this.firstFormGroup.get('primitiveTest')?.enable();

      } else {
        this.allPrimitiveTest = [];
        this.firstFormGroup.get('primitiveTest')?.disable();
      }
    });
  }
  /**
   * Get the controls of the register form.
   * @returns The controls of the register form.
   */
  get f() { return this.firstFormGroup.controls; }
  /**
   * Validator to disallow leading spaces in input fields.
   * @param control The form control to validate.
   * @returns ValidationErrors | null
   */
  noSpacesValidator(control: AbstractControl): ValidationErrors | null {

    const value = control.value ? control.value.toString() : '';
    return value.trimStart().length !== value.length ? { noLeadingSpaces: true } : null;
  }

  /**
   * Handles input event for the synopsis field, trims leading spaces.
   * @param event The input event from the synopsis field.
   * @returns void
   */
  onInput(event: Event): void {

    const inputElement = event.target as HTMLTextAreaElement;
    const value = inputElement.value;
    if (value.startsWith(' ')) {
      this.firstFormGroup.get('synopsis')?.setValue(value.trimStart(), { emitEvent: false });
    }
  }
  /**
   * Handles input event for the script name field, trims leading spaces.
   * @param event The input event from the script name field.
   * @returns void
   */
  onScritName(event: Event): void {

    const inputElement = event.target as HTMLTextAreaElement;
    const value = inputElement.value;
    if (value.startsWith(' ')) {
      this.firstFormGroup.get('scriptname')?.setValue(value.trimStart(), { emitEvent: false });
    }
  }
  /**
   * Handles input event for the test case ID field, trims leading spaces.
   * @param event The input event from the test case ID field.
   * @returns void
   */
  onTestcaseID(event: Event): void {

    const inputElement = event.target as HTMLTextAreaElement;
    const value = inputElement.value;
    if (value.startsWith(' ')) {
      this.secondFormGroup.get('testcaseID')?.setValue(value.trimStart(), { emitEvent: false });
    }
  }
  /**
   * Handles input event for the test objective field, trims leading spaces.
   * @param event The input event from the test objective field.
   * @returns void
   */
  onTestObjective(event: Event): void {

    const inputElement = event.target as HTMLTextAreaElement;
    const value = inputElement.value;
    if (value.startsWith(' ')) {
      this.secondFormGroup.get('testObjective')?.setValue(value.trimStart(), { emitEvent: false });
    }
  }


  // Getter for easy access to the steps FormArray
  /**
   * Getter for easy access to the steps FormArray.
   * @returns FormArray
   */
  get steps(): FormArray {

    return this.secondFormGroup.get('steps') as FormArray;
  }


  //Getter for easy access to the preconditions FormArray
  /**
   * Getter for easy access to the preconditions FormArray.
   * @returns FormArray
   */
  get preconditions(): FormArray {

    return this.secondFormGroup.get('preconditions') as FormArray;
  }


  // Method to add a new precondition to the FormArray
  /**
   * Adds a new precondition to the FormArray.
   * @returns void
   */
  addPrecondition(): void {

    this.preconditions.push(this.fb.group({
      precondition: ['', Validators.required]
    }));
  }


  // Method to remove a precondition from the FormArray
  /**
   * Removes a precondition from the FormArray.
   * @param index The index of the precondition to remove.
   * @returns void
   */
  removePrecondition(index: number): void {

    this.preconditions.removeAt(index);
  }

  // Method to add a new step to the FormArray
  /**
   * Adds a new step to the FormArray.
   * @returns void
   */
  addStep(): void {

    this.steps.push(this.fb.group({
      stepName: ['', Validators.required],
      stepDescription: ['', Validators.required],
      expectedResult: ['', Validators.required]
    }));
  }

  // Method to remove a step from the FormArray
  /**
   * Removes a step from the FormArray.
   * @param index The index of the step to remove.
   * @returns void
   */
  removeStep(index: number): void {

    this.steps.removeAt(index);
  }

  /**
   * Loads all modules for the selected category.
   * @returns void
   */
  getAllModules(): void {

    this.modulesService.findallbyCategory(this.selectedCategory).subscribe(res => {
      this.allModules = res.data;
    })
  }

  /**
   * Handles module selection change, loads primitive tests for the selected module.
   * @param event The change event from the module select field.
   * @returns void
   */
  getSelectedModule(event: any): void {

    this.allPrimitiveTest = [];
    let selectedValue = event.target.value;
    if (!selectedValue) {
      this.firstFormGroup.get('primitiveTest')?.disable();
    } else {
      this.getAllPrimitiveTest(selectedValue);
    }
  }
  /**
   * Loads primitive tests based on the selected module.
   * @param value The selected module value.
   * @returns void
   */
  getAllPrimitiveTest(value: any): void {

    this.primitiveTestService.getParameterNames(value).subscribe({
      next: (res) => {
        this.allPrimitiveTest = res.data;
        for (let i = 0; i < this.allPrimitiveTest.length; i++) {
          this.defaultPrimitive = this.allPrimitiveTest[0].primitiveTestName;
          this.getCode();
        }
      },
      error: (err) => {
        let errmsg = JSON.parse(err.message);
        this._snakebar.open(errmsg.message, '', {
          duration: 2000,
          panelClass: ['err-msg'],
          horizontalPosition: 'end',
          verticalPosition: 'top'
        })
      }
    })
  }
  /**
   * Handles change event for primitive test selection and loads code template.
   * @param event The change event from the primitive test select field.
   * @returns void
   */
  onChangePrimitive(event: any): void {

    let primitiveValue = event.target.value;
    this.defaultPrimitive = primitiveValue;
    this.getCode();
  }
  /**
   * Handles change event for long duration test checkbox.
   * @param event The change event from the long duration checkbox.
   * @returns void
   */
  longDuration(event: any): void {

    this.longDurationValue = event.target.checked;
  }
  /**
   * Handles change event for skip execution checkbox.
   * @param event The change event from the skip execution checkbox.
   * @returns void
   */
  skipExecution(event: any): void {

    this.skipExecutionValue = event.target.checked;
  }
  /**
   * Handles change event for priority selection.
   * @param event The change event from the priority select field.
   * @returns void
   */
  changePriority(event: any): void {

    const priorityValue = event.target.value;
    this.changePriorityValue = priorityValue;
  }
  /**
   * Loads python code template for the selected primitive test.
   * @returns void
   */
  getCode(): void {

    let temp = this.defaultPrimitive;
    if (temp) {
      this.scriptservice.scriptTemplate(temp).subscribe(res => {
        this.sampleFile = res;
      })
    }
  }
  /**
   * Loads all device types for the selected category.
   * @returns void
   */
  getAlldeviceType(): void {

    this.deviceTypeService.getfindallbycategory(this.selectedCategory).subscribe(res => {
      this.allDeviceType = res.data
    })
  }
  /**
   * Handles selection of a device type.
   * @param item The selected device type item.
   * @returns void
   */
  onItemSelect(item: any): void {

    if (!this.deviceNameArr.some(selectedItem => selectedItem.deviceTypeName === item.deviceTypeName)) {
      this.deviceNameArr.push(item.deviceTypeName);
    }
  }
  /**
   * Handles deselection of a device type.
   * @param item The deselected device type item.
   * @returns void
   */
  onDeSelect(item: any): void {

    let filterDevice = this.deviceNameArr.filter(name => name != item.deviceTypeName);
    this.deviceNameArr = filterDevice;
  }
  /**
   * Handles select all action for device types.
   * @param items The array of all device type items.
   * @returns void
   */
  onSelectAll(items: any[]): void {

    let devices = this.allDeviceType.filter(
      (item: any) => !this.deviceNameArr.find((selected) => selected.deviceTypeId === item.deviceTypeId)
    );
    this.deviceNameArr = devices.map((item: any) => item.deviceTypeName)
  }
  /**
   * Handles deselect all action for device types.
   * @param item The deselected device type item.
   * @returns void
   */
  onDeSelectAll(item: any): void {

    this.deviceNameArr = [];
  }
  // You can also change editor options dynamically if needed
  /**
   * Handles code change event in the monaco editor.
   * @param value The new code value from the editor.
   * @returns void
   */
  onCodeChange(value: string): void {

    let val = value;
  }

  /**
   * Updates the optional label for the stepper.
   * @returns void
   */
  updateOptionalLabel(): void {

    this._matStepperIntl.optionalLabel = this.optionalLabelText;
    this._matStepperIntl.changes.next();
  }
  /**
   * Handles submission for creating a script, gathers form data and sends to the server.
   * @returns void
   */
  onSubmit(): void {


    const preconditionsArray = this.secondFormGroup.value.preconditions.map((p: any) => p.precondition);

    const scriptCreateData = {
      name: this.firstFormGroup.value.scriptname,
      synopsis: this.firstFormGroup.value.synopsis,
      executionTimeOut: this.firstFormGroup.value.executiontimeout,
      primitiveTestName: this.defaultPrimitive,
      deviceTypes: this.deviceNameArr,
      skipExecution: this.firstFormGroup.value.skipexecution,
      longDuration: this.firstFormGroup.value.longdurationtest,
      testId: this.secondFormGroup.value.testcaseID,
      objective: this.secondFormGroup.value.testObjective,

      priority: this.changePriorityValue,
      releaseVersion: this.secondFormGroup.value.releaseVersion,
      testSteps: this.secondFormGroup.value.steps,
      preConditions: preconditionsArray,
      userGroup: this.userGroupName.userGroupName,
    };
    const pythonContent = this.thirdFormGroup.value.pythonEditor;
    const filename = `${this.firstFormGroup.value.scriptname}.py`;
    const scriptFile = new File([pythonContent], filename, { type: 'text/x-python' });
    this.scriptservice.createScript(scriptCreateData, scriptFile).subscribe({
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
   * Navigates back to the script page and removes category from local storage.
   * @returns void
   */
  goBack(): void {

    localStorage.removeItem('category');
    this.router.navigate(["/script"]);
  }


}
