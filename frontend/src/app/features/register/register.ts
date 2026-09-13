import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Auth } from '../../core/auth';
import { Router } from '@angular/router';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-register',
  styleUrl: './register.css',
  templateUrl: './register.html',
})
export class Register {
    private auth = inject(Auth)
    private router = inject(Router)

    registerForm = new FormGroup({
        username: new FormControl("", Validators.required),
        email: new FormControl("", Validators.required),
        password: new FormControl("", Validators.required),
        confirmPassword: new FormControl("", Validators.required)
    })

    onSubmit() {
        this.auth.register(this.registerForm.value.username ?? "", this.registerForm.value.email ?? "", this.registerForm.value.password ?? "", this.registerForm.value.confirmPassword ?? "").subscribe(() => {
            this.router.navigate(["/login"])
        })
    }
}
