import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { User, LoginResponse } from '../../shared/interfaces/crm.interface';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadSession();
  }

  private loadSession() {
    const token = localStorage.getItem('crm_token');
    const userJson = localStorage.getItem('crm_user');
    
    if (token && userJson) {
      try {
        const user = JSON.parse(userJson) as User;
        this.currentUserSubject.next(user);
      } catch (e) {
        this.clearSession();
      }
    }
  }

  public login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { username, password }).pipe(
      tap(res => {
        localStorage.setItem('crm_token', res.access_token);
        localStorage.setItem('crm_user', JSON.stringify(res.user));
        this.currentUserSubject.next(res.user);
      })
    );
  }

  public logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}).pipe(
      tap(() => {
        this.clearSession();
      })
    );
  }

  public registerUser(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/register-user`, formData);
  }

  public getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users`);
  }

  public updateUser(id: number, formData: FormData): Observable<any> {
    // Laravel method spoofing to allow file uploads with PUT behavior
    formData.append('_method', 'PUT');
    return this.http.post<any>(`${this.apiUrl}/users/${id}`, formData);
  }

  public deleteUser(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/users/${id}`);
  }

  public changePassword(currentPassword: string, newPassword: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/profile/change-password`, {
      current_password: currentPassword,
      new_password: newPassword
    });
  }

  public clearSession() {
    localStorage.removeItem('crm_token');
    localStorage.removeItem('crm_user');
    this.currentUserSubject.next(null);
  }

  public isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }

  public getRole(): 'admin' | 'seller' | null {
    const user = this.currentUserSubject.value;
    return user ? user.role : null;
  }

  public getUser(): User | null {
    return this.currentUserSubject.value;
  }

  public updateCurrentUser(user: User) {
    localStorage.setItem('crm_user', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }
}
