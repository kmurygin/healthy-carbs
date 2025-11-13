export interface Offer {
  id: number;
  title: string;
  description: string;
  price: number;
  currency: string;
  features: string[];
  durationInDays: number;
  mealPlanTemplateId: number;
  mealPlanTemplateName: string;
}
