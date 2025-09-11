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
  selector: 'app-crashlogfile-dialog',
  standalone: true,
  imports: [CommonModule, MaterialModule, FormsModule],
  templateUrl: './crashlogfile-dialog.component.html',
  styleUrl: './crashlogfile-dialog.component.css'
})
export class CrashlogfileDialogComponent {

  logFileNames: any;
  executionResultId: any;
  
    /**
     * Constructor for CrashlogfileDialogComponent.
     * @param dialogRef Reference to the dialog opened.
     * @param data Data injected into the dialog.
     * @param dialog MatDialog for opening dialogs.
     * @param executionservice Service for execution operations.
     */
    
    constructor(
      public dialogRef: MatDialogRef<CrashlogfileDialogComponent>,
      @Inject(MAT_DIALOG_DATA) public data: any, public dialog: MatDialog, private executionservice: ExecutionService,
       ) {
    }
    /**
     * Angular lifecycle hook called on component initialization.
     */
    
    ngOnInit(): void {
      this.logFileNames = JSON.parse(this.data.logFileNames);
    }
    /**
     * Downloads the crash log file for the given log file name.
     * @param logFile The name of the log file to download.
     */
    
    downloadCrashLogFile(logFile:any){
      this.executionservice.downloadCrashLogFile(this.data.executionId,logFile).subscribe(blob => {
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
     * Closes the dialog.
     */
    
    onClose(): void {
      this.dialogRef.close(false);
    }

}
