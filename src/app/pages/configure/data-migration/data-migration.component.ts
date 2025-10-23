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
import { FormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { finalize } from 'rxjs/operators';
import { AppUpgradeService } from '../../../services/app-upgrade.service';

/**
 * DataMigrationComponent
 * -------------------------------------------------
 * This component provides the UI and logic for data migration operations for non-admin users.
 * It handles checking for new changes and downloading change data.
 *
 * Features:
 * - Check for new changes since a specific date/time
 * - Download changes as SQL file
 * - Progress tracking for operations
 * - Uses Angular Material and Bootstrap for UI
 */
@Component({
  selector: 'app-data-migration',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatInputModule,
    MatFormFieldModule,
  ],
  templateUrl: './data-migration.component.html',
  styleUrl: './data-migration.component.css',
})
export class DataMigrationComponent implements OnInit {
  // Operation flags
  operationInProgress = false;
  
  // Common output logs
  outputLogs: string = '';
  
  // Date/time input for checking changes since a specific time
  sinceDateTime: string = '';

  /**
   * Constructor: Initializes component and injects required services.
   */
  constructor(
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<DataMigrationComponent>,
    private appUpgradeService: AppUpgradeService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    // Initialize component
    this.clearAllData();
    this.setDefaultDateTime();
  }

  /**
   * Clears all operation data
   */
  private clearAllData(): void {
    this.outputLogs = '';
  }

  /**
   * Sets default date/time to current date/time in browser timezone
   */
  private setDefaultDateTime(): void {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    
    this.sinceDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  /**
   * Gets current time as a readable string in browser timezone
   */
  getCurrentTimeString(): string {
    const now = new Date();
    return now.toLocaleString();
  }

  /**
   * Checks for new changes since the specified date/time
   */
  checkForNewChanges(): void {
    if (!this.sinceDateTime) {
      this.snackBar.open('Please select a date and time', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.operationInProgress = true;
    this.outputLogs = 'Checking for new changes...\n';

    // Convert browser time to UTC
    const localDate = new Date(this.sinceDateTime);
    const utcDate = localDate.toISOString();

    this.appUpgradeService.getListOfAllChangesSince(utcDate)
      .pipe(
        finalize(() => {
          this.operationInProgress = false;
        })
      )
      .subscribe({
        next: (response: any) => {
          this.outputLogs += `SUCCESS: Changes retrieved successfully.\n`;
          
          // Display the response data directly in the operation output
          if (response && response.data) {
            this.outputLogs += `\nFETCH RESULTS:\n`;
            this.outputLogs += `${JSON.stringify(response.data, null, 2)}\n`;
          } else {
            this.outputLogs += `\nNo data found in the response.\n`;
          }
        },
        error: (error: any) => {
          // Handle both string errors from interceptor and object errors
          let errorMessage = '';
          if (typeof error === 'string') {
            errorMessage = error;
          } else {
            errorMessage = error.message || error.error?.message || 'Failed to retrieve changes';
          }
          
          this.outputLogs += `ERROR: ${errorMessage}\n`;
        }
      });
  }

  /**
   * Downloads changes as SQL file since the specified date/time
   */
  downloadChanges(): void {
    if (!this.sinceDateTime) {
      this.snackBar.open('Please select a date and time', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.operationInProgress = true;
    this.outputLogs = 'Downloading changes SQL file...\n';

    // Convert browser time to UTC
    const localDate = new Date(this.sinceDateTime);
    const utcDate = localDate.toISOString();

    this.appUpgradeService.downloadChangesBasedOnTime(utcDate)
      .pipe(
        finalize(() => {
          this.operationInProgress = false;
        })
      )
      .subscribe({
        next: (blob: Blob) => {
          this.outputLogs += `SUCCESS: Changes SQL file downloaded successfully.\n`;
          
          // Create download link
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          
          // Generate filename with timestamp
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          link.download = `changes_${timestamp}.sql`;
          
          // Trigger download
          document.body.appendChild(link);
          link.click();
          
          // Cleanup
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        },
        error: (error: any) => {
          // Handle both string errors from interceptor and object errors
          let errorMessage = '';
          if (typeof error === 'string') {
            errorMessage = error;
          } else {
            errorMessage = error.message || error.error?.message || 'Failed to download changes';
          }
          
          this.outputLogs += `ERROR: ${errorMessage}\n`;
        }
      });
  }

  /**
   * Formats the output logs with colors - red for errors, green for success, blue for fetch results
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
        } else if (line.startsWith('FETCH RESULTS:')) {
          return `<div style="color: #007bff; font-weight: bold; margin-top: 10px;">${line}</div>`;
        } else if (line.trim().startsWith('{') || line.trim().startsWith('[') || line.trim().includes('"')) {
          // JSON content - format with monospace and smaller font
          return `<div style="font-family: 'Courier New', monospace; font-size: 12px; background-color: #f8f9fa; padding: 2px; margin: 1px 0;">${line}</div>`;
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