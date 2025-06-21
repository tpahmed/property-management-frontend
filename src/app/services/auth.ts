import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api';
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  constructor(private http: HttpClient) {
    const storedUser = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(email: string, password: string): Observable<User> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, { email, password })
      .pipe(
        map(response => {
          // Store user details and token in local storage
          const user = response.user;
          user.token = response.token;
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
          return user;
        })
      );
  }

  register(user: RegisterRequest): Observable<User> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, user)
      .pipe(
        map(response => {
          // Store user details and token in local storage
          const newUser = response.user;
          newUser.token = response.token;
          localStorage.setItem('currentUser', JSON.stringify(newUser));
          this.currentUserSubject.next(newUser);
          return newUser;
        })
      );
  }

  logout(): void {
    // Remove user from local storage and set current user to null
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    return !!this.currentUserValue;
  }

  hasRole(role: string): boolean {
    return this.currentUserValue?.role === role;
  }

  getUserById(userId: string): Observable<User> {
    return this.http.get<{ user: User }>(`${this.apiUrl}/users/${userId}`)
      .pipe(
        map(response => response.user),
        catchError(error => {
          console.error('Error fetching user:', error);
          return of({} as User);
        })
      );
  }

  getUserByEmail(email: string): Observable<User> {
    return this.http.get<{ user: User }>(`${this.apiUrl}/users/email/${email}`)
      .pipe(
        map(response => response.user),
        catchError(error => {
          console.error('Error fetching user by email:', error);
          return of({} as User);
        })
      );
  }

  searchManagers(query: string): Observable<User[]> {
    return this.http.get<{ users: User[] }>(`${this.apiUrl}/users/search?role=property_manager&query=${query}`)
      .pipe(
        map(response => response.users),
        catchError(error => {
          console.error('Error searching managers:', error);
          return of([]);
        })
      );
  }

  verifyToken(token: string): Observable<{ valid: boolean; userId: string; role: string }> {
    return this.http.post<{ valid: boolean; userId: string; role: string }>(
      `${this.apiUrl}/verify-token`,
      { token }
    );
  }

  get token(): string | null {
    return this.currentUserValue?.token || null;
  }
}
