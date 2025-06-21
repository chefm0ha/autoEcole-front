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
  },
  {
    name: 'Candidats',
    url: '/app/candidates',
    iconComponent: { name: 'cil-people' },
    badge: {
      color: 'success',
      text: 'GESTION'
    }
  }
];