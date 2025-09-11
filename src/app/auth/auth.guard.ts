/*
* If not stated otherwise in this file or this component's Licenses.txt file the
* following copyright and licenses apply:
* Copyright 2024 RDK Management
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
http://www.apache.org/licenses/LICENSE-2.0
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { inject } from '@angular/core';

/**
 * Guard function to determine if a route can be activated based on authentication status.
 *
 * This guard uses the injected `AuthService` to check if the user is logged in.
 * If the user is authenticated, navigation proceeds. Otherwise, the user is redirected
 * to the root route (`"/"`) and navigation is prevented.
 *
 * @param route - The activated route snapshot.
 * @param state - The router state snapshot.
 * @returns `true` if the user is logged in; otherwise, navigates to root and returns `false`.
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router)

  if (authService.isLoggednIn()) {
    return true
  } else {
    router.navigate(["/"]);
    return false;
  }
};
