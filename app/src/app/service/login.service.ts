import { Injectable } from '@angular/core';
import { responseLogin, UserLogin } from '../interface/user-login-interface';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import {
  responseRegister,
  UserRegister,
} from '../interface/user-register-interface';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  token: string = '';
  endPoint = 'https://pkbvmxnl-3000.use2.devtunnels.ms/auth';
  // endPoint = 'http://localhost:3000/auth';

  constructor(private http: HttpClient, private router: Router) {}

  setToken(token: string) {
    this.token = token;
  }

  getEndpoint() {
    return this.endPoint;
  }

  getTokenValidation() {
    return this.token ? true : false;
  }

  loginUser(body: UserLogin): Observable<responseLogin> {
    return this.http.post<responseLogin>(
      this.endPoint + '/login',
      body
    );
  }

  registerUser(body: UserRegister): Observable<responseRegister> {
    return this.http.post<responseRegister>(
      this.endPoint + '/register',
      body
    );
  }

  logout() {
    this.token = '';
    this.router.navigate(['/login']);
  }
}
