import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Candidat } from '../../../models/candidat.model';
import { CandidatService } from '../../../services/candidat.service';
import { DatePipe } from '@angular/common';



import {
  ButtonDirective,
  ColComponent,
  FormCheckComponent,
  FormCheckInputDirective,
  FormCheckLabelDirective,
  FormControlDirective,
  FormDirective,
  FormFeedbackComponent,
  FormLabelDirective,
  FormSelectDirective,
  GutterDirective,
  InputGroupComponent,
  InputGroupTextDirective,
  RowDirective
} from '@coreui/angular';

@Component({
  selector: 'candidats',
  templateUrl: './candidats.component.html',
  standalone: true,
  imports: [
    FormsModule,
    FormDirective, RowDirective, GutterDirective, ColComponent, FormLabelDirective,
    FormControlDirective, FormFeedbackComponent, InputGroupComponent, InputGroupTextDirective,
    FormSelectDirective,  ButtonDirective, DatePipe
  ]
})
export class CandidatsComponent {
  customStylesValidated = false;

  candidat: Candidat = {
      sex: '',
      category: '',
      cin: '',
      lastName: '',
      firstName: '',
      birthday: '',
      placeBirth: '',
      adress: '',
      city: '',
      email: '',
      gsm: '',
      startingDate: '',
      initialPrice: 0,
      vehicule: '',
      moniteur: ''
  };

  constructor(private candidatService: CandidatService) {}

  onSubmit() {
    this.customStylesValidated = true;
    this.candidatService.createCandidat(this.candidat).subscribe({
      next: (res) => {
        console.log('Candidat enregistré avec succès :', res);
        alert('Candidat ajouté avec succès !');
        this.onReset();
      },
      error: (err) => {
        console.error('Erreur lors de l\'enregistrement :', err);
        alert('Échec de l\'ajout du candidat.');
      }
    });
  }

  onReset() {
    this.customStylesValidated = false;
    this.candidat = {
      sex: '',
      category: '',
      cin: '',
      lastName: '',
      firstName: '',
      birthday: '',
      placeBirth: '',
      adress: '',
      city: '',
      email: '',
      gsm: '',
      startingDate: '',
      initialPrice: 0,
      vehicule: '',
      moniteur: ''
    };
  }
}
