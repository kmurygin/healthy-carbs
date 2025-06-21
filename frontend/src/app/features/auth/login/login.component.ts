import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NgIf } from '@angular/common';

// Angular Material modules
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  form: FormGroup;
  errorMessage: string = '';
  isSubmitting = false;

  authService = inject(AuthService);
  router = inject(Router);

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.form.valid) {
      this.isSubmitting = true;
      this.authService.login(this.form.value).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          this.router.navigate(['']);
          window.location.reload();
        },
        error: (error) => {
          this.isSubmitting = false;
          if (error === 'Access denied') {
            this.errorMessage = 'Wrong username/password';
          } else {
            this.errorMessage = 'An error occurred. Please try again.';
          }
        }
      });
    }
  }
}
