import { Component, inject, OnInit, HostListener } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { CrmService } from '../../core/services/crm.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen text-on-surface bg-background">
      <!-- Atmospheric Liquid Background -->
      <div class="liquid-bg">
        <div class="blob bg-primary w-[600px] h-[600px] -top-48 -left-48"></div>
        <div class="blob bg-secondary-container w-[500px] h-[500px] bottom-0 right-0"></div>
        <div class="blob bg-tertiary-container w-[400px] h-[400px] top-1/2 left-1/2"></div>
      </div>

      <!-- Desktop Sidebar -->
      <aside class="fixed left-0 top-0 h-screen w-[260px] bg-surface-container-lowest border-r border-outline-variant flex flex-col py-6 z-50 hidden md:flex">
        <div class="px-6 mb-8">
          <h1 class="font-bold text-[24px] text-primary tracking-tight">YALASOFT</h1>
          <p class="text-[12px] text-on-surface-variant opacity-70">sistema de ventas</p>
        </div>
        
        <nav class="flex-1 space-y-1">
          <a routerLink="/dashboard" routerLinkActive="bg-primary text-white" [routerLinkActiveOptions]="{exact: true}" class="flex items-center px-4 py-3 mx-2 my-1 text-on-surface-variant hover:bg-white/5 hover:text-on-surface rounded-lg transition-all">
            <span class="material-symbols-outlined mr-3">dashboard</span>
            <span class="font-semibold text-sm">Dashboard</span>
          </a>
          <a routerLink="/captaciones" routerLinkActive="bg-primary text-white" class="flex items-center px-4 py-3 mx-2 my-1 text-on-surface-variant hover:bg-white/5 hover:text-on-surface rounded-lg transition-all">
            <span class="material-symbols-outlined mr-3">dataset</span>
            <span class="font-semibold text-sm">Captaciones</span>
          </a>
          <a routerLink="/sales" routerLinkActive="bg-primary text-white" class="flex items-center px-4 py-3 mx-2 my-1 text-on-surface-variant hover:bg-white/5 rounded-lg transition-all">
              <span class="material-symbols-outlined mr-3">monetization_on</span>
              <span class="font-semibold text-sm">Ventas</span>
            </a>
          <a routerLink="/timeline" routerLinkActive="bg-primary text-white" class="flex items-center px-4 py-3 mx-2 my-1 text-on-surface-variant hover:bg-white/5 rounded-lg transition-all">
              <span class="material-symbols-outlined mr-3">event_repeat</span>
              <span class="font-semibold text-sm">Seguimientos</span>
            </a>
          <a routerLink="/profile" routerLinkActive="bg-primary text-white" class="flex items-center px-4 py-3 mx-2 my-1 text-on-surface-variant hover:bg-white/5 rounded-lg transition-all">
              <span class="material-symbols-outlined mr-3">person</span>
              <span class="font-semibold text-sm">Perfil</span>
            </a>
        </nav>

        <div class="px-4 mt-auto space-y-1 pt-6 border-t border-outline-variant">
          <button routerLink="/captaciones/quick" class="w-full bg-primary text-white py-3 px-4 rounded-lg font-bold shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all mb-4 flex items-center justify-center gap-2">
            <span class="material-symbols-outlined">add</span>
            Captación Rápida
          </button>
          
          <button (click)="onLogout()" class="w-full flex items-center px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
            <span class="material-symbols-outlined mr-3">logout</span>
            <span class="font-semibold text-sm">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      <!-- Off-Canvas Mobile Drawer -->
      <div *ngIf="isMobileMenuOpen" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden flex" (click)="toggleMobileMenu()">
        <aside class="w-[260px] h-full bg-surface-container-lowest border-r border-outline-variant flex flex-col py-6" (click)="$event.stopPropagation()">
          <div class="px-6 mb-8 flex justify-between items-center">
            <div>
              <h1 class="font-bold text-[24px] text-primary tracking-tight">YALASOFT</h1>
              <p class="text-[12px] text-on-surface-variant opacity-70">sistema de ventas</p>
            </div>
            <button (click)="toggleMobileMenu()" class="text-on-surface">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
          
          <nav class="flex-1 space-y-1">
            <a routerLink="/dashboard" routerLinkActive="bg-primary text-white" [routerLinkActiveOptions]="{exact: true}" class="flex items-center px-4 py-3 mx-2 my-1 text-on-surface-variant hover:bg-white/5 rounded-lg transition-all">
              <span class="material-symbols-outlined mr-3">dashboard</span>
              <span class="font-semibold text-sm">Dashboard</span>
            </a>
            <a routerLink="/captaciones" routerLinkActive="bg-primary text-white" class="flex items-center px-4 py-3 mx-2 my-1 text-on-surface-variant hover:bg-white/5 rounded-lg transition-all">
              <span class="material-symbols-outlined mr-3">dataset</span>
              <span class="font-semibold text-sm">Captaciones</span>
            </a>
            <a routerLink="/sales" routerLinkActive="bg-primary text-white" class="flex items-center px-4 py-3 mx-2 my-1 text-on-surface-variant hover:bg-white/5 rounded-lg transition-all">
              <span class="material-symbols-outlined mr-3">monetization_on</span>
              <span class="font-semibold text-sm">Ventas</span>
            </a>
            <a routerLink="/timeline" routerLinkActive="bg-primary text-white" class="flex items-center px-4 py-3 mx-2 my-1 text-on-surface-variant hover:bg-white/5 rounded-lg transition-all">
              <span class="material-symbols-outlined mr-3">event_repeat</span>
              <span class="font-semibold text-sm">Seguimientos</span>
            </a>
            <a routerLink="/profile" routerLinkActive="bg-primary text-white" class="flex items-center px-4 py-3 mx-2 my-1 text-on-surface-variant hover:bg-white/5 rounded-lg transition-all">
              <span class="material-symbols-outlined mr-3">person</span>
              <span class="font-semibold text-sm">Perfil</span>
            </a>
          </nav>

          <div class="px-4 mt-auto space-y-1 pt-6 border-t border-outline-variant">
            <button routerLink="/captaciones/quick" (click)="toggleMobileMenu()" class="w-full bg-primary text-white py-3 px-4 rounded-lg font-bold shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all mb-4 flex items-center justify-center gap-2">
              <span class="material-symbols-outlined">add</span>
              Captación Rápida
            </button>
            <button (click)="onLogout()" class="w-full flex items-center px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
              <span class="material-symbols-outlined mr-3">logout</span>
              <span class="font-semibold text-sm">Cerrar Sesión</span>
            </button>
          </div>
        </aside>
      </div>

      <!-- Top Header -->
      <header class="fixed top-0 right-0 w-full md:w-[calc(100%-260px)] h-16 glass-panel flex justify-between items-center px-6 md:px-8 z-40 border-b border-outline-variant">
        <div class="flex items-center">
          <button (click)="toggleMobileMenu()" class="md:hidden mr-4 text-on-surface">
            <span class="material-symbols-outlined">menu</span>
          </button>
          
          <div class="relative group hidden sm:block">
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
            <input type="text" placeholder="Búsqueda rápida..." class="pl-10 pr-4 py-1.5 bg-surface-container-low border border-outline-variant rounded-lg text-body-md focus:ring-1 focus:ring-primary focus:border-primary transition-all w-64 text-on-surface outline-none" />
          </div>
        </div>

        <div class="flex items-center space-x-6">
          <div class="relative">
            <button (click)="toggleNotifications($event)" class="relative text-on-surface-variant hover:text-primary transition-colors p-2 rounded-full hover:bg-white/5 active:scale-95 transition-all">
              <span class="material-symbols-outlined">notifications</span>
              <span *ngIf="unreadCount > 0" class="absolute top-1 right-1 w-2.5 h-2.5 bg-primary rounded-full ring-2 ring-surface-container-lowest animate-pulse"></span>
            </button>
            
            <!-- Notifications Dropdown Menu -->
            <div *ngIf="isNotificationsOpen" 
                 class="absolute right-0 mt-3 w-80 max-h-[420px] glass-card rounded-2xl border border-outline-variant shadow-2xl p-4 z-50 flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
                 (click)="$event.stopPropagation()">
              
              <div class="flex justify-between items-center mb-3 pb-2 border-b border-white/10">
                <span class="font-bold text-sm text-white">Notificaciones</span>
                <button *ngIf="unreadCount > 0" (click)="clearNotifications()" class="text-[10px] text-primary hover:underline font-semibold uppercase">Marcar como leídas</button>
              </div>

              <!-- Notifications list container -->
              <div class="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar max-h-[300px]">
                <div *ngFor="let notif of notificationsList" 
                     (click)="onNotificationClick(notif)"
                     class="flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all cursor-pointer group">
                  <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                       [ngClass]="getNotifBgClass(notif.type)">
                    <span class="material-symbols-outlined text-[18px]">{{ getNotifIcon(notif.type) }}</span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-xs font-bold text-on-surface group-hover:text-white transition-colors truncate">{{ notif.title }}</p>
                    <p class="text-[11px] text-on-surface-variant line-clamp-2 mt-0.5">{{ notif.description }}</p>
                    <span class="text-[9px] text-outline font-mono mt-1 block">{{ notif.time }}</span>
                  </div>
                </div>

                <!-- Empty state -->
                <div *ngIf="notificationsList.length === 0" class="flex flex-col items-center justify-center py-12 text-center text-on-surface-variant space-y-2">
                  <span class="material-symbols-outlined text-[32px] opacity-40">notifications_off</span>
                  <p class="text-xs font-semibold">No tienes notificaciones</p>
                  <p class="text-[10px] text-outline">Todo al día por aquí</p>
                </div>
              </div>
              
              <div class="pt-2 border-t border-white/10 text-center mt-2">
                <a routerLink="/dashboard" (click)="isNotificationsOpen = false" class="text-xs text-primary hover:underline font-semibold uppercase">Ir al Panel General</a>
              </div>
            </div>
          </div>
          
          <div class="flex items-center gap-3 pl-4 border-l border-outline-variant">
            <div class="text-right hidden sm:block">
              <p class="font-bold text-sm text-on-surface">{{ username }}</p>
              <p class="text-[10px] text-primary uppercase tracking-widest font-semibold">{{ roleName }}</p>
            </div>
            <img [src]="avatar || 'https://ui-avatars.com/api/?name=' + username + '&background=6366f1&color=fff&size=128'" alt="Avatar" class="w-10 h-10 rounded-lg border border-outline-variant object-cover" />
          </div>
        </div>
      </header>

      <!-- Main Layout Viewport -->
      <main class="pt-24 pb-24 md:pb-12 px-4 md:px-8 md:ml-[260px] max-w-[1440px] mx-auto min-h-screen">
        <router-outlet></router-outlet>
      </main>

      <!-- Mobile Floating Action Button -->
      <button routerLink="/captaciones/quick" class="md:hidden fixed bottom-20 right-6 w-14 h-14 bg-primary text-white rounded-xl shadow-2xl flex items-center justify-center active:scale-90 transition-transform z-50">
        <span class="material-symbols-outlined text-[28px]">add</span>
      </button>

      <!-- Mobile Bottom Navigation -->
      <nav class="md:hidden bg-surface-container/80 backdrop-blur-[20px] text-primary docked full-width bottom-0 rounded-t-xl border-t border-white/10 shadow-lg fixed bottom-0 left-0 w-full z-40 flex justify-around items-center px-4 py-3 pb-safe">
        <a routerLink="/dashboard" routerLinkActive="text-primary font-bold bg-primary/10 rounded-xl px-3 py-1.5" [routerLinkActiveOptions]="{exact: true}" class="flex flex-col items-center justify-center text-on-surface-variant opacity-70 transition-all">
          <span class="material-symbols-outlined">dashboard</span>
          <span class="text-[10px]">Dashboard</span>
        </a>
        <a routerLink="/captaciones" routerLinkActive="text-primary font-bold bg-primary/10 rounded-xl px-3 py-1.5" class="flex flex-col items-center justify-center text-on-surface-variant opacity-70 transition-all">
          <span class="material-symbols-outlined">person_search</span>
          <span class="text-[10px]">Captar</span>
        </a>
        <a routerLink="/sales" routerLinkActive="text-primary font-bold bg-primary/10 rounded-xl px-3 py-1.5" class="flex flex-col items-center justify-center text-on-surface-variant opacity-70 transition-all">
          <span class="material-symbols-outlined">payments</span>
          <span class="text-[10px]">Ventas</span>
        </a>
        <a routerLink="/timeline" routerLinkActive="text-primary font-bold bg-primary/10 rounded-xl px-3 py-1.5" class="flex flex-col items-center justify-center text-on-surface-variant opacity-70 transition-all">
          <span class="material-symbols-outlined">event_repeat</span>
          <span class="text-[10px]">Seguimiento</span>
        </a>
        <a routerLink="/profile" routerLinkActive="text-primary font-bold bg-primary/10 rounded-xl px-3 py-1.5" class="flex flex-col items-center justify-center text-on-surface-variant opacity-70 transition-all">
          <span class="material-symbols-outlined">account_circle</span>
          <span class="text-[10px]">Perfil</span>
        </a>
      </nav>
    </div>
  `
})
export class AdminLayoutComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private crmService = inject(CrmService);

  isMobileMenuOpen = false;

  // Notifications properties
  notificationsList: any[] = [];
  unreadCount = 0;
  isNotificationsOpen = false;

  @HostListener('document:click')
  onDocumentClick() {
    this.isNotificationsOpen = false;
  }

  toggleNotifications(event: MouseEvent) {
    event.stopPropagation();
    this.isNotificationsOpen = !this.isNotificationsOpen;
  }

  clearNotifications() {
    this.unreadCount = 0;
  }

  onNotificationClick(notif: any) {
    this.isNotificationsOpen = false;
    this.router.navigate([notif.route]);
  }

  getNotifBgClass(type: string): string {
    if (type === 'visit') return 'bg-primary/20 text-primary';
    if (type === 'followup') return 'bg-orange-500/20 text-orange-400';
    if (type === 'captacion') return 'bg-green-500/20 text-green-400';
    return 'bg-blue-500/20 text-blue-400';
  }

  getNotifIcon(type: string): string {
    if (type === 'visit') return 'calendar_today';
    if (type === 'followup') return 'chat';
    if (type === 'captacion') return 'storefront';
    return 'info';
  }

  get username(): string {
    const user = this.authService.getUser();
    return user ? user.username : 'Usuario';
  }

  get roleName(): string {
    const role = this.authService.getRole();
    if (role === 'admin') return 'Administrador';
    if (role === 'seller') return 'Vendedor';
    return '';
  }

  get avatar(): string {
    const user = this.authService.getUser();
    return user?.avatar || '';
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  ngOnInit() {
    // Close mobile menu on each navigation end to ensure content is visible
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.isMobileMenuOpen = false;
      }
    });

    this.loadNotifications();
  }

  loadNotifications() {
    const role = this.authService.getRole();
    if (!role) return;

    this.crmService.getDashboardStats().subscribe({
      next: (data) => {
        const list: any[] = [];
        if (role === 'admin') {
          // Admin sees recent activity stream as notifications
          if (data.activities && data.activities.length > 0) {
            data.activities.forEach((act: any) => {
              list.push({
                type: act.type,
                title: act.title,
                description: `${act.user}: ${act.description}`,
                time: this.formatRelativeTime(act.date),
                route: act.type === 'visit' ? '/dashboard' : (act.type === 'captacion' ? '/captaciones' : '/timeline')
              });
            });
          }
        } else {
          // Seller sees pending followups and upcoming visits as notifications
          if (data.pending_followups && data.pending_followups.length > 0) {
            data.pending_followups.forEach((f: any) => {
              list.push({
                type: 'followup',
                title: `Seguimiento: ${f.captacion.business_name}`,
                description: f.notes || 'Sin notas del seguimiento',
                time: f.next_contact ? `Contacto: ${this.formatRelativeTime(f.next_contact)}` : 'Pendiente hoy',
                route: '/timeline'
              });
            });
          }
          if (data.upcoming_visits && data.upcoming_visits.length > 0) {
            data.upcoming_visits.forEach((v: any) => {
              list.push({
                type: 'visit',
                title: `Visita: ${v.captacion.business_name}`,
                description: v.notes || 'Visita agendada',
                time: `Fecha: ${this.formatRelativeTime(v.visit_date)}`,
                route: '/dashboard'
              });
            });
          }
        }
        this.notificationsList = list;
        this.unreadCount = list.length;
      },
      error: () => {
        // ignore
      }
    });
  }

  formatRelativeTime(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  }

  onLogout() {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: () => {
        // Fallback en caso de que falle la petición de logout API
        this.authService.clearSession();
        this.router.navigate(['/login']);
      }
    });
  }
}
