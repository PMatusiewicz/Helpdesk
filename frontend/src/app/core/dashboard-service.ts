import { inject, Service } from '@angular/core';
import { ReportListItem } from './report-service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface DashboardData {
    status_counts?: {
        new: number
        in_progress: number
        waiting_for_client: number
        resolved: number
        closed: number
    }
    recent_reports?: ReportListItem[]
    new_unassigned?: number
    my_in_progress?: number
    after_sla_time?: number
    assigned_to_me?: ReportListItem[]
    category_counts?: { category__name: string, count: number }[]
}

@Service()
export class DashboardService {
    private http = inject(HttpClient)
    getDashboard() {
        return this.http.get<DashboardData>(`${environment.apiUrl}/dashboard/`)
    }
}
