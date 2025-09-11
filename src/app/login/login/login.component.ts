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
import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { FooterComponent } from '../../layout/footer/footer.component';
import { RegisterService } from '../../services/register.service';
import { HttpClientModule } from '@angular/common/http';
import { MaterialModule } from '../../material/material.module';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LoginService } from '../../services/login.service';
import { AuthService } from '../../auth/auth.service';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, FooterComponent, HttpClientModule, MaterialModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {

  /**
   * Represents the isSigninVisible of the application.
   */
  isSigninVisible = false;
  /**
   * Represents the registerVisible of the application.
   */
  registerVisible = false;
  /**
   * Represents the signinVisible of the application.
   */
  signinVisible = true;
  /**
   * Represents the ldapScreenVisible of the application.
   */
  ldapScreenVisible = false;
  /**
   * Represents the signinForm of the application.
   */
  signinForm!: FormGroup;
  /**
   * Represents the registerForm of the application.
   */
  registerForm!: FormGroup;
  /**
   * Represents the ldapForm of the application.
   */
  ldapForm!: FormGroup;
  /**
   * Represents the submitted of the application.
   */
  submitted = false;
  /**
   * Represents the regSubmitted of the application.
   */
  regSubmitted = false;
  /**
   * Represents the ldapSubmitted of the application.
   */
  ldapSubmitted = false;
  /**
   * Represents the currentForm of the application.
   */
  currentForm: string = 'signin';
  /**
   * Represents the isSelect of the application.
   */
  isSelect = false;
  /**
   * Represents the errorMessage of the application.
   */
  errorMessage: any = {};
  /**
   * Represents the showhideErr of the application.
   */
  showhideErr = false;
  /**
   * Represents the showHideRegSucess of the application.
   */
  showHideRegSucess = false;
  /**
   * Represents the registerSuccess of the application.
   */
  registerSuccess!: string;
  /**
   * Represents the showHideRegForm of the application.
   */
  showHideRegForm = false;
  /**
   * Represents the errormessageExist of the application.
   */
  errormessageExist: any = {};
  /**
   * Represents the showhideErrExists of the application.
   */
  showhideErrExists = false;
  /**
   * Represents the allGroupName of the application.
   */
  allGroupName: any = [];
  categorySelect!:string;
  backendErrors: { [key: string]: string } = {};
/**
   * Represents the showNewPassword of the application.
   */
public showPasswordOnPress: boolean = true;
 
/**
 * Represents the showViewPasswordOnPress of the application.
 */
public showViewPasswordOnPress: boolean = true;

/**
 * Represents the showConfirmPasswordOnPress of the application.
 */
public showConfirmPasswordOnPress: boolean = true;

  /**
   * Constructor for LoginComponent.
   * @param fb FormBuilder instance for reactive forms.
   * @param router Angular Router for navigation.
   * @param registerservice RegisterService instance for user registration.
   * @param loginservice LoginService instance for authentication.
   * @param authservice AuthService instance for authentication state.
   * @param location Location service for navigation state.
   * @param _snakebar MatSnackBar instance for notifications.
   */
  constructor(private fb: FormBuilder, private router: Router,
    private registerservice: RegisterService,
    private loginservice: LoginService,
    private authservice: AuthService,
    private location : Location,
    private _snakebar: MatSnackBar,
  ) { }

  /**
   * Initializes the component and sets up forms and event listeners.
   */
  ngOnInit(): void {

    this.signinForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    })

    this.ldapForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(4)]],
      password: ['', [Validators.required, Validators.minLength(4)]]
    })

    let emailregex: RegExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    this.registerForm = this.fb.group({
      regusername: ['', [Validators.required, Validators.minLength(3)]],
      regemail: ['', [Validators.pattern(emailregex)]],
      displayname: ['', [Validators.required, this.noSpacesValidator]],
      regpassword: ['', [Validators.required, Validators.minLength(6)]],
      retypepassword: ['', Validators.required],
      preferCategoty:['', [Validators.required]]
    }, { validators: this.passwordMatchValidator('regpassword', 'retypepassword') })

    this.loginservice.getuserGroup().subscribe(res => {
      this.allGroupName = res.data;
    });
    this.registerForm.get('regusername')?.valueChanges.subscribe((value) => {
      const cleanedValue = value.replace(/\s+/g, '');
      if (cleanedValue !== value) {
        this.registerForm.get('regusername')?.setValue(cleanedValue, {
          emitEvent: false,
        });
      }
    });
    this.registerForm.get('regpassword')?.valueChanges.subscribe((value) => {
      const cleanedValue = value.replace(/\s+/g, '');
      if (cleanedValue !== value) {
        this.registerForm.get('regpassword')?.setValue(cleanedValue, {
          emitEvent: false,
        });
      }
    });
    this.registerForm.get('retypepassword')?.valueChanges.subscribe((value) => {
      const cleanedValue = value.replace(/\s+/g, '');
      if (cleanedValue !== value) {
        this.registerForm.get('retypepassword')?.setValue(cleanedValue, {
          emitEvent: false,
        });
      }
    });
    this.registerForm.get('regemail')?.valueChanges.subscribe((value) => {
      const trimmedValue = value?.trim();
      if (value && value !== trimmedValue) {
        this.registerForm.get('regemail')?.setValue(trimmedValue, { emitEvent: false });
      }
    });
    this.displayname.valueChanges.subscribe(value => {
      if (value && value.startsWith(' ')) {
        this.displayname.setValue(value.trimStart(), { emitEvent: false });
      }
    });
    this.signinForm.get('username')?.valueChanges.subscribe((value) => {
      const cleanedValue = value.replace(/\s+/g, '');
      if (cleanedValue !== value) {
        this.signinForm.get('username')?.setValue(cleanedValue, {
          emitEvent: false,
        });
      }
    });
    this.signinForm.get('password')?.valueChanges.subscribe((value) => {
      const cleanedValue = value.replace(/\s+/g, '');
      if (cleanedValue !== value) {
        this.signinForm.get('password')?.setValue(cleanedValue, {
          emitEvent: false,
        });
      }
    });
    if(this.authservice.isLoggednIn() && this.router.url === '/login'){
      this.router.navigate(["/execution"]);
    }
    
    window.addEventListener('storage',(event)=>{
      if(event.key === 'logout'){
        this.router.navigate(["/login"]);
      }
    })
  }

  /**
   * This method used display name
   */
  get displayname(): AbstractControl {
    return this.registerForm.get('displayname')!;
  }

  /**
   * This method is no space is allow.
   */
  noSpacesValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value || '';
    return value.startsWith(' ') ? { noLeadingSpaces: true } : null;
  }

  /**
   * Validates if the password and retype password fields match.
   * @param regpassword - The name of the password control.
   * @param retypepassword - The name of the retype password control.
   * @returns A validator function that checks if the password and retype password fields match.
   */
  passwordMatchValidator(regpassword: any, retypepassword: any) {
    return (formGroup: FormGroup) => {
      let password = formGroup['controls'][regpassword] as AbstractControl;
      let confirmPassword = formGroup['controls'][retypepassword] as AbstractControl;
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
   * Get the controls of the register form.
   * @returns The controls of the register form.
   */
  get f() { return this.registerForm.controls; }


  /**
   * Signs in the user.
   */
  signIn():void {
    this.isSigninVisible = false
    this.registerVisible = false;
    this.signinVisible = true;
  }

  /**
   * Registers the user.
   * Sets the visibility of the signin and register components accordingly.
   */
  register() :void{
    this.isSigninVisible = true
    this.registerVisible = true;
    this.signinVisible = false;
  }

  /**
   * Change the category click on radio button.
   */
  changeCategory(event:any):void{
    let val = event.target.value;
    this.categorySelect = val;
  }

  /**
   * Toggles the form based on the provided form name.
   * @param formName - The name of the form to toggle.
   */
  toogleForm(formName: string): void {
    this.currentForm = formName;
    if (this.currentForm === 'register') {
      this.regSubmitted = false;
      this.isSigninVisible = true;
      this.registerVisible = true;
      this.signinVisible = false;
      this.ldapScreenVisible = false;
      this.showHideRegSucess = false;
      this.showHideRegForm = true;
      this.ngOnInit();
    } else {
      this.submitted = false;
      this.isSigninVisible = false;
      this.registerVisible = false;
      this.signinVisible = true;
      this.ngOnInit();
    }
  }


  /**
   * Handles the event when the user is checked.
   * @param e - The event object.
   */
  isUserchecked(e: any) :void{
    if (e.target.checked) {
      this.signinVisible = false;
      this.ldapScreenVisible = true;
    }
  }


  /**
   * Handles the event when the LDAP checkbox is checked.
   * @param e - The event object.
   */
  isldapChecked(e: any) :void{
    if (e.target.checked) {
      this.signinVisible = true;
      this.ldapScreenVisible = false;
    }
  }


  /**
   * Handles the form submission when the user clicks the submit button.
   * If the form is valid, it sends the user's credentials to the server for authentication.
   * If the authentication is successful, it stores the user information and navigates to the configure page.
   * If there is an error during authentication, it displays the error message.
   */
  onSubmit(): void {
    this.submitted = true;
    if (this.signinForm.invalid) {
      return
    } else {
      let credential = {
        username: this.signinForm.value.username,
        password: this.signinForm.value.password
      }
      this.loginservice.userlogin(credential).subscribe({
        next: (res: any) => {
          let loggedinUser = res.data;
          this.authservice.sendToken(loggedinUser.token);
          this.authservice.setPrivileges(loggedinUser.userRoleName)
          localStorage.setItem("loggedinUser", JSON.stringify(loggedinUser));
          this.router.navigate(["/execution"]);
          this.location.replaceState('/execution');
        },
        error: (err) => {
          this.errorMessage = err.message;
          if (this.errorMessage) {
            this.showhideErr = true;
            setTimeout(() => {
              this.showhideErr = false;
            }, 3500);
          }
        }

      })
    }

  }


  /**
   * Handles the submission of the LDAP form.
   */
  onLdapSubmit(): void {
    this.ldapSubmitted = true;
    if (this.ldapForm.invalid) {
      return;
    } else {
    }
  }


  /**
   * Handles the registration process when the user clicks on the register button.
   */
  onRegister(): void {
    this.regSubmitted = true;
    if (this.registerForm.invalid) {
      return
    } else {
      let signUpData = {
        userName: this.registerForm.value.regusername,
        userEmail: this.registerForm.value.regemail,
        userDisplayName: this.registerForm.value.displayname,
        password: this.registerForm.value.regpassword,
        userGroupName: this.registerForm.value.usergroup,
        userCategory:this.categorySelect
      }
      this.registerservice.registerUser(signUpData).subscribe({
        next: (res: any) => {
          this.registerSuccess = res.message;
          this.showHideRegSucess = true;
          this.showHideRegForm = false;
          this.regSubmitted = false;
        },
        error: (err) => {
          //Check for the errors that are already parsed
          let errorMessage = err.message;
          this.backendErrors = this.parseBackendErrors(errorMessage);      
          setTimeout(() => {
            this.backendErrors = {};
          }, 2000);
        }
      })
    }
  }

  /**
   * Handles backend error for username and email is already exist.
   */  
  parseBackendErrors(message: string): { [key: string]: string } {
    const errors: { [key: string]: string } = {};
    if (message.includes("User Name")) {
      errors['regusername'] = message;
    }

    if (message.includes("Email")) {
      errors['regemail'] = message;
    }
    return errors;
  }


/**
   * Method to view the password.
   */

viewPassword(): void {
  this.showPasswordOnPress = !this.showPasswordOnPress;
}


/**
 * Method to view the password.
 */

viewRegisterPassword(): void {
  this.showViewPasswordOnPress = !this.showViewPasswordOnPress;
}


/**
 * Method to view the password.
 */

viewConfirmPassword(): void{
  this.showConfirmPasswordOnPress = !this.showConfirmPasswordOnPress;
}

}
