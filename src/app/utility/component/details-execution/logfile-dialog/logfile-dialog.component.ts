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
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from '../../../../material/material.module';
import { FormsModule } from '@angular/forms';
import { ExecutionService } from '../../../../services/execution.service';

@Component({
  selector: 'app-logfile-dialog',
  standalone: true,
  imports: [CommonModule, MaterialModule, FormsModule],
  templateUrl: './logfile-dialog.component.html',
  styleUrl: './logfile-dialog.component.css'
})
export class LogfileDialogComponent {

  logFileNames: any;
  executionResultId: any;

  /**
   * Constructor for LogfileDialogComponent.
   * @param dialogRef Reference to the dialog opened.
   * @param data Data injected into the dialog (contains logFileNames and executionId).
   * @param dialog Reference to MatDialog service.
   * @param executionservice Service to fetch and download execution logs.
   */
  constructor(
    public dialogRef: MatDialogRef<LogfileDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, public dialog: MatDialog, private executionservice: ExecutionService,
     ) {
  }



  /**
   * Angular lifecycle hook called on component initialization.
   * Initializes the logFileNames property from injected data.
   */
  ngOnInit(): void {
    this.logFileNames = this.data.logFileNames;
  }



  /**
   * Downloads the specified log file for the current execution.
   * @param logFile The name of the log file to download.
   */
  downloadLogFile(logFile: any) {
    this.executionservice.downloadLogFile(this.data.executionId, logFile).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${logFile}`; 
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    });
  }



  /**
   * Handles the close action for the dialog.
   * Closes the dialog without returning a value.
   */
  onClose(): void {
    this.dialogRef.close(false);
  }


  

}
