import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Captacion, Visit, Followup, Sale, Commission, Suggestion } from '../../shared/interfaces/crm.interface';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CrmService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // 1. Dashboard
  getDashboardStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/dashboard`);
  }

  // 2. Captaciones
  getCaptaciones(
    page: number = 1,
    search: string = '',
    status: string = '',
    category: string = '',
    sellerId: string = '',
    sortBy: string = 'created_at',
    sortOrder: string = 'desc'
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('sort_by', sortBy)
      .set('sort_order', sortOrder);

    if (search) params = params.set('search', search);
    if (status && status !== 'Todos los Estados') params = params.set('status', status);
    if (category && category !== 'Seleccionar...') params = params.set('category', category);
    if (sellerId && sellerId !== 'Vendedor Asignado') params = params.set('seller_id', sellerId);

    return this.http.get<any>(`${this.apiUrl}/captaciones`, { params });
  }

  getCaptacion(id: number): Observable<Captacion> {
    return this.http.get<Captacion>(`${this.apiUrl}/captaciones/${id}`);
  }

  createCaptacion(captacion: Partial<Captacion>): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/captaciones`, captacion);
  }

  quickCreateCaptacion(captacion: {
    business_name: string;
    owner_name: string;
    phone: string;
    status: string;
    notes?: string;
    address?: string;
    google_maps?: string;
  }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/captaciones/quick`, captacion);
  }

  updateCaptacion(id: number, captacion: Partial<Captacion>): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/captaciones/${id}`, captacion);
  }

  deleteCaptacion(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/captaciones/${id}`);
  }

  // 3. Visitas
  getVisits(captacionId?: number): Observable<Visit[]> {
    let params = new HttpParams();
    if (captacionId) params = params.set('captacion_id', captacionId.toString());
    return this.http.get<Visit[]>(`${this.apiUrl}/visits`, { params });
  }

  createVisit(visit: {
    captacion_id: number;
    visit_date: string;
    result: string;
    notes?: string;
  }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/visits`, visit);
  }

  deleteVisit(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/visits/${id}`);
  }

  // 4. Seguimientos
  getFollowups(captacionId?: number): Observable<Followup[]> {
    let params = new HttpParams();
    if (captacionId) params = params.set('captacion_id', captacionId.toString());
    return this.http.get<Followup[]>(`${this.apiUrl}/followups`, { params });
  }

  createFollowup(followup: {
    captacion_id: number;
    date: string;
    notes: string;
    next_contact?: string;
    result?: string;
    status?: string;
  }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/followups`, followup);
  }

  updateFollowup(id: number, followup: Partial<Followup>): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/followups/${id}`, followup);
  }

  deleteFollowup(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/followups/${id}`);
  }

  // 5. Ventas
  getSales(system?: string, startDate?: string, endDate?: string): Observable<Sale[]> {
    let params = new HttpParams();
    if (system && system !== 'Todos los Sistemas') params = params.set('system', system);
    if (startDate) params = params.set('start_date', startDate);
    if (endDate) params = params.set('end_date', endDate);

    return this.http.get<Sale[]>(`${this.apiUrl}/sales`, { params });
  }

  createSale(sale: {
    captacion_id: number;
    sold_system: string;
    price: number;
    discount: number;
    sale_date: string;
  }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/sales`, sale);
  }

  deleteSale(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/sales/${id}`);
  }

  // 6. Comisiones
  getCommissions(): Observable<Commission[]> {
    return this.http.get<Commission[]>(`${this.apiUrl}/commissions`);
  }

  getCommissionStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/commissions/stats`);
  }

  // 7. Sugerencias
  getSuggestions(captacionId: number): Observable<Suggestion[]> {
    const params = new HttpParams().set('captacion_id', captacionId.toString());
    return this.http.get<Suggestion[]>(`${this.apiUrl}/suggestions`, { params });
  }

  createSuggestion(suggestion: {
    captacion_id: number;
    description: string;
  }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/suggestions`, suggestion);
  }

  deleteSuggestion(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/suggestions/${id}`);
  }

  // 8. Vendedores (Para filtros)
  getSellers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/sellers`);
  }
}
