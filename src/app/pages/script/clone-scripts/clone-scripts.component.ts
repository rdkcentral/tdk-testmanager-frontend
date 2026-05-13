/*
* If not stated otherwise in this file or this component's LICENSE file the
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
import { Component, TemplateRef, ViewChild } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  FormsModule,
  FormArray,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MaterialModule } from '../../../material/material.module';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { MonacoEditorModule } from '@materia-ui/ngx-monaco-editor';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ModulesService } from '../../../services/modules.service';
import { PrimitiveTestService } from '../../../services/primitive-test.service';
import { ScriptsService } from '../../../services/scripts.service';
import { DevicetypeService } from '../../../services/devicetype.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatStepper } from '@angular/material/stepper';
import { distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-clone-scripts',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    ReactiveFormsModule,
    MaterialModule,
    FormsModule,
    NgMultiSelectDropDownModule,
    MonacoEditorModule,
  ],
  templateUrl: './clone-scripts.component.html',
  styleUrl: './clone-scripts.component.css',
})
export class CloneScriptsComponent {
  firstFormGroup!: FormGroup;
  secondFormGroup!: FormGroup;
  thirdFormGroup!: FormGroup;
  allDeviceType: any;
  deviceTypeSettings = {};
  code: string = '';
  editorOptions = { theme: 'vs-dark', language: 'python' };
  selectedCategoryName!: string;
  @ViewChild('stepper', { static: true }) stepper!: MatStepper;
  @ViewChild('confirmCloneDialog', { static: true })
  confirmCloneDialog!: TemplateRef<any>;
  isLinear = false;
  allModules: any;
  allPrimitiveTest: any[] = [];
  loggedinUser: any;
  deviceNameArr: any[] = [];
  defaultPrimitive: any;
  changePriorityValue!: string;
  scriptDetailsObj: any;
  RDKFlavor: any;

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
    this.loggedinUser = JSON.parse(
      localStorage.getItem('loggedinUser') || '{}',
    );
  }

  ngOnInit(): void {
    const scriptDetails = JSON.parse(
      localStorage.getItem('scriptDetails') || '{}',
    );
    if (
      !scriptDetails?.id ||
      !scriptDetails?.name ||
      !scriptDetails?.moduleName ||
      !Array.isArray(scriptDetails?.deviceTypes)
    ) {
      this._snakebar.open(
        'Script details are missing. Please select a script to clone again.',
        'Close',
        {
          duration: 3000,
        },
      );
      this.router.navigate(['/script']);
      return;
    }
    this.scriptDetailsObj = scriptDetails;
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
    this.deviceNameArr = this.scriptDetailsObj.deviceTypes;
    this.getAllPrimitiveTest(this.scriptDetailsObj.moduleName);
    this.code = this.scriptDetailsObj.scriptContent;
    this.initializeForm();
    this.setUpValidation();
    this.getAlldeviceType();
  }

  minSelectionValidator(min: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      return Array.isArray(value) && value.length >= min
        ? null
        : {
            minSelection: {
              required: min,
              actual: Array.isArray(value) ? value.length : 0,
            },
          };
    };
  }

  initializeForm() {
    this.firstFormGroup = this.fb.group({
      scriptname: ['', [Validators.required, this.noSpacesValidator]],
      module: [''],
      primitiveTest: [''],
      devicetype: [[], [this.minSelectionValidator(1)]],
      executiontimeout: ['', [Validators.required, this.onlyNumbersValidator]],
      longdurationtest: [''],
      skipexecution: [''],
      synopsis: ['', [Validators.required, this.noSpacesValidator]],
    });

    this.deviceNameArr = this.firstFormGroup.get('devicetype')?.value || [];
    this.firstFormGroup
      .get('devicetype')
      ?.valueChanges.pipe(
        distinctUntilChanged(
          (previous, current) =>
            JSON.stringify(previous || []) === JSON.stringify(current || []),
        ),
      )
      .subscribe((selectedDeviceTypes: any[] = []) => {
        this.deviceNameArr = Array.isArray(selectedDeviceTypes)
          ? selectedDeviceTypes
          : [];
      });

    this.secondFormGroup = this.fb.group({
      testcaseID: ['', [Validators.required, this.noSpacesValidator]],
      testObjective: ['', [Validators.required, this.noSpacesValidator]],
      priority: ['', [Validators.required]],
      preconditions: this.fb.array([], [Validators.required]),
      steps: this.fb.array([], [Validators.required]),
      releaseVersion: [''],
    });

    this.thirdFormGroup = this.fb.group({
      pythonEditor: ['', Validators.required],
    });
  }

  loadData() {
    if (this.scriptDetailsObj) {
      this.firstFormGroup.patchValue({
        scriptname: 'Clone of ' + this.scriptDetailsObj.name,
        module: this.scriptDetailsObj.moduleName,
        primitiveTest: this.scriptDetailsObj.primitiveTestName,
        devicetype: this.scriptDetailsObj.deviceTypes,
        executiontimeout: this.scriptDetailsObj.executionTimeOut,
        longdurationtest: this.scriptDetailsObj.longDuration,
        skipexecution: this.scriptDetailsObj.skipExecution,
        synopsis: this.scriptDetailsObj.synopsis,
      });
      this.secondFormGroup.patchValue({
        testcaseID: this.scriptDetailsObj.testId,
        testObjective: this.scriptDetailsObj.objective,
        priority: this.scriptDetailsObj.priority,
        releaseVersion: this.scriptDetailsObj.releaseVersion,
      });

      this.preconditions.clear();
      if (
        this.scriptDetailsObj.preConditions &&
        Array.isArray(this.scriptDetailsObj.preConditions)
      ) {
        this.scriptDetailsObj.preConditions.forEach((pre: any) =>
          this.addPrecondition(pre),
        );
      } else {
        this.addPrecondition();
      }

      this.steps.clear();
      if (
        this.scriptDetailsObj.testSteps &&
        Array.isArray(this.scriptDetailsObj.testSteps)
      ) {
        this.scriptDetailsObj.testSteps.forEach((step: any) =>
          this.addStep(step),
        );
      } else {
        this.addStep();
      }

      this.thirdFormGroup.patchValue({
        pythonEditor: this.scriptDetailsObj.scriptContent,
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

  insertStep(index: number): void {
    const newStep = this.fb.group({
      testStepId: [''],
      stepName: ['', Validators.required],
      stepDescription: ['', Validators.required],
      expectedResult: ['', Validators.required],
    });
    this.steps.insert(index, newStep);
  }

  setUpValidation() {
    this.firstFormGroup.valueChanges
      .pipe(distinctUntilChanged())
      .subscribe(() => {
        this.firstFormGroup.updateValueAndValidity({ emitEvent: false });
      });

    this.secondFormGroup.valueChanges
      .pipe(distinctUntilChanged())
      .subscribe(() => {
        this.secondFormGroup.updateValueAndValidity({ emitEvent: false });
      });

    this.thirdFormGroup.valueChanges
      .pipe(distinctUntilChanged())
      .subscribe(() => {
        this.thirdFormGroup.updateValueAndValidity({ emitEvent: false });
      });
  }

  markFormFieldsTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
      control.markAsDirty();
      control.updateValueAndValidity();
    });
  }

  get preconditions(): FormArray {
    return this.secondFormGroup.get('preconditions') as FormArray;
  }

  addPrecondition(pre?: any): void {
    this.preconditions.push(
      this.fb.group({
        preConditionId: [pre?.preConditionId || ''],
        preConditionDetails: [
          pre?.preConditionDetails || '',
          Validators.required,
        ],
      }),
    );
  }

  insertPrecondition(index: number): void {
    const newPrecondition = this.fb.group({
      preConditionDetails: ['', Validators.required],
    });
    this.preconditions.insert(index, newPrecondition);
  }

  removePrecondition(index: number): void {
    this.preconditions.removeAt(index);
  }

  get steps(): FormArray {
    return this.secondFormGroup.get('steps') as FormArray;
  }

  addStep(step?: any): void {
    this.steps.push(
      this.fb.group({
        testStepId: [step?.testStepId || ''],
        stepName: [step?.stepName || '', Validators.required],
        stepDescription: [step?.stepDescription || '', Validators.required],
        expectedResult: [step?.expectedResult || '', Validators.required],
      }),
    );
  }

  removeStep(index: number): void {
    this.steps.removeAt(index);
  }

  goToNext(stepIndex: number) {
    if (stepIndex === 1 && this.firstFormGroup.valid) {
      this.stepper.next();
    } else if (stepIndex === 2 && this.secondFormGroup.valid) {
      this.stepper.next();
    }
  }

  get f() {
    return this.firstFormGroup.controls;
  }

  noSpacesValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) {
      return { required: true };
    }
    return control.value.startsWith(' ') ? { noLeadingSpaces: true } : null;
  }

  onlyNumbersValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value ? control.value.toString().trim() : '';
    if (!value) {
      return { required: true };
    }
    return /^[0-9]+$/.test(value) ? null : { onlyNumbers: true };
  }

  onNumberInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    let value = inputElement.value.replace(/\D/g, '');
    const control = this.firstFormGroup.get('executiontimeout');
    control?.setValue(value, { emitEvent: true });
    control?.updateValueAndValidity();
  }

  onInput(event: Event): void {
    const inputElement = event.target as HTMLInputElement | HTMLTextAreaElement;
    const value = inputElement.value;
    const trimmedValue = value.replace(/^\s+/, '');
    this.firstFormGroup
      .get('synopsis')
      ?.setValue(trimmedValue, { emitEvent: false });
  }

  onScritName(event: Event): void {
    const inputElement = event.target as HTMLTextAreaElement;
    const value = inputElement.value;
    if (value.startsWith(' ')) {
      this.firstFormGroup
        .get('scriptname')
        ?.setValue(value.trimStart(), { emitEvent: false });
    }
  }

  onTestcaseID(event: Event): void {
    const inputElement = event.target as HTMLTextAreaElement;
    const value = inputElement.value;
    if (value.startsWith(' ')) {
      this.secondFormGroup
        .get('testcaseID')
        ?.setValue(value.trimStart(), { emitEvent: false });
    }
  }

  onTestObjective(event: Event): void {
    const inputElement = event.target as HTMLTextAreaElement;
    const value = inputElement.value;
    if (value.startsWith(' ')) {
      this.secondFormGroup
        .get('testObjective')
        ?.setValue(value.trimStart(), { emitEvent: false });
    }
  }

  getAllModules(): void {
    this.modulesService.findallbyCategory(this.RDKFlavor).subscribe((res) => {
      this.allModules = res.data;
    });
  }

  changeModule(event: any): void {
    let moduleName = event.target.value;
    this.defaultPrimitive = '';
    this.firstFormGroup.get('primitiveTest')?.setValue('');
    this.getAllPrimitiveTest(moduleName);
  }

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
          verticalPosition: 'top',
        });
      },
    });
  }

  onChangePrimitive(event: any): void {
    let primitiveValue = event.target.value;
    this.defaultPrimitive = primitiveValue;
  }

  changePriority(event: any): void {
    const priorityValue = event.target.value;
    this.changePriorityValue = priorityValue;
  }

  getAlldeviceType(): void {
    this.deviceTypeService
      .getfindallbycategory(this.RDKFlavor)
      .subscribe((res) => {
        this.allDeviceType = res.data;
        this.loadData();
      });
  }

  onItemSelect(item: any): void {
    if (!this.deviceNameArr.includes(item.deviceTypeName)) {
      this.deviceNameArr.push(item.deviceTypeName);
    }
    this.updateDeviceTypeValidity();
  }

  onDeSelect(item: any): void {
    let filterDevice = this.deviceNameArr.filter(
      (name) => name != item.deviceTypeName,
    );
    this.deviceNameArr = filterDevice;
    this.updateDeviceTypeValidity();
  }

  onSelectAll(items: any[]): void {
    this.deviceNameArr = this.allDeviceType.map(
      (item: any) => item.deviceTypeName,
    );
    this.updateDeviceTypeValidity();
  }

  onDeSelectAll(item: any): void {
    this.deviceNameArr = [];
    this.firstFormGroup.get('devicetype')?.setValue([]);
    this.updateDeviceTypeValidity();
  }

  updateDeviceTypeValidity() {
    const control = this.firstFormGroup.get('devicetype');
    if (!control) return;
    control.markAsTouched();
    control.updateValueAndValidity();
  }

  onSubmit(): void {
    const dialogRef = this.dialog.open(this.confirmCloneDialog, {
      width: '400px',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.submitClonedScript();
      }
    });
  }

  private submitClonedScript(): void {
    const preConditionsArray = this.preconditions.value.map(
      (p: any) => p.preConditionDetails,
    );

    const testStepsArray = this.steps.value.map((s: any) => ({
      stepName: s.stepName,
      stepDescription: s.stepDescription,
      expectedResult: s.expectedResult,
    }));

    const scriptCloneData = {
      name: this.firstFormGroup.value.scriptname,
      synopsis: this.firstFormGroup.value.synopsis,
      executionTimeOut: this.firstFormGroup.value.executiontimeout,
      moduleName:
        this.firstFormGroup.value.module || this.scriptDetailsObj.moduleName,
      primitiveTestName:
        this.firstFormGroup.value.primitiveTest ||
        this.scriptDetailsObj.primitiveTestName,
      deviceTypes: this.deviceNameArr,
      skipExecution: this.firstFormGroup.value.skipexecution,
      longDuration: this.firstFormGroup.value.longdurationtest,
      testId: this.secondFormGroup.value.testcaseID,
      objective: this.secondFormGroup.value.testObjective,
      priority: this.changePriorityValue
        ? this.changePriorityValue
        : this.scriptDetailsObj.priority,
      preConditions: preConditionsArray,
      releaseVersion: this.secondFormGroup.value.releaseVersion,
      userGroup: this.loggedinUser.userGroupName,
      testSteps: testStepsArray,
    };

    const pythonContent = this.thirdFormGroup.value.pythonEditor;
    const filename = `${this.firstFormGroup.value.scriptname}.py`;
    const scriptFile = new File([pythonContent], filename, {
      type: 'text/x-python',
    });

    this.scriptservice.createScript(scriptCloneData, scriptFile).subscribe({
      next: (res) => {
        this._snakebar.open(res.message || 'Script cloned successfully!', '', {
          duration: 2000,
          panelClass: ['success-msg'],
          verticalPosition: 'top',
        });
        this.scriptservice.resetPaginationState();
        setTimeout(() => {
          this.router.navigate(['/script']);
        }, 1000);
      },
      error: (err) => {
        this._snakebar.open(
          err.error?.message || 'Failed to clone script.',
          '',
          {
            duration: 2000,
            panelClass: ['err-msg'],
            horizontalPosition: 'end',
            verticalPosition: 'top',
          },
        );
      },
    });
  }

  goBack(): void {
    localStorage.removeItem('scriptDetails');
    localStorage.removeItem('category');
    this.router.navigate(['/script']);
  }
}
