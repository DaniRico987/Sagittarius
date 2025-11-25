import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button'; // Para botones
import { MatFormFieldModule } from '@angular/material/form-field'; // Para campos de formulario
import { MatInputModule } from '@angular/material/input'; // Para campos de entrada
import { MatCardModule } from '@angular/material/card'; // Para tarjetas
import { MatToolbarModule } from '@angular/material/toolbar'; // Si quieres un toolbar (barra de navegación)
import { MatSnackBarModule } from '@angular/material/snack-bar'; // Para notificaciones emergentes (opcional)
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; // Para el spinner de carga (opcional)
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatListModule } from '@angular/material/list';
import { MatTabsModule } from '@angular/material/tabs';

const materialModules = [
  MatIconModule,
  MatButtonModule,
  MatFormFieldModule,
  MatInputModule,
  MatCardModule,
  MatToolbarModule,
  MatSnackBarModule,
  MatProgressSpinnerModule,
  MatDialogModule,
  MatTooltipModule,
  MatListModule,
  MatTabsModule
];

@NgModule({
  imports: [materialModules],
  exports: [materialModules],
})
export class MaterialModule {}
