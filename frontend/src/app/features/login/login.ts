import { Component, inject, signal, ChangeDetectorRef } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Auth } from '../../core/auth';
import { RouterLink, Router } from '@angular/router';

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {
    private auth = inject(Auth)
    private router = inject(Router)
    private cdr = inject(ChangeDetectorRef)
    
    errorMessage = signal("")

    loginForm = new FormGroup({
        username: new FormControl("", Validators.required),
        password: new FormControl("", Validators.required)
    })

    onSubmit() {
        this.auth.login(this.loginForm.value.username ?? "", this.loginForm.value.password ?? "").subscribe({
            next: (response) => {
                this.auth.saveToken(response.access, response.refresh)
                // this.router.navigate(["/dashboard"])
                // TODO uncomment this after adding dashboard
            },
            error: (err) => {
                if (err.status == 401) {
                    this.errorMessage.set("Błędny login lub hasło")
                }
                else {
                    for (const field in err.error) {
                        const control = this.loginForm.get(field)
                        if (control) {
                            control.setErrors({ backend: err.error[field][0]})
                        }
                    }
                }
                this.cdr.markForCheck()
            }
        })
    }
    getMeTest() {
        this.auth.getMe().subscribe(response => {
            console.log(response)
        })
    }
}
