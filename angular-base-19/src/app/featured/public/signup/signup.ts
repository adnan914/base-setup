import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormControlsOf, SignupType } from '../../../shared';
import { ApiService } from '../../../core/services/api.service';
import { API_ROUTES } from '../../../constants/api.routes.constant';

@Component({
  standalone: true,
  selector: 'app-signup',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './signup.html',
  styleUrls: ['./signup.css']
})
export class Signup {
  form: FormGroup<FormControlsOf<SignupType>>;

  constructor(private fb: FormBuilder, private api: ApiService) {
    this.form = this.fb.group({
      name: this.fb.control('', { nonNullable: true, validators: [Validators.required] }),
      email: this.fb.control('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
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
    this.api.post(API_ROUTES.SIGNUP, this.form.value);
  }
}
