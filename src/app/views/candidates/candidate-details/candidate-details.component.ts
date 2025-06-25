import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { 
  CardComponent, 
  CardHeaderComponent, 
  CardBodyComponent,
  ButtonDirective,
  TabsComponent,
  TabsListComponent,
  TabsContentComponent,
  TabDirective,
  TabPanelComponent,
  ModalComponent,
  ModalHeaderComponent,
  ModalTitleDirective,
  ModalBodyComponent,
  ModalFooterComponent,
  FormDirective,
  FormLabelDirective,
  FormControlDirective,
  FormSelectDirective,
  FormFeedbackComponent,
  RowComponent,
  ColComponent,
  InputGroupComponent,
  InputGroupTextDirective,
  BadgeComponent,  SpinnerComponent,
  AlertComponent,
  ProgressComponent,
  ProgressBarComponent
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { ApplicationFile, Exam, Payment, PaymentInstallment, ApplicationFileDTO, PaymentDTO, Category, CreateApplicationFileRequest } from '../../../models';
import { CandidateDetailsDTO } from '../../../models/candidate.model';
import { CandidateService } from '../../../services/candidate.service';
import { ApplicationFileService } from '../../../services/application-file.service';
import { PaymentService } from '../../../services/payment.service';
import { CategoryService } from '../../../services/category.service';

@Component({
  selector: 'app-candidate-details',
  templateUrl: './candidate-details.component.html',
  styleUrls: ['./candidate-details.component.scss'],
  standalone: true,  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    ButtonDirective,
    TabsComponent,
    TabsListComponent,
    TabsContentComponent,
    TabDirective,
    TabPanelComponent,
    ModalComponent,
    ModalHeaderComponent,
    ModalTitleDirective,
    ModalBodyComponent,
    ModalFooterComponent,
    FormDirective,
    FormLabelDirective,
    FormControlDirective,
    FormSelectDirective,
    FormFeedbackComponent,
    RowComponent,
    ColComponent,
    InputGroupComponent,
    InputGroupTextDirective,
    BadgeComponent,
    SpinnerComponent,    AlertComponent,
    IconDirective,
    ProgressComponent,
    ProgressBarComponent
  ]
})
export class CandidateDetailsComponent implements OnInit {
  candidate!: CandidateDetailsDTO;
  applicationFiles: ApplicationFile[] = [];
  archivedApplicationFiles: ApplicationFile[] = [];
    loading = false;
  error = '';
  success = '';
  
  // Archive view state
  showArchive = false;
  
  // Available data for dropdowns
  categories: Category[] = [];
  
  // Modal states
  showApplicationFileModal = false;
  showExamModal = false;
  showPaymentModal = false;
    // Forms
  applicationFileForm: FormGroup;
  examForm: FormGroup;
  paymentForm: FormGroup;
  
  // Active tab for application files
  activeTab: string = '';
  
  // Selected application file for payment
  selectedApplicationFile: ApplicationFile | null = null;
    // Tab change handler
  onTabChange(itemKey: string | number | undefined): void {
    if (typeof itemKey === 'string') {
      this.activeTab = itemKey;
    }
  }  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private candidateService: CandidateService,
    private applicationFileService: ApplicationFileService,
    private paymentService: PaymentService,
    private categoryService: CategoryService
  ) {
    this.applicationFileForm = this.createApplicationFileForm();
    this.examForm = this.createExamForm();
    this.paymentForm = this.createPaymentForm();
  }
    ngOnInit(): void {
    // Load categories first
    this.loadCategories();
    
    const cin = this.route.snapshot.params['cin'];
    if (cin) {
      this.loadCandidateDetails(cin);
    } else {
      this.router.navigate(['/app/candidates']);
    }
  }

  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.error = 'Erreur lors du chargement des catégories';
      }
    });
  }loadCandidateDetails(cin: string): void {
    this.loading = true;
    this.error = '';
    
    this.candidateService.getCandidateDetails(cin).subscribe({
      next: (candidateDetails) => {
        this.candidate = candidateDetails;
        
        // Load application files from API
        this.applicationFileService.getApplicationFilesByCandidate(cin).subscribe({
          next: (applicationFileDTOs) => {
            // Convert DTOs to ApplicationFile format and separate active from expired
            const allFiles = applicationFileDTOs.map(dto => this.convertToApplicationFile(dto));
            
            this.applicationFiles = allFiles.filter(file => file.status === 'ACTIVE');
            this.archivedApplicationFiles = allFiles.filter(file => file.status === 'EXPIRED');
            
            // Load payment data for each application file
            this.loadPaymentDataForFiles([...this.applicationFiles, ...this.archivedApplicationFiles]);
            
            // Set active tab to first category with application files
            if (this.applicationFiles.length > 0) {
              this.activeTab = this.applicationFiles[0].category;
            } else if (this.archivedApplicationFiles.length > 0) {
              this.activeTab = this.archivedApplicationFiles[0].category;
              this.showArchive = true;
            } else {
              this.activeTab = '';
            }
            
            this.loading = false;
          },
          error: (error) => {
            console.error('Error loading application files:', error);
            this.error = 'Erreur lors du chargement des dossiers de candidature: ' + error;
            this.loading = false;
          }
        });
      },
      error: (error) => {
        console.error('Error loading candidate details:', error);
        this.error = 'Erreur lors du chargement des détails du candidat: ' + error;
        this.loading = false;
      }
    });
  }
  createApplicationFileForm(): FormGroup {
    return this.fb.group({
      category: ['', Validators.required],
      totalAmount: ['', [Validators.required, Validators.min(1)]],
      initialAmount: ['', [Validators.required, Validators.min(0)]]
    });
  }
  
  createExamForm(): FormGroup {
    return this.fb.group({
      examType: ['', Validators.required],
      category: ['', Validators.required],
      date: ['', Validators.required],
      status: ['', Validators.required]
    });
  }
  
  createPaymentForm(): FormGroup {
    return this.fb.group({
      amount: ['', [Validators.required, Validators.min(1)]],
      date: ['', Validators.required]
    });
  }  // Get unique categories from active application files
  getCategories(): string[] {
    return [...new Set(this.applicationFiles.map(file => file.category))];
  }
  
  // Get active application files by category
  getApplicationFilesByCategory(category: string): ApplicationFile[] {
    return this.applicationFiles.filter(file => file.category === category);
  }
  
  // Get archived application files by category
  getArchivedApplicationFilesByCategory(category: string): ApplicationFile[] {
    return this.archivedApplicationFiles.filter(file => file.category === category);
  }
  
  // Get all archived categories
  getArchivedCategories(): string[] {
    return [...new Set(this.archivedApplicationFiles.map(file => file.category))];
  }
  
  // Toggle archive view
  toggleArchive(): void {
    this.showArchive = !this.showArchive;
  }
    // Get exams by category from application files
  getExamsByCategory(category: string): Exam[] {
    const files = this.applicationFiles.filter(file => file.category === category);
    return files.flatMap(file => file.exams || []);
  }  
  // Check if candidate is eligible for exams in a category
  isEligibleForExams(category: string): boolean {
    const files = this.getApplicationFilesByCategory(category);
    const activeFile = files.find(file => file.status === 'ACTIVE');
    
    return activeFile ? 
      activeFile.theoreticalHoursCompleted >= 20 && 
      activeFile.practicalHoursCompleted >= 20 : false;
  }
  
  // Check if a specific application file is eligible for exams
  isApplicationFileEligibleForExams(file: ApplicationFile): boolean {
    return file.theoreticalHoursCompleted >= 20 && 
           file.practicalHoursCompleted >= 20;
  }
    // Get remaining exam attempts for a category
  getRemainingAttempts(category: string): number {
    const categoryExams = this.getExamsByCategory(category);
    return Math.max(0, 3 - categoryExams.length);
  }
  
  // Get remaining exam attempts for a specific application file
  getApplicationFileRemainingAttempts(file: ApplicationFile): number {
    const fileExams = file.exams || [];
    return Math.max(0, 3 - fileExams.length);
  }
    // Modal methods
  openApplicationFileModal(): void {
    this.applicationFileForm.reset();
    this.showApplicationFileModal = true;
  }
    openExamModal(category: string, applicationFile?: ApplicationFile): void {
    this.examForm.patchValue({ category });
    this.examForm.patchValue({ examType: '', date: '', status: '' });
    this.selectedApplicationFile = applicationFile || null;
    this.showExamModal = true;
  }
    openPaymentModal(applicationFile: ApplicationFile): void {
    this.selectedApplicationFile = applicationFile;
    this.paymentForm.reset();
    this.showPaymentModal = true;
  }
  
  // Close modals
  closeApplicationFileModal(): void {
    this.showApplicationFileModal = false;
    this.applicationFileForm.reset();
    this.error = '';
    this.success = '';
  }
    closeExamModal(): void {
    this.showExamModal = false;
    this.examForm.reset();
    this.selectedApplicationFile = null;
    this.error = '';
    this.success = '';
  }
    closePaymentModal(): void {
    this.showPaymentModal = false;
    this.paymentForm.reset();
    this.selectedApplicationFile = null;
    this.error = '';
    this.success = '';
  }  
  // Submit methods
  onSubmitApplicationFile(): void {
    if (this.applicationFileForm.valid && this.candidate) {
      const formValue = this.applicationFileForm.value;
      
      const request: CreateApplicationFileRequest = {
        categoryCode: formValue.category,
        totalAmount: formValue.totalAmount,
        initialAmount: formValue.initialAmount
      };
      
      this.loading = true;
      this.error = '';
      
      this.applicationFileService.saveApplicationFile(this.candidate.cin, request).subscribe({
        next: (applicationFileDTO) => {
          // Convert DTO to ApplicationFile and add to the list
          const newFile = this.convertToApplicationFile(applicationFileDTO);
          this.applicationFiles.push(newFile);
            // Load payment data for the new file
          this.loadPaymentDataForFiles([newFile]);
          
          this.success = 'Dossier de candidature créé avec succès!';
          
          // Set the new file's category as active tab
          this.activeTab = newFile.category;
          
          this.loading = false;
          
          setTimeout(() => {
            this.closeApplicationFileModal();
          }, 1500);
        },
        error: (error) => {
          console.error('Error creating application file:', error);
          this.error = 'Erreur lors de la création du dossier: ' + error;
          this.loading = false;
        }
      });
    } else {
      this.markFormGroupTouched(this.applicationFileForm);
    }
  }
  onSubmitExam(): void {
    if (this.examForm.valid) {
      const formValue = this.examForm.value;
      const category = formValue.category;
        // Use selectedApplicationFile if available, otherwise find by category
      let applicationFile = this.selectedApplicationFile;
      if (!applicationFile) {
        applicationFile = this.applicationFiles.find(file => 
          file.category === category && file.status === 'ACTIVE'
        ) || null;
      }
      
      if (!applicationFile) {
        this.error = 'Aucun dossier actif trouvé pour cette catégorie';
        return;
      }
      
      // Initialize exams array if it doesn't exist
      if (!applicationFile.exams) {
        applicationFile.exams = [];
      }
      
      const categoryExams = applicationFile.exams;
      
      // Generate unique ID across all exams
      const allExams = this.applicationFiles.flatMap(file => file.exams || []);
      const maxId = allExams.length > 0 ? Math.max(...allExams.map(e => e.id)) : 0;
      
      const newExam: Exam = {
        id: maxId + 1,
        examType: formValue.examType,
        category: formValue.category,
        attemptNumber: categoryExams.length + 1,
        date: formValue.date,
        status: formValue.status
      };
      
      applicationFile.exams.push(newExam);
      this.success = 'Examen ajouté avec succès!';
      
      setTimeout(() => {
        this.closeExamModal();
      }, 1500);
    }
  }
  onSubmitPayment(): void {
    if (this.paymentForm.valid && this.selectedApplicationFile) {
      const formValue = this.paymentForm.value;
      
      // Initialize payment if it doesn't exist
      if (!this.selectedApplicationFile.payment) {
        this.selectedApplicationFile.payment = {
          id: 0,
          totalAmount: 0,
          paidAmount: 0,
          status: 'PENDING',
          installments: []
        };
      }
      
      // Ensure installments array exists
      if (!this.selectedApplicationFile.payment.installments) {
        this.selectedApplicationFile.payment.installments = [];
      }
      
      const newInstallment: PaymentInstallment = {
        id: this.selectedApplicationFile.payment.installments.length + 1,
        installmentNumber: this.selectedApplicationFile.payment.installments.length + 1,
        amount: formValue.amount,
        date: formValue.date
      };
      
      this.selectedApplicationFile.payment.installments.push(newInstallment);
      this.selectedApplicationFile.payment.paidAmount += formValue.amount;
        if (this.selectedApplicationFile.payment.paidAmount >= this.selectedApplicationFile.payment.totalAmount) {
        this.selectedApplicationFile.payment.status = 'COMPLETED';
      } else if (this.selectedApplicationFile.payment.paidAmount > 0) {
        this.selectedApplicationFile.payment.status = 'PENDING';
      } else {
        this.selectedApplicationFile.payment.status = 'UNPAID';
      }
      
      this.success = 'Paiement enregistré avec succès!';
      
      setTimeout(() => {
        this.closePaymentModal();
      }, 1500);
    }
  }
  
  // Utility methods
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR');
  }
  
  formatPhone(phone: string): string {
    if (!phone) return '';
    if (phone.startsWith('+212')) {
      return phone.replace(/(\+212)(\d)(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5 $6');
    }
    return phone.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
  }
    getPaymentProgress(applicationFile: ApplicationFile): number {
    if (!applicationFile.payment) return 0;
    return (applicationFile.payment.paidAmount / applicationFile.payment.totalAmount) * 100;
  }
    // Get remaining payment amount for an application file
  getRemainingPayment(applicationFile: ApplicationFile): number {
    if (!applicationFile.payment) return 0;
    return applicationFile.payment.totalAmount - applicationFile.payment.paidAmount;
  }
  
  isFieldInvalid(form: FormGroup, fieldName: string): boolean {
    const field = form.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }
  
  getFieldError(form: FormGroup, fieldName: string): string {
    const field = form.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} est requis`;
      }
      if (field.errors['min']) {
        return `La valeur doit être supérieure à ${field.errors['min'].min}`;
      }
    }
    return '';
  }
  
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }
  
  goBack(): void {
    this.router.navigate(['/app/candidates']);
  }  // Convert ApplicationFileDTO to ApplicationFile
  private convertToApplicationFile(dto: ApplicationFileDTO): ApplicationFile {
    console.log('Converting ApplicationFileDTO:', dto);
    const converted: ApplicationFile = {
      id: dto.id,
      category: dto.categoryCode,
      status: dto.isActive ? 'ACTIVE' : 'EXPIRED',
      startingDate: dto.startingDate,
      practicalHoursCompleted: dto.practicalHoursCompleted,
      theoreticalHoursCompleted: dto.theoreticalHoursCompleted,
      fileNumber: dto.fileNumber,
      taxStamp: dto.taxStamp,
      medicalVisit: dto.medicalVisit,
      // Payment and exams will be loaded separately
      payment: undefined,
      exams: []
    };
    console.log('Converted ApplicationFile:', converted);
    return converted;
  }

  // Load payment data for all application files
  private loadPaymentDataForFiles(files: ApplicationFile[]): void {
    files.forEach(file => {
      this.paymentService.getPaymentByApplicationFile(file.id).subscribe({
        next: (paymentDTO) => {
          file.payment = this.convertToPayment(paymentDTO);
        },
        error: (error) => {
          console.error(`Error loading payment for application file ${file.id}:`, error);
          // Set default payment if no payment exists
          file.payment = {
            id: 0,
            totalAmount: 0,
            paidAmount: 0,
            status: 'PENDING',
            installments: []
          };
        }
      });
    });
  }

  // Convert PaymentDTO to Payment
  private convertToPayment(dto: PaymentDTO): Payment {
    return {
      id: dto.id,
      totalAmount: dto.totalAmount,
      paidAmount: dto.paidAmount,
      status: this.mapPaymentStatus(dto.status),
      installments: dto.paymentInstallments.map(installment => ({
        id: installment.id,
        installmentNumber: installment.installmentNumber,
        amount: installment.amount,
        date: installment.date
      }))
    };
  }
  // Map database payment status to UI status
  private mapPaymentStatus(dbStatus: string): 'PENDING' | 'COMPLETED' | 'UNPAID' {
    switch (dbStatus) {
      case 'COMPLETED':
        return 'COMPLETED';
      case 'UNPAID':
        return 'UNPAID';
      case 'PENDING':
        return 'PENDING';
      default:
        return 'PENDING';
    }
  }
}