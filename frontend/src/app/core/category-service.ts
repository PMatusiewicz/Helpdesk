import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { environment } from '../../environments/environment';

export interface CategoryResponse {
    id: number
    name: string
}

@Service()
export class CategoryService {
    private http = inject(HttpClient)

    getCategories() {
        return this.http.get<CategoryResponse[]>(`${environment.apiUrl}/categories/`)
    }
}
