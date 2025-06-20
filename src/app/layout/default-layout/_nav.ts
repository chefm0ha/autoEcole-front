import { INavData } from '@coreui/angular';

export const navItems: INavData[] = [
  {
    name: 'Dashboard',
    url: '/dashboard',
    iconComponent: { name: 'cil-speedometer' },
    badge: {
      color: 'info',
      text: 'ACCUEIL'
    }
  },
  {
    name: 'Candidat',
    url: '',
    iconComponent: { name: 'cil-layers' },
    children: [
      {
        name: 'Ajouter un candidat',
        icon: 'nav-icon-bullet',
        url: '/candidats'
      },
      {
        name: 'Liste des Candidats',
        icon: 'nav-icon-bullet',
        url: '/listCandidate'
      }
    ]
  }
];
