import { Routes } from '@angular/router';
import { DefaultLayoutComponent } from './layout';
import { CandidatsComponent } from './views/candidats/newCandidate/candidats.component';
import { ListCandidateComponent } from './views/candidats/listCandidate/listCandidate.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: '',
    component: DefaultLayoutComponent,
    data: {
      title: 'Home'
    },
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./views/dashboard/routes').then((m) => m.routes)
      },
      {
        path: 'candidats',
        component: CandidatsComponent,
      }
      ,
      {
        path: 'listCandidate',
        component: ListCandidateComponent,
      }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
