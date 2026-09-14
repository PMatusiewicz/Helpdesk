import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Auth } from './auth';
import { Router } from '@angular/router';
import { catchError, throwError, switchMap } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const auth = inject(Auth)
    const token = auth.getAccessToken()
    const router = inject(Router)
    let authReq = req

    if (token) {
        authReq = req.clone({
            setHeaders: { Authorization: `Bearer ${token}` }
        })
    }

    return next(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
            if (error.status == 401) {
                const refreshToken = auth.getRefreshToken()

                if (refreshToken) {
                    return auth.refreshAccessToken(refreshToken).pipe(
                        switchMap((response) => {
                            auth.saveToken(response.access, refreshToken)
                            return next(req.clone({setHeaders: { Authorization: `Bearer ${response.access}`}}))
                        }),
                        catchError((refreshToken) => {
                            auth.logout()
                            router.navigate(["/login"])
                            return throwError(() => refreshToken)
                        })
                    )
                }
                else {
                    auth.logout()
                    router.navigate(["/login"])
                }
            }
            return throwError(() => error)
        })
    )
};
