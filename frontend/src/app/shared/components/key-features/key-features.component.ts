import {ChangeDetectionStrategy, Component} from '@angular/core';
import { NgOptimizedImage } from '@angular/common';

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
        'Lorem ipsum dolor sit amet, consectetuer adipiscing elit.',
        'Vestibulum auctor dapibus neque.',
        'Nunc dignissim risus id metus.',
        'Cras ornare tristique elit.',
        'Vivamus vestibulum ntulla nec ante.'
      ]
    },
    {
      label: 'Recipe Library',
      icon: 'fa-solid fa-book',
      title: 'Extensive Recipe Collection',
      imageUrl: 'assets/images/food_2.jpg',
      imageAlt: 'Recipe Library',
      bulletPoints: [
        'Lorem ipsum dolor sit amet, consectetuer adipiscing elit.',
        'Aliquam tincidunt mauris eu risus.',
        'Vestibulum auctor dapibus neque.',
        'Cras ornare tristique elit.',
        'Vivamus vestibulum ntulla nec ante.'
      ]
    },
    {
      label: 'Progress Tracking',
      icon: 'fa-solid fa-chart-line',
      title: 'Monitor Your Success',
      imageUrl: 'assets/images/food_3.jpg',
      imageAlt: 'Progress Tracking',
      bulletPoints: [
        'Lorem ipsum dolor sit amet, consectetuer adipiscing elit.',
        'Aliquam tincidunt mauris eu risus.',
        'Vestibulum auctor dapibus neque.',
        'Nunc dignissim risus id metus.',
        'Cras ornare tristique elit.',
      ]
    }
  ];
}
