import {Component, inject} from '@angular/core';
import {UserService} from "../../core/services/user.service";
import {AuthService} from "../../core/services/auth.service";
import {User} from "../../models/user.model";

@Component({
  selector: 'app-userdetail',
  standalone: true,
  imports: [],
  templateUrl: './user-detail.component.html',
  styleUrl: './user-detail.component.css'
})
export class UserDetailComponent {
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
