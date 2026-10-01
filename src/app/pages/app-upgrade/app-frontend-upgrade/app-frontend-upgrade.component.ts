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
import {
  Component,
  ElementRef,
  OnInit,
  OnDestroy,
  ViewChild,
  NgZone,
} from '@angular/core';
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
 * It handles both automated build generation (via tag/branch) and manual build upload,
 * similar to the backend service upgrade page.
 *
 * Features:
 * - Toggle between Build Generation and Build Upload
 * - Automated Angular build generation with real-time log streaming via SSE
 * - Manual build file upload with validation and progress tracking
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
export class AppFrontendUpgradeComponent implements OnInit, OnDestroy {
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

  // Build Generation / Upload toggle
  buildTabIndex = 0;
  buildGenerationForm: FormGroup;
  buildGenerationFormSubmitted = false;
  buildGenerationInProgress = false;
  buildGenerationExecutionId: string | null = null;
  buildGenerationStatus: string | null = null;
  buildGenerationLogs: string = '';
  private buildLogEventSource: EventSource | null = null;

  /**
   * Constructor: Initializes forms and injects required services.
   */
  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<AppFrontendUpgradeComponent>,
    private appFrontendUpgradeService: AppUpgradeService,
    private ngZone: NgZone,
  ) {
    // Initialize forms
    this.uploadForm = this.fb.group({
      warFile: [null, Validators.required],
    });

    this.upgradeForm = this.fb.group({
      backupLocation: [''],
      buildLocation: ['', Validators.required],
    });

    // Initialize build generation form
    this.buildGenerationForm = this.fb.group({
      releaseTag: ['', Validators.required],
    });
  }

  /**
   * Angular lifecycle hook for component initialization.
   */
  ngOnInit(): void {
    // Any initialization code can go here
  }

  /**
   * Angular lifecycle hook for component destruction.
   * Cleans up SSE connection.
   */
  ngOnDestroy(): void {
    this.closeLogStream();
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
   * Switches between build generation and build upload tabs.
   * @param tabIndex Tab index to switch to (0 = generation, 1 = upload)
   */
  switchBuildTab(tabIndex: number): void {
    this.buildTabIndex = tabIndex;
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
        }),
      );

    upload$.subscribe({
      next: (event) => {
        if (event.type === HttpEventType.Response) {
          this.uploadComplete = true;
          console.log('Upload complete:', event.body);

          const buildLocationControl = this.upgradeForm.get('buildLocation');
          if (buildLocationControl) {
            buildLocationControl.setValue(event.body.buildlocation);
            buildLocationControl.updateValueAndValidity();
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
   * Initiates Angular build generation for a given release tag or branch name.
   * Establishes SSE connection for real-time log streaming.
   */
  generateBuild(): void {
    this.buildGenerationFormSubmitted = true;
    if (this.buildGenerationForm.invalid) {
      return;
    }

    const releaseTag = this.buildGenerationForm.get('releaseTag')?.value;
    this.appFrontendUpgradeService.generateAngularBuild(releaseTag).subscribe({
      next: (response) => {
        if (response.data?.status === 'RUNNING' && response.data?.executionId) {
          this.buildGenerationExecutionId = response.data.executionId;
          this.buildGenerationInProgress = true;
          this.buildGenerationLogs = '';
          this.buildGenerationStatus = 'PENDING';
          this.initializeLogStreaming();
        } else {
          this.buildGenerationInProgress = false;
        }
      },
      error: (err) => {
        this.buildGenerationInProgress = false;
        this.snackBar.open(err.error?.message || err.message, '', {
          duration: 2000,
          panelClass: ['err-msg'],
          horizontalPosition: 'end',
          verticalPosition: 'top',
        });
      },
    });
  }

  /**
   * Initializes Server-Sent Events (SSE) connection for real-time log streaming.
   * Listens for log, status, complete, and error events from backend.
   */
  private initializeLogStreaming(): void {
    if (!this.buildGenerationExecutionId) return;

    const logStreamUrl =
      this.appFrontendUpgradeService.getAngularBuildLogStreamUrl(
        this.buildGenerationExecutionId,
      );
    this.buildLogEventSource = new EventSource(logStreamUrl);

    // Listen for status updates
    this.buildLogEventSource.addEventListener('status', (event) => {
      this.ngZone.run(() => {
        const statusData = JSON.parse(event.data);
        if (statusData.message) {
          this.buildGenerationLogs += statusData.message + '\n';
          this.scrollToBottomOfLogs();
        }
      });
    });

    // Listen for log events
    this.buildLogEventSource.addEventListener('log', (event) => {
      this.ngZone.run(() => {
        if (event.data && event.data.trim() !== '') {
          try {
            const logData = JSON.parse(event.data);
            if (logData.message) {
              this.buildGenerationLogs += logData.message + '\n';
            }
          } catch {
            // If parsing fails, append raw data
            this.buildGenerationLogs += event.data + '\n';
          }
          this.scrollToBottomOfLogs();
        }
      });
    });

    // Listen for completion event
    this.buildLogEventSource.addEventListener('complete', (event) => {
      this.ngZone.run(() => {
        const completeData = JSON.parse(event.data);
        this.buildGenerationStatus = completeData.status;
        this.buildGenerationInProgress = false;

        // Add completion message to logs
        const completionMsg = `\n=== ${completeData.status} ===\n${completeData.message}\n`;
        this.buildGenerationLogs += completionMsg;
        this.scrollToBottomOfLogs();

        // Update form with build location if successful
        if (completeData.status === 'SUCCESS' && completeData.upgradeDir) {
          this.upgradeForm.patchValue({
            buildLocation: completeData.upgradeDir,
          });

          this.snackBar.open('Angular build generated successfully!', '', {
            duration: 5000,
            panelClass: ['success-msg'],
          });
        } else if (completeData.status === 'FAILED') {
          this.snackBar.open(
            `Angular build generation failed: ${completeData.message}`,
            '',
            {
              duration: 5000,
              panelClass: ['err-msg'],
            },
          );
        }

        this.closeLogStream();
      });
    });

    // Listen for error events from backend
    this.buildLogEventSource.addEventListener('error', (event: any) => {
      this.ngZone.run(() => {
        if (event.data) {
          const errorData = JSON.parse(event.data);
          this.buildGenerationStatus = errorData.status || 'ERROR';
          this.buildGenerationInProgress = false;

          const errorMsg = `\n=== ERROR ===\n${errorData.message || 'Unknown error occurred'}\n`;
          this.buildGenerationLogs += errorMsg;
          this.scrollToBottomOfLogs();

          this.snackBar.open(
            errorData.message || 'Angular build generation error',
            '',
            {
              duration: 5000,
              panelClass: ['err-msg'],
            },
          );

          this.closeLogStream();
        }
      });
    });

    // Handle SSE connection errors
    this.buildLogEventSource.onerror = () => {
      this.ngZone.run(() => {
        if (this.buildGenerationInProgress) {
          this.buildGenerationLogs +=
            '\n[Connection lost. Please check your network and try again.]\n';
          this.scrollToBottomOfLogs();
          this.buildGenerationStatus = 'ERROR';
          this.buildGenerationInProgress = false;
          this.closeLogStream();

          this.snackBar.open(
            'Connection lost during Angular build generation',
            '',
            {
              duration: 5000,
              panelClass: ['err-msg'],
            },
          );
        }
      });
    };
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
      .upgradeFrontendApplication(
        upgradeObj.uploadLocation,
        upgradeObj.backupPath,
      )
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
    this.buildGenerationForm.reset();

    // Reset submission flags
    this.uploadFormSubmitted = false;
    this.upgradeFormSubmitted = false;
    this.buildGenerationFormSubmitted = false;

    // Reset build generation state
    this.buildGenerationInProgress = false;
    this.buildGenerationExecutionId = null;
    this.buildGenerationStatus = null;
    this.buildGenerationLogs = '';
  }

  /**
   * Closes the dialog and resets forms.
   */
  close() {
    this.closeLogStream();
    this.resetForms();
    this.dialogRef.close();
  }

  /**
   * Scrolls the log display to show the most recent entries.
   */
  private scrollToBottomOfLogs(): void {
    setTimeout(() => {
      const logsElement = document.querySelector('.build-generation-logs');
      if (logsElement) {
        logsElement.scrollTop = logsElement.scrollHeight;
      }
    }, 100);
  }

  /**
   * Closes the SSE connection and cleans up resources.
   */
  private closeLogStream(): void {
    if (this.buildLogEventSource) {
      this.buildLogEventSource.close();
      this.buildLogEventSource = null;
    }
  }

  /**
   * Determines if user can proceed to upgrade step.
   * @returns true if file upload or build generation completed successfully
   */
  canProceedToUpgrade(): boolean {
    return this.uploadComplete || this.buildGenerationStatus === 'SUCCESS';
  }
}
