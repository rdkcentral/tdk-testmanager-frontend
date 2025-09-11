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
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const snackBar = inject(MatSnackBar);
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {

      let errorMessage = 'An unknown error occurred.';

      if (error instanceof HttpErrorResponse) {
        if(error.status == 0){
          errorMessage = 'Network error: Please check your internet connection.';
        }
        if(error.status == 404){
          errorMessage = error.error
        }
        if(error.status == 401){          
          errorMessage =error.error
        }
        if(error.status == 400){
          errorMessage =error.error
        }
        if(error.status == 409){
          errorMessage =error.error
        }

        if(error.status == 500){
          errorMessage = error.error   

        }
       if(error.status == 503){
          errorMessage = error.error   

        }

      } else if (isProgressEventError(error)) {
        errorMessage = 'Network error: Please check your internet connection or the backend server may be down.';

      } else if (isObject(error) && 'error' in error) {
        errorMessage = extractMessage(error);

      } else if (isObject(error) && 'message' in error) {
        errorMessage = extractMessage(error);

      } else {
        console.error('Unknown Error:', error);
      }
      // snackBar.open(errorMessage || 'An error occurred', 'Close', {
      //   duration: 2500,
      //   panelClass: ['err-msg'],
      //   horizontalPosition: 'end',
      //   verticalPosition: 'top'
      // });
      return throwError(() =>errorMessage);
    })
  );
};

function extractMessage(error: any): string {
  if (typeof error === 'string') {
    return error;
  } else if (typeof error === 'object' && error !== null) {
    if ('message' in error && typeof error.message === 'string') {
      return error.message;
    }
  }
  return 'An unknown error occurred.';
}
 

 
function isProgressEventError(error: unknown): error is { error: ProgressEvent } {
  return isObject(error) && 'error' in error && error['error'] instanceof ProgressEvent;
}
 
function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
