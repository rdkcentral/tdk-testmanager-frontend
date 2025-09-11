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
import { Injectable , Inject} from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { BehaviorSubject, map, Observable, of } from 'rxjs';
import { saveAs } from 'file-saver';


@Injectable({
  providedIn: 'root'
})
export class DeviceService {

  deviceCategory!: string;
  fileName!: string;
  private storageKey = 'streamData';
  typeOfboxtypeDropdown!: string;
  showSelectedCategory: string = 'Video';

  /**
   * Constructor for DeviceService.
   * @param http HttpClient for HTTP requests
   * @param authService AuthService for authentication and API token
   * @param config Application configuration injected as APP_CONFIG
   */
  constructor(private http: HttpClient, private authService: AuthService,
    @Inject('APP_CONFIG') private config: any
  ) { }

  /**
   * Checks if the given boxtype is a gateway.
   * @param boxtype The boxtype to check.
   * @returns Observable with the result as text.
   */
  isBoxtypeGateway(boxtype: any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    return this.http.get(`${this.config.apiUrl}api/v1/boxtype/istheboxtypegateway?boxType=${boxtype}`, { headers, responseType: 'text' });

  }

  /**
   * Finds all devices by category.
   * @param category The category to filter devices by.
   * @returns Observable with the list of devices.
   */
  findallbyCategory(category: any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    return this.http.get(`${this.config.apiUrl}api/v1/device/findAllByCategory?category=${category}`, { headers });

  }

  /**
   * Creates a new device.
   * @param data The device data to create.
   * @returns Observable with the creation result.
   */
  createDevice(data: any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    return this.http.post(`${this.config.apiUrl}api/v1/device/create`, data, { headers })
  }

  /**
   * Gets the list of gateway devices for a category.
   * @param category The category to filter gateway devices by.
   * @returns Observable with the list of gateway devices as text.
   */
  getlistofGatewayDevices(category: any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    return this.http.get(`${this.config.apiUrl}api/v1/device/getlistofgatewaydevices?category=${category}`, { headers, responseType: 'text' });
  }

  /**
   * Updates a device.
   * @param data The device data to update.
   * @returns Observable with the update result.
   */
  updateDevice(data: any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    return this.http.put(`${this.config.apiUrl}api/v1/device/update`, data, { headers })
  }

  /**
   * Deletes a device by ID.
   * @param id The ID of the device to delete.
   * @returns Observable with the deletion result.
   */
  deleteDevice(id: any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    return this.http.delete(`${this.config.apiUrl}api/v1/device/delete?id=${id}`, { headers });
  }

  /**
   * Downloads a device XML by name.
   * @param name The name of the device to download.
   * @returns Observable with the device XML as a blob.
   */
  downloadDevice(name: any): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    return this.http.get(`${this.config.apiUrl}api/v1/device/downloadXML?deviceName=${name}`, { headers, responseType: 'blob' })
  }

  /**
   * Uploads a device XML file.
   * @param file The XML file to upload.
   * @returns Observable with the upload result.
   */
  uploadXMLFile(file: File): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);

    return this.http.post(`${this.config.apiUrl}api/v1/device/uploadxml`, formData, { headers});
  }

  /**
   * Downloads a device config file by device type and thunder flag.
   * @param deviceTypeName The name of the device type.
   * @param deviceType The type of the device.
   * @param isThunder Whether thunder is enabled.
   * @returns Observable with the config file blob and status.
   */
  downloadDeviceConfigFile(deviceTypeName: string, deviceType: string, isThunder: boolean): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    return this.http.get(`${this.config.apiUrl}api/v1/device/downloadDeviceConfigFile?deviceTypeName=${deviceTypeName}&deviceType=${deviceType}&isThunderEnabled=${isThunder}`, { headers, responseType: 'blob', observe: 'response' }).pipe(
      map((response: HttpResponse<Blob>) => {
        const contentDisposition = response.headers.get('content-disposition');
        let filename = 'device.config';
        if (contentDisposition) {
          const matches = /filename="([^"]*)"/.exec(contentDisposition);
          if (matches && matches[1]) {
            filename = matches[1];
          }
        }
        const status = {
          ...response.body,
          statusCode: response.status
        }
        return { filename, content: response.body, status }
      })
    )
  }

  /**
   * Downloads all devices by category as a zip file.
   * @param category The category to download devices for.
   */
  downloadDeviceByCategory(category: string): void {
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    this.http.get(`${this.config.apiUrl}api/v1/device/downloadDevicesByCategory?category=${category}`, { headers, responseType: 'blob' }).subscribe(blob => {
      saveAs(blob, `device_${category}.zip`);
    });
  }

  /**
   * Uploads a device config file.
   * @param file The config file to upload.
   * @param isThunder Whether thunder is enabled.
   * @returns Observable with the upload result.
   */
  uploadConfigFile(file: File,isThunder:boolean): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    const formData: FormData = new FormData();
    formData.append('uploadFile', file, file.name);
    return this.http.post(`${this.config.apiUrl}api/v1/device/uploadDeviceConfigFile?isThunderEnabled=${isThunder}`, formData, { headers });
  }

  /**
   * Deletes a device config file by name and thunder flag.
   * @param deviceConfigFileName The name of the config file to delete.
   * @param isThunder Whether thunder is enabled.
   * @returns Observable with the deletion result as text.
   */
  deleteDeviceConfigFile(deviceConfigFileName: any ,isThunder:boolean) {
    const headers = new HttpHeaders({
      'Authorization': this.authService.getApiToken()
    });
    return this.http.delete(`${this.config.apiUrl}api/v1/device/deleteDeviceConfigFile?deviceConfigFileName=${deviceConfigFileName}&isThunderEnabled=${isThunder}`, { headers, responseType: 'text' });
  }

}
