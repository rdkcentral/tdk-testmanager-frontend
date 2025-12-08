/*
* If not stated otherwise in this file or this component's LICENSE file the
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
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../auth/auth.service';
import { SocService } from '../../../services/soc.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonFormComponent } from '../../../utility/component/common-form/common-form.component';

@Component({
  selector: 'app-create-soc',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, CommonFormComponent],
  templateUrl: './create-soc.component.html',
  styleUrl: './create-soc.component.css'
})
export class CreateSocComponent {

  socVendorName: string | undefined;
  commonFormName = 'Create';
  loggedinUser: any={};
  errormessage!: string;
  validationName = 'SoC';
  placeholderName = 'SoC Name';
  labelName = 'Name';
  configureName!:string;
  categoryName!:string;

  /**
   * Constructor for CreateSocComponent.
   * @param router Angular Router for navigation
   * @param route ActivatedRoute for accessing route parameters
   * @param service SocService for SoC operations
   * @param _snakebar MatSnackBar for notifications
   * @param authservice AuthService for authentication and user info
   */
  constructor(private router: Router, private route: ActivatedRoute, public service: SocService,
    private _snakebar: MatSnackBar, private authservice: AuthService) {
    this.loggedinUser = JSON.parse(localStorage.getItem('loggedinUser') || '{}');
  }


  /**
   * Handles the form submission event.
   * @param name - The SOC name.
   */
  /**
   * Handles the form submission event.
   * @param name The SOC name to be created.
   */
  onFormSubmitted(name: string): void {
    let obj = {
      "socName": name,
      "socCategory": this.authservice.selectedConfigVal,
      "socUserGroup": this.loggedinUser.userGroupName
    }
    if(name !== undefined && name !== null){
      this.service.createSoc(obj).subscribe({
        next: (res) => {
          this._snakebar.open(res.message, '', {
            duration: 2000,
            panelClass: ['success-msg'],
            verticalPosition: 'top'
          })
          // Reset pagination state after successful creation
          this.service.resetPaginationState();
          setTimeout(() => {
            this.router.navigate(["configure/list-soc"]);
          }, 1000);
        },
        error: (err) => {
          this._snakebar.open(err.message, '', {
            duration: 3000,
            panelClass: ['err-msg'],
            horizontalPosition: 'end',
            verticalPosition: 'top'
          })
        }
      })
    }
  }


  /**
   * Initializes the component and sets up category and form name.
   */
  ngOnInit(): void {
    this.configureName = this.authservice.selectedConfigVal;
    if(this.configureName === 'RDKB'){
      this.categoryName = 'Broadband';
      this.commonFormName = this.route.snapshot.url[1].path === 'create-soc' ? this.commonFormName + ' ' + `${this.categoryName}` + ' ' + 'SoC' : this.commonFormName;
    }else{
      this.categoryName = 'Video';
      this.commonFormName = this.route.snapshot.url[1].path === 'create-soc' ? this.commonFormName + ' ' + `${this.categoryName}` + ' ' + 'SoC' : this.commonFormName;
    }
  }


}
