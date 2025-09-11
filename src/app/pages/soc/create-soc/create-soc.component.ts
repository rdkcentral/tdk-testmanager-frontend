import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../auth/auth.service';
import { SocService } from '../../../services/soc.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonFormComponent } from '../../../utility/component/common-form/common-form.component';

@Component({
  selector: 'app-create-soc',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, CommonFormComponent],
  templateUrl: './create-soc.component.html',
  styleUrl: './create-soc.component.css'
})
export class CreateSocComponent {

  socVendorName: string | undefined;
  commonFormName = 'Create';
  loggedinUser: any={};
  errormessage!: string;
  validationName = 'SoC';
  placeholderName = 'SoC Name';
  labelName = 'Name';
  configureName!:string;
  categoryName!:string;

  /**
   * Constructor for CreateSocComponent.
   * @param router Angular Router for navigation
   * @param route ActivatedRoute for accessing route parameters
   * @param service SocService for SoC operations
   * @param _snakebar MatSnackBar for notifications
   * @param authservice AuthService for authentication and user info
   */
  constructor(private router: Router, private route: ActivatedRoute, public service: SocService,
    private _snakebar: MatSnackBar, private authservice: AuthService) {
    this.loggedinUser = JSON.parse(localStorage.getItem('loggedinUser') || '{}');
  }


  /**
   * Handles the form submission event.
   * @param name - The SOC name.
   */
  /**
   * Handles the form submission event.
   * @param name The SOC name to be created.
   */
  onFormSubmitted(name: string): void {
    let obj = {
      "socName": name,
      "socCategory": this.authservice.selectedConfigVal,
      "socUserGroup": this.loggedinUser.userGroupName
    }
    if(name !== undefined && name !== null){
      this.service.createSoc(obj).subscribe({
        next: (res) => {
          this._snakebar.open(res.message, '', {
            duration: 2000,
            panelClass: ['success-msg'],
            verticalPosition: 'top'
          })
          setTimeout(() => {
            this.router.navigate(["configure/list-soc"]);
          }, 1000);
        },
        error: (err) => {
          this._snakebar.open(err.message, '', {
            duration: 3000,
            panelClass: ['err-msg'],
            horizontalPosition: 'end',
            verticalPosition: 'top'
          })
        }
      })
    }
  }


  /**
   * Initializes the component and sets up category and form name.
   */
  ngOnInit(): void {
    this.configureName = this.authservice.selectedConfigVal;
    if(this.configureName === 'RDKB'){
      this.categoryName = 'Broadband';
      this.commonFormName = this.route.snapshot.url[1].path === 'create-soc' ? this.commonFormName + ' ' + `${this.categoryName}` + ' ' + 'SoC' : this.commonFormName;
    }else{
      this.categoryName = 'Video';
      this.commonFormName = this.route.snapshot.url[1].path === 'create-soc' ? this.commonFormName + ' ' + `${this.categoryName}` + ' ' + 'SoC' : this.commonFormName;
    }
  }


}
