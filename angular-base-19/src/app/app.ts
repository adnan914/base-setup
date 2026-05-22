import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastComponent } from '../app/components/toast.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastComponent],
  template: `
     <app-toast></app-toast>
     <router-outlet></router-outlet>
  `
})

export class App {
  protected readonly title = signal('angular-base');
}
