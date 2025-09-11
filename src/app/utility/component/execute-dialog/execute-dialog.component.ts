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
import { Component, Inject, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from '../../../material/material.module';
import { MultiSelectComponent, NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { LoaderComponent } from '../loader/loader.component';
import {
  BsDatepickerConfig,
  BsDatepickerModule
} from "ngx-bootstrap/datepicker";
import { TimepickerConfig, TimepickerModule } from "ngx-bootstrap/timepicker";
import { ExecutionService } from '../../../services/execution.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../auth/auth.service';
import moment from 'moment-timezone';
import { FocusDirective } from '../../directives/focus.directive';


export function getDatepickerConfig(): BsDatepickerConfig {
  return Object.assign(new BsDatepickerConfig(), {
    dateInputFormat: "YYYY-MM-DD"
  });
}

export function getTimepickerConfig(): TimepickerConfig {
  return Object.assign(new TimepickerConfig(), {
    dateInputFormat: "YYYY-MM-DD"
  });
}

@Component({
  selector: 'app-execute-dialog',
  standalone: true,
  imports: [CommonModule, LoaderComponent, ReactiveFormsModule, FormsModule,
    MaterialModule, NgMultiSelectDropDownModule, BsDatepickerModule, TimepickerModule, FocusDirective],
  providers: [BsDatepickerConfig, TimepickerConfig],
  templateUrl: './execute-dialog.component.html',
  styleUrl: './execute-dialog.component.css'
})
export class ExecuteDialogComponent {
  @ViewChild('multiSelect', { static: false }) dropdownRef!: MultiSelectComponent;
  @ViewChild('multiSelectScript', { static: false }) scriptRef!: MultiSelectComponent;
  @ViewChild('multiSelectTestSuite', { static: false }) testSuiteRef!: MultiSelectComponent;
  executeForm!: FormGroup;
  FormSubmitted = false;
  devicetypeSettings = {};
  normalDeviceSettings={};
  scriptSettings = {};
  testSuiteSettings = {};
  deviceList = [];
  scriptList = [];
  testSuiteList = [];
  selectedScriptType!: string;
  showHideSuite = false;
  showHideScript = true;
  showReRun = false;
  showLogs = false;
  showLoader = false;
  showSchedule = false;
  showExecute = true;
  isMeridian = false;
  onetime = true;
  reccurence = false;
  dailyGroup = true;
  selectedWeekDays: string[] = [];
  weeklyGroup = false;
  monthlyGroup = false;
  defaultValue: number = 1;
  message: string = ''; 
  deviceTooltip: string = 'Select a device or multiple device';
  isThunderEnable = false;
  loggedinUser:any;
  userCategory:string;
  deviceNameArr: any[]=[];
  scriptNameArr: any[]=[];
  testSuiteNameArr: any[]=[];
  deviceStatucClick = true;
  normalExecutionClick = false;
  testsuiteVisible = false;
  scriptVisible = true;
  testTypeName! :string;
  executionName! : string;
  triggerExecuteDetails!: string;
  triggerMessage!:string;
  scriptTestsuiteOptions:any;
  reRunFail = false;
  diagnosis = false;
  performance = false;
  logTransfer = false;
  utcTime :any;
  bsConfig: Partial<BsDatepickerConfig>;
  categoryName !: string;
  selectedType!: string;
  showToggleField = false;
  additionalExeName!: string;
  repeatTypeBoolean = false;
  preferedCategory!:string;
  scriptLoading = false; 
  testSuiteLoading = false;
  scriptsLoaded = false;
  testSuitesLoaded = false;

  /**
   * Constructor for ExecuteDialogComponent.
   * @param dialogRef Reference to the dialog opened.
   * @param deviceStatusData Data injected for device status execution.
   * @param executionClickData Data injected for normal execution click.
   * @param fb FormBuilder for reactive forms.
   * @param executionservice Service for execution operations.
   * @param authservice Service for authentication operations.
   * @param _snakebar Service for showing snack bar notifications.
   */
  constructor(
    public dialogRef: MatDialogRef<ExecuteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public deviceStatusData: any,
    @Inject(MAT_DIALOG_DATA) public executionClickData: any,
     private fb: FormBuilder, 
    private executionservice:ExecutionService,
    private authservice: AuthService,
    private _snakebar :MatSnackBar) {
    this.bsConfig = {
      minDate: new Date(),
      dateInputFormat: 'YYYY/MM/DD',
    };
    this.loggedinUser = JSON.parse(localStorage.getItem('loggedinUser') || '{}');
    this.userCategory = this.loggedinUser.userCategory;
    this.preferedCategory = localStorage.getItem('preferedCategory') || '';
  }

  /**
   * Initializes the component. Sets up form controls and settings based on the selected category and click data.
   * 
   * - If the selected category is 'RDKB' or 'RDKC', disables Thunder.
   * - If `deviceClick` is true, sets up the form and settings for device status execution.
   * - If `executionClick` is true, sets up the form and settings for normal execution.
   * - Subscribes to changes in the `selectType` form control to handle script type selection.
   * 
   * @returns {void}
   */
  ngOnInit(): void {
    let deviceClick = this.deviceStatusData.params;
    let executionClick = this.executionClickData.normalExecutionClick;
    this.categoryName = this.preferedCategory?this.preferedCategory:this.userCategory;
    this.repeatTypeBoolean = false;
    this.scriptsLoaded = false;
    this.testSuitesLoaded = false;
    if (this.categoryName === 'RDKB' || this.categoryName === 'RDKC') {
      this.isThunderEnable = false;
      }
    if(deviceClick){
      this.deviceStatucClick = true;
      this.normalExecutionClick = false;
      this.devicetypeSettings = {
        singleSelection: false,
        idField: 'deviceName',
        textField: 'deviceName',
        selectAllText: 'Select All',
        unSelectAllText: 'UnSelect All',
        itemsShowLimit: 2,
        allowSearchFilter: true,
      };
      this.scriptSettings = {
        singleSelection: false,
        idField: 'id',
        textField: 'scriptName',
        selectAllText: 'Select All',
        unSelectAllText: 'UnSelect All',
        maxHeight:200,
        allowSearchFilter: true,
      };
      this.testSuiteSettings = {
        singleSelection: false,
        idField: 'id',
        textField: 'testSuiteName',
        selectAllText: 'Select All',
        unSelectAllText: 'UnSelect All',
        
        allowSearchFilter: true,
      };
      this.executeForm = this.fb.group({
        isThunder:[this.deviceStatusData.params.thunderEnabled],
        devicetype: [[this.deviceStatusData.params.deviceName]],
        testType:['Other',Validators.required],
        executionName: [this.executionName],
        selectType:['script'],
        scriptTestsuite: ['', Validators.required],
        fullIndvidual:['full'],
        rerun: [''],
        executionnumber:['1', Validators.required],
        diagnosis:[''],
        performance:[''],
        logTransfer:[''],
        date: [new Date()],
        time: [new Date()],
        scheduleType: ['OnetimeSchedule'],
        startdate: [new Date()],
        enddate: [new Date()]
      });
      this.scriptTestsuiteOptions = [];
      this.isThunderEnable = this.deviceStatusData.params.thunderEnabled;
      this.deviceNameArr.push(this.deviceStatusData.params.deviceName);
      this.getDeviceByCategory(this.categoryName,this.isThunderEnable);
      this.getExecutionName();
    }
    if(executionClick){
      this.deviceStatucClick = false;
      this.normalExecutionClick = true;
      this.normalDeviceSettings ={
        singleSelection: false,
        idField: 'id',
        textField: 'deviceName',
        selectAllText: 'Select All',
        unSelectAllText: 'UnSelect All',
        itemsShowLimit: 2,
        allowSearchFilter: true,
      };
      this.scriptSettings = {
        singleSelection: false,
        idField: 'id',
        textField: 'scriptName',
        selectAllText: 'Select All',
        unSelectAllText: 'UnSelect All',
        maxHeight:200,
        allowSearchFilter: true,
      };
      this.testSuiteSettings = {
        singleSelection: false,
        idField: 'id',
        textField: 'testSuiteName',
        selectAllText: 'Select All',
        unSelectAllText: 'UnSelect All',
        
        allowSearchFilter: true,
      };
      this.executeForm = this.fb.group({
        isThunder:[''],
        devicetype: [''],
        testType:['',Validators.required],
        executionName: [''],
        selectType:['script'],
        scriptTestsuite: ['', Validators.required],
        fullIndvidual:['full'],
        rerun: [''],
        diagnosis:[''],
        performance:[''],
        logTransfer:[''],
        executionnumber:['1'],
        date: [new Date()],
        time: [new Date()],
        scheduleType: ['OnetimeSchedule'],
        recurrenceStartDate: [null, Validators.required],
        recurrenceEndDate: [null, Validators.required],
      });
      this.isThunderEnable = this.isThunderEnable;
      this.scriptTestsuiteOptions = [];
      this.getDeviceByCategory(this.categoryName,this.isThunderEnable);
      this.getScriptByCategory(this.categoryName,this.isThunderEnable);
      this.getTestSuiteByCategory(this.categoryName,this.isThunderEnable);
      this.getExecutionName();
    }
    this.executeForm.get('selectType')?.valueChanges.subscribe((value) => {
      this.selectScriptType(value);
    });
    this.selectedType = this.executeForm.value.selectType;
    this.executeForm.addControl('dailyValue', this.fb.control(''));
    this.executeForm.addControl('monthlyDay', this.fb.control(''));
    this.executeForm.addControl('monthlyInterval', this.fb.control(''));
    this.executeForm.addControl('starttime', this.fb.control(new Date()));
    this.executeForm.addControl('dailyOption', this.fb.control('days'));
    this.executeForm.addControl('endtime', this.fb.control(new Date()));
  }

  /**
   * Toggles the visibility of additional log options field.
   * @param event The event object from the toggle action.
   */
  toggleAdditinalField(event:any){
    if(event.checked === true){
      this.showToggleField = true;
    }else{
      this.showToggleField = false;
    }
  }
  /**
   * Handles value change for the additional execution name input.
   * @param event The event object from the input change.
   */
  valueChange(event:any):void{
    let val = event.target.value;
    this.additionalExeName = val;    
  }
  /**
   * Handles the selection of script type and updates the visibility and form controls accordingly.
   * 
   * @param type - The type of script to select. Can be either 'script' or 'testsuite'.
   * 
   * When 'script' is selected:
   * - Sets `testsuiteVisible` to false.
   * - Sets `scriptVisible` to true.
   * - Resets the `scriptTestsuite` form control.
   * - Calls `getScriptByCategory` with the current category name and Thunder enable status.
   * 
   * When 'testsuite' is selected:
   * - Sets `testsuiteVisible` to true.
   * - Sets `scriptVisible` to false.
   * - Resets the `scriptTestsuite` form control.
   * - Calls `getTestSuiteByCategory` with the current category name and Thunder enable status.
   */  
  selectScriptType(type: string):void{
    this.selectedType = type;
    this.scriptTestsuiteOptions = [];
    this.scriptNameArr =[];
    this.testSuiteNameArr =[];
    if (type === 'script') {
      this.testsuiteVisible = false;
      this.scriptVisible = true;
      this.executeForm.controls['scriptTestsuite'].setValue([]);
      this.scriptsLoaded = false;
      
    } else if (type === 'testsuite') {
      this.testsuiteVisible = true;
      this.scriptVisible = false;
      this.executeForm.controls['scriptTestsuite'].setValue([]);
      this.testSuitesLoaded = false;
    }
  }
  /**
   * Handles the change event for the Thunder checkbox.
   * 
   * This method updates the `isThunderEnable` property based on the checkbox state,
   * clears the `deviceList`, and fetches devices and scripts by category. It also
   * resets form controls and arrays related to devices, scripts, and test suites,
   * and triggers the deselect events for dropdowns.
   * 
   * @param event - The event object from the checkbox change event.
   */  
  isThunderCheck(event:any):void{
    this.isThunderEnable = event.target.checked;
    this.deviceList = [];
    this.deviceNameArr=[];
    this.scriptNameArr =[];
    this.testSuiteNameArr =[];
    this.scriptTestsuiteOptions = [];
    if(this.isThunderEnable){
      this.isThunderEnable = true;
      if(this.selectedType == 'script'){
        this.getScriptByCategory(this.categoryName,this.isThunderEnable);
      }else{
        this.getTestSuiteByCategory(this.categoryName,this.isThunderEnable);
      }
      this.getDeviceByCategory(this.categoryName,this.isThunderEnable);
      this.executeForm.controls['devicetype'].setValue([]);
      this.executeForm.controls['scriptTestsuite'].setValue([]);
      this.dropdownRef?.onDeSelectAll.emit([]);
      this.scriptRef?.onDeSelectAll.emit([]);
      this.testSuiteRef?.onDeSelectAll.emit([]);
    }else{
      this.isThunderEnable = false;
      this.getDeviceByCategory(this.categoryName,this.isThunderEnable);
      if(this.selectedType == 'script'){
        this.getScriptByCategory(this.categoryName,this.isThunderEnable);
      }else{
        this.getTestSuiteByCategory(this.categoryName,this.isThunderEnable);
      }
      this.executeForm.controls['devicetype'].setValue([]);
      this.executeForm.controls['scriptTestsuite'].setValue([]);
      this.dropdownRef?.onDeSelectAll.emit([]);
      this.scriptRef?.onDeSelectAll.emit([]);
      this.testSuiteRef?.onDeSelectAll.emit([]);
    }
  }

  /**
   * Handles the event when the Thunder button is toggled.
   * 
   * This method updates the `isThunderEnable` property based on the event's target checked state.
   * It then initializes several arrays and options related to devices, scripts, and test suites.
   * Depending on the state of `isThunderEnable`, it fetches devices and scripts by category
   * and resets the form controls for device type and script test suite.
   * 
   * @param event - The event object from the Thunder button toggle action.
   */  
  isThunderFromButton(event:any):void{
    this.isThunderEnable = event.target.checked;
    let thunderCheck = this.isThunderEnable?this.isThunderEnable:false;
    this.deviceNameArr=[];
    this.scriptNameArr =[];
    this.testSuiteNameArr =[];
    this.scriptTestsuiteOptions = [];
    if(thunderCheck){
      this.getDeviceByCategory(this.categoryName,thunderCheck);
      this.getScriptByCategory(this.categoryName,thunderCheck);
      this.executeForm.controls['devicetype'].setValue([]);
      this.executeForm.controls['scriptTestsuite'].setValue([]);

    }else{
      this.getDeviceByCategory(this.categoryName,thunderCheck);
      this.getScriptByCategory(this.categoryName,thunderCheck);
      this.executeForm.controls['devicetype'].setValue([]);
      this.executeForm.controls['scriptTestsuite'].setValue([]);
    }
 
  }
  /**
   * Retrieves a list of devices based on the specified category and thunder enable status.
   * 
   * @param category - The category of devices to retrieve.
   * @param isThunderEnable - A boolean indicating whether thunder is enabled.
   * @returns void
   */  
  getDeviceByCategory(category:string,isThunderEnable:boolean):void{
    this.executionservice.getDeviceByCategory(category,isThunderEnable).subscribe(res=>{
      this.deviceList = res.data;
    })
  }


    /**
     * Handles the click event for the script dropdown.
     * 
     * If the scripts have not been loaded yet, this method triggers loading of scripts
     * by category and thunder enablement status.
     *
     * @remarks
     * This method is typically called when the user interacts with the script dropdown UI element.
     */
    onScriptDropdownClick(): void {
    if (!this.scriptsLoaded) {
      this.getScriptByCategory(this.categoryName, this.isThunderEnable);
    }
    }


  /**
   * Handles the click event for the test suite dropdown.
   * 
   * If the test suites have not been loaded yet, this method triggers the loading
   * of test suites by category, optionally considering whether the "Thunder" feature is enabled.
   *
   * @remarks
   * This method is typically bound to the dropdown's click event in the template.
   */
  onTestSuiteDropdownClick(): void {
    if (!this.testSuitesLoaded) {
      this.getTestSuiteByCategory(this.categoryName, this.isThunderEnable);
    }
  }
  /**
   * Handles the selection of an item. If the item's device name is not already in the `deviceNameArr` array,
   * it adds the device name to the array. Then, it calls the `getExecutionName` method.
   *
   * @param item - The selected item containing a `deviceName` property.
   * @returns void
   */  
  onItemSelect(item:any):void{
    if (!this.deviceNameArr.some(selectedItem => selectedItem.deviceName === item.deviceName)) {
      this.deviceNameArr.push(item.deviceName);
    }
    this.getExecutionName();
  }
  /**
   * Handles the deselection of an item from the device list.
   * 
   * @param item - The item that was deselected. It is expected to have a `deviceName` property.
   * 
   * This method filters out the deselected item's device name from the `deviceNameArr` array
   * and then updates the array. After updating the array, it calls the `getExecutionName` method.
   */  
  onDeSelect(item:any):void{
    let filterDevice = this.deviceNameArr.filter(name => name != item.deviceName);
    this.deviceNameArr = filterDevice;
    this.getExecutionName();
  }
  /**
   * Selects all items that are not already selected and updates the deviceNameArr with their device names.
   * 
   * @param items - An array of items to be selected.
   * 
   * The method filters the deviceList to find items that are not already in the deviceNameArr.
   * It then maps the filtered items to their device names and assigns them to deviceNameArr.
   * Finally, it calls the getExecutionName method.
   */  
  onSelectAll(items: any[]):void{
   let devices = this.deviceList.filter(
    (item:any)=> !this.deviceNameArr.find((selected)=>selected.id === item.id)
   );
   this.deviceNameArr = devices.map((item:any)=>item.deviceName);
   this.getExecutionName();
  }
  /**
   * Deselects all items and clears the deviceNameArr array.
   *
   * @param item - The item to be deselected.
   * @returns void
   */  
  onDeSelectAll(item:any):void{
    this.deviceNameArr=[];
  }
   /**
   * Fetches the script by category and updates the script test suite options.
   *
   * @param {string} category - The category of the script to fetch.
   * @param {boolean} isThunderEnable - A flag indicating whether Thunder is enabled.
   * @returns {void}
   */  
   getScriptByCategory(category:string, isThunderEnable:boolean):void {
   this.scriptLoading = true;
   this.executionservice.getscriptByCategory(category, isThunderEnable).subscribe({
    next: (res) => {
      this.scriptTestsuiteOptions = res.data || []; // Use empty array if no data
      this.scriptLoading = false;
      this.scriptsLoaded = true;
    },
    error: (error) => {
      this.scriptLoading = false;
      this.scriptTestsuiteOptions = []; // Reset to empty array on error
      this._snakebar.open('Failed to load scripts', '', {
        duration: 2000,
        panelClass: ['err-msg'],
        verticalPosition: 'top',
      });
    }
   });
  }
  /**
   * Handles the selection of a script item. If the selected script is not already in the 
   * `scriptNameArr` array, it adds the script's name to the array.
   *
   * @param item - The selected script item containing a `scriptName` property.
   */  
  onScriptSelect(item:any):void{
    if (!this.scriptNameArr.some(selectedItem => selectedItem.scriptName === item.scriptName)) {
      this.scriptNameArr.push(item.scriptName);
    }
  }
  /**
   * Handles the deselection of a script item.
   * 
   * @param item - The script item that was deselected.
   * 
   * This method filters out the deselected script from the `scriptNameArr` array
   * and updates the array to exclude the deselected script.
   */  
  onScriptDeSelect(item:any):void{
    let filterDevice = this.scriptNameArr.filter(name => name != item.scriptName);
    this.scriptNameArr = filterDevice;
  }
  /**
   * Handles the selection of all scripts that are not already selected.
   * Filters the `scriptList` to find scripts that are not present in `scriptNameArr`
   * and updates `scriptNameArr` with the names of the newly selected scripts.
   *
   * @param items - An array of items to be processed (not used in the current implementation).
   */  
   onScriptSelectAll(items: any[]): void {
    this.scriptNameArr = items.map((item: any) => item.scriptName);
  }
  /**
   * Deselects all scripts by clearing the scriptNameArr array.
   *
   * @param item - The item that triggered the deselection. This parameter is currently not used in the function.
   * @returns void
   */  
  onScriptDeSelectAll(item:any):void{
    this.scriptNameArr=[];
  }
  /**
   * Fetches the test suite options based on the provided category and Thunder status.
   * 
   * @param category - The category for which the test suites are to be fetched.
   * @param isThunderEnable - A boolean indicating whether Thunder is enabled.
   * @returns void
   */  
  getTestSuiteByCategory(category:string, isThunderEnable:boolean):void {
  this.testSuiteLoading = true;
  this.executionservice.gettestSuiteByCategory(category, isThunderEnable).subscribe(res => {
    this.scriptTestsuiteOptions = res.data || []; // Use empty array if no data
    this.testSuiteLoading = false;
    this.testSuitesLoaded = true;
   }, error => {
    this.testSuiteLoading = false;
    this._snakebar.open('Failed to load test suites', '', {
      duration: 2000,
      panelClass: ['err-msg'],
      verticalPosition: 'top',
    });
   });
  }
  /**
   * Adds the given item to the testSuiteNameArr array if it does not already exist in the array.
   *
   * @param item - The item to be added to the testSuiteNameArr array. It is expected to have a property `testSuiteName`.
   * @returns void
   */  
  testSuiteSelect(item:any):void{
    if (!this.testSuiteNameArr.some(selectedItem => selectedItem.testSuiteName === item.testSuiteName)) {
      this.testSuiteNameArr.push(item.testSuiteName);
    }
  }
  /**
   * Deselects a test suite from the `testSuiteNameArr` array.
   * 
   * @param item - The item containing the `testSuiteName` to be deselected.
   */  
  testSuiteDeSelect(item:any):void{
    let filterDevice = this.testSuiteNameArr.filter(name => name != item.testSuiteName);
    this.testSuiteNameArr = filterDevice;
  }
  /**
   * Selects all test suites that are not already selected.
   * 
   * This method filters the `testSuiteList` to find test suites that are not 
   * present in the `testSuiteNameArr` and then maps the filtered test suites 
   * to their names, updating the `testSuiteNameArr`.
   * 
   * @param items - An array of items to be processed (not used in the current implementation).
   */  
  testSuiteSelectAll(items: any[]):void{
   let testSuites = this.scriptTestsuiteOptions.filter(
    (item:any)=> !this.testSuiteNameArr.find((selected)=>selected.id === item.id)
   );
   this.testSuiteNameArr = testSuites.map((item:any)=>item.testSuiteName)
  }
  /**
   * Deselects all items in the test suite.
   * 
   * @param item - The item to be deselected.
   * @returns void
   */  
  testSuiteDeSelectAll(item:any):void{
    this.testSuiteNameArr=[];
  }
  /**
   * Handles the change event for the test type selection.
   * Updates the test type name and triggers the execution name retrieval.
   *
   * @param event - The event object containing the new value of the test type.
   */  
  testTypeChange(event:any):void{
    let val = event.target.value;
    this.testTypeName = val;
    this.getExecutionName();
  }

  /**
   * Handles the selection of repeat type (full or individual).
   * @param event The event object from the radio button change.
   */
  fullOrIndividual(event:any):void{
    let val = event.target.value;
    if(val === 'full'){
      this.repeatTypeBoolean = false;
    }else{
      this.repeatTypeBoolean = true;
    }
  }
  /**
   * Retrieves the execution name based on the device names and test type from the form.
   * Constructs an object with the device names and test type, then calls the execution service
   * to get the execution name. The result is assigned to the `executionName` property.
   *
   * @returns {void}
   */  
  getExecutionName():void{
    let obj ={
      deviceNames: this.deviceNameArr,
      testType: this.executeForm.value.testType
    }
    this.executionservice.geExecutionName(obj).subscribe(res=>{
      this.executionName = res.data;
    })
  }
  /**
   * Handles the change event for the re-run checkbox.
   * 
   * @param event - The event object from the checkbox change.
   */  
  reRunChange(event:any):void{
    let val = event.target.checked;
    this.reRunFail = val;
  }
  /**
   * Handles the change event for the diagnosis checkbox.
   * 
   * @param event - The event object from the checkbox change.
   */  
  diagnosisChange(event:any):void{
    let val = event.target.checked;
    this.diagnosis = val;
  }
  /**
   * Handles the change event for performance checkbox.
   * 
   * @param event - The event object from the checkbox change.
   */  
  performanceChange(event:any):void{
    let val = event.target.checked;
    this.performance = val;
  }
  /**
   * Handles the change event for the log transfer checkbox.
   * Updates the `logTransfer` property based on the checkbox state.
   *
   * @param event - The event object from the checkbox change event.
   */  
  logTransferChange(event:any):void{
    let val = event.target.checked;
    this.logTransfer = val;
  }
  /**
   * Handles the change time event by stopping its propagation.
   *
   * @param event - The event object that triggered the change time action.
   */
  changeTime(event: any) :void{
    event.stopPropagation();
  }
  /**
   * Close the dialog
   */   
  close(): void {
    this.dialogRef.close(false);
  }
  /**
   * repeate type method
   */ 
  repeatType(val: any) :void{
    if (val === 'individualScripts') {
      this.executeForm.get('reruntimes')?.disable();
    } else {
      this.executeForm.get('reruntimes')?.enable();
    }
  }
  /**
   * Navigate to main page
   */ 
  back():void{
    this.showSchedule = false;
    this.showExecute = true;
  }

  /**
   * Schedule type method
   */ 
  scheduleOpen(val: any) :void{
    if (val === 'schedule') {
      this.showSchedule = true;
      this.showExecute = false;
      this.showLogs = false;
    } else {
      this.showSchedule = false;
      this.showExecute = true;
      this.showLogs = true;
    }
  }
  /**
   * Schedule type method
   */  
  scheduleType(event: any) :void{
    let type = event.target.value;
    if (type === 'ReccurenceSchedule') {
      this.reccurence = true;
      this.onetime = false;
    } else {
      this.reccurence = false;
      this.onetime = true;
    }
  }
  /**
   * Reccurence cron job method
   */  
  reccurenceChange(val: any):void{
    if (val === 'weekly') {
      this.dailyGroup = false;
      this.weeklyGroup = true;
      this.monthlyGroup = false;
    } else if (val === 'monthly') {
      this.dailyGroup = false;
      this.weeklyGroup = false;
      this.monthlyGroup = true;
    } else {
      this.dailyGroup = true;
      this.weeklyGroup = false;
      this.monthlyGroup = false;
    }
  }
  /**
   * Execution number method
   */
  onNumberChange(event: any): void {
    const value = Number(event.target.value);
    if (value < 1 || value > 10) {
      this.message = 'Please enter a value between 1 and 10';
    } else {
      this.message = '';
      this.defaultValue = value;
    }
  }
  /**
   * trigger execution cron job method.
   */
  triggerExecute() :void{
      this.showLoader = true;
      this.showLogs = false;
      let triggerObj={
        deviceList:this.deviceNameArr,
        scriptList:this.scriptNameArr,
        testSuite:this.testSuiteNameArr,
        testType:this.executeForm.value.testType,
        individualRepeatExecution: this.repeatTypeBoolean,
        user:this.loggedinUser.userName,
        category:this.userCategory,
        executionName:this.additionalExeName?this.additionalExeName:this.executionName,
        repeatCount:this.executeForm.value.executionnumber,
        deviceLogsNeeded: this.logTransfer,
        diagnosticLogsNeeded: this.diagnosis,
        performanceLogsNeeded: this.performance,
        rerunOnFailure:this.reRunFail
      }
      this.showLoader = true;
      this.executionservice.executioTrigger(triggerObj).subscribe({
        next:(res)=>{
          let status = res.data
          this.triggerExecuteDetails = status.executionTriggerStatus;
          this.triggerMessage = status.message;
        },
        error:(err)=>{          
          this.triggerMessage = err.message;
        }

      })
      setTimeout(() => {
        this.showLogs = true;
        this.showLoader = false;
      }, 1500);
    }

  /**
   * Handles the change event for selecting weekdays in recurrence schedule.
   * @param day The day of the week being toggled.
   * @param event The event object from the checkbox change.
   */
  onWeekDayChange(day: string, event: any): void {
    if (event.target.checked) {
      if (!this.selectedWeekDays.includes(day)) {
        this.selectedWeekDays.push(day);
      }
    } else {
      this.selectedWeekDays = this.selectedWeekDays.filter(d => d !== day);
    }
  }
  /**
   * schedule execution cron job method.
   */
  scheduleExecute():void{
    const selectedDate = this.executeForm.value.date;
    let selectedTime = this.executeForm.value.time;
    if (selectedDate && selectedTime) {
      const browserTimezone = moment.tz.guess(); 
      const formattedDate = moment(selectedDate).format('YYYY-MM-DD'); // Format the date to 'YYYY-MM-DD'
      const formattedTime = moment(selectedTime, 'HH:mm').format('HH:mm');
      const combinedDateTime = `${formattedDate} ${formattedTime}`;
      const localTime = moment.tz(combinedDateTime, 'YYYY-MM-DD HH:mm', browserTimezone);
      const utcTime = localTime.utc().format('YYYY-MM-DDTHH:mm:ss[Z]');
      this.utcTime = utcTime;
    } else {
    }

    let scheduleType = this.executeForm.value.scheduleType;
    if (scheduleType === 'ReccurenceSchedule') {
      scheduleType = 'REPEAT';
    } else if (scheduleType === 'OnetimeSchedule') {
      scheduleType = 'ONCE';
    }

    let crontype = '';
    let cronquery = '';
    let startUtcDateTime = '';
    let endUtcDateTime = '';
    // Map UI selection to corntype and cornquery
    if (scheduleType === 'REPEAT') {
      const startDate: Date = this.executeForm.value.startdate;
      const startTime: Date = this.executeForm.value.starttime;

      const endDate: Date = this.executeForm.value.enddate;
      const endTime: Date = this.executeForm.value.endtime;
      if (startDate && startTime) {
        const combinedStartDateTime = new Date(
          startDate.getFullYear(),
          startDate.getMonth(),
          startDate.getDate(),
          startTime.getHours(),
          startTime.getMinutes(),
          startTime.getSeconds()
        );
        startUtcDateTime = combinedStartDateTime.toISOString().replace('.000', '');
      }

      if (endDate && endTime) {
        const combinedEndDateTime = new Date(
          endDate.getFullYear(),
          endDate.getMonth(),
          endDate.getDate(),
          endTime.getHours(),
          endTime.getMinutes(),
          endTime.getSeconds()
        );
        endUtcDateTime = combinedEndDateTime.toISOString().replace('.000', '');
      }

      if (this.dailyGroup) {
  crontype = 'Daily';
  const dailyOption = this.executeForm.value.dailyOption;

  if (dailyOption === 'days') {
    const val = this.executeForm.value.dailyValue;
    cronquery = `every ${val} days`;
  } else if (dailyOption === 'weekdays') {
    cronquery = 'every week day';
  }
} else if (this.weeklyGroup) {
  crontype = 'Weekly';
  cronquery = this.selectedWeekDays.join(',');
} else if (this.monthlyGroup) {
  crontype = 'Monthly';
  const day = this.executeForm.value.monthlyDay;
  const every = this.executeForm.value.monthlyInterval;
  cronquery = `day ${day} of every ${every} month`;
}

    }
    let schedulerObj: any = {
      executionTime: this.utcTime, //reecerrence skip
      scheduleType: scheduleType,
      cronType: crontype,
      cronQuery: cronquery,
      cronStartTime: startUtcDateTime,
      cronEndTime: endUtcDateTime,

      executionTriggerDTO: {

        deviceList: this.deviceNameArr,
        scriptList: this.scriptNameArr,
        testSuite: this.testSuiteNameArr,
        testType: this.executeForm.value.testType,
        individualRepeatExecution: this.repeatTypeBoolean,
        user: this.loggedinUser.userName,
        category: this.userCategory,
        executionName: this.executionName,
        repeatCount: this.executeForm.value.executionnumber,
        deviceLogsNeeded: this.logTransfer,
        diagnosticLogsNeeded: this.diagnosis,
        performanceLogsNeeded: this.performance,
        rerunOnFailure: this.reRunFail
      }
    };

    this.executionservice.schedularExecution(schedulerObj).subscribe({
        next: (res) => {
            this._snakebar.open(res.message, '', {
                duration: 3000,
                panelClass: ['success-msg'],
                verticalPosition: 'top',
            });

            setTimeout(() => {
                this.close();
            }, 3000);
            this.executionservice.triggerRefreshScheduler(); 
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
  /**
   * Prevents non-numeric input in the execution number field.
   * 
   * @param event - The keyboard event triggered by the user.
   */
  preventNonNumeric(event: KeyboardEvent): void {
    if (
      event.key.length === 1 &&
      !/[0-9]/.test(event.key) &&
      event.key !== 'Backspace' &&
      event.key !== 'Tab'
    ) {
      event.preventDefault();
    }
  }


}
