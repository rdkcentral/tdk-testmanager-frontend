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
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogRef } from '@angular/material/dialog';

/**
 * DataRecoveryConfirmationComponent
 * -------------------------------------------------
 * This component provides a confirmation dialog for data recovery operations.
 * It shows a warning message about data loss and provides options to proceed or cancel.
 *
 * Features:
 * - Warning message about data recovery implications
 * - Close and Proceed buttons
 * - Consistent styling with other upgrade components
 */
@Component({
  selector: 'app-data-recovery-confirmation',
  standalone: true,
  imports: [
    CommonModule,
    MatTooltipModule,
  ],
  templateUrl: './data-recovery-confirmation.component.html',
  styleUrl: './data-recovery-confirmation.component.css',
})
export class DataRecoveryConfirmationComponent {

  /**
   * Constructor: Initializes component and injects required services.
   */
  constructor(
    private dialogRef: MatDialogRef<DataRecoveryConfirmationComponent>
  ) {}

  /**
   * Closes the confirmation dialog without proceeding
   */
  close(): void {
    this.dialogRef.close(false);
  }

  /**
   * Proceeds with data recovery operation
   */
  proceed(): void {
    this.dialogRef.close(true);
  }
}