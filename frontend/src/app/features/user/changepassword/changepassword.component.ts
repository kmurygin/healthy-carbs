import {Component, inject} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {UserService} from "../../../core/services/user.service";
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';

@Component({
    selector: 'app-changepassword',
    imports: [
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule
    ],
    templateUrl: './changepassword.component.html',
    styleUrl: './changepassword.component.scss'
})
export class ChangepasswordComponent {
  form: FormGroup;
  userService: UserService = inject(UserService);
  fb: FormBuilder = inject(FormBuilder);
  errorMessage: string | undefined = "";
  constructor() {
    this.form = this.fb.group({
      oldPassword: new FormControl("", [Validators.required]),
      newPassword: new FormControl("", [Validators.required])
    });
  }

  onSubmit(){
    if (this.form.valid) {
      console.log(this.form.value);
      this.userService.changePassword(this.form.value).subscribe({
        next: (response) => {
          // this.errorMessage = response.message;
          console.log(response);
          this.errorMessage = response.message;
          this.form.reset();
      },
        error: (err) => {
          console.log(err);
          if (err === "Wrong old password") {
            this.errorMessage = "Old password is incorrect";
          } else {
            this.errorMessage = "An error occurred. Please try again.";
          }
        }

      })
    }
  }

}
