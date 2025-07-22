import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';

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
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
  ],
  templateUrl: './key-features.component.html',
  styleUrl: './key-features.component.scss'
})
export class KeyFeaturesComponent {
  features: Feature[] = [
    {
      label: 'Personalized Meal Plans',
      icon: 'restaurant_menu',
      title: 'Tailored to Your Needs',
      imageUrl: 'assets/images/food_1.jpg',
      imageAlt: 'Personalized Meal Plans',
      bulletPoints: [
        'Lorem ipsum dolor sit amet, consectetuer adipiscing elit.',
        'Aliquam tincidunt mauris eu risus.',
        'Vestibulum auctor dapibus neque.',
        'Nunc dignissim risus id metus.',
        'Cras ornare tristique elit.',
        'Vivamus vestibulum ntulla nec ante.'
      ]
    },
    {
      label: 'Recipe Library',
      icon: 'menu_book',
      title: 'Extensive Recipe Collection',
      imageUrl: 'assets/images/food_2.jpg',
      imageAlt: 'Recipe Library',
      bulletPoints: [
        'Lorem ipsum dolor sit amet, consectetuer adipiscing elit.',
        'Aliquam tincidunt mauris eu risus.',
        'Vestibulum auctor dapibus neque.',
        'Nunc dignissim risus id metus.',
        'Cras ornare tristique elit.',
        'Vivamus vestibulum ntulla nec ante.'
      ]
    },
    {
      label: 'Progress Tracking',
      icon: 'trending_up',
      title: 'Monitor Your Success',
      imageUrl: 'assets/images/food_3.jpg',
      imageAlt: 'Progress Tracking',
      bulletPoints: [
        'Lorem ipsum dolor sit amet, consectetuer adipiscing elit.',
        'Aliquam tincidunt mauris eu risus.',
        'Vestibulum auctor dapibus neque.',
        'Nunc dignissim risus id metus.',
        'Cras ornare tristique elit.',
        'Vivamus vestibulum ntulla nec ante.'
      ]
    }
  ];
}
