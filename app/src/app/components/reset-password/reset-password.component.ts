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
import { NotificationService } from '../../service/notification.service';
import { ThemeService } from '../../service/theme.service';
import { MaterialModule } from '../../shared/material/material.module';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, MaterialModule, ReactiveFormsModule, RouterModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
})
export class ResetPasswordComponent implements OnInit {
  resetForm!: FormGroup;
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
    this.resetForm = this.BuildForm();
  }

  BuildForm(): FormGroup {
    return this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  resetPassword(): void {
    const { email, newPassword } = this.resetForm.value;

    this.loginService.resetPassword(email, newPassword).subscribe(
      (res) => {
        this.notificationService.success('¡Contraseña actualizada con éxito!');
        this.router.navigate(['/login']);
      },
      (error) => {
        console.error(error);
        if (error.status === 401) {
          this.notificationService.error(
            'Usuario no encontrado. Verifica tu email.'
          );
        } else if (error.status === 0) {
          this.notificationService.error(
            'No se pudo conectar con el servidor. Verifica tu conexión.'
          );
        } else {
          this.notificationService.error(
            'Error al actualizar la contraseña. Por favor, intenta nuevamente.'
          );
        }
      }
    );
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }
}
