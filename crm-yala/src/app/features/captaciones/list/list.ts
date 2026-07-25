import { Component, inject, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterLink } from '@angular/router';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CrmService } from '../../../core/services/crm.service';
import { AuthService } from '../../../core/services/auth.service';
import { Captacion, User, Visit, Followup, Suggestion } from '../../../shared/interfaces/crm.interface';

@Component({
  selector: 'app-captaciones-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="space-y-8 relative">
      <!-- Header Monitor -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 class="font-bold text-3xl text-on-surface tracking-tight">Monitor de Captación</h2>
          <p class="text-on-surface-variant text-base">Visualización técnica del embudo de ventas y ciclo de vida de prospectos en tiempo real.</p>
        </div>
        <div class="flex gap-3">
          <button routerLink="/captaciones/create" class="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 active:scale-95 transition-all font-bold text-sm">
            <span class="material-symbols-outlined text-[20px]">add</span>
            Nuevo Prospecto
          </button>
        </div>
      </div>

      <!-- Filters & Toolbar -->
      <div class="glass-panel rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div class="flex flex-wrap items-center gap-4">
          <!-- Search box -->
          <div class="relative">
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant scale-90">search</span>
            <input 
              [(ngModel)]="search" 
              (input)="onSearchChange()" 
              type="text" 
              placeholder="Buscar negocio..." 
              class="pl-10 pr-4 py-2 bg-surface-container border border-outline-variant rounded-lg text-sm text-on-surface placeholder:text-outline/50 focus:ring-1 focus:ring-primary focus:border-primary outline-none w-64" 
            />
          </div>

          <!-- Status filter -->
          <select 
            [(ngModel)]="filterStatus" 
            (change)="onFilterChange()"
            class="pl-4 pr-10 py-2 bg-surface-container border border-outline-variant rounded-lg text-sm text-on-surface focus:ring-1 focus:ring-primary focus:border-primary outline-none"
          >
            <option value="Todos los Estados">Todos los Estados</option>
            <option value="Captación">Captación</option>
            <option value="Follow-up">Follow-up</option>
            <option value="Training">Training</option>
            <option value="Negotiation">Negotiation</option>
            <option value="Closed Sale">Venta Cerrada</option>
            <option value="Lost">Perdido</option>
          </select>

          <!-- Seller filter (Admin only) -->
          <select 
            *ngIf="isAdmin"
            [(ngModel)]="filterSeller" 
            (change)="onFilterChange()"
            class="pl-4 pr-10 py-2 bg-surface-container border border-outline-variant rounded-lg text-sm text-on-surface focus:ring-1 focus:ring-primary focus:border-primary outline-none"
          >
            <option value="">Todos los Vendedores</option>
            <option *ngFor="let s of sellers" [value]="s.id">{{ s.username }}</option>
          </select>

          <!-- Clear filters -->
          <button (click)="clearFilters()" class="text-primary font-bold text-sm flex items-center gap-1 hover:underline px-2">
            <span class="material-symbols-outlined text-[18px]">filter_alt_off</span> Limpiar
          </button>
        </div>

        <div class="text-on-surface-variant text-xs uppercase font-bold tracking-wider">
          Registros: <span class="text-on-surface font-mono">{{ totalRecords }}</span>
        </div>
      </div>

      <!-- Error Message Banner -->
      <div *ngIf="error" class="p-4 bg-red-500/20 border border-red-500/30 text-red-300 rounded-xl text-sm">
        {{ error }}
      </div>

      <!-- Main Data Table -->
      <div class="glass-panel rounded-xl overflow-hidden flex flex-col shadow-2xl">
        <div class="overflow-x-auto custom-scrollbar">
          <table class="w-full border-collapse">
            <thead>
              <tr class="bg-surface-container-low/50 border-b border-outline-variant">
                <th (click)="sort('business_name')" class="p-4 text-left text-xs font-bold text-on-surface-variant uppercase tracking-wider cursor-pointer hover:text-white select-none whitespace-nowrap">
                  Nombre de Negocio
                  <span class="material-symbols-outlined text-xs align-middle" *ngIf="sortBy === 'business_name'">
                    {{ sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward' }}
                  </span>
                </th>
                <th (click)="sort('category')" class="p-4 text-left text-xs font-bold text-on-surface-variant uppercase tracking-wider cursor-pointer hover:text-white select-none whitespace-nowrap">
                  Categoría
                  <span class="material-symbols-outlined text-xs align-middle" *ngIf="sortBy === 'category'">
                    {{ sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward' }}
                  </span>
                </th>
                <th class="p-4 text-left text-xs font-bold text-on-surface-variant uppercase tracking-wider whitespace-nowrap">Propietario</th>
                <th class="p-4 text-left text-xs font-bold text-on-surface-variant uppercase tracking-wider whitespace-nowrap">Teléfono</th>
                <th class="p-4 text-left text-xs font-bold text-on-surface-variant uppercase tracking-wider whitespace-nowrap">Aplicación Ofrecida</th>
                <th (click)="sort('offered_price')" class="p-4 text-right text-xs font-bold text-on-surface-variant uppercase tracking-wider cursor-pointer hover:text-white select-none whitespace-nowrap">
                  Precio Ofrecido
                  <span class="material-symbols-outlined text-xs align-middle" *ngIf="sortBy === 'offered_price'">
                    {{ sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward' }}
                  </span>
                </th>
                <th (click)="sort('status')" class="p-4 text-center text-xs font-bold text-on-surface-variant uppercase tracking-wider cursor-pointer hover:text-white select-none whitespace-nowrap">
                  Estado
                  <span class="material-symbols-outlined text-xs align-middle" *ngIf="sortBy === 'status'">
                    {{ sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward' }}
                  </span>
                </th>
                <th class="p-4 text-left text-xs font-bold text-on-surface-variant uppercase tracking-wider whitespace-nowrap">Vendedor</th>
                <th class="p-4 text-center text-xs font-bold text-on-surface-variant uppercase tracking-wider whitespace-nowrap">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-outline-variant">
              <tr *ngFor="let item of captaciones" class="hover:bg-primary/5 transition-all duration-150 cursor-pointer" (click)="openDrawer(item)">
                <td class="p-4 font-bold text-sm text-primary whitespace-nowrap">{{ item.business_name }}</td>
                <td class="p-4 text-sm text-on-surface whitespace-nowrap">{{ item.category }}</td>
                <td class="p-4 text-sm text-on-surface whitespace-nowrap">{{ item.owner_name }}</td>
                <td class="p-4 text-xs text-on-surface-variant whitespace-nowrap font-mono">{{ item.phone }}</td>
                <td class="p-4 text-sm text-on-surface-variant whitespace-nowrap">{{ item.offered_application || '--' }}</td>
                <td class="p-4 text-right text-sm font-semibold text-on-surface whitespace-nowrap font-mono">
                  {{ item.offered_price ? 'Bs. ' + formatMoney(item.offered_price) : '--' }}
                </td>
                <td class="p-4 text-center whitespace-nowrap">
                  <span class="status-badge" [ngClass]="getStatusClass(item.status)">{{ getStatusLabel(item.status) }}</span>
                </td>
                <td class="p-4 whitespace-nowrap">
                  <div class="flex items-center gap-2">
                    <div class="w-6 h-6 rounded-full bg-primary/20 text-primary border border-primary/30 flex items-center justify-center text-[10px] font-bold">
                      {{ item.seller?.username?.substring(0, 2)?.toUpperCase() }}
                    </div>
                    <span class="text-sm text-on-surface-variant">{{ item.seller?.username }}</span>
                  </div>
                </td>
                <td class="p-4">
                  <div class="flex items-center justify-center gap-1">
                    <button (click)="openDrawer(item); $event.stopPropagation()" class="p-1.5 hover:bg-surface-variant rounded-md text-on-surface-variant hover:text-white transition-all" title="Ver Detalles">
                      <span class="material-symbols-outlined text-[18px]">visibility</span>
                    </button>
                    <button (click)="$event.stopPropagation()" [routerLink]="['/captaciones/edit', item.id]" class="p-1.5 hover:bg-surface-variant rounded-md text-on-surface-variant hover:text-white transition-all" title="Editar">
                      <span class="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                    <button *ngIf="isAdmin" (click)="onDelete(item); $event.stopPropagation()" class="p-1.5 hover:bg-red-500/20 rounded-md text-red-400 transition-all" title="Eliminar">
                      <span class="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </td>
              </tr>

              <tr *ngIf="captaciones.length === 0">
                <td colspan="9" class="p-10 text-center text-on-surface-variant">
                  <span class="material-symbols-outlined text-[36px] opacity-40 mb-2">search_off</span>
                  <p>No se encontraron captaciones con los criterios de búsqueda.</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination Footer -->
        <div class="p-4 border-t border-outline-variant bg-surface-container-lowest/50 flex items-center justify-between">
          <button 
            [disabled]="currentPage === 1" 
            (click)="changePage(currentPage - 1)"
            class="flex items-center gap-1 text-xs font-bold text-on-surface-variant hover:text-primary disabled:opacity-30 disabled:hover:text-on-surface-variant transition-colors"
          >
            <span class="material-symbols-outlined">chevron_left</span> Anterior
          </button>
          
          <div class="flex items-center gap-1">
            <button 
              *ngFor="let p of pageNumbers" 
              (click)="changePage(p)"
              class="w-8 h-8 rounded-lg font-bold text-xs transition-all"
              [class.bg-primary]="p === currentPage"
              [class.text-white]="p === currentPage"
              [class.hover:bg-surface-variant]="p !== currentPage"
              [class.text-on-surface]="p !== currentPage"
            >
              {{ p }}
            </button>
          </div>

          <button 
            [disabled]="currentPage === totalPages" 
            (click)="changePage(currentPage + 1)"
            class="flex items-center gap-1 text-xs font-bold text-on-surface-variant hover:text-primary disabled:opacity-30 disabled:hover:text-on-surface-variant transition-colors"
          >
            Siguiente <span class="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>

      <!-- ================= SIDE DETAILS DRAWER ================= -->
      <div *ngIf="isDrawerOpen" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end" (click)="closeDrawer()">
        <div class="w-full max-w-2xl bg-surface-container-lowest border-l border-outline-variant h-full flex flex-col py-6 overflow-y-auto custom-scrollbar" (click)="$event.stopPropagation()">
          
          <!-- Drawer Header -->
          <div class="px-6 pb-6 border-b border-outline-variant flex justify-between items-start">
            <div>
              <span class="status-badge block w-fit mb-2" [ngClass]="getStatusClass(selectedCaptacion.status)">{{ getStatusLabel(selectedCaptacion.status) }}</span>
              <h3 class="font-bold text-2xl text-primary">{{ selectedCaptacion.business_name }}</h3>
              <p class="text-xs text-on-surface-variant mt-1">Registrado por: <strong>{{ selectedCaptacion.seller?.username }}</strong></p>
            </div>
            <button (click)="closeDrawer()" class="text-on-surface hover:bg-white/10 p-2 rounded-full transition-colors">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <!-- Drawer Content tabs/scroller -->
          <div class="flex-1 px-6 py-6 space-y-8 overflow-y-auto custom-scrollbar">
            
            <!-- Quick actions -->
            <div class="flex gap-2">
              <a [href]="'tel:' + selectedCaptacion.phone" class="flex-1 py-3 px-4 bg-white/5 border border-white/10 rounded-xl hover:bg-primary/20 text-on-surface font-semibold flex items-center justify-center gap-2 transition-all">
                <span class="material-symbols-outlined text-[18px]">call</span> Llamar
              </a>
              <a [href]="'https://wa.me/' + selectedCaptacion.phone.replace('+', '')" target="_blank" class="flex-1 py-3 px-4 bg-white/5 border border-white/10 rounded-xl hover:bg-green-600/20 text-on-surface font-semibold flex items-center justify-center gap-2 transition-all">
                <span class="material-symbols-outlined text-[18px]">chat</span> WhatsApp
              </a>
              <button [routerLink]="['/captaciones/edit', selectedCaptacion.id]" (click)="closeDrawer()" class="flex-1 py-3 px-4 bg-primary text-white rounded-xl hover:brightness-110 font-semibold flex items-center justify-center gap-2 transition-all">
                <span class="material-symbols-outlined text-[18px]">edit</span> Editar
              </button>
            </div>

            <!-- Business Information -->
            <div class="space-y-4">
              <h4 class="font-bold text-base text-white border-b border-outline-variant pb-2">Información del Negocio</h4>
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span class="text-outline block text-xs uppercase">Categoría:</span>
                  <span class="text-on-surface font-semibold">{{ selectedCaptacion.category }}</span>
                </div>
                <div>
                  <span class="text-outline block text-xs uppercase">Horarios:</span>
                  <span class="text-on-surface font-semibold">{{ selectedCaptacion.business_hours || '--' }}</span>
                </div>
                <div>
                  <span class="text-outline block text-xs uppercase">Propietario:</span>
                  <span class="text-on-surface font-semibold">{{ selectedCaptacion.owner_name }}</span>
                </div>
                <div>
                  <span class="text-outline block text-xs uppercase">Contacto Comercial:</span>
                  <span class="text-on-surface font-semibold">{{ selectedCaptacion.contact_name || '--' }}</span>
                </div>
                <div>
                  <span class="text-outline block text-xs uppercase">Recibió tarjeta YALASOFT:</span>
                  <span class="text-on-surface font-semibold" [class.text-green-400]="selectedCaptacion.accepts_card">{{ selectedCaptacion.accepts_card ? 'Sí' : 'No' }}</span>
                </div>
                <div>
                  <span class="text-outline block text-xs uppercase">Nos dio su tarjeta:</span>
                  <span class="text-on-surface font-semibold" [class.text-green-400]="selectedCaptacion.gave_card">{{ selectedCaptacion.gave_card ? 'Sí' : 'No' }}</span>
                </div>
                <div>
                  <span class="text-outline block text-xs uppercase">Ubicación GPS:</span>
                  <span class="text-primary font-mono text-xs hover:underline cursor-pointer" *ngIf="selectedCaptacion.google_maps">
                    <a [href]="'https://www.google.com/maps/search/?api=1&query=' + selectedCaptacion.google_maps" target="_blank">{{ selectedCaptacion.google_maps }}</a>
                  </span>
                  <span class="text-on-surface" *ngIf="!selectedCaptacion.google_maps">--</span>
                </div>
                <div>
                  &nbsp;
                </div>
                <div class="col-span-2">
                  <span class="text-outline block text-xs uppercase">Dirección Física:</span>
                  <span class="text-on-surface">{{ selectedCaptacion.address }}</span>
                </div>
                <div class="col-span-2" *ngIf="selectedCaptacion.notes">
                  <span class="text-outline block text-xs uppercase">Notas Internas:</span>
                  <span class="text-on-surface block p-3 bg-white/5 rounded-lg border border-white/5 whitespace-pre-line">{{ selectedCaptacion.notes }}</span>
                </div>
              </div>
            </div>

            <!-- Commercial Info -->
            <div class="space-y-4">
              <h4 class="font-bold text-base text-white border-b border-outline-variant pb-2">Información Comercial</h4>
              <div class="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span class="text-outline block text-xs uppercase">Sistema Ofrecido:</span>
                  <span class="text-on-surface font-semibold">{{ selectedCaptacion.offered_application || '--' }}</span>
                </div>
                <div>
                  <span class="text-outline block text-xs uppercase">Esquema Licencia:</span>
                  <span class="text-on-surface font-semibold">{{ selectedCaptacion.licensing_type || 'SaaS' }}</span>
                </div>
                <div>
                  <span class="text-outline block text-xs uppercase">Precio Ofrecido:</span>
                  <span class="text-on-surface font-semibold font-mono" *ngIf="selectedCaptacion.offered_price">Bs. {{ formatMoney(selectedCaptacion.offered_price ?? 0) }}</span>
                  <span class="text-on-surface" *ngIf="!selectedCaptacion.offered_price">--</span>
                </div>
                <div>
                  <span class="text-outline block text-xs uppercase">Ofrecido Hosting:</span>
                  <span class="text-on-surface font-semibold">{{ selectedCaptacion.offered_hosting ? 'Sí' : 'No' }}</span>
                </div>
                <div>
                  <span class="text-outline block text-xs uppercase">Precio Hosting:</span>
                  <span class="text-on-surface font-semibold font-mono" *ngIf="selectedCaptacion.offered_hosting">&#36;{{ formatMoney(selectedCaptacion.hosting_price ?? 0) }} / mes</span>
                  <span class="text-on-surface-variant" *ngIf="!selectedCaptacion.offered_hosting">--</span>
                </div>
                <div>
                  <span class="text-outline block text-xs uppercase">Promoción:</span>
                  <span class="text-on-surface font-semibold">{{ selectedCaptacion.promotion || '--' }}</span>
                </div>
              </div>
            </div>

            <!-- CLOSE SALE FORM (only if not sold yet) -->
            <div *ngIf="selectedCaptacion.status !== 'Closed Sale'" class="glass-panel p-4 rounded-xl space-y-4 border-l-4 border-l-green-500">
              <h4 class="font-bold text-base text-white flex items-center gap-2">
                <span class="material-symbols-outlined text-green-400">handshake</span>
                Cerrar Venta del Prospecto
              </h4>
              <div *ngIf="saleError" class="p-2 bg-red-500/20 text-red-300 rounded text-xs">
                {{ saleError }}
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div class="space-y-1">
                  <label class="text-xs text-on-surface-variant block">Sistema Vendido</label>
                  <input type="text" [(ngModel)]="saleSystem" class="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white focus:outline-none" placeholder="Ej: Neural Core v2.4" />
                </div>
                <div class="space-y-1">
                  <label class="text-xs text-on-surface-variant block">Precio Real (Bs.)</label>
                  <input type="number" [(ngModel)]="salePrice" class="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white focus:outline-none" />
                </div>
                <div class="space-y-1">
                  <label class="text-xs text-on-surface-variant block">Descuento Otorgado (Bs.)</label>
                  <input type="number" [(ngModel)]="saleDiscount" class="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white focus:outline-none" />
                </div>
                <div class="space-y-1">
                  <label class="text-xs text-on-surface-variant block">Fecha de Cierre</label>
                  <input type="date" [(ngModel)]="saleDate" class="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white focus:outline-none" />
                </div>
              </div>
              <button (click)="onSubmitSale()" class="w-full py-2.5 bg-green-600 text-white rounded-lg font-bold hover:brightness-110 active:scale-95 transition-all text-xs flex items-center justify-center gap-1">
                <span class="material-symbols-outlined text-xs">check_circle</span>
                Confirmar Venta y Generar Comisión
              </button>
            </div>

            <!-- Sale / Commission Info if closed -->
            <div *ngIf="selectedCaptacion.status === 'Closed Sale' && selectedCaptacion.sales && selectedCaptacion.sales.length > 0" class="p-4 bg-green-500/10 border border-green-500/20 rounded-xl space-y-2">
              <h4 class="font-bold text-sm text-green-400 flex items-center gap-2">
                <span class="material-symbols-outlined">handshake</span>
                Venta Concretada
              </h4>
              <div class="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span class="text-outline uppercase block">Sistema:</span>
                  <span class="text-white font-bold">{{ selectedCaptacion.sales[0].sold_system }}</span>
                </div>
                <div>
                  <span class="text-outline uppercase block">Fecha de Pago:</span>
                  <span class="text-white font-mono">{{ formatDateString(selectedCaptacion.sales[0].sale_date) }}</span>
                </div>
                <div>
                  <span class="text-outline uppercase block">Precio Neto:</span>
                  <span class="text-white font-bold font-mono">Bs. {{ formatMoney(selectedCaptacion.sales[0].price - selectedCaptacion.sales[0].discount) }}</span>
                </div>
                <div>
                  <span class="text-outline uppercase block">Comisión Recibida:</span>
                  <span class="text-green-400 font-bold font-mono">Bs. {{ formatMoney(selectedCaptacion.sales[0].commission) }}</span>
                </div>
              </div>
            </div>


            <!-- Visits Log & Add Visit Form -->
            <div class="space-y-4">
              <h4 class="font-bold text-base text-white border-b border-outline-variant pb-2 flex justify-between items-center">
                <span>Historial de Visitas</span>
                <button (click)="showVisitForm = !showVisitForm" class="text-xs text-primary font-bold hover:underline flex items-center gap-1">
                  <span class="material-symbols-outlined text-sm">{{ showVisitForm ? 'remove' : 'add' }}</span> Registrar Visita
                </button>
              </h4>
              
              <!-- Add visit form inline -->
              <div *ngIf="showVisitForm" class="p-4 bg-white/5 rounded-xl border border-white/10 space-y-3">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div class="space-y-1">
                    <label class="text-on-surface-variant">Fecha y Hora</label>
                    <input type="datetime-local" [(ngModel)]="newVisitDate" class="w-full bg-surface-container border border-outline-variant rounded p-2 text-white outline-none" />
                  </div>
                  <div class="space-y-1">
                    <label class="text-on-surface-variant">Resultado / Estado</label>
                    <input type="text" [(ngModel)]="newVisitResult" placeholder="Ej. Receptivo a la propuesta" class="w-full bg-surface-container border border-outline-variant rounded p-2 text-white outline-none" />
                  </div>
                  <div class="col-span-2 space-y-1">
                    <label class="text-on-surface-variant">Notas Adicionales</label>
                    <textarea [(ngModel)]="newVisitNotes" rows="2" placeholder="Detalles de la conversación..." class="w-full bg-surface-container border border-outline-variant rounded p-2 text-white outline-none resize-none"></textarea>
                  </div>
                </div>
                <button (click)="onSubmitVisit()" class="w-full py-2 bg-primary text-white rounded font-bold text-xs hover:brightness-110 active:scale-95 transition-all">
                  Guardar Visita
                </button>
              </div>

              <!-- Visits List -->
              <div class="space-y-3">
                <div *ngFor="let visit of selectedCaptacion.visits" class="p-3 bg-white/[0.03] border border-white/5 rounded-lg text-xs space-y-1 relative">
                  <div class="flex justify-between items-center">
                    <span class="font-mono text-outline">{{ formatDate(visit.visit_date) }}</span>
                    <button *ngIf="isAdmin" (click)="onDeleteVisit(visit.id)" class="text-red-400 hover:text-red-300">
                      <span class="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </div>
                  <p class="text-white font-bold">{{ visit.result }}</p>
                  <p *ngIf="visit.notes" class="text-on-surface-variant italic">{{ visit.notes }}</p>
                </div>
                <p *ngIf="!selectedCaptacion.visits || selectedCaptacion.visits.length === 0" class="text-xs text-on-surface-variant text-center py-4 italic">No hay visitas registradas para este negocio.</p>
              </div>
            </div>

            <!-- Follow-ups Log & Add Followup Form -->
            <div class="space-y-4">
              <h4 class="font-bold text-base text-white border-b border-outline-variant pb-2 flex justify-between items-center">
                <span>Historial de Seguimientos</span>
                <button (click)="showFollowupForm = !showFollowupForm" class="text-xs text-primary font-bold hover:underline flex items-center gap-1">
                  <span class="material-symbols-outlined text-sm">{{ showFollowupForm ? 'remove' : 'add' }}</span> Registrar Seguimiento
                </button>
              </h4>
              
              <!-- Add followup form inline -->
              <div *ngIf="showFollowupForm" class="p-4 bg-white/5 rounded-xl border border-white/10 space-y-3">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div class="space-y-1">
                    <label class="text-on-surface-variant">Fecha</label>
                    <input type="datetime-local" [(ngModel)]="newFollowupDate" class="w-full bg-surface-container border border-outline-variant rounded p-2 text-white outline-none" />
                  </div>
                  <div class="space-y-1">
                    <label class="text-on-surface-variant">Próximo Contacto (Siguiente Visita)</label>
                    <input type="date" [(ngModel)]="newFollowupNext" class="w-full bg-surface-container border border-outline-variant rounded p-2 text-white outline-none" />
                  </div>
                  <div class="col-span-2 space-y-1">
                    <label class="text-on-surface-variant">Notas del Seguimiento</label>
                    <textarea [(ngModel)]="newFollowupNotes" rows="2" placeholder="Ej: Se envió cotización detallada por WhatsApp..." class="w-full bg-surface-container border border-outline-variant rounded p-2 text-white outline-none resize-none"></textarea>
                  </div>
                </div>
                <button (click)="onSubmitFollowup()" class="w-full py-2 bg-primary text-white rounded font-bold text-xs hover:brightness-110 active:scale-95 transition-all">
                  Guardar Seguimiento
                </button>
              </div>

              <!-- Followups List -->
              <div class="space-y-3">
                <div *ngFor="let fol of selectedCaptacion.followups" class="p-3 bg-white/[0.03] border border-white/5 rounded-lg text-xs space-y-1 relative">
                  <div class="flex justify-between items-center">
                    <span class="font-mono text-outline">{{ formatDate(fol.date) }}</span>
                    <button *ngIf="isAdmin" (click)="onDeleteFollowup(fol.id)" class="text-red-400 hover:text-red-300">
                      <span class="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </div>
                  <p class="text-white">{{ fol.notes }}</p>
                  <p *ngIf="fol.next_contact" class="text-primary font-semibold">Próximo contacto: {{ formatDateString(fol.next_contact) }}</p>
                </div>
                <p *ngIf="!selectedCaptacion.followups || selectedCaptacion.followups.length === 0" class="text-xs text-on-surface-variant text-center py-4 italic">No hay seguimientos registrados para este negocio.</p>
              </div>
            </div>

            <!-- Suggestions Log & Add Suggestion Form -->
            <div class="space-y-4">
              <h4 class="font-bold text-base text-white border-b border-outline-variant pb-2 flex justify-between items-center">
                <span>Propuesta Técnica y Sugerencias</span>
                <button (click)="showSuggestionForm = !showSuggestionForm" class="text-xs text-primary font-bold hover:underline flex items-center gap-1">
                  <span class="material-symbols-outlined text-sm">{{ showSuggestionForm ? 'remove' : 'add' }}</span> Agregar Sugerencia
                </button>
              </h4>
              
              <!-- Add suggestion form inline -->
              <div *ngIf="showSuggestionForm" class="p-4 bg-white/5 rounded-xl border border-white/10 space-y-3">
                <div class="space-y-1 text-xs">
                  <label class="text-on-surface-variant">Sugerencia de Software / SaaS</label>
                  <textarea [(ngModel)]="newSuggestionDesc" rows="2" placeholder="Ej: Implementar chatbot para WhatsApp debido a alta recurrencia de preguntas sobre horarios." class="w-full bg-surface-container border border-outline-variant rounded p-2 text-white outline-none resize-none"></textarea>
                </div>
                <button (click)="onSubmitSuggestion()" class="w-full py-2 bg-primary text-white rounded font-bold text-xs hover:brightness-110 active:scale-95 transition-all">
                  Guardar Sugerencia
                </button>
              </div>

              <!-- Suggestions List -->
              <div class="space-y-3">
                <div *ngFor="let sug of selectedCaptacion.suggestions" class="p-3 bg-white/[0.03] border border-white/5 rounded-lg text-xs flex justify-between items-start">
                  <p class="text-white flex-1">{{ sug.description }}</p>
                  <button *ngIf="isAdmin" (click)="onDeleteSuggestion(sug.id)" class="text-red-400 hover:text-red-300 ml-2">
                    <span class="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                </div>
                <p *ngIf="!selectedCaptacion.suggestions || selectedCaptacion.suggestions.length === 0" class="text-xs text-on-surface-variant text-center py-4 italic">No hay sugerencias registradas.</p>
              </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  `
})
export class CaptacionesListComponent implements OnInit {
  private router = inject(Router);

  private crmService = inject(CrmService);
  private authService = inject(AuthService);


  captaciones: Captacion[] = [];
  sellers: any[] = [];
  isAdmin = false;
  error = '';

  // Filters & State
  search = '';
  filterStatus = 'Todos los Estados';
  filterSeller = '';
  sortBy = 'created_at';
  sortOrder = 'desc';
  
  currentPage = 1;
  totalPages = 1;
  pageNumbers: number[] = [];
  totalRecords = 0;

  // Drawer & Interactions
  isDrawerOpen = false;
  selectedCaptacion!: Captacion;

  // Form states in Drawer
  showVisitForm = false;
  newVisitDate = '';
  newVisitResult = '';
  newVisitNotes = '';

  showFollowupForm = false;
  newFollowupDate = '';
  newFollowupNext = '';
  newFollowupNotes = '';

  showSuggestionForm = false;
  newSuggestionDesc = '';

  // Sale states in Drawer
  saleSystem = '';
  salePrice = 0;
  saleDiscount = 0;
  saleDate = '';
  saleError = '';

  ngOnInit() {
    this.isAdmin = this.authService.getRole() === 'admin';
    this.loadSellers();
    this.loadCaptaciones();
    // Reload data on each navigation end to ensure fresh data on first click
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.loadCaptaciones();
      }
    });
  }

  loadSellers() {
    if (this.isAdmin) {
      this.crmService.getSellers().subscribe(data => this.sellers = data);
    }
  }

  loadCaptaciones() {
    this.crmService.getCaptaciones(
      this.currentPage,
      this.search,
      this.filterStatus,
      '', // Category is empty by default
      this.filterSeller,
      this.sortBy,
      this.sortOrder
    ).subscribe({
      next: (res) => {
        this.error = '';
        this.captaciones = res.data;
        this.currentPage = res.current_page;
        this.totalPages = res.last_page;
        this.totalRecords = res.total;
        
        // Generar números de página
        this.pageNumbers = [];
        for (let i = 1; i <= this.totalPages; i++) {
          this.pageNumbers.push(i);
        }

        // Si el drawer está abierto, refrescar el objeto seleccionado
        if (this.isDrawerOpen && this.selectedCaptacion) {
          const updated = this.captaciones.find(c => c.id === this.selectedCaptacion.id);
          if (updated) {
            this.selectedCaptacion = updated;
          }
        }
      },
      error: (err) => {
        this.error = err.error?.message || 'Error al conectar con el servidor de captaciones.';
        this.captaciones = [];
        this.totalRecords = 0;
      }
    });
  }

  onSearchChange() {
    this.currentPage = 1;
    this.loadCaptaciones();
  }

  onFilterChange() {
    this.currentPage = 1;
    this.loadCaptaciones();
  }

  clearFilters() {
    this.search = '';
    this.filterStatus = 'Todos los Estados';
    this.filterSeller = '';
    this.currentPage = 1;
    this.loadCaptaciones();
  }

  sort(field: string) {
    if (this.sortBy === field) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = field;
      this.sortOrder = 'asc';
    }
    this.loadCaptaciones();
  }

  changePage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadCaptaciones();
  }

  onDelete(item: Captacion) {
    if (confirm(`¿Está seguro que desea eliminar a "${item.business_name}"?`)) {
      this.crmService.deleteCaptacion(item.id).subscribe({
        next: () => {
          this.loadCaptaciones();
        }
      });
    }
  }

  // Drawer Logic
  openDrawer(item: Captacion) {
    // Show drawer immediately with basic data
    this.selectedCaptacion = item;
    this.isDrawerOpen = true;
    // Load detailed data asynchronously
    this.crmService.getCaptacion(item.id).subscribe({
      next: (detail) => {
        this.selectedCaptacion = detail;

        // Reset forms in drawer
        this.showVisitForm = false;
        this.showFollowupForm = false;
        this.showSuggestionForm = false;
        this.saleSystem = detail.offered_application || '';
        this.salePrice = detail.offered_price || 0;
        this.saleDiscount = 0;
        this.saleDate = new Date().toISOString().substring(0, 10);
        this.saleError = '';
      }
    });
  }

  closeDrawer() {
    this.isDrawerOpen = false;
  }

  // Submit visit
  onSubmitVisit() {
    if (!this.newVisitDate || !this.newVisitResult) return;

    this.crmService.createVisit({
      captacion_id: this.selectedCaptacion.id,
      visit_date: this.newVisitDate,
      result: this.newVisitResult.toUpperCase(),
      notes: this.newVisitNotes ? this.newVisitNotes.toUpperCase() : undefined
    }).subscribe({
      next: () => {
        this.newVisitDate = '';
        this.newVisitResult = '';
        this.newVisitNotes = '';
        this.showVisitForm = false;
        this.refreshDrawerData();
      }
    });
  }

  onDeleteVisit(id: number) {
    this.crmService.deleteVisit(id).subscribe(() => this.refreshDrawerData());
  }

  // Submit followup
  onSubmitFollowup() {
    if (!this.newFollowupDate || !this.newFollowupNotes) return;

    this.crmService.createFollowup({
      captacion_id: this.selectedCaptacion.id,
      date: this.newFollowupDate,
      notes: this.newFollowupNotes.toUpperCase(),
      next_contact: this.newFollowupNext ? this.newFollowupNext : undefined
    }).subscribe({
      next: () => {
        this.newFollowupDate = '';
        this.newFollowupNotes = '';
        this.newFollowupNext = '';
        this.showFollowupForm = false;
        this.refreshDrawerData();
      }
    });
  }

  onDeleteFollowup(id: number) {
    this.crmService.deleteFollowup(id).subscribe(() => this.refreshDrawerData());
  }

  // Submit suggestion
  onSubmitSuggestion() {
    if (!this.newSuggestionDesc) return;

    this.crmService.createSuggestion({
      captacion_id: this.selectedCaptacion.id,
      description: this.newSuggestionDesc.toUpperCase()
    }).subscribe({
      next: () => {
        this.newSuggestionDesc = '';
        this.showSuggestionForm = false;
        this.refreshDrawerData();
      }
    });
  }

  onDeleteSuggestion(id: number) {
    this.crmService.deleteSuggestion(id).subscribe(() => this.refreshDrawerData());
  }

  // Submit sale
  onSubmitSale() {
    if (!this.saleSystem || this.salePrice <= 0) {
      this.saleError = 'Por favor complete todos los datos de la venta.';
      return;
    }

    this.crmService.createSale({
      captacion_id: this.selectedCaptacion.id,
      sold_system: this.saleSystem.toUpperCase(),
      price: this.salePrice,
      discount: this.saleDiscount,
      sale_date: this.saleDate
    }).subscribe({
      next: () => {
        this.refreshDrawerData();
        this.loadCaptaciones(); // Recargar grilla por cambio de estado
      },
      error: (err) => {
        this.saleError = err.error?.message || 'Error al guardar la venta.';
      }
    });
  }

  refreshDrawerData() {
    this.crmService.getCaptacion(this.selectedCaptacion.id).subscribe(detail => {
      this.selectedCaptacion = detail;
    });
  }

  // Stylings
  getStatusClass(status: string) {
    switch (status) {
      case 'Captación': return 'status-captacion';
      case 'Follow-up': return 'status-followup';
      case 'Training': return 'status-training';
      case 'Negotiation': return 'status-negotiation';
      case 'Closed Sale': return 'status-closed';
      case 'Lost': return 'status-lost';
      default: return '';
    }
  }

  getStatusLabel(status: string) {
    if (status === 'Closed Sale') return 'Venta Cerrada';
    return status;
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

  formatDateString(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  }
}
