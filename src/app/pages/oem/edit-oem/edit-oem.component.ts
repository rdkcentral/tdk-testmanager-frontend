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
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../auth/auth.service';
import { UsergroupService } from '../../../services/usergroup.service';
import { CommonFormComponent } from '../../../utility/component/common-form/common-form.component';
import { OemService } from '../../../services/oem.service';

@Component({
  selector: 'app-edit-oem',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, CommonFormComponent],
  templateUrl: './edit-oem.component.html',
  styleUrl: './edit-oem.component.css'
})
export class EditOemComponent implements OnInit{

  record: any;
  id!: number;
  commonFormName = 'Update';
  errormessage!: string;
  validationName = 'oem'
  placeholderName = 'OEM Name'
  labelName = "Name";
  configureName!:string;
  categoryName!:string;

  /**
   * Constructor for EditOemComponent.
   * @param route ActivatedRoute instance for route information.
   * @param router Router instance for navigation.
   * @param service UsergroupService instance for user group operations.
   * @param _snakebar MatSnackBar instance for notifications.
   * @param oemService OemService instance for OEM operations.
   * @param authservice AuthService instance for authentication and config value.
   */
  constructor(private route: ActivatedRoute, private router: Router,
    public service: UsergroupService, private _snakebar: MatSnackBar,
    private oemService: OemService,
    private authservice: AuthService
  ) {
    this.service.currentUrl = this.route.snapshot.url[1].path
  }


  /**
   * Initializes the component and sets up initial state.
   * No parameters.
   */
  ngOnInit(): void {
    this.id = +this.route.snapshot.params['id'];
    this.service.currentUrl = this.id;
    let data = JSON.parse(localStorage.getItem('user') || '{}');
    this.record = data;
    this.configureName = this.authservice.selectedConfigVal;
    if (this.configureName === 'RDKB') {
      this.categoryName = 'Broadband';
      this.commonFormName = this.route.snapshot.url[1].path === 'oem-edit' ? this.commonFormName + ' ' + `${this.categoryName}` + ' ' + 'OEM' : this.commonFormName;
    } else {
      this.categoryName = 'Video';
      this.commonFormName = this.route.snapshot.url[1].path === 'oem-edit' ? this.commonFormName + ' ' + `${this.categoryName}` + ' ' + 'OEM' : this.commonFormName;
    }
  }


  /**
   * Handles the form submission event.
   * @param name The name of the OEM.
   */
  onFormSubmitted(name: any): void {
    let obj = {
      oemId: this.record.oemId,
      oemName: name,
      oemCategory: this.authservice.selectedConfigVal
    }
    if (name != undefined && name != null) {
      this.oemService.updateOem(obj).subscribe({
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
            duration: 3000,
            panelClass: ['err-msg'],
            horizontalPosition: 'end',
            verticalPosition: 'top'
          })
        }
      })
    }
  }


}
