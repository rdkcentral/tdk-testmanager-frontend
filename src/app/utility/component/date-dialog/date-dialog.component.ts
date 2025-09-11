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
import { Component, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { ExecutionService } from '../../../services/execution.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogRef } from '@angular/material/dialog';
import moment from 'moment-timezone';

@Component({
  selector: 'app-date-dialog',
  standalone: true,
  imports: [BsDatepickerModule, CommonModule, FormsModule],
  templateUrl: './date-dialog.component.html',
  styleUrl: './date-dialog.component.css',
  encapsulation: ViewEncapsulation.None,
})
export class DateDialogComponent {
  selectedDate: Date[] | null = null;
  utcDateRange: string[] | null = null;
  fromDate: string | null = null;
  toDate: string | null = null;
  bsConfig = {
    rangeInputFormat: 'YYYY-MM-DD',
    maxDate: new Date(),
  };

  /**
   * Constructor for DateDialogComponent.
   * @param executionservice Service for execution operations.
   * @param _snakebar MatSnackBar for notifications.
   * @param dialogRef Reference to the dialog opened.
   */
  
  constructor(private executionservice:ExecutionService,private _snakebar: MatSnackBar,
    public dialogRef: MatDialogRef<DateDialogComponent>,
  ){}
  /**
   * Handles date change time event.
   *
   * @param dateRange - The dateRange change date and time action.
   */
  /**
   * Handles date change event and updates fromDate and toDate in UTC format.
   * @param dateRange The selected date range array.
   */
  
  onDateChange(dateRange: Date[] | null): void {
    if (dateRange && dateRange.length === 2) {
      const fromUTCMoment =  moment.tz(dateRange[0], moment.tz.guess()).utc();
      const toUTCMoment =  moment.tz(dateRange[1], moment.tz.guess()).utc();
      this.fromDate = fromUTCMoment.startOf('day').format('YYYY-MM-DDTHH:mm:ss[Z]');
      this.toDate = toUTCMoment.endOf('day').format('YYYY-MM-DDTHH:mm:ss[Z]');

    } else {
      this.fromDate = null;
      this.toDate = null;
    }
  }
  /**
   * Handles the delete date from to date.
   *
   */
  /**
   * Handles the delete action for the selected date range.
   */
  
  deleteData(): void {
    if (this.selectedDate) {
      this.executionservice.datewiseDeleteExe(this.fromDate, this.toDate).subscribe({
        next:(res)=>{
          this._snakebar.open(res.message, '', {
            duration: 3000,
            panelClass: ['success-msg'],
            verticalPosition: 'top'
          })
          setTimeout(() => {
            this.dialogRef.close();
          }, 2000);
        },
        error:(err)=>{
          let errmsg = err.message
          this._snakebar.open(errmsg,'',{
            duration: 2000,
            panelClass: ['err-msg'],
            horizontalPosition: 'end',
            verticalPosition: 'top'
          })
        }
      })
    } 
  }
  /**
   * Close the dialog.
   *
   */
  /**
   * Closes the dialog.
   */
  
  close():void{
    this.dialogRef.close();
  }
}
