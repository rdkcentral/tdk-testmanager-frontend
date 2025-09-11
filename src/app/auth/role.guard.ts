
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
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/**
 * Guard function to check if the current user's role matches any of the expected roles defined in the route data.
 *
 * @param route - The activated route snapshot containing route-specific data.
 * @param state - The router state snapshot at the time of activation.
 * @returns `true` if the user's role is included in the expected roles; otherwise, `false`.
 *
 * @remarks
 * - Uses dependency injection to access `AuthService` and `Router`.
 * - Expects the route data to contain a `role` property, which is an array of allowed roles.
 * - Calls `authService.getPrivileges()` to get the current user's role.
 */
export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const roles = route.data['role'];
  const role = authService.getPrivileges();
  let expectedRole = roles.includes(role);
  if (expectedRole === false) {
    return false
  }
  return true;
};
