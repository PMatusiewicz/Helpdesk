import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Auth } from '../../core/auth';
import { Router } from '@angular/router';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-dashboard',
  styleUrl: './dashboard.css',
  templateUrl: './dashboard.html',
})
export class Dashboard {
    private auth = inject(Auth)
    private router = inject(Router)

    username = signal("")

    constructor() {
        this.auth.getMe().subscribe(response => {
            this.username.set(response.username)
        })
    }

    logout() {
        this.auth.logout()
        this.router.navigate(["/login"])
    }

    newReport() {
        // 
    }
}
