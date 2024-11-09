import {Component, inject} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatButton} from "@angular/material/button";
import {MatCard} from "@angular/material/card";
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {AuthService} from "../../core/services/auth.service";
import {Router} from "@angular/router";
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-register',
  standalone: true,
    imports: [
        FormsModule,
        MatButton,
        MatCard,
        MatFormField,
        MatInput,
        MatLabel,
        ReactiveFormsModule,
        NgIf
    ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  form: FormGroup;
  authService = inject(AuthService);
  router = inject(Router);
  errorMessage: string = "";


  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      firstname: new FormControl("", [Validators.required]),
      lastname: new FormControl("", [Validators.required]),
      username: new FormControl("", [Validators.required]),
      email: new FormControl("", [Validators.required, Validators.email]),
      password: new FormControl("", [Validators.required])
    })
  }

  get email() {
    return this.form.get("email");
  }

  onSubmit(){
    if (this.form.valid) {
      this.authService.register(this.form.value).subscribe({
        next: (response) => {
          console.log(response);
          if (response.token)
            this.router.navigate(['login']);
          else if (response.error)
            this.errorMessage = response.error;
        },
      });
    }
  }
}
