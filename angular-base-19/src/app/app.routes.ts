import { Routes } from '@angular/router';
import { PublicLayout } from './components/Layout/PublicLayout';
import { PrivateLayout } from './components/Layout/PrivateLayout';
import { PUBLIC_ROUTES, PRIVATE_ROUTES } from './constants/routes.constant';
import { PrivateRoutesGuard } from './core/guards/private.routes.guard';
import { PublicRoutesGuard } from './core/guards/public.routes.guard';

export const routes: Routes = [
    {
        path: '',
        canActivate: [PrivateRoutesGuard],
        component: PrivateLayout,
        loadChildren: () => PRIVATE_ROUTES
    },
    {
        path: '',
        canActivate: [PublicRoutesGuard],
        component: PublicLayout,
        loadChildren: () => PUBLIC_ROUTES
    },
    {
        path: '**',
        redirectTo: 'login',
        pathMatch: 'full'
    }
];