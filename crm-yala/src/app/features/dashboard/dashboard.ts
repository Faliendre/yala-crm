import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CrmService } from '../../core/services/crm.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-8">
      <!-- Header Section -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 class="font-bold text-3xl md:text-4xl text-on-surface tracking-tight">
            {{ isAdmin ? 'Panel Ejecutivo' : 'Mi Panel' }}
          </h2>
          <p class="text-on-surface-variant text-base">
            {{ isAdmin ? 'Resumen general y métricas de ventas en tiempo real.' : 'Control de tus prospectos y metas de la semana.' }}
          </p>
        </div>
        <div class="flex items-center gap-1 bg-surface-container rounded-lg p-1 border border-outline-variant text-sm">
          <button class="px-4 py-1.5 bg-primary text-white shadow-sm rounded-md">Diario</button>
          <button class="px-4 py-1.5 text-on-surface-variant hover:text-on-surface transition-colors rounded-md">Semanal</button>
          <button class="px-4 py-1.5 text-on-surface-variant hover:text-on-surface transition-colors rounded-md">Mensual</button>
        </div>
      </div>

      <div *ngIf="isLoading" class="flex items-center justify-center py-20">
        <span class="material-symbols-outlined animate-spin text-[40px] text-primary">sync</span>
        <span class="ml-2 text-on-surface-variant">Cargando métricas de rendimiento...</span>
      </div>

      <div *ngIf="!isLoading">
        <!-- ================= ADMIN DASHBOARD ================= -->
        <div *ngIf="isAdmin" class="space-y-8">
          <!-- KPI Cards -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div class="glass-card p-5 rounded-xl border-l-4 border-l-primary hover:translate-y-[-2px] transition-all">
              <div class="flex justify-between items-start mb-2">
                <p class="text-[11px] font-bold text-outline uppercase tracking-wider">Total Captaciones</p>
                <span class="text-green-400 text-xs font-bold flex items-center">+12%</span>
              </div>
              <h3 class="text-3xl font-bold text-on-surface">{{ adminMetrics.total_captaciones }}</h3>
              <div class="mt-3 w-full bg-white/5 h-1 rounded-full overflow-hidden">
                <div class="bg-primary h-full w-[70%] shadow-[0_0_8px_#0055ff]"></div>
              </div>
            </div>

            <div class="glass-card p-5 rounded-xl border-l-4 border-l-secondary hover:translate-y-[-2px] transition-all">
              <div class="flex justify-between items-start mb-2">
                <p class="text-[11px] font-bold text-outline uppercase tracking-wider">Ventas Cerradas</p>
                <span class="text-green-400 text-xs font-bold flex items-center">+8.2%</span>
              </div>
              <h3 class="text-3xl font-bold text-on-surface">{{ adminMetrics.total_sales }}</h3>
              <div class="mt-3 w-full bg-white/5 h-1 rounded-full overflow-hidden">
                <div class="bg-secondary h-full w-[55%]"></div>
              </div>
            </div>

            <div class="glass-card p-5 rounded-xl border-l-4 border-l-white hover:translate-y-[-2px] transition-all">
              <div class="flex justify-between items-start mb-2">
                <p class="text-[11px] font-bold text-outline uppercase tracking-wider">Ingresos Netos</p>
                <span class="text-red-400 text-xs font-bold flex items-center">-2.4%</span>
              </div>
              <h3 class="text-3xl font-bold text-on-surface">Bs. {{ formatMoney(adminMetrics.revenue) }}</h3>
              <div class="mt-3 w-full bg-white/5 h-1 rounded-full overflow-hidden">
                <div class="bg-white h-full w-[85%]"></div>
              </div>
            </div>

            <div class="glass-card p-5 rounded-xl border-l-4 border-l-primary/50 hover:translate-y-[-2px] transition-all">
              <div class="flex justify-between items-start mb-2">
                <p class="text-[11px] font-bold text-outline uppercase tracking-wider">Comisiones</p>
                <span class="text-green-400 text-xs font-bold flex items-center">+18%</span>
              </div>
              <h3 class="text-3xl font-bold text-on-surface">Bs. {{ formatMoney(adminMetrics.total_commissions) }}</h3>
              <div class="mt-3 w-full bg-white/5 h-1 rounded-full overflow-hidden">
                <div class="bg-primary/55 h-full w-[40%]"></div>
              </div>
            </div>

            <div class="glass-card p-5 rounded-xl border-l-4 border-l-primary hover:translate-y-[-2px] transition-all">
              <div class="flex justify-between items-start mb-2">
                <p class="text-[11px] font-bold text-outline uppercase tracking-wider">Conversión</p>
                <span class="text-green-400 text-xs font-bold flex items-center">+4.1%</span>
              </div>
              <h3 class="text-3xl font-bold text-on-surface">{{ adminMetrics.conversion_rate }}%</h3>
              <div class="mt-3 w-full bg-white/5 h-1 rounded-full overflow-hidden">
                <div class="bg-primary h-full w-[35%]"></div>
              </div>
            </div>
          </div>

          <!-- Middle Bento: Performance & Ranking -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Performance Chart -->
            <div class="lg:col-span-2 glass-card rounded-xl p-6">
              <div class="flex justify-between items-center mb-10">
                <div>
                  <h4 class="font-bold text-lg text-on-surface">Evolución de Ventas</h4>
                  <p class="text-xs text-outline">Análisis técnico de ingresos facturados.</p>
                </div>
                <div class="flex gap-2">
                  <button class="bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded text-xs font-bold">Ventas</button>
                  <button class="bg-transparent text-outline hover:text-on-surface px-3 py-1 rounded text-xs transition-colors">Crecimiento</button>
                </div>
              </div>
              
              <!-- Simplified Visual Graph -->
              <div class="h-[220px] flex items-end justify-between gap-3 px-2 border-b border-outline-variant/30">
                <div *ngFor="let bar of monthlyStats; let i = index" 
                     class="flex-1 chart-bar rounded-t-[2px] transition-all"
                     [ngStyle]="{'height': (bar.revenue / maxRevenue * 90 + 10) + '%'}"
                     [class.active]="i === monthlyStats.length - 1"
                     [title]="bar.month + ': Bs. ' + formatMoney(bar.revenue)">
                </div>
              </div>
              <div class="flex justify-between mt-4 text-[10px] text-outline uppercase font-mono tracking-widest px-2">
                <span *ngFor="let bar of monthlyStats">{{ formatMonth(bar.month) }}</span>
              </div>
            </div>

            <!-- Top Performers Ranking -->
            <div class="glass-card rounded-xl p-6 flex flex-col justify-between">
              <div>
                <h4 class="font-bold text-lg text-on-surface mb-6 flex justify-between items-center">
                  Vendedores Top
                  <span class="material-symbols-outlined text-outline cursor-pointer hover:text-on-surface transition-colors">more_horiz</span>
                </h4>
                <div class="space-y-4">
                  <div *ngFor="let seller of ranking; let idx = index" 
                       class="flex items-center gap-3 p-3 rounded-lg border transition-all"
                       [class.bg-primary/5]="idx === 0"
                       [class.border-primary/20]="idx === 0"
                       [class.border-transparent]="idx > 0">
                    <div class="h-10 w-10 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center font-bold"
                         [class.text-primary]="idx === 0"
                         [class.border-primary/30]="idx === 0">
                      0{{ idx + 1 }}
                    </div>
                    <div class="flex-1">
                      <p class="font-bold text-sm text-on-surface">{{ seller.username }}</p>
                      <p class="text-xs text-outline">Bs. {{ formatMoney(seller.sales_sum) }} Vendido</p>
                    </div>
                    <span *ngIf="idx === 0" class="bg-green-400/20 text-green-400 border border-green-400/30 px-2 py-0.5 rounded text-[10px] font-bold">LÍDER</span>
                  </div>
                </div>
              </div>
              <button routerLink="/sales" class="w-full text-center py-2 text-primary text-xs hover:underline mt-4 uppercase font-bold tracking-tight">Ver Todas las Ventas</button>
            </div>
          </div>

          <!-- Bottom Bento: Timeline and Activity Stream -->
          <div class="glass-card rounded-xl overflow-hidden">
            <div class="p-6 border-b border-outline-variant flex justify-between items-center">
              <h4 class="font-bold text-lg text-white">Flujo de Actividad Reciente</h4>
              <span class="text-xs text-outline uppercase tracking-wider">Log de Sistema</span>
            </div>
            <div class="divide-y divide-outline-variant">
              <div *ngFor="let act of activities" class="p-6 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                <div class="flex items-center gap-4">
                  <div class="w-10 h-10 rounded-lg flex items-center justify-center"
                       [class.bg-primary/20]="act.type === 'visit'"
                       [class.text-primary]="act.type === 'visit'"
                       [class.bg-orange-500/20]="act.type === 'followup'"
                       [class.text-orange-400]="act.type === 'followup'"
                       [class.bg-green-500/20]="act.type === 'captacion'"
                       [class.text-green-400]="act.type === 'captacion'">
                    <span class="material-symbols-outlined">{{ act.type === 'visit' ? 'calendar_today' : (act.type === 'followup' ? 'chat' : 'storefront') }}</span>
                  </div>
                  <div>
                    <h5 class="font-bold text-sm text-on-surface">{{ act.title }}</h5>
                    <p class="text-xs text-on-surface-variant mt-1">{{ act.description }}</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-xs font-mono text-outline">{{ formatDate(act.date) }}</p>
                  <p class="text-[10px] text-primary uppercase font-bold tracking-wider mt-1">{{ act.user }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ================= SELLER DASHBOARD ================= -->
        <div *ngIf="!isAdmin" class="space-y-8">
          <!-- Bento Grid KPIs -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            <!-- Bento Box: Metrics Summary -->
            <div class="lg:col-span-3 grid grid-cols-1 gap-4">
              <div class="glass-panel rounded-xl p-6 card-elevation tech-border flex flex-col justify-between">
                <div class="flex justify-between items-start mb-4">
                  <span class="material-symbols-outlined text-primary">dataset</span>
                  <span class="text-primary text-[10px] font-bold border border-primary/30 px-2 py-0.5 rounded uppercase">Cartera</span>
                </div>
                <div>
                  <h3 class="text-sm font-semibold text-on-surface-variant mb-1">Mis Captaciones</h3>
                  <p class="text-5xl font-bold text-on-surface">{{ sellerMetrics.my_captaciones }}</p>
                </div>
                <div class="mt-4 text-green-400 text-xs flex items-center">
                  <span class="material-symbols-outlined text-[14px] mr-1">trending_up</span> +12% este mes
                </div>
              </div>

              <div class="glass-panel rounded-xl p-6 card-elevation tech-border flex flex-col justify-between">
                <div class="flex justify-between items-start mb-4">
                  <span class="material-symbols-outlined text-primary">payments</span>
                  <span class="text-primary text-[10px] font-bold border border-primary/30 px-2 py-0.5 rounded uppercase">Ganado</span>
                </div>
                <div>
                  <h3 class="text-sm font-semibold text-on-surface-variant mb-1">Mis Comisiones</h3>
                  <p class="text-4xl font-bold text-on-surface">Bs. {{ formatMoney(sellerMetrics.my_commission) }}</p>
                </div>
                <div class="mt-4 text-xs text-outline-variant italic">
                  Acumulado de ventas confirmadas
                </div>
              </div>
            </div>

            <!-- Bento Box: Weekly Goal -->
            <div class="lg:col-span-6 glass-panel rounded-xl p-6 card-elevation tech-border flex flex-col justify-between">
              <div>
                <div class="flex justify-between items-center mb-6">
                  <h3 class="font-bold text-lg text-on-surface">Meta Semanal de Captaciones</h3>
                  <span class="text-xs font-mono font-bold text-primary">{{ sellerMetrics.weekly_goal_completion }}% COMPLETADO</span>
                </div>
                <p class="text-sm text-on-surface-variant mb-4">Sigue captando negocios locales. Cada registro te acerca a tu meta y comisiones.</p>
              </div>
              <div class="space-y-4">
                <div class="flex justify-between items-end text-sm">
                  <span class="text-on-surface-variant text-xs uppercase tracking-wider">Objetivo Semanal</span>
                  <span class="text-on-surface font-bold text-lg">{{ sellerMetrics.weekly_captures }} / {{ sellerMetrics.weekly_goal }}</span>
                </div>
                <div class="w-full h-4 bg-surface-container-highest rounded-full overflow-hidden p-0.5 border border-outline-variant">
                  <div class="h-full bg-primary rounded-full transition-all duration-1000" [ngStyle]="{'width': sellerMetrics.weekly_goal_completion + '%'}"></div>
                </div>
              </div>
            </div>

            <!-- Bento Box: Conversion Rate -->
            <div class="lg:col-span-3 glass-panel rounded-xl p-6 card-elevation tech-border flex flex-col justify-between">
              <div class="flex justify-between items-start mb-4">
                <span class="material-symbols-outlined text-primary">analytics</span>
                <span class="text-primary text-[10px] font-bold border border-primary/30 px-2 py-0.5 rounded uppercase">Eficacia</span>
              </div>
              <div>
                <h3 class="text-sm font-semibold text-on-surface-variant mb-1">Tasa de Conversión</h3>
                <p class="text-5xl font-bold text-on-surface">{{ sellerMetrics.conversion_rate }}%</p>
              </div>
              <p class="text-on-surface-variant text-[10px] mt-4 uppercase tracking-wider italic">Captaciones concretadas en venta</p>
            </div>

          </div>

          <!-- Bottom: Visits of the day & Urgent Followups -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Urgent Followups -->
            <div class="lg:col-span-2 glass-panel rounded-xl border border-outline-variant overflow-hidden flex flex-col">
              <div class="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
                <div class="flex items-center gap-3">
                  <h3 class="font-bold text-lg text-on-surface">Seguimientos Urgentes</h3>
                  <span class="bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded text-[10px] font-bold">
                    {{ pendingFollowups.length }} PENDIENTES
                  </span>
                </div>
                <button routerLink="/timeline" class="text-primary hover:text-primary-container font-semibold text-sm transition-colors">Ver todos</button>
              </div>
              <div class="divide-y divide-outline-variant flex-1">
                <div *ngFor="let followup of pendingFollowups" class="p-6 hover:bg-white/[0.02] transition-colors flex items-center gap-4 group">
                  <div class="w-12 h-12 rounded-lg bg-surface-container-high border border-outline-variant flex-shrink-0 flex items-center justify-center">
                    <span class="material-symbols-outlined text-primary">chat</span>
                  </div>
                  <div class="flex-1">
                    <h4 class="font-bold text-sm text-on-surface">{{ followup.captacion.business_name }}</h4>
                    <p class="text-xs text-on-surface-variant mt-1">{{ followup.notes }}</p>
                  </div>
                  <div class="text-right">
                    <span class="inline-block px-2 py-0.5 text-primary text-[10px] font-bold border border-primary/30 rounded mb-2 uppercase">
                      {{ followup.next_contact ? formatDate(followup.next_contact) : 'Pendiente' }}
                    </span>
                    <div class="flex gap-2 justify-end">
                      <a [href]="'tel:' + followup.captacion.phone" class="w-8 h-8 rounded-md border border-outline-variant flex items-center justify-center hover:bg-primary hover:border-primary text-on-surface-variant hover:text-white transition-all">
                        <span class="material-symbols-outlined text-[18px]">call</span>
                      </a>
                      <a [href]="'https://wa.me/' + followup.captacion.phone.replace('+', '')" target="_blank" class="w-8 h-8 rounded-md border border-outline-variant flex items-center justify-center hover:bg-green-600 hover:border-green-600 text-on-surface-variant hover:text-white transition-all">
                        <span class="material-symbols-outlined text-[18px]">chat</span>
                      </a>
                    </div>
                  </div>
                </div>
                
                <div *ngIf="pendingFollowups.length === 0" class="flex flex-col items-center justify-center py-12 text-on-surface-variant space-y-2">
                  <span class="material-symbols-outlined text-[36px] opacity-40">task_alt</span>
                  <p class="text-xs">No tienes seguimientos pendientes para hoy.</p>
                </div>
              </div>
            </div>

            <!-- Visits of the day -->
            <div class="glass-panel rounded-xl border border-outline-variant flex flex-col">
              <div class="p-6 border-b border-outline-variant bg-surface-container-low">
                <h3 class="font-bold text-lg text-on-surface">Visitas Programadas</h3>
              </div>
              <div class="p-6 flex-1 relative custom-scrollbar overflow-y-auto max-h-[360px]">
                <div *ngIf="upcomingVisits.length > 0" class="space-y-6 relative before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-outline-variant">
                  <div *ngFor="let visit of upcomingVisits" class="relative pl-10">
                    <div class="absolute left-0 top-1 w-6 h-6 rounded bg-primary flex items-center justify-center ring-4 ring-background z-10">
                      <span class="material-symbols-outlined text-white text-[12px]">calendar_today</span>
                    </div>
                    <p class="font-mono text-xs text-primary font-bold">{{ formatDate(visit.visit_date) }}</p>
                    <h4 class="font-bold text-sm text-on-surface mt-1">Reunión en {{ visit.captacion.business_name }}</h4>
                    <p class="text-on-surface-variant text-xs flex items-center gap-1 mt-1">
                      <span class="material-symbols-outlined text-[14px]">location_on</span> {{ visit.captacion.address }}
                    </p>
                    
                    <a *ngIf="visit.captacion.google_maps"
                       [href]="'https://www.google.com/maps/search/?api=1&query=' + visit.captacion.google_maps" 
                       target="_blank" 
                       class="mt-3 inline-block text-center py-1.5 px-3 border border-outline-variant text-on-surface-variant rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-white/5 hover:text-on-surface transition-all">
                      Abrir Navegador GPS
                    </a>
                  </div>
                </div>

                <div *ngIf="upcomingVisits.length === 0" class="flex flex-col items-center justify-center h-full text-on-surface-variant space-y-2 py-12">
                  <span class="material-symbols-outlined text-[36px] opacity-40">calendar_today</span>
                  <p class="text-xs">No tienes visitas agendadas para hoy.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  private crmService = inject(CrmService);
  private authService = inject(AuthService);

  isLoading = true;
  isAdmin = false;

  // Admin Dashboard States
  adminMetrics = {
    total_captaciones: 0,
    total_sales: 0,
    revenue: 0,
    conversion_rate: 0,
    total_commissions: 0
  };
  ranking: any[] = [];
  monthlyStats: any[] = [];
  activities: any[] = [];
  maxRevenue = 1;

  // Seller Dashboard States
  sellerMetrics = {
    my_captaciones: 0,
    my_sales: 0,
    my_commission: 0,
    conversion_rate: 0,
    weekly_captures: 0,
    weekly_goal: 20,
    weekly_goal_completion: 0
  };
  pendingFollowups: any[] = [];
  upcomingVisits: any[] = [];

  ngOnInit() {
    this.isAdmin = this.authService.getRole() === 'admin';
    this.loadStats();
  }

  loadStats() {
    this.crmService.getDashboardStats().subscribe({
      next: (data) => {
        if (this.isAdmin) {
          this.adminMetrics = data.metrics;
          this.ranking = data.ranking;
          this.monthlyStats = data.monthly_stats;
          this.activities = data.activities;

          this.maxRevenue = Math.max(...this.monthlyStats.map(item => Number(item.revenue)), 1);
        } else {
          this.sellerMetrics = data.metrics;
          this.pendingFollowups = data.pending_followups;
          this.upcomingVisits = data.upcoming_visits;
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  formatMoney(value: number | string): string {
    const num = Number(value);
    if (isNaN(num)) return '0.00';
    return num.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  }

  formatMonth(monthStr: string): string {
    const parts = monthStr.split('-');
    if (parts.length < 2) return monthStr;
    const monthIndex = parseInt(parts[1]) - 1;
    const months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
    return months[monthIndex] || monthStr;
  }
}
