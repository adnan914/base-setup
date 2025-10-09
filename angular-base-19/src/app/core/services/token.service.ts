import { Injectable, signal } from '@angular/core';
import { retry } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TokenService {
    private _accessToken = signal<string | null>(null);
    private _refreshToken = signal<string | null>(null);

    accessToken = this._accessToken.asReadonly();
    refreshToken = this._refreshToken.asReadonly();

    setTokens(access: string, refresh: string) {
        this._accessToken.set(access);
        this._refreshToken.set(refresh);
        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);
    }

    loadTokens() {
        this._accessToken.set(localStorage.getItem('access_token'));
        this._refreshToken.set(localStorage.getItem('refresh_token'));
    }

    clearTokens() {
        this._accessToken.set(null);
        this._refreshToken.set(null);
        localStorage.clear();
    }

    isAuthenticated() {
        const token = localStorage.getItem('access_token');
       return token ? true  : false;
    }
}
