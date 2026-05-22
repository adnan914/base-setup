import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormControlsOf, ResetPasswordType } from '../../../shared';
import { API_ROUTES } from '../../../constants/api.routes.constant';
import { ApiService } from '../../../core/services/api.service';

@Component({
  standalone: true,
  selector: 'app-reset-password',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reset-password.html',
  styleUrls: ['./reset-password.css']
})

export class ResetPassword {
  form: FormGroup<FormControlsOf<ResetPasswordType>>;


  constructor(private fb: FormBuilder, private api: ApiService) {
    this.form = this.fb.group({
      token: this.fb.control('', { nonNullable: true, validators: [Validators.required] }),
      password: this.fb.control('', { nonNullable: true, validators: [Validators.required, Validators.minLength(6)] }),
      confirmPassword: this.fb.control('', { nonNullable: true, validators: [Validators.required] })
    });
  }

  submit() {
    if (this.form.invalid) return;

    const { password, confirmPassword } = this.form.value;
    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    this.api.post(API_ROUTES.RESET_PASSWORD, this.form.value);
  }

}