import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { map, take } from 'rxjs/operators';
import { from, of } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // If already authenticated, allow access immediately
  if (authService.isAuthenticated) {
    console.log('Auth Guard - User already authenticated');
    return true;
  }

  // If not authenticated, check auth status
  return from(authService.checkAuthStatus()).pipe(
    take(1),
    map(isAuthenticated => {
      console.log('Auth Guard - isAuthenticated:', isAuthenticated);
      if (isAuthenticated) {
        return true;
      } else {
        console.log('Auth Guard - Redirecting to login');
        router.navigate(['/login']);
        return false;
      }
    })
  );
};

export const loginGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // If already authenticated, redirect to dashboard immediately
  if (authService.isAuthenticated) {
    console.log('Login Guard - User already authenticated, redirecting to dashboard');
    router.navigate(['/dashboard']);
    return false;
  }

  // If not authenticated, check auth status
  return from(authService.checkAuthStatus()).pipe(
    take(1),
    map(isAuthenticated => {
      console.log('Login Guard - isAuthenticated:', isAuthenticated);
      if (isAuthenticated) {
        console.log('Login Guard - Redirecting to dashboard');
        router.navigate(['/dashboard']);
        return false;
      } else {
        return true;
      }
    })
  );
};