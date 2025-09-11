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
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RdkService } from '../../../services/rdk-certification.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { MonacoEditorModule } from '@materia-ui/ngx-monaco-editor';

@Component({
  selector: 'app-edit-rdk-certification',
  standalone: true,
  imports: [ReactiveFormsModule, MonacoEditorModule, CommonModule],
  templateUrl: './edit-rdk-certification.component.html',
  styleUrl: './edit-rdk-certification.component.css',
})
/**
 * Component for editing RDK certification.
 *
 * This component provides a form to edit the RDK certification details, including the file name and Python script content.
 * It initializes the form with the user's name and retrieves the file content to populate the Python editor.
 * The component also handles form submission to update the certification script and provides navigation back to the list of RDK certifications.
 *
 */
export class EditRdkCertificationComponent {

  certificationFormGroup!: FormGroup;
  editorOptions = { theme: 'vs-dark', language: 'python' };
  submitted = false;
  user: any;

  /**
   * Constructor for EditRdkCertificationComponent.
   * @param fb FormBuilder instance for creating form groups.
   * @param service RdkService instance for server communication.
   * @param _snakebar MatSnackBar instance for showing messages.
   * @param router Router instance for navigation.
   */
  constructor(
    private fb: FormBuilder,
    private service: RdkService,
    private _snakebar: MatSnackBar,
    private router: Router
  ) {
    this.user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!this.user) {
      this.router.navigate(['configure/list-rdk-certifications']);
    }
  }



  /**
   * Initializes the component and sets up the form group for certification.
   * - Creates a form group with `fileName` and `pythonEditor` fields.
   * - Retrieves the file content based on the `fileName` and sets the content to the `pythonEditor` field.
   * - Handles errors by displaying a snackbar with the error message.
   * @returns void
   */
  ngOnInit(): void {
    this.certificationFormGroup = this.fb.group({
      fileName: [{ value: this.user.name, disabled: true }],
      pythonEditor: ['', Validators.required],
    });
    const fileName = this.certificationFormGroup.get('fileName')?.value;
    const file = encodeURIComponent(fileName);
    this.service.getFileContent(file).subscribe({
      next: (res) => {
        const blob = new Blob([res.content], {
          type: res.content.type || 'text/plain',
        });
        blob.text().then((text) => {
          this.certificationFormGroup.get('pythonEditor')?.setValue(text);
        });
      },
      error: (err) => {
        let errmsg = err.error;
        this._snakebar.open(errmsg, '', {
          duration: 2000,
          panelClass: ['err-msg'],
          horizontalPosition: 'end',
          verticalPosition: 'top',
        });
      },
    });
  }



  /**
   * Handles the form submission for the RDK certification edit form.
   * Retrieves the Python script content from the form, creates a file object,
   * and sends it to the server using the `updateScript` service method.
   * Shows success or error messages and navigates as needed.
   * @returns void
   */
  onSubmit(): void {
    this.submitted = true;
    if (this.certificationFormGroup.invalid) {
      return;
    } else {
      const pythonContent = this.certificationFormGroup.value.pythonEditor;
      const fileName = this.certificationFormGroup.get('fileName')?.value;
      const scriptFileName = `${fileName}.py`;
      const scriptFile = new File([pythonContent], scriptFileName, {
        type: 'text/x-python',
      });
      this.service.updateScript(scriptFile).subscribe({
        next: (res) => {
          this._snakebar.open(res.message, '', {
            duration: 2000,
            panelClass: ['success-msg'],
            verticalPosition: 'top',
          });
          setTimeout(() => {
            this.router.navigate(['/configure/list-rdk-certifications']);
          }, 1000);
        },
        error: (err) => {
          this._snakebar.open(err.message, '', {
            duration: 2000,
            panelClass: ['err-msg'],
            horizontalPosition: 'end',
            verticalPosition: 'top',
          });
        },
      });
    }
  }


  /**
   * Navigates the user back to the list of RDK certifications.
   * Uses the Angular Router to navigate to the "configure/list-rdk-certifications" route.
   * @returns void
   */
  goBack(): void {
    this.router.navigate(['configure/list-rdk-certifications']);
  }

}
