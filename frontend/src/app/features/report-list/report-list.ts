import { Component, inject, signal } from '@angular/core';
import { PaginatedResponse, ReportListItem, ReportService } from '../../core/report-service';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';

@Component({
  imports: [DatePipe],
  selector: 'app-report-list',
  styleUrl: './report-list.css',
  templateUrl: './report-list.html',
})
export class ReportList {
    private report = inject(ReportService)
    private router = inject(Router)

    reportListData = signal<PaginatedResponse<ReportListItem> | null>(null)

    constructor() {
        this.report.getReports().subscribe(response => {
            this.reportListData.set(response)
        })
    }

    newReport() {
        this.router.navigate(["reports/new"])
    }
}
