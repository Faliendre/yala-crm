import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-8">
      <!-- Header -->
      <div>
        <h2 class="font-bold text-3xl text-on-surface tracking-tight">Mi Perfil</h2>
        <p class="text-on-surface-variant text-base">Detalles del usuario y herramientas administrativas.</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Col 1: Profile info & Change Password -->
        <div class="space-y-6">
          <!-- Profile info card -->
          <div class="glass-card rounded-[24px] p-6 flex flex-col items-center text-center space-y-4">
            <div class="w-24 h-24 rounded-2xl overflow-hidden border-2 border-primary/30 relative bg-white/5 flex items-center justify-center">
              <img [src]="avatar || 'https://ui-avatars.com/api/?name=' + username + '&background=6366f1&color=fff&size=128'" alt="Avatar" class="w-full h-full object-cover" />
            </div>
            <div>
              <h3 class="font-bold text-xl text-white">{{ username }}</h3>
              <p class="text-xs text-primary uppercase tracking-widest font-bold mt-1">{{ roleName }}</p>
            </div>
            <div class="w-full border-t border-white/5 pt-4 text-left space-y-3">
              <div class="flex justify-between text-sm">
                <span class="text-outline">ID de Agente:</span>
                <span class="text-white font-mono">#00{{ userId }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-outline">Estado:</span>
                <span class="text-green-400 font-semibold flex items-center gap-1">
                  <span class="w-2 h-2 rounded-full bg-green-400"></span> Conectado
                </span>
              </div>
            </div>
            <button (click)="onLogout()" class="w-full py-3 bg-red-500/20 text-red-300 rounded-xl hover:bg-red-500/30 transition-all font-semibold mt-4">
              Cerrar Sesión
            </button>
          </div>

          <!-- Change own password card -->
          <div class="glass-card rounded-[24px] p-6 space-y-4">
            <div>
              <h3 class="font-bold text-base text-white">Cambiar Mi Contraseña</h3>
              <p class="text-xs text-on-surface-variant">Mantén tu cuenta segura.</p>
            </div>

            <div *ngIf="pwdSuccessMessage" class="p-3 bg-green-500/20 border border-green-500/30 text-green-300 rounded-lg text-[11px]">
              {{ pwdSuccessMessage }}
            </div>
            <div *ngIf="pwdErrorMessage" class="p-3 bg-red-500/20 border border-red-500/30 text-red-300 rounded-lg text-[11px]">
              {{ pwdErrorMessage }}
            </div>

            <form (submit)="onChangePassword()" class="space-y-3">
              <div class="space-y-1">
                <label class="block text-[10px] font-semibold text-on-surface-variant ml-1" for="curr-pwd">Contraseña Actual</label>
                <input 
                  [(ngModel)]="currentPassword" 
                  name="currentPassword"
                  type="password" 
                  id="curr-pwd" 
                  class="w-full glass-input rounded-lg py-2 px-3 text-xs text-white focus:outline-none"
                  required 
                />
              </div>

              <div class="space-y-1">
                <label class="block text-[10px] font-semibold text-on-surface-variant ml-1" for="new-pwd">Nueva Contraseña</label>
                <input 
                  [(ngModel)]="newOwnPassword" 
                  name="newOwnPassword"
                  type="password" 
                  id="new-pwd" 
                  placeholder="Mínimo 6 caracteres"
                  class="w-full glass-input rounded-lg py-2 px-3 text-xs text-white placeholder:text-outline/30 focus:outline-none"
                  required 
                />
              </div>

              <button 
                type="submit" 
                [disabled]="isChangingPwd"
                class="w-full py-2.5 bg-primary text-white rounded-lg font-bold text-xs shadow-md hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <span>{{ isChangingPwd ? 'Actualizando...' : 'Actualizar Contraseña' }}</span>
              </button>
            </form>
          </div>
        </div>

        <!-- Col 2-3: Admin Panels / Seller Tips -->
        <div class="lg:col-span-2 space-y-6">
          
          <!-- ADMIN PANELS -->
          <div *ngIf="isAdmin" class="space-y-6">
            <!-- Tabs Menu -->
            <div class="flex border-b border-outline-variant/30">
              <button 
                (click)="activeTab = 'list'"
                class="px-5 py-3 font-semibold text-sm border-b-2 transition-all"
                [class.border-primary]="activeTab === 'list'"
                [class.text-primary]="activeTab === 'list'"
                [class.border-transparent]="activeTab !== 'list'"
                [class.text-on-surface-variant]="activeTab !== 'list'"
              >
                Lista de Usuarios
              </button>
              <button 
                (click)="activeTab = 'register'"
                class="px-5 py-3 font-semibold text-sm border-b-2 transition-all"
                [class.border-primary]="activeTab === 'register'"
                [class.text-primary]="activeTab === 'register'"
                [class.border-transparent]="activeTab !== 'register'"
                [class.text-on-surface-variant]="activeTab !== 'register'"
              >
                Registrar Nuevo Usuario
              </button>
            </div>

            <!-- Tab content: LIST -->
            <div *ngIf="activeTab === 'list'" class="glass-card rounded-[24px] p-6 space-y-6 overflow-hidden">
              <div class="flex justify-between items-center">
                <div>
                  <h3 class="font-bold text-lg text-white">Vendedores y Usuarios</h3>
                  <p class="text-sm text-on-surface-variant">Listado completo de cuentas del sistema CRM.</p>
                </div>
                <button (click)="loadUsersList()" class="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 active:scale-95 transition-all text-on-surface flex items-center justify-center" title="Recargar lista">
                  <span class="material-symbols-outlined text-[18px]">refresh</span>
                </button>
              </div>

              <div *ngIf="listSuccessMessage" class="p-3 bg-green-500/20 border border-green-500/30 text-green-300 rounded-lg text-sm">
                {{ listSuccessMessage }}
              </div>
              <div *ngIf="listErrorMessage" class="p-3 bg-red-500/20 border border-red-500/30 text-red-300 rounded-lg text-sm">
                {{ listErrorMessage }}
              </div>

              <!-- Loading spinner -->
              <div *ngIf="isLoadingList" class="flex justify-center items-center py-12">
                <span class="material-symbols-outlined animate-spin text-[32px] text-primary">sync</span>
              </div>

              <!-- Table -->
              <div *ngIf="!isLoadingList" class="overflow-x-auto custom-scrollbar">
                <table class="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr class="border-b border-white/10 text-outline text-xs uppercase tracking-wider font-mono">
                      <th class="py-3 px-4 font-normal">Usuario</th>
                      <th class="py-3 px-4 font-normal">Rol de Acceso</th>
                      <th class="py-3 px-4 font-normal">Estado</th>
                      <th class="py-3 px-4 font-normal">Fecha de Registro</th>
                      <th class="py-3 px-4 font-normal text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-white/5">
                    <tr *ngFor="let u of usersList" class="hover:bg-white/[0.01] transition-colors">
                      <td class="py-3.5 px-4 font-bold text-white flex items-center gap-3">
                        <div class="w-8 h-8 rounded-lg overflow-hidden border border-white/10 flex-shrink-0 bg-white/5 flex items-center justify-center">
                          <img [src]="u.avatar || 'https://ui-avatars.com/api/?name=' + u.username + '&background=random&size=64'" alt="Avatar" class="w-full h-full object-cover" />
                        </div>
                        <div class="flex flex-col">
                          <span class="flex items-center gap-1.5">
                            <span class="w-1.5 h-1.5 rounded-full" [class.bg-primary]="u.role === 'admin'" [class.bg-secondary]="u.role === 'seller'"></span>
                            {{ u.username }}
                          </span>
                        </div>
                      </td>
                      <td class="py-3.5 px-4">
                        <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase border"
                              [class.bg-primary/10]="u.role === 'admin'"
                              [class.text-primary]="u.role === 'admin'"
                              [class.border-primary/20]="u.role === 'admin'"
                              [class.bg-green-500/10]="u.role === 'seller'"
                              [class.text-green-400]="u.role === 'seller'"
                              [class.border-green-500/20]="u.role === 'seller'">
                          {{ u.role === 'admin' ? 'Admin' : 'Vendedor' }}
                        </span>
                      </td>
                      <td class="py-3.5 px-4">
                        <span class="flex items-center gap-1.5 text-xs">
                          <span class="w-2 h-2 rounded-full" 
                                [class.bg-green-400]="u.is_online" 
                                [class.animate-pulse]="u.is_online"
                                [class.bg-outline/50]="!u.is_online"></span>
                          <span [class.text-green-400]="u.is_online" [class.text-outline]="!u.is_online" class="font-semibold">
                            {{ u.is_online ? 'En línea' : (u.last_seen ? 'Últ. vez: ' + formatRelativeTime(u.last_seen) : 'Desconectado') }}
                          </span>
                        </span>
                      </td>
                      <td class="py-3.5 px-4 text-xs text-on-surface-variant font-mono">
                        {{ formatDate(u.created_at) }}
                      </td>
                      <td class="py-3.5 px-4 text-right">
                        <div class="flex items-center justify-end gap-2">
                          <button (click)="startEditUser(u)" class="w-8 h-8 rounded-lg border border-outline-variant flex items-center justify-center hover:bg-primary/20 hover:border-primary/50 text-on-surface hover:text-white transition-all" title="Editar datos/contraseña">
                            <span class="material-symbols-outlined text-[16px]">edit</span>
                          </button>
                          <button *ngIf="u.id !== userId" (click)="onDeleteUser(u)" class="w-8 h-8 rounded-lg border border-outline-variant flex items-center justify-center hover:bg-red-500/20 hover:border-red-500/50 text-red-400 hover:text-white transition-all" title="Eliminar usuario">
                            <span class="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Tab content: REGISTER -->
            <div *ngIf="activeTab === 'register'" class="glass-card rounded-[24px] p-6 space-y-6">
              <div>
                <h3 class="font-bold text-lg text-white">Registrar Nuevo Usuario</h3>
                <p class="text-sm text-on-surface-variant">Agrega vendedores o administradores al sistema CRM.</p>
              </div>

              <div *ngIf="successMessage" class="p-3 bg-green-500/20 border border-green-500/30 text-green-300 rounded-lg text-sm">
                {{ successMessage }}
              </div>
              <div *ngIf="errorMessage" class="p-3 bg-red-500/20 border border-red-500/30 text-red-300 rounded-lg text-sm">
                {{ errorMessage }}
              </div>

              <form (submit)="onRegisterUser()" class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="space-y-2">
                    <label class="block text-xs font-semibold text-on-surface-variant ml-1" for="new-username">Nombre de Usuario</label>
                    <div class="relative">
                      <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px]">person</span>
                      <input 
                        [(ngModel)]="newUsername" 
                        name="newUsername"
                        type="text" 
                        id="new-username" 
                        placeholder="Ej. alex_rivera" 
                        class="w-full glass-input rounded-xl py-3.5 pl-12 pr-4 text-sm text-white placeholder:text-outline/50 focus:outline-none"
                        required 
                      />
                    </div>
                  </div>

                  <div class="space-y-2">
                    <label class="block text-xs font-semibold text-on-surface-variant ml-1" for="new-password">Contraseña</label>
                    <div class="relative">
                      <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px]">lock</span>
                      <input 
                        [(ngModel)]="newPassword" 
                        name="newPassword"
                        type="password" 
                        id="new-password" 
                        placeholder="Mínimo 6 caracteres" 
                        class="w-full glass-input rounded-xl py-3.5 pl-12 pr-4 text-sm text-white placeholder:text-outline/50 focus:outline-none"
                        required 
                      />
                    </div>
                  </div>
                  <!-- Foto de Perfil -->
                  <div class="space-y-2 col-span-1 md:col-span-2">
                    <label class="block text-xs font-semibold text-on-surface-variant ml-1">Foto de Perfil (Opcional)</label>
                    <div class="flex items-center gap-4">
                      <div class="w-14 h-14 rounded-xl border border-white/10 overflow-hidden flex-shrink-0 bg-white/5 flex items-center justify-center">
                        <img *ngIf="newAvatarPreview" [src]="newAvatarPreview" class="w-full h-full object-cover" />
                        <span *ngIf="!newAvatarPreview" class="material-symbols-outlined text-outline text-[20px]">image</span>
                      </div>
                      <label class="px-4 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl cursor-pointer text-xs font-bold text-on-surface transition-all">
                        <span>Seleccionar Foto</span>
                        <input type="file" (change)="onNewAvatarSelected($event)" accept="image/*" class="hidden" />
                      </label>
                      <button type="button" *ngIf="newAvatarPreview" (click)="clearNewAvatar()" class="text-xs font-semibold text-red-400 hover:text-red-300">Quitar</button>
                    </div>
                  </div>
                </div>

                <div class="space-y-2">
                  <label class="block text-xs font-semibold text-on-surface-variant ml-1">Rol de Acceso</label>
                  <div class="grid grid-cols-2 gap-4">
                    <label class="flex items-center justify-between p-4 glass-input rounded-xl cursor-pointer hover:bg-white/5" [class.border-primary]="newRole === 'seller'">
                      <div class="flex flex-col">
                        <span class="font-semibold text-sm text-on-surface">Vendedor</span>
                        <span class="text-[10px] text-on-surface-variant uppercase tracking-wider">Acceso Limitado</span>
                      </div>
                      <input type="radio" name="newRole" value="seller" [(ngModel)]="newRole" class="accent-primary" />
                    </label>

                    <label class="flex items-center justify-between p-4 glass-input rounded-xl cursor-pointer hover:bg-white/5" [class.border-primary]="newRole === 'admin'">
                      <div class="flex flex-col">
                        <span class="font-semibold text-sm text-on-surface">Administrador</span>
                        <span class="text-[10px] text-on-surface-variant uppercase tracking-wider">Acceso Total</span>
                      </div>
                      <input type="radio" name="newRole" value="admin" [(ngModel)]="newRole" class="accent-primary" />
                    </label>
                  </div>
                </div>

                <button 
                  type="submit" 
                  [disabled]="isRegistering"
                  class="w-full py-4 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <span>{{ isRegistering ? 'Registrando...' : 'Registrar Vendedor' }}</span>
                  <span class="material-symbols-outlined">person_add</span>
                </button>
              </form>
            </div>
          </div>

          <!-- EDIT USER PANEL (IN-LINE CARD) -->
          <div *ngIf="editingUser" class="glass-card rounded-[24px] p-6 space-y-6 border border-primary/30 shadow-2xl relative">
            <div class="flex justify-between items-center pb-3 border-b border-white/5">
              <div>
                <h3 class="font-bold text-lg text-white">Editar Usuario: {{ editingUser.username }}</h3>
                <p class="text-xs text-on-surface-variant">Modifica su cuenta o actualiza su contraseña de acceso.</p>
              </div>
              <button (click)="cancelEditUser()" class="material-symbols-outlined hover:bg-white/10 p-1.5 rounded-full text-on-surface transition-all">close</button>
            </div>

            <div *ngIf="editSuccessMessage" class="p-3 bg-green-500/20 border border-green-500/30 text-green-300 rounded-lg text-sm">
              {{ editSuccessMessage }}
            </div>
            <div *ngIf="editErrorMessage" class="p-3 bg-red-500/20 border border-red-500/30 text-red-300 rounded-lg text-sm">
              {{ editErrorMessage }}
            </div>

            <form (submit)="onUpdateUser()" class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-2">
                  <label class="block text-xs font-semibold text-on-surface-variant ml-1" for="edit-username">Nombre de Usuario</label>
                  <input 
                    [(ngModel)]="editUsername" 
                    name="editUsername"
                    type="text" 
                    id="edit-username" 
                    class="w-full h-12 glass-input rounded-xl px-4 text-sm text-white focus:outline-none"
                    required 
                  />
                </div>

                <div class="space-y-2">
                  <label class="block text-xs font-semibold text-on-surface-variant ml-1" for="edit-password">Nueva Contraseña (Dejar vacío para no cambiar)</label>
                  <input 
                    [(ngModel)]="editPassword" 
                    name="editPassword"
                    type="password" 
                    id="edit-password" 
                    placeholder="Escribe la nueva contraseña si la olvidó..."
                    class="w-full h-12 glass-input rounded-xl px-4 text-sm text-white placeholder:text-outline/30 focus:outline-none"
                  />
                </div>
                <!-- Foto de Perfil -->
                <div class="space-y-2 col-span-1 md:col-span-2">
                  <label class="block text-xs font-semibold text-on-surface-variant ml-1">Foto de Perfil (Opcional)</label>
                  <div class="flex items-center gap-4">
                    <div class="w-14 h-14 rounded-xl border border-white/10 overflow-hidden flex-shrink-0 bg-white/5 flex items-center justify-center">
                      <img *ngIf="editAvatarPreview || editingUser?.avatar" [src]="editAvatarPreview || editingUser?.avatar" class="w-full h-full object-cover" />
                      <span *ngIf="!editAvatarPreview && !editingUser?.avatar" class="material-symbols-outlined text-outline text-[20px]">image</span>
                    </div>
                    <label class="px-4 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl cursor-pointer text-xs font-bold text-on-surface transition-all">
                      <span>Subir Nueva Foto</span>
                      <input type="file" (change)="onEditAvatarSelected($event)" accept="image/*" class="hidden" />
                    </label>
                    <button type="button" *ngIf="editAvatarPreview" (click)="clearEditAvatar()" class="text-xs font-semibold text-red-400 hover:text-red-300">Quitar selección</button>
                  </div>
                </div>
              </div>

              <!-- Only allow role changes if we are not editing ourselves -->
              <div class="space-y-2" *ngIf="editingUser.id !== userId">
                <label class="block text-xs font-semibold text-on-surface-variant ml-1">Rol de Acceso</label>
                <div class="grid grid-cols-2 gap-4">
                  <label class="flex items-center justify-between p-4 glass-input rounded-xl cursor-pointer hover:bg-white/5" [class.border-primary]="editRole === 'seller'">
                    <div class="flex flex-col">
                      <span class="font-semibold text-sm text-on-surface">Vendedor</span>
                      <span class="text-[10px] text-on-surface-variant uppercase tracking-wider">Acceso Limitado</span>
                    </div>
                    <input type="radio" name="editRole" value="seller" [(ngModel)]="editRole" class="accent-primary" />
                  </label>

                  <label class="flex items-center justify-between p-4 glass-input rounded-xl cursor-pointer hover:bg-white/5" [class.border-primary]="editRole === 'admin'">
                    <div class="flex flex-col">
                      <span class="font-semibold text-sm text-on-surface">Administrador</span>
                      <span class="text-[10px] text-on-surface-variant uppercase tracking-wider">Acceso Total</span>
                    </div>
                    <input type="radio" name="editRole" value="admin" [(ngModel)]="editRole" class="accent-primary" />
                  </label>
                </div>
              </div>

              <div class="flex gap-4 pt-2">
                <button 
                  type="submit" 
                  [disabled]="isUpdatingUser"
                  class="flex-1 h-12 bg-primary text-white font-bold rounded-xl hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <span class="material-symbols-outlined text-sm">save</span>
                  <span>{{ isUpdatingUser ? 'Guardando...' : 'Guardar Cambios' }}</span>
                </button>
                <button 
                  type="button" 
                  (click)="cancelEditUser()"
                  class="h-12 bg-white/5 border border-white/10 text-on-surface-variant hover:text-white px-6 rounded-xl font-bold active:bg-white/10 transition-all text-sm"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>

          <!-- SELLER INSTRUCTIONS -->
          <div *ngIf="!isAdmin" class="glass-card rounded-[24px] p-6 space-y-6">
            <h3 class="font-bold text-lg text-white">Consejos de Venta en Terreno</h3>
            <div class="space-y-4">
              <div class="p-4 bg-white/5 rounded-xl border border-white/5 flex gap-4">
                <span class="material-symbols-outlined text-primary text-2xl flex-shrink-0">my_location</span>
                <div>
                  <h4 class="font-bold text-sm text-white">Detección Inteligente de GPS</h4>
                  <p class="text-xs text-on-surface-variant mt-1">Usa la opción "Auto-detectar" al capturar un negocio para guardar la ubicación exacta al instante y agilizar el registro.</p>
                </div>
              </div>

              <div class="p-4 bg-white/5 rounded-xl border border-white/5 flex gap-4">
                <span class="material-symbols-outlined text-primary text-2xl flex-shrink-0">chat</span>
                <div>
                  <h4 class="font-bold text-sm text-white">Seguimientos directos</h4>
                  <p class="text-xs text-on-surface-variant mt-1">Utiliza los botones rápidos de llamada o WhatsApp desde la sección de seguimientos para contactar a tu prospecto sin salir del sistema.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  userId = 0;
  username = '';
  roleName = '';
  isAdmin = false;
  avatar = '';

  // Tabs management
  activeTab = 'list';

  // Own password change form
  currentPassword = '';
  newOwnPassword = '';
  isChangingPwd = false;
  pwdSuccessMessage = '';
  pwdErrorMessage = '';

  // Register user form
  newUsername = '';
  newPassword = '';
  newRole: 'admin' | 'seller' = 'seller';
  isRegistering = false;
  successMessage = '';
  errorMessage = '';

  // File upload fields
  newAvatarFile: File | null = null;
  newAvatarPreview: string | null = null;
  editAvatarFile: File | null = null;
  editAvatarPreview: string | null = null;

  // Users list
  usersList: any[] = [];
  isLoadingList = false;
  listSuccessMessage = '';
  listErrorMessage = '';

  // Edit user state
  editingUser: any = null;
  editUsername = '';
  editPassword = '';
  editRole: 'admin' | 'seller' = 'seller';
  isUpdatingUser = false;
  editSuccessMessage = '';
  editErrorMessage = '';

  ngOnInit() {
    const user = this.authService.getUser();
    if (user) {
      this.userId = user.id;
      this.username = user.username;
      this.roleName = user.role === 'admin' ? 'Administrador' : 'Vendedor';
      this.isAdmin = user.role === 'admin';
      this.avatar = user.avatar || '';

      if (this.isAdmin) {
        this.loadUsersList();
      }
    }
  }

  onNewAvatarSelected(event: any) {
    const file = event.target.files?.[0];
    if (file) {
      this.newAvatarFile = file;
      const reader = new FileReader();
      reader.onload = (e) => this.newAvatarPreview = e.target?.result as string;
      reader.readAsDataURL(file);
    }
  }

  clearNewAvatar() {
    this.newAvatarFile = null;
    this.newAvatarPreview = null;
  }

  onEditAvatarSelected(event: any) {
    const file = event.target.files?.[0];
    if (file) {
      this.editAvatarFile = file;
      const reader = new FileReader();
      reader.onload = (e) => this.editAvatarPreview = e.target?.result as string;
      reader.readAsDataURL(file);
    }
  }

  clearEditAvatar() {
    this.editAvatarFile = null;
    this.editAvatarPreview = null;
  }

  onChangePassword() {
    if (!this.currentPassword || !this.newOwnPassword) return;

    this.isChangingPwd = true;
    this.pwdSuccessMessage = '';
    this.pwdErrorMessage = '';

    this.authService.changePassword(this.currentPassword, this.newOwnPassword).subscribe({
      next: () => {
        this.isChangingPwd = false;
        this.pwdSuccessMessage = 'Tu contraseña ha sido actualizada con éxito.';
        this.currentPassword = '';
        this.newOwnPassword = '';
      },
      error: (err) => {
        this.isChangingPwd = false;
        this.pwdErrorMessage = err.error?.message || 'La contraseña actual es incorrecta o los datos son inválidos.';
      }
    });
  }

  loadUsersList() {
    if (!this.isAdmin) return;
    this.isLoadingList = true;
    this.listSuccessMessage = '';
    this.listErrorMessage = '';

    this.authService.getUsers().subscribe({
      next: (data) => {
        this.usersList = data;
        this.isLoadingList = false;
      },
      error: () => {
        this.isLoadingList = false;
        this.listErrorMessage = 'Error al cargar el listado de usuarios.';
      }
    });
  }

  onRegisterUser() {
    if (!this.newUsername || !this.newPassword) return;

    this.isRegistering = true;
    this.successMessage = '';
    this.errorMessage = '';

    const formData = new FormData();
    formData.append('username', this.newUsername);
    formData.append('password', this.newPassword);
    formData.append('role', this.newRole);
    if (this.newAvatarFile) {
      formData.append('avatar', this.newAvatarFile);
    }

    this.authService.registerUser(formData).subscribe({
      next: (res) => {
        this.isRegistering = false;
        this.successMessage = `Usuario "${this.newUsername}" creado con rol de ${this.newRole === 'admin' ? 'Administrador' : 'Vendedor'}.`;
        
        // Push the new user to the local list so the table updates in real time
        if (res.user) {
          this.usersList.unshift({
            id: res.user.id,
            username: res.user.username,
            role: res.user.role,
            avatar: res.user.avatar,
            created_at: new Date().toISOString()
          });
        }

        this.newUsername = '';
        this.newPassword = '';
        this.newRole = 'seller';
        this.clearNewAvatar();
      },
      error: (err) => {
        this.isRegistering = false;
        this.errorMessage = err.error?.message || 'Error al registrar el usuario.';
      }
    });
  }

  startEditUser(user: any) {
    this.editingUser = user;
    this.editUsername = user.username;
    this.editRole = user.role;
    this.editPassword = '';
    this.clearEditAvatar();
    this.editSuccessMessage = '';
    this.editErrorMessage = '';

    // Smooth scroll to the edit form
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 100);
  }

  cancelEditUser() {
    this.editingUser = null;
    this.clearEditAvatar();
  }

  onUpdateUser() {
    if (!this.editUsername) return;

    this.isUpdatingUser = true;
    this.editSuccessMessage = '';
    this.editErrorMessage = '';

    const formData = new FormData();
    formData.append('username', this.editUsername);
    if (this.editingUser.id !== this.userId) {
      formData.append('role', this.editRole);
    }
    if (this.editPassword) {
      formData.append('password', this.editPassword);
    }
    if (this.editAvatarFile) {
      formData.append('avatar', this.editAvatarFile);
    }

    this.authService.updateUser(this.editingUser.id, formData).subscribe({
      next: (res) => {
        this.isUpdatingUser = false;
        this.editSuccessMessage = 'Usuario actualizado correctamente.';
        
        // Update user in local list
        const idx = this.usersList.findIndex(u => u.id === this.editingUser.id);
        if (idx !== -1) {
          this.usersList[idx].username = res.user.username;
          this.usersList[idx].role = res.user.role;
          this.usersList[idx].avatar = res.user.avatar;
        }

        // If editing own username, update local view title
        if (this.editingUser.id === this.userId) {
          this.username = res.user.username;
          this.avatar = res.user.avatar || '';
          this.authService.updateCurrentUser(res.user);
        }

        setTimeout(() => {
          this.editingUser = null;
          this.clearEditAvatar();
        }, 1500);
      },
      error: (err) => {
        this.isUpdatingUser = false;
        this.editErrorMessage = err.error?.message || 'Error al actualizar el usuario.';
      }
    });
  }

  onDeleteUser(user: any) {
    if (!confirm(`¿Estás seguro de que deseas eliminar al usuario "${user.username}"?`)) {
      return;
    }

    this.listSuccessMessage = '';
    this.listErrorMessage = '';

    this.authService.deleteUser(user.id).subscribe({
      next: () => {
        this.listSuccessMessage = `Usuario "${user.username}" eliminado con éxito.`;
        this.usersList = this.usersList.filter(u => u.id !== user.id);
      },
      error: (err) => {
        this.listErrorMessage = err.error?.message || 'Error al eliminar el usuario.';
      }
    });
  }

  onLogout() {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => {
        this.authService.clearSession();
        this.router.navigate(['/login']);
      }
    });
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  formatRelativeTime(dateStr: string): string {
    if (!dateStr) return '';
    const formattedStr = dateStr.includes('T') || dateStr.includes('Z')
      ? dateStr
      : dateStr.replace(' ', 'T') + 'Z';
    const date = new Date(formattedStr);
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  }
}
