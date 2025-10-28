import {ChangeDetectionStrategy, Component} from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';

interface Step {
  label: string;
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  isReversed?: boolean;
}

@Component({
  selector: 'app-how-works',
  imports: [
    CommonModule,
    NgOptimizedImage,
  ],
  templateUrl: './how-works.component.html',
  styleUrl: './how-works.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HowWorksComponent {
  steps: Step[] = [
    {
      label: 'Create your personal profile',
      title: 'lorem ipsum dolor sit amet',
      description: 'lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      imageUrl: 'assets/images/mierzenie.jpg',
      imageAlt: 'Profile creation',
    },
    {
      label: 'Generating meal plan using AI',
      title: 'lorem ipsum dolor sit amet',
      description: 'lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      imageUrl: 'assets/images/food_2.jpg',
      imageAlt: 'Generating meal plan',
    },
    {
      label: 'Monitor Your Progress',
      title: 'lorem ipsum dolor sit amet',
      description: 'lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      imageUrl: 'assets/images/kalendarz-1.jpg',
      imageAlt: 'Progress tracking',
    }
  ];
}
