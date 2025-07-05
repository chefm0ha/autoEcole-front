// src/app/views/calendar/calendar/calendar.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  CardComponent, 
  CardHeaderComponent, 
  CardBodyComponent,
  ButtonDirective,
  BadgeComponent,
  SpinnerComponent,
  AlertComponent,
  TooltipDirective
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { CalendarService } from '../../../services/calendar.service';
import { 
  CalendarMonth, 
  CalendarDay, 
  CalendarExamDTO, 
  ExamSummary 
} from '../../../models/calendar.model';
import { DayDetailsComponent } from '../day-details/day-details.component';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    ButtonDirective,
    BadgeComponent,
    SpinnerComponent,
    AlertComponent,
    TooltipDirective,
    IconDirective,
    DayDetailsComponent
  ]
})
export class CalendarComponent implements OnInit {
  currentMonth!: CalendarMonth;
  currentDate = new Date();
  loading = false;
  error = '';
  
  // Day details modal
  showDayDetails = false;
  selectedDay: CalendarDay | null = null;
  selectedDayExams: CalendarExamDTO[] = [];
  selectedDayExamSummary: ExamSummary | null = null;

  // Calendar navigation
  viewYear: number;
  viewMonth: number;

  // Day names for header
  dayNames: string[] = [];

  constructor(private calendarService: CalendarService) {
    this.viewYear = this.currentDate.getFullYear();
    this.viewMonth = this.currentDate.getMonth();
    this.dayNames = this.calendarService.getDayNames();
  }

  ngOnInit(): void {
    this.loadMonth();
  }

  /**
   * Load calendar data for current month
   */
  loadMonth(): void {
    this.loading = true;
    this.error = '';

    this.calendarService.getExamsForMonth(this.viewYear, this.viewMonth + 1).subscribe({
      next: (exams) => {
        this.currentMonth = this.calendarService.generateCalendarMonth(
          this.viewYear, 
          this.viewMonth, 
          exams
        );
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading calendar data:', error);
        this.error = 'Erreur lors du chargement du calendrier';
        this.loading = false;
        
        // Generate empty calendar on error
        this.currentMonth = this.calendarService.generateCalendarMonth(
          this.viewYear, 
          this.viewMonth, 
          []
        );
      }
    });
  }

  /**
   * Navigate to previous month
   */
  previousMonth(): void {
    if (this.viewMonth === 0) {
      this.viewMonth = 11;
      this.viewYear--;
    } else {
      this.viewMonth--;
    }
    this.loadMonth();
  }

  /**
   * Navigate to next month
   */
  nextMonth(): void {
    if (this.viewMonth === 11) {
      this.viewMonth = 0;
      this.viewYear++;
    } else {
      this.viewMonth++;
    }
    this.loadMonth();
  }

  /**
   * Go to current month
   */
  goToToday(): void {
    const today = new Date();
    this.viewYear = today.getFullYear();
    this.viewMonth = today.getMonth();
    this.loadMonth();
  }

  /**
   * Handle day click - open day details modal
   */
  onDayClick(day: CalendarDay): void {
    if (!day.isCurrentMonth) {
      return; // Don't open details for previous/next month days
    }

    this.selectedDay = day;
    
    if (day.examCount > 0) {
      // Load detailed exam data for this day
      const dateStr = this.formatDate(day.date);
      this.calendarService.getExamsForDate(dateStr).subscribe({
        next: (exams) => {
          this.selectedDayExams = exams;
          this.selectedDayExamSummary = this.calendarService.generateExamSummary(dateStr, exams);
          this.showDayDetails = true;
        },
        error: (error) => {
          console.error('Error loading day details:', error);
          this.error = 'Erreur lors du chargement des détails du jour';
        }
      });
    } else {
      // No exams for this day
      const dateStr = this.formatDate(day.date);
      this.selectedDayExams = [];
      this.selectedDayExamSummary = this.calendarService.generateExamSummary(dateStr, []);
      this.showDayDetails = true;
    }
  }

  /**
   * Close day details modal
   */
  closeDayDetails(): void {
    this.showDayDetails = false;
    this.selectedDay = null;
    this.selectedDayExams = [];
    this.selectedDayExamSummary = null;
  }

  /**
   * Get CSS classes for calendar day
   */
  getDayClasses(day: CalendarDay): string {
    const classes = ['calendar-day'];
    
    if (!day.isCurrentMonth) {
      classes.push('other-month');
    }
    
    if (day.isToday) {
      classes.push('today');
    }
    
    if (day.examCount > 0) {
      classes.push('has-exams');
      
      // Add intensity class based on exam count
      if (day.examCount >= 10) {
        classes.push('high-activity');
      } else if (day.examCount >= 5) {
        classes.push('medium-activity');
      } else {
        classes.push('low-activity');
      }
    }
    
    return classes.join(' ');
  }

  /**
   * Get tooltip text for day
   */
  getDayTooltip(day: CalendarDay): string {
    if (!day.isCurrentMonth) {
      return '';
    }
    
    if (day.examCount === 0) {
      return 'Aucun examen prévu';
    }
    
    const dateStr = day.date.toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    });
    
    return `${dateStr}\n${day.examCount} examen${day.examCount > 1 ? 's' : ''} prévu${day.examCount > 1 ? 's' : ''}`;
  }

  /**
   * Get current month display text
   */
  getCurrentMonthText(): string {
    return `${this.currentMonth?.monthName || ''} ${this.viewYear}`;
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
   * Check if we can navigate to previous month
   */
  canNavigatePrevious(): boolean {
    // Allow navigation up to 1 year in the past
    const minDate = new Date();
    minDate.setFullYear(minDate.getFullYear() - 1);
    const currentViewDate = new Date(this.viewYear, this.viewMonth, 1);
    return currentViewDate >= minDate;
  }

  /**
   * Check if we can navigate to next month
   */
  canNavigateNext(): boolean {
    // Allow navigation up to 1 year in the future
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 1);
    const currentViewDate = new Date(this.viewYear, this.viewMonth, 1);
    return currentViewDate <= maxDate;
  }

  /**
   * Check if current view is today's month
   */
  isCurrentMonth(): boolean {
    const today = new Date();
    return this.viewYear === today.getFullYear() && this.viewMonth === today.getMonth();
  }
}