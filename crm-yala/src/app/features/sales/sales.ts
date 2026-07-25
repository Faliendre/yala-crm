import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CrmService } from '../../core/services/crm.service';
import { AuthService } from '../../core/services/auth.service';
import { Router, NavigationEnd } from '@angular/router';
import { Sale } from '../../shared/interfaces/crm.interface';

@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-8">
      <!-- Header & Stats -->
      <div class="flex flex-col md:flex-row justify-between items-end gap-6 mb-4">
        <div>
          <h2 class="font-bold text-3xl text-primary tracking-tight">Gestión de Ventas</h2>
          <p class="text-on-surface-variant max-w-lg">Panel técnico de transacciones de sistemas de software corporativos y SaaS. Supervisión de comisiones generadas.</p>
        </div>
        <div class="flex gap-4">
          <div class="glass-card px-6 py-4 rounded-2xl flex flex-col justify-center min-w-[140px]">
            <span class="text-[10px] uppercase font-bold text-secondary mb-1">Volumen Total</span>
            <span class="text-2xl font-bold font-mono">Bs. {{ formatMoney(totalVolume) }}</span>
          </div>
          <div class="glass-card px-6 py-4 rounded-2xl flex flex-col justify-center min-w-[140px]">
            <span class="text-[10px] uppercase font-bold text-primary mb-1">Total Comisiones</span>
            <span class="text-2xl font-bold font-mono text-green-400">Bs. {{ formatMoney(totalCommissions) }}</span>
          </div>
        </div>
      </div>

      <!-- Advanced Filters -->
      <div class="glass-panel rounded-2xl p-6 flex flex-wrap gap-4 items-end">
        <div class="flex-1 min-w-[200px] space-y-2">
          <label class="block text-[10px] font-bold text-outline uppercase tracking-widest">SISTEMA VENDIDO</label>
          <select [(ngModel)]="filterSystem" (change)="onFilterChange()" class="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm focus:ring-1 focus:ring-primary text-white outline-none">
            <option value="Todos los Sistemas">Todos los Sistemas</option>
            <option value="Neural Core v2.4">Neural Core v2.4</option>
            <option value="Quantum Suite Pro">Quantum Suite Pro</option>
            <option value="Edge Shield Cluster">Edge Shield Cluster</option>
            <option value="FleetMaster Pro">FleetMaster Pro</option>
            <option value="CloudConnect ERP">CloudConnect ERP</option>
            <option value="OmniChannel CRM">OmniChannel CRM</option>
          </select>
        </div>

        <div class="flex-1 min-w-[150px] space-y-2">
          <label class="block text-[10px] font-bold text-outline uppercase tracking-widest">FECHA INICIO</label>
          <input type="date" [(ngModel)]="filterStartDate" (change)="onFilterChange()" class="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm focus:ring-1 focus:ring-primary text-white outline-none" />
        </div>

        <div class="flex-1 min-w-[150px] space-y-2">
          <label class="block text-[10px] font-bold text-outline uppercase tracking-widest">FECHA FIN</label>
          <input type="date" [(ngModel)]="filterEndDate" (change)="onFilterChange()" class="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-2.5 text-sm focus:ring-1 focus:ring-primary text-white outline-none" />
        </div>

        <button (click)="clearFilters()" class="px-6 py-3 bg-outline-variant/20 rounded-xl text-xs font-bold text-on-surface hover:bg-outline-variant/40 transition-all flex items-center gap-1.5 h-[46px]">
          <span class="material-symbols-outlined text-[16px]">filter_list</span> Limpiar
        </button>
      </div>

      <!-- Dense Technical Table -->
      <div class="glass-panel rounded-3xl overflow-hidden shadow-2xl">
        <div class="overflow-x-auto custom-scrollbar">
          <table class="w-full border-collapse text-left">
            <thead>
              <tr class="bg-surface-container-highest/40 border-b border-outline-variant/30 text-[10px] font-bold text-outline uppercase tracking-widest">
                <th class="px-6 py-5">Cliente / Empresa</th>
                <th class="px-6 py-5">Sistema Vendido</th>
                <th class="px-6 py-5">Precio Base</th>
                <th class="px-6 py-5">Descuento</th>
                <th class="px-6 py-5 text-center">Comisión Calculada</th>
                <th class="px-6 py-5">Fecha Operación</th>
                <th class="px-6 py-5 text-right" *ngIf="isAdmin">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-outline-variant/20">
              <tr *ngFor="let sale of sales" class="hover:bg-primary/5 transition-colors duration-150">
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                      {{ sale.captacion?.business_name?.substring(0, 2)?.toUpperCase() }}
                    </div>
                    <div>
                      <p class="font-bold text-sm text-on-surface">{{ sale.captacion?.business_name }}</p>
                      <p class="text-[11px] text-outline">Asignado: {{ sale.captacion?.seller?.username }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span class="px-3 py-1 rounded-full bg-secondary-container/10 text-secondary border border-secondary/20 text-xs font-semibold">
                    {{ sale.sold_system }}
                  </span>
                </td>
                <td class="px-6 py-4 font-mono text-sm text-on-surface">Bs. {{ formatMoney(sale.price) }}</td>
                <td class="px-6 py-4">
                  <span class="text-red-400 font-bold font-mono text-sm" *ngIf="sale.discount > 0">-Bs. {{ formatMoney(sale.discount) }}</span>
                  <span class="text-on-surface-variant font-mono text-sm" *ngIf="sale.discount == 0">Bs. 0.00</span>
                </td>
                <td class="px-6 py-4 text-center">
                  <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20 text-xs">
                    <span class="material-symbols-outlined text-[16px]">trending_up</span>
                    <span class="font-bold font-mono">Bs. {{ formatMoney(sale.commission) }}</span>
                  </div>
                </td>
                <td class="px-6 py-4 text-on-surface-variant font-mono text-xs">{{ formatDate(sale.sale_date) }}</td>
                <td class="px-6 py-4 text-right" *ngIf="isAdmin">
                  <button (click)="onDeleteSale(sale.id)" class="p-2 hover:bg-red-500/10 rounded-lg text-red-400 transition-all" title="Eliminar Venta">
                    <span class="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </td>
              </tr>

              <tr *ngIf="sales.length === 0">
                <td colspan="7" class="p-10 text-center text-on-surface-variant">
                  <span class="material-symbols-outlined text-[36px] opacity-40 mb-2">search_off</span>
                  <p>No se encontraron ventas registradas.</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Bottom Insight Grid: Charts Simulation -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- System Distribution -->
        <div class="glass-card p-6 rounded-3xl">
          <div class="flex justify-between items-start mb-6">
            <h4 class="text-xs text-outline uppercase tracking-wider font-bold">Distribución por Sistema</h4>
            <span class="material-symbols-outlined text-primary">pie_chart</span>
          </div>
          <div class="space-y-4">
            <div *ngFor="let item of systemDistribution">
              <div class="flex justify-between text-xs mb-1">
                <span>{{ item.name }}</span>
                <span class="text-secondary font-bold font-mono">{{ item.percentage }}%</span>
              </div>
              <div class="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                <div class="h-full bg-secondary" [style.width]="item.percentage + '%'"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Commission evolution -->
        <div class="glass-card p-6 rounded-3xl col-span-1 lg:col-span-2">
          <div class="flex justify-between items-start mb-6">
            <div>
              <h4 class="text-xs text-outline uppercase tracking-wider font-bold">Historial de Comisiones</h4>
              <p class="text-[10px] text-outline mt-1">Evolución mensual de los pagos recibidos.</p>
            </div>
            <div class="flex gap-2 text-xs">
              <span class="flex items-center gap-1.5 text-primary">
                <span class="w-2 h-2 rounded-full bg-primary"></span> Comisiones
              </span>
            </div>
          </div>

          <!-- simplified chart grid -->
          <div class="h-32 flex items-end gap-3 relative border-b border-outline-variant/30 px-2 mt-4">
            <div *ngFor="let month of monthlyHistory; let idx = index" 
                 class="flex-1 bg-primary/20 hover:bg-primary/40 transition-all rounded-t-sm"
                 [style.height]="(month.total_amount / maxCommissionAmount * 90 + 10) + '%'"
                 [title]="month.month + ': Bs. ' + formatMoney(month.total_amount)">
            </div>
            <div class="absolute -bottom-6 w-full flex justify-between text-[10px] text-outline font-mono uppercase tracking-widest px-2">
              <span *ngFor="let month of monthlyHistory">{{ formatMonth(month.month) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SalesComponent implements OnInit {
  private crmService = inject(CrmService);
  private authService = inject(AuthService);
  private router = inject(Router);

  sales: Sale[] = [];
  isAdmin = false;

  totalVolume = 0;
  totalCommissions = 0;

  // Filter States
  filterSystem = 'Todos los Sistemas';
  filterStartDate = '';
  filterEndDate = '';

  // Charts data
  systemDistribution: any[] = [];
  monthlyHistory: any[] = [];
  maxCommissionAmount = 1;

  ngOnInit() {
    this.isAdmin = this.authService.getRole() === 'admin';
    this.loadSales();
    this.loadStats();
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.loadSales();
        this.loadStats();
      }
    });
  }

  loadSales() {
    this.crmService.getSales(
      this.filterSystem,
      this.filterStartDate,
      this.filterEndDate
    ).subscribe(data => {
      this.sales = data;
      this.calculateTotals();
    });
  }

  loadStats() {
    this.crmService.getCommissionStats().subscribe(data => {
      this.monthlyHistory = data.monthly_history;
      this.maxCommissionAmount = Math.max(...this.monthlyHistory.map(h => Number(h.total_amount)), 1);
      this.calculateSystemDistribution();
    });
  }

  calculateTotals() {
    this.totalVolume = this.sales.reduce((acc, sale) => acc + (Number(sale.price) - Number(sale.discount)), 0);
    this.totalCommissions = this.sales.reduce((acc, sale) => acc + Number(sale.commission), 0);
  }

  calculateSystemDistribution() {
    const counts: { [key: string]: number } = {};
    let totalCount = 0;

    this.sales.forEach(sale => {
      const sys = sale.sold_system.split(' ')[0];
      counts[sys] = (counts[sys] || 0) + 1;
      totalCount++;
    });

    this.systemDistribution = Object.keys(counts).map(key => {
      return {
        name: key,
        percentage: totalCount > 0 ? Math.round((counts[key] / totalCount) * 100) : 0
      };
    });
  }

  onFilterChange() {
    this.loadSales();
  }

  clearFilters() {
    this.filterSystem = 'Todos los Sistemas';
    this.filterStartDate = '';
    this.filterEndDate = '';
    this.loadSales();
  }

  onDeleteSale(id: number) {
    if (confirm('¿Está seguro de que desea eliminar este registro de venta? Esto revertirá la captación a Negociación y borrará la comisión del vendedor.')) {
      this.crmService.deleteSale(id).subscribe({
        next: () => {
          this.loadSales();
          this.loadStats();
        }
      });
    }
  }

  formatMoney(value: number | string): string {
    const num = Number(value);
    if (isNaN(num)) return '0.00';
    return num.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  formatMonth(monthStr: string): string {
    const parts = monthStr.split('-');
    if (parts.length < 2) return monthStr;
    const monthIndex = parseInt(parts[1]) - 1;
    const months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
    return months[monthIndex] || monthStr;
  }
}
