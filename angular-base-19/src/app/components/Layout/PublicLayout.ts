import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastComponent } from '../toast.component';

@Component({
  selector: 'app-public-layout',
  imports: [RouterOutlet, ToastComponent],
  template: `
      <app-toast></app-toast>
      <router-outlet></router-outlet>
  `
})
export class PublicLayout {}

