import {isPlatformBrowser} from '@angular/common';
import {
  effect,
  inject,
  Injectable,
  type Injector,
  PLATFORM_ID,
  runInInjectionContext,
  signal,
  type Signal,
  untracked,
  type WritableSignal
} from '@angular/core';

export type PreloadedImageState = Readonly<{
  displaySrc: Signal<string>;
  isLoading: Signal<boolean>;
}>;

@Injectable({providedIn: 'root'})
export class ImagePreloadService {
  private readonly platformId = inject(PLATFORM_ID);

  createPreloadedImage(
    desiredSrc: Signal<string>,
    options?: { fallback?: string; injector?: Injector },
  ): PreloadedImageState {
    const fallbackSrc = options?.fallback ?? 'assets/default-avatar.png';
    const displaySrcSignal = signal<string>(fallbackSrc);
    const isLoadingSignal = signal<boolean>(false);

    const initializeEffect = () => {
      effect((onCleanup) => {
        let isRequestStale = false;
        const requestedSrc = desiredSrc();
        const currentDisplaySrc = untracked(() => displaySrcSignal());

        if (!requestedSrc) {
          if (currentDisplaySrc !== fallbackSrc) {
            displaySrcSignal.set(fallbackSrc);
          }
          isLoadingSignal.set(false);
          return;
        }

        if (currentDisplaySrc === requestedSrc) {
          return;
        }

        if (!isPlatformBrowser(this.platformId)) {
          displaySrcSignal.set(requestedSrc);
          isLoadingSignal.set(false);
          return;
        }

        const image = this.startLoading(
          requestedSrc,
          displaySrcSignal,
          isLoadingSignal,
          () => isRequestStale,
        );
        onCleanup(() => {
          isRequestStale = true;
          this.cleanupImage(image);
        });
      });
    };

    if (options?.injector) {
      runInInjectionContext(options.injector, initializeEffect);
    } else {
      initializeEffect();
    }

    return {displaySrc: displaySrcSignal, isLoading: isLoadingSignal};
  }

  private startLoading(
    requestedSrc: string,
    displaySrcSignal: WritableSignal<string>,
    isLoadingSignal: WritableSignal<boolean>,
    isRequestStale: () => boolean,
  ): HTMLImageElement {
    isLoadingSignal.set(true);
    const image = new Image();
    image.onload = () => {
      if (isRequestStale()) return;
      displaySrcSignal.set(requestedSrc);
      isLoadingSignal.set(false);
    };
    image.onerror = () => {
      if (isRequestStale()) return;
      isLoadingSignal.set(false);
    };
    image.src = requestedSrc;
    return image;
  }

  private cleanupImage(image: HTMLImageElement): void {
    image.onload = null;
    image.onerror = null;
  }
}
