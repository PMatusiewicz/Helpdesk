import { Component, inject, signal } from '@angular/core';
import { Auth, UserResponse } from '../../core/auth';
import { Router } from '@angular/router';
import { DashboardData, DashboardService } from '../../core/dashboard-service';

@Component({
  imports: [],
  selector: 'app-dashboard',
  styleUrl: './dashboard.css',
  templateUrl: './dashboard.html',
})
export class Dashboard {
    private auth = inject(Auth)
    private router = inject(Router)
    private dashboard = inject(DashboardService)

    dashboardData = signal<DashboardData | null>(null)
    currentUser = signal<UserResponse | null>(null)

    constructor() {
        this.auth.getMe().subscribe(response => {
            this.currentUser.set(response)
        })

        this.dashboard.getDashboard().subscribe(response => {
            this.dashboardData.set(response)
        })
    }

    logout() {
        this.auth.logout()
        this.router.navigate(["/login"])
    }

    newReport() {
        this.router.navigate(["reports/new"])
    }

    listReport() {
        this.router.navigate(["reports/list"])
    }

    reportDetails(id: number) {
        this.router.navigate(["/reports", id])
    }
}
