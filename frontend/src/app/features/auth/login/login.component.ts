import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {AuthService} from '../../../core/services/auth.service';

import {MatCardModule} from '@angular/material/card';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
  form: FormGroup;
  errorMessage = signal('');
  isSubmitting = signal(false);

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
      this.isSubmitting.set(true);
      this.authService.login(this.form.value).subscribe({
        next: (response: any) => {
          this.isSubmitting.set(false);
          this.router.navigate(['']);
          window.location.reload();
        },
        error: (error: any) => {
          this.isSubmitting.set(false);
          if (error !== null) {
            this.errorMessage.set(error.message || 'An error occurred. Please try again.');
          } else {
            this.errorMessage.set('An error occurred. Please try again.');
          }
        }
      });
    }
  }
}
