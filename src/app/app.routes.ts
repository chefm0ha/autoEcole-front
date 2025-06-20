import { Routes } from '@angular/router';
import { DefaultLayoutComponent } from './layout';
import { CandidatsComponent } from './views/candidats/newCandidate/candidats.component';
import { ListCandidateComponent } from './views/candidats/listCandidate/listCandidate.component';
import { LoginComponent } from './auth/login/login.component';
import { Page404Component } from './pages/page404/page404.component';
import { authGuard, loginGuard } from './auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [loginGuard], // Prevent access if already logged in
    data: {
      title: 'Login'
    }
  },
  {
    path: '',
    redirectTo: '/login', // Default redirect to login instead of dashboard
    pathMatch: 'full'
  },
  {
    path: 'app',
    component: DefaultLayoutComponent,
    canActivate: [authGuard], // Protect ALL routes - redirect to login if not authenticated
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadChildren: () => import('./views/dashboard/routes').then((m) => m.routes),
        data: {
          title: 'Dashboard'
        }
      },
      {
        path: 'candidats',
        component: CandidatsComponent,
        data: {
          title: 'Nouveau Candidat'
        }
      },
      {
        path: 'listCandidate',
        component: ListCandidateComponent,
        data: {
          title: 'Liste des Candidats'
        }
      },
      {
        path: '404',
        component: Page404Component,
        data: {
          title: 'Page Not Found'
        }
      }
    ]
  },
  { 
    path: '**', 
    redirectTo: '/login' // All unknown routes redirect to login
  }
];