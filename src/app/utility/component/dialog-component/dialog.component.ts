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

import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MaterialModule } from '../../../material/material.module';
import { HttpClientModule } from '@angular/common/http';
import { DeviceService } from '../../../services/device.service';

@Component({
  selector: 'dialog-data',
  templateUrl: 'dialog.component.html',
  standalone: true,
  imports: [CommonModule,HttpClientModule,ReactiveFormsModule,MaterialModule],
  encapsulation: ViewEncapsulation.None
})

export class DialogDelete implements OnInit{

  uploadConfigForm!: FormGroup;
  configData:any;
  configFileName!:string;
  stbNameChange!: string;
  visibleDeviceconfigFile = false;
  newFileName!: string;

  /**
   * Constructor for DialogDelete component.
   * @param dialogRef Reference to the dialog opened.
   * @param data Data injected into the dialog (contains stbName, boxTypeName, stbname, etc).
   * @param service DeviceService for device operations.
   * @param fb FormBuilder for reactive forms.
   */
  constructor(
    public dialogRef: MatDialogRef<DialogDelete>,
    @Inject(MAT_DIALOG_DATA) public data: any ,private service:DeviceService,private fb:FormBuilder) {
      
    }

  /**
   * Angular lifecycle hook called on component initialization.
   * Initializes the form and loads config file visibility.
   */
  ngOnInit(): void {
    this.visibilityConfigFile();
    this.uploadConfigForm = this.fb.group({
      editorFilename:['',{disabled: true}],
      editorContent: [''],
    });
  }

  /**
   * Closes the dialog box without returning a value.
   */
  onCancelDelete(): void {
    this.dialogRef.close(false); 
  }

  /**
   * Loads and determines the visibility of the device config file section.
   * Calls the DeviceService to download the config file and sets visibility flags.
   */
  visibilityConfigFile(): void{
    let boxNameConfig = this.data.stbName;
    let boxTypeConfig = this.data.boxTypeName; 
    let isThunder = false;
    this.service.downloadDeviceConfigFile(boxNameConfig,boxTypeConfig, isThunder)
    .subscribe((res)=>{ 
      this.configFileName = res.filename;
      if(this.configFileName !== `${boxNameConfig}.config` && this.stbNameChange !== undefined && this.stbNameChange !== ""){
        this.visibleDeviceconfigFile = true;
      }else{
        this.visibleDeviceconfigFile = false;
      }
      if(this.configFileName === `${boxTypeConfig}.config`){
        this.visibleDeviceconfigFile = true;
      }
      if(this.configFileName !== `${boxNameConfig}.config` && this.configFileName !== `${boxTypeConfig}.config`){
        this.visibleDeviceconfigFile = false;
        this.newFileName =`${boxNameConfig}.config`;
      }
      this.readFileContent(res.content);
    })
  }

  /**
   * Reads the content of the config file and updates the form.
   * @param file The Blob file to read content from.
   */
  readFileContent(file: Blob): void{
    let boxNameConfig = this.data.stbname;
    const reader = new FileReader();
    reader.onload = ()=>{
      let htmlContent = reader.result
      this.configData = this.formatContent(htmlContent);
      if(this.configData){
          this.uploadConfigForm.patchValue({
            editorFilename: this.configFileName ===`${boxNameConfig}.config`?this.configFileName:this.newFileName,
            editorContent: this.configData
          })
      }
    }
    reader.readAsText(file)
  }

  /**
   * Formats the content by replacing '#' with line breaks for display.
   * @param content The content to format.
   * @returns The formatted content as a string.
   */
  formatContent(content: any){
    return content.replace(/#/g, '<br># ');
  }


}
