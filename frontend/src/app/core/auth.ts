import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

interface TokenResponse {
    access: string
    refresh: string
}

export interface UserResponse {
    username: string
    email: string
    role: string
}

@Service()
export class Auth {
    private http = inject(HttpClient)

    login(username: string, password: string) {
        return this.http.post<TokenResponse>(`${environment.apiUrl}/token/`, {username, password})
    }

    register(username: string, email: string, password: string, confirmPassword: string) {
        return this.http.post(`${environment.apiUrl}/register/`, {username, email, password, confirm_password: confirmPassword})
    }

    getMe() {
        return this.http.get<UserResponse>(`${environment.apiUrl}/me/`)
    }

    saveToken(access: string, refresh: string) {
        localStorage.setItem("access_token", access)
        localStorage.setItem("refresh_token", refresh)
    }

    getAccessToken(): string | null {
        return localStorage.getItem("access_token")
    }

    getRefreshToken(): string | null {
        return localStorage.getItem("refresh_token")
    }

    logout() {
        localStorage.removeItem("access_token")
        localStorage.removeItem("refresh_token")
    }

    refreshAccessToken(refreshToken: string) {
        return this.http.post<{ access: string }>(`${environment.apiUrl}/token/refresh/`, { refresh: refreshToken })
    }
}
