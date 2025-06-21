import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { 
  CardComponent, 
  CardHeaderComponent, 
  CardBodyComponent,
  ButtonDirective,
  TableDirective,
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
  DropdownItemDirective,
  DropdownDividerDirective
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { Candidate, CandidateListDTO, CandidateSearchDTO, PageableResponse } from '../../../models/candidat.model';
import { CandidateService } from '../../../services/candidat.service';

@Component({
  selector: 'app-candidate-management',
  templateUrl: './candidate-management.component.html',
  styleUrls: ['./candidate-management.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    ButtonDirective,
    TableDirective,
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
    DropdownMenuDirective,
    DropdownItemDirective,
    DropdownDividerDirective
  ]
})
export class CandidateManagementComponent implements OnInit {
  @ViewChild('candidateModal') candidateModal!: TemplateRef<any>;
  @ViewChild('deleteModal') deleteModal!: TemplateRef<any>;
  candidates: CandidateListDTO[] = [];
  candidateForm: FormGroup;
  searchForm: FormGroup;
  loading = false;
  saving = false;
  deleting = false;
  error = '';
  success = '';
  
  // Pagination
  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;
    // Sorting
  sortBy = 'startingDate';
  sortDirection = 'desc';
  
  // Modals
  showCandidateModal = false;
  showDeleteModal = false;
  candidateToDelete: CandidateListDTO | null = null;
  
  // Edit mode
  isEditMode = false;
  candidateToEdit: CandidateListDTO | null = null;

  // Filters
  showActiveOnly = false;

  // Liste des villes marocaines
  moroccanCities = [
    'AGADIR',
    'AL HOCEIMA',
    'BENI MELLAL',
    'BERKANE',
    'BERRECHID',
    'CASABLANCA',
    'ELJADIDA',
    'ERRACHIDIA',
    'ESSAOUIRA',
    'FES',
    'INEZGANE',
    'KENITRA',
    'KHEMISSET',
    'KHENIFRA',
    'KHOURIBGA',
    'LAAYOUNE',
    'MARRAKECH',
    'MEKNES',
    'MOHAMMADIA',
    'NADOR',
    'OUJDA',
    'OUARZAZATE',
    'OUEZZANE',
    'RABAT',
    'SAFI',
    'SALE',
    'SEFROU',
    'SETTAT',
    'SIDI KACEM',
    'TANGER',
    'TAZA',
    'TEMARA',
    'TETOUAN',
    'TIFLET'
  ];
  // Filtered cities for search
  filteredCities: string[] = [];
  showCityDropdown = false;
  
  // Filtered cities for search form
  filteredSearchCities: string[] = [];
  showSearchCityDropdown = false;

  constructor(
    private candidateService: CandidateService,
    private fb: FormBuilder
  ) {
    this.candidateForm = this.createCandidateForm();
    this.searchForm = this.createSearchForm();
  }
  ngOnInit(): void {
    // Set default value for isActive to show "Tous"
    this.searchForm.patchValue({ isActive: '' });
    this.loadCandidates();
  }
  createCandidateForm(): FormGroup {
    return this.fb.group({
      cin: ['', [Validators.required, Validators.pattern(/^([A-Z]\d{5,6}|[A-Z]{2}\d{6})$/)]],
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      address: [''],
      city: [''],
      email: ['', [Validators.email]],
      gender: ['', Validators.required],
      gsm: ['', [Validators.required, Validators.pattern(/^(\+212|0)[567]\d{8}$/)]],
      isActive: [true],
      birthDay: ['', Validators.required],
      birthPlace: ['']
    });
  }
  createSearchForm(): FormGroup {
    return this.fb.group({
      firstName: [''],
      lastName: [''],
      cin: [''],
      city: [''],
      email: [''],
      isActive: [''] // Set to empty string for "Tous" option
    });
  }

  loadCandidates(): void {
    this.loading = true;
    this.error = '';

    const searchCriteria = this.getSearchCriteria();
    const hasSearchCriteria = Object.values(searchCriteria).some(value => 
      value !== null && value !== undefined && value !== ''
    );

    let request;
    if (hasSearchCriteria) {
      request = this.candidateService.searchCandidates(
        searchCriteria, this.currentPage, this.pageSize, this.sortBy, this.sortDirection
      );
    } else if (this.showActiveOnly) {
      request = this.candidateService.getActiveCandidates(
        this.currentPage, this.pageSize, this.sortBy, this.sortDirection
      );
    } else {
      request = this.candidateService.getAllCandidates(
        this.currentPage, this.pageSize, this.sortBy, this.sortDirection
      );
    }    request.subscribe({
      next: (response: PageableResponse<CandidateListDTO>) => {
        this.candidates = response.content;
        this.totalPages = response.totalPages;
        this.totalElements = response.totalElements;
        this.loading = false;
      },
      error: (error) => {
        this.error = error;
        this.loading = false;
      }
    });
  }
  getSearchCriteria(): CandidateSearchDTO {
    const formValue = this.searchForm.value;
    return {
      firstName: formValue.firstName?.trim() || undefined,
      lastName: formValue.lastName?.trim() || undefined,
      cin: formValue.cin?.trim() || undefined,
      city: formValue.city?.trim() || undefined,
      email: formValue.email?.trim() || undefined,
      isActive: formValue.isActive === '' ? undefined : formValue.isActive
    };
  }
  onSearch(): void {
    console.log('Search triggered with criteria:', this.getSearchCriteria());
    this.currentPage = 0;
    this.loadCandidates();
  }
  clearSearch(): void {
    this.searchForm.reset();
    this.searchForm.patchValue({ isActive: '' }); // Set to empty string for "Tous"
    this.currentPage = 0;
    this.loadCandidates();
  }

  toggleActiveFilter(): void {
    this.showActiveOnly = !this.showActiveOnly;
    this.currentPage = 0;
    this.loadCandidates();
  }

  sort(column: string): void {
    if (this.sortBy === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = column;
      this.sortDirection = 'asc';
    }
    this.currentPage = 0;
    this.loadCandidates();
  }

  getSortIcon(column: string): string {
    if (this.sortBy !== column) return 'cilSwapVertical';
    return this.sortDirection === 'asc' ? 'cilSortAscending' : 'cilSortDescending';
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadCandidates();
    }
  }

  changePageSize(size: number): void {
    this.pageSize = size;
    this.currentPage = 0;
    this.loadCandidates();
  }

  openAddCandidateModal(): void {
    this.isEditMode = false;
    this.candidateToEdit = null;
    this.candidateForm.reset();
    this.candidateForm.patchValue({ isActive: true, gender: 'M' });
    this.showCandidateModal = true;
  }
  openEditCandidateModal(candidate: CandidateListDTO): void {
    this.isEditMode = true;
    this.candidateToEdit = candidate;
    
    // Load full candidate details
    this.loading = true;
    this.candidateService.getCandidateByCin(candidate.cin).subscribe({
      next: (fullCandidate) => {
        this.candidateForm.patchValue({
          cin: fullCandidate.cin,
          firstName: fullCandidate.firstName,
          lastName: fullCandidate.lastName,
          address: fullCandidate.address || '',
          city: fullCandidate.city || '',
          email: fullCandidate.email || '',
          gender: fullCandidate.gender,
          gsm: fullCandidate.gsm,
          isActive: fullCandidate.isActive,
          birthDay: fullCandidate.birthDay,
          birthPlace: fullCandidate.birthPlace || ''
        });
        
        // Disable CIN field for editing
        this.candidateForm.get('cin')?.disable();
        
        this.loading = false;
        this.showCandidateModal = true;
      },
      error: (error) => {
        this.error = error;
        this.loading = false;
      }
    });
  }  closeCandidateModal(): void {
    this.showCandidateModal = false;
    this.candidateForm.reset();
    this.candidateForm.get('cin')?.enable(); // Re-enable CIN field
    this.error = '';
    this.success = '';
    this.isEditMode = false;
    this.candidateToEdit = null;
  }  onSubmitCandidate(): void {
    if (!this.isFormInvalid()) {
      this.saving = true;
      this.error = '';

      let candidate: Candidate;
      
      if (this.isEditMode) {
        // Include disabled CIN field value for edit mode
        candidate = {
          ...this.candidateForm.getRawValue(), // getRawValue() includes disabled fields
          cin: this.candidateToEdit!.cin // Ensure we use the original CIN
        };
      } else {
        candidate = this.candidateForm.value;
      }

      // Additional validation
      if (candidate.email && !this.candidateService.validateEmail(candidate.email)) {
        this.error = 'Format email invalide';
        this.saving = false;
        return;
      }

      if (!this.candidateService.validateGsm(candidate.gsm)) {
        this.error = 'Format téléphone invalide (ex: +212601234567 ou 0601234567)';
        this.saving = false;
        return;
      }

      const operation = this.isEditMode 
        ? this.candidateService.updateCandidate(this.candidateToEdit!.cin, candidate)
        : this.candidateService.saveCandidate(candidate);

      operation.subscribe({
        next: (savedCandidate) => {
          this.success = this.isEditMode 
            ? 'Candidat modifié avec succès!' 
            : 'Candidat ajouté avec succès!';
          this.saving = false;
          setTimeout(() => {
            this.closeCandidateModal();
            this.loadCandidates();
          }, 1500);
        },
        error: (error) => {
          this.error = error;
          this.saving = false;
        }
      });
    } else {
      this.markFormGroupTouched(this.candidateForm);
    }
  }
  openDeleteModal(candidate: CandidateListDTO): void {
    this.candidateToDelete = candidate;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.candidateToDelete = null;
    this.error = '';
  }

  confirmDelete(): void {
    if (this.candidateToDelete) {
      this.deleting = true;
      this.error = '';

      this.candidateService.deleteCandidate(this.candidateToDelete.cin).subscribe({
        next: () => {
          this.deleting = false;
          this.closeDeleteModal();
          this.loadCandidates();
        },
        error: (error) => {
          this.error = error;
          this.deleting = false;
        }
      });
    }
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
      if (field.errors['email']) {
        return 'Format email invalide';
      }      if (field.errors['pattern']) {
        if (fieldName === 'cin') {
          return 'Format CIN invalide (ex: A12345, A123456 ou AB123456)';
        }
        if (fieldName === 'gsm') {
          return 'Format téléphone invalide (ex: +212601234567)';
        }
      }
      if (field.errors['minlength']) {
        return `Minimum ${field.errors['minlength'].requiredLength} caractères`;
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

  isFormInvalid(): boolean {
    if (this.isEditMode) {
      // In edit mode, check validity ignoring the disabled CIN field
      const formValue = this.candidateForm.getRawValue();
      const requiredFields = ['firstName', 'lastName', 'gender', 'gsm', 'birthDay'];
      return requiredFields.some(field => !formValue[field]) || 
             this.candidateForm.hasError('email') || 
             this.candidateForm.hasError('pattern');
    }
    return this.candidateForm.invalid;
  }

  trackByCin(index: number, candidate: CandidateListDTO): string {
    return candidate.cin;
  }

  getPages(): number[] {
    const pages: number[] = [];
    const maxPages = Math.min(this.totalPages, 5);
    const startPage = Math.max(0, this.currentPage - 2);
    const endPage = Math.min(this.totalPages - 1, startPage + maxPages - 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('fr-FR');
  }

  formatPhone(phone: string): string {
    if (!phone) return '';
    // Format: +212 6 01 23 45 67
    if (phone.startsWith('+212')) {
      return phone.replace(/(\+212)(\d)(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5 $6');
    }
    // Format: 06 01 23 45 67
    return phone.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
  }

  // Méthodes pour la gestion des villes
  onCityInput(event: any): void {
    const value = event.target.value.toUpperCase();
    if (value.length > 0) {
      this.filteredCities = this.moroccanCities.filter(city => 
        city.includes(value)
      );
      this.showCityDropdown = this.filteredCities.length > 0;
    } else {
      this.filteredCities = [];
      this.showCityDropdown = false;
    }
  }
  selectCity(city: string): void {
    this.candidateForm.patchValue({ city: city });
    this.showCityDropdown = false;
    this.filteredCities = [];
  }

  onCityFocus(): void {
    const currentValue = this.candidateForm.get('city')?.value || '';
    if (currentValue.length > 0) {
      this.onCityInput({ target: { value: currentValue } });
    } else {
      this.filteredCities = this.moroccanCities;
      this.showCityDropdown = true;
    }
  }
  onCityBlur(): void {
    // Delay hiding dropdown to allow selection
    setTimeout(() => {
      this.showCityDropdown = false;
    }, 300);
  }

  // Méthodes pour la gestion des villes dans le formulaire de recherche
  onSearchCityInput(event: any): void {
    const value = event.target.value.toUpperCase();
    if (value.length > 0) {
      this.filteredSearchCities = this.moroccanCities.filter(city => 
        city.includes(value)
      );
      this.showSearchCityDropdown = this.filteredSearchCities.length > 0;
    } else {
      this.filteredSearchCities = [];
      this.showSearchCityDropdown = false;
    }
  }

  selectSearchCity(city: string): void {
    this.searchForm.patchValue({ city: city });
    this.showSearchCityDropdown = false;
    this.filteredSearchCities = [];
  }

  onSearchCityFocus(): void {
    const currentValue = this.searchForm.get('city')?.value || '';
    if (currentValue.length > 0) {
      this.onSearchCityInput({ target: { value: currentValue } });
    } else {
      this.filteredSearchCities = this.moroccanCities;
      this.showSearchCityDropdown = true;
    }
  }

  onSearchCityBlur(): void {
    // Delay hiding dropdown to allow selection
    setTimeout(() => {
      this.showSearchCityDropdown = false;
    }, 300);
  }
}