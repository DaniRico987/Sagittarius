import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { LoginService } from '../../service/login.service';
import { responseRegister } from '../../interface/user-register-interface';
import { Router, RouterModule } from '@angular/router';
import { MaterialModule } from '../../shared/material/material.module';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, MaterialModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  registerForm!: FormGroup;
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

    this.registerForm = this.BuildForm();
  }

  BuildForm(): FormGroup {
    return this.formBuilder.group({
      name: ['', Validators.required],
      email: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  register(): void {
    this.loginService.registerUser(this.registerForm.value).subscribe(
      (res: responseRegister) => {
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
