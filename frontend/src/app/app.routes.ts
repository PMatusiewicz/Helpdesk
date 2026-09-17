import { Routes } from '@angular/router';
import { Login } from './features/login/login';
import { Register } from './features/register/register';
import { Dashboard } from './features/dashboard/dashboard';
import { authGuard } from './core/auth-guard';
import { NewReport } from './features/new-report/new-report';
import { ReportList } from './features/report-list/report-list';

export const routes: Routes = [
    { path: "", redirectTo: "/login", pathMatch: "full" },
    { path: "login", component: Login },
    { path: "register", component: Register },
    { path: "dashboard", component: Dashboard, canActivate: [authGuard] },
    { path: "reports/new", component: NewReport, canActivate: [authGuard] },
    { path: "reports/list", component: ReportList, canActivate: [authGuard] },
];
