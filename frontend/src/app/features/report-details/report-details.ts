import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ReportDetailsInterface, ReportService } from '../../core/report-service';
import { ActivatedRoute, Router } from '@angular/router';
import { Auth, UserResponse } from '../../core/auth';
import { EngineerResponse, EngineerService } from '../../core/engineer-service';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-report-details',
  styleUrl: './report-details.css',
  templateUrl: './report-details.html',
})
export class ReportDetails {
    private report = inject(ReportService)
    private router = inject(Router)
    private route = inject(ActivatedRoute)
    private auth = inject(Auth)
    private engineer = inject(EngineerService)

    reportId = Number(this.route.snapshot.paramMap.get("id"))

    reportData = signal<ReportDetailsInterface | null>(null)
    allowedStatuses = signal<string[]>([])
    engineers = signal<EngineerResponse[]>([])
    currentUser = signal<UserResponse | null>(null)

    statusForm = new FormGroup({
        status: new FormControl("")
    })

    engineerForm = new FormGroup({
        engineer_id: new FormControl("")
    })

    constructor() {
        this.refreshAll()

        this.engineer.getEngineers().subscribe(response => {
            this.engineers.set(response)
        })

        this.auth.getMe().subscribe(response => {
            this.currentUser.set(response)
        })
    }

    loadReport() {
        this.report.getReportDetails(this.reportId).subscribe(response => {
            this.reportData.set(response)
        })
    }

    loadAvailableStatuses() {
        this.report.getAvailableStatuses(this.reportId).subscribe(response => {
            this.allowedStatuses.set(response.allowed_transitions)
        })
    }

    refreshAll() {
        this.loadReport()
        this.loadAvailableStatuses()
    }

    changeStatus() {
        const newStatus = this.statusForm.value.status
        if (!newStatus) {
            return
        }

        this.report.changeStatus(this.reportId, newStatus).subscribe(() => {
            this.refreshAll()
        })
    }

    assignToMe() {
        this.report.assignToMe(this.reportId).subscribe(() => {
            this.refreshAll()
        })
    }

    assignEngineer() {
        const engineerId = this.engineerForm.value.engineer_id
        if (!engineerId) {
            return
        }
        
        this.report.assignEngineer(this.reportId, engineerId).subscribe(() => {
            this.refreshAll()
        })
    }

    dashboard() {
        this.router.navigate(["/dashboard"])
    }

    reportList() {
        this.router.navigate(["/reports/list"])
    }
}
