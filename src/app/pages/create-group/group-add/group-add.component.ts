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
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonFormComponent } from '../../../utility/component/common-form/common-form.component';
import { UsergroupService } from '../../../services/usergroup.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-group-add',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, CommonFormComponent],
  templateUrl: './group-add.component.html',
  styleUrl: './group-add.component.css'
})

export class GroupAddComponent implements OnInit {

  userGroupName: string | undefined;
  commonFormName = 'Create';
  errormessage: any;
  validationName = 'user group';
  placeholderName = 'User Group Name';
  labelName = 'Name';
  
  /**
   * Constructor for GroupAddComponent
   * @param router - Router instance
   * @param service - UsergroupService instance
   * @param route - ActivatedRoute instance
   * @param _snakebar - MatSnackBar for notifications
   */
  constructor(private router: Router,
    public service: UsergroupService, private route: ActivatedRoute,
    private _snakebar: MatSnackBar) {
    this.commonFormName = this.route.snapshot.url[1].path === 'group-add' ? this.commonFormName + ' ' + 'User Group' : this.commonFormName;

  }


  /**
   * Handles the form submission event.
   * @param name - The name of the user group.
   */  
  onFormSubmitted(name: string): void {
    this.userGroupName = name;
    if (name != undefined && name != null) {
      this.service.createuserGroup(this.userGroupName).subscribe({
        next: (res) => {
          this._snakebar.open(res, '', {
            duration: 3000,
            panelClass: ['success-msg'],
            verticalPosition: 'top'
          })
          setTimeout(() => {
            this.router.navigate(["configure/create-group"]);

          }, 1000);

        },
        error: (err) => {
          let errmsg = JSON.parse(err.error);
          this.errormessage = errmsg.message ? errmsg.message : errmsg.password;
          this._snakebar.open(this.errormessage, '', {
            duration: 4000,
            panelClass: ['err-msg'],
            horizontalPosition: 'end',
            verticalPosition: 'top'
          })
        }
      })
    }

  }

  
  /**
   * Initializes the component.
   */
  ngOnInit(): void {
  }




}
