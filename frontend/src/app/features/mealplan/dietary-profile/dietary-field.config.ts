import type {FormFieldConfig} from "@shared/form-field.config";
import type {FormOption} from "@shared/form-option";

export interface DietaryFieldConfig extends FormFieldConfig {
  controlType: 'input' | 'select';
  options?: FormOption<string>[];
  min?: number;
  max?: number;
  step?: number;
  inputMode?: string;
}
