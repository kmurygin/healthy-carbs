import {Component, inject} from '@angular/core';
import {UserService} from "../user.service";
import {User} from "../models/user.model";
import {NgFor, NgIf} from "@angular/common";

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [ NgFor, NgIf ],
  templateUrl: './user.component.html',
  styleUrl: './user.component.css'
})
export class UserComponent {
  userService: UserService = inject(UserService);
  allUsers: User[] = [];
  constructor() {
    this.userService.getAllUsers().then((housingLocationList: User[]) => {
      this.allUsers = housingLocationList;
    });
  }
}
