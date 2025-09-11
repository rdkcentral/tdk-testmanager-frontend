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
import { ApplicationRef, ChangeDetectorRef, Component, Inject, NgZone } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../../material/material.module';
import { AnalysisService } from '../../../../services/analysis.service';
import { UsergroupService } from '../../../../services/usergroup.service';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';

@Component({
  selector: 'app-create-jira',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule,NgMultiSelectDropDownModule],
  templateUrl: './create-jira.component.html',
  styleUrl: './create-jira.component.css',
})
export class CreateJiraComponent {
  jiraSubmitted = false;
  jiraCreateForm!: FormGroup;
  loggedinUser: any;
  allProjectNames: any[] = [];
  allPriorites:any;
  allLabels:any;
  allReleaseVersion:any;
  allHardwares:any;
  allImpPlatforms:any;
  allFixVersion:any;
  allServerities:any;
  allCompImpacted:any;
  ticketDetailsOBJ:any;
  setReproduce:any;
  isPlatFormProject:any;
  showHardware = false;
  showCompImpacted = false;
  showReproduce = false;
  showFixVersion = false;
  showReleaseVersion = false;
  showEveSetup = false;
  /**
   * Constructor for CreateJiraComponent.
   * @param dialogRef Reference to the dialog opened.
   * @param data Data injected into the dialog.
   * @param analysiservice Service for analysis operations.
   * @param userservice Service for user group operations.
   * @param fb FormBuilder for reactive forms.
   * @param _snakebar MatSnackBar for notifications.
   * @param jiraCreateDialog MatDialog for opening dialogs.
   * @param cdRef ChangeDetectorRef for change detection.
   * @param appRef ApplicationRef for app-level operations.
   * @param ngZone NgZone for running code in Angular zone.
   */
  showdependency = false;
  showSeverites = false;
  showPlatform = false;
  showReproducibitity = false;
  showAdditionalFields = false;
  showTDKVersion = false;
  allRDKVersion:any;
  description:any;
  showRDKVersion=false;
  labelDropdownSettings = {};
  labelArr: any[] = []
  impactedPlatformsDropdownSettings={}
  platformArr: any[] = []
  componentsImpactedDropdownSettings={}
  impactedArr: any[] = []
  versionName!:string;

  /**
   * This method is used 
   * @param dialogRef Reference to the dialog opened.
   * @param data 
   * @param analysiservice 
   * @param userservice 
   * @param fb 
   * @param _snakebar 
   * @param jiraCreateDialog 
   * @param cdRef 
   * @param appRef 
   * @param ngZone 
   */
  /**
   * Constructor for CreateJiraComponent.
   * @param dialogRef Reference to the dialog opened.
   * @param data Data injected into the dialog.
   * @param analysiservice Service for analysis operations.
   * @param userservice Service for user group operations.
   * @param fb FormBuilder for reactive forms.
   * @param _snakebar MatSnackBar for notifications.
   * @param jiraCreateDialog MatDialog for opening dialogs.
   * @param cdRef ChangeDetectorRef for change detection.
   * @param appRef ApplicationRef for app-level operations.
   * @param ngZone NgZone for running code in Angular zone.
   */
  
  constructor(
    public dialogRef: MatDialogRef<CreateJiraComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private analysiservice: AnalysisService,
    private userservice: UsergroupService,
    private fb: FormBuilder,
    private _snakebar: MatSnackBar,
    public jiraCreateDialog: MatDialog,
    private cdRef: ChangeDetectorRef,
    private appRef: ApplicationRef,
    private ngZone: NgZone
  ) {
    this.loggedinUser = JSON.parse(
      localStorage.getItem('loggedinUser') || '{}'
    );
    console.log(data);
    
  }

  /**
   * Angular lifecycle hook called on component initialization.
   */
  
  ngOnInit(): void {
    this.formInitial();
    this.listProjectNAmes();
    this.listPriorities();
    this.ListLabels();
    this.releaseVersions();
    this.ticketDetails();
    this.getHardwareDetails();
    this.getImpPlatforms();
    this.getFixedVersions();
    this.getAllServerities();
    this.getAllCompImpacted();
    this.getSetpstoReproduce();
    this.getRdkVersions();
    this.getAppVersion();
    this.labelDropdownSettings = {
      singleSelection: false,
      idField: '',
      textField: '',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3,
      allowSearchFilter: false,
    };
    this.impactedPlatformsDropdownSettings = {
      singleSelection: false,
      idField: '',
      textField: '',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3,
      allowSearchFilter: false,
    };
    this.componentsImpactedDropdownSettings = {
      singleSelection: false,
      idField: '',
      textField: '',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3,
      allowSearchFilter: false,
    };
  }

  /**
   * Initializes the Jira creation form with default values and validators.
   */
  
  formInitial(){
    // if(this.ticketDetailsOBJ){
      this.jiraCreateForm = this.fb.group({
        projectname: ['' ,Validators.required],
        summary: ['',Validators.required],
        imageversion:['',Validators.required],
        description: ['',Validators.required],
        regression: ['',Validators.required],
        hardware: ['',Validators.required],
        impacted: ['',Validators.required],
        reproduce: ['',Validators.required],
        fixversion: ['',Validators.required],
        rdkversion: ['',Validators.required],
        exelogs: [''],
        devlogs: [''],
        issuetype: ['BUG' ,Validators.required],
        priority: ['',Validators.required],
        label: ['',Validators.required],
        releaseversion: ['',Validators.required],
        reproducibitity:['',Validators.required],
        setup: ['',Validators.required],
        dependency: [{value: 'YES', disabled: false},Validators.required],
        severities: ['',Validators.required],
        platforms: ['',Validators.required],
        user: ['',Validators.required],
        password: ['',Validators.required],
      });
    this.validationBasedonProject();

  }

  /**
   * Sets up validation rules based on the selected project.
   */
  
  validationBasedonProject(){
    this.jiraCreateForm.get('projectname')?.valueChanges.subscribe(value => {
      this.showAdditionalFields = value === 'false';

      if (this.showAdditionalFields) {
        this.addRequiredValidators();
      } else {
        this.removeAdditionalValidators();
      }

      this.jiraCreateForm.updateValueAndValidity();
    });
  }
  /**
   * Adds required validators to additional fields.
   */
  
  addRequiredValidators() {
    const additionalFields = [
      'hardware', 'impacted', 'reproduce', 'fixversion','rdkversion',
      'releaseversion', 'reproducibitity', 'setup',
      'dependency', 'severities', 'platforms', 
    ];

    additionalFields.forEach(field => {
      this.jiraCreateForm.get(field)?.addValidators(Validators.required);

      this.jiraCreateForm.get(field)?.updateValueAndValidity();
    });
  }
  /**
   * Removes validators from additional fields.
   */
  
  removeAdditionalValidators() {
    const additionalFields = [
      'hardware', 'impacted', 'reproduce', 'fixversion','rdkversion',
      'releaseversion', 'reproducibitity', 'setup',
      'dependency', 'severities', 'platforms', 
    ];
    additionalFields.forEach(field => {
      this.jiraCreateForm.get(field)?.clearValidators();
      this.jiraCreateForm.get(field)?.updateValueAndValidity();
    });
  }
  /**
   * Fetches the list of project names from the analysis service.
   */
  
  listProjectNAmes() {
    this.analysiservice.getProjectNames(this.data.category).subscribe((res) => {
      this.allProjectNames = res.data;
    });
  }

  /**
   * Fetches the list of priorities from the analysis service.
   */
  
  listPriorities(){
    this.analysiservice.getPriorities(this.data.category).subscribe((res) => {
      this.allPriorites = res.data;
    });
  /**
   * Fetches the list of hardware details from the analysis service.
   */
  }
  /**
   * Fetches the list of labels from the analysis service.
   */
  
  ListLabels(){
    this.analysiservice.listOfLabels(this.data.category).subscribe((res) => {
      this.allLabels = res.data
    });
  }
  /**
   * Fetches ticket details and patches the form with relevant data.
   */
  /**
   * Fetches the list of release versions from the analysis service.
   */
  
  releaseVersions(){
    this.analysiservice.getReleaseVersions(this.data.category).subscribe((res) => {
      this.allReleaseVersion = res.data;
    });
  }
  /**
   * Fetches the list of hardware details from the analysis service.
   */
  
  getHardwareDetails(){
    this.analysiservice.getHardware(this.data.category).subscribe((res) => {
      this.allHardwares = res.data;
    });
  }
  /**
   * Fetches ticket details and patches the form with relevant data.
   */
  
  ticketDetails(){
    this.analysiservice.ticketDetails(this.data.executionResultID).subscribe((res) => {
      let details = res.data
      console.log(details);
  /**
   * Fetches steps to reproduce from the analysis service and patches the form.
   */
      this.ticketDetailsOBJ = details;
      if(this.ticketDetailsOBJ){
        this.jiraCreateForm.patchValue({
          imageversion: this.ticketDetailsOBJ.imageVersion || '',
          description: this.ticketDetailsOBJ.description
        });
      }
    });
  }
  /**
   * Fetches the application version and patches the form.
   */
  /**
   * Fetches steps to reproduce from the analysis service and patches the form.
   */
  
  getSetpstoReproduce(){
    this.analysiservice.setpstoReproduce(this.data.name).subscribe((res) => {
      let reproduce = res;
      console.log(reproduce);

      this.setReproduce = reproduce;
      if(this.setReproduce){
        this.jiraCreateForm.patchValue({
          reproduce: this.setReproduce|| ''
        });
      }
  
    });
  }

   /**
   * Fetches the list of severities from the analysis service.
   */
  /**
   * Fetches the list of impacted platforms from the analysis service.
   */
  
  getImpPlatforms(){
    this.analysiservice.getImpactedPlatforms(this.data.category).subscribe((res) => {      
      this.allImpPlatforms = res.data;
 
    });
  }

  /**
   * Fetches the list of fixed versions from the analysis service.
   */
  /**
   * Fetches the list of fixed versions from the analysis service.
   */
  
  getFixedVersions(){
    this.analysiservice.getFixedInVersions(this.data.category).subscribe((res) => {
      this.allFixVersion = res.data;
    });
  }

  /**
   * Fetches the list of severities from the analysis service.
   */
  /**
   * Fetches the list of severities from the analysis service.
   */
  
  getAllServerities(){
    this.analysiservice.getSeverities(this.data.category).subscribe((res) => {
      this.allServerities = res.data
    });
  }
  /**
   * Fetches the application version and patches the form.
   */
  /**
   * Fetches the list of components impacted from the analysis service.
   */
  
  getAllCompImpacted(){
    this.analysiservice.getComponentsImpacted(this.data.category).subscribe((res) => {
    this.allCompImpacted = res.data;
     });
  }

  /**
   * Fetches the application version and patches the form.
   */
  /**
   * Fetches the list of RDK versions from the analysis service.
   */
  
  getRdkVersions(){
    this.analysiservice.getRDKVersions(this.data.category).subscribe((res) => {
      this.allRDKVersion = res.data;
    });
  }

  /**
   * This method fetches the application version and patches the form.
   * @param event Event triggered when the user selects a project.
   */
  /**
   * Handles project change event and updates form validation and visibility of fields.
   * @param event Event triggered when the user selects a project.
   */
  
  onProjectChange(event:any){
    let name = event.target.value;
    console.log(name);
    this.jiraCreateForm.controls['priority'].setValidators([Validators.required]);
    this.jiraCreateForm.controls['user'].setValidators([Validators.required]);
    this.jiraCreateForm.controls['password'].setValidators([Validators.required]);
    this.analysiservice.isPlatform(name ,this.data.category).subscribe(res=>{
      this.isPlatFormProject = res.data;
      this.ngZone.run(() => {
        this.cdRef.detectChanges();
    });
    if(this.isPlatFormProject === "RDKPREINTG"){
        this.showHardware = false;
        this.showCompImpacted = false;
        this.showReproduce = false;
        this.showFixVersion = false;
        this.showReleaseVersion = false;
        this.showEveSetup = false;
        this.showdependency = false;
        this.showSeverites = false;
        this.showPlatform = false;
        this.showReproducibitity = false;
        this.showTDKVersion = false;
        this.showRDKVersion=false;
      }else if(this.isPlatFormProject === "TDK"){
        this.showHardware = false;
        this.showCompImpacted = false;
        this.showReproduce = false;
        this.showFixVersion = false;
        this.showReleaseVersion = false;
        this.showEveSetup = false;
        this.showdependency = false;
        this.showSeverites = false;
        this.showPlatform = false;
        this.showReproducibitity = false;
        this.showTDKVersion = false;
        this.showRDKVersion=true;
         if (this.showRDKVersion) {
          this.jiraCreateForm.controls['rdkversion'].setValidators([Validators.required]);
        } else {
          this.jiraCreateForm.controls['rdkversion'].clearValidators();
          this.jiraCreateForm.controls['rdkversion'].setValue('');
        }
        this.jiraCreateForm.controls['rdkversion'].updateValueAndValidity();

      }
      else if(this.isPlatFormProject === "PLATFORM"){
        this.showHardware = true;
        this.showCompImpacted = true;
        this.showReproduce = true;
        this.showFixVersion = true;
        this.showReleaseVersion = true;
        this.showEveSetup = true;
        this.showdependency = true;
        this.showSeverites = true;
        this.showPlatform = true;
        this.showReproducibitity = true;
        this.showTDKVersion = true;
        this.showRDKVersion=false;

        if (this.showReproducibitity) {
          this.jiraCreateForm.controls['reproducibitity'].setValidators([Validators.required]);
        } else {
          this.jiraCreateForm.controls['reproducibitity'].clearValidators();
          this.jiraCreateForm.controls['reproducibitity'].setValue('');
        }
        if (this.showPlatform) {
          this.jiraCreateForm.controls['platforms'].setValidators([Validators.required]);
        } else {
          this.jiraCreateForm.controls['platforms'].clearValidators();
          this.jiraCreateForm.controls['platforms'].setValue('');
        }
        if (this.showSeverites) {
          this.jiraCreateForm.controls['severities'].setValidators([Validators.required]);
        } else {
          this.jiraCreateForm.controls['severities'].clearValidators();
          this.jiraCreateForm.controls['severities'].setValue('');
        }
        if (this.showdependency) {
          this.jiraCreateForm.controls['dependency'].setValidators([Validators.required]);
        } else {
          this.jiraCreateForm.controls['dependency'].clearValidators();
          this.jiraCreateForm.controls['dependency'].setValue('');
        }
        if (this.showEveSetup) {
          this.jiraCreateForm.controls['setup'].setValidators([Validators.required]);
        } else {
          this.jiraCreateForm.controls['setup'].clearValidators();
          this.jiraCreateForm.controls['setup'].setValue('');
        }
        if (this.showReleaseVersion) {
          this.jiraCreateForm.controls['releaseversion'].setValidators([Validators.required]);
        } else {
          this.jiraCreateForm.controls['releaseversion'].clearValidators();
          this.jiraCreateForm.controls['releaseversion'].setValue('');
        }
        if (this.showFixVersion) {
          this.jiraCreateForm.controls['fixversion'].setValidators([Validators.required]);
        } else {
          this.jiraCreateForm.controls['fixversion'].clearValidators();
          this.jiraCreateForm.controls['fixversion'].setValue('');
        }
        if (this.showReproduce) {
          this.jiraCreateForm.controls['reproduce'].setValidators([Validators.required]);
        } else {
          this.jiraCreateForm.controls['reproduce'].clearValidators();
          this.jiraCreateForm.controls['reproduce'].setValue('');
        }
        if (this.showCompImpacted) {
          this.jiraCreateForm.controls['impacted'].setValidators([Validators.required]);
        } else {
          this.jiraCreateForm.controls['impacted'].clearValidators();
          this.jiraCreateForm.controls['impacted'].setValue('');
        }
        if (this.showHardware) {
          this.jiraCreateForm.controls['hardware'].setValidators([Validators.required]);
        } 
        else {
          this.jiraCreateForm.controls['hardware'].clearValidators();
          this.jiraCreateForm.controls['hardware'].setValue('');
        }


        this.jiraCreateForm.controls['reproducibitity'].updateValueAndValidity();
        this.jiraCreateForm.controls['platforms'].updateValueAndValidity();
        this.jiraCreateForm.controls['severities'].updateValueAndValidity();
        this.jiraCreateForm.controls['dependency'].updateValueAndValidity();
        this.jiraCreateForm.controls['setup'].updateValueAndValidity();
        this.jiraCreateForm.controls['hardware'].updateValueAndValidity();
        this.jiraCreateForm.controls['impacted'].updateValueAndValidity();
        this.jiraCreateForm.controls['fixversion'].updateValueAndValidity();
        this.jiraCreateForm.controls['releaseversion'].updateValueAndValidity();
      }
    })

  }

  /**
   * this method is called when the user submits the Jira form.
   * @returns 
   */
  /**
   * Handles Jira form submission, validates the form, and sends data to the backend.
   */
  
  onJiraSubmit() {
    let jiraDescription = this.jiraCreateForm.value.description;
    if(this.jiraCreateForm.value.regression == "YES"){
      jiraDescription = jiraDescription + "\n\n" + "*Regression* : " + this.jiraCreateForm.value.regression;
    }else if(this.jiraCreateForm.value.regression == "NO"){
      jiraDescription = jiraDescription + "\n\n" + "*Regression* : " + this.jiraCreateForm.value.regression;
    }
    this.jiraSubmitted = true;
    if (this.jiraCreateForm.invalid) {
      this.jiraCreateForm.markAllAsTouched();
      return ;
    } else {
      if(this.isPlatFormProject == "RDKPREINTG"){
        let createObj = {
          "executionResultId": this.data.executionResultID,
          "projectName": this.jiraCreateForm.value.projectname,
          "issueSummary": this.jiraCreateForm.value.summary,
          "imageVersion":this.jiraCreateForm.value.imageversion,
          "issueDescription": jiraDescription,
          "issueType": this.jiraCreateForm.value.issuetype,
          "priority": this.jiraCreateForm.value.priority,
          "label": this.labelArr,
          "user": this.jiraCreateForm.value.user,
          "password": this.jiraCreateForm.value.password,
          "deviceLogRequired": this.jiraCreateForm.value.devlogs,
          "executionLogRequired": this.jiraCreateForm.value.exelogs,
          "analysisUser": this.loggedinUser.username,
          "category": this.data.category
        }
        this.analysiservice.createJira(createObj).subscribe({
          next:(res)=>{
            this._snakebar.open(res.data, '', {
              duration: 3000,
              panelClass: ['success-msg'],
              verticalPosition: 'top'
            })
            setTimeout(() => {
            this.close();
            }, 2000);
          },
          error: (err) => {
      
              this._snakebar.open(err.message, '', {
                duration: 5000,
                panelClass: ['err-msg'],
                horizontalPosition: 'end',
                verticalPosition: 'top'
              });
            
          }
        })
     }else if(this.isPlatFormProject == "TDK") {
         let createObj = {
          "executionResultId": this.data.executionResultID,
          "projectName": this.jiraCreateForm.value.projectname,
          "issueSummary": this.jiraCreateForm.value.summary,
          "imageVersion":this.jiraCreateForm.value.imageversion,
          "issueDescription": jiraDescription,
          "issueType": this.jiraCreateForm.value.issuetype,
          "priority": this.jiraCreateForm.value.priority,
          "label": this.labelArr,
          "rdkVersion": this.jiraCreateForm.value.rdkversion,
          "user": this.jiraCreateForm.value.user,
          "password": this.jiraCreateForm.value.password,
          "deviceLogRequired": this.jiraCreateForm.value.devlogs,
          "executionLogRequired": this.jiraCreateForm.value.exelogs,
          "analysisUser": this.loggedinUser.username,
          "category": this.data.category
        }
        this.analysiservice.createJira(createObj).subscribe({
          next:(res)=>{
            this._snakebar.open(res.data, '', {
              duration: 3000,
              panelClass: ['success-msg'],
              verticalPosition: 'top'
            })
            setTimeout(() => {
            this.close();
            }, 2000);
          },
          error: (err) => {
      
              this._snakebar.open(err.message, '', {
                duration: 5000,
                panelClass: ['err-msg'],
                horizontalPosition: 'end',
                verticalPosition: 'top'
              });
            
          }
        })

      }else if(this.isPlatFormProject == "PLATFORM"){
        let createObj = {
          "executionResultId": this.data.executionResultID,
          "projectName": this.jiraCreateForm.value.projectname,
          "issueSummary": this.jiraCreateForm.value.summary,
          "issueDescription": jiraDescription,
          "issueType": this.jiraCreateForm.value.issuetype,
          "priority": this.jiraCreateForm.value.priority,
          "label": this.labelArr,
          "releaseVersion": this.jiraCreateForm.value.releaseversion,
          "hardwareConfig": this.jiraCreateForm.value.hardware,
          "impactedPlatforms": this.platformArr,
          "environmentForTestSetup": this.jiraCreateForm.value.setup,
          "reproducability":this.jiraCreateForm.value.reproducibitity,
          "stepsToReproduce": this.jiraCreateForm.value.reproduce,
          "componentsImpacted": this.impactedArr,
          "fixedInVersion": this.jiraCreateForm.value.fixversion,
          "thirdPartyDependency": this.jiraCreateForm.value.dependency,
          "severity": this.jiraCreateForm.value.severities,
          "tdkVersion": this.versionName,
          "user": this.jiraCreateForm.value.user,
          "password": this.jiraCreateForm.value.password,
          "deviceLogRequired": this.jiraCreateForm.value.devlogs,
          "executionLogRequired": this.jiraCreateForm.value.exelogs,
          "analysisUser": this.loggedinUser.username,
          "category": this.data.category
        }
        this.analysiservice.createJira(createObj).subscribe({
          next:(res)=>{
            this._snakebar.open(res.data, '', {
              duration: 3000,
              panelClass: ['success-msg'],
              verticalPosition: 'top'
            })
            setTimeout(() => {
            this.close();
            }, 2000);
          },
          error: (err) => {
        
              this._snakebar.open(err.message, '', {
                duration: 5000,
                panelClass: ['err-msg'],
                horizontalPosition: 'end',
                verticalPosition: 'top'
              });

          }
        })
      }
    }
  }
  /**
   * Handles deselection of a label item.
   * @param item The deselected label item.
   */

  /**
   * Handles selection of a label item.
   * @param item The selected label item.
   */
  
  onItemSelect(item: any): void {
  if (!this.labelArr.includes(item)) {
    this.labelArr.push(item);
  }
}

/**
   * Handles deselection of all label items.
   * @param items The array of all label items.
   */
  /**
   * Handles deselection of a label item.
   * @param item The deselected label item.
   */
  
  onDeSelect(item: any): void {
  this.labelArr = this.labelArr.filter(name => name !== item);
}

  /**
   * Handles selection of all label items.
   * @param items The array of all label items.
   */
  
  onSelectAll(items: any[]): void {
  /**
   * Handles selection of an impacted component item.
   * @param item The selected impacted component item.
   */
  this.labelArr = [...items];
}

  /**
   * Handles deselection of all label items.
   * @param items The array of all label items.
   */
  
  onDeSelectAll(items: any[]): void {
  this.labelArr = [];
}
  /**
   * Handles deselection of an impacted component item.
   * @param item The deselected impacted component item.
   */


  /**
   * Handles selection of an impacted component item.
   * @param item The selected impacted component item.
   */
  
  onImpactedSelect(item: any): void {
  if (!this.impactedArr.includes(item)) {
  /**
   * Handles selection of all impacted component items.
   * @param items The array of all impacted component items.
   */
    this.impactedArr.push(item);
  }
}

  /**
   * Handles deselection of all impacted component items.
   * @param items The array of all impacted component items.
   */
  /**
   * Handles deselection of an impacted component item.
   * @param item The deselected impacted component item.
   */
  
  onImpactedDeSelect(item: any): void {
  this.impactedArr = this.impactedArr.filter(name => name !== item);
}

  /**
   * Handles selection of an impacted platform item.
   * @param item The selected impacted platform item.
   */
  /**
   * Handles selection of all impacted component items.
   * @param items The array of all impacted component items.
   */
  
  onImpactedSelectAll(items: any[]): void {
  this.impactedArr = [...items];
}

/**
   * Handles deselection of an impacted platform item.
   * @param item The deselected impacted platform item.
   */
  /**
   * Handles deselection of all impacted component items.
   * @param items The array of all impacted component items.
   */
  
  onImpactedDeSelectAll(items: any[]): void {
  this.impactedArr = [];
  
}


/**
   * Handles selection of all impacted platform items.
   * @param items The array of all impacted platform items.
   */
  /**
   * Handles selection of an impacted platform item.
   * @param item The selected impacted platform item.
   */
  
  onPlatformSelect(item: any): void {
  
  if (!this.platformArr.includes(item)) {
    this.platformArr.push(item);
  }
}
  /**
   * Handles deselection of all impacted platform items.
   * @param items The array of all impacted platform items.
   */

  /**
   * Handles deselection of an impacted platform item.
   * @param item The deselected impacted platform item.
   */
  
  onPlatformDeSelect(item: any): void {
  this.platformArr = this.platformArr.filter(name => name !== item);
}

  /**
   * Handles selection of all impacted platform items.
   * @param items The array of all impacted platform items.
   */
  
  onPlatformSelectAll(items: any[]): void {
  this.platformArr = [...items];
}

/**
 * 
 * @param items The array of all impacted platform items.
 */
  /**
   * Handles deselection of all impacted platform items.
   * @param items The array of all impacted platform items.
   */
  
  onPlatformDeSelectAll(items: any[]): void {
  this.platformArr = [];
}
  /**
   * This method is for getting the version name.
   */
  /**
   * Fetches the application version and sets the versionName property.
   */
  
  getAppVersion():void{
    this.userservice.appVersion().subscribe({      
      next:(res)=>{
        this.versionName = res.data;        
      },
      error:(err)=>{        
         this.versionName = "";
      }
    })
  }

  /**
   * Closes the dialog.
   */
  /**
   * Closes the dialog.
   */
  
  close(): void {
    this.dialogRef.close(false);
  }
}
