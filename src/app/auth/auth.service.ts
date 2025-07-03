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
    // Return cached promise if already checking
    if (this.authCheckPromise) {
      return this.authCheckPromise;
    }

    // If we already have auth status, return it immediately
    if (this.hasInitialCheck) {
      return Promise.resolve(this.isAuthenticated);
    }

    // Create and cache the promise
    this.authCheckPromise = new Promise((resolve) => {
      this.http.get<User>(`${this.apiUrl}/user`, { 
        withCredentials: true 
      }).subscribe({
        next: (user) => {
          this.currentUserSubject.next(user);
          this.isAuthenticatedSubject.next(true);
          this.hasInitialCheck = true;
          this.authCheckPromise = null; // Clear the promise
          resolve(true);
        },
        error: (error) => {
          this.currentUserSubject.next(null);
          this.isAuthenticatedSubject.next(false);
          this.hasInitialCheck = true;
          this.authCheckPromise = null; // Clear the promise
          resolve(false);
        }
      });
    });

    return this.authCheckPromise;
  }  // Login user
  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, 
      { email, password },
      { withCredentials: true }
    ).pipe(
      tap(response => {
        if (response.email && response.role) {
          const user: User = {
            email: response.email,
            role: response.role
          };
          this.currentUserSubject.next(user);
          this.isAuthenticatedSubject.next(true);
          this.hasInitialCheck = true; // Mark as having done initial check
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