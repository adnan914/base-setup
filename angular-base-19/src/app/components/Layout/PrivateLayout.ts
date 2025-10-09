import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-private-layout',
  imports: [RouterOutlet],
  template: `
    <header class="p-4 bg-blue-500 text-white">Header</header>
    <router-outlet></router-outlet>
    <footer class="p-4 bg-gray-200 text-center">Footer</footer>
  `
})
export class PrivateLayout {}