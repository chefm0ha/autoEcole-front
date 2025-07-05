// src/app/layout/default-layout/_nav.ts - Updated with calendar navigation

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
    name: 'Calendrier',
    url: '/app/calendar',
    iconComponent: { name: 'cil-calendar' }
  },
  {
    name: 'Candidats',
    url: '/app/candidates',
    iconComponent: { name: 'cil-people' }
  }
];