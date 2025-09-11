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
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatTabsModule, MatTabGroup } from '@angular/material/tabs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogRef } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { finalize } from 'rxjs/operators';
import { AppUpgradeService } from '../../../services/app-upgrade.service';
import { HttpEventType } from '@angular/common/http';
import { map } from 'rxjs/operators';

/**
 * AppFrontendUpgradeComponent
 * -------------------------------------------------
 * This component provides the UI and logic for upgrading the Angular application frontend.
 * It handles file upload, upgrade initiation, progress tracking, and log display.
 *
 * Features:
 * - Stepper/tab-based UI for build upload and upgradation steps
 * - File upload with validation and progress
 * - Upgrade process initiation and status tracking
 * - Display of upgradation and deployment logs
 * - Uses Angular Material and Bootstrap for UI
 */
@Component({
  selector: 'app-app-frontend-upgrade',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatTabsModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatProgressBarModule,
  ],
  templateUrl: './app-frontend-upgrade.component.html',
  styleUrl: './app-frontend-upgrade.component.css',
})
export class AppFrontendUpgradeComponent {
  @ViewChild('fileInput') fileInput!: ElementRef;
  @ViewChild('tabGroup') tabGroup!: MatTabGroup;

  selectedFile: File | null = null;
  uploading = false;
  progress = 0;
  uploadComplete = false;
  fileSelected = false;
  uploadAttempted = false;
  selectedTabIndex = 0;
  upgradationlogs: string = '';

  // Forms
  uploadForm: FormGroup;
  upgradeForm: FormGroup;

  // Form submission flags
  uploadFormSubmitted = false;
  upgradeFormSubmitted = false;

  uploadFileName!: File | null;

  uploadFileError: string | null = null;

  showDeploymentLogs = false;
  deploymentLogs: string = '';
  upgradeInProgress: boolean = false;

  isUpgradeCompleted: boolean = false;
  /**
   * Constructor: Initializes forms and injects required services.
   */
  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<AppFrontendUpgradeComponent>,
    private appFrontendUpgradeService: AppUpgradeService
  ) {
    // Initialize forms
    this.uploadForm = this.fb.group({
      warFile: [null, Validators.required],
    });

    this.upgradeForm = this.fb.group({
      backupLocation: [''],
      buildLocation: ['', Validators.required],
    });
  }

  /**
   * Angular lifecycle hook for component initialization.
   */
  ngOnInit(): void {
    // Any initialization code can go here
  }

  /**
   * Handles file input change event.
   * Validates file type and updates form state.
   * @param event File input change event
   */
  onFileChange(event: any) {
    const file = event.target.files[0];

    if (file) {
      if (
        file.name.toLowerCase().endsWith('.zip') ||
        file.name.toLowerCase().endsWith('.tar.gz')
      ) {
        this.uploadFileError = null;
        this.fileSelected = true;
        this.selectedFile = file;
        this.uploadForm.patchValue({ file: file });
        this.uploadFileName = file;
        this.uploadFileError = null;
      } else {
        this.uploadFileError = 'Please select a valid .zip/.tar.gz file';
        this.fileSelected = false;
        this.selectedFile = null;
        this.uploadFileName = null;
        this.uploadFileError = null;
      }
    } else {
      this.uploadFileError = 'No file selected';
      this.fileSelected = false;
      this.selectedFile = null;
      this.uploadForm.patchValue({
        warFile: null,
      });
    }
  }

  /**
   * Toggles the visibility of deployment logs.
   * Fetches logs if shown for the first time.
   */
  toggleDeploymentLogs() {
    this.showDeploymentLogs = !this.showDeploymentLogs;

    // If showing logs for the first time, fetch them
    if (this.showDeploymentLogs && !this.deploymentLogs) {
      this.fetchDeploymentLogs();
    }
  }

  /**
   * Fetches deployment logs from the backend service.
   */
  fetchDeploymentLogs() {
    // Replace this with your actual API call to get deployment logs
    const deploymentLogPath = '/mnt/appUpgrade/deployment_logs';
    this.appFrontendUpgradeService
      .getFrontEndDeploymentLogs(deploymentLogPath)
      .subscribe({
        next: (response) => {
          this.deploymentLogs = response.content;
        },
        error: (error) => {
          console.error('Error fetching deployment logs:', error);
          this.deploymentLogs = 'Failed to load deployment logs.';
        },
      });
  }

  /**
   * Moves to the next tab (Upgradation step).
   */
  nextTab() {
    if (this.tabGroup) {
      this.selectedTabIndex = 1; // Move to the second tab
      this.tabGroup.selectedIndex = 1;
    }
  }

  /**
   * Handles tab click event and updates selected tab index.
   * @param event Tab change event
   */
  onTabClick(event: any) {
    this.selectedTabIndex = event.index;
  }

  /**
   * Handles the build file upload process.
   * Validates file selection, tracks upload progress, and updates UI on completion.
   */
  uploadFile(): void {
    this.uploadFormSubmitted = true;

    if (
      !this.fileInput.nativeElement.files ||
      this.fileInput.nativeElement.files.length === 0
    ) {
      this.fileSelected = false;
      this.uploadAttempted = true;
      return;
    }

    this.uploadAttempted = true;
    this.uploading = true;
    this.progress = 0;
    this.uploadComplete = false;

    const uploadFile = this.uploadFileName as File;

    // Create upload progress observer
    const upload$ = this.appFrontendUpgradeService
      .uploadBuildFile(uploadFile)
      .pipe(
        // Update progress based on actual upload progress events
        map((event) => {
          if (event.type === HttpEventType.UploadProgress) {
            this.progress = Math.round((100 * event.loaded) / event.total!);
          }
          return event;
        }),
        finalize(() => {
          this.uploading = false;
          if (this.progress !== 100) {
            this.progress = 100; // Ensure progress completes
          }
        })
      );

    upload$.subscribe({
      next: (event) => {
        if (event.type === HttpEventType.Response) {
          this.uploadComplete = true;
          console.log('Upload complete:', event.body);

          const warLocationControl = this.upgradeForm.get('buildLocation');
          if (warLocationControl) {
            warLocationControl.setValue(event.body.buildlocation);
            warLocationControl.updateValueAndValidity();
          }

          this.snackBar.open(event.body.message, '', {
            duration: 3000,
            panelClass: ['success-msg'],
            verticalPosition: 'top',
          });
        }
      },
      error: (err) => {
        this.uploadComplete = false;
        this.snackBar.open(err.message, '', {
          duration: 2000,
          panelClass: ['err-msg'],
          horizontalPosition: 'end',
          verticalPosition: 'top',
        });
      },
    });
  }

  /**
   * Initiates the frontend upgrade process.
   * Validates form, resets state, and calls backend service for upgrade.
   */
  upgrade() {
    this.upgradeFormSubmitted = true;

    if (this.upgradeForm.invalid) {
      return;
    }
    // Reset previous upgrade state and logs
    this.upgradationlogs = '';
    this.isUpgradeCompleted = false;
    this.showDeploymentLogs = false;
    this.deploymentLogs = '';

    this.upgradeInProgress = true;

    let upgradeObj = {
      backupPath: this.upgradeForm.value.backupLocation,
      uploadLocation: this.upgradeForm.value.buildLocation,
    };
    this.appFrontendUpgradeService
      .upgradeFrontendApplication(upgradeObj.uploadLocation,upgradeObj.backupPath)
      .subscribe({
        next: (res) => {
          setTimeout(() => {
            this.upgradeInProgress = false;

            this.upgradationlogs = res.status;
            this.isUpgradeCompleted = true;
            this.snackBar.open(res.status, '', {
              duration: 3000,
              panelClass: ['success-msg'],
              verticalPosition: 'top',
            });
          }, 3000);
        },
        error: (err) => {
          this.upgradeInProgress = false;
          this.snackBar.open(err.message, '', {
            duration: 2000,
            panelClass: ['err-msg'],
            horizontalPosition: 'end',
            verticalPosition: 'top',
          });
        },
      });
  }

  /**
   * Resets all forms, file input, and related state variables.
   */
  resetForms() {
    // Reset file input
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
    this.selectedFile = null;
    this.fileSelected = false;
    this.uploadAttempted = false;
    this.uploadFileError = null;
    this.uploadComplete = false;
    this.uploading = false;
    this.progress = 0;

    // Reset forms
    this.uploadForm.reset();
    this.upgradeForm.reset();

    // Reset submission flags
    this.uploadFormSubmitted = false;
    this.upgradeFormSubmitted = false;
  }

  /**
   * Closes the dialog and resets forms.
   */
  close() {
    this.resetForms();
    this.dialogRef.close();
  }
}
