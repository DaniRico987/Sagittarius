import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private currentTheme: 'dark' | 'light' = 'dark';
  private readonly THEME_KEY = 'app-theme';

  constructor() {
    this.loadTheme();
  }

  private loadTheme(): void {
    const savedTheme = localStorage.getItem(this.THEME_KEY) as 'dark' | 'light';
    this.currentTheme = savedTheme || 'dark';
    this.applyTheme(this.currentTheme);
  }

  private applyTheme(theme: 'dark' | 'light'): void {
    document.body.classList.remove('dark-theme', 'light-theme');
    document.body.classList.add(`${theme}-theme`);
  }

  toggleTheme(): void {
    this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.applyTheme(this.currentTheme);
    localStorage.setItem(this.THEME_KEY, this.currentTheme);
  }

  getCurrentTheme(): 'dark' | 'light' {
    return this.currentTheme;
  }

  isDarkMode(): boolean {
    return this.currentTheme === 'dark';
  }

  isDarkTheme(): boolean {
    return this.currentTheme === 'dark';
  }
}
