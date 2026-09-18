import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { environment } from '../../environments/environment';

export interface PaginatedResponse<T> {
    count: number,
    next: string | null,
    previous: string | null,
    results: T[]
}

export interface ReportListItem {
    id: number,
    title: string,
    category: string,
    priority: string,
    status: string,
    assigned_engineer: string | null,
    creation_date: string,
    sla_deadline: string
}

export interface ReportFilters {
    status?: string,
    priority?: string,
    category?: string,
    assigned_engineer?: string,
    only_my?: boolean,
    by_sla?: boolean,
    search?: string
}

@Service()
export class ReportService {
    private http = inject(HttpClient)

    createReport(title: string, description: string, category: number, priority: string) {
        return this.http.post(`${environment.apiUrl}/reports/`, {title, description, category, priority})
    }

    getReports(page: number, filters: ReportFilters) {
        const params: any = { page: page.toString() }
        if (filters.status) {
            params.status = filters.status
        }
        if (filters.priority) {
            params.priority = filters.priority
        }
        if (filters.category) {
            params.category = filters.category
        }
        if (filters.only_my) {
            params.only_my = filters.only_my.toString()
        }
        if (filters.by_sla) {
            params.by_sla = filters.by_sla.toString()
        }
        if (filters.search) {
            params.search = filters.search
        }

        return this.http.get<PaginatedResponse<ReportListItem>>(`${environment.apiUrl}/reports/`, {
            params: params
        })
    }
}
