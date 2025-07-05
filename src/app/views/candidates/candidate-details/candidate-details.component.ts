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
import { ExamDTO, SaveExamRequest } from '../../../models/exam.model';
import { CandidateDetailsDTO } from '../../../models/candidate.model';
import { CandidateService } from '../../../services/candidate.service';
import { ApplicationFileService } from '../../../services/application-file.service';
import { PaymentService } from '../../../services/payment.service';
import { CategoryService } from '../../../services/category.service';
import { ExamService } from '../../../services/exam.service';

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
  categories: Category[] = [];  // Modal states
  showApplicationFileModal = false;
  showExamModal = false;
  showPaymentModal = false;
  showTaxStampModal = false;
  showMedicalVisitModal = false;
  showExamStatusModal = false;
  showCancelApplicationFileModal = false;
  showEditHoursModal = false;

// Forms
  applicationFileForm: FormGroup;
  examForm: FormGroup;
  paymentForm: FormGroup;
  taxStampForm: FormGroup;
  medicalVisitForm: FormGroup;
  examStatusForm: FormGroup;
  editHoursForm: FormGroup;
  
  // Active tab for application files
  activeTab: string = '';
    // Selected application file for payment
  selectedApplicationFile: ApplicationFile | null = null;
  // Selected application file for tax stamp/medical visit
  selectedApplicationFileForStatus: ApplicationFile | null = null;
  // Selected application file for cancellation
  selectedApplicationFileForCancellation: ApplicationFile | null = null;
  // Selected exam for status update
  selectedExam: Exam | null = null;
  // Selected application file for hours editing
  selectedApplicationFileForHours: ApplicationFile | null = null;
  // Type of hours being edited ('theoretical' or 'practical')
  editingHoursType: 'theoretical' | 'practical' | null = null;
  // Modal-specific success and error messages
  modalSuccess = '';
  modalError = '';
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
    private categoryService: CategoryService,
    private examService: ExamService  ) {
    this.applicationFileForm = this.createApplicationFileForm();
    this.examForm = this.createExamForm();
    this.paymentForm = this.createPaymentForm();
    this.taxStampForm = this.createTaxStampForm();
    this.medicalVisitForm = this.createMedicalVisitForm();
    this.examStatusForm = this.createExamStatusForm();
    this.editHoursForm = this.createEditHoursForm();
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
          next: (applicationFileDTOs) => {            // Separate active from archived based on isActive attribute
            this.applicationFiles = applicationFileDTOs
              .filter(dto => dto.isActive)
              .map(dto => this.convertToApplicationFile(dto));
            
            this.archivedApplicationFiles = applicationFileDTOs
              .filter(dto => !dto.isActive)
              .map(dto => this.convertToApplicationFile(dto));
            
            // Load payment data for each application file
            this.loadPaymentDataForFiles([...this.applicationFiles, ...this.archivedApplicationFiles]);
            
            // Load exam data for each application file
            this.loadExamDataForFiles([...this.applicationFiles, ...this.archivedApplicationFiles]);
            
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
      date: ['', Validators.required],
      status: ['', Validators.required]
    });
  }
    createPaymentForm(): FormGroup {
    return this.fb.group({
      amount: ['', [Validators.required, Validators.min(1)]]
    });
  }

  createTaxStampForm(): FormGroup {
    return this.fb.group({
      status: ['', Validators.required]
    });
  }

  createMedicalVisitForm(): FormGroup {
    return this.fb.group({
      status: ['', Validators.required]
    });
  }

  createExamStatusForm(): FormGroup {
    return this.fb.group({
      status: ['', Validators.required]
    });
  }

  createEditHoursForm(): FormGroup {
    return this.fb.group({
      hours: ['', [Validators.required, Validators.min(0), Validators.max(1000)]]
    });
  }

  // Get unique categories from active application files
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
    
    if (!activeFile) return false;
    
    return activeFile.theoreticalHoursCompleted >= 20 && 
           activeFile.practicalHoursCompleted >= 20;
  }
  // Get exam business rule violations for better UX
  getExamValidationErrors(applicationFile: ApplicationFile | null, examType: 'THEORY' | 'PRACTICAL'): string[] {
    const errors: string[] = [];
    
    if (!applicationFile) {
      errors.push('Aucun dossier sélectionné');
      return errors;
    }
    
    if (!applicationFile.exams) applicationFile.exams = [];
    
    // Check if application file is active
    if (applicationFile.status !== 'ACTIVE') {
      errors.push('Le dossier doit être actif pour programmer un examen');
    }
    
    // Check maximum attempts (3 per exam type)
    const examTypeAttempts = applicationFile.exams.filter(e => e.examType === examType).length;
    if (examTypeAttempts >= 3) {
      errors.push(`Nombre maximum de tentatives atteint (3) pour cet examen`);
    }
    
    // Check for existing scheduled exam of same type
    const hasScheduledExam = applicationFile.exams.some(e => 
      e.examType === examType && e.status === 'SCHEDULED'
    );
    if (hasScheduledExam) {
      errors.push(`Il y a déjà un examen ${examType === 'THEORY' ? 'théorique' : 'pratique'} programmé`);
    }
    
    // For practical exam, check if theory is passed
    if (examType === 'PRACTICAL') {
      const theoryPassed = applicationFile.exams.some(e => 
        e.examType === 'THEORY' && e.status === 'PASSED'
      );
      if (!theoryPassed) {
        errors.push('L\'examen théorique doit être réussi avant de programmer l\'examen pratique');
      }
    }
    
    return errors;
  }

  // Check if exam type is available for scheduling
  canScheduleExamType(applicationFile: ApplicationFile | null, examType: 'THEORY' | 'PRACTICAL'): boolean {
    if (!applicationFile) return false;
    return this.getExamValidationErrors(applicationFile, examType).length === 0;
  }

  // Get available exam types for an application file
  getAvailableExamTypes(applicationFile: ApplicationFile | null): ('THEORY' | 'PRACTICAL')[] {
    const available: ('THEORY' | 'PRACTICAL')[] = [];
    
    if (!applicationFile) return available;
    
    if (this.canScheduleExamType(applicationFile, 'THEORY')) {
      available.push('THEORY');
    }
    
    if (this.canScheduleExamType(applicationFile, 'PRACTICAL')) {
      available.push('PRACTICAL');
    }
    
    return available;
  }

  // Check if any exam types are available for scheduling
  hasAvailableExamTypes(file: ApplicationFile | null): boolean {
    if (!file) return false;
    
    const availableTypes = this.getAvailableExamTypes(file);
    return availableTypes.length > 0;
  }

  // Open application file modal
  openApplicationFileModal(): void {
    this.applicationFileForm.reset();
    this.showApplicationFileModal = true;
    this.error = '';
    this.success = '';
  }

  // Close application file modal
  closeApplicationFileModal(): void {
    this.showApplicationFileModal = false;
    this.applicationFileForm.reset();
    this.error = '';
    this.success = '';
  }

  // Open payment modal
  openPaymentModal(file: ApplicationFile): void {
    this.selectedApplicationFile = file;
    this.paymentForm.reset();
    this.showPaymentModal = true;
    this.error = '';
    this.success = '';
  }

  // Close payment modal
  closePaymentModal(): void {
    this.showPaymentModal = false;
    this.paymentForm.reset();
    this.selectedApplicationFile = null;
    this.error = '';
    this.success = '';
  }

  // Check if application file is eligible for exams
  isApplicationFileEligibleForExams(file: ApplicationFile): boolean {
    return file.theoreticalHoursCompleted >= 20 && 
           file.practicalHoursCompleted >= 20;
  }  // Get remaining attempts for an application file
  getApplicationFileRemainingAttempts(file: ApplicationFile | null): number {
    if (!file || !file.exams) return 3; // Maximum total attempts
    
    // Count total exams regardless of type or status
    const totalExams = file.exams.length;
    
    // Count failed exams - if 2 or more failures, no attempts left
    const failedExams = file.exams.filter(e => e.status === 'FAILED').length;
    if (failedExams >= 2) {
      return 0; // Application file is considered failed
    }
    
    // Return remaining attempts (max 3 total)
    return Math.max(0, 3 - totalExams);
  }

  // Check if application file has failed due to 2 or more exam failures
  isApplicationFileFailed(file: ApplicationFile | null): boolean {
    if (!file || !file.exams) return false;
    const failedExams = file.exams.filter(e => e.status === 'FAILED').length;
    return failedExams >= 2;
  }

  // Check if candidate has graduated (passed both theory and practical exams)
  hasGraduated(file: ApplicationFile | null): boolean {
    if (!file || !file.exams || file.exams.length === 0) return false;
    
    const theoryPassed = file.exams.some(e => 
      e.examType === 'THEORY' && e.status === 'PASSED'
    );
    
    const practicalPassed = file.exams.some(e => 
      e.examType === 'PRACTICAL' && e.status === 'PASSED'
    );
    
    return theoryPassed && practicalPassed;
  }

  // Check if application file can be cancelled
  canCancelApplicationFile(file: ApplicationFile | null): boolean {
    if (!file) return false;
    // Can cancel if status is not GRADUATED or CANCELLED
    return file.status !== 'GRADUATED' && file.status !== 'CANCELLED';
  }

  // Get border color class for application file card
  getApplicationFileBorderColor(file: ApplicationFile): string {
    if (file.status === 'ACTIVE' || file.status === 'IN_PROGRESS' || file.status === 'COMPLETED') {
      return 'border-success';
    } else if (file.status === 'CANCELLED' || file.status === 'FAILED') {
      return 'border-danger';
    } else {
      return 'border-secondary';
    }
  }

  // Close exam modal
  closeExamModal(): void {
    this.showExamModal = false;
    this.examForm.reset();
    this.selectedApplicationFile = null;
    this.error = '';    this.success = '';
  }
  
  // Open tax stamp modal
  openTaxStampModal(applicationFile: ApplicationFile): void {
    this.selectedApplicationFileForStatus = applicationFile;
    this.taxStampForm.patchValue({
      status: applicationFile.taxStamp || 'NOT_PAID'
    });
    this.showTaxStampModal = true;
  }

  // Close tax stamp modal
  closeTaxStampModal(): void {
    this.showTaxStampModal = false;
    this.taxStampForm.reset();
    this.selectedApplicationFileForStatus = null;
    this.error = '';
    this.success = '';
  }

  // Open medical visit modal
  openMedicalVisitModal(applicationFile: ApplicationFile): void {
    this.selectedApplicationFileForStatus = applicationFile;
    this.medicalVisitForm.patchValue({
      status: applicationFile.medicalVisit || 'NOT_REQUESTED'
    });
    this.showMedicalVisitModal = true;
  }

  // Close medical visit modal
  closeMedicalVisitModal(): void {
    this.showMedicalVisitModal = false;
    this.medicalVisitForm.reset();
    this.selectedApplicationFileForStatus = null;
    this.error = '';
    this.success = '';
  }

  // Open exam status modal
  openExamStatusModal(exam: Exam): void {
    this.selectedExam = exam;
    this.examStatusForm.patchValue({
      status: exam.status
    });
    this.showExamStatusModal = true;
  }

  // Close exam status modal
  closeExamStatusModal(): void {
    this.showExamStatusModal = false;
    this.examStatusForm.reset();
    this.selectedExam = null;
    this.error = '';
    this.success = '';
  }

  // Open cancel application file modal
  openCancelApplicationFileModal(applicationFile: ApplicationFile): void {
    this.selectedApplicationFileForCancellation = applicationFile;
    this.showCancelApplicationFileModal = true;
    this.error = '';
    this.success = '';
  }

  // Close cancel application file modal
  closeCancelApplicationFileModal(): void {
    this.showCancelApplicationFileModal = false;
    this.selectedApplicationFileForCancellation = null;
    this.error = '';
    this.success = '';
  }

  // Open edit hours modal
  openEditHoursModal(applicationFile: ApplicationFile, hoursType: 'theoretical' | 'practical'): void {
    this.selectedApplicationFileForHours = applicationFile;
    this.editingHoursType = hoursType;
    
    // Set current hours value in the form
    const currentHours = hoursType === 'theoretical' 
      ? applicationFile.theoreticalHoursCompleted 
      : applicationFile.practicalHoursCompleted;
    
    this.editHoursForm.patchValue({
      hours: currentHours
    });
    
    this.showEditHoursModal = true;
    // Clear both modal and global messages to prevent page scrolling
    this.modalError = '';
    this.modalSuccess = '';
    this.error = '';
    this.success = '';
  }

  // Close edit hours modal
  closeEditHoursModal(): void {
    this.showEditHoursModal = false;
    this.selectedApplicationFileForHours = null;
    this.editingHoursType = null;
    this.editHoursForm.reset();
    // Clear both modal and global messages
    this.modalError = '';
    this.modalSuccess = '';
    this.error = '';
    this.success = '';
  }

  // Get hours type label for the modal
  getHoursTypeLabel(): string {
    return this.editingHoursType === 'theoretical' ? 'théoriques' : 'pratiques';
  }

  // Open exam modal
  openExamModal(category: string, file: ApplicationFile): void {
    this.selectedApplicationFile = file;
    this.examForm.reset();
    this.examForm.patchValue({
      status: 'SCHEDULED' // Default to scheduled
    });
    this.showExamModal = true;
    this.error = '';
    this.success = '';  }

  // Submit exam status update
  onSubmitExamStatus(): void {
    if (this.examStatusForm.valid && this.selectedExam) {
      const newStatus = this.examStatusForm.value.status;
      
      this.loading = true;
      this.error = '';
        this.examService.updateExamStatus(this.selectedExam.id!, newStatus).subscribe({
        next: (response) => {
          this.success = 'Statut de l\'examen mis à jour avec succès!';
            // Update the exam status in the local data
          if (this.selectedExam) {
            this.selectedExam.status = newStatus;
            // Also update in the application files
            this.applicationFiles.forEach(file => {
              if (file.exams) {
                const examIndex = file.exams.findIndex(e => e.id === this.selectedExam!.id);
                if (examIndex !== -1) {
                  file.exams[examIndex].status = newStatus;
                }
              }
            });
          }
          
          this.loading = false;
          this.closeExamStatusModal();
        },        error: (error) => {
          // Handle specific backend error messages
          let errorMessage = 'Erreur lors de la mise à jour du statut';
          
          // Handle HTTP error responses
          if (error?.status === 400) {
            // Bad request - business rule violations
            errorMessage = error.error || 'Violation des règles métier';
          } else if (error?.status === 404) {
            // Not found - exam not found
            errorMessage = 'Examen introuvable';
          } else if (error?.status === 500) {
            // Server error
            errorMessage = error.error || 'Erreur serveur interne';
          } else if (typeof error?.error === 'string') {
            // Direct error message from backend
            errorMessage = error.error;
          } else if (error?.error?.message) {
            // Error object with message property
            errorMessage = error.error.message;
          } else if (error?.message) {
            // General error message
            errorMessage = error.message;
          }
          
          this.error = errorMessage;
          this.loading = false;
        }
      });
    }
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
          this.applicationFiles.push(newFile);          // Load payment data for the new file
          this.loadPaymentDataForFiles([newFile]);
          
          // Load exam data for the new file
          this.loadExamDataForFiles([newFile]);
          
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
          
          let errorMessage = 'Erreur lors de la création du dossier';
          
          // Handle specific error codes from backend
          if (error?.error?.code) {
            const code = error.error.code;
            const message = error.error.message;
            
            switch (code) {
              case 100:
                errorMessage = 'Candidat introuvable';
                break;
              case 101:
                errorMessage = 'Catégorie introuvable';
                break;
              case 102:
                errorMessage = 'Impossible d\'ajouter le dossier: Un dossier actif est déjà en cours pour cette catégorie';
                break;
              case 103:
                errorMessage = 'Impossible d\'ajouter le dossier: Un dossier terminé existe déjà pour cette catégorie';
                break;
              case 104:
                errorMessage = 'Dossier de candidature introuvable';
                break;
              case 105:
                errorMessage = 'Impossible d\'annuler un dossier terminé';
                break;
              case 106:
                errorMessage = 'Le dossier de candidature est déjà annulé';
                break;
              case 404:
              case 500:
              case 999:
                errorMessage = 'Une erreur est survenue';
                break;
              default:
                errorMessage = message || 'Erreur lors de la création du dossier';
            }
          } else if (error?.status === 400 && error?.error?.message) {
            // Fallback for other 400 errors with message
            errorMessage = error.error.message;
          } else if (error?.status === 404) {
            errorMessage = 'Une erreur est survenue';
          } else if (error?.status === 500) {
            errorMessage = 'Une erreur est survenue';
          } else if (typeof error?.error === 'string') {
            errorMessage = error.error;
          } else if (error?.message) {
            errorMessage = error.message;
          }
          
          this.error = errorMessage;
          this.loading = false;
        }
      });
    } else {
      this.markFormGroupTouched(this.applicationFileForm);
    }
  }  onSubmitExam(): void {
    if (this.examForm.valid && this.selectedApplicationFile) {
      const formValue = this.examForm.value;
      
      this.loading = true;
      this.error = '';
      
      const examRequest: SaveExamRequest = {
        examType: formValue.examType,
        date: formValue.date,
        status: formValue.status
      };
        this.examService.saveExam(this.selectedApplicationFile.id, examRequest).subscribe({
        next: (message) => {
          // Reload exam data for this application file
          this.examService.getExamsByApplicationFile(this.selectedApplicationFile!.id).subscribe({
            next: (examDTOs) => {
              this.selectedApplicationFile!.exams = examDTOs.map(dto => 
                this.convertToExam(dto, this.selectedApplicationFile!.category)
              );
                // Update the exam data in the main arrays as well
              const fileIndex = this.applicationFiles.findIndex(f => f.id === this.selectedApplicationFile!.id);
              if (fileIndex !== -1) {
                this.applicationFiles[fileIndex].exams = this.selectedApplicationFile!.exams;
              }
              
              this.success = message || 'Examen enregistré avec succès!';
              this.loading = false;
              
              setTimeout(() => {
                this.closeExamModal();
              }, 1500);
            },
            error: (error) => {
              console.error('Error reloading exam data:', error);
              this.success = 'Examen enregistré mais erreur lors du rafraîchissement des données';
              this.loading = false;
            }
          });        },
        error: (error) => {
          console.error('Error saving exam:', error);
          // Handle specific backend error messages
          let errorMessage = 'Erreur lors de l\'enregistrement de l\'examen';
          
          // Handle HTTP error responses
          if (error?.status === 400) {
            // Bad request - business rule violations
            errorMessage = error.error || 'Violation des règles métier';
          } else if (error?.status === 404) {
            // Not found - application file not found
            errorMessage = 'Dossier de candidature introuvable';
          } else if (error?.status === 500) {
            // Server error
            errorMessage = error.error || 'Erreur serveur interne';
          } else if (typeof error?.error === 'string') {
            // Direct error message from backend
            errorMessage = error.error;
          } else if (error?.error?.message) {
            // Error object with message property
            errorMessage = error.error.message;
          } else if (error?.message) {
            // General error message
            errorMessage = error.message;
          }
          
          this.error = errorMessage;
          this.loading = false;
        }
      });} else {
      this.markFormGroupTouched(this.examForm);
    }
  }
  // Submit payment installment
  onSubmitPayment(): void {
    if (this.paymentForm.valid && this.selectedApplicationFile) {
      const formValue = this.paymentForm.value;
      
      this.loading = true;
      this.error = '';
      
      this.paymentService.savePaymentInstallment(this.selectedApplicationFile.id, formValue.amount).subscribe({
        next: (paymentDTO) => {
          // Update the payment data directly from the response
          this.selectedApplicationFile!.payment = this.convertToPayment(paymentDTO);
          
          // Also update the payment data in the main arrays
          const fileIndex = this.applicationFiles.findIndex(f => f.id === this.selectedApplicationFile!.id);
          if (fileIndex !== -1) {
            this.applicationFiles[fileIndex].payment = this.selectedApplicationFile!.payment;
          }
          
          this.success = 'Paiement enregistré avec succès!';
          this.loading = false;
          
          setTimeout(() => {
            this.closePaymentModal();
          }, 1500);
        },
        error: (error) => {
          console.error('Error saving payment installment:', error);
          
          // Handle HTTP error responses
          let errorMessage = 'Erreur lors de l\'enregistrement du paiement';
          if (error?.status === 400) {
            errorMessage = error.error || 'Données de paiement invalides';
          } else if (error?.status === 404) {
            errorMessage = 'Dossier de candidature introuvable';
          } else if (error?.status === 500) {
            errorMessage = error.error || 'Erreur serveur interne';
          } else if (typeof error?.error === 'string') {
            errorMessage = error.error;
          } else if (error?.error?.message) {
            errorMessage = error.error.message;
          } else if (error?.message) {
            errorMessage = error.message;
          }
          
          this.error = errorMessage;
          this.loading = false;
        }
      });
    } else {
      this.markFormGroupTouched(this.paymentForm);
    }
  }
    // Submit tax stamp status update
  onSubmitTaxStamp(): void {
    if (this.taxStampForm.valid && this.selectedApplicationFileForStatus) {
      const formValue = this.taxStampForm.value;
      
      this.loading = true;
      this.error = '';
      
      this.applicationFileService.updateTaxStampStatus(
        this.selectedApplicationFileForStatus.id, 
        formValue.status
      ).subscribe({
        next: (message) => {
          // Update the local application file object
          if (this.selectedApplicationFileForStatus) {
            this.selectedApplicationFileForStatus.taxStamp = formValue.status as 'NOT_PAID' | 'PENDING' | 'PAID';
            
            // Update the application file in the local arrays
            const fileIndex = this.applicationFiles.findIndex(f => f.id === this.selectedApplicationFileForStatus!.id);
            if (fileIndex !== -1) {
              this.applicationFiles[fileIndex].taxStamp = formValue.status as 'NOT_PAID' | 'PENDING' | 'PAID';
            } else {
              const archivedIndex = this.archivedApplicationFiles.findIndex(f => f.id === this.selectedApplicationFileForStatus!.id);
              if (archivedIndex !== -1) {
                this.archivedApplicationFiles[archivedIndex].taxStamp = formValue.status as 'NOT_PAID' | 'PENDING' | 'PAID';
              }
            }
          }
          
          this.success = 'Statut du timbre fiscal mis à jour avec succès!';
          this.loading = false;
          
          setTimeout(() => {
            this.closeTaxStampModal();
          }, 1500);
        },
        error: (error) => {
          console.error('Error updating tax stamp status:', error);
          this.error = 'Erreur lors de la mise à jour du statut du timbre fiscal: ' + error;
          this.loading = false;
        }
      });
    } else {
      this.markFormGroupTouched(this.taxStampForm);
    }
  }
  // Submit medical visit status update
  onSubmitMedicalVisit(): void {
    if (this.medicalVisitForm.valid && this.selectedApplicationFileForStatus) {
      const formValue = this.medicalVisitForm.value;
      
      this.loading = true;
      this.error = '';
      
      this.applicationFileService.updateMedicalVisitStatus(
        this.selectedApplicationFileForStatus.id, 
        formValue.status
      ).subscribe({
        next: (message) => {
          // Update the local application file object
          if (this.selectedApplicationFileForStatus) {
            this.selectedApplicationFileForStatus.medicalVisit = formValue.status as 'NOT_REQUESTED' | 'PENDING' | 'COMPLETED';
            
            // Update the application file in the local arrays
            const fileIndex = this.applicationFiles.findIndex(f => f.id === this.selectedApplicationFileForStatus!.id);
            if (fileIndex !== -1) {
              this.applicationFiles[fileIndex].medicalVisit = formValue.status as 'NOT_REQUESTED' | 'PENDING' | 'COMPLETED';
            } else {
              const archivedIndex = this.archivedApplicationFiles.findIndex(f => f.id === this.selectedApplicationFileForStatus!.id);
              if (archivedIndex !== -1) {
                this.archivedApplicationFiles[archivedIndex].medicalVisit = formValue.status as 'NOT_REQUESTED' | 'PENDING' | 'COMPLETED';
              }
            }
          }
          
          this.success = 'Statut de la visite médicale mis à jour avec succès!';
          this.loading = false;
          
          setTimeout(() => {
            this.closeMedicalVisitModal();
          }, 1500);
        },
        error: (error) => {
          console.error('Error updating medical visit status:', error);
          this.error = 'Erreur lors de la mise à jour du statut de la visite médicale: ' + error;
          this.loading = false;
        }
      });
    } else {
      this.markFormGroupTouched(this.medicalVisitForm);
    }
  }

  // Cancel application file
  onCancelApplicationFile(): void {
    if (this.selectedApplicationFileForCancellation) {
      this.loading = true;
      this.error = '';
      
      this.applicationFileService.cancelApplicationFile(this.selectedApplicationFileForCancellation.id).subscribe({
        next: (message) => {
          this.success = 'Dossier de candidature annulé avec succès!';
          this.loading = false;
          
          // Reload candidate details to get updated data
          if (this.candidate) {
            this.loadCandidateDetails(this.candidate.cin);
          }
          
          setTimeout(() => {
            this.closeCancelApplicationFileModal();
          }, 1500);
        },
        error: (error) => {
          console.error('Error cancelling application file:', error);
          
          // Handle HTTP error responses
          let errorMessage = 'Erreur lors de l\'annulation du dossier';
          if (error?.status === 400) {
            errorMessage = error.error || 'Violation des règles métier';
          } else if (error?.status === 404) {
            errorMessage = 'Dossier de candidature introuvable';
          } else if (error?.status === 500) {
            errorMessage = error.error || 'Erreur serveur interne';
          } else if (typeof error?.error === 'string') {
            errorMessage = error.error;
          } else if (error?.error?.message) {
            errorMessage = error.error.message;
          } else if (error?.message) {
            errorMessage = error.message;
          }
          
          this.error = errorMessage;
          this.loading = false;
        }
      });
    }
  }

  // Submit hours update
  onSubmitEditHours(): void {
    if (this.editHoursForm.valid && this.selectedApplicationFileForHours && this.editingHoursType) {
      const newHours = this.editHoursForm.value.hours;
      
      this.loading = true;
      this.error = '';
      
      const updateObservable = this.editingHoursType === 'theoretical' 
        ? this.candidateService.updateTheoreticalHours(this.selectedApplicationFileForHours.id, newHours)
        : this.candidateService.updatePracticalHours(this.selectedApplicationFileForHours.id, newHours);
      
      updateObservable.subscribe({
        next: (message) => {
          console.log('Hours update success:', message);
          
          // Update the local application file object
          if (this.selectedApplicationFileForHours && this.editingHoursType) {
            if (this.editingHoursType === 'theoretical') {
              this.selectedApplicationFileForHours.theoreticalHoursCompleted = newHours;
            } else {
              this.selectedApplicationFileForHours.practicalHoursCompleted = newHours;
            }
            
            // Update the application file in the local arrays
            const fileIndex = this.applicationFiles.findIndex(f => f.id === this.selectedApplicationFileForHours!.id);
            if (fileIndex !== -1) {
              if (this.editingHoursType === 'theoretical') {
                this.applicationFiles[fileIndex].theoreticalHoursCompleted = newHours;
              } else {
                this.applicationFiles[fileIndex].practicalHoursCompleted = newHours;
              }
            } else {
              const archivedIndex = this.archivedApplicationFiles.findIndex(f => f.id === this.selectedApplicationFileForHours!.id);
              if (archivedIndex !== -1) {
                if (this.editingHoursType === 'theoretical') {
                  this.archivedApplicationFiles[archivedIndex].theoreticalHoursCompleted = newHours;
                } else {
                  this.archivedApplicationFiles[archivedIndex].practicalHoursCompleted = newHours;
                }
              }
            }
          }
          
          const hoursTypeLabel = this.editingHoursType === 'theoretical' ? 'théoriques' : 'pratiques';
          this.modalSuccess = `Heures ${hoursTypeLabel} mises à jour avec succès!`;
          this.loading = false;
          
          // Auto-close modal after showing success message
          setTimeout(() => {
            this.closeEditHoursModal();
          }, 1500);
        },
        error: (error) => {
          console.error('Error updating hours - Full error object:', error);
          console.error('Error status:', error?.status);
          console.error('Error error:', error?.error);
          console.error('Error message:', error?.message);
          
          // Check if it's actually a successful response that's being treated as an error
          if (error?.status === 200 || (error?.error && typeof error.error === 'string' && error.error.includes('successfully'))) {
            // This is actually a success - Angular sometimes treats text responses as errors
            console.log('Treating as success despite error callback');
            
            // Update the local data
            if (this.selectedApplicationFileForHours && this.editingHoursType) {
              if (this.editingHoursType === 'theoretical') {
                this.selectedApplicationFileForHours.theoreticalHoursCompleted = newHours;
              } else {
                this.selectedApplicationFileForHours.practicalHoursCompleted = newHours;
              }
              
              // Update the application file in the local arrays
              const fileIndex = this.applicationFiles.findIndex(f => f.id === this.selectedApplicationFileForHours!.id);
              if (fileIndex !== -1) {
                if (this.editingHoursType === 'theoretical') {
                  this.applicationFiles[fileIndex].theoreticalHoursCompleted = newHours;
                } else {
                  this.applicationFiles[fileIndex].practicalHoursCompleted = newHours;
                }
              } else {
                const archivedIndex = this.archivedApplicationFiles.findIndex(f => f.id === this.selectedApplicationFileForHours!.id);
                if (archivedIndex !== -1) {
                  if (this.editingHoursType === 'theoretical') {
                    this.archivedApplicationFiles[archivedIndex].theoreticalHoursCompleted = newHours;
                  } else {
                    this.archivedApplicationFiles[archivedIndex].practicalHoursCompleted = newHours;
                  }
                }
              }
            }
            
            const hoursTypeLabel = this.editingHoursType === 'theoretical' ? 'théoriques' : 'pratiques';
            this.modalSuccess = `Heures ${hoursTypeLabel} mises à jour avec succès!`;
            this.loading = false;
            
            // Auto-close modal after showing success message
            setTimeout(() => {
              this.closeEditHoursModal();
            }, 1500);
            return;
          }
          
          // Handle actual errors
          let errorMessage = 'Erreur lors de la mise à jour des heures';
          if (error?.status === 400) {
            errorMessage = error.error || 'Données invalides';
          } else if (error?.status === 404) {
            errorMessage = 'Dossier de candidature introuvable';
          } else if (error?.status === 500) {
            errorMessage = error.error || 'Erreur serveur interne';
          } else if (typeof error?.error === 'string') {
            errorMessage = error.error;
          } else if (error?.error?.message) {
            errorMessage = error.error.message;
          } else if (error?.message) {
            errorMessage = error.message;
          }
          
          this.modalError = errorMessage;
          this.loading = false;
        }
      });
    } else {
      this.markFormGroupTouched(this.editHoursForm);
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
  
  // Form validation helper methods
  isFieldValid(form: FormGroup, fieldName: string): boolean {
    const field = form.get(fieldName);
    return field ? field.valid && (field.dirty || field.touched) : false;
  }

  isFieldInvalid(form: FormGroup, fieldName: string): boolean {
    const field = form.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  getFieldError(form: FormGroup, fieldName: string): string {
    const field = form.get(fieldName);
    if (field && field.errors && (field.dirty || field.touched)) {
      if (field.errors['required']) {
        return 'Ce champ est requis';
      }
      if (field.errors['min']) {
        return `La valeur minimale est ${field.errors['min'].min}`;
      }
    }
    return '';
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }
  
  goBack(): void {
    this.router.navigate(['/app/candidates']);
  }  // Convert ApplicationFileDTO to ApplicationFile
  private convertToApplicationFile(dto: ApplicationFileDTO): ApplicationFile {
    const converted: ApplicationFile = {
      id: dto.id,
      category: dto.categoryCode,
      status: dto.isActive ? (dto.status as any) : 'EXPIRED',
      startingDate: dto.startingDate,
      practicalHoursCompleted: dto.practicalHoursCompleted,
      theoreticalHoursCompleted: dto.theoreticalHoursCompleted,
      fileNumber: dto.fileNumber,
      taxStamp: dto.taxStamp as 'NOT_PAID' | 'PENDING' | 'PAID',
      medicalVisit: dto.medicalVisit,
      // Payment and exams will be loaded separately
      payment: undefined,
      exams: []
    };
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

  // Get tax stamp status label
  getTaxStampLabel(status: string | undefined): string {
    switch (status) {
      case 'PAID':
        return 'Payé';
      case 'PENDING':
        return 'En attente';
      case 'NOT_PAID':
      default:
        return 'Non payé';
    }
  }

  // Get tax stamp status color
  getTaxStampColor(status: string | undefined): string {
    switch (status) {
      case 'PAID':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'NOT_PAID':
      default:
        return 'danger';
    }
  }

  // Get medical visit status label
  getMedicalVisitLabel(status: string | undefined): string {
    switch (status) {
      case 'COMPLETED':
        return 'Validée';
      case 'PENDING':
        return 'En attente';
      case 'NOT_REQUESTED':
      default:
        return 'Pas encore demandé';
    }
  }

  // Get medical visit status color
  getMedicalVisitColor(status: string | undefined): string {
    switch (status) {
      case 'COMPLETED':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'NOT_REQUESTED':
      default:
        return 'secondary';
    }
  }

  // Load exam data for all application files
  private loadExamDataForFiles(files: ApplicationFile[]): void {
    files.forEach(file => {
      this.examService.getExamsByApplicationFile(file.id).subscribe({
        next: (examDTOs) => {
          file.exams = examDTOs.map(dto => this.convertToExam(dto, file.category));
        },
        error: (error) => {
          console.error(`Error loading exams for application file ${file.id}:`, error);
          // Set empty exams array if no exams exist
          file.exams = [];
        }
      });
    });
  }
  // Convert ExamDTO to Exam
  private convertToExam(dto: ExamDTO, category: string): Exam {
    return {
      id: dto.id,
      examType: dto.examType, // Both use 'THEORY' | 'PRACTICAL'
      category: category,
      attemptNumber: dto.attemptNumber,
      date: dto.date,
      status: dto.status
    };
  }

  // Handle exam status edit with restrictions
  handleExamStatusEdit(exam: Exam): void {
    if (exam.status === 'PASSED' || exam.status === 'FAILED') {
      // Show message for completed exams
      const statusText = exam.status === 'PASSED' ? 'réussi' : 'échoué';
      this.error = `Le statut d'un examen ${statusText} ne peut pas être modifié.`;
      
      // Clear the error message after 3 seconds
      setTimeout(() => {
        this.error = '';
      }, 3000);
    } else {
      // Open modal for scheduled exams
      this.openExamStatusModal(exam);
    }
  }

  // Get tooltip text for exam edit button
  getExamEditTooltip(exam: Exam): string {
    if (exam.status === 'PASSED' || exam.status === 'FAILED') {
      const statusText = exam.status === 'PASSED' ? 'réussi' : 'échoué';
      return `Le statut d'un examen ${statusText} ne peut pas être modifié`;
    }
    return 'Modifier le statut';
  }  // Get detailed remaining attempts info for display
  getRemainingAttemptsInfo(file: ApplicationFile | null): string {
    if (!file || !file.exams) return 'Tentatives restantes: 3';
    
    const totalExams = file.exams.length;
    const failedExams = file.exams.filter(e => e.status === 'FAILED').length;
    
    if (failedExams >= 2) {
      return 'Dossier échoué - 2 échecs ou plus';
    }
    
    const remaining = Math.max(0, 3 - totalExams);
    return `Tentatives restantes: ${remaining} sur 3`;
  }

  // Get current attempt counts for debugging
  getAttemptCounts(file: ApplicationFile | null): { theory: number, practical: number } {
    if (!file || !file.exams) return { theory: 0, practical: 0 };
    
    const theoryAttempts = file.exams.filter(e => e.examType === 'THEORY').length;
    const practicalAttempts = file.exams.filter(e => e.examType === 'PRACTICAL').length;
    
    return { theory: theoryAttempts, practical: practicalAttempts };
  }
}