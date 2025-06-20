import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

export interface User {
  email: string;
  role: string;
}

export interface LoginResponse {
  message: string;
  email: string | null;
  role: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:9090/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  
  private authCheckPromise: Promise<boolean> | null = null;
  private hasInitialCheck = false;

  constructor(private http: HttpClient) {
    // Don't call checkAuthStatus here to avoid multiple calls
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }  // Check if user is already authenticated (on app startup)
  checkAuthStatus(): Promise<boolean> {
    console.log('AuthService - checkAuthStatus called');
    
    // Return cached promise if already checking
    if (this.authCheckPromise) {
      console.log('AuthService - returning cached promise');
      return this.authCheckPromise;
    }

    // If we already have auth status, return it immediately
    if (this.hasInitialCheck) {
      console.log('AuthService - returning cached result:', this.isAuthenticated);
      return Promise.resolve(this.isAuthenticated);
    }

    console.log('AuthService - making HTTP request to check auth status');
    // Create and cache the promise
    this.authCheckPromise = new Promise((resolve) => {
      this.http.get<User>(`${this.apiUrl}/user`, { 
        withCredentials: true 
      }).subscribe({
        next: (user) => {
          console.log('AuthService - auth check success:', user);
          this.currentUserSubject.next(user);
          this.isAuthenticatedSubject.next(true);
          this.hasInitialCheck = true;
          this.authCheckPromise = null; // Clear the promise
          resolve(true);
        },
        error: (error) => {
          console.log('AuthService - auth check failed:', error.status);
          this.currentUserSubject.next(null);
          this.isAuthenticatedSubject.next(false);
          this.hasInitialCheck = true;
          this.authCheckPromise = null; // Clear the promise
          resolve(false);
        }
      });
    });

    return this.authCheckPromise;
  }
  // Login user
  login(email: string, password: string): Observable<LoginResponse> {
    console.log('AuthService - login called for:', email);
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, 
      { email, password },
      { withCredentials: true }
    ).pipe(
      tap(response => {
        console.log('AuthService - login response:', response);
        if (response.email && response.role) {
          const user: User = {
            email: response.email,
            role: response.role
          };
          this.currentUserSubject.next(user);
          this.isAuthenticatedSubject.next(true);
          this.hasInitialCheck = true; // Mark as having done initial check
          console.log('AuthService - user authenticated successfully');
        }
      }),
      catchError(error => {
        console.error('Login error:', error);
        return throwError(() => error);
      })
    );
  }
  // Logout user
  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}, { 
      withCredentials: true 
    }).pipe(
      tap(() => {
        this.currentUserSubject.next(null);
        this.isAuthenticatedSubject.next(false);
        this.hasInitialCheck = false; // Reset so next checkAuthStatus will make API call
        this.authCheckPromise = null;
      }),
      catchError(error => {
        console.error('Logout error:', error);
        // Even if logout fails, clear local state
        this.currentUserSubject.next(null);
        this.isAuthenticatedSubject.next(false);
        this.hasInitialCheck = false;
        this.authCheckPromise = null;
        return throwError(() => error);
      })
    );
  }
  // Clear authentication state (used by auth guard)
  clearAuth(): void {
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.hasInitialCheck = false;
    this.authCheckPromise = null;
  }
}