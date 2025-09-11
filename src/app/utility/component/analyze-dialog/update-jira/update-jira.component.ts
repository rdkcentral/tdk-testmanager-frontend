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
import { ApplicationRef, ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MaterialModule } from '../../../../material/material.module';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AnalysisService } from '../../../../services/analysis.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';

@Component({
  selector: 'app-update-jira',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule ,NgMultiSelectDropDownModule],
  templateUrl: './update-jira.component.html',
  styleUrl: './update-jira.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UpdateJiraComponent {
  jiraUpdateSubmitted = false;
  jiraUpdateForm!: FormGroup;
  allLabels: any;
  loggedinUser: any;
  labelDropdownSettings = {};
  labelArr: any[] = [];

  constructor(
    public dialogRef: MatDialogRef<UpdateJiraComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private analysiservice: AnalysisService,
    private fb: FormBuilder,
    private _snakebar: MatSnackBar,
    private cdRef: ChangeDetectorRef,
    private appRef: ApplicationRef,
    private ngZone: NgZone
  ) {
    this.loggedinUser = JSON.parse(
      localStorage.getItem('loggedinUser') || '{}'
    );
    console.log(data);
  }
  ngOnInit(): void {
    this.listLabels();
    this.initialForms();
    this.labelDropdownSettings = {
      singleSelection: false,
      idField: '',
      textField: '',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3,
      allowSearchFilter: false,
    };
  }

  initialForms() {
    this.jiraUpdateForm = this.fb.group({
      ticketNumber: [this.data.update.ticketNumber, Validators.required],
      label: ['', Validators.required],
      comments: ['', Validators.required],
      user: ['', Validators.required],
      password: ['', Validators.required],
      exelogs: [false],
      devlogs: [false],
    });
  }
  listLabels() {
    this.analysiservice
      .listOfLabels(this.data.updateDetails.category)
      .subscribe((res) => {
        this.allLabels = res.data;
      });
  }

  onJiraUpdate() {
    this.jiraUpdateSubmitted = true;
    // this.cdRef.markForCheck();
    this.ngZone.run(() => {
      // Run in Angular's zone
      this.cdRef.detectChanges(); // Or this.appRef.tick();
    });
    // this.cdRef.detectChanges();
    if (this.jiraUpdateForm.invalid) {
      return;
    } else {
      console.log(this.jiraUpdateForm.value);
      let updateObj = {
        executionResultId: this.data.updateDetails.executionResultID,
        ticketNumber: this.jiraUpdateForm.value.ticketNumber,
        comments: this.jiraUpdateForm.value.comments,
        label: this.jiraUpdateForm.value.label,
        user: this.jiraUpdateForm.value.user,
        password: this.jiraUpdateForm.value.password,
        executionLogNeeded: this.jiraUpdateForm.value.exelogs,
        deviceLogNeeded: this.jiraUpdateForm.value.devlogs,
      };
      this.analysiservice.updateJiraTicket(updateObj).subscribe({
        next: (res) => {
          this._snakebar.open(res.message, '', {
            duration: 1000,
            panelClass: ['success-msg'],
            verticalPosition: 'top',
          });
          setTimeout(() => {
            this.close();
          }, 2000);
        },
        error: (err) => {
          this._snakebar.open(err.message, '', {
            duration: 1000,
            panelClass: ['err-msg'],
            horizontalPosition: 'end',
            verticalPosition: 'top',
          });
        },
      });
    }
  }

  onItemSelect(item: any): void {
    if (!this.labelArr.includes(item)) {
      this.labelArr.push(item);
    }
  }

  onDeSelect(item: any): void {
    this.labelArr = this.labelArr.filter((name) => name !== item);
  }

  onSelectAll(items: any[]): void {
    this.labelArr = [...items];
  }

  onDeSelectAll(items: any[]): void {
    this.labelArr = [];
  }
  close(): void {
    this.dialogRef.close(false);
  }
}
