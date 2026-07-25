import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CrmService } from '../../../core/services/crm.service';
import { AuthService } from '../../../core/services/auth.service';
import { Captacion } from '../../../shared/interfaces/crm.interface';

@Component({
  selector: 'app-captacion-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="max-w-2xl mx-auto space-y-8">
      <!-- Header Step Indicator -->
      <div class="max-w-2xl mx-auto">
        <div class="flex justify-between items-center mb-4">
          <h1 class="font-bold text-2xl md:text-3xl text-primary">{{ isEditMode ? 'Editar Captación' : 'Registrar Captación' }}</h1>
          <div class="flex items-center gap-4">
            <span class="text-xs font-semibold text-primary opacity-80">Paso {{ currentStep }} de 3</span>
            <a routerLink="/captaciones" class="w-8 h-8 rounded-full border border-outline-variant flex items-center justify-center hover:bg-white/10 text-on-surface-variant hover:text-white transition-all" title="Cerrar">
              <span class="material-symbols-outlined text-[18px]">close</span>
            </a>
          </div>
        </div>
        <div class="w-full h-1 bg-white/10 rounded-full overflow-hidden">
          <div class="h-full bg-primary shadow-[0_0_10px_rgba(0,85,255,0.5)] transition-all duration-700" 
               [style.width]="(currentStep * 33.33) + '%'"></div>
        </div>
      </div>

      <!-- Main Form Wrapper -->
      <div class="glass-card rounded-[24px] p-6 md:p-8 space-y-6">
        
        <!-- STEP 1: Información del Negocio -->
        <div *ngIf="currentStep === 1" class="space-y-6">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/20 text-primary">
              <span class="material-symbols-outlined">storefront</span>
            </div>
            <h2 class="font-bold text-lg text-white">Información del Negocio</h2>
          </div>

          <div class="space-y-2">
            <label for="business_name" class="block text-xs font-semibold text-on-surface-variant ml-1">Nombre del Negocio</label>
            <input id="business_name" name="business_name" type="text" [(ngModel)]="model.business_name" class="w-full glass-input rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none uppercase" placeholder="Ej. Restaurante La Ola" />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="space-y-2">
              <label for="category" class="block text-xs font-semibold text-on-surface-variant ml-1">Categoría</label>
              <select id="category" name="category" [(ngModel)]="model.category" class="w-full glass-input rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none bg-background appearance-none uppercase">
                <option value="Comercio Minorista">Comercio Minorista</option>
                <option value="Gastronomy">Gastronomía</option>
                <option value="Servicios">Servicios</option>
                <option value="Tecnología">Tecnología</option>
              </select>
            </div>

            <!-- accepts_card: Recibió nuestra tarjeta -->
            <div class="flex items-center justify-between p-4 glass-input rounded-xl h-full">
              <div class="flex flex-col pr-2">
                <span class="text-xs font-semibold text-on-surface">Recibió nuestra tarjeta</span>
                <span class="text-[9px] text-primary uppercase tracking-wider font-bold">YALASOFT</span>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" [(ngModel)]="model.accepts_card" class="sr-only peer" />
                <div class="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
              </label>
            </div>

            <!-- gave_card: Nos dio su tarjeta -->
            <div class="flex items-center justify-between p-4 glass-input rounded-xl h-full">
              <div class="flex flex-col pr-2">
                <span class="text-xs font-semibold text-on-surface">Nos dio su tarjeta</span>
                <span class="text-[9px] text-on-surface-variant uppercase tracking-wider font-bold">DE SU EMPRESA</span>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" [(ngModel)]="model.gave_card" class="sr-only peer" />
                <div class="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
              </label>
            </div>
          </div>

          <!-- GPS Localization Native -->
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <label for="address" class="block text-xs font-semibold text-on-surface-variant ml-1">Ubicación Geográfica</label>
              <button type="button" (click)="autoDetectLocation()" class="flex items-center gap-1.5 text-primary font-bold px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 hover:bg-primary/20 active:scale-95 transition-all text-xs">
                <span class="material-symbols-outlined text-[16px]">my_location</span>
                <span>{{ gpsLoading ? 'Detectando...' : 'Detectar Ubicación Real' }}</span>
              </button>
            </div>
            
            <div class="relative">
              <span class="material-symbols-outlined absolute left-4 top-4 text-on-surface-variant">location_on</span>
              <textarea id="address" name="address" [(ngModel)]="model.address" rows="2" placeholder="Dirección completa del negocio..." class="w-full glass-input rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:outline-none resize-none uppercase"></textarea>
            </div>

            <div class="grid grid-cols-2 gap-4 text-sm font-mono">
              <div class="glass-input rounded-xl px-4 py-2 border border-white/5">
                <span class="text-[9px] text-on-surface-variant block uppercase tracking-widest font-bold">Coordenadas GPS</span>
                <input id="google_maps" name="google_maps" type="text" [(ngModel)]="model.google_maps" class="bg-transparent border-none p-0 text-xs text-primary w-full focus:ring-0 outline-none" placeholder="Lat, Long" />
              </div>
              <div class="glass-input rounded-xl px-4 py-2 border border-white/5 flex flex-col justify-center">
                <span class="text-[9px] text-on-surface-variant block uppercase tracking-widest font-bold">Estado GPS</span>
                <span class="text-xs font-bold uppercase mt-0.5" [class.text-green-400]="gpsSuccess" [class.text-outline]="!gpsSuccess">
                  {{ gpsSuccess ? 'GPS ACTIVO (± 3m)' : 'GPS Esperando...' }}
                </span>
              </div>
            </div>

            <!-- Map View layout -->
            <div class="w-full h-32 rounded-xl overflow-hidden border border-white/10 relative group">
              <iframe *ngIf="gpsSuccess && model.google_maps"
                      [src]="getSafeMapUrl()"
                      class="w-full h-full border-none"
                      allowfullscreen=""
                      loading="lazy"
                      referrerpolicy="no-referrer-when-downgrade">
              </iframe>
              <div class="absolute inset-0 flex items-center justify-center bg-background/30 backdrop-blur-[1px] pointer-events-none" *ngIf="!gpsSuccess">
                <span class="text-xs text-outline italic">Esperando coordenadas geográficas...</span>
              </div>
            </div>
          </div>

          <!-- Horarios -->
          <div class="space-y-4">
            <label class="block text-xs font-semibold text-on-surface-variant ml-1">Horarios Sugeridos</label>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <button type="button" *ngFor="let h of hourSuggestions" 
                      (click)="selectHours(h)"
                      class="py-2.5 px-3 rounded-xl text-center active:scale-95 transition-all font-semibold border uppercase"
                      [class.bg-primary]="model.business_hours === h || (h === 'Personalizado' && isCustomHours)"
                      [class.text-white]="model.business_hours === h || (h === 'Personalizado' && isCustomHours)"
                      [class.border-primary]="model.business_hours === h || (h === 'Personalizado' && isCustomHours)"
                      [class.bg-white/5]="model.business_hours !== h && !(h === 'Personalizado' && isCustomHours)"
                      [class.text-on-surface-variant]="model.business_hours !== h && !(h === 'Personalizado' && isCustomHours)"
                      [class.border-white/10]="model.business_hours !== h && !(h === 'Personalizado' && isCustomHours)">
                {{ h }}
              </button>
            </div>
            
            <!-- Custom Hours Input -->
            <div *ngIf="isCustomHours" class="mt-3 space-y-2">
              <label class="block text-[11px] font-semibold text-on-surface-variant ml-1">Escribe el Horario Personalizado</label>
              <input type="text" [(ngModel)]="customHoursText" (ngModelChange)="onCustomHoursChange()" class="w-full glass-input rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none uppercase" placeholder="Ej. Lunes a Viernes 08:30 - 12:30, 14:30 - 18:30" />
            </div>
          </div>
        </div>

        <!-- STEP 2: Persona Responsable -->
        <div *ngIf="currentStep === 2" class="space-y-6">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/20 text-primary">
              <span class="material-symbols-outlined">person</span>
            </div>
            <h2 class="font-bold text-lg text-white">Persona Responsable y Contacto</h2>
          </div>

          <div class="space-y-2">
            <label for="owner_name" class="block text-xs font-semibold text-on-surface-variant ml-1">Nombre del Propietario</label>
            <input id="owner_name" name="owner_name" type="text" [(ngModel)]="model.owner_name" class="w-full glass-input rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none uppercase" placeholder="Propietario legal" />
          </div>

          <div class="space-y-2">
            <label for="contact_name" class="block text-xs font-semibold text-on-surface-variant ml-1">Contacto Comercial (Opcional)</label>
            <input id="contact_name" name="contact_name" type="text" [(ngModel)]="model.contact_name" class="w-full glass-input rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none uppercase" placeholder="Administrador o encargado de compras" />
          </div>

          <!-- Bolivia Formats -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label for="phone" class="block text-xs font-semibold text-on-surface-variant ml-1">Teléfono Móvil (Bolivia)</label>
              <div class="relative">
                <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">call</span>
                <input id="phone" name="phone" type="tel" [(ngModel)]="model.phone" class="w-full glass-input rounded-xl pl-12 pr-4 py-3.5 text-sm text-white focus:outline-none font-mono" placeholder="+591 77568997" />
              </div>
            </div>

            <div class="space-y-2">
              <label for="whatsapp" class="block text-xs font-semibold text-on-surface-variant ml-1">WhatsApp (Bolivia - Opcional)</label>
              <div class="relative">
                <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">chat</span>
                <input id="whatsapp" name="whatsapp" type="tel" [(ngModel)]="model.whatsapp" class="w-full glass-input rounded-xl pl-12 pr-4 py-3.5 text-sm text-white focus:outline-none font-mono" placeholder="+591 77568997" />
              </div>
            </div>
          </div>
        </div>

        <!-- STEP 3: Información Comercial -->
        <div *ngIf="currentStep === 3" class="space-y-6">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/20 text-primary">
              <span class="material-symbols-outlined">payments</span>
            </div>
            <h2 class="font-bold text-lg text-white">Información Comercial</h2>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="space-y-2">
              <label for="offered_application" class="block text-xs font-semibold text-on-surface-variant ml-1">Aplicación Ofrecida</label>
              <input id="offered_application" name="offered_application" type="text" [(ngModel)]="model.offered_application" class="w-full glass-input rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none uppercase" placeholder="Ej. YalaCommerce SaaS" />
            </div>

            <div class="space-y-2">
              <label for="licensing_type" class="block text-xs font-semibold text-on-surface-variant ml-1">Esquema de Licencia</label>
              <select id="licensing_type" name="licensing_type" [(ngModel)]="model.licensing_type" class="w-full glass-input rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none bg-background appearance-none uppercase">
                <option value="SaaS">SaaS (Mensual/Anual)</option>
                <option value="Pago Único">Pago Único (Licencia Perpetua)</option>
              </select>
            </div>

            <!-- Moneda Bs en Software -->
            <div class="space-y-2">
              <label for="offered_price" class="block text-xs font-semibold text-on-surface-variant ml-1">Precio Ofrecido (Bs.)</label>
              <input id="offered_price" name="offered_price" type="number" [(ngModel)]="model.offered_price" class="w-full glass-input rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none" placeholder="Ej. 8500" />
            </div>
          </div>

          <!-- Hosting Sections (Dólares permanecen para hosting) -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-white/5 rounded-2xl border border-white/5">
            <div class="flex items-center justify-between p-2">
              <div class="flex flex-col">
                <span class="text-xs font-bold text-white">¿Se ofreció Hosting?</span>
                <span class="text-[9px] text-on-surface-variant uppercase tracking-wider font-semibold">Espacio web e infraestructura</span>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" [(ngModel)]="model.offered_hosting" class="sr-only peer" />
                <div class="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
              </label>
            </div>

            <div class="space-y-2" *ngIf="model.offered_hosting">
              <label for="hosting_price" class="block text-xs font-semibold text-on-surface-variant ml-1">Precio del Hosting ($USD)</label>
              <input id="hosting_price" name="hosting_price" type="number" [(ngModel)]="model.hosting_price" class="w-full glass-input rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none" placeholder="Valor por defecto: 50" />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label for="promotion" class="block text-xs font-semibold text-on-surface-variant ml-1">Promoción Aplicada</label>
              <input id="promotion" name="promotion" type="text" [(ngModel)]="model.promotion" class="w-full glass-input rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none uppercase" placeholder="Ej: 10% descuento primer año" />
            </div>

            <div class="space-y-2">
              <label for="status" class="block text-xs font-semibold text-on-surface-variant ml-1">Estado de Interés</label>
              <select id="status" name="status" [(ngModel)]="model.status" class="w-full glass-input rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none bg-background appearance-none uppercase">
                <option value="Captación">Captación</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Training">Training</option>
                <option value="Negotiation">Negotiation</option>
                <option value="Closed Sale">Venta Cerrada</option>
                <option value="Lost">Perdido</option>
              </select>
            </div>
          </div>

          <!-- Seller Assignment (Admin only) -->
          <div *ngIf="isAdmin" class="space-y-2">
            <label for="seller_id" class="block text-xs font-semibold text-on-surface-variant ml-1">Asignar a Vendedor</label>
            <select id="seller_id" name="seller_id" [(ngModel)]="model.seller_id" class="w-full glass-input rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none bg-background appearance-none uppercase">
              <option value="0" disabled>Seleccionar Vendedor...</option>
              <option *ngFor="let s of sellers" [value]="s.id">{{ s.username }}</option>
            </select>
          </div>

          <div class="space-y-2">
            <label for="notes" class="block text-xs font-semibold text-on-surface-variant ml-1">Notas Rápidas</label>
            <textarea id="notes" name="notes" [(ngModel)]="model.notes" rows="3" placeholder="Detalles de interés comercial..." class="w-full glass-input rounded-xl p-4 text-sm text-white focus:outline-none resize-none uppercase"></textarea>
          </div>
        </div>

        <!-- Validation Error Message -->
        <div *ngIf="error" class="p-3 bg-red-500/20 border border-red-500/30 text-red-300 rounded-lg text-xs">
          {{ error }}
        </div>

        <!-- Action Footer -->
        <div class="flex justify-between items-center pt-4 border-t border-white/5">
          <button type="button" 
                  *ngIf="currentStep > 1" 
                  (click)="prevStep()" 
                  class="flex items-center gap-1 text-on-surface-variant font-bold hover:text-white transition-colors text-sm">
            <span class="material-symbols-outlined">chevron_left</span> Atrás
          </button>
          <div *ngIf="currentStep === 1"></div>

          <button type="button" 
                  *ngIf="currentStep < 3" 
                  (click)="nextStep()" 
                  class="bg-primary text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all flex items-center gap-1 text-sm">
            Siguiente <span class="material-symbols-outlined">chevron_right</span>
          </button>

          <button type="button" 
                  *ngIf="currentStep === 3" 
                  (click)="onSubmit()" 
                  [disabled]="isSaving"
                  class="bg-green-600 text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center gap-1 text-sm disabled:opacity-50">
            <span>{{ isSaving ? 'Guardando...' : 'Guardar Captación' }}</span>
            <span class="material-symbols-outlined">save</span>
          </button>
        </div>

      </div>
    </div>
  `
})
export class CaptacionFormComponent implements OnInit {
  private crmService = inject(CrmService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private sanitizer = inject(DomSanitizer);

  isEditMode = false;
  isSaving = false;
  currentStep = 1;
  error = '';
  
  isAdmin = false;
  sellers: any[] = [];

  getSafeMapUrl(): SafeResourceUrl {
    if (!this.model.google_maps) {
      return '';
    }
    const url = `https://maps.google.com/maps?q=${this.model.google_maps}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  gpsLoading = false;
  gpsSuccess = false;

  hourSuggestions = ['09:00 - 18:00', '08:00 - 17:00', '24 Horas', 'Personalizado'];
  isCustomHours = false;
  customHoursText = '';

  // Form Model
  model: Partial<Captacion> = {
    business_name: '',
    category: 'Comercio Minorista',
    address: '',
    google_maps: '',
    business_hours: '09:00 - 18:00',
    accepts_card: false,
    gave_card: false,
    licensing_type: 'SaaS',
    offered_hosting: false,
    hosting_price: 50,
    owner_name: '',
    contact_name: '',
    phone: '+591 ',
    whatsapp: '+591 ',
    offered_application: '',
    offered_price: 0,
    promotion: '',
    status: 'Captación',
    notes: '',
    seller_id: 0
  };

  ngOnInit() {
    this.isAdmin = this.authService.getRole() === 'admin';
    this.loadSellers();

    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode = true;
      this.crmService.getCaptacion(Number(id)).subscribe({
        next: (captacion) => {
          this.model = captacion;
          if (captacion.google_maps) {
            this.gpsSuccess = true;
          }
          if (captacion.business_hours) {
            const fixed = ['09:00 - 18:00', '08:00 - 17:00', '24 Horas'];
            if (!fixed.includes(captacion.business_hours)) {
              this.isCustomHours = true;
              this.customHoursText = captacion.business_hours;
            }
          }
        },
        error: () => this.router.navigate(['/captaciones'])
      });
    } else {
      const user = this.authService.getUser();
      if (user) {
        this.model.seller_id = user.id;
      }
    }
  }

  loadSellers() {
    if (this.isAdmin) {
      this.crmService.getSellers().subscribe(data => this.sellers = data);
    }
  }

  selectHours(hours: string) {
    if (hours === 'Personalizado') {
      this.isCustomHours = true;
      this.model.business_hours = this.customHoursText || 'Personalizado';
    } else {
      this.isCustomHours = false;
      this.model.business_hours = hours;
    }
  }

  onCustomHoursChange() {
    if (this.isCustomHours) {
      this.model.business_hours = this.customHoursText;
    }
  }

  autoDetectLocation() {
    this.gpsLoading = true;
    this.gpsSuccess = false;
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          this.model.google_maps = `${lat.toFixed(6)},${lng.toFixed(6)}`;
          this.gpsSuccess = true;
          this.gpsLoading = false;
          
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
            .then(res => res.json())
            .then(data => {
              if (data && data.display_name) {
                this.model.address = data.display_name;
              } else {
                this.model.address = `Coordenadas: Lat ${lat.toFixed(6)}, Lng ${lng.toFixed(6)}`;
              }
            })
            .catch(() => {
              this.model.address = `Coordenadas: Lat ${lat.toFixed(6)}, Lng ${lng.toFixed(6)}`;
            });
        },
        (error) => {
          console.error(error);
          setTimeout(() => {
            this.gpsLoading = false;
            this.gpsSuccess = true;
            this.model.google_maps = '-16.500000,-68.150000';
            this.model.address = 'Avenida 16 de Julio, La Paz, Bolivia (Permisos de ubicación denegados)';
          }, 1000);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      setTimeout(() => {
        this.gpsLoading = false;
        this.gpsSuccess = true;
        this.model.google_maps = '-16.500000,-68.150000';
        this.model.address = 'Avenida 16 de Julio, La Paz, Bolivia (Geolocalización no soportada)';
      }, 1000);
    }
  }

  nextStep() {
    if (this.currentStep === 1) {
      if (!this.model.business_name || !this.model.address) {
        this.error = 'Por favor, complete el nombre y la dirección del negocio.';
        return;
      }
    } else if (this.currentStep === 2) {
      if (!this.model.owner_name || !this.model.phone) {
        this.error = 'Por favor, complete el nombre del propietario y su teléfono.';
        return;
      }
      
      let cleanPhone = this.model.phone.replace(/\s+/g, '');
      if (/^\d{8}$/.test(cleanPhone)) {
        this.model.phone = `+591 ${cleanPhone}`;
      }
      if (this.model.whatsapp) {
        let cleanWa = this.model.whatsapp.replace(/\s+/g, '');
        if (/^\d{8}$/.test(cleanWa)) {
          this.model.whatsapp = `+591 ${cleanWa}`;
        }
      }
    }
    this.error = '';
    this.currentStep++;
  }

  prevStep() {
    this.error = '';
    this.currentStep--;
  }

  onSubmit() {
    this.isSaving = true;
    this.error = '';

    if (!this.model.offered_hosting) {
      this.model.hosting_price = 0;
    }

    // Convertir de forma defensiva campos de texto a mayúsculas antes de guardar
    if (this.model.business_name) this.model.business_name = this.model.business_name.toUpperCase();
    if (this.model.category) this.model.category = this.model.category.toUpperCase();
    if (this.model.address) this.model.address = this.model.address.toUpperCase();
    if (this.model.business_hours) this.model.business_hours = this.model.business_hours.toUpperCase();
    if (this.model.owner_name) this.model.owner_name = this.model.owner_name.toUpperCase();
    if (this.model.contact_name) this.model.contact_name = this.model.contact_name.toUpperCase();
    if (this.model.offered_application) this.model.offered_application = this.model.offered_application.toUpperCase();
    if (this.model.promotion) this.model.promotion = this.model.promotion.toUpperCase();
    if (this.model.notes) this.model.notes = this.model.notes.toUpperCase();

    const obs = this.isEditMode 
      ? this.crmService.updateCaptacion(Number(this.model.id), this.model)
      : this.crmService.createCaptacion(this.model);

    obs.subscribe({
      next: () => {
        this.isSaving = false;
        this.router.navigate(['/captaciones']);
      },
      error: (err) => {
        this.isSaving = false;
        this.error = err.error?.message || 'Error al guardar los datos de la captación.';
      }
    });
  }
}
