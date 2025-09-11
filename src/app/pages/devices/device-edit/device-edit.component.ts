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
import { Component, Renderer2, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MaterialModule } from '../../../material/material.module';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DeviceService } from '../../../services/device.service';
import { InputComponent } from '../../../utility/component/ag-grid-buttons/input/input.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { OemService } from '../../../services/oem.service';
import { DevicetypeService } from '../../../services/devicetype.service';
import { SocService } from '../../../services/soc.service';
import { AuthService } from '../../../auth/auth.service';
import saveAs from 'file-saver';
import { MonacoEditorModule } from '@materia-ui/ngx-monaco-editor';

@Component({
  selector: 'app-device-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MonacoEditorModule, MaterialModule],
  templateUrl: './device-edit.component.html',
  styleUrl: './device-edit.component.css',
})
export class DeviceEditComponent {
  @ViewChild('dialogTemplate', { static: true })
  dialogTemplate!: TemplateRef<any>;
  @ViewChild('newDeviceTemplate', { static: true })
  newDeviceTemplate!: TemplateRef<any>;
  configureName!: string;
  editDeviceVForm!: FormGroup;
  rdkBForm!: FormGroup;
  rdkCForm!: FormGroup;
  editDeviceVFormSubmitted = false;
  rdkbFormSubmitted = false;
  rdkcFormSubmitted = false;
  isthunderEnabled = false;
  showPortFile = false;
  showConfigPort = false;
  showConfigPortB = false;
  allDeviceType: any;
  allOem: any;
  allsoc: any;
  rowData: any = [];
  public themeClass: string = 'ag-theme-quartz';
  public paginationPageSize = 5;
  public paginationPageSizeSelector: number[] | boolean = [5, 10, 50, 100];
  public tooltipShowDelay = 500;
  gridApi!: any;
  showHideCreateFormV = true;
  showHideCreateFormB = false;
  showHideCreateFormC = false;
  isGateway!: any;
  isrecorderId = false;
  isThunderchecked = false;
  public frameworkComponents: any;
  visibleGateway = true;
  streamingMapObj!: { streamId: any; ocapId: any }[];
  loggedinUser: any;
  agentport = '8087';
  agentStatusPort = '8088';
  agentMonitoPort = '8090';
  user: any;
  selectedDeviceCategory!: string;
  categoryName!: string;
  visibleDeviceconfigFile = false;
  configFileName!: string;
  uploadConfigForm!: FormGroup;
  uploadDeviceConfigForm!: FormGroup;
  filesList: any[] = [];
  stbNameChange!: string;
  configData: any;
  deviceTypeValue!: string;
  existConfigSubmitted = false;
  uploadExistConfigHeading!: string;
  uploadExistFileContent!: string;
  isEditingFile = false;
  fileNameArray: string[] = [];
  currentIndex: number = 0;
  existingConfigEditor = true;
  uploadExistingConfig = false;
  showExistUploadButton = true;
  backToExistEditorbtn = false;
  uploadFileName!: File;
  submitted = false;
  uploadCreateHeading: string = 'Create New Device Config File';
  uploadFileNameConfig!: string;
  uploadFileContent!: string;
  deviceEditor = true;
  uploadConfigSec = false;
  backToEditorbtn = false;
  showUploadButton = true;
  dialogRef!: MatDialogRef<any>;
  newDeviceDialogRef!: MatDialogRef<any>;
  selectedDeviceType: any;
  newFileName!: string;
  findboxType: any[] = [];
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
   * Constructor for DeviceEditComponent.
   * @param fb - FormBuilder for reactive forms
   * @param router - Angular Router for navigation
   * @param _snakebar - MatSnackBar for notifications
   * @param oemService - OemService for OEM operations
   * @param authservice - AuthService for authentication
   * @param service - DeviceService for device operations
   * @param socService - SocService for SOC operations
   * @param devicetypeService - DevicetypeService for device type operations
   * @param renderer - Renderer2 for DOM manipulation
   * @param dialog - MatDialog for dialogs
   */
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private _snakebar: MatSnackBar,
    private oemService: OemService,
    private authservice: AuthService,
    private service: DeviceService,
    private socService: SocService,
    private devicetypeService: DevicetypeService,
    private renderer: Renderer2,
    public dialog: MatDialog
  ) {
    this.user = JSON.parse(localStorage.getItem('user') || '{}');
    console.log(this.user);

    this.loggedinUser = JSON.parse(
      localStorage.getItem('loggedinUser') || '{}'
    );
    this.frameworkComponents = {
      inputCellRenderer: InputComponent,
    };
  }

  /**
   * Initializes the component and performs necessary setup tasks.
   * Retrieves device category from local storage and sets the initial values for the form fields.
   * Configures the visibility of create forms based on the selected device category.
   * Validates IP address using regular expression.
   * Initializes form groups and sets default values for form controls.
   * Retrieves data from API endpoints.
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
    let macregexp: RegExp = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
    let ipregexp: RegExp =
      /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?))$/;
    this.editDeviceVForm = this.fb.group({
      stbname: [
        this.user.deviceName,
        [Validators.required, Validators.pattern(/^[a-zA-Z0-9_]+$/)],
      ],
      stbip: [
        this.user.deviceIp,
        [Validators.required, Validators.pattern(ipregexp)],
      ],
      macaddr: [
        this.user.macId,
        [Validators.required, Validators.pattern(macregexp)],
      ],
      devicetype: [this.user.deviceTypeName, [Validators.required]],
      oem: [this.user.oemName || ''],
      soc: [this.user.socName || ''],
      gateway: [this.user.gatewayDeviceName],
      thunderport: [this.user.thunderPort],

      isThunder: [this.user.thunderEnabled],
      configuredevicePorts: [this.user.devicePortsConfigured],
      agentport: [this.user.devicePort ? this.user.devicePort : this.agentport],
      agentstatusport: [
        this.user.statusPort ? this.user.statusPort : this.agentStatusPort,
      ],
      agentmonitorport: [
        this.user.agentMonitorPort
          ? this.user.agentMonitorPort
          : this.agentMonitoPort,
      ],
      recorderId: [this.user.recorderId],
    });

    this.rdkBForm = this.fb.group({
      gatewayName: [
        this.user.deviceName,
        [Validators.required, Validators.pattern(/^[a-zA-Z0-9_]+$/)],
      ],
      gatewayIp: [
        this.user.deviceIp,
        [Validators.required, Validators.pattern(ipregexp)],
      ],
      macaddr: [
        this.user.macId,
        [Validators.required, Validators.pattern(macregexp)],
      ],
      devicetype: [this.user.deviceTypeName, [Validators.required]],
      oem: [this.user.oemName || ''],
      soc: [this.user.socName || ''],
      configuredevicePortB: [this.user.devicePortsConfigured],
      agentPortb: [
        this.user.devicePort ? this.user.devicePort : this.agentport,
      ],
      agentStatusportB: [
        this.user.statusPort ? this.user.statusPort : this.agentStatusPort,
      ],
      agentMonitorportB: [
        this.user.agentMonitorPort
          ? this.user.agentMonitorPort
          : this.agentMonitoPort,
      ],
    });

    this.rdkCForm = this.fb.group({
      cameraName: [
        this.user.deviceName,
        [Validators.required, Validators.pattern(/^[a-zA-Z0-9_]+$/)],
      ],
      stbIp: [this.user.deviceIp, [Validators.required]],
      macaddr: [
        this.user.macId,
        [Validators.required, Validators.pattern(macregexp)],
      ],
      devicetype: [this.user.deviceTypeName, [Validators.required]],
      oem: [this.user.oemName],
      soc: [this.user.socName],
      agentPortb: [this.user.stbPort ? this.user.stbPort : this.agentport],
      agentStatusportB: [
        this.user.statusPort ? this.user.statusPort : this.agentStatusPort,
      ],
      agentMonitorportB: [
        this.user.agentMonitorPort
          ? this.user.agentMonitorPort
          : this.agentMonitoPort,
      ],
    });
    this.showConfigPortB = !!this.user.devicePortsConfigured;
    this.getAlldeviceType();
    this.getAllOem();
    this.getAllsoc();
    this.isEditChecked(this.user.thunderEnabled);
    this.isCheckedConfigPort(this.user.devicePortsConfigured);
    this.visibilityConfigFile();
    this.uploadConfigForm = this.fb.group({
      editorFilename: ['', { disabled: true }],
      editorContent: ['', [Validators.required]],
      uploadConfigFileModal: ['', [Validators.required]],
    });
    this.filesList = [];
    this.uploadDeviceConfigForm = this.fb.group({
      editorFilename: ['', { disabled: true }],
      editorContent: ['', [Validators.required]],
      uploadDeviceConfigFileModal: ['', [Validators.required]],
    });
    this.editDeviceVForm.get('thunderport')?.valueChanges.subscribe((value) => {
      const cleanedValue = value.replace(/^\s+|[^0-9]/g, '');
      if (cleanedValue !== value) {
        this.editDeviceVForm.get('thunderport')?.setValue(cleanedValue, {
          emitEvent: false,
        });
      }
    });
    this.editDeviceVForm.get('agentport')?.valueChanges.subscribe((value) => {
      const cleanedValue = value.replace(/^\s+|[^0-9]/g, '');
      if (cleanedValue !== value) {
        this.editDeviceVForm.get('agentport')?.setValue(cleanedValue, {
          emitEvent: false,
        });
      }
    });
    this.editDeviceVForm
      .get('agentstatusport')
      ?.valueChanges.subscribe((value) => {
        const cleanedValue = value.replace(/^\s+|[^0-9]/g, '');
        if (cleanedValue !== value) {
          this.editDeviceVForm.get('agentstatusport')?.setValue(cleanedValue, {
            emitEvent: false,
          });
        }
      });
    this.editDeviceVForm
      .get('agentmonitorport')
      ?.valueChanges.subscribe((value) => {
        const cleanedValue = value.replace(/^\s+|[^0-9]/g, '');
        if (cleanedValue !== value) {
          this.editDeviceVForm.get('agentmonitorport')?.setValue(cleanedValue, {
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
    this.rdkCForm.get('agentPortb')?.valueChanges.subscribe((value) => {
      const cleanedValue = value.replace(/^\s+|[^0-9]/g, '');
      if (cleanedValue !== value) {
        this.rdkCForm.get('agentPortb')?.setValue(cleanedValue, {
          emitEvent: false,
        });
      }
    });
    this.rdkCForm.get('agentStatusportB')?.valueChanges.subscribe((value) => {
      const cleanedValue = value.replace(/^\s+|[^0-9]/g, '');
      if (cleanedValue !== value) {
        this.rdkCForm.get('agentStatusportB')?.setValue(cleanedValue, {
          emitEvent: false,
        });
      }
    });
    this.rdkCForm.get('agentMonitorportB')?.valueChanges.subscribe((value) => {
      const cleanedValue = value.replace(/^\s+|[^0-9]/g, '');
      if (cleanedValue !== value) {
        this.rdkCForm.get('agentMonitorportB')?.setValue(cleanedValue, {
          emitEvent: false,
        });
      }
    });
    this.editDeviceVForm.get('stbname')?.valueChanges.subscribe((value) => {
      if (value) {
        this.editDeviceVForm.get('stbname')?.setValue(value.toUpperCase());
      }
    });
    this.rdkBForm.get('gatewayName')?.valueChanges.subscribe((value) => {
      if (value) {
        this.rdkBForm.get('gatewayName')?.setValue(value.toUpperCase());
      }
    });
    this.rdkCForm.get('cameraName')?.valueChanges.subscribe((value) => {
      if (value) {
        this.rdkCForm.get('cameraName')?.setValue(value.toUpperCase());
      }
    });

    // Ensure thunderport is required if Thunder is enabled on load
    if (this.editDeviceVForm.get('isThunder')?.value) {
      this.editDeviceVForm
        .get('thunderport')
        ?.setValidators([Validators.required]);
      this.editDeviceVForm.get('thunderport')?.updateValueAndValidity();
    }

    this.uploadDeviceConfigForm.get('editorContent')?.setValidators([Validators.required]);
    this.uploadDeviceConfigForm.get('uploadDeviceConfigFileModal')?.clearValidators();
    this.uploadDeviceConfigForm.get('editorContent')?.updateValueAndValidity();
    this.uploadDeviceConfigForm.get('uploadDeviceConfigFileModal')?.updateValueAndValidity();

    this.uploadConfigForm.get('editorContent')?.setValidators([Validators.required]);
    this.uploadConfigForm.get('uploadConfigFileModal')?.clearValidators();
    this.uploadConfigForm.get('editorContent')?.updateValueAndValidity();
    this.uploadConfigForm.get('uploadConfigFileModal')?.updateValueAndValidity();
  }


  /**
   * Initializes the Monaco editor instance when the editor is ready.
   * 
   * This method sets the `monacoEditorInstance` property, marks the editor as initialized,
   * and schedules a layout and focus operation after a short delay to ensure the editor
   * is properly rendered and focused.
   *
   * @param editor - The Monaco editor instance provided by the editor's initialization event.
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
   * This is typically called after UI changes, such as dialog animations,
   * to ensure the editor displays correctly. The resize is delayed by 300ms
   * to allow animations to complete before recalculating the layout.
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
   * Called when the grid is ready.
   * @param params - The grid ready event parameters.
   */
  onGridReady(params: any) {

    this.gridApi = params.api;
  }

  /**
   * Retrieves all box types based on the selected device category.
   * No parameters.
   */
  getAlldeviceType() {

    this.devicetypeService
      .getfindallbycategory(this.selectedDeviceCategory)
      .subscribe((res) => {
        this.allDeviceType = res.data;
        this.findboxType = this.allDeviceType;
        for (let i = 0; i < this.findboxType.length; i++) {
          const element = this.findboxType[i];
          if (this.deviceTypeValue === element.boxTypeName) {
            this.selectedDeviceType = element;
            const selectedType = this.findboxType.find(
              (item: any) => item.type === this.selectedDeviceType.type
            );
          }
        }
      });
  }

  /**
   * Retrieves all box manufactures based on the selected device category.
   * No parameters.
   */
  getAllOem() {

    this.oemService
      .getOemByList(this.selectedDeviceCategory)
      .subscribe((res) => {
        this.allOem = res.data;
      });
  }

  /**
   * Retrieves all SOC vendors based on the selected device category.
   * No parameters.
   */
  getAllsoc() {

    this.socService.getSoc(this.selectedDeviceCategory).subscribe((res) => {
      this.allsoc = res.data;
    });
  }
  
  /**
   * Handles the change event of the box type dropdown.
   * @param event - The event object containing the target element.
   */
  devicetypeChange(event: any) {

    this.visibleDeviceconfigFile = false;
    let value = event.target.value;
    this.deviceTypeValue = value;
    this.visibilityConfigFile();
  }
  
  /**
   * Handles the change event when the Thunder checkbox is checked or unchecked.
   * @param event - The event object containing information about the checkbox change.
   */
  isChecked(event: any) {

    this.isThunderchecked = this.editDeviceVForm.get('isThunder')?.value;
    if (event.target.checked) {
      this.isThunderchecked = true;
      this.showPortFile = true;
      this.editDeviceVForm.get('thunderport')?.setValidators([Validators.required]);
      this.editDeviceVForm.get('thunderport')?.updateValueAndValidity();
    } else {
      this.showPortFile = false;
      this.isThunderchecked = false;
      this.editDeviceVForm.get('thunderport')?.clearValidators();
      this.editDeviceVForm.get('thunderport')?.updateValueAndValidity();
    }
    this.visibilityConfigFile();
  }
 
  /**
   * Updates the state of the component based on the value of Thunder checkbox.
   * @param val - Boolean value for Thunder checkbox.
   */
  isEditChecked(val: boolean) {

    if (val === true) {
      this.showPortFile = true;
      this.isThunderchecked = true;
    } else {
      this.showPortFile = false;
      this.isThunderchecked = false;
    }
  }

  /**
   * Handles the change event for device ports checkbox.
   * @param event - The event object containing information about the checkbox change.
   */
  isCheckedConfig(event: any) {

    if (event.target.checked) {
      this.showConfigPort = true;
    } else {
      this.showConfigPort = false;
    }
  }

  /**
   * Updates the state of the component based on the value of device ports checkbox.
   * @param val - Boolean value for device ports checkbox.
   */
  isCheckedConfigPort(val: boolean): void {

    if (val === true) {
      this.showConfigPort = true;
    } else {
      this.showConfigPort = false;
    }
  }

  /**
   * Handles the change event for device ports B checkbox.
   * @param event - The event object containing information about the checkbox change.
   */
  isCheckedConfigB(event: any) {

    if (event.target.checked) {
      this.showConfigPortB = true;
    } else {
      this.showConfigPortB = false;
    }
  }

  /**
   * Handles value change for deviceName input field.
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
   * Checks Thunder validity based on stbName and deviceType.
   * No parameters.
   */
  checkIsThunderValidity(): void {

    const stbName = this.stbNameChange;
    const boxType = this.deviceTypeValue;
    if (stbName && boxType) {
      this.editDeviceVForm.get('isThunder')?.enable();
    } else {
      this.editDeviceVForm.get('isThunder')?.disable();
      this.editDeviceVForm.get('isThunder')?.setValue(false);
      this.showPortFile = false;
      this.isThunderchecked = false;
    }
  }
 
  /**
   * Shows the config file or device.config file based on deviceName and devicetype.
   * No parameters.
   */
  visibilityConfigFile(): void {

    let boxNameConfig = this.editDeviceVForm.value.stbname;
    let boxTypeConfig = this.editDeviceVForm.value.devicetype;
    let thunderStatus = this.editDeviceVForm.value.isThunder;
    this.service
      .downloadDeviceConfigFile(boxNameConfig, boxTypeConfig, thunderStatus)
      .subscribe((res) => {
        this.configFileName = res.filename;
        if (
          this.configFileName !== `${boxNameConfig}.config` &&
          this.stbNameChange !== undefined &&
          this.stbNameChange !== ''
        ) {
          this.visibleDeviceconfigFile = true;
        } else {
          this.visibleDeviceconfigFile = false;
        }
        if (this.configFileName === `${boxTypeConfig}.config`) {
          this.visibleDeviceconfigFile = true;
          this.newFileName = `${boxTypeConfig}.config`;
        }
        if (
          this.configFileName !== `${boxNameConfig}.config` &&
          this.configFileName !== `${boxTypeConfig}.config`
        ) {
          this.visibleDeviceconfigFile = false;
          this.newFileName = `${boxNameConfig}.config`;
        }
        this.readFileContent(res.content);
        this.uploadConfigForm.patchValue({
          editorFilename: this.configFileName,
          editorContent: this.configData,
        });
        this.readDeviceFileContent(res.content);
        this.uploadDeviceConfigForm.patchValue({
          editorFilename: this.stbNameChange + '.config',
          editorContent: this.configData,
        });
      });
  }

  /**
   * Reads the config file content.
   * @param file - Blob file to read
   */
  readFileContent(file: Blob): void {

    let boxNameConfig = this.editDeviceVForm.value.stbname;
    const reader = new FileReader();
    reader.onload = () => {
    let content = reader.result as string;
    this.configData = content;
      if (this.configData) {
        this.uploadConfigForm.patchValue({
          editorFilename:
            this.configFileName === `${boxNameConfig}.config`
              ? this.configFileName
              : this.newFileName,
          editorContent: this.configData,
        });
      }
    };
    reader.readAsText(file);
  }

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
          editorContent: this.configData,
        });
      }
    };
    reader.readAsText(file);
  }
 
  /**
   * Angular lifecycle hook - called when component is destroyed.
   * No parameters.
   */
  ngOnDestroy(): void {
  }

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
   * Navigates back to the devices page and removes the 'streamData' item from localStorage.
   * No parameters.
   */
  goBack() {

    localStorage.removeItem('streamData');
    localStorage.removeItem('deviceCategory');
    this.router.navigate(['/devices']);
  }
  
  /**
   * Downloads a device file.
   * No parameters.
   */
  downloadFile() {

    if (this.user.deviceName) {
      this.service.downloadDevice(this.user.deviceName).subscribe((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.user.deviceName}.xml`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      });
    }
  }

  /**
   * Submits the form to update device for category RDKV.
   * No parameters.
   */
  EditDeviceVSubmit() {

    console.log("Test"+this.editDeviceVForm.value.thunderport);
    this.editDeviceVFormSubmitted = true;
    if (this.editDeviceVForm.invalid) {
      return;
    } else {
      let obj = {
        id: this.user.id,
        deviceIp: this.editDeviceVForm.value.stbip,
        deviceName: this.editDeviceVForm.value.stbname,
        devicePort: this.editDeviceVForm.value.agentport,
        statusPort: this.editDeviceVForm.value.agentstatusport,
        agentMonitorPort: this.editDeviceVForm.value.agentmonitorport,
        macId: this.editDeviceVForm.value.macaddr,
        deviceTypeName: this.editDeviceVForm.value.devicetype,
        oemName: this.editDeviceVForm.value.oem,
        socName: this.editDeviceVForm.value.soc,
        devicestatus: 'FREE',
        thunderPort: this.editDeviceVForm.value.thunderport,
        userGroupName: this.loggedinUser.userGroupName,
        category: this.selectedDeviceCategory,
        deviceStreams: this.streamingMapObj ? this.streamingMapObj : null,
        thunderEnabled: this.isThunderchecked,
        devicePortsConfigured: this.editDeviceVForm.value.configuredevicePorts,
      };
      this.service.updateDevice(obj).subscribe({
        next: (res) => {
          this._snakebar.open(res.message, '', {
            duration: 3000,
            panelClass: ['success-msg'],
            verticalPosition: 'top',
          });
          setTimeout(() => {
            this.router.navigate(['/devices']);
            localStorage.removeItem('streamData');
          }, 1000);
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
  }

  /**
   * Submits the form to update device for category RDKB.
   * No parameters.
   */
  editDeviceBSubmit() {

    this.rdkbFormSubmitted = true;
  
    if (this.rdkBForm.invalid) {
      return;
    } else {
      let rdkBobj = {
        id: this.user.id,
        deviceIp: this.rdkBForm.value.gatewayIp,
        deviceName: this.rdkBForm.value.gatewayName,
        devicePort: this.rdkBForm.value.agentPortb,
        statusPort: this.rdkBForm.value.agentStatusportB,
        agentMonitorPort: this.rdkBForm.value.agentMonitorportB,
        macId: this.rdkBForm.value.macaddr,
        deviceTypeName: this.rdkBForm.value.devicetype,
        oemName: this.rdkBForm.value.oem,
        socName: this.rdkBForm.value.soc,
        userGroupName: this.loggedinUser.userGroupName,
        category: this.selectedDeviceCategory,
        devicePortsConfigured: this.rdkBForm.value.configuredevicePortB,
      };
      this.service.updateDevice(rdkBobj).subscribe({
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
          this._snakebar.open(err.message, '', {
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
   * Toggles the edit icon in editor modal.
   * No parameters.
   */
  toggleIsEdit(): void {

    this.isEditingFile = !this.isEditingFile;
    if (this.isEditingFile) {
      this.uploadConfigForm.get('editorFilename')?.enable();
    } else {
      this.uploadConfigForm.get('editorFilename')?.disable();
    }
    if (this.configFileName === 'sampleDevice.config') {
      let deviceNameConfig = this.editDeviceVForm.value.stbname;
      let deviceTypeConfig = this.editDeviceVForm.value.devicetype;
      this.fileNameArray.push(deviceNameConfig, deviceTypeConfig);
      this.currentIndex = (this.currentIndex + 1) % this.fileNameArray.length;
      this.uploadConfigForm.patchValue({
        editorFilename: `${this.fileNameArray[this.currentIndex]}.config`,
      });
    }
  }

  /**
   * Toggles the file name in the upload config form dialog.
   * No parameters.
   */
  toggleFileNameDialog(): void {

    const boxNameConfig = this.editDeviceVForm.value.stbname;
    const deviceTypeConfig = this.editDeviceVForm.value.devicetype;
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
   * Toggles the file name in the upload device config form.
   * No parameters.
   */
  toggleFileName(): void {

    const boxNameConfig = this.editDeviceVForm.value.stbname;
    const deviceTypeConfig = this.editDeviceVForm.value.devicetype;
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
   * Uploads the config file from editor modal.
   * No parameters.
   */
  configFileUpload(): void {

    this.existConfigSubmitted = true;
    if (this.uploadConfigForm.invalid) {
      return;
    }

    // Get the file input control and value (if you have a file input for this form)
    const fileInputControl = this.uploadConfigForm.get('uploadConfigFileModal');
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

  // Helper function for upload and response handling
  /**
   * Helper function for upload and response handling.
   * @param file - File to upload
   * @param modalType - Type of modal ('dialog' or 'newDevice')
   */
  private uploadConfigFileAndHandleResponse(file: File ,modalType: 'dialog' | 'newDevice'): void {

    const isThunder = this.editDeviceVForm.get('isThunder')?.value;
    this.service.uploadConfigFile(file, isThunder).subscribe({
      next: (res) => {
        this._snakebar.open(res.message, '', {
          duration: 3000,
          panelClass: ['success-msg'],
          verticalPosition: 'top',
        });
        setTimeout(() => {
        if (modalType === 'dialog') {
          this.uploadConfigForm.get('uploadConfigFileModal')?.reset();
          this.backToExistingEditor();
          this.closeDialog();
        } else {
          this.uploadDeviceConfigForm.get('uploadDeviceConfigFileModal')?.reset();
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
        this.uploadConfigForm.get('uploadConfigFileModal')?.reset();
      } else {    
        this.uploadDeviceConfigForm.get('uploadDeviceConfigFileModal')?.reset();
      }
      },
    });
  }

  /**
   * Opens the upload file section and sets the necessary flags and values.
   * @param value - Heading value for upload section
   */
  openUploadFile(value: string): void {

      this.submitted = false;
  this.uploadDeviceConfigForm.get('uploadDeviceConfigFileModal')?.setValidators([Validators.required]);
  this.uploadDeviceConfigForm.get('editorContent')?.clearValidators();
  this.uploadDeviceConfigForm.get('uploadDeviceConfigFileModal')?.updateValueAndValidity();
  this.uploadDeviceConfigForm.get('editorContent')?.updateValueAndValidity();
    this.deviceEditor = false;
    this.uploadConfigSec = true;
    this.backToEditorbtn = true;
    this.showUploadButton = false;
    this.uploadCreateHeading = value;
  }
 
  /**
   * Navigates back to the device editor and updates the component's state.
   * @param value - Heading value for editor section
   */
  backToEditor(value: string): void {

     this.submitted = false;
  this.uploadDeviceConfigForm.get('editorContent')?.setValidators([Validators.required]);
  this.uploadDeviceConfigForm.get('uploadDeviceConfigFileModal')?.clearValidators();
  this.uploadDeviceConfigForm.get('editorContent')?.updateValueAndValidity();
  this.uploadDeviceConfigForm.get('uploadDeviceConfigFileModal')?.updateValueAndValidity();


    this.deviceEditor = true;
    this.uploadConfigSec = false;
    this.backToEditorbtn = false;
    this.showUploadButton = true;
    this.uploadCreateHeading = value;
  }
 
  /**
   * Opens the existing modal with the specified value.
   * @param val - Value to be passed to modal
   */
  openExistingModal(val: string): void {

    this.existConfigSubmitted = false;
   this.uploadConfigForm.get('uploadConfigFileModal')?.setValidators([Validators.required]);
  this.uploadConfigForm.get('editorContent')?.clearValidators();
  this.uploadConfigForm.get('uploadConfigFileModal')?.updateValueAndValidity();
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
    this.uploadConfigForm.get('uploadConfigFileModal')?.clearValidators();
    this.uploadConfigForm.get('editorContent')?.updateValueAndValidity();
    this.uploadConfigForm.get('uploadConfigFileModal')?.updateValueAndValidity();
    this.existingConfigEditor = true;
    this.uploadExistingConfig = false;
    this.showExistUploadButton = true;
    this.backToExistEditorbtn = false;
    this.uploadExistConfigHeading = '';
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
      this.uploadConfigForm.get('uploadConfigFileModal')?.setValue(file);
    }else{
      this.uploadConfigForm.get('uploadConfigFileModal')?.setValue('');
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
        ? this.editDeviceVForm.value.stbname + '.config'
        : file.name;
       if (file.name.endsWith('.config')) {
         this.uploadConfigForm.patchValue({
           editorFilename: filename,
           editorContent: this.uploadExistFileContent,
         });
       } else {
         this.uploadConfigForm.patchValue({});
       }
    };
    reader.readAsText(file);
  }
 
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
              this.showPortFile = false;
              this.backToEditor('Create New Device Config File');
              this.visibilityConfigFile();
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
      this.uploadDeviceConfigForm.get('uploadDeviceConfigFileModal')?.setValue(file);
    } else {
      // If no file selected, clear the form control
      this.uploadDeviceConfigForm.get('uploadDeviceConfigFileModal')?.setValue('');
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
        ? this.editDeviceVForm.value.stbname + '.config'
        : file.name;
      if (file.name.endsWith('.config')) {
        this.uploadDeviceConfigForm.patchValue({
          editorFilename: filename,
          editorContent: this.uploadFileContent,
        });
      } else {
        this.uploadDeviceConfigForm.patchValue({});
      }
    };
    reader.readAsText(file);
  }

  /**
   * Uploads the default device config file from editor modal.
   * No parameters.
   */
  configDeviceFileUpload(): void {

    console.log('configDeviceFileUpload called');
    this.submitted = true;
    if (this.uploadDeviceConfigForm.invalid) {
      return;
    }

    // Get the file input control and value
    const fileInputControl = this.uploadDeviceConfigForm.get(
      'uploadDeviceConfigFileModal'
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

  /**
   * Opens the existing device config modal on button click.
   * @param fileName - Name of the file to open
   */
  existDeviceDialog(fileName: any): void {

    this.showExistUploadButton = true;
    this.existingConfigEditor = true;
    this.uploadExistingConfig = false;
    this.backToExistEditorbtn = false;
    if (fileName === 'sampleDevice.config') {
      const deviceName = this.editDeviceVForm.value.stbname || '';
      this.uploadDeviceConfigForm.patchValue({
        editorFilename: deviceName + '.config',
        editorContent: this.configData,
      });
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
   * Closes the existing device config modal.
   * No parameters.
   */
  closeDialog(): void {

    this.dialogRef.close();
  }
 
  /**
   * Opens the device config modal on button click.
   * No parameters.
   */
  openNewDeviceDialog(): void {

    this.showUploadButton = true;
    this.deviceEditor = true;
    this.uploadConfigSec = false;
    this.backToEditorbtn = false;

    const deviceName = this.editDeviceVForm.value.stbname || '';
    const deviceType = this.editDeviceVForm.value.devicetype || '';
    const isThunder = this.editDeviceVForm.value.isThunder;

    // Always fetch the sample config for "Create New Device Config File"
    this.service
      .downloadDeviceConfigFile('sampleDevice', deviceType, isThunder)
      .subscribe((res) => {
        let content = '';
        if (res.content instanceof Blob) {
          const reader = new FileReader();
          reader.onload = () => {
            content = reader.result as string;
            this.uploadDeviceConfigForm.patchValue({
              editorFilename: deviceName + '.config',
              editorContent: content,
            });
            this.newDeviceDialogRef = this.dialog.open(this.newDeviceTemplate, {
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
          content = this.formatContent(res.content);
          this.uploadDeviceConfigForm.patchValue({
            editorFilename: deviceName + '.config',
            editorContent: content,
          });
          this.newDeviceDialogRef = this.dialog.open(this.newDeviceTemplate, {
            width: '100vw',
            height: '90vh',
            panelClass: 'full-width-dialog',
          });
          // Add this to resize editor after dialog opens
            this.dialogOpened = true;
            setTimeout(() => this.resizeEditor(), 300);
        }
      });
  }


   /**
   * Downloads the configuration file.
   * No parameters.
   */
  downloadConfigFile(configFileName: any) {
    const cleanFileName = configFileName.endsWith('.config')
      ? configFileName.substring(0, configFileName.length - 7)
      : configFileName;
    this.service
      .downloadDeviceConfigFile(
        cleanFileName,
        this.deviceTypeValue,
        this.isThunderchecked
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

  /**
   * Closes the device config modal.
   * No parameters.
   */
  closeNewDeviceDialog(): void {

    this.newDeviceDialogRef.close();
  }
}
