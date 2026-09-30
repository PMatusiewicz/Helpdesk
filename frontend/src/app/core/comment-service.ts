import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { environment } from '../../environments/environment';

export interface Comment {
    id: number,
    description: string,
    author: string,
    is_inner: boolean,
    creation_date: string
}

@Service()
export class CommentService {
    private http = inject(HttpClient)

    getComments(id: string | number) {
        return this.http.get<Comment[]>(`${environment.apiUrl}/reports/${id}/comments/`)
    }

    addComment(id: string | number, description: string, is_inner: boolean) {
        return this.http.post<Comment>(`${environment.apiUrl}/reports/${id}/comments/`, {description, is_inner})
    }
}
