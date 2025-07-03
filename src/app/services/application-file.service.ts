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
  }  // Update tax stamp status
  updateTaxStampStatus(applicationFileId: number, status: string): Observable<string> {
    return this.http.put(`${this.apiUrl}/updateTaxStampStatus/${applicationFileId}?taxStampStatus=${status}`, 
      {}, 
      { 
        withCredentials: true,
        responseType: 'text'
      }
    ).pipe(catchError(this.handleError));
  }
  // Update medical visit status
  updateMedicalVisitStatus(applicationFileId: number, status: string): Observable<string> {
    return this.http.put(`${this.apiUrl}/updateMedicalVisitStatus/${applicationFileId}?medicalVisitStatus=${status}`, 
      {}, 
      { 
        withCredentials: true,
        responseType: 'text'
      }
    ).pipe(catchError(this.handleError));
  }

  // Cancel application file
  cancelApplicationFile(applicationFileId: number): Observable<string> {
    return this.http.put(`${this.apiUrl}/cancelApplicationFile/${applicationFileId}`, 
      {}, 
      { 
        withCredentials: true,
        responseType: 'text'
      }
    ).pipe(catchError(this.handleError));
  }

  // Error handling
  private handleError(error: any): Observable<never> {
    console.error('An error occurred:', error);
    // Pass the original error object so components can access error.error.code
    return throwError(() => error);
  }
}
