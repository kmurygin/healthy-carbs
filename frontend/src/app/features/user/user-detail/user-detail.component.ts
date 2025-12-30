import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  type ElementRef,
  inject,
  type OnDestroy,
  type OnInit,
  PLATFORM_ID,
  signal,
  viewChild
} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {CommonModule, isPlatformBrowser} from '@angular/common';
import {finalize} from 'rxjs';
import {UserService} from '@core/services/user/user.service';
import {AuthService} from '@core/services/auth/auth.service';
import {NotificationService} from '@core/services/ui/notification.service';
import type {UserDto} from '@core/models/dto/user.dto';
import {setError, setErrorNotification} from "@shared/utils";
import {ErrorMessageComponent} from "@shared/components/error-message/error-message.component";
import {InfoMessageComponent} from "@shared/components/info-message/info-message.component";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";

@Component({
  selector: 'app-user-detail',
  imports: [CommonModule, ReactiveFormsModule, ErrorMessageComponent, InfoMessageComponent],
  templateUrl: './user-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserDetailComponent implements OnInit, OnDestroy {
  readonly errorMessage = signal<string>('');
  readonly infoMessage = signal<string>('');
  readonly isUploading = signal<boolean>(false);
  readonly user = signal<UserDto | null>(null);
  readonly profileImageSrc = signal<string>('assets/default-avatar.png');
  readonly fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');
  private readonly formBuilder = inject(FormBuilder);
  readonly formGroup = this.formBuilder.nonNullable.group({
    firstName: ['', [Validators.required, Validators.pattern(/^[a-zA-Z]+$/u)]],
    lastName: ['', [Validators.required, Validators.pattern(/^[a-zA-Z]+$/u)]],
    email: ['', [Validators.required, Validators.email]]
  });
  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);
  private readonly platformId = inject(PLATFORM_ID);
  private currentObjectUrl: string | null = null;
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    const tokenUser = this.authService.user();

    if (tokenUser) {
      this.fetchUserDetails(tokenUser);
    }
  }

  ngOnDestroy(): void {
    this.revokeCurrentObjectUrl();
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

    this.userService.uploadProfileImage(currentUser.id, file)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .pipe(finalize(() => {
        this.isUploading.set(false)
      }))
      .subscribe({
        next: () => {
          this.notificationService.success('Profile picture updated successfully.');
          this.fetchUserDetails(currentUser.username);
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
    this.userService.getUserByUsername(username)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: (response) => {
        const data = response.data;
        if (!data) return;

        this.user.set(data);
        this.formGroup.patchValue(data);

        if (data.profileImageId) {
          this.loadSecureImage(data.profileImageId, data);
        } else {
          this.setFallbackImage(data);
        }
      },
      error: (error: unknown) => {
        setError(this.errorMessage, error, 'Failed to fetch user data')
      }
    });
  }

  private loadSecureImage(imageId: number, user: UserDto): void {
    this.userService.getProfileImage(imageId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: (blob) => {
        this.revokeCurrentObjectUrl();
        this.currentObjectUrl = URL.createObjectURL(blob);

        this.profileImageSrc.set(this.currentObjectUrl);
      },
      error: (error: unknown) => {
        console.error('Failed to load secure image', error);
        this.setFallbackImage(user);
      }
    });
  }

  private setFallbackImage(user: UserDto): void {
    this.revokeCurrentObjectUrl();
    const name = encodeURIComponent(`${user.firstName}+${user.lastName}`);
    this.profileImageSrc.set(`https://ui-avatars.com/api/?name=${name}`);
  }

  private revokeCurrentObjectUrl(): void {
    if (this.currentObjectUrl && isPlatformBrowser(this.platformId)) {
      URL.revokeObjectURL(this.currentObjectUrl);
      this.currentObjectUrl = null;
    }
  }

  private resetFileInput(): void {
    const input = this.fileInput()?.nativeElement;
    if (input) input.value = '';
  }

}
