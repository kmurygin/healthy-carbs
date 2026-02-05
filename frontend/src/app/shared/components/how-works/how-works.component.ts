import {ChangeDetectionStrategy, Component} from '@angular/core';
import {NgOptimizedImage} from '@angular/common';

interface Step {
  label: string;
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  icon: string;
}

@Component({
  selector: 'app-how-works',
  imports: [
    NgOptimizedImage
  ],
  templateUrl: './how-works.component.html',
  styleUrl: './how-works.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HowWorksComponent {
  steps: Step[] = [
    {
      label: 'Set Up Your Profile',
      title: 'Tell us about yourself',
      description: 'Create your dietary profile by entering your preferences, diet type, allergens, and nutritional goals. This helps our algorithm understand exactly what you need.',
      imageUrl: 'assets/images/mierzenie.jpg',
      imageAlt: 'Profile creation',
      icon: 'fa-solid fa-user-pen',
    },
    {
      label: 'Generate Your Plan',
      title: 'AI does the heavy lifting',
      description: 'Our genetic algorithm analyzes hundreds of recipes and creates a balanced 7-day meal plan optimized for your calorie targets, macronutrients, and dietary restrictions.',
      imageUrl: 'assets/images/food_2.jpg',
      imageAlt: 'Generating meal plan',
      icon: 'fa-solid fa-wand-magic-sparkles',
    },
    {
      label: 'Track & Improve',
      title: 'Stay on top of your goals',
      description: 'Log your measurements, monitor your BMI, and track progress over time. Your dietitian can review your data and fine-tune plans to keep you moving forward.',
      imageUrl: 'assets/images/kalendarz-1.jpg',
      imageAlt: 'Progress tracking',
      icon: 'fa-solid fa-chart-line',
    }
  ];
}
