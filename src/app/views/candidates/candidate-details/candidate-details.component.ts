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
  BadgeComponent,
  SpinnerComponent,
  AlertComponent,
  DropdownComponent,
  DropdownToggleDirective,
  DropdownMenuDirective,
  DropdownItemDirective,  TableDirective,
  ProgressComponent,
  ProgressBarComponent,
  TemplateIdDirective
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';

interface CandidateDetails {
  cin: string;
  firstName: string;
  lastName: string;
  address?: string;
  city?: string;
  email?: string;
  gender: 'M' | 'F';
  gsm: string;
  isActive: boolean;
  birthDay: string;
  birthPlace?: string;
  startingDate?: string;
  instructor?: Instructor;
  vehicle?: Vehicle;
}

interface Instructor {
  cin: string;
  firstName: string;
  lastName: string;
  email?: string;
  gsm: string;
  startingDate: string;
}

interface Vehicle {
  immatriculation: string;
  vehicleBrand: string;
  vehicleType: string;
  fuelType: string;
  category: string;
}

interface ApplicationFile {
  id: number;
  category: string;
  status: 'ACTIVE' | 'EXPIRED';
  startingDate: string;
  practicalHoursCompleted: number;
  theoreticalHoursCompleted: number;
  totalAmount: number;
  paidAmount: number;
}

interface Exam {
  id: number;
  examType: 'THEORETICAL' | 'PRACTICAL';
  category: string;
  attemptNumber: number;
  date: string;
  status: 'PASSED' | 'FAILED' | 'SCHEDULED';
}

interface PaymentInstallment {
  id: number;
  installmentNumber: number;
  amount: number;
  date: string;
  status: 'PENDING' | 'PAID' | 'OVERDUE';
}

interface Payment {
  totalAmount: number;
  paidAmount: number;
  status: 'PENDING' | 'PARTIAL' | 'PAID';
  installments: PaymentInstallment[];
}

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
    SpinnerComponent,
    AlertComponent,
    IconDirective,
    DropdownComponent,
    DropdownToggleDirective,
    DropdownMenuDirective,    DropdownItemDirective,
    TableDirective,
    ProgressComponent,
    ProgressBarComponent,
    TemplateIdDirective
  ]
})
export class CandidateDetailsComponent implements OnInit {
  candidate!: CandidateDetails;
  applicationFiles: ApplicationFile[] = [];
  exams: Exam[] = [];
  payment!: Payment;
  
  loading = false;
  error = '';
  success = '';
  
  // Available data for dropdowns
  availableInstructors: Instructor[] = [];
  availableVehicles: Vehicle[] = [];
  categories = [
    { code: 'AM', description: 'Cyclomoteur ≤4kw/50cm³/50km/h' },
    { code: 'A1', description: 'Motocycle ≤125cm³ et/ou ≤15kw' },
    { code: 'A', description: 'Motocycle >125cm³ avec puissance ≤73.6kw' },
    { code: 'B', description: 'Véhicules transport personnes ≤9 places' },
    { code: 'C', description: 'Véhicules transport marchandises PTAC >3500kg' },
    { code: 'D', description: 'Véhicules transport personnes >8 places' }
  ];
  
  // Modal states
  showInstructorModal = false;
  showVehicleModal = false;
  showApplicationFileModal = false;
  showExamModal = false;
  showPaymentModal = false;
  
  // Forms
  instructorForm: FormGroup;
  vehicleForm: FormGroup;
  applicationFileForm: FormGroup;
  examForm: FormGroup;
  paymentForm: FormGroup;
  
  // Active tab for application files
  activeTab: string = '';
    // Tab change handler
  onTabChange(itemKey: string | number | undefined): void {
    if (typeof itemKey === 'string') {
      this.activeTab = itemKey;
    }
  }
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.instructorForm = this.createInstructorForm();
    this.vehicleForm = this.createVehicleForm();
    this.applicationFileForm = this.createApplicationFileForm();
    this.examForm = this.createExamForm();
    this.paymentForm = this.createPaymentForm();
  }
  
  ngOnInit(): void {
    const cin = this.route.snapshot.params['cin'];
    if (cin) {
      this.loadCandidateDetails(cin);
    } else {
      this.router.navigate(['/app/candidates']);
    }
  }
  
  loadCandidateDetails(cin: string): void {
    this.loading = true;
    
    // Mock data - replace with actual service calls
    setTimeout(() => {
      this.candidate = {
        cin: cin,
        firstName: 'Ahmed',
        lastName: 'Alami',
        address: '123 Rue Mohammed V',
        city: 'CASABLANCA',
        email: 'ahmed.alami@email.com',
        gender: 'M',
        gsm: '+212601234567',
        isActive: true,
        birthDay: '1995-03-15',
        birthPlace: 'Casablanca',
        startingDate: '2024-01-15',
        instructor: {
          cin: 'I123456789',
          firstName: 'Ahmed',
          lastName: 'Bennani',
          email: 'ahmed.bennani@autoecole.ma',
          gsm: '0612345678',
          startingDate: '2023-01-15'
        },
        vehicle: {
          immatriculation: '123-A-45',
          vehicleBrand: 'Toyota',
          vehicleType: 'Sedan',
          fuelType: 'Gasoline',
          category: 'B'
        }
      };
        this.applicationFiles = [
        {
          id: 1,
          category: 'B',
          status: 'ACTIVE',
          startingDate: '2024-01-15',
          practicalHoursCompleted: 15,
          theoreticalHoursCompleted: 20,
          totalAmount: 5000,
          paidAmount: 3000
        },
        {
          id: 2,
          category: 'B',
          status: 'EXPIRED',
          startingDate: '2023-06-10',
          practicalHoursCompleted: 12,
          theoreticalHoursCompleted: 18,
          totalAmount: 4500,
          paidAmount: 4500
        },
        {
          id: 3,
          category: 'A',
          status: 'ACTIVE',
          startingDate: '2024-02-01',
          practicalHoursCompleted: 8,
          theoreticalHoursCompleted: 12,
          totalAmount: 6000,
          paidAmount: 2000
        }
      ];
        this.exams = [
        {
          id: 1,
          examType: 'THEORETICAL',
          category: 'B',
          attemptNumber: 1,
          date: '2024-03-15',
          status: 'PASSED'
        },
        {
          id: 2,
          examType: 'PRACTICAL',
          category: 'B',
          attemptNumber: 1,
          date: '2024-03-20',
          status: 'FAILED'
        },
        {
          id: 3,
          examType: 'THEORETICAL',
          category: 'A',
          attemptNumber: 1,
          date: '2024-03-25',
          status: 'SCHEDULED'
        }
      ];
      
      this.payment = {
        totalAmount: 5000,
        paidAmount: 3000,
        status: 'PARTIAL',
        installments: [
          {
            id: 1,
            installmentNumber: 1,
            amount: 1500,
            date: '2024-01-15',
            status: 'PAID'
          },
          {
            id: 2,
            installmentNumber: 2,
            amount: 1500,
            date: '2024-02-15',
            status: 'PAID'
          },
          {
            id: 3,
            installmentNumber: 3,
            amount: 1000,
            date: '2024-03-15',
            status: 'PENDING'
          },
          {
            id: 4,
            installmentNumber: 4,
            amount: 1000,
            date: '2024-04-15',
            status: 'PENDING'
          }
        ]
      };
      
      this.availableInstructors = [
        {
          cin: 'I123456789',
          firstName: 'Ahmed',
          lastName: 'Bennani',
          email: 'ahmed.bennani@autoecole.ma',
          gsm: '0612345678',
          startingDate: '2023-01-15'
        },
        {
          cin: 'I987654321',
          firstName: 'Fatima',
          lastName: 'Alaoui',
          email: 'fatima.alaoui@autoecole.ma',
          gsm: '0687654321',
          startingDate: '2023-02-01'
        }
      ];
      
      this.availableVehicles = [
        {
          immatriculation: '123-A-45',
          vehicleBrand: 'Toyota',
          vehicleType: 'Sedan',
          fuelType: 'Gasoline',
          category: 'B'
        },
        {
          immatriculation: '456-B-78',
          vehicleBrand: 'Honda',
          vehicleType: 'Motorcycle',
          fuelType: 'Gasoline',
          category: 'A'
        }
      ];
        // Set active tab to first category with application files
      if (this.applicationFiles.length > 0) {
        this.activeTab = this.applicationFiles[0].category;
      } else {
        this.activeTab = '';
      }
      
      this.loading = false;
    }, 1000);
  }
  
  createInstructorForm(): FormGroup {
    return this.fb.group({
      instructorCin: ['', Validators.required]
    });
  }
  
  createVehicleForm(): FormGroup {
    return this.fb.group({
      vehicleImmat: ['', Validators.required]
    });
  }
  
  createApplicationFileForm(): FormGroup {
    return this.fb.group({
      category: ['', Validators.required],
      totalAmount: ['', [Validators.required, Validators.min(1)]],
      paidAmount: ['', [Validators.required, Validators.min(0)]]
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
  }
  // Get unique categories from application files
  getCategories(): string[] {
    return [...new Set(this.applicationFiles.map(file => file.category))];
  }
  // Get application files by category
  getApplicationFilesByCategory(category: string): ApplicationFile[] {
    return this.applicationFiles.filter(file => file.category === category);
  }
  
  // Get exams by category
  getExamsByCategory(category: string): Exam[] {
    return this.exams.filter(exam => exam.category === category);
  }
  
  // Check if candidate is eligible for exams in a category
  isEligibleForExams(category: string): boolean {
    const files = this.getApplicationFilesByCategory(category);
    const activeFile = files.find(file => file.status === 'ACTIVE');
    
    return activeFile ? 
      activeFile.theoreticalHoursCompleted >= 20 && 
      activeFile.practicalHoursCompleted >= 20 : false;
  }
  
  // Get remaining exam attempts for a category
  getRemainingAttempts(category: string): number {
    const categoryExams = this.getExamsByCategory(category);
    return Math.max(0, 3 - categoryExams.length);
  }
  
  // Modal methods
  openInstructorModal(): void {
    this.instructorForm.patchValue({
      instructorCin: this.candidate.instructor?.cin || ''
    });
    this.showInstructorModal = true;
  }
  
  openVehicleModal(): void {
    this.vehicleForm.patchValue({
      vehicleImmat: this.candidate.vehicle?.immatriculation || ''
    });
    this.showVehicleModal = true;
  }
  
  openApplicationFileModal(): void {
    this.applicationFileForm.reset();
    this.showApplicationFileModal = true;
  }
  
  openExamModal(category: string): void {
    this.examForm.patchValue({ category });
    this.examForm.patchValue({ examType: '', date: '', status: '' });
    this.showExamModal = true;
  }
  
  openPaymentModal(): void {
    this.paymentForm.reset();
    this.showPaymentModal = true;
  }
  
  // Close modals
  closeInstructorModal(): void {
    this.showInstructorModal = false;
    this.instructorForm.reset();
    this.error = '';
    this.success = '';
  }
  
  closeVehicleModal(): void {
    this.showVehicleModal = false;
    this.vehicleForm.reset();
    this.error = '';
    this.success = '';
  }
  
  closeApplicationFileModal(): void {
    this.showApplicationFileModal = false;
    this.applicationFileForm.reset();
    this.error = '';
    this.success = '';
  }
  
  closeExamModal(): void {
    this.showExamModal = false;
    this.examForm.reset();
    this.error = '';
    this.success = '';
  }
  
  closePaymentModal(): void {
    this.showPaymentModal = false;
    this.paymentForm.reset();
    this.error = '';
    this.success = '';
  }
  
  // Submit methods
  onSubmitInstructor(): void {
    if (this.instructorForm.valid) {
      const instructorCin = this.instructorForm.value.instructorCin;
      const instructor = this.availableInstructors.find(i => i.cin === instructorCin);
      
      this.candidate.instructor = instructor || undefined;
      this.success = 'Moniteur affecté avec succès!';
      
      setTimeout(() => {
        this.closeInstructorModal();
      }, 1500);
    }
  }
  
  onSubmitVehicle(): void {
    if (this.vehicleForm.valid) {
      const vehicleImmat = this.vehicleForm.value.vehicleImmat;
      const vehicle = this.availableVehicles.find(v => v.immatriculation === vehicleImmat);
      
      this.candidate.vehicle = vehicle || undefined;
      this.success = 'Véhicule affecté avec succès!';
      
      setTimeout(() => {
        this.closeVehicleModal();
      }, 1500);
    }
  }
  
  onSubmitApplicationFile(): void {
    if (this.applicationFileForm.valid) {
      const formValue = this.applicationFileForm.value;
      
      const newFile: ApplicationFile = {
        id: this.applicationFiles.length + 1,
        category: formValue.category,
        status: 'ACTIVE',
        startingDate: new Date().toISOString().split('T')[0],
        practicalHoursCompleted: 0,
        theoreticalHoursCompleted: 0,
        totalAmount: formValue.totalAmount,
        paidAmount: formValue.paidAmount
      };
      
      this.applicationFiles.push(newFile);
      this.success = 'Dossier de candidature créé avec succès!';
      
      // Set as active tab if it's the first file
      if (this.getCategories().length === 1) {
        this.activeTab = newFile.category;
      }
      
      setTimeout(() => {
        this.closeApplicationFileModal();
      }, 1500);
    }
  }
  
  onSubmitExam(): void {
    if (this.examForm.valid) {
      const formValue = this.examForm.value;
      const categoryExams = this.getExamsByCategory(formValue.category);
      
      const newExam: Exam = {
        id: this.exams.length + 1,
        examType: formValue.examType,
        category: formValue.category,
        attemptNumber: categoryExams.length + 1,
        date: formValue.date,
        status: formValue.status
      };
      
      this.exams.push(newExam);
      this.success = 'Examen ajouté avec succès!';
      
      setTimeout(() => {
        this.closeExamModal();
      }, 1500);
    }
  }
  
  onSubmitPayment(): void {
    if (this.paymentForm.valid) {
      const formValue = this.paymentForm.value;
      
      const newInstallment: PaymentInstallment = {
        id: this.payment.installments.length + 1,
        installmentNumber: this.payment.installments.length + 1,
        amount: formValue.amount,
        date: formValue.date,
        status: 'PAID'
      };
      
      this.payment.installments.push(newInstallment);
      this.payment.paidAmount += formValue.amount;
      
      if (this.payment.paidAmount >= this.payment.totalAmount) {
        this.payment.status = 'PAID';
      } else if (this.payment.paidAmount > 0) {
        this.payment.status = 'PARTIAL';
      }
      
      this.success = 'Paiement enregistré avec succès!';
      
      setTimeout(() => {
        this.closePaymentModal();
      }, 1500);
    }
  }
  
  // Remove instructor
  removeInstructor(): void {
    this.candidate.instructor = undefined;
    this.success = 'Moniteur retiré avec succès!';
    setTimeout(() => this.success = '', 3000);
  }
  
  // Remove vehicle
  removeVehicle(): void {
    this.candidate.vehicle = undefined;
    this.success = 'Véhicule retiré avec succès!';
    setTimeout(() => this.success = '', 3000);
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
  
  getPaymentProgress(): number {
    return (this.payment.paidAmount / this.payment.totalAmount) * 100;
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
  }
}