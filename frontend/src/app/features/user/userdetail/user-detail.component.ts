import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';
import { NgIf } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-userdetail',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatButtonModule
  ],
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.scss']
})
export class UserDetailComponent implements OnInit {
  form!: FormGroup;
  errorMessage: string = '';
  user?: User;

  userService = inject(UserService);
  authService = inject(AuthService);
  fb = inject(FormBuilder);

  ngOnInit(): void {
    this.form = this.fb.group({
      firstname: ['', Validators.required],
      lastname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });

    const tokenUser = this.authService.getUserFromToken();
    if (tokenUser?.username) {
      this.getUserDetails(tokenUser.username);
    }
  }

  getUserDetails(username: string): void {
    this.userService.getUserByUsername(username).subscribe({
      next: (response) => {
        this.user = response.data;
        if (this.user) {
          this.form.patchValue({
            firstname: this.user.firstname,
            lastname: this.user.lastname,
            email: this.user.email
          });
        }
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Failed to fetch user data';
      }
    });
  }

  onSubmit(): void {
    if (this.form.valid && this.user) {
      const updatedUser: User = {
        ...this.user,
        firstname: this.form.value.firstname,
        lastname: this.form.value.lastname,
        email: this.form.value.email
      };

      this.userService.updateUser(this.user.id, updatedUser).subscribe({
        next: (response) => {
          this.errorMessage = response.message || 'Updated successfully!';
        },
        error: (err) => {
          console.error(err);
          this.errorMessage = 'Update failed.';
        }
      });
    }
  }
}
