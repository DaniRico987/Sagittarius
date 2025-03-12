import { Component, Inject, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { LoginService } from '../../service/login.service';
import { MaterialModule } from '../../shared/material/material.module';
import { responseLogin } from '../../interface/user-login-interface';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, MaterialModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  formBuilder: FormBuilder;

  constructor(
    public loginService: LoginService,
    @Inject(FormBuilder) formBuilder: FormBuilder,
    public router: Router
  ) {
    this.formBuilder = formBuilder;
  }

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
      (res: responseLogin) => {
        if (res.access_token) {
          this.loginService.setToken(res.access_token);
          this.router.navigate(['/home']);
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }
}
