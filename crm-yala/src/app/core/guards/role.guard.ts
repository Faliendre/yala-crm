import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const expectedRole = route.data['role'] as 'admin' | 'seller';
  const userRole = authService.getRole();

  if (authService.isLoggedIn() && userRole === expectedRole) {
    return true;
  }

  // Redirigir al dashboard si no tiene el rol esperado
  if (authService.isLoggedIn()) {
    router.navigate(['/dashboard']);
  } else {
    router.navigate(['/login']);
  }
  
  return false;
};
