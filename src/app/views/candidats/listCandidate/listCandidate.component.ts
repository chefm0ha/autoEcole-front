import { Component, OnInit } from '@angular/core';
import { CommonModule  } from '@angular/common';
import { Candidat } from '../../../models/candidat.model';
import { CandidatService } from '../../../services/candidat.service';

@Component({
  selector: 'listCandidate',
  templateUrl: './listCandidate.component.html',
  imports: [CommonModule],
})
export class ListCandidateComponent implements OnInit {
  candidats: Candidat[] = [];
  loading = true;
  error = '';

  constructor(private candidatService: CandidatService) {}

  ngOnInit(): void {
    this.getCandidats();
  }

  getCandidats(): void {
    this.candidatService.getCandidats().subscribe({
      next: (data) => {
        this.candidats = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des candidats.';
        this.loading = false;
        console.error(err);
      }
    });
  }
}
