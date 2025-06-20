import { INavData } from '@coreui/angular';

export const navItems: INavData[] = [
  {
    name: 'Dashboard',
    url: '/app/dashboard',
    iconComponent: { name: 'cil-speedometer' },
    badge: {
      color: 'info',
      text: 'ACCUEIL'
    }
  },  {
    name: 'Candidat',
    url: '',
    iconComponent: { name: 'cil-people' },
    children: [
      {
        name: 'Ajouter un candidat',
        icon: 'nav-icon-bullet',
        url: '/app/candidats'
      },
      {
        name: 'Liste des Candidats',
        icon: 'nav-icon-bullet',
        url: '/app/listCandidate'
      }
    ]
  }
];