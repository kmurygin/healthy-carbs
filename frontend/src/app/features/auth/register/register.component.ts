import {Component, inject} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {AuthService} from '../../../core/services/auth.service';

import {MatCardModule} from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  form: FormGroup;
  errorMessage = '';
  isSubmitting = false;

  authService = inject(AuthService);
  router = inject(Router);

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      firstname: ['', Validators.required],
      lastname: ['', Validators.required],
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  get email() {
    return this.form.get('email');
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.isSubmitting = true;
      this.authService.register(this.form.value).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          if (response.token) {
            this.router.navigate(['login']);
          } else if (response.error) {
            this.errorMessage = response.error;
          }
        },
        error: () => {
          this.isSubmitting = false;
          this.errorMessage = 'Something went wrong. Please try again.';
        }
      });
    }
  }
}
