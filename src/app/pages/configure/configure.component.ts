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
import { MaterialModule } from '../../material/material.module';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-configure',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialModule, RouterLink, RouterLinkActive],
  templateUrl: './configure.component.html',
  styleUrl: './configure.component.css'
})
export class ConfigureComponent implements OnInit {
  rdkvVisible = true;
  rdkbVisible = false;
  privileges!: string | null;
  loggedInUser:any;
  defaultCategory!:string;
  selectedCategory!:string;
  preferedCategory!:string;

  /**
   * Constructor for ConfigureComponent
   * @param router - Router instance
   * @param service - AuthService instance
   */
  constructor(private router: Router, private service: AuthService) { 
    this.loggedInUser = JSON.parse(localStorage.getItem('loggedinUser')|| '{}');
    this.defaultCategory = this.loggedInUser.userCategory;
    this.preferedCategory = localStorage.getItem('preferedCategory')|| '';
  }


  /**
   * Initializes the component.
   */ 
  ngOnInit(): void {
    this.service.selectedConfigVal = this.preferedCategory?this.preferedCategory:this.defaultCategory;
    this.selectedCategory = this.preferedCategory?this.preferedCategory:this.defaultCategory;
    this.privileges = this.service.getPrivileges();
    if(this.selectedCategory === 'RDKB'){
      this.rdkbVisible = true;
      this.rdkvVisible = false;
    }else{
      this.rdkvVisible = true;
      this.rdkbVisible = false;
    }
     //Resets the view for scripts when moving to other tabs
    localStorage.setItem('viewName', 'scripts');
  }

  /**
   * Handles the radiobutton of category change event.
   * @param event - The change event from the radiobutton.
   */
  categoryChange(event:any){
    let val = event.target.value;
    if (val === 'RDKB') {
      this.rdkbVisible = true;
      this.rdkvVisible = false;
      this.service.selectedConfigVal = 'RDKB';
      this.service.showSelectedCategory = "Broadband";
      localStorage.setItem('preferedCategory', 'RDKB');
    } else {
      this.rdkvVisible = true;
      this.rdkbVisible = false;
      this.service.selectedConfigVal = 'RDKV';
      this.service.showSelectedCategory = "Video";
      localStorage.setItem('preferedCategory', 'RDKV')
    }
  }


  /**
   * Navigates to the specified route based on the provided value.
   * @param val - The value representing the route to navigate to.
   */
  navigationToUser(val: any):void {
    if (val === 'groups') {
      this.router.navigate(["configure/create-group"]);
    }
    if(val === 'upgrade'){
      this.router.navigate(["app-upgrade"]);
    }
    if (val === 'usermanagement') {
      this.router.navigate(["configure/user-management"]);
    }
    if (val === 'oem') {
      this.router.navigate(["configure/list-oem"]);
    }
    if (val === 'socvendors') {
      this.router.navigate(["configure/list-soc"]);
    }
    if (val === 'devicetype') {
      this.router.navigate(["configure/list-devicetype"]);
    }
    if (val === 'streamingdetails') {
      this.router.navigate(['configure/list-streamdetails']);
    }
    if (val === 'streamingtemplates') {
      this.router.navigate(['configure/streamingtemplates-list']);
    }
    if (val === 'modules') {
      this.router.navigate(['configure/modules-list']);
    }
    if (val === 'scripttags') {
      this.router.navigate(['configure/scripttag-list']);
    }
    if (val === 'rdkversions') {
      this.router.navigate(['configure/list-rdkversions']);
    }
    if (val === 'prmitivetest') {
      this.router.navigate(['configure/list-primitivetest']);
    }
  }



}
