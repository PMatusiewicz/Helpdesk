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

export interface ReportDetails {
    id: number,
    title: string,
    status: string,
    priority: string,
    sla_deadline: string
    category: string,
    author: string,
    assigned_engineer: string | null,
    description: string,
}

@Service()
export class ReportService {
    private http = inject(HttpClient)

    createReport(title: string, description: string, category: number, priority: string) {
        return this.http.post(`${environment.apiUrl}/reports/`, {title, description, category, priority})
    }

    getReports(page: number, filters: ReportFilters, ordering: string) {
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
        if (filters.assigned_engineer) {
            params.assigned_engineer = filters.assigned_engineer
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

        if (ordering) {
            params.ordering = ordering
        }

        return this.http.get<PaginatedResponse<ReportListItem>>(`${environment.apiUrl}/reports/`, {
            params: params
        })
    }

    getReportDetails(id: string | number) {
        return this.http.get<ReportDetails>(`${environment.apiUrl}/reports/${id}/`)
    }

    getAvailableStatuses(id: string | number) {
        return this.http.get<{allowed_transitions: string[]}>(`${environment.apiUrl}/reports/${id}/available-statuses/`)
    }

    changeStatus(id: string | number, status: string) {
        return this.http.patch(`${environment.apiUrl}/reports/${id}/status/`, {status})
    }

    assignToMe(id: string | number) {
        return this.http.post(`${environment.apiUrl}/reports/${id}/assign-to-me/`, null)
    }

    assignEngineer(id: string | number, engineer_id: string | number) {
        return this.http.post(`${environment.apiUrl}/reports/${id}/assign-engineer/`, {engineer_id})
    }
}
