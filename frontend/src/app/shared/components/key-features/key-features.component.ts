import {ChangeDetectionStrategy, Component} from '@angular/core';
import {NgOptimizedImage} from '@angular/common';

interface Feature {
  label: string;
  icon: string;
  title: string;
  imageUrl: string;
  imageAlt: string;
  bulletPoints: string[];
}

@Component({
  selector: 'app-key-features',
  imports: [
    NgOptimizedImage
  ],
  templateUrl: './key-features.component.html',
  styleUrl: './key-features.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KeyFeaturesComponent {
  selected = 0;
  features: Feature[] = [
    {
      label: 'Personalized Meal Plans',
      icon: 'fa-solid fa-utensils',
      title: 'Tailored to Your Needs',
      imageUrl: 'assets/images/food_1.jpg',
      imageAlt: 'Personalized Meal Plans',
      bulletPoints: [
        'AI-powered algorithm generates balanced 7-day meal plans automatically.',
        'Supports vegan, vegetarian, and standard diet types.',
        'Accounts for your calorie targets, macros, and allergen restrictions.',
        'Dietitians can also create custom plans manually for their clients.',
        'Download your meal plan as a PDF for easy offline access.'
      ]
    },
    {
      label: 'Recipe Library',
      icon: 'fa-solid fa-book',
      title: 'Extensive Recipe Collection',
      imageUrl: 'assets/images/food_2.jpg',
      imageAlt: 'Recipe Library',
      bulletPoints: [
        'Browse a growing library of healthy, carb-conscious recipes.',
        'Filter by diet type, allergens, meal category, and more.',
        'Each recipe includes full nutritional breakdown per serving.',
        'Recipes are curated and managed by professional dietitians.',
        'Automatic shopping list generation from your weekly meal plan.'
      ]
    },
    {
      label: 'Progress Tracking',
      icon: 'fa-solid fa-chart-line',
      title: 'Monitor Your Success',
      imageUrl: 'assets/images/food_3.jpg',
      imageAlt: 'Progress Tracking',
      bulletPoints: [
        'Log your weight and body measurements over time.',
        'Visualize your progress with interactive charts and graphs.',
        'BMI calculation with automatic health category classification.',
        'Set dietary profiles to keep your goals on track.',
        'Your dietitian can monitor your measurements and adjust plans accordingly.'
      ]
    }
  ];
}
