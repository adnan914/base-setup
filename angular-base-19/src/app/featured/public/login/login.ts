import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';
import { FormControlsOf, LoginType } from '../../../shared';
import { API_ROUTES } from '../../../constants/api.routes.constant';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {

  form: FormGroup<FormControlsOf<LoginType>>;

  constructor(private fb: FormBuilder, private api: ApiService) {
    this.form = this.fb.group({
      email: this.fb.control('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
      password: this.fb.control('', { nonNullable: true, validators: Validators.required }),
    })
  }

  submit() {
    if (this.form.invalid) return;
    this.api.post(API_ROUTES.LOGIN, this.form.value as LoginType);
  }
}
