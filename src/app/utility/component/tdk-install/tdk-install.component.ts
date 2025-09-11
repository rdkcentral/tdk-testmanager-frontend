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
import { Component, Inject, ViewChild, ElementRef } from '@angular/core';
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
export class TdkInstallComponent {
  @ViewChild('fileInput') fileInput!: ElementRef;

  selectedPackage = 'TDK';
  packageNames: string[] = [];
  selectedPackages: { [key: string]: boolean } = {};
  selectedList: string[] = [];
  createlogs: string = '';
  installLogs: string = '';
  isLoading: boolean = false;
  isUploadLoading: boolean = false;
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
    private _snakebar: MatSnackBar
  ) {}

  /**
   * Lifecycle hook that is called after Angular has initialized all data-bound properties of the component.
   *
   * - Initializes the component by fetching package names.
   * - Sets up the `uploadPackageForm` with a `file` form control that is required.
   */
  ngOnInit(): void {
    this.fetchPackageNames(); // Fetch package names on component initialization
    this.uploadPackageForm = new FormGroup({
      file: new FormControl(null, Validators.required), // Add 'file' control
    });
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
    this.createlogs = '';
    let createPackageObj = {
      type: this.selectedPackage,
      device: this.data,
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
   * Initiates the installation of a package by invoking the package manager service.
   * Displays a loading message and loader during the process.
   * Handles success and error responses by updating the UI and showing appropriate messages.
   *
   * @remarks
   * - On success, logs are updated, and a success message is displayed.
   * - On error, an error message is displayed.
   *
   * @returns {void}
   */
  onInstallPackage() {
    this.createlogs = '';
    this.loadingMessage = 'Package installation is in progress. Please wait...';
    this.isLoading = true;
    this.showLoader = true; // Show the loader
    let installPackageObj = {
      type: this.selectedPackage,
      device: this.data,
      packageName: this.selectedPackageName,
    };
    this.packagemanagerservice
      .installPackages(
        installPackageObj.type,
        installPackageObj.device,
        installPackageObj.packageName
      )
      .subscribe({
        next: (res) => {
          this.showLoader = false;
          this.isLoading = false;
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
            duration: 3000,
            panelClass: ['err-msg'],
            horizontalPosition: 'end',
            verticalPosition: 'top',
          });
        },
      });
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
    this.loadPackage = true; // Show the loader while fetching package names
    this.packagemanagerservice
      .getPackageList(this.selectedPackage, this.data)
      .subscribe({
        next: (res) => {
          console.log(res);
          this.loadPackage = false;
          this.packageNames = (res.data || []).sort((a: string, b: string) =>
            b.localeCompare(a)
          );
          if (res.data == null && res.statusCode == 200) {
            this.dispMessage = res.message;
          }
        },
        error: (err) => {
          console.log(err);
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
      if (this.type === 'generic') {
        this.packagemanagerservice
          .uploadGenericPackage(this.selectedPackage, this.data, uploadFile)
          .subscribe({
            next: (res) => {
              this.fetchPackageNames();
              this.isUploadLoading = false;
              this._snakebar.open(res.message, '', {
                duration: 3000,
                panelClass: ['success-msg'],
                verticalPosition: 'top',
              });
              this.resetForm();
              this.closeModal();
            },
            error: (err) => {
              this.isUploadLoading = false;
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
          .uploadPackage(this.selectedPackage, this.data, uploadFile)
          .subscribe({
            next: (res) => {
              this.isUploadLoading = false;
              this.fetchPackageNames(); // Fetch package names again after upload
              this._snakebar.open(res.message, '', {
                duration: 3000,
                panelClass: ['success-msg'],
                verticalPosition: 'top',
              });
              this.resetForm();
              this.closeModal();
            },
            error: (err) => {
              this.isUploadLoading = false;
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
    this.createlogs = '';
    this.packageNames = []; // Clear old list
    this.loadPackage = true;
    this.fetchPackageNames();
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
      this.modalHeading =
        'Upload Generic ' + this.selectedPackage + ' Package File';
    } else {
      this.modalHeading = 'Upload ' + this.selectedPackage + ' Package File';
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
