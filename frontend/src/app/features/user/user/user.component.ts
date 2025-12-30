import {ChangeDetectionStrategy, Component} from '@angular/core';
import {RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';

type UserMenuItem = Readonly<{
  path: string;
  label: string;
  iconClass: string
}>;

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './user.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserComponent {
  readonly items: UserMenuItem[] = [
    {
      path: '/user/edit_user_details',
      label: 'Edit user details',
      iconClass: 'fa-solid fa-user'
    },
    {
      path: '/user/change_password',
      label: 'Edit password',
      iconClass: 'fa-solid fa-lock'
    },
    {
      path: '/user/payments-history',
      label: 'Payment history',
      iconClass: 'fa-solid fa-credit-card'
    },
    {
      path: '/user/mealplan-history',
      label: 'Mealplan history',
      iconClass: 'fa-solid fa-utensils'
    },
  ];
}
