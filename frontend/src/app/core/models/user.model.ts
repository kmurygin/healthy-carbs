export class User {
  id: number;
  username: string;
  password: string;
  firstname: string;
  lastname: string;
  email: string;

  constructor(id: number, firstname: string, lastname: string, username: string, email: string, password: string) {
    this.id = id;
    this.firstname = firstname;
    this.lastname = lastname;
    this.username = username;
    this.email = email;
    this.password = password;
  }
}
