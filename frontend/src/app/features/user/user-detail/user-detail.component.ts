import type {OnInit} from '@angular/core';
import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import type {FormControl, FormGroup} from '@angular/forms';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {UserService} from '../../../core/services/user/user.service';
import {AuthService} from '../../../core/services/auth/auth.service';
import type {UserDto} from '../../../core/models/dto/user.dto';

type UserDetailForm = FormGroup<{
  firstname: FormControl<string>;
  lastname: FormControl<string>;
  email: FormControl<string>;
}>;

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './user-detail.component.html',
  styleUrl: './user-detail.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserDetailComponent implements OnInit {
  errorMessage = signal('');
  infoMessage = signal('');

  user = signal<UserDto | undefined>(undefined);
  private readonly formBuilder = inject(FormBuilder);
  form: UserDetailForm = this.formBuilder.nonNullable.group({
    firstname: ['', [Validators.required, Validators.pattern(/^[a-zA-Z]+$/u)]],
    lastname: ['', [Validators.required, Validators.pattern(/^[a-zA-Z]+$/u)]],
    email: ['', [Validators.required, Validators.email]]
  });
  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);

  get formControl() {
    return this.form.controls;
  }

  ngOnInit(): void {
    const tokenUser = this.authService.user();
    if (tokenUser) {
      this.getUserDetails(tokenUser);
    }
  }

  getUserDetails(username: string): void {
    this.userService.getUserByUsername(username).subscribe({
      next: ({data}) => {
        this.user.set(data);
        if (data) {
          this.form.patchValue({
            firstname: data.firstname,
            lastname: data.lastname,
            email: data.email
          });
        }
      },
      error: (err) => {
        console.error(err);
        this.errorMessage.set('Failed to fetch user data');
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid || !this.user()) {
      this.form.markAllAsTouched();
      return;
    }
    this.errorMessage.set('');
    this.infoMessage.set('');

    const updatedUser: UserDto = {
      ...this.user()!,
      ...this.form.getRawValue()
    };

    this.userService.updateUser(this.user()!.id, updatedUser).subscribe({
      next: (res) => {
        this.infoMessage.set(res?.message ?? 'Personal information updated successfully!');
      },
      error: (err) => {
        const msg: string = err?.error?.message ?? err?.message ?? '';
        this.errorMessage.set(msg ?? 'Failed to update user details. Please try again.');
      }
    });
  }
}
