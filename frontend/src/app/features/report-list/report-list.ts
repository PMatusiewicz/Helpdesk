import { Component, inject, signal } from '@angular/core';
import { PaginatedResponse, ReportFilters, ReportListItem, ReportService } from '../../core/report-service';
import { Router, ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CategoryResponse, CategoryService } from '../../core/category-service';
import { EngineerResponse, EngineerService } from '../../core/engineer-service';

@Component({
  imports: [DatePipe, ReactiveFormsModule],
  selector: 'app-report-list',
  styleUrl: './report-list.css',
  templateUrl: './report-list.html',
})
export class ReportList {
    private report = inject(ReportService)
    private router = inject(Router)
    private route = inject(ActivatedRoute)
    private category = inject(CategoryService)
    private engineer = inject(EngineerService)

    reportListData = signal<PaginatedResponse<ReportListItem> | null>(null)
    currentPage = signal(1)
    categories = signal(<CategoryResponse[]>([]))
    engineers = signal(<EngineerResponse[]>([]))
    sortField = signal("")

    filterForm = new FormGroup({
        status: new FormControl(""),
        priority: new FormControl(""),
        category: new FormControl(""),
        assigned_engineer: new FormControl(""),
        only_my: new FormControl(false),
        by_sla: new FormControl(false),
        search: new FormControl(""),
    })

    constructor() {
        const params = this.route.snapshot.queryParamMap
        const pageParam = params.get("page")
        const sortParam= params.get("ordering")

        this.currentPage.set(pageParam ? Number(pageParam) : 1)
        this.filterForm.patchValue({
            status: params.get("status") ?? "",
            priority: params.get("priority") ?? "",
            category: params.get("category") ?? "",
            assigned_engineer: params.get("assigned_engineer") ?? "",
            only_my: params.get("only_my") == "true",
            by_sla: params.get("by_sla") == "true",
            search: params.get("search") ?? ""
        })
        this.sortField.set(sortParam ?? "")

        this.loadReports()
        
        this.filterForm.valueChanges.subscribe(() => {
            this.currentPage.set(1)
            this.updateUrlAndLoad()
        })

        this.category.getCategories().subscribe(respone => {
            this.categories.set(respone)
        })

        this.engineer.getEngineers().subscribe(respone => {
            this.engineers.set(respone)
        })
    }

    loadReports() {
        const filters: ReportFilters = {
            status: this.filterForm.value.status || undefined,
            priority: this.filterForm.value.priority || undefined,
            category: this.filterForm.value.category || undefined,
            assigned_engineer: this.filterForm.value.assigned_engineer || undefined,
            only_my: this.filterForm.value.only_my || undefined,
            by_sla: this.filterForm.value.by_sla || undefined,
            search: this.filterForm.value.search || undefined,
        }

        this.report.getReports(this.currentPage(), filters, this.sortField()).subscribe(response => {
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
            queryParams: {
                page: this.currentPage(),
                ordering: this.sortField(),
                status: this.filterForm.value.status || null,
                priority: this.filterForm.value.priority || null,
                category: this.filterForm.value.category || null,
                assigned_engineer: this.filterForm.value.assigned_engineer || null,
                only_my: this.filterForm.value.only_my || null,
                by_sla: this.filterForm.value.by_sla || null,
                search: this.filterForm.value.search || null,
            },
            queryParamsHandling: "merge"
        })
        this.loadReports()
    }

    newReport() {
        this.router.navigate(["reports/new"])
    }

    getSlaColor(report: ReportListItem) {
        const timeLeft = new Date(report.sla_deadline).getTime() - Date.now()
        const slaTime = new Date(report.sla_deadline).getTime() - new Date(report.creation_date).getTime()

        if (timeLeft < 0) {
            return "red"
        }

        if ((timeLeft / slaTime) < 0.25) {
            return "yellow"
        }
        return "green"
    }

    sort(field: string) {
        if (this.sortField() == field) {
            this.sortField.set("-" + field)
        }
        else {
            this.sortField.set(field)
        }
        this.currentPage.set(1)
        this.updateUrlAndLoad()
    }
}
