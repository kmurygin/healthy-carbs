import type {WritableSignal} from "@angular/core";
import type {NotificationService} from "@core/services/ui/notification.service";

export function formatEnum(value: string | null | undefined): string {
  if (!value) return '—';
  const withSpaces = value
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .trim()
    .toLowerCase();

  return withSpaces.replace(/\b\w/g, (c) => c.toUpperCase());
}

const baseClasses = 'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium';

type Size = 'sm' | 'xs';

const sizeClasses: Record<Size, string> = {
  'sm': 'px-3 py-1 text-sm font-medium',
  'xs': 'px-2.5 py-0.5 text-xs font-medium',
}

export function getDietTagClasses(
  dietType: string | undefined,
  size: Size = 'sm',
): string {

  const sizeCategory = sizeClasses[size];
  const upper = dietType?.toUpperCase();
  switch (upper) {
    case 'VEGETARIAN':
    case 'VEGAN':
      return `${baseClasses} ${sizeCategory} bg-emerald-100 text-emerald-800`;
    default:
      return `${baseClasses} ${sizeCategory} bg-orange-100 text-orange-800`;
  }
}

export function getDietTagIconClasses(dietType: string | undefined) {
  const upper = dietType?.toUpperCase();
  switch (upper) {
    case 'VEGETARIAN':
    case 'VEGAN':
      return 'fa-solid fa-leaf';
    default:
      return 'fa-solid fa-drumstick-bite';
  }
}

export function getMealTagClasses(size: Size = 'sm'): string {
  const sizeCategory = sizeClasses[size];
  return `${sizeCategory} inline-flex items-center gap-1.5 rounded-full
  bg-blue-100 px-3 py-1 text-blue-800`;
}

export function setError(signal: WritableSignal<string | null>, err: unknown, fallback: string): void {
  const message = err instanceof Error && err.message.trim()
    ? err.message
    : fallback;
  signal.set(message);
  console.error(fallback, err);
}

export function parseInstructionSteps(instructions: string | undefined | null): string[] {
  const trimmed = instructions?.trim() ?? '';
  if (!trimmed) return [];
  return trimmed
    .split(/\r?\n+|\s+(?=\d+\.\s)/)
    .map(line => line.trim().replace(/^\d+\.\s*/, ''))
    .filter(line => line.length > 0);
}

export function setErrorNotification(service: NotificationService, err: unknown, fallback: string): void {
  const message = err instanceof Error && err.message.trim()
    ? err.message
    : fallback;
  service.error(message);
  console.error(fallback, err);
}

