import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CrmService } from '../../../core/services/crm.service';

@Component({
  selector: 'app-quick-captacion',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="max-w-lg mx-auto space-y-6">
      <!-- Top header layout -->
      <div class="flex justify-between items-center bg-surface/60 backdrop-blur-[20px] text-primary p-4 rounded-xl border border-white/15 shadow-sm">
        <div class="flex items-center gap-3">
          <button routerLink="/dashboard" class="material-symbols-outlined text-primary hover:bg-white/10 p-2 rounded-full transition-all">close</button>
          <span class="font-bold text-lg text-primary">Quick Captación</span>
        </div>
        <span class="text-xs bg-primary/20 px-3 py-1 rounded-full text-primary font-bold">20s Challenge</span>
      </div>

      <!-- Quick GPS Auto-detect -->
      <section class="glass-panel p-4 rounded-xl space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-primary">location_on</span>
            <h2 class="font-semibold text-sm text-on-surface">Ubicación de Terreno</h2>
          </div>
          <button 
            type="button" 
            (click)="autoDetectGPS()" 
            [disabled]="gpsLoading"
            class="bg-primary text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 active:scale-95 transition-transform disabled:opacity-50"
          >
            <span class="material-symbols-outlined text-xs">my_location</span>
            {{ gpsLoading ? 'Detectando...' : 'Detectar Ubicación Real' }}
          </button>
        </div>

        <!-- Mini map preview -->
        <div class="relative w-full h-32 rounded-lg overflow-hidden border border-white/10 group" id="map-preview">
          <iframe *ngIf="gpsSuccess && latitude && longitude"
                  [src]="getSafeMapUrl()"
                  class="w-full h-full border-none"
                  allowfullscreen=""
                  loading="lazy"
                  referrerpolicy="no-referrer-when-downgrade">
          </iframe>
          <div class="absolute inset-0 flex items-center justify-center bg-background/40 backdrop-blur-[1px] pointer-events-none" *ngIf="!gpsSuccess">
            <p class="text-xs text-on-surface-variant italic">{{ gpsStatus }}</p>
          </div>
          <div class="absolute inset-0 bg-transparent flex flex-col justify-end p-2 pointer-events-none" *ngIf="gpsSuccess">
            <div class="bg-black/60 p-2 rounded text-[10px] text-primary backdrop-blur-md">
              <p class="font-bold text-white">{{ address }}</p>
              <p class="opacity-75 font-mono text-[9px] mt-0.5">{{ latitude }}, {{ longitude }} (± 3m)</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Main Fields Form -->
      <div class="glass-card rounded-[24px] p-6 space-y-6">
        <form (submit)="onSubmit()" class="space-y-4">
          <div class="space-y-2">
            <label class="block text-xs font-semibold text-on-surface-variant ml-1">Nombre del Negocio</label>
            <input 
              [(ngModel)]="businessName" 
              name="businessName"
              type="text" 
              placeholder="Ej: Café Cristal" 
              class="w-full h-12 glass-input rounded-xl px-4 text-sm text-white focus:outline-none uppercase" 
              required
            />
          </div>

          <div class="space-y-2">
            <label class="block text-xs font-semibold text-on-surface-variant ml-1">Nombre del Propietario</label>
            <input 
              [(ngModel)]="ownerName" 
              name="ownerName"
              type="text" 
              placeholder="Nombre completo" 
              class="w-full h-12 glass-input rounded-xl px-4 text-sm text-white focus:outline-none uppercase" 
              required
            />
          </div>

          <div class="space-y-2">
            <label class="block text-xs font-semibold text-on-surface-variant ml-1">Número de Teléfono (Bolivia)</label>
            <div class="relative">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-[18px]">call</span>
              <input 
                [(ngModel)]="phone" 
                name="phone"
                type="tel" 
                placeholder="+591 77568997" 
                class="w-full h-12 glass-input rounded-xl pl-12 pr-4 text-sm text-white focus:outline-none font-mono" 
                required
              />
            </div>
          </div>

          <div class="space-y-2">
            <label class="block text-xs font-semibold text-on-surface-variant ml-1">Estado de Interés</label>
            <select 
              [(ngModel)]="status" 
              name="status"
              class="w-full h-12 glass-input rounded-xl px-4 text-sm text-white focus:outline-none bg-background appearance-none uppercase"
            >
              <option value="Captación">Captación (Contacto Inicial)</option>
              <option value="Follow-up">Follow-up (Seguimiento)</option>
              <option value="Negotiation">Negociación</option>
              <option value="Closed Sale">Venta Cerrada</option>
              <option value="Lost">Perdido</option>
            </select>
          </div>

          <div class="space-y-2">
            <label class="block text-xs font-semibold text-on-surface-variant ml-1">Notas Rápidas</label>
            <textarea 
              [(ngModel)]="notes" 
              name="notes"
              rows="3" 
              placeholder="Añade detalles clave rápidamente..." 
              class="w-full glass-input rounded-xl p-4 text-sm text-white focus:outline-none resize-none uppercase"
            ></textarea>
          </div>

          <div *ngIf="error" class="p-3 bg-red-500/20 border border-red-500/30 text-red-300 rounded-lg text-xs">
            {{ error }}
          </div>

          <div class="flex flex-col gap-3 pt-2">
            <button 
              type="submit" 
              [disabled]="isSaving"
              class="w-full h-14 bg-primary text-white font-bold rounded-xl shadow-[0_10px_20px_-5px_rgba(0,85,255,0.4)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{{ isSaving ? 'Guardando...' : 'Guardar Captación' }}</span>
              <span class="material-symbols-outlined">save</span>
            </button>
            <button 
              type="button" 
              (click)="completeLater()"
              class="w-full h-12 bg-white/5 border border-white/10 text-on-surface-variant hover:text-white font-bold rounded-xl active:bg-white/10 transition-all text-xs"
            >
              Completar Luego
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class QuickCaptacionComponent {
  private crmService = inject(CrmService);
  private router = inject(Router);
  private sanitizer = inject(DomSanitizer);

  // Form states
  businessName = '';
  ownerName = '';
  phone = '+591 ';
  status = 'Captación';
  notes = '';
  
  // GPS fields
  gpsLoading = false;
  gpsSuccess = false;
  gpsStatus = 'Esperando ubicación geográfica...';
  latitude = '';
  longitude = '';
  address = '';

  error = '';
  isSaving = false;

  getSafeMapUrl(): SafeResourceUrl {
    if (!this.latitude || !this.longitude) {
      return '';
    }
    const url = `https://maps.google.com/maps?q=${this.latitude},${this.longitude}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  autoDetectGPS() {
    this.gpsLoading = true;
    this.gpsSuccess = false;
    this.gpsStatus = 'Detectando ubicación real...';

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          this.latitude = lat.toFixed(6);
          this.longitude = lng.toFixed(6);
          this.gpsSuccess = true;
          this.gpsLoading = false;
          this.gpsStatus = 'Ubicación Detectada';
          
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
            .then(res => res.json())
            .then(data => {
              if (data && data.display_name) {
                this.address = data.display_name.toUpperCase();
              } else {
                this.address = `UBICACIÓN REAL: LAT ${this.latitude}, LNG ${this.longitude}`;
              }
            })
            .catch(() => {
              this.address = `UBICACIÓN REAL: LAT ${this.latitude}, LNG ${this.longitude}`;
            });
        },
        (error) => {
          console.error(error);
          setTimeout(() => {
            this.gpsLoading = false;
            this.gpsSuccess = true;
            this.latitude = '-16.500000';
            this.longitude = '-68.150000';
            this.address = 'AVENIDA 16 DE JULIO, LA PAZ, BOLIVIA (UBICACIÓN GPS SIMULADA)';
            this.gpsStatus = 'Ubicación Simulada';
          }, 1000);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      setTimeout(() => {
        this.gpsLoading = false;
        this.gpsSuccess = true;
        this.latitude = '-16.500000';
        this.longitude = '-68.150000';
        this.address = 'AVENIDA 16 DE JULIO, LA PAZ, BOLIVIA (GPS NO SOPORTADO)';
        this.gpsStatus = 'Ubicación Simulada';
      }, 1000);
    }
  }

  onSubmit() {
    if (!this.businessName || !this.ownerName || !this.phone) {
      this.error = 'Por favor complete los campos obligatorios.';
      return;
    }

    this.isSaving = true;
    this.error = '';

    let cleanPhone = this.phone.replace(/\s+/g, '');
    if (/^\d{8}$/.test(cleanPhone)) {
      this.phone = `+591 ${cleanPhone}`;
    }

    const payload = {
      business_name: this.businessName.toUpperCase(),
      owner_name: this.ownerName.toUpperCase(),
      phone: this.phone,
      status: this.status,
      notes: this.notes ? this.notes.toUpperCase() : '',
      address: this.gpsSuccess ? this.address.toUpperCase() : undefined,
      google_maps: this.gpsSuccess ? `${this.latitude},${this.longitude}` : undefined
    };

    this.crmService.quickCreateCaptacion(payload).subscribe({
      next: () => {
        this.isSaving = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isSaving = false;
        this.error = err.error?.message || 'Error al guardar la captación rápida.';
      }
    });
  }

  completeLater() {
    if (!this.businessName) {
      this.error = 'Complete al menos el Nombre de Negocio para guardar y completar luego.';
      return;
    }

    this.isSaving = true;
    this.error = '';

    let cleanPhone = this.phone.replace(/\s+/g, '');
    if (/^\d{8}$/.test(cleanPhone)) {
      this.phone = `+591 ${cleanPhone}`;
    }

    const payload = {
      business_name: this.businessName.toUpperCase(),
      owner_name: this.ownerName ? this.ownerName.toUpperCase() : 'PENDIENTE DE REGISTRAR',
      phone: this.phone || 'PENDIENTE',
      status: 'Captación',
      notes: '[BORRADOR RÁPIDO] ' + (this.notes ? this.notes.toUpperCase() : '')
    };

    this.crmService.quickCreateCaptacion(payload).subscribe({
      next: () => {
        this.isSaving = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isSaving = false;
        this.error = err.error?.message || 'Error al guardar el borrador.';
      }
    });
  }
}
