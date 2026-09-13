import { Component, inject, ChangeDetectorRef} from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Auth } from '../../core/auth';
import { Router, RouterLink } from '@angular/router';

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-register',
  styleUrl: './register.css',
  templateUrl: './register.html',
})
export class Register {
    private auth = inject(Auth)
    private router = inject(Router)
    private cdr = inject(ChangeDetectorRef)

    registerForm = new FormGroup({
        username: new FormControl("", Validators.required),
        email: new FormControl("", Validators.required),
        password: new FormControl("", Validators.required),
        confirm_password: new FormControl("", Validators.required)
    })

    onSubmit() {
        this.auth.register(this.registerForm.value.username ?? "", this.registerForm.value.email ?? "", this.registerForm.value.password ?? "", this.registerForm.value.confirm_password ?? ""
        ).subscribe({
            next: () => {
                this.router.navigate(["/login"])
            },
            error: (err) => {
                for (const field in err.error) {
                    const control = this.registerForm.get(field)
                    if (control) {
                        control.setErrors({ backend: err.error[field][0]})
                    }
                }
                this.cdr.markForCheck()
            }
        })
    }
}
