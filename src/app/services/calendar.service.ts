// src/app/services/calendar.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { 
  CalendarExamDTO, 
  CalendarDay, 
  CalendarMonth, 
  CalendarWeek, 
  CalendarExam, 
  ExamSummary 
} from '../models/calendar.model';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  private apiUrl = 'http://localhost:9090/exam';

  constructor(private http: HttpClient) { }

  /**
   * Get exams for a specific month
   */
  getExamsForMonth(year: number, month: number): Observable<CalendarExamDTO[]> {
    const params = new HttpParams()
      .set('year', year.toString())
      .set('month', month.toString());

    return this.http.get<CalendarExamDTO[]>(`${this.apiUrl}/getExamsByMonth`, {
      params,
      withCredentials: true
    }).pipe(catchError(this.handleError));
  }

  /**
   * Get exams for a specific date
   */
  getExamsForDate(date: string): Observable<CalendarExamDTO[]> {
    const params = new HttpParams().set('date', date);

    return this.http.get<CalendarExamDTO[]>(`${this.apiUrl}/getExamsByDate`, {
      params,
      withCredentials: true
    }).pipe(catchError(this.handleError));
  }

  /**
   * Generate calendar month with exam data
   */
  generateCalendarMonth(year: number, month: number, exams: CalendarExamDTO[]): CalendarMonth {
    const monthName = new Date(year, month, 1).toLocaleDateString('fr-FR', { month: 'long' });
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const today = new Date();
    
    // Get first day of calendar (might be from previous month)
    const startDate = new Date(firstDay);
    const dayOfWeek = firstDay.getDay();
    const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert Sunday=0 to Monday=0
    startDate.setDate(startDate.getDate() - mondayOffset);

    // Create exam map for quick lookup
    const examMap = new Map<string, CalendarExamDTO[]>();
    exams.forEach(exam => {
      const dateKey = exam.date;
      if (!examMap.has(dateKey)) {
        examMap.set(dateKey, []);
      }
      examMap.get(dateKey)!.push(exam);
    });

    const weeks: CalendarWeek[] = [];
    let currentDate = new Date(startDate);

    // Generate 6 weeks to ensure full month coverage
    for (let week = 0; week < 6; week++) {
      const days: CalendarDay[] = [];
      
      for (let day = 0; day < 7; day++) {
        const dateKey = this.formatDate(currentDate);
        const dayExams = examMap.get(dateKey) || [];
        
        const calendarDay: CalendarDay = {
          date: new Date(currentDate),
          dayNumber: currentDate.getDate(),
          isCurrentMonth: currentDate.getMonth() === month,
          isToday: this.isSameDate(currentDate, today),
          examCount: dayExams.length,
          exams: dayExams.map(exam => this.convertToCalendarExam(exam))
        };
        
        days.push(calendarDay);
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      weeks.push({ days });
    }

    return {
      year,
      month,
      monthName: monthName.charAt(0).toUpperCase() + monthName.slice(1),
      weeks
    };
  }

  /**
   * Generate exam summary for a specific date
   */
  generateExamSummary(date: string, exams: CalendarExamDTO[]): ExamSummary {
    const examsByCategory: { [category: string]: number } = {};
    let theoryExams = 0;
    let practicalExams = 0;
    let scheduledExams = 0;
    let passedExams = 0;
    let failedExams = 0;

    exams.forEach(exam => {
      // Count by type
      if (exam.examType === 'THEORY') {
        theoryExams++;
      } else {
        practicalExams++;
      }

      // Count by status
      switch (exam.status) {
        case 'SCHEDULED':
          scheduledExams++;
          break;
        case 'PASSED':
          passedExams++;
          break;
        case 'FAILED':
          failedExams++;
          break;
      }

      // Count by category
      if (!examsByCategory[exam.categoryCode]) {
        examsByCategory[exam.categoryCode] = 0;
      }
      examsByCategory[exam.categoryCode]++;
    });

    return {
      date,
      totalExams: exams.length,
      theoryExams,
      practicalExams,
      scheduledExams,
      passedExams,
      failedExams,
      examsByCategory
    };
  }

  /**
   * Convert CalendarExamDTO to CalendarExam
   */
  private convertToCalendarExam(dto: CalendarExamDTO): CalendarExam {
    return {
      id: dto.id,
      candidateName: `${dto.candidateFirstName} ${dto.candidateLastName}`,
      candidateCin: dto.candidateCin,
      examType: dto.examType,
      category: dto.categoryCode,
      status: dto.status,
      applicationFileId: dto.applicationFileId
    };
  }

  /**
   * Format date as YYYY-MM-DD
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Check if two dates are the same day
   */
  private isSameDate(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  /**
   * Get month name in French
   */
  getMonthName(month: number): string {
    const monthNames = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    return monthNames[month];
  }

  /**
   * Get day names in French
   */
  getDayNames(): string[] {
    return ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  }

  /**
   * Error handling
   */
  private handleError(error: any): Observable<never> {
    console.error('Calendar service error:', error);
    return throwError(() => error);
  }
}