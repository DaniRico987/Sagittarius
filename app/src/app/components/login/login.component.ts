import { Component } from '@angular/core';
import { LoginService } from '../../service/login.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  loginForm!: FormGroup;

  constructor(
    public loginService: LoginService,
    public formBuilder: FormBuilder,
    public router: Router
  ) {}

  ngOnInit(): void {
    if (this.loginService.getTokenValidation()) {
      this.router.navigate(['/home']);
    }
    this.loginForm = this.BuildForm();
  }

  BuildForm(): FormGroup {
    return this.formBuilder.group({
      email: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  login() {
    this.loginService.loginUser(this.loginForm.value).subscribe(
      (res) => {
        console.log(res);
        if (res.access_token) {
          this.loginService.setToken(res.access_token);
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }
}
