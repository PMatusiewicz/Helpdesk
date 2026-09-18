import { CanActivateFn, Router } from '@angular/router';
import { Auth } from './auth';
import { inject } from '@angular/core';

export const noAuthGuard: CanActivateFn = (route, state) => {
    const auth = inject(Auth)
    const router = inject(Router)

    if (auth.getAccessToken()) {
        router.navigate(["/dashboard"])
        return false
    }
    return true;
};
