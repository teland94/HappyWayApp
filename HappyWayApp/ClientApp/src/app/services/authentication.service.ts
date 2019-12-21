import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { UserModel } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  private baseUrl = 'api/user';

  private currentUserSubject: BehaviorSubject<UserModel>;
  public currentUser: Observable<UserModel>;

  constructor(private http: HttpClient) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.currentUserSubject = new BehaviorSubject<UserModel>(currentUser);
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue() {
    return this.currentUserSubject.value;
  }

  login(username: string, password: string) {
    return this.http.post<any>(`${this.baseUrl}/authenticate`, { username, password })
      .pipe(map(user => {
        // login successful if there's a jwt token in the response
        if (user && user.token) {
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
        }

        return user;
      }));
  }

  logout() {
    // remove user from local storage to log user out
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }
}
