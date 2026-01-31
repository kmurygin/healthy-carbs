import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  type ElementRef,
  inject,
  Injector,
  type OnInit,
  signal,
  viewChild
} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {finalize} from 'rxjs';
import {UserService} from '@core/services/user/user.service';
import {UserProfileImageService} from '@core/services/user/user-profile-image.service';
import {AuthService} from '@core/services/auth/auth.service';
import {NotificationService} from '@core/services/ui/notification.service';
import type {UserDto} from '@core/models/dto/user.dto';
import {setError, setErrorNotification} from "@shared/utils";
import {ErrorMessageComponent} from "@shared/components/error-message/error-message.component";
import {InfoMessageComponent} from "@shared/components/info-message/info-message.component";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {ImagePreloadService} from '@core/services/image/image-preload.service';

@Component({
  selector: 'app-user-detail',
  imports: [CommonModule, ReactiveFormsModule, ErrorMessageComponent, InfoMessageComponent, NgOptimizedImage],
  templateUrl: './user-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserDetailComponent implements OnInit {
  readonly errorMessage = signal<string>('');
  readonly infoMessage = signal<string>('');
  readonly isUploading = signal<boolean>(false);
  readonly user = signal<UserDto | null>(null);
  readonly fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');
  private readonly formBuilder = inject(FormBuilder);
  readonly formGroup = this.formBuilder.nonNullable.group({
    firstName: ['', [Validators.required, Validators.pattern(/^[a-zA-Z]+$/u)]],
    lastName: ['', [Validators.required, Validators.pattern(/^[a-zA-Z]+$/u)]],
    email: ['', [Validators.required, Validators.email]]
  });
  private readonly userService = inject(UserService);
  readonly profileImageSrc = computed(() =>
    this.userService.currentUserImageUrl() ?? 'assets/default-avatar.png'
  );
  private readonly userProfileImageService = inject(UserProfileImageService);
  private readonly imagePreloadService = inject(ImagePreloadService);
  private readonly injector = inject(Injector);
  private readonly imageState = this.imagePreloadService.createPreloadedImage(
    this.profileImageSrc,
    {injector: this.injector},
  );
  readonly displayImageSrc = this.imageState.displaySrc;
  readonly isImageLoading = this.imageState.isLoading;
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    const tokenUser = this.authService.user();

    if (tokenUser) {
      this.fetchUserDetails(tokenUser);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    const currentUser = this.user();

    if (!currentUser?.id) return;

    if (file.size > 5 * 1024 * 1024) {
      this.notificationService.error('Image size must be less than 5MB');
      this.resetFileInput();
      return;
    }

    this.isUploading.set(true);
    this.errorMessage.set('');

    this.userProfileImageService.uploadProfileImage(currentUser.id, file)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .pipe(finalize(() => {
        this.isUploading.set(false)
      }))
      .subscribe({
        next: () => {
          this.notificationService.success('Profile picture updated successfully.');
          this.refreshUserDetails(currentUser.username);
        },
        error: (error: unknown) => {
          setErrorNotification(this.notificationService, error, 'Failed to upload image.');
          this.resetFileInput();
        }
      });
  }

  onSubmit(): void {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }

    const currentUser = this.user();
    if (!currentUser) return;

    const updatedUser: UserDto = {
      ...currentUser,
      ...this.formGroup.getRawValue()
    };

    this.userService.updateUser(currentUser.id, updatedUser)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.notificationService.success(res.message ?? 'Updated successfully');
          this.user.set(updatedUser);
          this.errorMessage.set('');
        },
        error: (error: unknown) => {
          setErrorNotification(this.notificationService, error, 'Failed to update user data');
        }
      });
  }

  triggerFileInput(): void {
    this.fileInput()?.nativeElement.click();
  }

  private fetchUserDetails(username: string): void {
    this.userService.getCachedUserByUsername(username)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          if (!data) return;

          this.user.set(data);
          this.formGroup.patchValue(data);
        },
        error: (error: unknown) => {
          setError(this.errorMessage, error, 'Failed to fetch user data')
        }
      });
  }

  private refreshUserDetails(username: string): void {
    this.userService.refreshUserByUsername(username)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          if (!data) return;
          this.user.set(data);
          this.formGroup.patchValue(data);
        },
        error: (error: unknown) => {
          setError(this.errorMessage, error, 'Failed to refresh user data')
        }
      });
  }

  private resetFileInput(): void {
    const input = this.fileInput()?.nativeElement;
    if (input) input.value = '';
  }

}
