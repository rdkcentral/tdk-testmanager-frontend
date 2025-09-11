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
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MaterialModule } from '../../../material/material.module';
import { Router } from '@angular/router';
import { UserManagementService } from '../../../services/user-management.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-user-edit',
  standalone: true,
  imports: [CommonModule, HttpClientModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './user-edit.component.html',
  styleUrl: './user-edit.component.css'
})
export class UserEditComponent implements OnInit {

  editUserForm!: FormGroup;
  userFormSubmitted = false;
  allGroupName: any;
  allRoles: any
  user: any={};

  /**
   * Constructor for UserEditComponent.
   * @param fb FormBuilder for reactive forms
   * @param router Angular Router for navigation
   * @param usermanageserice UserManagementService for user management operations
   * @param _snakebar MatSnackBar for notifications
   */
  constructor(private fb: FormBuilder, private router: Router,
    private usermanageserice: UserManagementService,
    private _snakebar: MatSnackBar) {
    this.user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!this.user) {
      this.router.navigate(['/user-management']);
    }
  }


  /**
   * Initializes the component and sets up the edit user form and subscriptions.
   */
  ngOnInit(): void {
    let emailregex: RegExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    this.editUserForm = this.fb.group({
      username: [this.user.userName, [Validators.required]],
      useremail: [this.user.userEmail, [Validators.pattern(emailregex)]],
      userDisplayName: [this.user.userDisplayName],
      userpassword: [''],
      usergroupname: [this.user.userGroupName],
      rolename: [this.user.userRoleName],
      categoryname:[this.user.userCategory]
    })

    this.usermanageserice.getGroupName().subscribe(res => {
      this.allGroupName = res
    })

    this.usermanageserice.getAllRole().subscribe(res => {
      this.allRoles = res;
    })
  }


  /**
   * Navigates back to the user management page.
   */
  goBack():void {
    this.router.navigate(["configure/user-management"]);
  }



  /**
   * Resets the edit user form.
   */
  reset():void {
    this.editUserForm.reset();
  }



  /**
   * Submits the user edit form.
   */
  userEditSubmit() :void{
    this.userFormSubmitted = true;
    if (this.editUserForm.invalid) {
      return
    } else {
      let obj = {
        userId: this.user.userId,
        userName: this.editUserForm.value.username,
        password: this.editUserForm.value.userpassword,
        userEmail: this.editUserForm.value.useremail,
        userGroupName: this.editUserForm.value.usergroupname,
        userRoleName: this.editUserForm.value.rolename,
        userDisplayName: this.editUserForm.value.userDisplayName,
        userCategory: this.editUserForm.value.categoryname
      }
      this.usermanageserice.updateUser(obj).subscribe({
        next: (res) => {
          if (res.status === 200) {
            this._snakebar.open(res.body.message , '', {
              duration: 2000,
              panelClass: ['success-msg'],
              horizontalPosition: 'end',
              verticalPosition: 'top',
            });
            setTimeout(() => {
              this.router.navigate(['configure/user-management']);
              this.editUserForm.reset();
            }, 1000);
          }
        },
        error: (err) => {
          this._snakebar.open(err.message, '', {
            duration: 4000,
            panelClass: ['err-msg'],
            horizontalPosition: 'end',
            verticalPosition: 'top'
          })
        }
      });

    }
  }



}
