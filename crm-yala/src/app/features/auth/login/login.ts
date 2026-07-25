import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="glass-card rounded-[32px] p-8 md:p-10 shine-effect w-full max-w-md mx-auto">
      <div class="flex flex-col items-center mb-8 space-y-2">
        <div class="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 mb-2">
          <span class="material-symbols-outlined text-white text-[40px]" style="font-variation-settings: 'FILL' 1;">dataset</span>
        </div>
        <h1 class="font-bold text-2xl text-primary tracking-tight">YALASOFT</h1>
        <p class="text-xs text-on-surface-variant uppercase tracking-[0.2em]">SISTEMA DE VENTAS</p>
      </div>

      <div class="mb-6">
        <h2 class="font-bold text-xl text-white mb-1">Bienvenido</h2>
        <p class="text-sm text-on-surface-variant">Inicie sesión para gestionar su cartera de clientes.</p>
      </div>

      <div *ngIf="errorMessage" class="mb-4 p-3 bg-red-500/20 border border-red-500/30 text-red-300 rounded-lg text-sm">
        {{ errorMessage }}
      </div>

      <form (submit)="onSubmit()" class="space-y-6">
        <div class="space-y-2">
          <label class="block text-xs font-semibold text-on-surface-variant ml-1" for="username">Usuario</label>
          <div class="relative">
            <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px]">person</span>
            <input 
              [(ngModel)]="username" 
              name="username"
              type="text" 
              id="username" 
              placeholder="Nombre de usuario" 
              class="w-full glass-input rounded-xl py-3.5 pl-12 pr-4 text-sm text-white placeholder:text-outline/50 focus:outline-none"
              required 
            />
          </div>
        </div>

        <div class="space-y-2">
          <label class="block text-xs font-semibold text-on-surface-variant ml-1" for="password">Contraseña</label>
          <div class="relative">
            <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px]">lock</span>
            <input 
              [(ngModel)]="password" 
              name="password"
              [type]="showPassword ? 'text' : 'password'" 
              id="password" 
              placeholder="••••••••" 
              class="w-full glass-input rounded-xl py-3.5 pl-12 pr-12 text-sm text-white placeholder:text-outline/50 focus:outline-none"
              required 
            />
            <button 
              type="button" 
              (click)="togglePasswordVisibility()" 
              class="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors"
            >
              <span class="material-symbols-outlined text-[20px]">{{ showPassword ? 'visibility_off' : 'visibility' }}</span>
            </button>
          </div>
        </div>

        <div class="flex items-center justify-between">
          <label class="flex items-center cursor-pointer group">
            <input type="checkbox" class="hidden peer" [(ngModel)]="rememberMe" name="rememberMe" />
            <div class="w-5 h-5 rounded border border-outline bg-surface-container flex items-center justify-center transition-all peer-checked:bg-primary peer-checked:border-primary">
              <span class="material-symbols-outlined text-white text-[14px] font-bold opacity-0 peer-checked:opacity-100">check</span>
            </div>
            <span class="ml-3 text-xs text-on-surface-variant group-hover:text-on-surface transition-colors">Recordarme</span>
          </label>
          <a class="text-xs text-primary hover:text-primary-container transition-colors" href="javascript:void(0)">¿Olvidó su contraseña?</a>
        </div>

        <button 
          type="submit" 
          [disabled]="isLoading"
          class="w-full bg-primary-container text-on-primary-container font-bold py-4 rounded-xl hover:bg-opacity-90 active:scale-[0.98] transition-all flex items-center justify-center space-x-2 shadow-xl shadow-primary-container/20 disabled:opacity-50"
        >
          <span>{{ isLoading ? 'Ingresando...' : 'Entrar' }}</span>
          <span class="material-symbols-outlined">arrow_forward</span>
        </button>
      </form>

      <!-- Footer links -->
      <div class="mt-8 flex justify-center space-x-8">
        <a class="text-xs text-outline hover:text-on-surface transition-colors" href="javascript:void(0)">Privacidad</a>
        <a class="text-xs text-outline hover:text-on-surface transition-colors" href="javascript:void(0)">Términos</a>
        <a class="text-xs text-outline hover:text-on-surface transition-colors" href="javascript:void(0)">Soporte</a>
      </div>
    </div>
  `
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  username = '';
  password = '';
  rememberMe = false;
  showPassword = false;
  isLoading = false;
  errorMessage = '';

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (!this.username || !this.password) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.username, this.password).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Error de conexión. Intente más tarde.';
      }
    });
  }
}
