import { Component, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormControlsOf, ForgotPasswordType } from '../../../shared';
import { ApiService } from '../../../core/services/api.service';
import { API_ROUTES } from '../../../constants/api.routes.constant';

@Component({
  standalone: true,
  selector: 'app-forgot-password',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.css']
})
export class ForgotPassword {
  loading = signal(false);
  form: FormGroup<FormControlsOf<ForgotPasswordType>>;

  constructor(private fb: FormBuilder, private api: ApiService) { 
    this.form = this.fb.group({
      email: this.fb.control('', { nonNullable: true, validators:[Validators.required, Validators.email] })
    })
  }

  submit() {
    if (this.form.invalid) return;

    this.api.post(API_ROUTES.FORGOT_PASSWORD, this.form.value);
  }
}
