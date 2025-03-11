import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { provideHttpClient } from '@angular/common/http'; // Importamos provideHttpClient

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),          // Configuración de rutas
    provideHttpClient()             // Añadimos provideHttpClient para configurar HttpClient
  ]
}).catch(err => console.error(err));
