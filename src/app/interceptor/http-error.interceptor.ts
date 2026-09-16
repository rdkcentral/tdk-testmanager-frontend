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
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const snackBar = inject(MatSnackBar);
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let message = 'An unknown error occurred.';

      if (error instanceof HttpErrorResponse) {
        if (error.status == 0) {
          message = 'Network error: Please check your internet connection.';
        } else {
          message = extractMessage(error.error);
        }
      } else if (isProgressEventError(error)) {
        message =
          'Network error: Please check your internet connection or the backend server may be down.';
      } else if (isObject(error) && 'error' in error) {
        message = extractMessage(error);
      } else if (isObject(error) && 'message' in error) {
        message = extractMessage(error);
      } else {
        console.error('Unknown Error:', error);
      }

      // Preserve original HTTP response metadata and normalized message for all response types
      // Set error property to the response body (Blob, object, or string) so consumers can access err.error
      const errorObject: any = {
        error: error.error, // The raw response body (Blob for binary, object for JSON, string otherwise)
        status: error.status, // HTTP status code
        statusText: error.statusText, // HTTP status text
        headers: error.headers, // HTTP headers
        url: error.url, // Request URL
        message: message, // Normalized message (for display)
      };

      // For non-Blob object responses, merge in backend properties to preserve nested field access
      if (isObject(error.error) && !(error.error instanceof Blob)) {
        for (const key in error.error) {
          if (!(key in errorObject)) {
            errorObject[key] = (error.error as any)[key];
          }
        }
      }

      // snackBar.open(message || 'An error occurred', 'Close', {
      //   duration: 2500,
      //   panelClass: ['err-msg'],
      //   horizontalPosition: 'end',
      //   verticalPosition: 'top'
      // });
      return throwError(() => errorObject);
    }),
  );
};

function extractMessage(error: any): string {
  if (typeof error === 'string') {
    // Try to parse as JSON first (handle serialized error objects)
    try {
      const parsed = JSON.parse(error);
      return extractMessage(parsed); // Recurse with parsed object
    } catch {
      // If not valid JSON, return the string as-is
      return error;
    }
  } else if (typeof error === 'object' && error !== null) {
    // Prefer message property first (most useful for user feedback)
    if ('message' in error && typeof error.message === 'string') {
      return error.message;
    }
    // Fall back to recursively unwrapping error property
    if ('error' in error) {
      return extractMessage(error.error);
    }
    if ('statusText' in error && typeof error.statusText === 'string') {
      return error.statusText;
    }
  }
  return 'An unknown error occurred.';
}

function isProgressEventError(
  error: unknown,
): error is { error: ProgressEvent } {
  return (
    isObject(error) &&
    'error' in error &&
    error['error'] instanceof ProgressEvent
  );
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
