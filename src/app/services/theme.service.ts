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
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { effect, Inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { BehaviorSubject, catchError, firstValueFrom, Observable, of, tap } from 'rxjs';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  userloggedIn:any;
  private currentThemeSubject: BehaviorSubject<string> = new BehaviorSubject<string>(this.getInitialTheme());
  public currentTheme: Observable<string> = this.currentThemeSubject.asObservable();

  /**
   * Constructor for ThemeService.
   * @param http HttpClient for HTTP requests
   * @param authService AuthService for authentication and API token
   * @param config Application configuration injected as APP_CONFIG
   */
  constructor(private http: HttpClient,private authService: AuthService,
    @Inject('APP_CONFIG') private config: any
  ) {
    this.userloggedIn = JSON.parse(localStorage.getItem('loggedinUser') || '{}');
   }

  /**
   * Gets the initial theme from local storage or defaults to 'LIGHT'.
   * @returns The initial theme string.
   */
  getInitialTheme(): string {
      const savedTheme = localStorage.getItem('theme');
      return savedTheme ? savedTheme : 'LIGHT'; 
  }

  /**
   * Updates the theme for a user and notifies subscribers.
   * @param userId The user ID to update the theme for.
   * @param theme The theme to set.
   */
  themeUpdateService(userId:any, theme:any): void{
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    
    localStorage.setItem('theme', theme);
     this.http.put(`${this.config.apiUrl}api/v1/users/settheme?userId=${userId}&theme=${theme}`,null ,{ headers, responseType: 'text' }).subscribe(res=>{
     })
     this.currentThemeSubject.next(theme);
  }

  /**
   * Gets the theme for a user.
   * @param userId The user ID to get the theme for.
   * @returns Observable with the theme.
   */
  getTheme(userId:any): Observable<any>{
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    return this.http.get(`${this.config.apiUrl}api/v1/users/gettheme?userId=${userId}`,{ headers })
    // .pipe(
    //   catchError(() => {
    //     return of('LIGHT'); 
    //   })
    // ).subscribe(response => {
    //   let theme = response;
    //   this.setTheme(theme); 
    // });
  }

  /**
   * Sets the theme and applies it.
   * @param theme The theme to set.
   */
  setTheme(theme: string): void {
    localStorage.setItem('theme', theme);
    this.currentThemeSubject.next(theme);
    this.applyTheme(theme); 
  }
  
  /**
   * Applies the theme to the document body.
   * @param theme The theme to apply.
   */
  applyTheme(theme: string): void {
    if (theme === 'DARK') {
      document.body.classList.add('dark');
      document.body.classList.remove('light');
    } else {
      document.body.classList.add('light');
      document.body.classList.remove('dark');
    }
  }
}
