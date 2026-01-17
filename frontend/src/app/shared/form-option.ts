import {formatEnum} from "./utils";

export interface FormOption<T extends string> {
  readonly value: T;
  readonly label: string;
  readonly description?: string;
}

export function getFormOptionsFromEnum<T extends string>(e: Record<string, T>): FormOption<T>[] {
  return Object.values(e).map(value => ({
    value,
    label: formatEnum(value),
  }));
}
