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
import { Component, OnInit } from '@angular/core';
import { AbstractControl, AbstractControlOptions, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MaterialModule } from '../../../material/material.module';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { UserManagementService } from '../../../services/user-management.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-user-add',
  standalone: true,
  imports: [CommonModule, HttpClientModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './user-add.component.html',
  styleUrl: './user-add.component.css'
})
export class UserAddComponent implements OnInit {

  userForm!: FormGroup;
  userFormSubmitted = false;
  isPasswordVisible: boolean | undefined;
  visible = true;
  allGroupName: any;
  allRoles: any
  errormessage!: string;
  loggedInUser:any;


  /**
   * Constructor for UserAddComponent.
   * @param http HttpClient for HTTP requests
   * @param fb FormBuilder for reactive forms
   * @param router Angular Router for navigation
   * @param usermanageserice UserManagementService for user management operations
   * @param _snakebar MatSnackBar for notifications
   */
  constructor(private http: HttpClient, private fb: FormBuilder, private router: Router,
    private usermanageserice: UserManagementService,
    private _snakebar: MatSnackBar
  ) { 
    this.loggedInUser = JSON.parse(localStorage.getItem('loggedinUser')|| '{}');
  }



  /**
   * Initialize the component and set up the user form and subscriptions.
   */
  ngOnInit(): void {
   /**
     * Regular expression for email validation.
     */
    let emailregex: RegExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    this.userForm = new FormGroup({
      username: new FormControl<string | null>('', { validators: [Validators.required, Validators.minLength(4)] }),
      useremail: new FormControl<string | null>('', { validators: [Validators.required, Validators.pattern(emailregex)] }),
      displayname: new FormControl<string | null>('', { validators: [Validators.required,this.noLeadingSpacesValidator] }),
      userpassword: new FormControl<string | null>('', { validators: [Validators.required, Validators.minLength(6)] }),
      retypepassword: new FormControl<string | null>('', { validators: Validators.required }),
      usergroupname: new FormControl<string | null>(''),
      rolename: new FormControl<string | null>('', { validators: Validators.required }),
      categoryname: new FormControl<string | null>('', { validators: Validators.required })
    }, <AbstractControlOptions>{ validators: this.passwordMatchValidator('userpassword', 'retypepassword') });

    this.usermanageserice.getGroupName().subscribe(res => {
      this.allGroupName = res
    })

    this.usermanageserice.getAllRole().subscribe(res => {
      this.allRoles = res;
    })
    this.userForm.get('username')?.valueChanges.subscribe((value) => {
      const cleanedValue = value.replace(/\s+/g, '');
      if (cleanedValue !== value) {
        this.userForm.get('username')?.setValue(cleanedValue, {
          emitEvent: false,
        });
      }
    });
    this.userForm.get('useremail')?.valueChanges.subscribe((value) => {
      const cleanedValue = value.replace(/\s+/g, '');
      if (cleanedValue !== value) {
        this.userForm.get('useremail')?.setValue(cleanedValue, {
          emitEvent: false,
        });
      }
    });
    this.userForm.get('userpassword')?.valueChanges.subscribe((value) => {
      const cleanedValue = value.replace(/\s+/g, '');
      if (cleanedValue !== value) {
        this.userForm.get('userpassword')?.setValue(cleanedValue, {
          emitEvent: false,
        });
      }
    });
    this.userForm.get('retypepassword')?.valueChanges.subscribe((value) => {
      const cleanedValue = value.replace(/\s+/g, '');
      if (cleanedValue !== value) {
        this.userForm.get('retypepassword')?.setValue(cleanedValue, {
          emitEvent: false,
        });
      }
    });
    this.displayname.valueChanges.subscribe(value => {
      if (value && value.startsWith(' ')) {
        this.displayname.setValue(value.trimStart(), { emitEvent: false });
      }
    });
  }
  

  /**
   * Getter for the displayname form control.
   * @returns The AbstractControl for displayname.
   */
  get displayname(): AbstractControl {
    return this.userForm.get('displayname')!;
  }



  /**
   * Validator to check for leading spaces in a form control value.
   * @param control The AbstractControl to validate.
   * @returns ValidationErrors or null.
   */
  noLeadingSpacesValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value || '';
    return value.startsWith(' ') ? { noLeadingSpaces: true } : null;
  }



  /**
   * Custom validator for password match.
   * @param newpassword The new password input field name.
   * @param confirmpassword The confirm password input field name.
   * @returns A validator function.
   */
  passwordMatchValidator(newpassword: any, confirmpassword: any) {
    return (formGroup: FormGroup) => {
      let password = formGroup['controls'][newpassword];
      let confirmPassword = formGroup['controls'][confirmpassword];
      if (confirmPassword.errors && !confirmPassword.errors['passwordMatchValidator']) {
        return
      }
      if (password.value !== confirmPassword.value) {
        confirmPassword.setErrors({ passwordMatchValidator: true })
      } else {
        confirmPassword.setErrors(null)
      }
    }
  }



  /**
   * Navigates back to the user management page.
   */
  goBack() :void{
    this.router.navigate(["configure/user-management"]);
  }



  /**
   * Resets the user form.
   */
  reset():void {
    this.userForm.reset();
  }

  

  /**
   * Handles the user form submission.
   */
  onuserSubmit() :void{
    this.userFormSubmitted = true;
    if (this.userForm.invalid) {
      return
    } else {
      let obj = {
        userName: this.userForm.value.username,
        password: this.userForm.value.userpassword,
        userEmail: this.userForm.value.useremail,
        userGroupName: this.userForm.value.usergroupname,
        userRoleName: this.userForm.value.rolename,
        userDisplayName: this.userForm.value.displayname,
        userCategory: this.userForm.value.categoryname
      }
      this.usermanageserice.createUser(obj).subscribe({
        next: (res) => {
          this._snakebar.open(res.message, '', {
            duration: 3000,
            panelClass: ['success-msg'],
            horizontalPosition: 'end',
            verticalPosition: 'top'
          })
          setTimeout(() => {
            this.router.navigate(["configure/user-management"]);
            this.userForm.reset();
          }, 1000);

        },
        error: (err) => {
          this._snakebar.open(err.message, '', {
            duration: 2000,
            panelClass: ['err-msg'],
            horizontalPosition: 'end',
            verticalPosition: 'top'
          })
        }
      })
    }
  }


}
