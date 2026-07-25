import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CrmService } from '../../../core/services/crm.service';
import { AuthService } from '../../../core/services/auth.service';
import { Followup, Captacion } from '../../../shared/interfaces/crm.interface';

@Component({
  selector: 'app-timeline',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-8">
      <!-- Header -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-outline-variant/30 pb-4">
        <div>
          <h2 class="font-bold text-3xl text-on-surface tracking-tight">Historial y Seguimiento</h2>
          <p class="text-on-surface-variant text-base">Timeline interactivo del ciclo de vida y contactos con los clientes.</p>
        </div>
        <button (click)="toggleAddForm()" class="bg-primary text-white py-2.5 px-4 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5">
          <span class="material-symbols-outlined">{{ showForm ? 'remove' : 'add' }}</span>
          {{ showForm ? 'Cancelar' : 'Nuevo Seguimiento' }}
        </button>
      </div>

      <!-- Add Followup Inline Form -->
      <div *ngIf="showForm" class="glass-card rounded-[24px] p-6 space-y-6">
        <h3 class="font-bold text-lg text-white">Programar Próximo Contacto</h3>
        <div *ngIf="error" class="p-3 bg-red-500/20 border border-red-500/30 text-red-300 rounded-lg text-xs">
          {{ error }}
        </div>
        
        <form (submit)="onSubmit()" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="block text-xs font-semibold text-on-surface-variant ml-1">Seleccionar Negocio / Cliente</label>
              <select [(ngModel)]="newFollowup.captacion_id" name="captacion_id" class="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-sm text-white focus:ring-1 focus:ring-primary outline-none">
                <option value="0" disabled>Seleccionar prospecto...</option>
                <option *ngFor="let c of captaciones" [value]="c.id">{{ c.business_name }} ({{ c.owner_name }})</option>
              </select>
            </div>

            <div class="space-y-2">
              <label class="block text-xs font-semibold text-on-surface-variant ml-1">Fecha de Seguimiento</label>
              <input type="datetime-local" [(ngModel)]="newFollowup.date" name="date" class="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-sm text-white focus:ring-1 focus:ring-primary outline-none" required />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="block text-xs font-semibold text-on-surface-variant ml-1">Próxima Fecha de Contacto (Opcional)</label>
              <input type="date" [(ngModel)]="newFollowup.next_contact" name="next_contact" class="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-sm text-white focus:ring-1 focus:ring-primary outline-none" />
            </div>

            <div class="space-y-2">
              <label class="block text-xs font-semibold text-on-surface-variant ml-1">Resultado Esperado</label>
              <input type="text" [(ngModel)]="newFollowup.result" name="result" placeholder="Ej: Agendar demostración física" class="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-sm text-white focus:ring-1 focus:ring-primary outline-none" />
            </div>
          </div>

          <div class="space-y-2">
            <label class="block text-xs font-semibold text-on-surface-variant ml-1">Notas del Contacto</label>
            <textarea [(ngModel)]="newFollowup.notes" name="notes" rows="3" placeholder="Detalla qué se acordó con el cliente en esta llamada o visita..." class="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl p-4 text-sm text-white focus:ring-1 focus:ring-primary outline-none resize-none" required></textarea>
          </div>

          <button type="submit" class="w-full py-3.5 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-1">
            <span class="material-symbols-outlined">save</span> Guardar y Agendar
          </button>
        </form>
      </div>

      <!-- Timeline Canvas -->
      <div class="glass-card rounded-[24px] p-6 md:p-8">
        <div *ngIf="followups.length > 0" class="space-y-12 relative before:content-[''] before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-outline-variant">
          
          <div *ngFor="let followup of followups" class="relative pl-12 group">
            
            <!-- Icon/Circle anchor -->
            <div class="absolute left-0 top-1.5 w-10 h-10 rounded-xl flex items-center justify-center ring-8 ring-background z-10"
                 [class.bg-primary]="getFollowupTheme(followup) === 'pending'"
                 [class.bg-amber-500]="getFollowupTheme(followup) === 'rescheduled'"
                 [class.bg-green-600]="getFollowupTheme(followup) === 'completed'">
              <span class="material-symbols-outlined text-white text-[18px]">
                {{ getFollowupIcon(followup) }}
              </span>
            </div>

            <!-- Date and metadata -->
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs font-mono text-outline mb-2">
              <span class="font-bold text-sm"
                    [class.text-primary]="getFollowupTheme(followup) === 'pending'"
                    [class.text-amber-500]="getFollowupTheme(followup) === 'rescheduled'"
                    [class.text-green-500]="getFollowupTheme(followup) === 'completed'">
                {{ formatDate(followup.date) }}
              </span>
              <div class="flex items-center gap-4">
                <span class="px-2 py-0.5 rounded text-[10px] font-sans font-bold uppercase tracking-wider"
                      [class.bg-primary/10]="getFollowupTheme(followup) === 'pending'"
                      [class.text-primary]="getFollowupTheme(followup) === 'pending'"
                      [class.border]="getFollowupTheme(followup) === 'pending'"
                      [class.border-primary/20]="getFollowupTheme(followup) === 'pending'"
                      
                      [class.bg-amber-500/10]="getFollowupTheme(followup) === 'rescheduled'"
                      [class.text-amber-500]="getFollowupTheme(followup) === 'rescheduled'"
                      [class.border]="getFollowupTheme(followup) === 'rescheduled'"
                      [class.border-amber-500/20]="getFollowupTheme(followup) === 'rescheduled'"
                      
                      [class.bg-green-500/10]="getFollowupTheme(followup) === 'completed'"
                      [class.text-green-500]="getFollowupTheme(followup) === 'completed'"
                      [class.border]="getFollowupTheme(followup) === 'completed'"
                      [class.border-green-500/20]="getFollowupTheme(followup) === 'completed'">
                  {{ getStatusLabel(followup) }}
                </span>
                
                <span class="bg-surface-container border border-outline-variant px-2 py-0.5 rounded font-sans text-[10px] font-bold text-on-surface-variant">
                  {{ followup.captacion?.business_name }}
                </span>
                <span class="text-[10px] text-outline font-sans">
                  Vendedor: <strong>{{ followup.captacion?.seller?.username }}</strong>
                </span>
              </div>
            </div>

            <!-- Notes card -->
            <div class="p-4 bg-white/[0.03] border rounded-xl space-y-3 group-hover:border-primary/30 transition-all"
                 [class.border-white/5]="getFollowupTheme(followup) === 'pending'"
                 [class.border-amber-500/20]="getFollowupTheme(followup) === 'rescheduled'"
                 [class.bg-amber-500/[0.02]]="getFollowupTheme(followup) === 'rescheduled'"
                 [class.border-green-600/20]="getFollowupTheme(followup) === 'completed'"
                 [class.bg-green-600/[0.01]]="getFollowupTheme(followup) === 'completed'">
              <p class="text-sm text-on-surface whitespace-pre-line">{{ followup.notes }}</p>
              
              <!-- Result / Future actions -->
              <div *ngIf="followup.result" class="p-2.5 bg-surface-container-low rounded-lg text-xs text-on-surface-variant flex items-center gap-2">
                <span class="material-symbols-outlined text-primary text-[16px]">info</span>
                <span>Resultado: <strong>{{ followup.result }}</strong></span>
              </div>

              <!-- Next contact callout & actions -->
              <div class="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-white/5">
                <div>
                  <p *ngIf="followup.next_contact" class="text-xs font-bold flex items-center gap-1"
                     [class.text-primary]="getFollowupTheme(followup) === 'pending'"
                     [class.text-amber-500]="getFollowupTheme(followup) === 'rescheduled'"
                     [class.text-green-500]="getFollowupTheme(followup) === 'completed'">
                    <span class="material-symbols-outlined text-[16px]">event</span>
                    Próxima llamada agendada: {{ formatDateString(followup.next_contact) }}
                  </p>
                  <p *ngIf="!followup.next_contact" class="text-xs text-on-surface-variant/40 flex items-center gap-1">
                    <span class="material-symbols-outlined text-[16px]">info</span>
                    Sin próxima llamada programada
                  </p>
                </div>
                
                <!-- Quick Actions & shortcuts -->
                <div class="flex items-center gap-2">
                  <!-- Complete Action (only if not completed) -->
                  <button *ngIf="getFollowupTheme(followup) !== 'completed'"
                          (click)="markAsCompleted(followup)"
                          class="h-8 px-2.5 rounded-md border border-green-600/30 bg-green-600/10 hover:bg-green-600 hover:text-white text-green-500 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                          title="Marcar como Completada">
                    <span class="material-symbols-outlined text-[16px]">check</span>
                    Completar
                  </button>

                  <!-- Reschedule Action (only if not completed) -->
                  <button *ngIf="getFollowupTheme(followup) !== 'completed'"
                          (click)="openRescheduleModal(followup)"
                          class="h-8 px-2.5 rounded-md border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500 hover:text-white text-amber-500 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                          title="Reprogramar Reunión">
                    <span class="material-symbols-outlined text-[16px]">event_repeat</span>
                    Reprogramar
                  </button>

                  <a [href]="'tel:' + followup.captacion?.phone" class="w-8 h-8 rounded-md border border-outline-variant flex items-center justify-center hover:bg-primary hover:border-primary text-on-surface-variant hover:text-white transition-all cursor-pointer" title="Llamar">
                    <span class="material-symbols-outlined text-[16px]">call</span>
                  </a>
                  <a [href]="'https://wa.me/' + followup.captacion?.phone?.replace('+', '')" target="_blank" class="w-8 h-8 rounded-md border border-outline-variant flex items-center justify-center hover:bg-green-600 hover:border-green-600 text-on-surface-variant hover:text-white transition-all cursor-pointer" title="Enviar WhatsApp">
                    <span class="material-symbols-outlined text-[16px]">chat</span>
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="followups.length === 0" class="flex flex-col items-center justify-center py-20 text-on-surface-variant space-y-2">
          <span class="material-symbols-outlined text-[48px] opacity-40">timeline</span>
          <p class="text-sm">No se registran seguimientos en la cartera en este momento.</p>
        </div>
      </div>

      <!-- Reschedule Dialog / Modal Overlay -->
      <div *ngIf="showRescheduleModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="glass-card rounded-[24px] p-6 max-w-md w-full space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <div class="flex justify-between items-center border-b border-outline-variant/30 pb-3">
            <h3 class="font-bold text-lg text-white flex items-center gap-2">
              <span class="material-symbols-outlined text-amber-500">event_repeat</span>
              Reprogramar Reunión
            </h3>
            <button (click)="closeRescheduleModal()" class="text-on-surface-variant hover:text-white transition-all cursor-pointer">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <div *ngIf="rescheduleError" class="p-3 bg-red-500/20 border border-red-500/30 text-red-300 rounded-lg text-xs">
            {{ rescheduleError }}
          </div>

          <div class="text-xs text-on-surface-variant bg-white/5 p-3 rounded-xl border border-white/5">
            <strong>Negocio:</strong> {{ followupToReschedule?.captacion?.business_name }} <br>
            <strong>Fecha actual:</strong> {{ followupToReschedule ? formatDate(followupToReschedule.date) : '' }}
          </div>

          <form (submit)="onRescheduleSubmit()" class="space-y-4">
            <div class="space-y-2">
              <label class="block text-xs font-semibold text-on-surface-variant ml-1">Nueva Fecha de Reunión</label>
              <input type="datetime-local" [(ngModel)]="rescheduleData.newDate" name="newDate" class="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-sm text-white focus:ring-1 focus:ring-amber-500 outline-none" required />
            </div>

            <div class="space-y-2">
              <label class="block text-xs font-semibold text-on-surface-variant ml-1">Motivo de la Reprogramación</label>
              <textarea [(ngModel)]="rescheduleData.notes" name="notes" rows="3" placeholder="Detalla el motivo del cambio de fecha..." class="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl p-4 text-sm text-white focus:ring-1 focus:ring-amber-500 outline-none resize-none" required></textarea>
            </div>

            <div class="flex gap-3 pt-2">
              <button type="button" (click)="closeRescheduleModal()" class="flex-1 py-3 bg-white/10 hover:bg-white/15 text-white rounded-xl font-bold text-sm transition-all cursor-pointer">
                Cancelar
              </button>
              <button type="submit" class="flex-1 py-3 bg-amber-500 text-black rounded-xl font-bold text-sm hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-1 cursor-pointer">
                <span class="material-symbols-outlined text-[18px]">save</span> Reprogramar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class TimelineComponent implements OnInit {
  private crmService = inject(CrmService);
  private authService = inject(AuthService);

  followups: Followup[] = [];
  captaciones: Captacion[] = [];
  
  showForm = false;
  error = '';
  isAdmin = false;

  // Form Model
  newFollowup = {
    captacion_id: 0,
    date: '',
    notes: '',
    next_contact: '',
    result: ''
  };

  // Reschedule Modal Model
  showRescheduleModal = false;
  followupToReschedule: Followup | null = null;
  rescheduleError = '';
  rescheduleData = {
    newDate: '',
    notes: ''
  };

  ngOnInit() {
    this.isAdmin = this.authService.getRole() === 'admin';
    this.loadFollowups();
    this.loadCaptaciones();
  }

  loadFollowups() {
    this.crmService.getFollowups().subscribe(data => this.followups = data);
  }

  loadCaptaciones() {
    // Cargar todas las captaciones de la lista del vendedor actual para poder seleccionarlas en el formulario
    this.crmService.getCaptaciones(1, '', 'Todos los Estados', '', 'Vendedor Asignado', 'business_name', 'asc').subscribe(res => {
      this.captaciones = res.data;
    });
  }

  toggleAddForm() {
    this.showForm = !this.showForm;
    this.error = '';
    // Inicializar fecha actual por defecto
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    this.newFollowup.date = now.toISOString().substring(0, 16);
    this.newFollowup.captacion_id = 0;
    this.newFollowup.notes = '';
    this.newFollowup.next_contact = '';
    this.newFollowup.result = '';
  }

  onSubmit() {
    if (this.newFollowup.captacion_id === 0 || !this.newFollowup.date || !this.newFollowup.notes) {
      this.error = 'Por favor complete todos los campos obligatorios.';
      return;
    }

    this.crmService.createFollowup({
      captacion_id: Number(this.newFollowup.captacion_id),
      date: this.newFollowup.date,
      notes: this.newFollowup.notes,
      next_contact: this.newFollowup.next_contact ? this.newFollowup.next_contact : undefined,
      result: this.newFollowup.result ? this.newFollowup.result : undefined,
      status: 'pending'
    }).subscribe({
      next: () => {
        this.loadFollowups();
        this.toggleAddForm();
      },
      error: (err) => {
        this.error = err.error?.message || 'Error al guardar el seguimiento.';
      }
    });
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  formatDateString(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  // Followup Status Helpers
  getFollowupTheme(followup: Followup): 'pending' | 'rescheduled' | 'completed' {
    if (followup.status === 'rescheduled') {
      return 'rescheduled';
    }
    if (followup.status === 'completed') {
      return 'completed';
    }
    const followupDate = new Date(followup.date);
    const now = new Date();
    if (followupDate < now) {
      return 'completed';
    }
    return 'pending';
  }

  getFollowupIcon(followup: Followup): string {
    const theme = this.getFollowupTheme(followup);
    switch (theme) {
      case 'rescheduled':
        return 'event_repeat';
      case 'completed':
        return 'check_circle';
      case 'pending':
      default:
        return 'chat';
    }
  }

  getStatusLabel(followup: Followup): string {
    const theme = this.getFollowupTheme(followup);
    switch (theme) {
      case 'rescheduled':
        return 'Reprogramado';
      case 'completed':
        return 'Completado';
      case 'pending':
      default:
        return 'Pendiente';
    }
  }

  markAsCompleted(followup: Followup) {
    this.crmService.updateFollowup(followup.id, {
      status: 'completed'
    }).subscribe({
      next: () => {
        this.loadFollowups();
      },
      error: (err) => {
        console.error('Error al completar el seguimiento', err);
      }
    });
  }

  openRescheduleModal(followup: Followup) {
    this.followupToReschedule = followup;
    this.rescheduleError = '';
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    this.rescheduleData.newDate = now.toISOString().substring(0, 16);
    this.rescheduleData.notes = '';
    this.showRescheduleModal = true;
  }

  closeRescheduleModal() {
    this.showRescheduleModal = false;
    this.followupToReschedule = null;
    this.rescheduleError = '';
  }

  onRescheduleSubmit() {
    if (!this.followupToReschedule) return;
    if (!this.rescheduleData.newDate || !this.rescheduleData.notes) {
      this.rescheduleError = 'Por favor complete todos los campos.';
      return;
    }

    const originalNotes = this.followupToReschedule.notes;
    const originalDateFormatted = this.formatDate(this.followupToReschedule.date);
    
    // 1. Update the original followup: set status to rescheduled, and append a note about the rescheduling.
    const updatedNotes = `${originalNotes}\n\n[REPROGRAMADO] SE SOLICITÓ CAMBIO DE FECHA. MOTIVO: ${this.rescheduleData.notes.toUpperCase()}`;
    
    this.crmService.updateFollowup(this.followupToReschedule.id, {
      status: 'rescheduled',
      notes: updatedNotes
    }).subscribe({
      next: () => {
        // 2. Create the new followup with status 'pending'
        this.crmService.createFollowup({
          captacion_id: this.followupToReschedule!.captacion_id,
          date: this.rescheduleData.newDate,
          notes: `REUNIÓN REPROGRAMADA DESDE LA FECHA ORIGINAL DEL ${originalDateFormatted.toUpperCase()}.\nMOTIVO DE CAMBIO: ${this.rescheduleData.notes}`,
          status: 'pending'
        }).subscribe({
          next: () => {
            this.loadFollowups();
            this.closeRescheduleModal();
          },
          error: (err) => {
            this.rescheduleError = err.error?.message || 'Error al agendar el nuevo seguimiento.';
          }
        });
      },
      error: (err) => {
        this.rescheduleError = err.error?.message || 'Error al actualizar el seguimiento original.';
      }
    });
  }
}
