import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { environment } from '../../environments/environment';

export interface EngineerResponse {
    id: number
    username: string
}

@Service()
export class EngineerService {
    private http = inject(HttpClient)

    getEngineers() {
        return this.http.get<EngineerResponse[]>(`${environment.apiUrl}/engineers/`)
    }
}
