import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Auth } from '../../core/auth';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {
    private auth = inject(Auth)

    loginForm = new FormGroup({
        username: new FormControl("", Validators.required),
        password: new FormControl("", Validators.required)
    })

    onSubmit() {
        this.auth.login(this.loginForm.value.username ?? "", this.loginForm.value.password ?? "").subscribe(respone => {
            this.auth.saveToken(respone.access, respone.refresh)
        })
    }
}
