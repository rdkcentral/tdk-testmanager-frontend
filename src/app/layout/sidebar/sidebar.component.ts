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
import { Component, OnInit, ViewChild } from '@angular/core';
import { MaterialModule } from '../../material/material.module';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { MatSidenav } from '@angular/material/sidenav';
import { UsergroupService } from '../../services/usergroup.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [MaterialModule, RouterOutlet],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})

/**
 * Represents the SidebarComponent of the application.
 */
export class SidebarComponent implements OnInit {
  
  @ViewChild('sidenav') sidenav!: MatSidenav;

  /**
   * Constructor for SidebarComponent.
   * @param router Angular Router for navigation events.
   * @param service UsergroupService instance for user group operations.
   */
  constructor(private router: Router, public service: UsergroupService) { }

  /**
   * Initializes the component.
   */
  ngOnInit(): void {
  }

  /**
   * Closes or opens the sidenav based on navigation events.
   */
  ngAfterViewInit(): void {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (event.url === '/configure' || event.url === '/configure/user-management' || event.url === '/configure/create-user' ||
          event.url === '/configure/edit-user' || event.url === '/configure/create-group' || event.url === '/configure/group-add' ||
          event.url === `/configure/group-edit/${localStorage.getItem('userGroupId')}` || event.url === '/configure/list-oem' ||
          event.url === '/configure/create-oem' || event.url === '/configure/oem-edit' || event.url === '/configure/list-soc' ||
          event.url === '/configure/create-soc' || event.url === '/configure/edit-soc' ||
          event.url === '/configure/list-devicetype' || event.url === '/configure/create-devicetype' || event.url === '/configure/edit-devicetype' ||
          event.url === '/devices' || event.url === '/devices/device-create' || event.url === '/configure/list-streamdetails' ||
          event.url === '/configure/create-streamdetails' || event.url === '/configure/create-radiostreamdetails' || event.url === '/configure/edit-radiostreamdetails' ||
          event.url === '/cofigure/edit-streamdetails' || event.url === '/cofigure/edit-streamdetails' ||
          event.url === '/configure/streamingtemplates-list' || event.url === '/configure/streamingtemplates-create' || event.url === '/configure/streamingtemplates-edit' ||
          event.url === '/devices/device-edit' || event.url === '/configure/modules-list' || event.url === '/configure/parameter-list' || event.url === '/configure/function-list'||
          event.url === '/configure/modules-create' || event.url === '/configure/function-create' || event.url === '/configure/parmeter-create' || event.url === '/configure/scripttag-list' || 
          event.url === '/configure/scripttag-create' || event.url === '/configure/scripttag-edit' || event.url === '/configure/list-rdkversions' ||
          event.url === '/configure/create-rdkversions' || event.url === '/configure/edit-rdkversions' || event.url === '/configure/list-primitivetest' || event.url === '/configure/create-primitivetest' || event.url === '/configure/edit-primitivetest' || 
          event.url === '/configure/modules-edit' || event.url === '/configure/parameter-edit' || event.url === '/configure/function-edit' || event.url ==='/script' || event.url ==='/script/create-scripts' || event.url === '/execution' ||
          event.url === '/script/create-script-group' || event.url ==='/script/edit-scripts' || event.url ==='/script/custom-testsuite' || event.url === '/script/edit-testsuite' || event.url === '/configure/list-rdk-certifications' || 
          event.url === '/configure/create-rdk-certifications' || event.url === '/configure/edit-rdk-certifications' || event.url ==='/analysis' || event.url ==='/prefered-category' ||  event.url === '/app-upgrade' && this.sidenav) {
          this.sidenav.close();
        } else {
          this.sidenav.open();
        }
      }
    });
  }

}
