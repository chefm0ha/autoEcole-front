// src/app/views/calendar/day-details/day-details.component.ts

import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { 
  ModalComponent,
  ModalHeaderComponent,
  ModalTitleDirective,
  ModalBodyComponent,
  ModalFooterComponent,
  ButtonDirective,
  BadgeComponent,
  TableDirective,
  RowComponent,
  ColComponent
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { 
  CalendarDay, 
  CalendarExamDTO, 
  ExamSummary 
} from '../../../models/calendar.model';

@Component({
  selector: 'app-day-details',
  templateUrl: './day-details.component.html',
  styleUrls: ['./day-details.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ModalComponent,
    ModalHeaderComponent,
    ModalTitleDirective,
    ModalBodyComponent,
    ModalFooterComponent,
    ButtonDirective,
    BadgeComponent,
    TableDirective,
    RowComponent,
    ColComponent,
    IconDirective
  ]
})
export class DayDetailsComponent implements OnChanges {
  @Input() visible = false;
  @Input() selectedDay: CalendarDay | null = null;
  @Input() exams: CalendarExamDTO[] = [];
  @Input() examSummary: ExamSummary | null = null;
  
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() closeModal = new EventEmitter<void>();

  // Grouped exams for better display
  groupedExams: { [key: string]: CalendarExamDTO[] } = {};
  categories: string[] = [];

  constructor(private router: Router) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['exams'] || changes['examSummary']) {
      this.groupExamsByCategory();
    }
  }

  /**
   * Close the modal
   */
  onClose(): void {
    this.visible = false;
    this.visibleChange.emit(false);
    this.closeModal.emit();
  }

  /**
   * Group exams by category for better organization
   */
  private groupExamsByCategory(): void {
    this.groupedExams = {};
    this.categories = [];

    if (this.exams.length === 0) {
      return;
    }

    // Group exams by category
    this.exams.forEach(exam => {
      const category = exam.categoryCode;
      if (!this.groupedExams[category]) {
        this.groupedExams[category] = [];
        this.categories.push(category);
      }
      this.groupedExams[category].push(exam);
    });

    // Sort categories alphabetically
    this.categories.sort();
  }

  /**
   * Get formatted date string
   */
  getFormattedDate(): string {
    if (!this.selectedDay) return '';
    
    return this.selectedDay.date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Get exam type label
   */
  getExamTypeLabel(examType: 'THEORY' | 'PRACTICAL'): string {
    return examType === 'THEORY' ? 'Théorique' : 'Pratique';
  }

  /**
   * Get exam type icon
   */
  getExamTypeIcon(examType: 'THEORY' | 'PRACTICAL'): string {
    return examType === 'THEORY' ? 'cilBook' : 'cilSpeedometer';
  }

  /**
   * Get exam status label
   */
  getExamStatusLabel(status: 'SCHEDULED' | 'PASSED' | 'FAILED'): string {
    switch (status) {
      case 'SCHEDULED':
        return 'Programmé';
      case 'PASSED':
        return 'Réussi';
      case 'FAILED':
        return 'Échoué';
      default:
        return status;
    }
  }

  /**
   * Get exam status color
   */
  getExamStatusColor(status: 'SCHEDULED' | 'PASSED' | 'FAILED'): string {
    switch (status) {
      case 'SCHEDULED':
        return 'warning';
      case 'PASSED':
        return 'success';
      case 'FAILED':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  /**
   * Get exam type color
   */
  getExamTypeColor(examType: 'THEORY' | 'PRACTICAL'): string {
    return examType === 'THEORY' ? 'info' : 'primary';
  }

  /**
   * Navigate to candidate details
   */
  viewCandidateDetails(candidateCin: string): void {
    this.onClose();
    this.router.navigate(['/app/candidates', candidateCin]);
  }

  /**
   * Get summary statistics
   */
  getSummaryStats(): { label: string; value: number; color: string }[] {
    if (!this.examSummary) return [];

    return [
      {
        label: 'Total examens',
        value: this.examSummary.totalExams,
        color: 'primary'
      },
      {
        label: 'Théoriques',
        value: this.examSummary.theoryExams,
        color: 'info'
      },
      {
        label: 'Pratiques',
        value: this.examSummary.practicalExams,
        color: 'primary'
      },
      {
        label: 'Programmés',
        value: this.examSummary.scheduledExams,
        color: 'warning'
      },
      {
        label: 'Réussis',
        value: this.examSummary.passedExams,
        color: 'success'
      },
      {
        label: 'Échoués',
        value: this.examSummary.failedExams,
        color: 'danger'
      }
    ].filter(stat => stat.value > 0);
  }

  /**
   * Get exams by category for display
   */
  getExamsByCategory(category: string): CalendarExamDTO[] {
    return this.groupedExams[category] || [];
  }

  /**
   * Check if there are any exams
   */
  hasExams(): boolean {
    return this.exams.length > 0;
  }

  /**
   * Track by function for exam list
   */
  trackByExamId(index: number, exam: CalendarExamDTO): number {
    return exam.id;
  }

  /**
   * Track by function for categories
   */
  trackByCategory(index: number, category: string): string {
    return category;
  }

  /**
   * Handle modal visibility change
   */
  onVisibilityChange(visible: boolean): void {
    this.visible = visible;
    this.visibleChange.emit(visible);
    if (!visible) {
      this.closeModal.emit();
    }
  }
}