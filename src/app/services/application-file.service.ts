import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApplicationFileDTO } from '../models/application-file.model';
import { CreateApplicationFileRequest } from '../models/category.model';

@Injectable({
  providedIn: 'root'
})
export class ApplicationFileService {
  private apiUrl = 'http://localhost:9090/applicationFile';

  constructor(private http: HttpClient) { }
  // Get application files by candidate CIN
  getApplicationFilesByCandidate(cin: string): Observable<ApplicationFileDTO[]> {
    return this.http.get<ApplicationFileDTO[]>(`${this.apiUrl}/getApplicationFileByCandidate/${cin}`, {
      withCredentials: true
    }).pipe(catchError(this.handleError));
  }

  // Create a new application file
  saveApplicationFile(cin: string, request: CreateApplicationFileRequest): Observable<ApplicationFileDTO> {
    return this.http.post<ApplicationFileDTO>(`${this.apiUrl}/saveApplicationFile/${cin}`, request, {
      withCredentials: true
    }).pipe(catchError(this.handleError));
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
