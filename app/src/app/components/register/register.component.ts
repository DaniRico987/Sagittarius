import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { LoginService } from '../../service/login.service';
import { responseRegister } from '../../interface/user-register-interface';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule],
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
      username: [''],
      password: [''],
      email: [''],
    });
  }

  register(): void {
    this.loginService.registerUser(this.registerForm.value).subscribe(
      (res: responseRegister) => {
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
