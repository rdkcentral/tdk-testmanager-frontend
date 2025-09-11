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
import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { appConfig } from './app.config';


/**
 * Server-specific Angular application configuration.
 * Provides server rendering capabilities for Angular Universal.
 *
 * @type {ApplicationConfig}
 */
const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering()
  ]
};


/**
 * Merges the main application configuration with the server-specific configuration.
 *
 * @param appConfig The main application configuration object.
 * @param serverConfig The server-specific configuration object.
 * @returns The merged ApplicationConfig for server-side rendering.
 */
export const config = mergeApplicationConfig(appConfig, serverConfig);
