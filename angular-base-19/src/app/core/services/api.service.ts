import { Injectable, signal, inject } from '@angular/core';
import { TokenService } from './token.service';
import { ToastService } from '../services/toaster.service';
import { environment } from '../../../environments/environment';
import { API_ROUTES } from '../../constants/api.routes.constant';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

@Injectable({ providedIn: 'root' })
export class ApiService {
    private tokenService = inject(TokenService);
    private toastService = inject(ToastService);

    loading = signal(false);
    error = signal<string | null>(null);

    private getHeaders() {
        const token = this.tokenService.accessToken();
        return {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
        };
    }

    private async refreshTokenIfNeeded() {
        const refresh = this.tokenService.refreshToken();
        if (!refresh) return false;

        try {
            const res = await fetch(`${environment.apiUrl}${API_ROUTES.REFRESH_TOKEN}`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({ refresh })
            });

            if (!res.ok) throw await res.json();
            const data = await res.json();
            if (data?.access) this.tokenService.setTokens(data.access, refresh);
            return !!data?.access;
        } catch (err) {
            this.tokenService.clearTokens();
            this.toastService.error('Session expired. Please login again.');
            return false;
        }
    }

    async request<T, P = any>(url: string, method: HttpMethod, payload?: P): Promise<T | null> {
        this.loading.set(true);
        this.error.set(null);

        try {
            let headers = this.getHeaders();

            let res = await fetch(`${environment.apiUrl}${url}`, {
                method,
                headers,
                body: payload ? JSON.stringify(payload) : undefined
            });

            if (res.status === 401) {
                const refreshed = await this.refreshTokenIfNeeded();
                if (refreshed) {
                    headers = this.getHeaders();
                    res = await fetch(`${environment.apiUrl}${url}`, {
                        method,
                        headers,
                        body: payload ? JSON.stringify(payload) : undefined
                    });
                } else {
                    this.toastService.error('Unauthorized');
                    throw new Error('Unauthorized');
                }
            }

            if (!res.ok) {
                const err = await res.json();
                this.toastService.error(err?.message || 'Something went wrong');
                throw err;
            }

            const data = await res.json();
            this.toastService.success('Request successful!');
            return data;

        } catch (err: any) {
            console.log("ASdasd")
            this.toastService.error(err?.message || 'Something went wrong');
            this.error.set(err?.message || 'Something went wrong');
            return null;
        } finally {
            this.loading.set(false);
        }
    }

    get<T>(url: string) { return this.request<T>(url, 'GET'); }
    post<T, P = any>(url: string, payload: P) { return this.request<T, P>(url, 'POST', payload); }
    put<T, P = any>(url: string, payload: P) { return this.request<T, P>(url, 'PUT', payload); }
    delete<T>(url: string) { return this.request<T>(url, 'DELETE'); }
}
