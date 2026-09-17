import { Component, inject, signal } from '@angular/core';
import { PaginatedResponse, ReportListItem, ReportService } from '../../core/report-service';
import { Router, ActivatedRoute } from '@angular/router';
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
    private route = inject(ActivatedRoute)

    reportListData = signal<PaginatedResponse<ReportListItem> | null>(null)
    currentPage = signal(1)

    constructor() {
        const pageParam = this.route.snapshot.queryParamMap.get("page")
        this.currentPage.set(pageParam ? Number(pageParam) : 1)
        this.loadReports()
    }

    loadReports() {
        this.report.getReports(this.currentPage()).subscribe(response => {
            this.reportListData.set(response)
        })
    }

    nextPage() {
        this.currentPage.update((value) => value + 1)
        this.updateUrlAndLoad()
    }

    previousPage() {
        if (this.currentPage() > 1) {
            this.currentPage.update((value) => value - 1)
            this.updateUrlAndLoad()
        }
    }

    updateUrlAndLoad() {
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: {page: this.currentPage()},
            queryParamsHandling: "merge"
        })
        this.loadReports()
    }

    newReport() {
        this.router.navigate(["reports/new"])
    }
}
