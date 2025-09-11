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

// Component for creating a new device type
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DevicetypeService } from '../../../services/devicetype.service';
import { CommonModule } from '@angular/common';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';

@Component({
  selector: 'app-create-device-type',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, NgMultiSelectDropDownModule, FormsModule],
  templateUrl: './create-device-type.component.html',
  styleUrl: './create-device-type.component.css'
})

// Class for CreateDeviceTypeComponent
export class CreateDeviceTypeComponent implements OnInit {

  [x: string]: any;
  submitted = false;
  createDeviceTypeForm!: FormGroup;
  dropdownList: any;
  configureName!: string;
  userGroupName: any;
  categoryName!: string;

  // Constructor for CreateDeviceTypeComponent
  constructor(private formBuilder: FormBuilder, private router: Router,
    private service: DevicetypeService, private authservice: AuthService, private _snakebar: MatSnackBar) {
    this.userGroupName = JSON.parse(localStorage.getItem('loggedinUser') || '{}');

  }

  /**
   * Initializes the component.
   */
  ngOnInit(): void {
    this.createDeviceTypeForm = this.formBuilder.group({
      devicetypeName: ['', [Validators.required, Validators.minLength(3)]],
      selectDevicetype: ['', Validators.required]
    });
  
    this.configureName = this.authservice.selectedConfigVal;
    if(this.configureName === 'RDKB'){
      this.categoryName = 'Broadband';
    }else{
      this.categoryName = 'Video';
    }
  }

  /**
   * Getter for the form controls.
   */
  get f() { return this.createDeviceTypeForm.controls; }
  
  /**
   * Creates a new device type.
   */
  createDeviceType() :void{
    this.submitted = true;
    if (this.createDeviceTypeForm.invalid) {
      return
    } else {
      let data = {
        deviceTypeName: this.createDeviceTypeForm.value.devicetypeName,
        deviceType: this.createDeviceTypeForm.value.selectDevicetype,
        deviceTypeCategory: this.authservice.selectedConfigVal,
        deviceTypeUserGroup: this.userGroupName.userGroupName
      }
      this.service.createDeviceType(data).subscribe({
        next: (res) => {
          this._snakebar.open(res.message, '', {
            duration: 3000,
            panelClass: ['success-msg'],
            verticalPosition: 'top'
          })
          setTimeout(() => {
            this.router.navigate(["configure/list-devicetype"]);
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
   * Resets the form.
   */
  reset():void {
    this.createDeviceTypeForm.reset();
  }

  /**
   * Navigates back to the list of device types.
   */
  goBack():void {
    this.router.navigate(["/configure/list-devicetype"]);
  }

}
