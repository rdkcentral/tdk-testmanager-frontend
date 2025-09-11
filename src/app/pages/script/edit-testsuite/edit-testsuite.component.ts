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
import { Component, Input } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MaterialModule } from '../../../material/material.module';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ActivatedRoute, Router } from '@angular/router';
import { ScriptsService } from '../../../services/scripts.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../auth/auth.service';
import { LoaderComponent } from '../../../utility/component/loader/loader.component';


@Component({
  selector: 'app-edit-testsuite',
  standalone: true,
  imports: [CommonModule,HttpClientModule,ReactiveFormsModule,MaterialModule,FormsModule,DragDropModule,LoaderComponent],
  templateUrl: './edit-testsuite.component.html',
  styleUrl: './edit-testsuite.component.css'
})
export class EditTestsuiteComponent {
  testSuiteFormSubmitted = false;
  testSuiteEditFrom!:FormGroup;
  selectedItems: Set<string> = new Set();
  searchTerm: string = '';
  sortOrder: 'asc' | 'desc' = 'asc';
  sortOrderRight: 'asc' | 'desc' = 'asc';
  container1:any[]=[];
  container2ScriptArr: any[]  = [];
  scriptGrous: string[] = [];
  selectedCategory:any;
  userCategory:any;
  preferedCategory:any;
  testSuiteArr:any[] = [];
  loggedinUser: any;
  testSuiteEidtData:any;
  viewName!:string;
  isLoadingScripts: boolean = false;
  onlyVideoCategory!:string;
  onlyVideoCategoryName!:string;
  categoryName!:string;
  selectedLeft = new Set<number>();
  selectedRight = new Set<number>();
  filteredLeftList:any;

  /**
   * Constructor for EditTestsuiteComponent.
   * @param fb FormBuilder instance for creating form groups.
   * @param router Router instance for navigation.
   * @param scriptservice ScriptsService instance for script operations.
   * @param _snakebar MatSnackBar instance for showing messages.
   * @param route ActivatedRoute instance for route information.
   * @param authservice AuthService instance for authentication.
   */
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private scriptservice: ScriptsService,
    private _snakebar: MatSnackBar,
    private route: ActivatedRoute,
    private authservice: AuthService
  ) {
    this.loggedinUser = JSON.parse(localStorage.getItem('loggedinUser') || '{}');
    const dataString = this.router.getCurrentNavigation();
    this.testSuiteEidtData = dataString?.extras.state?.['testSuiteData'];
    this.viewName = localStorage.getItem('viewName') || '';
    this.loggedinUser = JSON.parse(localStorage.getItem('loggedinUser') || '{}');
    this.userCategory = this.loggedinUser.userCategory;
    this.preferedCategory = localStorage.getItem('preferedCategory') || '';
  }


  /**
   * Initializes the component, sets up form, loads scripts, and sets category names.
   * @returns void
   */
  ngOnInit(): void {

    this.onlyVideoCategory = localStorage.getItem('onlyVideoCategory')||'';
    this.selectedCategory = this.preferedCategory?this.preferedCategory:this.userCategory;
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

    if(this.testSuiteEidtData){
      this.container2ScriptArr = this.testSuiteEidtData.scripts?this.testSuiteEidtData.scripts:[];
    }
    this.testSuiteEditFrom = this.fb.group({
      search: [''],
      testSuiteName: [this.testSuiteEidtData?this.testSuiteEidtData.name:'', Validators.required],
      description:[this.testSuiteEidtData?this.testSuiteEidtData.description:'', Validators.required],
      container2Scripts: [[], this.container2Validator()]
    });
    this.allScripts();
  }

  /**
   * Loads all scripts for the selected category and filters out already selected scripts.
   * @returns void
   */
  allScripts() {

    this.isLoadingScripts = true;
    this.scriptservice.findTestSuitebyCategory(this.testSuiteEidtData.category).subscribe(res => {
      this.container1 = res.data
      const idsToRemove = new Set(this.container2ScriptArr.map((obj) => obj.id));
      this.container1 = this.container1.filter((obj) => !idsToRemove.has(obj.id));
      this.isLoadingScripts = false;
    }, error => {
      this.isLoadingScripts = false;
    });
  }


  /**
   * Toggles selection of a script in the left or right list.
   * @param scripts The script object to toggle.
   * @param side The side ('left' or 'right') where the script is being toggled.
   * @returns void
   */
  toggleSec(scripts: any, side: 'left' | 'right') {

    if(side === 'left'){
      this.selectedLeft.has(scripts.id)?this.selectedLeft.delete(scripts.id):this.selectedLeft.add(scripts.id);
    }else{
      this.selectedRight.has(scripts.id)?this.selectedRight.delete(scripts.id):this.selectedRight.add(scripts.id);
    }
  }
  /**
   * Moves selected scripts from the left list to the right list.
   * @returns void
   */
  moveToRight() {

    
    this.container2ScriptArr.push(...this.container1.filter(scripts => this.selectedLeft.has(scripts.id)));
    this.container1 = this.container1.filter(scripts => !this.selectedLeft.has(scripts.id));
    this.selectedLeft.clear();
    this.testSuiteEditFrom.get('container2Scripts')?.setValue(this.container2ScriptArr);
    this.testSuiteEditFrom.get('container2Scripts')?.markAsTouched();
    this.testSuiteEditFrom.get('container2Scripts')?.updateValueAndValidity();
  }
  /**
   * Moves selected scripts from the right list to the left list.
   * @returns void
   */
  moveToLeft() {

    this.container1.push(...this.container2ScriptArr.filter(scripts => this.selectedRight.has(scripts.id)));
    this.container2ScriptArr = this.container2ScriptArr.filter(scripts => !this.selectedRight.has(scripts.id));
    this.selectedRight.clear();
  }
  /**
   * Moves selected scripts up in the right list.
   * @returns void
   */
  moveToUp() {

    const selectedIds = Array.from(this.selectedRight);
    for (let i = 1; i < this.container2ScriptArr.length; i++) {
      if(selectedIds.includes(this.container2ScriptArr[i].id)){
        [this.container2ScriptArr[i], this.container2ScriptArr[i-1]] =  [this.container2ScriptArr[i - 1], this.container2ScriptArr[i]]
      }
      
    }
  }
  /**
   * Moves selected scripts down in the right list.
   * @returns void
   */
  moveToDown() {

    const selectedIds = Array.from(this.selectedRight);
    for (let i = this.container2ScriptArr.length -2; i >= 0; i--) {
      if(selectedIds.includes(this.container2ScriptArr[i].id)){
        [this.container2ScriptArr[i], this.container2ScriptArr[i+1]] =  [this.container2ScriptArr[i + 1], this.container2ScriptArr[i]]
      }
      
    }
  }
  /**
   * Getter for filtered left list of scripts based on search term.
   * @returns Filtered array of scripts.
   */
  get filteredContainer1(): any[] {

    const searchTerm = this.testSuiteEditFrom.get('search')?.value || ''; 
    this.filteredLeftList = this.container1;
    if (searchTerm) {
       this.filteredLeftList = this.container1.filter((item:any) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
      return this.filteredLeftList;
  }

  /**
   * Toggles the sort order for the left list and sorts the scripts.
   * @returns void
   */
  toggleSortOrder(): void {

    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    this.filteredLeftList.sort((a: any, b: any) => {
      if (this.sortOrder === 'asc') {
        return a.name.localeCompare(b.name);
      } else {
        return b.name.localeCompare(a.name);
      }
    })
  }
  
  /**
   * Getter for sorted right list of scripts.
   * @returns Sorted array of scripts.
   */
  get container2(): any[] {

    let filteredList2 = this.container2ScriptArr;
    this.testSuiteArr = filteredList2;
    return filteredList2.sort((a, b) => {
      if (this.sortOrderRight === 'asc') {
        return a.name.localeCompare(b.name);
      } else {
        return b.name.localeCompare(a.name);
      }
    });
  }

  /**
   * Validator to ensure at least one script is present in the right list.
   * @returns ValidationErrors | null
   */
  container2Validator() {

    return (control: AbstractControl): ValidationErrors | null => {
      return this.container2ScriptArr.length > 0 ? null : { container2Empty: true };
    };
  }

  /**
   * Toggles the sort order for the right list and sorts the scripts.
   * @returns void
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
   * Navigates back to the script page.
   * @returns void
   */
  goBack(): void {

    this.router.navigate(['/script']);
  }
  /**
   * Resets the test suite edit form.
   * @returns void
   */
  reset(): void {

    this.testSuiteEditFrom.reset();
  }
  /**
   * Handles submission for updating a test suite, gathers form data and sends to the server.
   * @returns void
   */
  testSuiteEditSubmit(): void {

    this.testSuiteFormSubmitted = true;
    if(this.testSuiteEditFrom.invalid){
      return ;
    }else{
      let obj = {
        id:this.testSuiteEidtData.id,
        name:this.testSuiteEditFrom.value.testSuiteName,
        description: this.testSuiteEditFrom.value.description,
        category: this.selectedCategory,
        userGroup: this.loggedinUser.userGroupName,
        scripts:this.container2ScriptArr?this.container2ScriptArr:this.testSuiteEditFrom.value.container2Scripts
      }
      this.scriptservice.updateTestSuite(obj).subscribe({
        next: (res) => {
          this._snakebar.open(res.message, '', {
            duration: 2000,
            panelClass: ['success-msg'],
            verticalPosition: 'top'
          })
          setTimeout(() => {
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
