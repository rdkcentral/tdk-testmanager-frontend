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
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MaterialModule } from '../../../material/material.module';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../auth/auth.service';
import { UsergroupService } from '../../../services/usergroup.service';

@Component({
  selector: 'app-common-form',
  standalone: true,
  imports: [CommonModule,HttpClientModule,ReactiveFormsModule,MaterialModule],
  templateUrl: './common-form.component.html',
  styleUrl: './common-form.component.css'
})
export class CommonFormComponent implements OnChanges{
  @Output() formSubmitted = new EventEmitter<any>();
  @Input() initialValue: any;
  @Input() isEdit = false;
  @Input() formTitle:any
  @Input()validationName:any;
  @Input()placeholderName:any;
  @Input()labelName:any;
  createUpdateForm!: FormGroup;
  user:any;
  

  /**
   * Constructor for CommonFormComponent.
   * @param fb FormBuilder for reactive forms.
   * @param router Router for navigation.
   * @param route ActivatedRoute for route information.
   * @param authservice AuthService for authentication.
   * @param usergroupService UsergroupService for user group operations.
   */
  
  constructor(private fb: FormBuilder,private router: Router,
    private route:ActivatedRoute, private authservice:AuthService,
    public usergroupService:UsergroupService
  ) {
    this.createUpdateForm = this.fb.group({
      name: ['', Validators.required],
    });
  }


  /**
   * Angular lifecycle hook called when input properties change.
   * @param changes Object of changed input properties.
   */
  
  ngOnChanges(changes: SimpleChanges) {
    if(this.route.snapshot.url[1].path ==='group-edit'){
      if (changes['initialValue'] && this.initialValue) {
        this.createUpdateForm.controls['name'].patchValue(this.initialValue.userGroupName);
      }
    }
    if(this.route.snapshot.url[1].path ==='oem-edit'){
      if (changes['initialValue'] && this.initialValue) {
        this.createUpdateForm.controls['name'].patchValue(this.initialValue.oemName);
      }
    }
    if(this.route.snapshot.url[1].path ==='edit-soc'){
      if (changes['initialValue'] && this.initialValue) {
        this.createUpdateForm.controls['name'].patchValue(this.initialValue.socName);
      }
    }
    if(this.route.snapshot.url[1].path ==='scripttag-edit'){
      if (changes['initialValue'] && this.initialValue) {
        this.createUpdateForm.controls['name'].patchValue(this.initialValue.scriptTagName);
      }
    }
    if(this.route.snapshot.url[1].path ==='edit-rdkversions'){
      if (changes['initialValue'] && this.initialValue) {
        this.createUpdateForm.controls['name'].patchValue(this.initialValue.buildVersionName);
      }
    }

  }

  /**
   * Handles form submission and emits the form value if valid.
   */
  
  onSubmit(): void {
    if (this.createUpdateForm.invalid) {
      return;
    }else{
      this.formSubmitted.emit(this.createUpdateForm.value.name);
    }
  }

  /**
   * Navigates back to the appropriate list or create page based on the current route.
   */
  
  goBack(){
    if(this.route.snapshot.url[1].path ==='group-add' || this.route.snapshot.url[1].path ==='group-edit'){
      this.router.navigate(['configure/create-group']);
    }
    if(this.route.snapshot.url[1].path ==='create-oem'|| this.route.snapshot.url[1].path === 'oem-edit'){
      this.router.navigate(['configure/list-oem']);
    }
    if(this.route.snapshot.url[1].path ==='create-soc'|| this.route.snapshot.url[1].path === 'edit-soc'){
      this.router.navigate(['configure/list-soc']);
    }
    if(this.route.snapshot.url[1].path ==='scripttag-create'|| this.route.snapshot.url[1].path === 'scripttag-edit'){
      this.router.navigate(['configure/scripttag-list']);
    }
    if(this.route.snapshot.url[1].path ==='create-rdkversions'|| this.route.snapshot.url[1].path === 'edit-rdkversions'){
      this.router.navigate(['configure/list-rdkversions']);
    }
  }

  /**
   * Resets the form and emits the reset event.
   */
  reset(){
    this.formSubmitted.emit(this.createUpdateForm.reset());
  }

}
