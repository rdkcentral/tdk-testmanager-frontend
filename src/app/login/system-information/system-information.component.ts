/*
* If not stated otherwise in this file or this component's LICENSE file the
* following copyright and licenses apply:
*
* Copyright 2025 RDK Management
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
import { FooterComponent } from '../../layout/footer/footer.component';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material/material.module';
import { VersionService } from '../../services/version.service';
import { LoaderComponent } from '../../utility/component/loader/loader.component';

@Component({
  selector: 'app-system-information',
  standalone: true,
  imports: [FooterComponent, MaterialModule, RouterLink, CommonModule, LoaderComponent],
  templateUrl: './system-information.component.html',
  styleUrl: './system-information.component.css'
})

/**
 * Represents the SystemInformationComponent of the application.
 */
export class SystemInformationComponent implements OnInit {
  /**
   * Represents the version information data
   */
  versionInfo = {
    tdkBackendVersion: 'Loading...',
    tdkFrontendVersion: 'Loading...',
    tdkCoreVersion: 'Loading...',
    tdkVideoVersion: 'Loading...',
    tdkBroadbandVersion: 'Loading...'
  };

  /**
   * Represents loading state
   */
  isLoading = true;

  /**
   * Counter to track completed API calls
   */
  private completedCalls = 0;
  private totalCalls = 5;

  /**
   * Constructor for SystemInformationComponent.
   * @param router Angular Router for navigation.
   * @param versionService VersionService instance for version API calls.
   */
  constructor(
    private router: Router,
    private versionService: VersionService
  ) {}

  /**
   * Initializes the component and loads version information.
   */
  ngOnInit(): void {
    this.loadVersionInformation();
  }

  /**
   * Loads all version information from various sources
   */
  private loadVersionInformation(): void {
    this.completedCalls = 0;
    this.isLoading = true;
    this.loadFrontendVersion();
    this.loadTDKBackendVersion();
    this.loadTDKCoreVersion();
    this.loadTDKVideoVersion();
    this.loadTDKBroadbandVersion();
  }

  /**
   * Checks if all API calls are complete and updates loading state
   */
  private checkLoadingComplete(): void {
    this.completedCalls++;
    if (this.completedCalls >= this.totalCalls) {
      this.isLoading = false;
    }
  }

  /**
   * Loads the frontend version from config.json
   */
  private loadFrontendVersion(): void {
    this.versionService.getTDKFrontendVersion().subscribe({
      next: (config: any) => {
        if (config.version) {
          this.versionInfo.tdkFrontendVersion = config.version;
        } else {
          // Fallback to package.json version
          this.versionInfo.tdkFrontendVersion = 'M141'; // From package.json
        }
        this.checkLoadingComplete();
      },
      error: () => {
        this.versionInfo.tdkFrontendVersion = 'M141'; // From package.json
        this.checkLoadingComplete();
      }
    });
  }

  /**
   * Loads TDK Backend Service version
   */
  private loadTDKBackendVersion(): void {
    this.versionService.getTDKBackendVersion().subscribe({
      next: (response: any) => {
        this.versionInfo.tdkBackendVersion = response.data || response.version || response || 'Error loading version';
        this.checkLoadingComplete();
      },
      error: (error: any) => {
        console.error('Error loading TDK Backend version:', error);
        this.versionInfo.tdkBackendVersion = 'Error loading version';
        this.checkLoadingComplete();
      }
    });
  }

  /**
   * Loads TDK Core version
   */
  private loadTDKCoreVersion(): void {
    this.versionService.getTDKCoreVersion().subscribe({
      next: (response: any) => {
        this.versionInfo.tdkCoreVersion = response.data || response.version || response || 'Error loading version';
        this.checkLoadingComplete();
      },
      error: (error: any) => {
        console.error('Error loading TDK Core version:', error);
        this.versionInfo.tdkCoreVersion = 'Error loading version';
        this.checkLoadingComplete();
      }
    });
  }

  /**
   * Loads TDK Video version
   */
  private loadTDKVideoVersion(): void {
    this.versionService.getTDKVideoVersion().subscribe({
      next: (response: any) => {
        // Check for data property first, then fall back to other properties
        this.versionInfo.tdkVideoVersion = response.data || response.videoVersion || response.version || response || 'Error loading version';
        this.checkLoadingComplete();
      },
      error: (error: any) => {
        console.error('Error loading TDK Video version:', error);
        this.versionInfo.tdkVideoVersion = 'Error loading version';
        this.checkLoadingComplete();
      }
    });
  }

  /**
   * Loads TDK Broadband version
   */
  private loadTDKBroadbandVersion(): void {
    this.versionService.getTDKBroadbandVersion().subscribe({
      next: (response: any) => {
        this.versionInfo.tdkBroadbandVersion = response.data || response.version || response || 'Error loading version';
        this.checkLoadingComplete();
      },
      error: (error: any) => {
        console.error('Error loading TDK Broadband version:', error);
        this.versionInfo.tdkBroadbandVersion = 'Error loading version';
        this.checkLoadingComplete();
      }
    });
  }

}