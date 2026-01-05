import {MealType} from "@core/models/enum/meal-type.enum";
import type {RecipeDto} from "@core/models/dto/recipe.dto";

export type ProfileChip = Readonly<{
  iconClass: string;
  label: string;
  value: string;
}>;

export const DAY_NAMES: Record<number, string> = {
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
  0: 'Sunday',
};

export interface DayMacros {
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
}

export type DaySlots = Record<MealType, RecipeDto[]>;

export interface CreatorDay {
  date: Date;
  dayName: string;
  slots: DaySlots;
  macros: DayMacros;
}

export function startOfWeekMonday(inputDate: Date): Date {
  const normalizedDate = new Date(inputDate);
  const weekdayIndex = normalizedDate.getDay();
  const daysBackToMonday = (weekdayIndex + 6) % 7;

  normalizedDate.setDate(normalizedDate.getDate() - daysBackToMonday);
  normalizedDate.setHours(0, 0, 0, 0);

  return normalizedDate;
}

export function emptyMacros(): DayMacros {
  return {calories: 0, carbs: 0, protein: 0, fat: 0};
}

export function normalizeNumber(value: number | null | undefined): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

export function formatEnum(value: string | null | undefined): string {
  if (!value) return '—';
  const withSpaces = value
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .trim()
    .toLowerCase();

  return withSpaces.replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatNumber(value: number | null | undefined, unit: string): string {
  const safeValue = normalizeNumber(value);
  return safeValue > 0 ? `${safeValue.toFixed(0)} ${unit}` : '—';
}

export function genderInfo(gender: string): { label: string; iconClass: string } {
  switch (gender) {
    case "MALE":
      return {label: 'Male', iconClass: 'fa-solid fa-mars'};
    case "FEMALE":
      return {label: 'Female', iconClass: 'fa-solid fa-venus'};
    case "OTHER":
      return {label: 'Other', iconClass: 'fa-solid fa-genderless'};
    default:
      return {label: '—', iconClass: 'fa-solid fa-user'};
  }
}
