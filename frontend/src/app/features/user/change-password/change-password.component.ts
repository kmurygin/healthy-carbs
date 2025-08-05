import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {UserService} from "../../../core/services/user.service";
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';

@Component({
  selector: 'app-change-password',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChangePasswordComponent {
  form: FormGroup;
  userService: UserService = inject(UserService);
  fb: FormBuilder = inject(FormBuilder);
  errorMessage = signal('');

  constructor() {
    this.form = this.fb.group({
      oldPassword: new FormControl("", [Validators.required]),
      newPassword: new FormControl("", [Validators.required])
    });
  }

  onSubmit() {
    if (this.form.valid) {
      console.log(this.form.value);
      this.userService.changePassword(this.form.value).subscribe({
        next: (response) => {
          // this.errorMessage = response.message;
          console.log(response);
          this.errorMessage.set(response.message || 'Password updated successfully.');
          this.form.reset();
        },
        error: (err) => {
          console.log(err);
          if (err === "Wrong old password") {
            this.errorMessage.set("Old password is incorrect");
          } else {
            this.errorMessage.set("An error occurred. Please try again.");
          }
        }

      })
    }
  }

}
