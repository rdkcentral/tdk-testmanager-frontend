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
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MaterialModule } from '../../../material/material.module';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DeviceService } from '../../../services/device.service';
import { InputComponent } from '../../../utility/component/ag-grid-buttons/input/input.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { saveAs } from 'file-saver';
import { OemService } from '../../../services/oem.service';
import { DevicetypeService } from '../../../services/devicetype.service';
import { SocService } from '../../../services/soc.service';
import { AuthService } from '../../../auth/auth.service';
import { MonacoEditorModule } from '@materia-ui/ngx-monaco-editor';

@Component({
  selector: 'app-device-create',
  standalone: true,
  imports: [CommonModule,ReactiveFormsModule,MaterialModule,MonacoEditorModule, FormsModule],
  templateUrl: './device-create.component.html',
  styleUrl: './device-create.component.css',
})
export class DeviceCreateComponent implements OnInit {
  @ViewChild('dialogTemplate', { static: true }) dialogTemplate!: TemplateRef<any>;
  @ViewChild('newDeviceTemplate', { static: true }) newDeviceTemplate!: TemplateRef<any>;
  deviceForm!: FormGroup;
  rdkBForm!: FormGroup;
  deviceFormSubmitted = false;
  rdkbFormSubmitted = false;
  rdkcFormSubmitted = false;
  showPortFile = false;
  showConfigPort = false;
  showConfigPortB = false;
  allDeviceType: any;
  alloem: any;
  allsoc: any;
  rowData: any = [];
  public themeClass: string = "ag-theme-quartz";
  public paginationPageSize = 5;
  public paginationPageSizeSelector: number[] | boolean = [5, 10, 50, 100];
  gridApi!: any;
  showHideCreateFormV = true;
  showHideCreateFormB = false;
  rowHeight = 41;
  configureName!: string;
  isGateway!: any;
  isrecorderId = false;
  isThunderchecked = false;
  public frameworkComponents: any;
  visibleGateway = true;
  streamingMapObj!: { streamId: any; ocapId: any; }[];
  loggedinUser: any;
  agentport = "8087";
  agentStatusPort = "8088";
  agentMonitoPort = "8090";
  selectedDeviceCategory!: string;
  categoryName: string = 'Video';
  checkOcapId: any;
  uploadConfigForm!: FormGroup;
  uploadDeviceConfigForm!: FormGroup;
  uploadFormSubmitted = false;
  isEditingFile = false;
  configData: any;
  configFileName!: string;
  stbNameChange: any;
  filesList: any[] = [];
  deviceTypeValue: any;
  visibleDeviceconfigFile = false;
  deviceEditor = true;
  uploadConfigSec = false;
  backToEditorbtn = false;
  showUploadButton = true;
  uploadCreateHeading: string = 'Create New Device Config File';
  uploadFileName!: File;
  configDevicePorts = false;
  configuredevicePortB = false;
  submitted = false;
  existConfigSubmitted = false;
  uploadFileContent!: string;
  uploadExistFileContent!: string;
  uploadFileNameConfig!: string;
  fileNameArray: string[] = [];
  currentIndex: number = 0;
  newFileName!: string;
  existingConfigEditor = true;
  uploadExistingConfig = false;
  showExistUploadButton = true;
  backToExistEditorbtn = false;
  uploadExistConfigHeading!: string;
  dialogRef!: MatDialogRef<any>;
  newDeviceDialogRef!: MatDialogRef<any>;
  isThunderPresent = false;
  preferedCategory!: string;
  editorOptions = { 
    theme: 'vs-light', 
    language: 'ini',
    automaticLayout: true, // Add this line
    scrollBeyondLastLine: false, // Add this line
    minimap: { enabled: false } // Add this line for better experience in dialogs
  };
  editorInitialized = false;
  monacoEditorInstance: any;
  dialogOpened = false;


  /**
   * Constructor for DeviceCreateComponent.
   * @param router - Angular Router for navigation
   * @param fb - FormBuilder for reactive forms
   * @param authservice - AuthService for authentication
   * @param _snakebar - MatSnackBar for notifications
   * @param oemService - OemService for OEM operations
   * @param service - DeviceService for device operations
   * @param socService - SocService for SOC operations
   * @param deviceTypeService - DevicetypeService for device type operations
   * @param dialog - MatDialog for dialogs
   */
  constructor( private router: Router,private fb:FormBuilder,private authservice: AuthService,
    private _snakebar :MatSnackBar, private oemService:OemService, 
    private service:DeviceService, private socService:SocService, private deviceTypeService:DevicetypeService,
    public dialog: MatDialog
  ) {
    this.loggedinUser = JSON.parse(localStorage.getItem('loggedinUser')|| '{}');
    this.frameworkComponents = {
      inputCellRenderer: InputComponent
    }
    this.preferedCategory = localStorage.getItem('preferedCategory') || '';
  }

  /**
   * The method to initialize the component.
   */
  /**
   * Angular lifecycle hook - called on component initialization.
   * No parameters.
   */
  ngOnInit(): void {
    this.configureName = this.authservice.selectedConfigVal;
    this.selectedDeviceCategory = this.configureName;
    if (this.configureName === 'RDKB') {
      this.categoryName = 'Broadband';
      this.showHideCreateFormV = false;
      this.showHideCreateFormB = true;
    } else {
      this.categoryName = 'Video';
      this.showHideCreateFormV = true;
      this.showHideCreateFormB = false;
    }
    let ipregexp: RegExp =
      /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/; // IPv4 regex
    let ipv6regexp: RegExp = /^[0-9a-fA-F:]+$/; // IPv6 regex
    let combinedIpRegexp: RegExp = new RegExp(`(${ipregexp.source})|(${ipv6regexp.source})`); // Combined regex for IPv4 and IPv6
    let macregexp: RegExp = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/; // MAC address regex

    this.deviceForm = new FormGroup({
      devicename: new FormControl<string | null>('', {
        validators: [
          Validators.required,
          Validators.pattern(/^[a-zA-Z0-9_]+$/),
        ],
      }),           
      deviceip: new FormControl<string | null>('', {
        validators: [Validators.required, Validators.pattern(combinedIpRegexp)],
      }),
      macaddr: new FormControl<string | null>('', {
        validators: [Validators.required, Validators.pattern(macregexp)],
      }),
      devicetype: new FormControl<string | null>('', {
        validators: Validators.required,
      }),
      oem: new FormControl<string | null>(''),
      soc: new FormControl<string | null>(''),
      streamingTemp: new FormControl<string | null>(''),
      thunderport: new FormControl<string | null>(''),
      isThunder: new FormControl<boolean | null>({
        value: false,
        disabled: false,
      }),
      configuredevicePorts: new FormControl<boolean | null>(false),
      agentport: new FormControl<string | null>(this.agentport),
      agentstatusport: new FormControl<string | null>(this.agentStatusPort),
      agentmonitorport: new FormControl<string | null>(this.agentMonitoPort),
    });
    this.rdkBForm = new FormGroup({
      gatewayName: new FormControl<string | null>('', {
        validators: [
          Validators.required,
          Validators.pattern(/^[a-zA-Z0-9_]+$/),
        ],
      }),
      gatewayIp: new FormControl<string | null>('', {
        validators: [Validators.required, Validators.pattern(ipregexp)],
      }),
      macaddr: new FormControl<string | null>('', {
        validators: [Validators.required, Validators.pattern(macregexp)],
      }),
      devicetype: new FormControl<string | null>('', {
        validators: Validators.required,
      }),
      oem: new FormControl<string | null>(''),
      soc: new FormControl<string | null>(''),
      agentPortb: new FormControl<string | null>(''),
      agentStatusportB: new FormControl<string | null>(''),
      agentMonitorportB: new FormControl<string | null>(''),
      configuredevicePortB: new FormControl<boolean | null>(false),
    });
    this.getAlldeviceType();
    this.getAllOem();
    this.getAllsoc();
    this.uploadConfigForm = this.fb.group({
      editorFilename: ['', { disabled: true }],
      editorContent: ['', [Validators.required]],
      uploadFileModal: ['',Validators.required],
    });
    this.filesList = [];
    this.uploadDeviceConfigForm = this.fb.group({
      editorFilename: ['', { disabled: true }],
      editorContent: ['', [Validators.required]],
      uploadConfigFileModal: ['',Validators.required],
    });
    this.deviceForm.get('thunderport')?.valueChanges.subscribe((value) => {
      const cleanedValue = value.replace(/^\s+|[^0-9]/g, '');
      if (cleanedValue !== value) {
        this.deviceForm.get('thunderport')?.setValue(cleanedValue, {
          emitEvent: false,
        });
      }
    });
    this.deviceForm.get('agentport')?.valueChanges.subscribe((value) => {
      const cleanedValue = value.replace(/^\s+|[^0-9]/g, '');
      if (cleanedValue !== value) {
        this.deviceForm.get('agentport')?.setValue(cleanedValue, {
          emitEvent: false,
        });
      }
    });
    this.deviceForm.get('agentstatusport')?.valueChanges.subscribe((value) => {
      const cleanedValue = value.replace(/^\s+|[^0-9]/g, '');
      if (cleanedValue !== value) {
        this.deviceForm.get('agentstatusport')?.setValue(cleanedValue, {
          emitEvent: false,
        });
      }
    });
    this.deviceForm.get('agentmonitorport')?.valueChanges.subscribe((value) => {
      const cleanedValue = value.replace(/^\s+|[^0-9]/g, '');
      if (cleanedValue !== value) {
        this.deviceForm.get('agentmonitorport')?.setValue(cleanedValue, {
          emitEvent: false,
        });
      }
    });
    this.rdkBForm.get('agentPortb')?.valueChanges.subscribe((value) => {
      const cleanedValue = value.replace(/^\s+|[^0-9]/g, '');
      if (cleanedValue !== value) {
        this.rdkBForm.get('agentPortb')?.setValue(cleanedValue, {
          emitEvent: false,
        });
      }
    });
    this.rdkBForm.get('agentStatusportB')?.valueChanges.subscribe((value) => {
      const cleanedValue = value.replace(/^\s+|[^0-9]/g, '');
      if (cleanedValue !== value) {
        this.rdkBForm.get('agentStatusportB')?.setValue(cleanedValue, {
          emitEvent: false,
        });
      }
    });
    this.rdkBForm.get('agentMonitorportB')?.valueChanges.subscribe((value) => {
      const cleanedValue = value.replace(/^\s+|[^0-9]/g, '');
      if (cleanedValue !== value) {
        this.rdkBForm.get('agentMonitorportB')?.setValue(cleanedValue, {
          emitEvent: false,
        });
      }
    });

    this.deviceForm.get('devicename')?.valueChanges.subscribe((value) => {
      if (value) {
        this.deviceForm.get('devicename')?.setValue(value.toUpperCase());
      }
    });
    this.rdkBForm.get('gatewayName')?.valueChanges.subscribe((value) => {
      if (value) {
        this.rdkBForm.get('gatewayName')?.setValue(value.toUpperCase());
      }
    });
      this.uploadDeviceConfigForm.get('editorContent')?.setValidators([Validators.required]);
      this.uploadDeviceConfigForm.get('uploadConfigFileModal')?.clearValidators();
      this.uploadDeviceConfigForm.get('editorContent')?.updateValueAndValidity();
      this.uploadDeviceConfigForm.get('uploadConfigFileModal')?.updateValueAndValidity();

      this.uploadConfigForm.get('editorContent')?.setValidators([Validators.required]);
      this.uploadConfigForm.get('uploadFileModal')?.clearValidators();
      this.uploadConfigForm.get('editorContent')?.updateValueAndValidity();
      this.uploadConfigForm.get('uploadFileModal')?.updateValueAndValidity();

  }

  /**
   * Initializes the Monaco editor instance when the editor is ready.
   * 
   * This method sets the `monacoEditorInstance` property, marks the editor as initialized,
   * and schedules a layout and focus operation after a short delay to ensure the editor
   * is properly rendered and ready for user interaction.
   *
   * @param editor - The Monaco editor instance that has been initialized.
   */
  onEditorInit(editor: any) {
    this.monacoEditorInstance = editor;
    this.editorInitialized = true;
    
    // Give editor time to render and then layout
    setTimeout(() => {
      if (this.monacoEditorInstance) {
        this.monacoEditorInstance.layout();
        this.monacoEditorInstance.focus();
      }
    }, 100);
  }

  /**
   * Resizes the Monaco editor instance by triggering its layout method.
   * This is typically called after UI changes (such as dialog animations)
   * to ensure the editor is properly rendered within its container.
   * The resize is delayed by 300ms to allow animations to complete.
   *
   * @remarks
   * This method checks if the Monaco editor instance exists before attempting to resize.
   */
   resizeEditor() {
    if (this.monacoEditorInstance) {
      // Force resize after dialog animation completes
      setTimeout(() => {
        this.monacoEditorInstance.layout();
      }, 300);
    }
  }


  /**
   * Event handler for when the grid is ready.
   * @param params The grid ready event parameters.
   */
  /**
   * Event handler for when the grid is ready.
   * @param params - The grid ready event parameters.
   */
  onGridReady(params: any): void {

    this.gridApi = params.api;
  }
  /**
   * list of all boxtype.
   */
  /**
   * Gets all device types by selected category.
   * No parameters.
   */
  getAlldeviceType(): void {

    this.deviceTypeService.getfindallbycategory(this.selectedDeviceCategory).subscribe(res=>{
      this.allDeviceType = res.data
    })
  }
  /**
   * list of all boxmanufacturer.
   */
  /**
   * Gets all OEMs by selected category.
   * No parameters.
   */
  getAllOem(): void {

    this.oemService.getOemByList(this.selectedDeviceCategory).subscribe(res=>{
        this.alloem = res.data;
    })
  }
  /**
   * list of all socVendors.
   */
  /**
   * Gets all SOC vendors by selected category.
   * No parameters.
   */
  getAllsoc(): void {

    this.socService.getSoc(this.selectedDeviceCategory).subscribe(res=>{
      this.allsoc = res.data;
    })
  }
  /**
   * This methos is change the value of stbname inputfield
   */
  /**
   * Handles value change for stbname input field.
   * @param event - Input event
   */
  valuechange(event: any): void {

    this.visibilityConfigFile();
    this.stbNameChange = event.target.value;
    if (this.isThunderchecked) {
      this.showPortFile = true;
      if (this.stbNameChange === undefined || this.stbNameChange) {
        this.visibilityConfigFile();
      }
      if (this.stbNameChange !== undefined && this.stbNameChange !== '') {
        this.visibleDeviceconfigFile = true;
      }
    }
  }

  /**
   * This methos is change the devicetype
   */
  /**
   * Handles device type change event.
   * @param event - Input event
   */
  devicetypeChange(event: any): void {

    this.visibleDeviceconfigFile = false;
    let value = event.target.value;
    this.deviceTypeValue = value;
    this.visibilityConfigFile();
  }
  /**
   * Isthunder is checked or unchecked
   */
  /**
   * Handles Thunder checkbox change event.
   * @param event - Input event
   */
  thunderChecked(event: any): void {

    this.isThunderPresent = event.target.checked;
    this.isThunderchecked = event.target.checked;
    if (this.isThunderchecked) {
      this.isThunderPresent = true;
      this.showPortFile = true;
      this.deviceForm.get('thunderport')?.setValidators([Validators.required]);
      this.deviceForm.get('thunderport')?.updateValueAndValidity();
    } else {
      this.showPortFile = false;
      this.isThunderPresent = false;
      this.deviceForm.get('thunderport')?.clearValidators();
      this.deviceForm.get('thunderport')?.updateValueAndValidity();
    }
    this.visibilityConfigFile();
  }

  /**
   * Show the Config file or device.config file beased on stbname and boxtype
   */
  /**
   * Shows the config file or device.config file based on stbname and boxtype.
   * No parameters.
   */
  visibilityConfigFile(): void {

    let boxNameConfig = this.deviceForm.value.devicename;
    let deviceTypeConfig = this.deviceForm.value.devicetype;
    this.service.downloadDeviceConfigFile(boxNameConfig,deviceTypeConfig,this.isThunderPresent)
      .subscribe({
        next: (res) => {
          this.configFileName = res.filename;
      if(this.configFileName !== `${boxNameConfig}.config` && this.stbNameChange !== undefined && this.stbNameChange !== ""){
            this.visibleDeviceconfigFile = true;
          } else {
            this.visibleDeviceconfigFile = false;
          }
          if (this.configFileName === `${deviceTypeConfig}.config`) {
            this.visibleDeviceconfigFile = true;
            this.newFileName = `${deviceTypeConfig}.config`;
          }
      if(this.configFileName !== `${boxNameConfig}.config` && this.configFileName !== `${deviceTypeConfig}.config`){
            this.visibleDeviceconfigFile = false;
            this.newFileName = `${boxNameConfig}.config`;
          }

          this.readFileContent(res.content);

          this.readDeviceFileContent(res.content);
          this.uploadDeviceConfigForm.patchValue({
            editorFilename: this.stbNameChange + '.config',
        editorContent: this.configData
      })
        },
        error(err) {
          const sts = err.status;
  }

    })
  }
  /**
   * Reading the configfile
   */
  /**
   * Reads the config file content.
   * @param file - Blob file to read
   */
  readFileContent(file: Blob): void {

    let boxNameConfig = this.deviceForm.value.devicename;
    const reader = new FileReader();
    reader.onload = () => {
      let content = reader.result as string;
      this.configData = content;
      if (this.configData) {
        this.uploadConfigForm.patchValue({
            editorFilename: this.configFileName ===`${boxNameConfig}.config`?this.configFileName:this.newFileName,
          editorContent: this.configData,
          })
      }
  }
    reader.readAsText(file)
  }

  /**
   * Reading the device configfile
   */
  /**
   * Reads the device config file content.
   * @param file - Blob file to read
   */
  readDeviceFileContent(file: Blob): void {

    const reader = new FileReader();
    reader.onload = () => {
      let content = reader.result as string;
      this.configData = content;
      if (this.configData) {
        this.uploadDeviceConfigForm.patchValue({
          editorFilename: this.stbNameChange + '.config',
            editorContent: this.configData
          })
      }
  }
    reader.readAsText(file)
  }

  /**
   * Formats the content by replacing all occurrences of '#' with '<br># '.
   *
   * @param content - The content to be formatted.
   * @returns The formatted content.
   */
  /**
   * Formats the content by replacing all occurrences of '#' with '<br># '.
   * @param content - The content to be formatted
   * @returns The formatted content
   */
  formatContent(content: any) {
  if (!content) return '';
  // Ensure content is a string and handle line endings
  const textContent = content.toString(); 
  // If content is already plain text, just return it
    if (!textContent.includes('<')) {
    return textContent;
    } 
  }

  /**
   * Handles config device ports checkbox change.
   * @param event - Input event
   */
  isConfigDevicePorts(event: any): void {

    if (event.target.checked) {
      this.showConfigPort = true;
      this.configDevicePorts = true;
    } else {
      this.showConfigPort = false;
      this.configDevicePorts = false;
    }
  }
  /**
   * Handles config device ports B checkbox change.
   * @param event - Input event
   */
  isCheckedConfigB(event: any): void {

    if (event.target.checked) {
      this.showConfigPortB = true;
      this.configuredevicePortB = true;
    } else {
      this.showConfigPortB = false;
      this.configuredevicePortB = false;
    }
  }
  /**
   * Lifecycle hook that is called when the component is destroyed.
   * It is used to perform any necessary cleanup logic before the component is removed from the DOM.
   */
  /**
   * Angular lifecycle hook - called when component is destroyed.
   * No parameters.
   */
  ngOnDestroy(): void {
  }
  /**
   * Go back to the previous page.
   */
  /**
   * Navigates back to the previous page.
   * No parameters.
   */
  goBack(): void {

    localStorage.removeItem('deviceCategory');
    this.router.navigate(["/devices"]);
  }
  /**
   * Reset the device form.
   */
  /**
   * Resets the device form.
   * No parameters.
   */
  reset(): void {

    this.deviceForm.reset();
  }
  /**
   * Resets the RDKB form.
   * No parameters.
   */
  resetFormB(): void {

    this.rdkBForm.reset();
  }
  /**
   * Submit the device form of RDKV category.
   */
  /**
   * Submits the device form of RDKV category.
   * No parameters.
   */
  deviceVSubmit(): void {

    this.deviceFormSubmitted = true;
    if (this.deviceForm.invalid) {
      return;
    } else {
      let obj = {
        deviceIp: this.deviceForm.value.deviceip,
        deviceName: this.deviceForm.value.devicename,
        devicePort: this.deviceForm.value.agentport,
        statusPort: this.deviceForm.value.agentstatusport,
        agentMonitorPort: this.deviceForm.value.agentmonitorport,
        macId: this.deviceForm.value.macaddr,
        deviceTypeName: this.deviceForm.value.devicetype,
        oemName: this.deviceForm.value.oem,
        socName: this.deviceForm.value.soc,
        devicestatus: 'FREE',
        thunderPort: this.deviceForm.value.thunderport,
        userGroupName: this.loggedinUser.userGroupName,
        category: this.selectedDeviceCategory,
        thunderEnabled: this.isThunderchecked,
        devicePortsConfigured: this.configDevicePorts,
      };
      this.service.createDevice(obj).subscribe({
        next: (res) => {
          this._snakebar.open(res.message, '', {
            duration: 3000,
            panelClass: ['success-msg'],
            verticalPosition: 'top',
          });
          setTimeout(() => {
            this.router.navigate(['/devices']);
          }, 1000);
        },
        error: (err) => {
          let errmsg = err.message ? err.message : err.macId;
          this._snakebar.open(errmsg, '', {
            duration: 2000,
            panelClass: ['err-msg'],
            horizontalPosition: 'end',
            verticalPosition: 'top',
          });
        },
      });
    }
  }

  /**
   * Submit the device form of RDKB category.
   */
  /**
   * Submits the device form of RDKB category.
   * No parameters.
   */
  deviceBSubmit(): void {

    this.rdkbFormSubmitted = true;
    if (this.rdkBForm.invalid) {
      return;
    } else {
      let rdkbObj = {
        deviceIp: this.rdkBForm.value.gatewayIp,
        deviceName: this.rdkBForm.value.gatewayName,
        macId: this.rdkBForm.value.macaddr,
        deviceTypeName: this.rdkBForm.value.devicetype,
        oemName: this.rdkBForm.value.oem,
        socName: this.rdkBForm.value.soc,
        devicePort: this.rdkBForm.value.agentPortb,
        statusPort: this.rdkBForm.value.agentStatusportB,
        agentMonitorPort: this.rdkBForm.value.agentMonitorportB,    
        devicestatus: 'FREE',
        userGroupName: this.loggedinUser.userGroupName,
        category: this.selectedDeviceCategory,
        devicePortsConfigured: this.rdkBForm.value.configuredevicePortB
      };
      this.service.createDevice(rdkbObj).subscribe({
        next: (res) => {
          this._snakebar.open(res.message, '', {
            duration: 3000,
            panelClass: ['success-msg'],
            verticalPosition: 'top',
          });
          setTimeout(() => {
            this.router.navigate(['/devices']);
          }, 1000);
        },
        error: (err) => {
          let errmsg = err.message ? err.message : err.macId;
          this._snakebar.open(errmsg, '', {
            duration: 2000,
            panelClass: ['err-msg'],
            horizontalPosition: 'end',
            verticalPosition: 'top',
          });
        },
      });
    }
  }
  /**
   * Edit icon will show/hide in editor modal
   */
  /**
   * Toggles the edit icon in editor modal.
   * No parameters.
   */
  toggleIsEdit(): void {

    this.isEditingFile = !this.isEditingFile;
    if (this.isEditingFile) {
      this.uploadDeviceConfigForm.get('editorFilename')?.enable();
    } else {
      this.uploadDeviceConfigForm.get('editorFilename')?.disable();
    }
  }

  /**
   * Toggles the file name in the upload device config form.
   * No parameters.
   */
  toggleFileName(): void {

    const boxNameConfig = this.deviceForm.value.devicename;
    const deviceTypeConfig = this.deviceForm.value.devicetype;
    const currentName =
      this.uploadDeviceConfigForm.get('editorFilename')?.value;
    let newName = '';
    if (currentName === `${boxNameConfig}.config`) {
      newName = `${deviceTypeConfig}.config`;
    } else {
      newName = `${boxNameConfig}.config`;
    }
    this.uploadDeviceConfigForm.patchValue({
      editorFilename: newName,
    });
  }

  /**
   * Toggles the file name in the upload config form dialog.
   * No parameters.
   */
  toggleFileNameDialog(): void {

    const boxNameConfig = this.deviceForm.value.devicename;
    const deviceTypeConfig = this.deviceForm.value.devicetype;
    const currentName = this.uploadConfigForm.get('editorFilename')?.value;
    let newName = '';
    if (currentName === `${boxNameConfig}.config`) {
      newName = `${deviceTypeConfig}.config`;
    } else {
      newName = `${boxNameConfig}.config`;
    }
    this.uploadConfigForm.patchValue({
      editorFilename: newName,
    });
  }

  /**
   * Handles change event for existing config file input.
   * @param event - Input event
   */
  onExistConfigChange(event: Event): void {

    let fileInput = event.target as HTMLInputElement;
    if (fileInput && fileInput.files) {
      const file = fileInput.files[0];
      this.uploadFileName = file;
      this.uploadExistConfigContent(file);
      this.uploadConfigForm.get('uploadFileModal')?.setValue(file);
    }else{
      this.uploadConfigForm.get('uploadFileModal')?.setValue('');
    }
  }
  /**
   * Uploads the content of the existing config file.
   * @param file - File to upload
   */
  uploadExistConfigContent(file: File): void {

    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const content = e.target?.result as string;
      this.uploadExistFileContent = content;
      let filename = file.name.endsWith('.config')
        ? this.deviceForm.value.devicename + '.config'
        : file.name;
      if (file.name.endsWith('.config')) {
        this.uploadConfigForm.patchValue({
          editorFilename: filename,
          editorContent: content,
        });
      } else {
        this.uploadConfigForm.patchValue({});
      }
    };
    reader.readAsText(file);
  }
  /**
   * The method is upload the configfile of editor modal
   */
  /**
   * Uploads the config file from editor modal.
   * No parameters.
   */
  configFileUpload(): void {

    this.existConfigSubmitted = true;
    if (this.uploadConfigForm.invalid) {
      return;
    }

    // Get the file input control and value (if you have a file input for this form)
    const fileInputControl = this.uploadConfigForm.get('uploadFileModal');
    const fileInputValue = fileInputControl?.value;

    // If a file was selected via file input
    if (fileInputValue && fileInputValue instanceof File) {
      const file: File = fileInputValue;

      if (file.name.endsWith('.config')) {
        // Use the editor filename and content
        const editorFilename =
        this.uploadConfigForm.get('editorFilename')!.value;
        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
          const content = e.target?.result as string;
          const editorContent = content;
          const contentBlob = new Blob([editorContent], { type: 'text/plain' });
          const contentFile = new File([contentBlob], editorFilename);
          this.uploadConfigFileAndHandleResponse(contentFile,'dialog');
        };
        reader.readAsText(file);
        return; // Prevent further execution, upload will happen in callback
      } else {
        // Not a .config file, upload as-is
        this.uploadConfigFileAndHandleResponse(file,'dialog');
        return;
      }
    }

    // If uploading from the editor (no file input)
    const editorFilename = this.uploadConfigForm.get('editorFilename')!.value;
    const content = this.uploadConfigForm.get('editorContent')!.value;
    const editorContent = content;
    const contentBlob = new Blob([editorContent], { type: 'text/plain' });
    const contentFile = new File([contentBlob], editorFilename);
    this.uploadConfigFileAndHandleResponse(contentFile,'dialog');
  }
  /**
   * The method is upload the configfile of fileupload
   */
  /**
   * Handles change event for modal file input.
   * @param event - Input event
   */
  onModalFileChange(event: Event): void {

    let fileInput = event.target as HTMLInputElement;
    if (fileInput && fileInput.files && fileInput.files.length > 0) {
      const file = fileInput.files[0];
      this.uploadFileNameConfig = file.name;
      this.uploadReadFileContent(file);
      // Set the File object directly into the form control
      this.uploadDeviceConfigForm.get('uploadConfigFileModal')?.setValue(file);
    } else {
      // If no file selected, clear the form control
      this.uploadDeviceConfigForm.get('uploadConfigFileModal')?.setValue('');
    }
  }

  /**
   * Uploads and reads the content of the file for device config.
   * @param file - File to upload and read
   */
  uploadReadFileContent(file: File): void {

    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const content = e.target?.result as string;
      this.uploadFileContent = content;
      let filename = file.name.endsWith('.config')
        ? this.deviceForm.value.devicename + '.config'
        : file.name;
      if (file.name.endsWith('.config')) {
        this.uploadDeviceConfigForm.patchValue({
          editorFilename: filename,
          editorContent: content,
        });
      } else {
        this.uploadDeviceConfigForm.patchValue({
        });
      }
    };
    reader.readAsText(file);
  }

  /**
   * The method is upload the default device configfile of editor modal
   */
  /**
   * Uploads the default device config file from editor modal.
   * No parameters.
   */
  configDeviceFileUpload(): void {

    this.submitted = true;
    if (this.uploadDeviceConfigForm.invalid) {
      return;
    }

    // Get the file input control and value
    const fileInputControl = this.uploadDeviceConfigForm.get(
      'uploadConfigFileModal'
    );
    const fileInputValue = fileInputControl?.value;

    // If a file was selected via file input
    if (fileInputValue && fileInputValue instanceof File) {
      const file: File = fileInputValue;

      if (file.name.endsWith('.config')) {
        // Use the editor filename and content
        const editorFilename =
        this.uploadDeviceConfigForm.get('editorFilename')!.value;
        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
          const content = e.target?.result as string;
          const editorContent = content;
          const contentBlob = new Blob([editorContent], { type: 'text/plain' });
          const contentFile = new File([contentBlob], editorFilename);
          this.uploadConfigFileAndHandleResponse(contentFile,'newDevice');
        };
        reader.readAsText(file);
        return; // Prevent further execution, upload will happen in callback
      } else {
        // Not a .config file, upload as-is
        this.uploadConfigFileAndHandleResponse(file,'newDevice');
        return;
      }
    }

    // If uploading from the editor (no file input)
    const editorFilename =
    this.uploadDeviceConfigForm.get('editorFilename')!.value;
    const content = this.uploadDeviceConfigForm.get('editorContent')!.value;
    const editorContent = content;
    const contentBlob = new Blob([editorContent], { type: 'text/plain' });
    const contentFile = new File([contentBlob], editorFilename);
    this.uploadConfigFileAndHandleResponse(contentFile,'newDevice');

    
  }

  // Helper function for upload and response handling
  /**
   * Helper function for upload and response handling.
   * @param file - File to upload
   * @param modalType - Type of modal ('dialog' or 'newDevice')
   */
  private uploadConfigFileAndHandleResponse(file: File, modalType: 'dialog' | 'newDevice'): void {

  this.service.uploadConfigFile(file, this.isThunderPresent).subscribe({
    next: (res) => {
      this._snakebar.open(res.message, '', {
        duration: 3000,
        panelClass: ['success-msg'],
        verticalPosition: 'top',
      });
      setTimeout(() => {
        if (modalType === 'dialog') {
          this.uploadConfigForm.get('uploadFileModal')?.reset();
          this.backToExistingEditor();
          this.closeDialog();      
        } else {
          this.uploadDeviceConfigForm.get('uploadConfigFileModal')?.reset();
          this.backToEditor('Create New Device Config File');
          this.closeNewDeviceDialog();
        }
        this.visibilityConfigFile();
      }, 1000);
    },
    error: (err) => {
      this._snakebar.open(err.message, '', {
        duration: 2000,
        panelClass: ['err-msg'],
        horizontalPosition: 'end',
        verticalPosition: 'top',
      });
      // Clear the editor content and filename if upload failed
      if (modalType === 'dialog') {
        this.uploadConfigForm.get('uploadFileModal')?.reset();
      } else {
        this.uploadDeviceConfigForm.get('uploadConfigFileModal')?.reset();
      }
    },
  });
}

  /**
   * Opens the upload file section and sets the necessary flags and values.
   * @param value - The value to set the uploadCreateHeading property to.
   */
  /**
   * Opens the upload file section and sets the necessary flags and values.
   * @param value - Heading value for upload section
   */
  openUploadFile(value: string): void {

  this.submitted = false;
  this.uploadDeviceConfigForm.get('uploadConfigFileModal')?.setValidators([Validators.required]);
  this.uploadDeviceConfigForm.get('editorContent')?.clearValidators();
  this.uploadDeviceConfigForm.get('uploadConfigFileModal')?.updateValueAndValidity();
  this.uploadDeviceConfigForm.get('editorContent')?.updateValueAndValidity();

    this.deviceEditor = false;
    this.uploadConfigSec = true;
    this.backToEditorbtn = true;
    this.showUploadButton = false;
    this.uploadCreateHeading = value;
  }
  /**
   * Navigates back to the device editor and updates the component's state.
   *
   * @param value - The value to set for the `uploadCreateHeading` property.
   */
  /**
   * Navigates back to the device editor and updates the component's state.
   * @param value - Heading value for editor section
   */
  backToEditor(value: string): void {

  this.submitted = false;
  this.uploadDeviceConfigForm.get('editorContent')?.setValidators([Validators.required]);
  this.uploadDeviceConfigForm.get('uploadConfigFileModal')?.clearValidators();
  this.uploadDeviceConfigForm.get('editorContent')?.updateValueAndValidity();
  this.uploadDeviceConfigForm.get('uploadConfigFileModal')?.updateValueAndValidity();


    this.deviceEditor = true;
    this.uploadConfigSec = false;
    this.backToEditorbtn = false;
    this.showUploadButton = true;
    this.uploadCreateHeading = value;
  }

  /**
   * Opens the existing modal with the specified value.
   * @param val - The value to be passed to the modal.
   */
  /**
   * Opens the existing modal with the specified value.
   * @param val - Value to be passed to modal
   */
  openExistingModal(val: string): void {

  this.existConfigSubmitted = false;
   this.uploadConfigForm.get('uploadFileModal')?.setValidators([Validators.required]);
  this.uploadConfigForm.get('editorContent')?.clearValidators();
  this.uploadConfigForm.get('uploadFileModal')?.updateValueAndValidity();
  this.uploadConfigForm.get('editorContent')?.updateValueAndValidity();
    this.existingConfigEditor = false;
    this.uploadExistingConfig = true;
    this.showExistUploadButton = false;
    this.backToExistEditorbtn = true;
    this.uploadExistConfigHeading = val;
  }
  /**
   * Navigates back to the existing config editor.
   */
  /**
   * Navigates back to the existing config editor.
   * No parameters.
   */
  backToExistingEditor(): void {

    this.existConfigSubmitted = false;
    this.uploadConfigForm.get('editorContent')?.setValidators([Validators.required]);
    this.uploadConfigForm.get('uploadFileModal')?.clearValidators();
    this.uploadConfigForm.get('editorContent')?.updateValueAndValidity();
    this.uploadConfigForm.get('uploadFileModal')?.updateValueAndValidity();
    this.existingConfigEditor = true;
    this.uploadExistingConfig = false;
    this.showExistUploadButton = true;
    this.backToExistEditorbtn = false;
    this.uploadExistConfigHeading = '';
  }

  /**
   * Deletes a device configuration file.
   * @param configFileName - The name of the configuration file to delete.
   */
  /**
   * Deletes a device configuration file.
   * @param configFileName - Name of the configuration file to delete
   */
  deleteDeviceConfigFile(configFileName: any) {

    if (configFileName) {
      if (confirm('Are you sure to delete ?')) {
        this.service
          .deleteDeviceConfigFile(configFileName, this.isThunderchecked)
          .subscribe({
            next: (res) => {
              this._snakebar.open(res, '', {
                duration: 1000,
                panelClass: ['success-msg'],
                horizontalPosition: 'end',
                verticalPosition: 'top',
              });
              this.dialogRef.close();
              if (this.isThunderchecked) {
                this.showPortFile = true;
              }
              this.visibilityConfigFile();
              this.backToEditor('Create New Device Config File');
            },
            error: (err) => {
              let errmsg = JSON.parse(err.error);
              this._snakebar.open(errmsg.message, '', {
                duration: 2000,
                panelClass: ['err-msg'],
                horizontalPosition: 'end',
                verticalPosition: 'top',
              });
            },
          });
      }
    }
  }
  /**
   * open the existing device config modal onclick button.
   */
  /**
   * Opens the existing device config modal on button click.
   * @param fileName - Name of the file to open
   */
  existDeviceDialog(fileName: any): void {

    this.showExistUploadButton = true;
    this.existingConfigEditor = true;
    this.uploadExistingConfig = false;
    this.backToExistEditorbtn = false;
    this.uploadFormSubmitted = false;
    if (fileName === 'sampleDevice.config') {
      this.showUploadButton = true;
      this.deviceEditor = true;
      this.uploadConfigSec = false;
      this.backToEditorbtn = false;
    
      this.newDeviceDialogRef = this.dialog.open(this.newDeviceTemplate, {
        width: '100vw',
        height: '90vh',
        panelClass: 'full-width-dialog',
      });
      // Add this to resize editor after dialog opens
      this.dialogOpened = true;
      setTimeout(() => this.resizeEditor(), 300);
    } else {
      
      this.dialogRef = this.dialog.open(this.dialogTemplate, {
        width: '100vw',
        height: '90vh',
        panelClass: 'full-width-dialog',
      });
      // Add this to resize editor after dialog opens
      this.dialogOpened = true;
      setTimeout(() => this.resizeEditor(), 300);
    }
  }
  /**
   * close the existing device config modal.
   */
  /**
   * Closes the existing device config modal.
   * No parameters.
   */
  closeDialog(): void {

    this.dialogRef.close();
  }
  /**
   * open the device config modal onclick button.
   */
  /**
   * Opens the device config modal on button click.
   * No parameters.
   */
  openNewDeviceDialog(): void {

    this.showUploadButton = true;
    this.deviceEditor = true;
    this.uploadConfigSec = false;
    this.backToEditorbtn = false;
    this.uploadFormSubmitted = false;
    // Fetch the sampleDevice.config content from backend/service
    this.service
      .downloadDeviceConfigFile(
        'sampleDevice',
        this.deviceForm.value.devicetype,
        this.isThunderPresent
      )
      .subscribe({
        next: (res) => {
          // If res.content is a Blob, read it as text first
          if (res.content instanceof Blob) {
            const reader = new FileReader();
            reader.onload = () => {
              const textContent = reader.result as string;
              this.uploadDeviceConfigForm.patchValue({
                editorFilename: this.deviceForm.value.devicename + '.config',
                editorContent: this.formatContent(textContent),
              });
              this.uploadCreateHeading = 'Create New Device Config File';
              this.deviceEditor = true;
              this.uploadConfigSec = false;
              this.backToEditorbtn = false;
              this.showUploadButton = true;
              this.newDeviceDialogRef = this.dialog.open(
                this.newDeviceTemplate,
                {
                  width: '100vw',
                  height: '90vh',
                   panelClass: 'full-width-dialog',
               });
                 // Add this to resize editor after dialog opens
                 this.dialogOpened = true;
                 setTimeout(() => this.resizeEditor(), 300);
            };
            reader.readAsText(res.content);
          } else if (typeof res.content === 'string') {
            // If already a string, just use it
            this.uploadDeviceConfigForm.patchValue({
              editorFilename: this.deviceForm.value.devicename + '.config',
              editorContent: this.formatContent(res.content),
            });
            this.uploadCreateHeading = 'Create New Device Config File';
            this.deviceEditor = true;
            this.uploadConfigSec = false;
            this.backToEditorbtn = false;
            this.showUploadButton = true;
            this.newDeviceDialogRef = this.dialog.open(this.newDeviceTemplate, {
               width: '100vw',
              height: '90vh',
              panelClass: 'full-width-dialog',
            });
             // Add this to resize editor after dialog opens
            this.dialogOpened = true;
            setTimeout(() => this.resizeEditor(), 300);
          }
        },
        error: (err) => {
          this._snakebar.open('Failed to load sample config.', '', {
            duration: 2000,
            panelClass: ['err-msg'],
            horizontalPosition: 'end',
            verticalPosition: 'top',
          });
        },
      });
  }
  /**
   * close the device config modal.
   */
  /**
   * Closes the device config modal.
   * No parameters.
   */
  closeNewDeviceDialog(): void {

    this.newDeviceDialogRef.close();
  }
  /**
   * Download the  configuration file.
   */
  /**
   * Downloads the configuration file.
   * No parameters.
   */
  downloadConfigFile() {

    this.service
      .downloadDeviceConfigFile(
        this.stbNameChange,
        this.deviceTypeValue,
        this.isThunderPresent
      )
      .subscribe({
        next: (res) => {
          const filename = res.filename;
          const blob = new Blob([res.content], {
            type: res.content.type || 'application/json',
          });
          saveAs(blob, filename);
        },
        error: (err) => {
          let errmsg = err.error;
          this._snakebar.open(errmsg, '', {
            duration: 2000,
            panelClass: ['err-msg'],
            horizontalPosition: 'end',
            verticalPosition: 'top',
          });
        },
      });
  }
}
