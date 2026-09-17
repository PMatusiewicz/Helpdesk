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

@Service()
export class ReportService {
    private http = inject(HttpClient)

    createReport(title: string, description: string, category: number, priority: string) {
        return this.http.post(`${environment.apiUrl}/reports/`, {title, description, category, priority})
    }

    getReports() {
        return this.http.get<PaginatedResponse<ReportListItem>>(`${environment.apiUrl}/reports/`)
    }
}
