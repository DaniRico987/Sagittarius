export interface UserRegister {
  name: string;
  email: string;
  password: string;
}

export interface responseRegister {
  message: string;
  access_token: string;
}
