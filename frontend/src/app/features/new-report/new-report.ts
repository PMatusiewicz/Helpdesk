import { Component, inject, signal } from '@angular/core';
import { CategoryService, CategoryResponse } from '../../core/category-service';
import { ReportService } from '../../core/report-service';
import { Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-new-report',
  styleUrl: './new-report.css',
  templateUrl: './new-report.html',
})
export class NewReport {
    private report = inject(ReportService)
    private category = inject(CategoryService)
    private router = inject(Router)

    categories = signal<CategoryResponse[]>([])
    errorMessage = signal("")

    constructor() {
        this.category.getCategories().subscribe(response => {
            this.categories.set(response)
        })
    }

    reportForm = new FormGroup({
        title: new FormControl("", [Validators.required, Validators.minLength(5)]),
        description: new FormControl("", [Validators.required, Validators.minLength(20)]),
        category: new FormControl("", Validators.required),
        priority: new FormControl("", Validators.required),
    })

    onSubmit() {
        this.report.createReport(this.reportForm.value.title ?? "", this.reportForm.value.description ?? "", Number(this.reportForm.value.category), this.reportForm.value.priority ?? ""
        ).subscribe({
            next: () => {
                // TODO change to redirect to details of report, list of reports for now while details component isnt created
                this.router.navigate(["/reports/list"])
            },
            error: (err) => {
                this.errorMessage.set("Złe dane formularza")
            }
        })
    }
}
