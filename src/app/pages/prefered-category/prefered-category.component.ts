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
import { Component } from '@angular/core';
import { FooterComponent } from '../../layout/footer/footer.component';
import { MaterialModule } from '../../material/material.module';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LoginService } from '../../services/login.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-prefered-category',
  standalone: true,
  imports: [FooterComponent,MaterialModule, ReactiveFormsModule, CommonModule],
  templateUrl: './prefered-category.component.html',
  styleUrl: './prefered-category.component.css'
})
export class PreferedCategoryComponent {

  submitted = false;
  categoryForm!: FormGroup;
  categorySelect!:string;
  loggedinUser:any;
  preferedCategory!:string;
  userCategory!:string;

  /**
   * Constructor for PreferedCategoryComponent.
   * @param fb FormBuilder instance for reactive forms.
   * @param router Router instance for navigation.
   * @param loginservice LoginService instance for user login and preference.
   * @param _snakebar MatSnackBar instance for notifications.
   */
  constructor(private fb: FormBuilder, private router: Router,
    private loginservice: LoginService, private _snakebar: MatSnackBar) {
    this.loggedinUser = JSON.parse(localStorage.getItem('loggedinUser') || '{}');
    this.preferedCategory = localStorage.getItem('preferedCategory') || '';
    this.userCategory = this.loggedinUser.userCategory;
  }

  /**
   * Initializes the component and sets up initial state.
   * No parameters.
   */
  ngOnInit(): void {
    this.categorySelect = this.userCategory ? this.userCategory : this.preferedCategory;
    this.categoryForm = this.fb.group({
      catgegory: [this.categorySelect, Validators.required]
    });
  }

  /**
   * Handles category change event from dropdown.
   * @param event The change event from the category dropdown.
   */
  changeCategory(event: any): void {
    let val = event.target.value;
    this.categorySelect = val ? val : this.loggedinUser.userCategory;
  }

  /**
   * Handles the form submission event for category selection.
   * No parameters.
   */
  categorySubmit(): void {
    this.submitted = true;
    if (this.categoryForm.invalid) {
      return;
    } else {
      let userName = this.loggedinUser.userName;
      this.loginservice.changePrefernce(userName, this.categorySelect).subscribe({
        next: (res) => {
          this._snakebar.open(res.message, '', {
            duration: 2000,
            panelClass: ['success-msg'],
            verticalPosition: 'top'
          })
          // Update userCategory in loggedinUser
          this.loggedinUser.userCategory = this.categorySelect;
          localStorage.setItem('loggedinUser', JSON.stringify(this.loggedinUser));
          localStorage.setItem('preferedCategory', this.categorySelect);
          setTimeout(() => {
            this.router.navigate(["/configure"]);
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

  /**
   * Navigates to the configure page.
   * No parameters.
   */
  back(): void {
    this.router.navigate(["/configure"]);
  }

}
