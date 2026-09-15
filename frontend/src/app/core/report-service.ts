import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { environment } from '../../environments/environment';

@Service()
export class ReportService {
    private http = inject(HttpClient)

    createReport(title: string, description: string, category: number, priority: string) {
        return this.http.post(`${environment.apiUrl}/reports/`, {title, description, category, priority})
    }
}
