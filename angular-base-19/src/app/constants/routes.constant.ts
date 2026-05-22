
import { Login } from '../featured/public/login/login';
import { Signup } from '../featured/public/signup/signup';
import { ForgotPassword } from '../featured/public/forgot-password/forgot-password';
import { ResetPassword } from '../featured/public/reset-password/reset-password';
import { Home } from '../featured/private/home/home';
import { Routes } from '@angular/router';

export const PUBLIC_ROUTES: Routes = [
    {
        path: '',
        children: [
            { path: 'login', component: Login },
            { path: 'signup', component: Signup },
            { path: 'forgot-password', component: ForgotPassword },
            { path: 'reset-password', component: ResetPassword }
        ]
    }
]

export const PRIVATE_ROUTES: Routes = [
    {
        path: '',
        children: [
            { path: '', component: Home }
        ]
    }
];


