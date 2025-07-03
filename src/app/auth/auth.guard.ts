import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { map, take } from 'rxjs/operators';
import { from } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  // If already authenticated, allow access immediately
  if (authService.isAuthenticated) {
    return true;
  }
  // If not authenticated, check auth status
  return from(authService.checkAuthStatus()).pipe(
    take(1),
    map(isAuthenticated => {
      if (isAuthenticated) {
        return true;
      } else {
        router.navigate(['/login']);
        return false;
      }
    })
  );
};

export const loginGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  // If already authenticated, redirect to app/dashboard immediately
  if (authService.isAuthenticated) {
    router.navigate(['/app/dashboard']);
    return false;
  }
  // If not authenticated, check auth status
  return from(authService.checkAuthStatus()).pipe(
    take(1),
    map(isAuthenticated => {
      if (isAuthenticated) {
        router.navigate(['/app/dashboard']);
        return false;
      } else {
        return true;
      }
    })
  );
};