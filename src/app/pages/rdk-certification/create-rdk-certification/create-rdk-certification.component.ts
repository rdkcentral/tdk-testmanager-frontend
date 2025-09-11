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
import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { RdkService } from '../../../services/rdk-certification.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { MonacoEditorModule } from '@materia-ui/ngx-monaco-editor';

@Component({
  selector: 'app-create-rdk-certification',
  standalone: true,
  imports: [ReactiveFormsModule, MonacoEditorModule, CommonModule],
  templateUrl: './create-rdk-certification.component.html',
  styleUrl: './create-rdk-certification.component.css'
})
/**
 * Component responsible for creating RDK certifications.
 * 
 * This component provides a form for users to input the name of the certification
 * and the Python script content. It validates the form inputs and handles the
 * submission process, including creating a Python script file and sending it to
 * the server. It also provides navigation back to the list of RDK certifications.
 * 
 * @class
 */
export class CreateRdkCertificationComponent {

  certificationFormGroup!: FormGroup;
  editorOptions = { theme: 'vs-dark', language: 'python' };
  submitted = false;

  /**
   * Constructor for CreateRdkCertificationComponent.
   * @param fb FormBuilder instance for creating form groups.
   * @param service RdkService instance for server communication.
   * @param _snakebar MatSnackBar instance for showing messages.
   * @param router Router instance for navigation.
   */
  constructor(private fb: FormBuilder, private service: RdkService, private _snakebar: MatSnackBar, private router: Router) { }


  /**
   * Initializes the component and sets up the form group with validation.
   * Creates a form group with two controls: `fileName` and `pythonEditor`.
   * Both fields are required.
   * @returns void
   */
  ngOnInit(): void {
    this.certificationFormGroup = this.fb.group({
      fileName: ['', Validators.required],
      pythonEditor: ['', Validators.required]
    });
  }


  /**
   * Handles input event for the file name field.
   * Trims leading spaces from the input value.
   * @param event The input event from the file name field.
   * @returns void
   */
  onInputName(event: Event): void {
    const inputElement = event.target as HTMLTextAreaElement;
    const value = inputElement.value;
    if (value.startsWith(' ')) {
      this.certificationFormGroup.get('fileName')?.setValue(value.trimStart(), { emitEvent: false });
    }
  }


  /**
   * Handles the form submission for creating an RDK certification.
   * Sets the `submitted` flag to true, checks if the form is valid,
   * and if valid, creates a Python script file and sends it to the server.
   * Shows success or error messages and navigates as needed.
   * @returns void
   */
  onSubmit(): void {
    this.submitted = true;
    if (this.certificationFormGroup.invalid) {
      return;
    } else {
      const pythonContent = this.certificationFormGroup.value.pythonEditor;
      const filename = `${this.certificationFormGroup.value.fileName}.py`;
      const scriptFile = new File([pythonContent], filename, { type: 'text/x-python' });
      this.service.createScript(scriptFile).subscribe({
        next: (res) => {
          this._snakebar.open(res.message, '', {
            duration: 2000,
            panelClass: ['success-msg'],
            verticalPosition: 'top'
          });
          setTimeout(() => {
            this.router.navigate(["configure/list-rdk-certifications"]);
          }, 1000);
        },
        error: (err) => {
          let errmsg = err.message;
          this._snakebar.open(errmsg, '', {
            duration: 2000,
            panelClass: ['err-msg'],
            horizontalPosition: 'end',
            verticalPosition: 'top'
          });
        }
      });
    }

  }


  /**
   * Navigates the user back to the list of RDK certifications.
   * Uses the Angular Router to navigate to the "configure/list-rdk-certifications" route.
   * @returns void
   */
  goBack(): void {
    this.router.navigate(["configure/list-rdk-certifications"]);
  }

}
