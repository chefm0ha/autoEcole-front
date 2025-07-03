import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ExamDTO, SaveExamRequest } from '../models/exam.model';

@Injectable({
  providedIn: 'root'
})
export class ExamService {
  private apiUrl = 'http://localhost:9090/exam';

  constructor(private http: HttpClient) { }

  // Save exam for an application file
  saveExam(applicationFileId: number, examRequest: SaveExamRequest): Observable<string> {
    return this.http.post(`${this.apiUrl}/saveExam/${applicationFileId}`, examRequest, {
      withCredentials: true,
      responseType: 'text'
    }).pipe(catchError(this.handleError));
  }

  // Get exams by application file ID
  getExamsByApplicationFile(applicationFileId: number): Observable<ExamDTO[]> {
    return this.http.get<ExamDTO[]>(`${this.apiUrl}/getExamsByApplicationFile/${applicationFileId}`, {
      withCredentials: true
    }).pipe(catchError(this.handleError));
  }

  // Update exam status
  updateExamStatus(examId: number, status: string): Observable<string> {
    return this.http.put(`${this.apiUrl}/updateExamStatus/${examId}?status=${status}`, 
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
    let errorMessage = 'Une erreur est survenue lors de la communication avec le serveur.';
    
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    } else if (typeof error.error === 'string') {
      errorMessage = error.error;
    }
    
    return throwError(() => errorMessage);
  }
}
