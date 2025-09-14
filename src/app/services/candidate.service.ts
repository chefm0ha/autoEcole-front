import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Candidate, CandidateListDTO, CandidateDetailsDTO, CandidateSearchDTO, PageableResponse } from '../models/candidate.model';

@Injectable({
  providedIn: 'root'
})
export class CandidateService {
  private apiUrl = 'http://localhost:9090/candidate';
  constructor(private http: HttpClient) { }
  // Get all active candidates with pagination (optimized response)
  getAllCandidates(
    page: number = 0,
    size: number = 10,
    sortBy: string = 'lastName',
    sortDirection: string = 'asc'
  ): Observable<PageableResponse<CandidateListDTO>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDirection', sortDirection);

    return this.http.get<PageableResponse<CandidateListDTO>>(`${this.apiUrl}/getActiveCandidates`, { 
      params,
      withCredentials: true 
    }).pipe(catchError(this.handleError));
  }
  // Search candidates with filters (optimized response)
  searchCandidates(
    searchCriteria: CandidateSearchDTO,
    page: number = 0,
    size: number = 10,
    sortBy: string = 'lastName',
    sortDirection: string = 'asc'
  ): Observable<PageableResponse<CandidateListDTO>> {
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

    return this.http.get<PageableResponse<CandidateListDTO>>(`${this.apiUrl}/search`, { 
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

  // Get candidate details by CIN (optimized for details view)
  getCandidateDetails(cin: string): Observable<CandidateDetailsDTO> {
    return this.http.get<CandidateDetailsDTO>(`${this.apiUrl}/getCandidateDetails/${cin}`, {
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

  // Update candidate
  updateCandidate(cin: string, candidate: Candidate): Observable<Candidate> {
    // Format names properly before sending
    const formattedCandidate = {
      ...candidate,
      firstName: this.formatName(candidate.firstName),
      lastName: this.formatName(candidate.lastName),
      birthPlace: candidate.birthPlace ? this.formatName(candidate.birthPlace) : undefined
    };

    return this.http.put<Candidate>(`${this.apiUrl}/updateCandidate/${cin}`, formattedCandidate, {
      withCredentials: true
    }).pipe(catchError(this.handleError));
  }

  // Delete candidate
  deleteCandidate(cin: string): Observable<number> {
    return this.http.delete<number>(`${this.apiUrl}/deleteCandidate/${cin}`, {
      withCredentials: true
    }).pipe(catchError(this.handleError));
  }

  // Update theoretical hours for application file
  updateTheoreticalHours(applicationFileId: number, hours: number): Observable<string> {
    const params = new HttpParams().set('hours', hours.toString());
    return this.http.put(`http://localhost:9090/applicationFile/updateTheoreticalHours/${applicationFileId}`, null, {
      params: params,
      withCredentials: true,
      responseType: 'text'
    }).pipe(catchError(this.handleError));
  }

  // Update practical hours for application file
  updatePracticalHours(applicationFileId: number, hours: number): Observable<string> {
    const params = new HttpParams().set('hours', hours.toString());
    return this.http.put(`http://localhost:9090/applicationFile/updatePracticalHours/${applicationFileId}`, null, {
      params: params,
      withCredentials: true,
      responseType: 'text'
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

  // Get count of active candidates
  getActiveCandidatesCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/activeCandidatesNumber`, {
      withCredentials: true
    }).pipe(catchError(this.handleError));
  }

  // Error handling
  private handleError(error: any): Observable<never> {
    console.error('An error occurred:', error);
    // Pass the original error object so components can access error details
    return throwError(() => error);
  }
}