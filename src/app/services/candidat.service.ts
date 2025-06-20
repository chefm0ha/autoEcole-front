import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Candidate, CandidateSearchDTO, PageableResponse } from '../models/candidat.model';

@Injectable({
  providedIn: 'root'
})
export class CandidateService {
  private apiUrl = 'http://localhost:9090/candidate';

  constructor(private http: HttpClient) { }

  // Get all candidates with pagination
  getAllCandidates(
    page: number = 0,
    size: number = 10,
    sortBy: string = 'lastName',
    sortDirection: string = 'asc'
  ): Observable<PageableResponse<Candidate>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDirection', sortDirection);

    return this.http.get<PageableResponse<Candidate>>(`${this.apiUrl}/getAllCandidates`, { 
      params,
      withCredentials: true 
    }).pipe(catchError(this.handleError));
  }

  // Get active candidates with pagination
  getActiveCandidates(
    page: number = 0,
    size: number = 10,
    sortBy: string = 'lastName',
    sortDirection: string = 'asc'
  ): Observable<PageableResponse<Candidate>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDirection', sortDirection);

    return this.http.get<PageableResponse<Candidate>>(`${this.apiUrl}/getActiveCandidates`, { 
      params,
      withCredentials: true 
    }).pipe(catchError(this.handleError));
  }

  // Search candidates with filters
  searchCandidates(
    searchCriteria: CandidateSearchDTO,
    page: number = 0,
    size: number = 10,
    sortBy: string = 'lastName',
    sortDirection: string = 'asc'
  ): Observable<PageableResponse<Candidate>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDirection', sortDirection);

    // Add search parameters if they exist
    if (searchCriteria.firstName) {
      params = params.set('firstName', searchCriteria.firstName);
    }
    if (searchCriteria.lastName) {
      params = params.set('lastName', searchCriteria.lastName);
    }
    if (searchCriteria.cin) {
      params = params.set('cin', searchCriteria.cin);
    }
    if (searchCriteria.isActive !== undefined) {
      params = params.set('isActive', searchCriteria.isActive.toString());
    }
    if (searchCriteria.city) {
      params = params.set('city', searchCriteria.city);
    }
    if (searchCriteria.email) {
      params = params.set('email', searchCriteria.email);
    }

    return this.http.get<PageableResponse<Candidate>>(`${this.apiUrl}/search`, { 
      params,
      withCredentials: true 
    }).pipe(catchError(this.handleError));
  }

  // Get candidate by CIN
  getCandidateByCin(cin: string): Observable<Candidate> {
    return this.http.get<Candidate>(`${this.apiUrl}/getCandidate/${cin}`, {
      withCredentials: true
    }).pipe(catchError(this.handleError));
  }

  // Save candidate
  saveCandidate(candidate: Candidate): Observable<Candidate> {
    // Format names properly before sending
    const formattedCandidate = {
      ...candidate,
      firstName: this.formatName(candidate.firstName),
      lastName: this.formatName(candidate.lastName),
      birthPlace: candidate.birthPlace ? this.formatName(candidate.birthPlace) : undefined
    };

    return this.http.post<Candidate>(`${this.apiUrl}/saveCandidate`, formattedCandidate, {
      withCredentials: true
    }).pipe(catchError(this.handleError));
  }

  // Delete candidate
  deleteCandidate(cin: string): Observable<number> {
    return this.http.delete<number>(`${this.apiUrl}/deleteCandidate/${cin}`, {
      withCredentials: true
    }).pipe(catchError(this.handleError));
  }

  // Utility method to format names (first letter uppercase, rest lowercase)
  private formatName(name: string): string {
    if (!name) return '';
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  }

  // Validate email format
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validate GSM format (Moroccan phone numbers)
  validateGsm(gsm: string): boolean {
    const gsmRegex = /^(\+212|0)[567]\d{8}$/;
    return gsmRegex.test(gsm);
  }

  // Error handling
  private handleError(error: any): Observable<never> {
    console.error('An error occurred:', error);
    let errorMessage = 'Une erreur est survenue lors de la communication avec le serveur.';
    
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return throwError(() => errorMessage);
  }
}