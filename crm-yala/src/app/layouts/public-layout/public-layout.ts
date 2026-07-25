import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="min-h-screen relative flex items-center justify-center overflow-x-hidden selection:bg-primary selection:text-white">
      <!-- Ambient Liquid Background -->
      <div class="liquid-bg">
        <div class="blob bg-primary-container w-[500px] h-[500px] -top-20 -left-20"></div>
        <div class="blob bg-secondary-container w-[400px] h-[400px] bottom-10 right-10" style="animation-delay: -5s;"></div>
        <div class="blob bg-tertiary-container w-[300px] h-[300px] top-1/2 left-1/3" style="animation-delay: -2s;"></div>
      </div>
      
      <!-- Content Viewport -->
      <div class="w-full max-w-md z-10 p-6">
        <router-outlet></router-outlet>
      </div>

      <!-- Background Decoration Overlay -->
      <div class="fixed inset-0 pointer-events-none border-[12px] border-white/5 rounded-[40px] m-4 md:m-8 mix-blend-overlay"></div>
    </div>
  `
})
export class PublicLayoutComponent {}
