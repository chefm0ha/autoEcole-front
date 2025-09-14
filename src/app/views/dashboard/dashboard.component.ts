import { DOCUMENT } from '@angular/common';
import { Component, DestroyRef, effect, inject, OnInit, OnDestroy, Renderer2, signal, WritableSignal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ChartOptions } from 'chart.js';
import {
  CardBodyComponent,
  CardComponent,
  ColComponent,
  RowComponent,
  TableDirective,
  TextColorDirective,
  BadgeComponent,
  SpinnerComponent,
  AlertComponent
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';

import { DashboardChartsData, IChartProps } from './dashboard-charts-data';
import { ExamService } from '../../services/exam.service';
import { CandidateService } from '../../services/candidate.service';
import { DashboardExamDTO, ExamStatistics } from '../../models/exam.model';
import { CommonModule } from '@angular/common';

interface IUser {
  name: string;
  state: string;
  registered: string;
  country: string;
  usage: number;
  period: string;
  payment: string;
  activity: string;
  avatar: string;
  status: string;
  color: string;
}

@Component({
    templateUrl: 'dashboard.component.html',
    styleUrls: ['dashboard.component.scss'],
    imports: [
      CommonModule,
      TextColorDirective, 
      CardComponent, 
      CardBodyComponent, 
      RowComponent, 
      ColComponent, 
      IconDirective, 
      ReactiveFormsModule, 
      TableDirective, 
      BadgeComponent,
      SpinnerComponent,
      AlertComponent
    ]
})
export class DashboardComponent implements OnInit, OnDestroy {

  readonly #destroyRef: DestroyRef = inject(DestroyRef);
  readonly #document: Document = inject(DOCUMENT);
  readonly #renderer: Renderer2 = inject(Renderer2);
  readonly #chartsData: DashboardChartsData = inject(DashboardChartsData);
  readonly #examService: ExamService = inject(ExamService);
  readonly #candidateService: CandidateService = inject(CandidateService);
  readonly #router: Router = inject(Router);

  // Exam data for dashboard
  public upcomingExams: DashboardExamDTO[] = [];
  public examStatistics: ExamStatistics = {
    totalScheduledThisWeek: 0,
    successRateThisMonth: 0,
    totalExamsThisMonth: 0,
    activeCandidatesCount: 0,
    upcomingExams: []
  };
  public loading = false;
  public error = '';

  // Refresh & chart optimization helpers
  private statisticsIntervalId: any;
  private lastSuccessRateRendered: number | null = null;

  // Chart data
  public examTrendsChart: any = {};
  public successRateChart: any = {};
  public examTypeChart: any = {};
  public monthlyExamsChart: any = {};

  public users: IUser[] = [];

  public mainChart: IChartProps = { type: 'line' };
  public mainChartRef: WritableSignal<any> = signal(undefined);
  #mainChartRefEffect = effect(() => {
    if (this.mainChartRef()) {
      this.setChartStyles();
    }
  });
  public chart: Array<IChartProps> = [];
  public trafficRadioGroup = new FormGroup({
    trafficRadio: new FormControl('Month')
  });

  ngOnInit(): void {
    this.initCharts();
    this.updateChartOnColorModeChange();
    this.loadDashboardData();
    this.initializeChartData();
    // Auto refresh statistics every 60 seconds
    this.statisticsIntervalId = setInterval(() => this.refreshStatistics(), 60000);
  }

  ngOnDestroy(): void {
    if (this.statisticsIntervalId) {
      clearInterval(this.statisticsIntervalId);
    }
  }

  initializeChartData(): void {
    // Success Rate Chart (Doughnut)
    this.successRateChart = {
      type: 'doughnut',
      data: {
        labels: ['Réussi', 'Échoué'],
        datasets: [{
          data: [0, 0],
          backgroundColor: ['#20c997', '#dc3545'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    };

    // Exam Type Chart (Bar)
    this.examTypeChart = {
      type: 'bar',
      data: {
        labels: ['Théorique', 'Pratique'],
        datasets: [{
          label: 'Nombre d\'examens',
          data: [0, 0],
          backgroundColor: ['#0d6efd', '#fd7e14'],
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true
          }
        },
        plugins: {
          legend: {
            display: false
          }
        }
      }
    };

    // Monthly Exams Trend (Line)
    this.monthlyExamsChart = {
      type: 'line',
      data: {
        labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'],
        datasets: [{
          label: 'Examens programmés',
          data: new Array(12).fill(0),
          borderColor: '#0d6efd',
          backgroundColor: 'rgba(13, 110, 253, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true
          }
        },
        plugins: {
          legend: {
            display: false
          }
        }
      }
    };

    // Exam Trends Chart (Line with multiple datasets)
    this.examTrendsChart = {
      type: 'line',
      data: {
        labels: ['Semaine 1', 'Semaine 2', 'Semaine 3', 'Semaine 4'],
        datasets: [{
          label: 'Examens réussis',
          data: [0, 0, 0, 0],
          borderColor: '#20c997',
          backgroundColor: 'rgba(32, 201, 151, 0.1)',
          tension: 0.4
        }, {
          label: 'Examens échoués',
          data: [0, 0, 0, 0],
          borderColor: '#dc3545',
          backgroundColor: 'rgba(220, 53, 69, 0.1)',
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true
          }
        },
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    };
  }

  loadDashboardData(): void {
    this.loading = true;
    this.error = '';
    
    // Load upcoming exams
    this.#examService.getComingExams().subscribe({
      next: (exams) => {
        const now = new Date();
        // Keep only future or today exams that are still scheduled
        const filtered = (exams || []).filter(e => {
          if (!e) { return false; }
            const d = new Date(e.date);
            return e.status === 'SCHEDULED' && d.getTime() >= new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        });
        this.upcomingExams = this.processExamData(filtered);
        this.examStatistics.upcomingExams = this.upcomingExams;
        this.updateChartData(filtered);
        this.loading = false;
      },
      error: (error) => {
        this.error = error;
        this.loading = false;
      }
    });
    
    // Load statistics (separate for reuse/refresh)
    this.refreshStatistics();
  }

  private refreshStatistics(): void {
    // Weekly scheduled exams count
    this.#examService.getScheduledExamsThisWeekCount().subscribe({
      next: (count) => this.examStatistics.totalScheduledThisWeek = typeof count === 'number' ? count : parseInt(count) || 0,
      error: () => this.examStatistics.totalScheduledThisWeek = 0
    });

    // Success rate
    this.#examService.getSuccessRateCurrentMonth().subscribe({
      next: (rate: any) => {
        let parsed = 0;
        if (typeof rate === 'number') {
          parsed = rate;
        } else if (rate && typeof rate === 'object') {
          // Try common property names
            if (typeof rate.successRate === 'number') parsed = rate.successRate;
            else if (typeof rate.rate === 'number') parsed = rate.rate;
            else if (typeof rate.percentage === 'number') parsed = rate.percentage;
            else if (typeof rate.value === 'number') parsed = rate.value;
            else {
              // Fallback: attempt to parse first numeric value in object
              const firstNumeric = Object.values(rate).find(v => typeof v === 'number');
              if (typeof firstNumeric === 'number') parsed = firstNumeric;
            }
        } else if (typeof rate === 'string') {
          const numeric = parseFloat(rate);
          parsed = isNaN(numeric) ? 0 : numeric;
        }
        this.examStatistics.successRateThisMonth = parsed;
        this.updateSuccessRateChart(parsed);
      },
      error: () => {
        this.examStatistics.successRateThisMonth = 0;
        this.updateSuccessRateChart(0);
      }
    });

    // Active candidates count
    this.#candidateService.getActiveCandidatesCount().subscribe({
      next: (count) => this.examStatistics.activeCandidatesCount = typeof count === 'number' ? count : parseInt(count) || 0,
      error: () => this.examStatistics.activeCandidatesCount = 0
    });
  }

  updateChartData(exams: any[]): void {
    // Update exam type chart
    const theoryCount = exams.filter(exam => exam.examType === 'THEORY').length;
    const practicalCount = exams.filter(exam => exam.examType === 'PRACTICAL').length;
    
    this.examTypeChart.data.datasets[0].data = [theoryCount, practicalCount];
  }

  updateSuccessRateChart(successRate: number): void {
    // Avoid unnecessary updates if value hasn't changed
    if (this.lastSuccessRateRendered === successRate) {
      return;
    }
    this.lastSuccessRateRendered = successRate;
    const failureRate = 100 - successRate;
    this.successRateChart.data.datasets[0].data = [successRate, failureRate];
  }

  updateExamTypeChart(monthlyExams: any[]): void {
    const theoryCount = monthlyExams.filter(exam => exam.examType === 'THEORY').length;
    const practicalCount = monthlyExams.filter(exam => exam.examType === 'PRACTICAL').length;
    
    this.examTypeChart.data.datasets[0].data = [theoryCount, practicalCount];
  }
  
  processExamData(exams: any[]): DashboardExamDTO[] {
    return exams.map(exam => {
      const examDate = new Date(exam.date);
      const now = new Date();
      const timeDiff = examDate.getTime() - now.getTime();
      const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));
      
      let timeRemaining = '';
      if (daysRemaining === 0) {
        timeRemaining = "Aujourd'hui";
      } else if (daysRemaining === 1) {
        timeRemaining = "Demain";
      } else if (daysRemaining > 1) {
        timeRemaining = `Dans ${daysRemaining} jours`;
      } else {
        timeRemaining = "Passé";
      }
      
      const dayOfWeek = examDate.toLocaleDateString('fr-FR', { weekday: 'long' });
      
      return {
        ...exam,
        timeRemaining,
        dayOfWeek,
        // Map the correct field names from the API response
        candidateFirstName: exam.candidateFullName ? exam.candidateFullName.split(' ')[0] : 'N/A',
        candidateLastName: exam.candidateFullName ? exam.candidateFullName.split(' ').slice(1).join(' ') : 'N/A',
        candidateCin: exam.candidateCin || 'N/A',
        // Use the correct immatriculation field name
        immatriculation: exam.vehicleImmatriculation || null
      };
    });
  }
  
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  }
  
  formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }
  
  getExamTypeLabel(type: string): string {
    return type === 'THEORY' ? 'Théorique' : 'Pratique';
  }
  
  getStatusBadgeColor(status: string): string {
    switch (status) {
      case 'SCHEDULED': return 'primary';
      case 'PASSED': return 'success';
      case 'FAILED': return 'danger';
      default: return 'secondary';
    }
  }
  
  getStatusLabel(status: string): string {
    switch (status) {
      case 'SCHEDULED': return 'Programmé';
      case 'PASSED': return 'Réussi';
      case 'FAILED': return 'Échoué';
      default: return status;
    }
  }
  
  trackByExamId(index: number, exam: DashboardExamDTO): number {
    return exam.id;
  }
  
  getTimeRemainingClass(timeRemaining: string | undefined): string {
    if (!timeRemaining) return '';
    if (timeRemaining === "Aujourd'hui") return 'text-success';
    if (timeRemaining === 'Demain') return 'text-warning';
    if (timeRemaining.includes('Dans')) return 'text-info';
    if (timeRemaining === 'Passé') return 'text-muted';
    return '';
  }

  initCharts(): void {
    this.mainChart = this.#chartsData.mainChart;
  }

  setTrafficPeriod(value: string): void {
    this.trafficRadioGroup.setValue({ trafficRadio: value });
    this.#chartsData.initMainChart(value);
    this.initCharts();
  }

  handleChartRef($chartRef: any) {
    if ($chartRef) {
      this.mainChartRef.set($chartRef);
    }
  }

  updateChartOnColorModeChange() {
    const unListen = this.#renderer.listen(this.#document.documentElement, 'ColorSchemeChange', () => {
      this.setChartStyles();
    });

    this.#destroyRef.onDestroy(() => {
      unListen();
    });
  }

  navigateToExamDetails(exam: DashboardExamDTO): void {
    // Navigate to candidate details page using the CIN
    if (exam.candidateCin && exam.candidateCin !== 'N/A') {
      this.#router.navigate(['/app/candidates', exam.candidateCin]);
    } else {
      // Fallback to candidates management page if no CIN available
      this.#router.navigate(['/app/candidates']);
    }
  }

  setChartStyles() {
    if (this.mainChartRef()) {
      setTimeout(() => {
        const options: ChartOptions = { ...this.mainChart.options };
        const scales = this.#chartsData.getScales();
        this.mainChartRef().options.scales = { ...options.scales, ...scales };
        this.mainChartRef().update();
      });
    }
  }
}
