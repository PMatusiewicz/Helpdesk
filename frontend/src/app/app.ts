import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { Auth } from './core/auth';

@Component({
  imports: [RouterOutlet, RouterLink],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
    private auth = inject(Auth)
    private router = inject(Router)

    isLoggedIn() {
        return !!this.auth.getAccessToken()
    }

    logout() {
        this.auth.logout()
        this.router.navigate(["/login"])
    }
}
