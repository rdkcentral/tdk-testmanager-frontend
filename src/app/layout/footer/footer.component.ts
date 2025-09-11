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
import { ThemeService } from '../../services/theme.service';
import { CommonModule } from '@angular/common';
import { UsergroupService } from '../../services/usergroup.service';
import { MatSnackBar } from '@angular/material/snack-bar';

/** FooterComponent is responsible for displaying the footer of the application.
* It includes functionality to toggle themes, display the application version,
* and show the logged-in user's information.
* * It uses the UsergroupService to fetch the application version and the MatSnackBar
 * to display messages.
* @remarks
 * - The component uses Angular's dependency injection to access services.
 * - It imports CommonModule for common directives and features.  
 * * @example
 * ```html
 * <app-footer></app-footer>
 * ```
 * @see {@link UsergroupService} for fetching application version.
 * @see {@link MatSnackBar} for displaying messages.
 */
@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {

  isChecked = false;
  vesionName!:string;
  loggedinUser:any;

  constructor(private userservice: UsergroupService,
    private _snakebar: MatSnackBar,
  ) { 

    this.loggedinUser = JSON.parse(localStorage.getItem('loggedinUser')|| '{}');
  }
  /**
   * Initializes the component
   */
  ngOnInit(): void {
    this.getAppVersion();
  }
  /**
   * This method is for getting the version name.
   */
  getAppVersion():void{
    this.userservice.appVersion().subscribe({      
      next:(res)=>{
        this.vesionName = res.data;        
      },
      error:(err)=>{        
         this.vesionName = "";
      }
    })
  }
}
