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
  readonly errorMessage = signal('');
  readonly infoMessage = signal('');

  private readonly user = signal<UserDto | undefined>(undefined);
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
            firstname: data.firstName,
            lastname: data.lastName,
            email: data.email
          });
        }
      },
      error: (err: unknown) => {
        console.error(err);
        this.errorMessage.set('Failed to fetch user data');
      }
    });
  }

  onSubmit(): void {
    const currentUser = this.user();

    if (this.form.invalid || !currentUser) {
      this.form.markAllAsTouched();
      return;
    }
    this.errorMessage.set('');
    this.infoMessage.set('');

    const updatedUser: UserDto = Object.assign(
      {},
      currentUser,
      this.form.getRawValue()
    );

    this.userService.updateUser(currentUser.id, updatedUser).subscribe({
      next: (res) => {
        this.infoMessage.set(res.message ?? 'Personal information updated successfully!');
      },
      error: (err: unknown) => {
        let msg = 'Failed to update user details. Please try again.';
        if (err instanceof Error) {
          msg = err.message;
        }
        this.errorMessage.set(msg);
      },
    });
  }
}
