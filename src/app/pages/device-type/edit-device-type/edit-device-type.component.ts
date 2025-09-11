import { Component } from '@angular/core';
import { DevicetypeService } from '../../../services/devicetype.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';

@Component({
  selector: 'app-edit-device-type',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, NgMultiSelectDropDownModule, FormsModule],
  templateUrl: './edit-device-type.component.html',
  styleUrl: './edit-device-type.component.css'
})
// EditDeviceTypeComponent for updating device type
export class EditDeviceTypeComponent {

  selectedItems: { item_id: number, item_text: string }[] = [];
  submitted = false;
  updateDeviceTypeForm!: FormGroup;
  configureName!: string;
  user: any;
  categoryName!: string;

  /**
   * This component is responsible for editing an existing device type.
   * It initializes the form with existing data, handles form submission,
   * and interacts with the DevicetypeService to update the device type.
   * @param formBuilder - FormBuilder service for creating reactive forms
   * @param router - Router service for navigation
   * @param authservice - AuthService for authentication-related operations
   * @param service - DevicetypeService for device type operations
   * @param _snakebar - MatSnackBar for displaying messages   
   */
  constructor(private formBuilder: FormBuilder, private router: Router,
    private authservice: AuthService, private service: DevicetypeService, private _snakebar: MatSnackBar) {
    this.user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!this.user) {
      this.router.navigate(['configure/list-devicetype']);
    }

  }

  /**
   * Lifecycle hook called after component initialization.
   */  
  ngOnInit(): void {
    this.updateDeviceTypeForm = this.formBuilder.group({
      devicetypeName: [this.user.deviceTypeName, [Validators.required, Validators.minLength(4)]],
      selectDevicetype: [this.user.deviceType, Validators.required]
    });
    this.configureName = this.authservice.selectedConfigVal;
    if(this.configureName === 'RDKB'){
      this.categoryName = 'Broadband';
    }else{
      this.categoryName = 'Video';
    }
  }

  /**
   * Getter for updateDeviceTypeForm controls.
   */
  get f() { return this.updateDeviceTypeForm.controls; }
  
  /**
   * Updates the box type.
   */
  updateDeviceType():void {
    this.submitted = true;
    if (this.updateDeviceTypeForm.invalid) {
      return
    } else {
      let data = {
        deviceTypeId:this.user.deviceTypeId,
        deviceTypeName: this.updateDeviceTypeForm.value.devicetypeName,
        deviceType: this.updateDeviceTypeForm.value.selectDevicetype,
        deviceTypeCategory: this.user.deviceTypeCategory.toUpperCase()
      }
      this.service.updateDeviceType(data).subscribe({
        next: (res) => {
          
          if(res){
            this._snakebar.open(res.message, '', {
              duration: 3000,
              panelClass: ['success-msg'],
              verticalPosition: 'top'
            })
            setTimeout(() => {
              this.router.navigate(["configure/list-devicetype"]);
            }, 1000);
          }
        },
        error: (err) => {
          console.log(err);
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
   * Navigates back to the list of device types.
   */
  goBack():void {
    this.router.navigate(["configure/list-devicetype"]);
  }

}
