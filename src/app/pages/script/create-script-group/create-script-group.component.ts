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
import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MaterialModule } from '../../../material/material.module';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { Router } from '@angular/router';
import { ScriptsService } from '../../../services/scripts.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../auth/auth.service';
import { LoaderComponent } from '../../../utility/component/loader/loader.component';

interface scriptType {
  id: string,
  name:string
}
@Component({
  selector: 'app-create-script-group',
  standalone: true,
  imports: [CommonModule,HttpClientModule,ReactiveFormsModule,MaterialModule,FormsModule,DragDropModule,LoaderComponent],
  templateUrl: './create-script-group.component.html',
  styleUrl: './create-script-group.component.css'
})
export class CreateScriptGroupComponent {
  // Drag-to-select support for right-side script list
  dragSelectingRight: boolean = false;
  dragStartIndexRight: number | null = null;
  dragEndIndexRight: number | null = null;

  /**
   * Handles mouse down event for right script list drag selection.
   * @param index The index of the script.
   * @param event The mouse event.
   */
  onRightScriptMouseDown(index: number, event: MouseEvent): void {
    if (event.button !== 0) return; // Only left mouse button
    this.dragSelectingRight = true;
    this.dragStartIndexRight = index;
    this.dragEndIndexRight = index;
    event.preventDefault();

  }

  /**
   * Handles mouse enter event for right script list drag selection.
   * @param index The index of the script.
   */
  onRightScriptMouseEnter(index: number): void {
    if (this.dragSelectingRight && this.dragStartIndexRight !== null) {
      this.dragEndIndexRight = index;
    }

  }

  /**
   * Handles mouse up event for right script list drag selection.
   */
  onRightScriptMouseUp(): void {
    if (this.dragSelectingRight && this.dragStartIndexRight !== null && this.dragEndIndexRight !== null) {
      const start = Math.min(this.dragStartIndexRight, this.dragEndIndexRight);
      const end = Math.max(this.dragStartIndexRight, this.dragEndIndexRight);
      const list = this.container2ScriptArr;
      for (let i = start; i <= end; i++) {
        const script = list[i];
        if (script) {
          if (this.selectedRight.has(script.id)) {
            this.selectedRight.delete(script.id);
          } else {
            this.selectedRight.add(script.id);
          }
        }
      }
    }
    this.dragSelectingRight = false;
    this.dragStartIndexRight = null;
    this.dragEndIndexRight = null;

  }
  // Handles both single and drag select on mouseup
  /**
   * Handles mouse up event for left script list, supporting both drag and single select.
   * @param index The index of the script.
   * @param script The script object.
   */
  handleMouseUp(index: number, script: any): void {
    if (this.dragSelecting) {
      this.onLeftScriptMouseUp();
    } else {
      // Toggle selection: select if not selected, unselect if selected
      if (this.selectedLeft.has(script.id)) {
        this.selectedLeft.delete(script.id);
      } else {
        this.selectedLeft.add(script.id);
      }
    }
    // Always reset drag state after mouseup
    this.dragSelecting = false;
    this.dragStartIndex = null;
    this.dragEndIndex = null;

  }
  // Combined single and drag select handler for left-side script list
  /**
   * Handles single select for left script list.
   * @param index The index of the script.
   * @param script The script object.
   */
  selectSingleScript(index: number, script: any): void {
    // Only select if not drag-selecting
    if (!this.dragSelecting) {
      if (this.selectedLeft.has(script.id)) {
        this.selectedLeft.delete(script.id);
      } else {
        this.selectedLeft.add(script.id);
      }
    }

  }
  // Single select handler for left-side script list
  /**
   * Handles single select on mouseup for left script list.
   * @param index The index of the script.
   * @param script The script object.
   */
  onSingleSelect(index: number, script: any): void {
    // Always allow single select on mouseup
    if (this.dragSelecting) {
      // If drag-selecting, do not toggle single
      return;
    }
    if (this.selectedLeft.has(script.id)) {
      this.selectedLeft.delete(script.id);
    } else {
      this.selectedLeft.add(script.id);
    }

  }

  testSuiteFormSubmitted = false;
  testSuiteFrom!:FormGroup;
  selectedItems: Set<string> = new Set();
  searchTerm: string = '';
  sortOrder: 'asc' | 'desc' = 'asc';
  sortOrderRight: 'asc' | 'desc' = 'asc';
  container1:any[]=[];
  container2ScriptArr: any[]  = [];
  scriptGrous: string[] = [];
  selectedCategory:any;
  testSuiteArr:any[] = [];
  loggedinUser: any;
  onlyVideoCategory!:string;
  onlyVideoCategoryName!:string;
  categoryName!:string;
  selectedLeft = new Set<string>();
  selectedRight = new Set<string>();
  filteredLeftList:any;
  isLoadingScripts: boolean = false;



  // Drag-to-select support for left-side script list
  dragSelecting: boolean = false;
  dragStartIndex: number | null = null;
  dragEndIndex: number | null = null;

  /**
   * Handles mouse down event for left script list drag selection.
   * @param index The index of the script.
   * @param event The mouse event.
   */
  onLeftScriptMouseDown(index: number, event: MouseEvent): void {
    if (event.button !== 0) return; // Only left mouse button
    this.dragSelecting = true;
    this.dragStartIndex = index;
    this.dragEndIndex = index;
    event.preventDefault();

  }

  /**
   * Handles mouse enter event for left script list drag selection.
   * @param index The index of the script.
   */
  onLeftScriptMouseEnter(index: number): void {
    if (this.dragSelecting && this.dragStartIndex !== null) {
      this.dragEndIndex = index;
    }

  }

  /**
   * Handles mouse up event for left script list drag selection.
   */
  onLeftScriptMouseUp(): void {
    if (this.dragSelecting && this.dragStartIndex !== null && this.dragEndIndex !== null) {
      const start = Math.min(this.dragStartIndex, this.dragEndIndex);
      const end = Math.max(this.dragStartIndex, this.dragEndIndex);
      const list = this.filteredContainer1;
      for (let i = start; i <= end; i++) {
        const script = list[i];
        if (script) {
          if (this.selectedLeft.has(script.id)) {
            this.selectedLeft.delete(script.id);
          } else {
            this.selectedLeft.add(script.id);
          }
        }
      }
    }
    this.dragSelecting = false;
    this.dragStartIndex = null;
    this.dragEndIndex = null;

  }

  /**
   * Constructor for CreateScriptGroupComponent.
   * @param authservice AuthService instance for authentication.
   * @param fb FormBuilder instance for reactive forms.
   * @param router Router instance for navigation.
   * @param scriptservice ScriptsService for script operations.
   * @param _snakebar MatSnackBar for notifications.
   */
  constructor(private authservice : AuthService,private fb: FormBuilder,private router: Router,private scriptservice:ScriptsService,
    private _snakebar: MatSnackBar ) {
    this.loggedinUser = JSON.parse(localStorage.getItem('loggedinUser')|| '{}');

  }
  /**
   * Initialize the component
   */ 
  ngOnInit(): void {
    this.onlyVideoCategory = this.authservice.videoCategoryOnly;
    localStorage.setItem('onlyVideoCategory',this.onlyVideoCategory);
    let category = localStorage.getItem('category') || '';
    this.selectedCategory = category;
    this.selectedCategory = this.onlyVideoCategory?this.onlyVideoCategory:this.selectedCategory;

    if(this.onlyVideoCategory){
      if(this.onlyVideoCategory === 'RDKV_RDKSERVICE'){
        this.onlyVideoCategoryName = 'Video-Thunder';
      }else if(this.onlyVideoCategory === 'RDKV'){
        this.onlyVideoCategoryName = 'Video';
      }
    }else{
      if(this.selectedCategory == 'RDKB'){
        this.categoryName = 'Broadband';
      }
       if(this.selectedCategory == 'RDKC'){
        this.categoryName = 'Camera';
      }
    }

    this.testSuiteFrom = this.fb.group({
      search: [''],
      testSuiteName: ['', Validators.required],
      description:['', Validators.required],
      container2Scripts: [[], this.container2Validator()]
    });
    this.allScripts();
  }
  /**
   * Method to get all scripts of leftside container
   */ 
  allScripts() {
    this.isLoadingScripts = true;
    this.scriptservice.findTestSuitebyCategory(this.selectedCategory).subscribe({
      next: (res) => {
        this.container1 = res.data;
        this.isLoadingScripts = false;
      },
      error: () => {
        this.isLoadingScripts = false;
      }
    });
  }
  
  toggleSec(scripts:any, side: 'left' | 'right'){
    if(side === 'left'){
      this.selectedLeft.has(scripts.id)?this.selectedLeft.delete(scripts.id):this.selectedLeft.add(scripts.id);
    }else{
      this.selectedRight.has(scripts.id)?this.selectedRight.delete(scripts.id):this.selectedRight.add(scripts.id);
    }
  }
  moveToRight(){
    
    this.container2ScriptArr.push(...this.container1.filter(scripts => this.selectedLeft.has(scripts.id)));
    this.container1 = this.container1.filter(scripts => !this.selectedLeft.has(scripts.id));
    this.selectedLeft.clear();
    this.testSuiteFrom.get('container2Scripts')?.setValue(this.container2ScriptArr);
    this.testSuiteFrom.get('container2Scripts')?.markAsTouched();
    this.testSuiteFrom.get('container2Scripts')?.updateValueAndValidity();
  }
  moveToLeft(){
    this.container1.push(...this.container2ScriptArr.filter(scripts => this.selectedRight.has(scripts.id)));
    this.container2ScriptArr = this.container2ScriptArr.filter(scripts => !this.selectedRight.has(scripts.id));
    this.selectedRight.clear();
  }
  moveToUp(){
    const selectedIds = Array.from(this.selectedRight);
    for (let i = 1; i < this.container2ScriptArr.length; i++) {
      if(selectedIds.includes(this.container2ScriptArr[i].id)){
        [this.container2ScriptArr[i], this.container2ScriptArr[i-1]] =  [this.container2ScriptArr[i - 1], this.container2ScriptArr[i]]
      }
      
    }
  }
  moveToDown(){
    const selectedIds = Array.from(this.selectedRight);
    for (let i = this.container2ScriptArr.length -2; i >= 0; i--) {
      if(selectedIds.includes(this.container2ScriptArr[i].id)){
        [this.container2ScriptArr[i], this.container2ScriptArr[i+1]] =  [this.container2ScriptArr[i + 1], this.container2ScriptArr[i]]
      }
      
    }
  }

  get filteredContainer1(): any[]{
    const searchTerm = this.testSuiteFrom.get('search')?.value || ''; 
    this.filteredLeftList = this.container1;
    if (searchTerm) {
       this.filteredLeftList = this.container1.filter((item:any) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    // Sort the filtered list based on the current sort order    
    return this.filteredLeftList.sort((a:any, b:any) => {
      if (this.sortOrder === 'asc') {
        return a.name.localeCompare(b.name);
      } else {
        return b.name.localeCompare(a.name);
      }
    });
  }
  /**
   * Method to toggle scorting asc/desc
   */   
  toggleSortOrder() :void{
    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    this.filteredLeftList.sort((a: any, b: any)=>{
      if (this.sortOrder === 'asc') {
        return a.name.localeCompare(b.name);
      } else {
        return b.name.localeCompare(a.name);
      }
    })
    // this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
  }

  /**
   * Validation for rightside container
   */ 
  container2Validator() {
    return (control: AbstractControl): ValidationErrors | null => {
      return this.container2ScriptArr.length > 0 ? null : { container2Empty: true };
    };
  }
  /**
   * Method to toggle sorting asc/desc for right side container
   */
  toggleSortRightSide(): void {
    this.sortOrderRight = this.sortOrderRight === 'asc' ? 'desc' : 'asc';
    this.container2ScriptArr.sort((a: any, b: any) => {
      if (this.sortOrderRight === 'asc') {
        return a.name.localeCompare(b.name);
      } else {
        return b.name.localeCompare(a.name);
      }
    });
  }
  /**
   * Navigates back to the list of scripts.
   */  
  goBack():void{
    this.router.navigate(['/script']);
    localStorage.removeItem('categoryname');
  }
  /**
   * Resets the form and both containers.
   */  
  reset(): void {
    this.testSuiteFrom.reset();
    // Move all scripts back to left container
    this.container1 = [...this.container1, ...this.container2ScriptArr];
    this.container2ScriptArr = [];
    this.selectedLeft.clear();
    this.selectedRight.clear();
    this.testSuiteFrom.get('container2Scripts')?.setValue([]);
    this.testSuiteFrom.get('container2Scripts')?.markAsTouched();
    this.testSuiteFrom.get('container2Scripts')?.updateValueAndValidity();
  }
  /**
   * Method to create a testsuite
   */  
  testSuiteSubmit():void{
    this.testSuiteFormSubmitted = true;
    if (this.testSuiteFrom.invalid) {
      // Show a popup/snackbar for missing required fields
      let msg = '';
      if (this.testSuiteFrom.controls['testSuiteName'].errors?.['required']) {
        msg = 'Please provide name.';
      } else if (this.testSuiteFrom.controls['description'].errors?.['required']) {
        msg = 'Please provide description.';
      } else if (this.testSuiteFrom.controls['container2Scripts'].errors?.['container2Empty']) {
        msg = 'Add at least one script.';
      } else {
        msg = 'Please fill all required fields.';
      }
      this._snakebar.open(msg, '', {
        duration: 2000,
        panelClass: ['err-msg'],
        horizontalPosition: 'end',
        verticalPosition: 'top'
      });
      return;
    } else {
      let obj = {
        name:this.testSuiteFrom.value.testSuiteName,
        description: this.testSuiteFrom.value.description,
        category: this.onlyVideoCategory?this.onlyVideoCategory:this.selectedCategory,
        userGroup: this.loggedinUser.userGroupName,
        scripts:this.testSuiteFrom.value.container2Scripts
      }
      this.scriptservice.cretaeTestSuite(obj).subscribe({
        next: (res) => {
          this._snakebar.open(res.message, '', {
            duration: 2000,
            panelClass: ['success-msg'],
            verticalPosition: 'top'
          })
          setTimeout(() => {
            localStorage.getItem('viewName');
            this.router.navigate(["/script"]);
          }, 1000);
        },
        error: (err) => {
            this._snakebar.open(err.message, '', {
            duration: 2000,
            panelClass: ['err-msg'],
            horizontalPosition: 'end',
            verticalPosition: 'top'
          })
        }
      })
    }
  }
 
}
