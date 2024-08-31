import { Injectable } from '@angular/core';
import { User } from "./models/user.model";

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor() { }

  url = 'http://localhost:8080/api/v1/users';
  async getAllUsers(): Promise<User[]> {
    const data = await fetch(this.url);
    return (await data.json()) ?? [];
  }
  async getUserById(id: number): Promise<User | undefined> {
    const data = await fetch(`${this.url}/${id}`);
    return (await data.json()) ?? {};
  }
}
