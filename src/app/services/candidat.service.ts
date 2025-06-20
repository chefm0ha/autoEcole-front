import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Candidat } from '../models/candidat.model';

@Injectable({
  providedIn: 'root'
})
export class CandidatService {
  private apiUrl = 'http://176.159.137.152:9090/candidat/saveCandidat';
  private apiUrl2 = 'http://176.159.137.152:9090/candidat/getActifCandidat'; // URL de votre API Spring Boot

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) { }

  // Créer un nouveau candidat
  createCandidat(candidat: Candidat): Observable<Candidat> {
    return this.http.post<Candidat>(this.apiUrl, candidat, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Récupérer tous les candidats
  getCandidats(): Observable<Candidat[]> {
    return this.http.get<Candidat[]>(this.apiUrl2)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Récupérer un candidat par ID
  getCandidatById(id: number): Observable<Candidat> {
    return this.http.get<Candidat>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Mettre à jour un candidat
  updateCandidat(id: number, candidat: Candidat): Observable<Candidat> {
    return this.http.put<Candidat>(`${this.apiUrl}/${id}`, candidat, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Supprimer un candidat
  deleteCandidat(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Gestion des erreurs
  private handleError(error: any): Observable<never> {
    console.error('Une erreur est survenue:', error);
    return throwError('Erreur lors de la communication avec le serveur. Veuillez réessayer.');
  }
}