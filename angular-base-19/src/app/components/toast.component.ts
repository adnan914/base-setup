import { Component } from '@angular/core';
import { ToastService, Toast } from '../core/services/toaster.service';
import { CommonModule } from '@angular/common';
import { NgFor, NgClass } from '@angular/common';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-4 right-4 flex flex-col gap-2 z-50">
      <div *ngFor="let toast of toastService.messages()" 
          [ngClass]="{
            'bg-green-500': toast.type === 'success',
            'bg-red-500': toast.type === 'error',
            'bg-yellow-400': toast.type === 'warning',
            'bg-blue-500': toast.type === 'info'
          }"
          class="text-white px-4 py-2 rounded shadow-lg animate-slide-in">
        {{ toast.message }}
      </div>
  </div>
  `
})
export class ToastComponent {
  constructor(public toastService: ToastService) { }
}
