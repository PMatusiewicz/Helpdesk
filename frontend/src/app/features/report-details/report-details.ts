import { Component, inject, OnDestroy, signal } from '@angular/core';
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
export class ReportDetails implements OnDestroy {
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
    slaCountdown = signal("")

    statusForm = new FormGroup({
        status: new FormControl("")
    })

    engineerForm = new FormGroup({
        engineer_id: new FormControl("")
    })

    priorityForm = new FormGroup({
        priority: new FormControl("")
    })

    private intervalId?: ReturnType<typeof setInterval>

    constructor() {
        this.refreshAll()

        this.engineer.getEngineers().subscribe(response => {
            this.engineers.set(response)
        })

        this.auth.getMe().subscribe(response => {
            this.currentUser.set(response)
        })

        this.intervalId = setInterval(() => this.updateSlaCountdown(), 1000)
    }

    ngOnDestroy(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId)
        }
    }

    loadReport() {
        this.report.getReportDetails(this.reportId).subscribe(response => {
            this.reportData.set(response)
            this.updateSlaCountdown()
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

    confirmSolution() {
        this.report.changeStatus(this.reportId, "CLOSED").subscribe(() => {
            this.refreshAll()
        })
    }

    rejectSolution() {
        this.report.changeStatus(this.reportId, "IN_PROGRESS").subscribe(() => {
            this.refreshAll()
        })
    }

    changePriority() {
        const newPriority = this.priorityForm.value.priority
        if (!newPriority) {
            return
        }

        this.report.changePriority(this.reportId, newPriority).subscribe(() => {
            this.refreshAll()
        })
    }

    updateSlaCountdown() {
        const report = this.reportData()
        if (!report) {
            return
        }

        const deadline = new Date(report.sla_deadline).getTime()
        let diff = deadline - Date.now()
        const isOverdue = diff < 0
        diff = Math.abs(diff)

        const hours = Math.floor(diff / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((diff % (1000 * 60)) / 1000)

        const formatted = `${hours}h ${minutes}min ${seconds}s`
        this.slaCountdown.set(isOverdue ? `Przekroczono o: ${formatted}` : `Pozostało: ${formatted}`)
    }
}
