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
import { AuthService } from '../../../auth/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OemService } from '../../../services/oem.service';

@Component({
  selector: 'app-create-oem',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, CommonFormComponent],
  templateUrl: './create-oem.component.html',
  styleUrl: './create-oem.component.css'
})
export class CreateOemComponent implements OnInit{

  userGroupName: string | undefined;
  commonFormName = 'Create';
  errormessage!: string;
  validationName = 'oem'
  placeholderName = 'OEM name'
  loggedinUser: any={};
  labelName = 'Name'
  configureName!:string;
  categoryName!:string;

  /**
   * Constructor for CreateOemComponent.
   * @param router Router instance for navigation.
   * @param service OemService instance for OEM operations.
   * @param route ActivatedRoute instance for route information.
   * @param _snakebar MatSnackBar instance for notifications.
   * @param authservice AuthService instance for authentication and config value.
   */
  constructor(private router: Router, public service: OemService,
    private route: ActivatedRoute, private _snakebar: MatSnackBar, private authservice: AuthService) {
    this.loggedinUser = JSON.parse(localStorage.getItem('loggedinUser') || '{}');
  }



    /**
     * Initializes the component and sets up initial state.
     * No parameters.
     */
    ngOnInit(): void {
      this.configureName = this.authservice.selectedConfigVal;
      if (this.configureName === 'RDKB') {
        this.categoryName = 'Broadband';
        this.commonFormName = this.route.snapshot.url[1].path === 'create-oem' ? this.commonFormName + ' ' + `${this.categoryName}` + ' ' + 'OEM' : this.commonFormName;
      } else {
        this.categoryName = 'Video';
        this.commonFormName = this.route.snapshot.url[1].path === 'create-oem' ? this.commonFormName + ' ' + `${this.categoryName}` + ' ' + 'OEM' : this.commonFormName;
      }
    }


    

  /**
   * Handles the form submission event.
   * @param name The name of the OEM.
   */
  onFormSubmitted(name: string): void {
    let obj = {
      "oemName": name,
      "oemCategory": this.authservice.selectedConfigVal,
      "oemUserGroup": this.loggedinUser.userGroupName
    }
    if (name !== undefined && name !== null) {
      this.service.createOem(obj).subscribe({
        next: (res) => {
          this._snakebar.open(res.message, '', {
            duration: 3000,
            panelClass: ['success-msg'],
            verticalPosition: 'top'
          })
          setTimeout(() => {
            this.router.navigate(["configure/list-oem"]);
          }, 1000);
        },
        error: (err) => {
          this._snakebar.open(err.message, '', {
            duration: 4000,
            panelClass: ['err-msg'],
            horizontalPosition: 'end',
            verticalPosition: 'top'
          })
        }
      })
    }
  }


}
