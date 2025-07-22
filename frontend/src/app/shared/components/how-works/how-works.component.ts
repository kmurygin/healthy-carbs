import { Component } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

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
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
  ],
  templateUrl: './how-works.component.html',
  styleUrl: './how-works.component.scss'
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
      label: 'Your meal plan is automatically generated',
      title: 'lorem ipsum dolor sit amet',
      description: 'lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      imageUrl: 'assets/images/food_2.jpg',
      imageAlt: 'Personalized meal plan',
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
