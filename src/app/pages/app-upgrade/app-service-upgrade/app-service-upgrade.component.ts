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
import { Component, ElementRef, OnInit, ViewChild, NgZone} from '@angular/core';
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
import { of } from 'rxjs';
import { delay, finalize } from 'rxjs/operators';
import { AppUpgradeService } from '../../../services/app-upgrade.service';
import { HttpEventType } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { interval, Subscription } from 'rxjs';
import { switchMap, takeWhile, catchError } from 'rxjs/operators';

/**
 * AppServiceUpgradeComponent
 * -------------------------------------------------
 * This component manages the UI and logic for upgrading the backend service (WAR file).
 * It provides a stepper/tab-based interface for uploading the WAR file and performing the upgrade.
 * Features:
 * - File upload with validation and progress tracking
 * - Upgrade initiation and backend health check
 * - Display of upgradation and deployment logs
 * - Uses Angular Material and Bootstrap for UI
 */
@Component({
  selector: 'app-app-service-upgrade',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatTabsModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatProgressBarModule,
  ],
  templateUrl: './app-service-upgrade.component.html',
  styleUrl: './app-service-upgrade.component.css',
})
export class AppServiceUpgradeComponent implements OnInit {
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
  private healthCheckSubscription: Subscription | null = null;
  isBackendUp = false;
  checkingBackendStatus = false;
  isBackendServiceNotUpgraded = false;

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
   // Add these properties to your class
  warTabIndex = 0;
  warGenerationForm: FormGroup;
  warGenerationFormSubmitted = false;
  warGenerationInProgress = false;
  warGenerationExecutionId: string | null = null;
  warGenerationStatus: string | null = null;
  warGenerationLogs: string = '';
  private warLogEventSource: EventSource | null = null;

  /**
   * Constructor: Initializes forms and injects required services.
   */
  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<AppServiceUpgradeComponent>,
    private appBackendUpgradeService: AppUpgradeService,
    private ngZone: NgZone
  ) {
    // Initialize forms
    this.uploadForm = this.fb.group({
      warFile: [null, Validators.required],
    });

    this.upgradeForm = this.fb.group({
      backupLocation: [''],
      warLocation: ['', Validators.required],
    });

    // Initialize war generation form
    this.warGenerationForm = this.fb.group({
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
   * Cleans up backend health check subscription.
   */
  ngOnDestroy(): void {
    // Clean up subscription when component is destroyed
    if (this.healthCheckSubscription) {
      this.healthCheckSubscription.unsubscribe();
    }
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
      if (file.name.toLowerCase().endsWith('.war')) {
        this.uploadFileError = null;
        this.fileSelected = true;
        this.selectedFile = file;
        this.uploadForm.patchValue({ file: file });
        this.uploadFileName = file;
        this.uploadFileError = null;
      } else {
        this.uploadFileError = 'Please select a valid .war file';
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
    this.appBackendUpgradeService.getDeploymentLogs().subscribe({
      next: (response) => {
        this.deploymentLogs = response.data?.logContent;
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
   * Checks the backend service status by polling the health endpoint.
   * Updates UI based on backend status.
   */
  checkBackendServiceStatus(): void {
    this.checkingBackendStatus = true;
    this.isBackendUp = false;

    // Stop any existing subscription
    if (this.healthCheckSubscription) {
      this.healthCheckSubscription.unsubscribe();
      this.healthCheckSubscription = null;
    }

    // Check status every 2 seconds
    this.healthCheckSubscription = interval(2000)
      .pipe(
        switchMap(() =>
          this.appBackendUpgradeService.isBackendServiceUpgraded().pipe(
            // Handle errors within the inner Observable to prevent termination of interval
            catchError((error) => {
              this.isBackendServiceNotUpgraded = true;
              // Return a default response to continue the stream
              return of({ data: { status: 'ERROR' } });
            })
          )
        ),
        takeWhile((response) => {
          // Continue polling until backend is UP or an error occurs
          const isUp = response?.status === 'UP';
          if (isUp) {
            this.isBackendUp = true;
            this.checkingBackendStatus = false;
            this.upgradeInProgress = false;
          }
          return !isUp && this.checkingBackendStatus;
        }, true) // Include the last value
      )
      .subscribe({
        next: (response) => {
          if (response?.status !== 'UP') {
            this.isBackendServiceNotUpgraded = true;
          }
        },
        error: (error) => {
          // This should rarely happen now with inner catchError
          this.checkingBackendStatus = false;
          console.error('Unhandled backend health check error:', error);
        },
        complete: () => {
          this.checkingBackendStatus = false;
        },
      });
  }

  /**
   * Handles the WAR file upload process.
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
    const upload$ = this.appBackendUpgradeService
      .uploadWarFile(uploadFile)
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
          console.log('File location:', event.body.data.fileLocation);
         
            const warLocationControl = this.upgradeForm.get('warLocation');
            if (warLocationControl) {
              warLocationControl.setValue(event.body.data.fileLocation);
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
   * Initiates the backend service upgrade process.
   * Validates form, resets state, and calls backend service for upgrade.
   */
  upgrade() {
    this.upgradeFormSubmitted = true;

    if (this.upgradeForm.invalid) {
      return;
    }
     // Reset previous upgrade state and logs
    this.upgradationlogs = '';
    this.showDeploymentLogs = false;
    this.deploymentLogs = '';
    this.upgradeInProgress = true;

    let upgradeObj = {
      backupLocation: this.upgradeForm.value.backupLocation,
      warLocation: this.upgradeForm.value.warLocation,
    };
    this.appBackendUpgradeService
      .upgradeServiceApplication(
        upgradeObj.backupLocation,
        upgradeObj.warLocation
      )
      .subscribe({
        next: (res) => {
          this.upgradationlogs = res.data.message;
          this.snackBar.open(res.message, '', {
            duration: 3000,
            panelClass: ['success-msg'],
            verticalPosition: 'top',
          });

          // Add a slight delay to allow upgrade process to begin
          setTimeout(() => {
            this.checkBackendServiceStatus();
          }, 1000);
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

   /**
   * Initiates WAR generation for a given release tag.
   * Establishes SSE connection for real-time log streaming.
   */
  generateWar(): void {
    this.warGenerationFormSubmitted = true;
    if (this.warGenerationForm.invalid) {
      return;
    }

    const releaseTag = this.warGenerationForm.get('releaseTag')?.value;
    this.appBackendUpgradeService.generateWar(releaseTag).subscribe({
      next: (response) => {
        if (response.data?.status === 'RUNNING' && response.data?.executionId) {
          this.warGenerationExecutionId = response.data.executionId;
          this.warGenerationInProgress = true;
          this.warGenerationLogs = '';
          this.warGenerationStatus = 'PENDING';
          this.initializeLogStreaming();
        } else {
          this.warGenerationInProgress = false;
        }
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
   * Initializes Server-Sent Events (SSE) connection for real-time log streaming.
   * Listens for log, status, complete, and error events from backend.
   */
  private initializeLogStreaming(): void {
    if (!this.warGenerationExecutionId) return;

    const logStreamUrl =
      this.appBackendUpgradeService.getWarGenerationLogStreamUrl(
        this.warGenerationExecutionId,
      );
    this.warLogEventSource = new EventSource(logStreamUrl);

    // Listen for status updates
    this.warLogEventSource.addEventListener('status', (event) => {
      this.ngZone.run(() => {
        const statusData = JSON.parse(event.data);
        if (statusData.message) {
          this.warGenerationLogs += statusData.message + '\n';
          this.scrollToBottomOfLogs();
        }
      });
    });

    // Listen for log events
    this.warLogEventSource.addEventListener('log', (event) => {
      this.ngZone.run(() => {
        if (event.data && event.data.trim() !== '') {
          try {
            const logData = JSON.parse(event.data);
            if (logData.message) {
              this.warGenerationLogs += logData.message + '\n';
            }
          } catch {
            // If parsing fails, append raw data
            this.warGenerationLogs += event.data + '\n';
          }
          this.scrollToBottomOfLogs();
        }
      });
    });

    // Listen for completion event
    this.warLogEventSource.addEventListener('complete', (event) => {
      this.ngZone.run(() => {
        const completeData = JSON.parse(event.data);
        this.warGenerationStatus = completeData.status;
        this.warGenerationInProgress = false;

        // Add completion message to logs
        const completionMsg = `\n=== ${completeData.status} ===\n${completeData.message}\n`;
        this.warGenerationLogs += completionMsg;
        this.scrollToBottomOfLogs();

        // Update form with war location if successful
        if (completeData.status === 'SUCCESS' && completeData.upgradeDir) {
          this.upgradeForm.patchValue({
            warLocation: completeData.upgradeDir,
          });

          this.snackBar.open('WAR generated successfully!', '', {
            duration: 5000,
            panelClass: ['success-msg'],
          });
        } else if (completeData.status === 'FAILED') {
          this.snackBar.open(
            `WAR generation failed: ${completeData.message}`,
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
    this.warLogEventSource.addEventListener('error', (event: any) => {
      this.ngZone.run(() => {
        if (event.data) {
          const errorData = JSON.parse(event.data);
          this.warGenerationStatus = errorData.status || 'ERROR';
          this.warGenerationInProgress = false;

          const errorMsg = `\n=== ERROR ===\n${errorData.message || 'Unknown error occurred'}\n`;
          this.warGenerationLogs += errorMsg;
          this.scrollToBottomOfLogs();

          this.snackBar.open(errorData.message || 'WAR generation error', '', {
            duration: 5000,
            panelClass: ['err-msg'],
          });

          this.closeLogStream();
        }
      });
    });

    // Handle SSE connection errors
    this.warLogEventSource.onerror = () => {
      this.ngZone.run(() => {
        if (this.warGenerationInProgress) {
          this.warGenerationLogs +=
            '\n[Connection lost. Please check your network and try again.]\n';
          this.scrollToBottomOfLogs();
          this.warGenerationStatus = 'ERROR';
          this.warGenerationInProgress = false;
          this.closeLogStream();

          this.snackBar.open('Connection lost during WAR generation', '', {
            duration: 5000,
            panelClass: ['err-msg'],
          });
        }
      });
    };
  }

  /**
   * Switches between war upload and generation tabs
   * @param tabIndex Tab index to switch to
   */
  switchWarTab(tabIndex: number): void {
    this.warTabIndex = tabIndex;
  }

  /**
   * Scrolls the log display to show the most recent entries
   */
  private scrollToBottomOfLogs(): void {
    setTimeout(() => {
      const logsElement = document.querySelector('.war-generation-logs');
      if (logsElement) {
        logsElement.scrollTop = logsElement.scrollHeight;
      }
    }, 100);
  }

  /**
   * Closes the SSE connection and cleans up resources
   */
  private closeLogStream(): void {
    if (this.warLogEventSource) {
      this.warLogEventSource.close();
      this.warLogEventSource = null;
    }
  }

  /**
   * Determines if user can proceed to upgrade step
   * @returns true if file upload or WAR generation completed successfully
   */
  canProceedToUpgrade(): boolean {
    return this.uploadComplete || this.warGenerationStatus === 'SUCCESS';
  }
}
