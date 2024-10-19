import {Component, inject} from '@angular/core';
import {User} from "../../models/user.model";
import {UserService} from "../../core/services/user.service";
import {AuthService} from "../../core/services/auth.service";

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [],
  templateUrl: './user.component.html',
  styleUrl: './user.component.css'
})
export class UserComponent {
  userService: UserService = inject(UserService);
  authService: AuthService = inject(AuthService);

  user: User | undefined;
  constructor() {
    const user = this.authService.getUserFromToken();
    if (user) this.getUserDetails(user.username);
  }

  getUserDetails(username: any) {
    this.userService.getUserByUsername(username).subscribe({
      next: (response) => {
        console.log(response);
        this.user = response.data;
        console.log(this.user);
      },
      error: (error) => {console.error(error);}
    });
  }
}
