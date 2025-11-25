import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { LoginService } from '../../service/login.service';
import { NotificationService } from '../../service/notification.service';
import { ThemeService } from '../../service/theme.service';
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
  hidePassword = true;

  constructor(
    public loginService: LoginService,
    private notificationService: NotificationService,
    public themeService: ThemeService,
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
          this.notificationService.success(
            '¡Registro exitoso! Bienvenido a Sagittarius.'
          );
          this.router.navigate(['/home']);
        }
      },
      (error) => {
        console.error(error);
        if (error.status === 409) {
          this.notificationService.error(
            'Este email ya está registrado. Por favor, usa otro.'
          );
        } else if (error.status === 0) {
          this.notificationService.error(
            'No se pudo conectar con el servidor. Verifica tu conexión.'
          );
        } else {
          this.notificationService.error(
            'Error al registrarse. Por favor, intenta nuevamente.'
          );
        }
      }
    );
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }
}
