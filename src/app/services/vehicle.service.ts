import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Vehicle } from '../models/vehicle.model';

@Injectable({
  providedIn: 'root'
})
export class VehicleService {
  private apiUrl = 'http://localhost:9090';

  constructor(private http: HttpClient) { }

  getVehiclesByCategory(applicationFileId: number): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(`${this.apiUrl}/vehicle/getVehiclesByCategory/${applicationFileId}`, {
      withCredentials: true
    })
      .pipe(
        catchError(this.handleError)
      );
  }

  getAllVehicles(): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(`${this.apiUrl}/vehicle/getVehicles`, {
      withCredentials: true
    })
      .pipe(
        catchError(this.handleError)
      );
  }

  getVehicleByImmat(immat: string): Observable<Vehicle> {
    return this.http.get<Vehicle>(`${this.apiUrl}/vehicle/getVehicle/${immat}`, {
      withCredentials: true
    })
      .pipe(
        catchError(this.handleError)
      );
  }

  saveVehicle(vehicle: Vehicle): Observable<Vehicle> {
    return this.http.post<Vehicle>(`${this.apiUrl}/vehicle/saveVehicle`, vehicle, {
      withCredentials: true
    })
      .pipe(
        catchError(this.handleError)
      );
  }

  deleteVehicle(immat: string): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/vehicle/deleteVehicle/${immat}`, {
      withCredentials: true
    })
      .pipe(
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('VehicleService Error:', error);
    
    let errorMessage = 'Une erreur est survenue';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Erreur client: ${error.error.message}`;
    } else {
      // Server-side error
      switch (error.status) {
        case 0:
          errorMessage = 'Impossible de se connecter au serveur. Vérifiez que le backend est démarré.';
          break;
        case 401:
          errorMessage = 'Session expirée. Veuillez vous reconnecter.';
          break;
        case 403:
          errorMessage = 'Accès non autorisé. Vérifiez vos permissions ou reconnectez-vous.';
          break;
        case 404:
          errorMessage = 'Dossier de candidature introuvable ou aucun véhicule trouvé pour cette catégorie.';
          break;
        case 500:
          errorMessage = `Erreur serveur: ${error.error || 'Erreur interne du serveur'}`;
          break;
        default:
          errorMessage = `Erreur ${error.status}: ${error.error || error.message}`;
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }
}
