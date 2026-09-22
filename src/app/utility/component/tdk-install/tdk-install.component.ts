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
import { Component, Inject, ViewChild, ElementRef, AfterViewChecked, OnDestroy } from '@angular/core';
import { HttpEventType } from '@angular/common/http';
import { MaterialModule } from '../../../material/material.module';
import {
  FormsModule,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PackageManagerService } from '../../../services/package-manager.service';
import { ThemeService } from '../../../services/theme.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LoaderComponent } from '../../../utility/component/loader/loader.component';

declare var bootstrap: any;

@Component({
  selector: 'app-tdk-install',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MaterialModule,
    LoaderComponent,
  ],
  templateUrl: './tdk-install.component.html',
  styleUrl: './tdk-install.component.css',
})
/**
 * The `TdkInstallComponent` is responsible for managing the installation and upload of packages
 * within the application. It provides functionalities such as creating packages, uploading package files,
 * installing packages, and fetching package lists. The component also handles user interactions
 * like file selection, form submission, and modal management.
 *
 * @class
 * @decorator `@Component`
 *
 */
export class TdkInstallComponent implements AfterViewChecked, OnDestroy {
  @ViewChild('fileInput') fileInput!: ElementRef;
  @ViewChild('logsContainer') logsContainer!: ElementRef<HTMLDivElement>;

  selectedPackage = 'TDK';
  packageNames: string[] = [];
  selectedPackages: { [key: string]: boolean } = {};
  selectedList: string[] = [];
  createlogs: string = '';
  installLogs: string = '';
  isLoading: boolean = false;
  isUploadLoading: boolean = false;
  uploadProgress = 0;
  uploadComplete = false;
  currentTheme = 'LIGHT';
  dispMessage: string = '';
  selectedPackageName: any = null;
  showLoader: boolean = false; // Flag to control loader visibility
  loadPackage: boolean = false; // Flag to control package loading
  loadingMessage: string = '';
  modalHeading: string = 'Upload Package File'; // Default heading
  uploadPackageForm!: FormGroup;
  uploadFormSubmitted = false;
  uploadFileName!: File | null;
  uploadFileError: string | null = null;
  type: string = '';
   deviceName: string = '';
  category: string = '';
  isBroadband: boolean = false;

  // Whether the Generic Package is already present on the server for the
  // current type + device. Controls the "Upload Generic" vs "Replace Generic"
  // button label and the "Present" indicator badge.
  isGenericPresent: boolean = false;
  isCheckingGeneric: boolean = false;
  isSocReady: boolean = false;

  // Search text used to filter the available platform packages list.
  packageSearch: string = '';

  // Auto-scroll the logs panel as new log lines arrive.
  autoScroll: boolean = true;
  private lastLogsLength: number = 0;

  // --- Asynchronous installation job state ---
  isInstalling: boolean = false;
  installJobId: string | null = null;
  installPhase: string | null = null;
  installStatus: string | null = null; // 'RUNNING' | 'SUCCESS' | 'FAILED'
  installResult: { statusCode: number; logs: string } | null = null;
  installErrorMessage: string | null = null;
  private pollingTimer: ReturnType<typeof setInterval> | null = null;
  private readonly POLL_INTERVAL_MS = 1500;

  // User-friendly labels and display order for installation phases.
  readonly phaseLabels: Record<string, string> = {
    QUEUED: 'Waiting to start',
    COPYING_PACKAGE: 'Copying package to device',
    COPYING_SCRIPT: 'Copying installation script',
    INSTALLING: 'Installing package',
    VERIFYING: 'Verifying installation',
  };
  readonly phaseShortLabels: Record<string, string> = {
    QUEUED: 'Waiting to start',
    COPYING_PACKAGE: 'Copying package',
    COPYING_SCRIPT: 'Copying script',
    INSTALLING: 'Installing',
    VERIFYING: 'Verifying',
  };
  readonly phaseOrder: string[] = Object.keys(this.phaseLabels);

  /**
   * Constructs an instance of the TdkInstallComponent.
   *
   * @param dialogRef - Reference to the dialog opened for this component.
   * @param data - Data passed into the dialog component.
   * @param packagemanagerservice - Service for managing package-related operations.
   * @param _snakebar - Service for displaying snack bar notifications.
   */
  constructor(
    public dialogRef: MatDialogRef<TdkInstallComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private packagemanagerservice: PackageManagerService,
    private _snakebar: MatSnackBar ,
    private themeService: ThemeService
  ) {}

  /**
   * Lifecycle hook that is called after Angular has initialized all data-bound properties of the component.
   *
   * - Initializes the component by fetching package names.
   * - Sets up the `uploadPackageForm` with a `file` form control that is required.
   */
  ngOnInit(): void {
    this.themeService.currentTheme.subscribe((theme) => {
      this.currentTheme = theme;
    });

    if (this.data && typeof this.data === 'object') {
      this.deviceName = this.data.deviceName;
      this.category = this.data.category;
    } else {
      this.deviceName = this.data;
    }
    this.isBroadband = this.category === 'RDKB';
    if (this.isBroadband) {
      this.selectedPackage = 'TDK'; // RDKB devices only support TDK installation
    }
    this.fetchPackageNames(); // Fetch package names on component initialization
    this.checkGenericPackagePresence();
    this.uploadPackageForm = new FormGroup({
      file: new FormControl(null, Validators.required), // Add 'file' control
    });
  }

  /**
   * Auto-scrolls the logs container to the bottom whenever new log content
   * arrives, if the user has left the "Auto-scroll" checkbox enabled.
   */
  ngAfterViewChecked(): void {
    if (!this.autoScroll || !this.logsContainer) {
      return;
    }
    const currentLength = (this.createlogs || '').length;
    if (currentLength !== this.lastLogsLength) {
      this.lastLogsLength = currentLength;
      const el = this.logsContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    }
  }

  /**
   * Clears the polling timer when the component is destroyed so no stray
   * status requests are made after the dialog has closed.
   */
  ngOnDestroy(): void {
    this.clearPollingTimer();
  }

  /**
   * Calls the `isGenericPackagePresent` backend endpoint to determine whether
   * a generic package already exists for the currently selected package type
   * and device. The boolean is used to toggle the top-row button between
   * "Upload Generic Package" and "Replace Generic Package", and to show the
   * green "Present" indicator badge.
   */
  checkGenericPackagePresence(): void {
    if (!this.deviceName || !this.selectedPackage) {
      return;
    }
    this.isCheckingGeneric = true;
    this.packagemanagerservice
      .isGenericPackagePresent(this.selectedPackage, this.deviceName)
      .subscribe({
        next: (res: any) => {
          this.isCheckingGeneric = false;
          // Support both `{ data: true }` and `{ isPresent: true }` shapes,
          // as well as a plain boolean body.
          const flag =
            typeof res === 'boolean'
              ? res
              : res?.data ?? res?.isPresent ?? res?.present ?? false;
          this.isGenericPresent = !!flag;
        },
        error: (err) => {
          this.isCheckingGeneric = false;
          this.isGenericPresent = false;
          console.error('isGenericPackagePresent failed:', err);
        },
      });
  }

  /**
   * Returns the platform package list filtered by the search box text.
   */
  get filteredPackageNames(): string[] {
    const q = (this.packageSearch || '').trim().toLowerCase();
    if (!q) {
      return this.packageNames;
    }
    return this.packageNames.filter((p) => p.toLowerCase().includes(q));
  }

  /**
   * Clears the current logs displayed in the log panel.
   */
  clearLogs(): void {
    this.createlogs = '';
    this.lastLogsLength = 0;
    this.clearInstallationProgress();
  }

  private clearInstallationProgress(): void {
    this.clearPollingTimer();
    this.isInstalling = false;
    this.installJobId = null;
    this.installPhase = null;
    this.installStatus = null;
    this.installResult = null;
    this.installErrorMessage = null;
  }

  /** Copies the current package creation or installation logs to the clipboard. */
  async copyLogs(): Promise<void> {
    if (!this.createlogs) {
      return;
    }
    try {
      await navigator.clipboard.writeText(this.createlogs);
      this._snakebar.open('Logs copied to clipboard', '', { duration: 2000 });
    } catch {
      this._snakebar.open('Unable to copy logs', '', { duration: 2000 });
    }
  }

  /**
   * Refreshes both the available platform packages and the generic-package
   * presence state. Bound to the small refresh icon next to the search box.
   */
  refreshPackageList(): void {
    this.fetchPackageNames();
    this.checkGenericPackagePresence();
  }

  /**
   * Initiates the creation of a package based on the selected package type and device data.
   * Displays a loading message and loader while the process is in progress.
   * Handles the response by updating logs and showing a success or error message via a snackbar.
   *
   * @remarks
   * - The `createPackage` method of `packagemanagerservice` is called with the selected package type and device data.
   * - On success, logs are updated, and a success message is displayed.
   * - On error, an error message is displayed.

   * @returns void
   */
  onCreatePackage() {
    this.clearInstallationProgress();
    this.createlogs = '';
    let createPackageObj = {
      type: this.selectedPackage,
      device: this.deviceName,
    };
    this.loadingMessage = 'Package creation is in progress!';
    this.isLoading = true;
    this.showLoader = true;

    this.packagemanagerservice
      .createPackage(createPackageObj.type, createPackageObj.device)
      .subscribe({
        next: (res) => {
          this.isLoading = false;
          this.showLoader = false;
          this.fetchPackageNames();
          this.createlogs = res.data.logs;
          this._snakebar.open(res.message, '', {
            duration: 3000,
            panelClass: ['success-msg'],
            verticalPosition: 'top',
          });
        },
        error: (err) => {
          this.isLoading = false;
          this.showLoader = false;
          this.createlogs = err.data.logs;
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
   * Closes the modal dialog with the ID 'packageUploadModal'.
   *
   * This method retrieves the modal element from the DOM and uses the Bootstrap
   * modal instance to hide it. If the modal element or its instance is not found,
   * an error is logged to the console. Additionally, it resets the `uploadFileName`
   * property to `null` when the modal is successfully closed.
   *
   * @returns {void}
   */
  closeModal(): void {
    const modalElement = document.getElementById('packageUploadModal');
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        this.uploadFileName = null;
        modal.hide(); // Close the modal
      }
    } else {
      console.error('Modal element not found!');
    }
  }

  /**
   * Handles the file input change event and validates the selected file.
   *
   * @param event - The file input change event containing the selected file.
   *
   * This method performs the following actions:
   * - Retrieves the selected file from the event.
   * - Checks if the file has a valid extension (e.g., `.tgz`, `.tar.gz`).
   * - If valid, updates the form control with the file and clears any error messages.
   * - If invalid, resets the form control and sets an error message.
   */
  onFileChange(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      const fileName = file.name.toLowerCase();
      const validExtensions = ['.tgz', '.tar.gz']; // Allowed file extensions

      // Check if the file has a valid extension
      if (validExtensions.some((ext) => fileName.endsWith(ext))) {
        this.uploadPackageForm.patchValue({ file: file });
        this.uploadFileName = file;
        this.uploadFileError = null;
      } else {
        this.uploadPackageForm.patchValue({ file: null });
        this.uploadFileError = 'Please upload a valid package file';
      }
    }
  }

   /**
   * Starts an asynchronous package installation job and begins polling its
   * status. The request is submitted only once per click; the install button
   * is disabled via `isInstalling` while a job is in flight to prevent
   * duplicate submissions.
   *
   * @remarks
   * - On job creation, the returned `jobId` is stored and status polling begins.
   * - On success or failure, polling stops and the final logs/result are shown.
   * - HTTP 400/500 from the start endpoint surface as an error state.
   *
   * @returns {void}
   */
  onInstallPackage(): void {
    if (this.isInstalling || !this.selectedPackageName) {
      return;
    }

    this.createlogs = '';
    this.installResult = null;
    this.installErrorMessage = null;
    this.installStatus = null;
    this.installPhase = null;
    this.installJobId = null;
    this.isInstalling = true;

    const installPackageObj = {
      type: this.selectedPackage,
      device: this.deviceName,
      packageName: this.selectedPackageName,
    };

    this.packagemanagerservice
      .installPackages(
        installPackageObj.type,
        installPackageObj.device,
        installPackageObj.packageName
      )
      .subscribe({
        next: (job) => {
          const data = job?.data ?? job; // API now nests the job under `data`
          this.installJobId = data?.jobId ?? null;
          this.installPhase = data?.phase ?? null;
          this.installStatus = data?.status ?? 'RUNNING';

          if (!this.installJobId) {
            this.isInstalling = false;
            this.installErrorMessage =
              'Installation could not be started: missing job id.';
            return;
          }
          this.startPollingInstallStatus(this.installJobId);
        },
        error: (err) => {
          this.isInstalling = false;
          const response = err?.error ?? err;
          const message: string =
            response?.message || err?.message || 'Failed to start package installation.';
          this.installErrorMessage = message;
          this._snakebar.open(message, '', {
            duration: 3000,
            panelClass: ['err-msg'],
            horizontalPosition: 'end',
            verticalPosition: 'top',
          });
        },
      });
  }

  /**
   * Polls `getInstallStatus` for the given job every `POLL_INTERVAL_MS` and
   * updates the displayed phase until the job reaches SUCCESS or FAILED.
   */
  private startPollingInstallStatus(jobId: string): void {
    this.clearPollingTimer();
    this.pollingTimer = setInterval(() => {
      this.packagemanagerservice.getInstallStatus(jobId).subscribe({
        next: (job) => this.handleInstallStatusUpdate(job),
        error: (err) => this.handleInstallStatusError(err),
      });
    }, this.POLL_INTERVAL_MS);
  }

  /** Applies a status poll response, stopping polling once the job finishes. */
  private handleInstallStatusUpdate(job: any): void {
    const data = job?.data ?? job; // API now nests the job under `data`
    this.installPhase = data?.phase ?? this.installPhase;
    this.installStatus = data?.status ?? this.installStatus;

    if (this.installStatus !== 'SUCCESS' && this.installStatus !== 'FAILED') {
      return;
    }

    this.clearPollingTimer();
    this.isInstalling = false;
    this.installResult = data?.result ?? null;
    this.createlogs = this.installResult?.logs ?? '';

    if (this.installStatus === 'SUCCESS') {
      this._snakebar.open('Package installed successfully.', '', {
        duration: 3000,
        panelClass: ['success-msg'],
        verticalPosition: 'top',
      });
    } else {
      const message = 'Package installation failed.';
      this.installErrorMessage = message;
      this._snakebar.open(message, '', {
        duration: 3000,
        panelClass: ['err-msg'],
        horizontalPosition: 'end',
        verticalPosition: 'top',
      });
    }
  }

  /** Handles transport-level failures while polling, including expired jobs (404). */
  private handleInstallStatusError(err: any): void {
    this.clearPollingTimer();
    this.isInstalling = false;

    let message: string;
    if (err?.status === 404) {
      message = 'Installation job not found or has expired.';
    } else {
      const response = err?.error ?? err;
      message = response?.message || err?.message || 'Failed to fetch installation status.';
    }
    this.installErrorMessage = message;
    this._snakebar.open(message, '', {
      duration: 3000,
      panelClass: ['err-msg'],
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });
  }

  private clearPollingTimer(): void {
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer);
      this.pollingTimer = null;
    }
  }

  /** Returns the user-friendly label for the current installation phase. */
  get installPhaseLabel(): string {
    if (!this.installPhase) {
      return '';
    }
    return this.phaseLabels[this.installPhase] ?? this.installPhase;
  }

  /** True once the given phase has been passed in the current install job. */
  isPhaseCompleted(phase: string): boolean {
    if (this.installStatus === 'SUCCESS') {
      return true;
    }
    if (!this.installPhase) {
      return false;
    }
    const currentIndex = this.phaseOrder.indexOf(this.installPhase);
    const phaseIndex = this.phaseOrder.indexOf(phase);
    return currentIndex > -1 && phaseIndex > -1 && phaseIndex < currentIndex;
  }

  /** True when the given phase is the currently running phase. */
  isPhaseActive(phase: string): boolean {
    return this.installPhase === phase && this.installStatus === 'RUNNING';
  }

  isPhaseFailed(phase: string): boolean {
    return this.installPhase === phase && this.installStatus === 'FAILED';
  }

  get coloredLogLines(): { text: string; isSuccess: boolean }[] {
    return (this.createlogs || '').split('\n').map((line) => ({
      text: line + '\n',
      isSuccess: /(?:TDK|VTS) Package installed successfully/i.test(line),
    }));
  }

  /**
   * Handles the selection of a package by updating the selected package name.
   *
   * @param packageName - The name of the package that was selected.
   */
  onPackageSelect(packageName: string): void {
    this.selectedPackageName = packageName; // Update the selected package name
  }

  /**
   * Fetches the list of package names based on the selected package and data.
   * Clears any previously displayed messages and resets the selected package name.
   * Subscribes to the package manager service to retrieve the package list.
   *
   * On a successful response:
   * - Logs the response to the console.
   * - Updates the `packageNames` property with the retrieved data.
   * - Displays a message if the response data is null and the status code is 200.
   *
   * On an error response:
   * - Logs the error to the console.
   */
  fetchPackageNames() {
    this.dispMessage = '';
    this.selectedPackageName = '';
    this.isSocReady = false;
    this.loadPackage = true; // Show the loader while fetching package names
    this.packagemanagerservice
      .getPackageList(this.selectedPackage, this.deviceName)
      .subscribe({
        next: (res) => {
          console.log(res);
          this.loadPackage = false;
          this.isSocReady = true;
          this.packageNames = (res.data || []).sort((a: string, b: string) =>
            b.localeCompare(a)
          );
          if (res.data == null && res.statusCode == 200) {
            this.dispMessage = res.message;
          }
        },
        error: (err) => {
          console.log(err);
          this.loadPackage = false;
          this.packageNames = [];
          this.isSocReady = false;

          const response = err?.error ?? err;
          const statusCode = response?.statusCode ?? err?.status;
          const message = response?.message ?? err?.message ?? '';

          if (
            statusCode === 400 &&
            message.toLowerCase().includes('soc name not found')
          ) {
            this.dispMessage =
              'Please update the SoC name for this device before installation.';
          } else {
            this.dispMessage = message || 'Unable to load available packages.';
          }
        },
      });
  }

  /**
   * Handles the submission of the package upload form.
   *
   * This method validates the form, checks for the presence of a file to upload,
   * and determines the appropriate API to call based on the type of package.
   * It provides feedback to the user via a snackbar and resets the form upon success.
   *
   * @returns {void} This method does not return a value.
   *
   * @remarks
   * - If the form is invalid, the method exits early and sets `isLoading` to `false`.
   * - If no file is selected, an error message is set in `uploadFileError`.
   * - Depending on the `type` property, either `uploadGenericPackage` or `uploadPackage`
   *   is called on the `packagemanagerservice`.
   * - Success and error responses are handled with appropriate snackbar messages.
   */
  uploadPackageSubmit(): void {
    this.uploadFormSubmitted = true;

    if (this.uploadPackageForm.invalid) {
      this.isUploadLoading = false;
      return;
    }

    if (this.uploadFileName) {
      this.uploadFileError = null;
      // Determine which API to call based on the type
      const uploadFile = this.uploadFileName as File;
      this.isUploadLoading = true;
      this.uploadProgress = 0;
      this.uploadComplete = false;
      if (this.type === 'generic') {
        this.packagemanagerservice
          .uploadGenericPackage(this.selectedPackage, this.deviceName, uploadFile)
          .subscribe({
            next: (event) => {
              if (event.type === HttpEventType.UploadProgress) {
                this.uploadProgress = event.total
                  ? Math.round((event.loaded / event.total) * 100)
                  : 0;
                return;
              }
              if (event.type !== HttpEventType.Response) {
                return;
              }
              this.fetchPackageNames();
              this.checkGenericPackagePresence();
              this.uploadProgress = 100;
              this.uploadComplete = true;
              this.isUploadLoading = false;
              this._snakebar.open(event.body?.message || 'Package uploaded successfully.', '', {
                duration: 3000,
                panelClass: ['success-msg'],
                verticalPosition: 'top',
              });
              this.resetForm();
              this.closeModal();
            },
            error: (err) => {
              this.isUploadLoading = false;
              this.uploadProgress = 0;
              this.uploadComplete = false;
              this._snakebar.open(err.message, '', {
                duration: 2000,
                panelClass: ['err-msg'],
                horizontalPosition: 'end',
                verticalPosition: 'top',
              });
            },
          });
      } else {
        this.packagemanagerservice
          .uploadPackage(this.selectedPackage, this.deviceName, uploadFile)
          .subscribe({
            next: (event) => {
              if (event.type === HttpEventType.UploadProgress) {
                this.uploadProgress = event.total
                  ? Math.round((event.loaded / event.total) * 100)
                  : 0;
                return;
              }
              if (event.type !== HttpEventType.Response) {
                return;
              }
              this.isUploadLoading = false;
              this.fetchPackageNames(); // Fetch package names again after upload
              this.uploadProgress = 100;
              this.uploadComplete = true;
              this._snakebar.open(event.body?.message || 'Package uploaded successfully.', '', {
                duration: 3000,
                panelClass: ['success-msg'],
                verticalPosition: 'top',
              });
              this.resetForm();
              this.closeModal();
            },
            error: (err) => {
              this.isUploadLoading = false;
              this.uploadProgress = 0;
              this.uploadComplete = false;
              this._snakebar.open(err.message, '', {
                duration: 2000,
                panelClass: ['err-msg'],
                horizontalPosition: 'end',
                verticalPosition: 'top',
              });
            },
          });
      }
    } else {
      this.uploadFileError = 'Please select a file to upload.';
    }
  }

  /**
   * Resets the upload package form to its initial state.
   *
   * - Clears the form fields and resets the form submission flag.
   * - Clears the selected file and any associated error messages.
   * - Resets the file input element to ensure no file is selected.
   *
   * @returns {void}
   */
  resetForm(): void {
    this.uploadPackageForm.reset(); // Reset the form
    this.uploadFileName = null; // Clear the selected file
    this.uploadFileError = null; // Clear any error messages
    this.uploadFormSubmitted = false; // Reset the form submission flag
     this.uploadProgress = 0;
    this.uploadComplete = false;
    if (this.fileInput) {
      this.fileInput.nativeElement.value = ''; // Clear the file input
    }
  }

  /**
   * Handles the tab click event and updates the selected package.
   *
   * @param event - The event object triggered by the tab click.
   *                It contains information about the clicked tab.
   *
   * Updates:
   * - Extracts the text label of the clicked tab.
   * - Logs the label to the console.
   * - Sets the `selectedPackage` property to the label of the clicked tab.
   * - Calls `fetchPackageNames()` to retrieve package names.
   */
  onTabClick(event: any) {
    let label = event.tab.textLabel;
    this.selectedPackage = label;
    this.clearLogs();
    this.packageNames = []; // Clear old list
    this.loadPackage = true;
    this.fetchPackageNames();
    this.checkGenericPackagePresence();
  }

  packageChange(value: string) {
    console.log(value);
  }

  /**
   * Handles the change event of a checkbox.
   *
   * @param name - The name associated with the checkbox.
   * @param event - The change event triggered by the checkbox.
   *
   * Updates:
   * - If the checkbox is checked, adds the name to `selectedList`.
   * - If unchecked, removes the name from `selectedList`.
   */
  onCheckboxChange(name: string, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.selectedList.push(name);
    } else {
      this.selectedList = this.selectedList.filter((n) => n !== name);
    }
  }

  /**
   * Opens a modal for uploading a package file. The modal's heading and behavior
   * are determined by the specified type. Resets the form before opening the modal.
   *
   * @param type - The type of package to upload. If 'generic', the modal heading
   *               will indicate a generic package upload; otherwise, it will
   *               indicate a specific package upload.
   * @param event - The event object associated with the action triggering the modal.
   *                The default action of the event is prevented.
   *
   * @throws Will log an error to the console if the modal element is not found in the DOM.
   */
  openUploadModal(type: string, event: Event): void {
    event.preventDefault();
    this.resetForm();
    this.type = type;
     if (type === 'generic') {
      const action = this.isGenericPresent ? 'Replace' : 'Upload';
      this.modalHeading =
        action + ' Generic ' + this.selectedPackage + ' Package File';
    } else {
      this.modalHeading =
        'Upload Platform ' + this.selectedPackage + ' Package File';
    }

    // Open the modal programmatically
    const modalElement = document.getElementById('packageUploadModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    } else {
      console.error('Modal element not found!');
    }
  }

  /**
   * Closes the dialog and returns a `false` value to the caller.
   * This method is typically used to dismiss the dialog without performing any action.
   */
  close() {
    this.dialogRef.close(false);
  }
}
