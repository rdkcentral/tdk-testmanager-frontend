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
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { finalize } from 'rxjs/operators';
import { AppUpgradeService } from '../../../services/app-upgrade.service';
import { DataRecoveryConfirmationComponent } from './data-recovery-confirmation/data-recovery-confirmation.component';

/**
 * AppDataUpgradeComponent
 * -------------------------------------------------
 * This component provides the UI and logic for data upgradation and recovery operations.
 * It handles liquibase-based data upgradation and data recovery processes with simplified UI.
 *
 * Features:
 * - Simple two-button interface for Data Upgradation and Data Recovery
 * - Common output area for displaying operation results
 * - Progress tracking for operations
 * - Uses Angular Material and Bootstrap for UI
 */
@Component({
  selector: 'app-app-data-upgrade',
  standalone: true,
  imports: [
    CommonModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatProgressBarModule,
  ],
  templateUrl: './app-data-upgrade.component.html',
  styleUrl: './app-data-upgrade.component.css',
})
export class AppDataUpgradeComponent implements OnInit {
  // Operation flags
  operationInProgress = false;
  
  // Common output logs
  outputLogs: string = '';

  /**
   * Constructor: Initializes component and injects required services.
   */
  constructor(
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<AppDataUpgradeComponent>,
    private appUpgradeService: AppUpgradeService,
    private sanitizer: DomSanitizer,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    // Initialize component
  }

  /**
   * Runs liquibase data upgradation
   */
  runLiquibase(): void {
    this.operationInProgress = true;
    this.outputLogs = 'Starting liquibase data upgradation...\n';

    this.appUpgradeService.runLiquibase()
      .pipe(
        finalize(() => {
          this.operationInProgress = false;
        })
      )
      .subscribe({
        next: (response: any) => {
          const successMessage = response.message || response.output || 'Liquibase data upgradation completed successfully.';
          this.outputLogs += `SUCCESS: ${successMessage}\n`;
        },
        error: (error: any) => {
          // Handle both string errors from interceptor and object errors
          let errorMessage = '';
          if (typeof error === 'string') {
            errorMessage = error;
          } else {
            errorMessage = error.message || error.error?.message || 'Liquibase data upgradation failed';
          }
          
          this.outputLogs += `ERROR: ${errorMessage}\n`;
        }
      });
  }

  /**
   * Shows confirmation dialog and executes data recovery if confirmed
   */
  executeDataRecovery(): void {
    const confirmationDialogRef = this.dialog.open(DataRecoveryConfirmationComponent, {
      width: '600px',
      disableClose: true,
      panelClass: 'custom-dialog-container'
    });

    confirmationDialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.performDataRecovery();
      }
    });
  }

  /**
   * Performs the actual data recovery operation
   */
  private performDataRecovery(): void {
    this.operationInProgress = true;
    this.outputLogs = 'Starting data recovery operation...\n';

    this.appUpgradeService.executeDataRecovery()
      .pipe(
        finalize(() => {
          this.operationInProgress = false;
        })
      )
      .subscribe({
        next: (response: any) => {
          const successMessage = response.message || response.output || 'Data recovery completed successfully.';
          this.outputLogs += `SUCCESS: ${successMessage}\n`;
        },
        error: (error: any) => {
          // Handle both string errors from interceptor and object errors
          let errorMessage = '';
          if (typeof error === 'string') {
            errorMessage = error;
          } else {
            errorMessage = error.message || error.error?.message || 'Data recovery failed';
          }
          
          this.outputLogs += `ERROR: ${errorMessage}\n`;
        }
      });
  }

  /**
   * Formats the output logs with colors - red for errors, green for success
   */
  getFormattedLogs(): SafeHtml {
    if (!this.outputLogs) return '';
    
    const formattedHtml = this.outputLogs
      .split('\n')
      .map(line => {
        if (line.startsWith('ERROR:')) {
          return `<div style="color: red; font-weight: bold;">${line}</div>`;
        } else if (line.startsWith('SUCCESS:')) {
          return `<div style="color: green; font-weight: bold;">${line}</div>`;
        }
        return `<div>${line}</div>`;
      })
      .join('');
      
    return this.sanitizer.bypassSecurityTrustHtml(formattedHtml);
  }

  /**
   * Closes the dialog
   */
  close(): void {
    this.dialogRef.close();
  }
}