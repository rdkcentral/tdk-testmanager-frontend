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
import { CommonModule } from '@angular/common';
import { VersionService } from '../../services/version.service';

/**
 * FooterComponent is responsible for displaying the footer of the application.
 * It includes functionality to display the application version.
 * It uses the VersionService to fetch the application version.
 *
 * @remarks
 * - The component uses Angular's dependency injection to access services.
 * - It imports CommonModule for common directives and features.
 *
 * @example
 * ```html
 * <app-footer></app-footer>
 * ```
 *
 * @see {@link VersionService} for fetching application version.
 */
@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {

  versionName:string= '';
  loggedinUser:any;

  constructor(private versionService: VersionService) {
    this.loggedinUser = JSON.parse(localStorage.getItem('loggedinUser')|| '{}');
  }
  /**
   * Initializes the component
   */
  ngOnInit():void{
    this.getAppVersion();
  }
  /**
   * This method is for getting the version name.
   */
  getAppVersion():void{
    this.versionService.getTDKCoreVersion().subscribe({
      next:(res)=>{
        this.versionName = res.data;
      },
      error:()=>{
        this.versionName = "";
      }
    })
  }
}