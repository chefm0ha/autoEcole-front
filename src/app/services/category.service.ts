import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category } from '../models/category.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private baseUrl = 'http://localhost:9090';

  constructor(private http: HttpClient) {}

  /**
   * Get all categories
   * @returns Observable<Category[]>
   */
  getAllCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.baseUrl}/category/getAllCategories`, {
      withCredentials: true
    });
  }
}
