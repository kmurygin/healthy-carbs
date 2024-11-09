import {Component, inject} from '@angular/core';
import {UserService} from "../../core/services/user.service";
import {AuthService} from "../../core/services/auth.service";
import {User} from "../../models/user.model";
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";

@Component({
  selector: 'app-userdetail',
  standalone: true,
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './user-detail.component.html',
  styleUrl: './user-detail.component.css'
})
export class UserDetailComponent {
  userService: UserService = inject(UserService);
  authService: AuthService = inject(AuthService);
  form: FormGroup;

  user: User | undefined;

  updatedUser: User = {
    id: 0,
    firstname: '',
    lastname: '',
    username: '',
    email: '',
    password: ''
  }

  constructor(private fb: FormBuilder) {
    const user = this.authService.getUserFromToken();
    if (user) {
      this.getUserDetails(user.username);
    }

    this.form = this.fb.group({
      firstname: new FormControl(this.user?.firstname || "", [Validators.required]),
      lastname: new FormControl(this.user?.lastname || "", [Validators.required]),
      email: new FormControl(this.user?.email || "", [Validators.required, Validators.email]),
    });
  }


  onSubmit() {
    console.log(this.form.valid);
    console.log(this.form.value);

    if (this.form.valid) {
      const submittedValues = {
        email: this.form.value.email || this.user?.email,
        firstname: this.form.value.firstname || this.user?.firstname,
        lastname: this.form.value.lastname || this.user?.lastname,
      };

      console.log(submittedValues);

      this.updatedUser.email = submittedValues.email;
      this.updatedUser.firstname = submittedValues.firstname;
      this.updatedUser.lastname = submittedValues.lastname;

      console.log("aaa");
      console.log(this.updatedUser);
      // @ts-ignore
      this.userService.updateUser(this.user.username, this.updatedUser).subscribe({
        next: (response) => {
          console.log(response);
        },
        error: (error) => {
          console.error(error);
        }
      });
    }
  }


  getUserDetails(username: any) {
    this.userService.getUserByUsername(username).subscribe({
      next: (response) => {
        console.log(response);
        this.user = response.data;
        console.log(this.user);
      },
      error: (error) => {console.error(error);}
    });
  }
}
