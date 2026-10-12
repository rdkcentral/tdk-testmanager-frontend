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
import { Injectable } from '@angular/core';
import { AuthService } from '../auth/auth.service';

/**
 * AuthenticatedSSEClient
 * =====================
 * A secure Server-Sent Events (SSE) client that attaches Bearer token authentication
 * headers from the AuthService, bypassing the limitation of native EventSource which cannot
 * send custom headers.
 *
 * This prevents:
 * - 401/403 errors when SSE endpoints are protected
 * - Anonymous access to protected log streams
 *
 * This service reuses AuthService for consistent token management across the application.
 *
 * Usage (with dependency injection):
 *   constructor(private sseClient: AuthenticatedSSEClient) {}
 *
 *   connect(url: string) {
 *     this.sseClient.connect(url);
 *     this.sseClient.addEventListener('log', (data) => console.log(data));
 *   }
 */
@Injectable({
  providedIn: 'root',
})
export class AuthenticatedSSEClient {
  private url: string = '';
  private abortController: AbortController | null = null;
  private eventListeners: Map<string, Set<(data: string) => void>> = new Map();
  private isConnected = false;
  private currentEventType: string = 'message'; // Tracks current SSE event type
  private currentData: string = ''; // Accumulates data lines for current event

  constructor(private authService: AuthService) {}

  /**
   * Registers an event listener for a specific event type.
   * @param eventType Event type (e.g., 'log', 'status', 'complete', 'error')
   * @param callback Callback function that receives the event data string
   */
  addEventListener(eventType: string, callback: (data: string) => void): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set());
    }
    this.eventListeners.get(eventType)!.add(callback);
  }

  /**
   * Removes an event listener.
   * @param eventType Event type
   * @param callback Callback function to remove
   */
  removeEventListener(
    eventType: string,
    callback: (data: string) => void,
  ): void {
    if (this.eventListeners.has(eventType)) {
      this.eventListeners.get(eventType)!.delete(callback);
    }
  }

  /**
   * Retrieves the Bearer token from AuthService.
   * Reuses the application's existing authentication token management.
   * @returns Bearer token string (includes 'bearer ' prefix from AuthService)
   */
  private getAuthToken(): string {
    try {
      return this.authService.getApiToken();
    } catch (e) {
      console.warn('Unable to retrieve auth token from AuthService:', e);
      return '';
    }
  }

  /**
   * Establishes the SSE connection with authenticated headers.
   * Reuses the token from AuthService for consistency with other HTTP requests.
   * Parses events and dispatches them to registered listeners.
   * @param url The URL of the SSE endpoint
   */
  connect(url: string): void {
    if (this.isConnected) {
      console.warn('SSE client is already connected');
      return;
    }

    // Reset parser state for clean parsing of new stream
    this.currentEventType = 'message';
    this.currentData = '';

    this.url = url;
    const controller = new AbortController();
    this.abortController = controller;
    const token = this.getAuthToken();

    // Build headers with Bearer token from AuthService
    // Note: AuthService.getApiToken() returns 'bearer <token>' format
    const headers: HeadersInit = {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
    };
    if (token) {
      headers['Authorization'] = token;
    }

    this.isConnected = true;

    fetch(this.url, {
      method: 'GET',
      headers,
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          this.dispatchEvent(
            'error',
            `HTTP ${response.status}: ${response.statusText}`,
          );
          if (this.abortController === controller) {
            this.isConnected = false;
            this.abortController = null;
          }
          return;
        }

        // Read the response stream line by line
        if (!response.body) {
          this.dispatchEvent('error', 'No response body');
          if (this.abortController === controller) {
            this.isConnected = false;
            this.abortController = null;
          }
          return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        const processStream = async () => {
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split(/\r?\n/);
              buffer = lines.pop() || ''; // Keep incomplete line in buffer

              for (const line of lines) {
                this.processLine(line.replace(/\r$/, ''));
              }
            }
          } catch (error) {
            if ((error as Error).name !== 'AbortError') {
              this.dispatchEvent('error', (error as Error).message);
            }
          } finally {
            // Only clear shared state if this stream is still the active one.
            if (this.abortController === controller) {
              // If stream ended but was not intentionally aborted, emit transport error
              if (!controller.signal.aborted) {
                this.dispatchEvent('error', 'Stream ended unexpectedly');
              }
              this.isConnected = false;
              this.abortController = null;
            }
          }
        };

        await processStream();
      })
      .catch((error) => {
        if (error.name !== 'AbortError') {
          this.dispatchEvent('error', error.message);
        }
        if (this.abortController === controller) {
          this.isConnected = false;
          this.abortController = null;
        }
      });
  }

  /**
   * Processes a single line from the SSE stream.
   * Parses event type and data according to SSE protocol.
   * SSE format: "event: TYPE\ndata: payload\n\n"
   * Preserves payload whitespace; removes only the protocol separator space.
   * @param line Line from SSE stream (e.g., "event: log" or "data: {...}")
   */
  private processLine(line: string): void {
    const normalizedLine = line.replace(/\r$/, '');

    if (!normalizedLine.trim()) {
      // Empty line marks end of an event
      if (this.currentData) {
        this.dispatchEvent(this.currentEventType, this.currentData);
        this.currentData = '';
        this.currentEventType = 'message'; // Reset to default
      }
      return;
    }

    if (normalizedLine.startsWith('event:')) {
      let eventType = normalizedLine.substring('event:'.length);
      // Remove at most one leading space (SSE protocol allows "event: name" or "event:name")
      if (eventType.startsWith(' ')) {
        eventType = eventType.substring(1);
      }
      this.currentEventType = eventType;
      return;
    }

    if (normalizedLine.startsWith('data:')) {
      let data = normalizedLine.substring('data:'.length);
      // Remove at most one leading space (SSE protocol allows "data: payload" or "data:payload")
      if (data.startsWith(' ')) {
        data = data.substring(1);
      }
      // For multi-line data, accumulate it (preserving all payload whitespace)
      this.currentData += (this.currentData ? '\n' : '') + data;
      return;
    }

    // Other lines (like comments starting with :) are ignored
  }

  /**
   * Dispatches an event with the given type and data.
   * @param eventType Event type (e.g., 'log', 'status', 'complete', 'error')
   * @param data Data payload (typically JSON string)
   */
  private dispatchEvent(eventType: string, data: string): void {
    const callbacks = this.eventListeners.get(eventType);
    if (callbacks) {
      callbacks.forEach((callback) => callback(data));
    }
  }

  /**
   * Closes the SSE connection and cleans up resources.
   */
  close(): void {
    const controller = this.abortController;
    if (controller) {
      controller.abort();
    }
    if (this.abortController === controller) {
      this.abortController = null;
    }
    this.isConnected = false;
    this.eventListeners.clear();
  }

  /**
   * Checks if the client is currently connected.
   * @returns true if connected, false otherwise
   */
  isOpen(): boolean {
    return this.isConnected;
  }
}
