import { Routes } from '@angular/router';
import { Login } from './features/login/login';
import { Register } from './features/register/register';
import { Dashboard } from './features/dashboard/dashboard';
import { authGuard } from './core/auth-guard';
import { NewReport } from './features/new-report/new-report';
import { ReportList } from './features/report-list/report-list';
import { noAuthGuard } from './core/no-auth-guard';
import { ReportDetails } from './features/report-details/report-details';

export const routes: Routes = [
    { path: "", redirectTo: "/login", pathMatch: "full" },
    { path: "login", component: Login, canActivate: [noAuthGuard] },
    { path: "register", component: Register, canActivate: [noAuthGuard] },
    { path: "dashboard", component: Dashboard, canActivate: [authGuard] },
    { path: "reports/new", component: NewReport, canActivate: [authGuard] },
    { path: "reports/list", component: ReportList, canActivate: [authGuard] },
    { path: "reports/:id", component: ReportDetails, canActivate: [authGuard] }
];
