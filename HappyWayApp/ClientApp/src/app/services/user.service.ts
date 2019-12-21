import { Injectable } from '@angular/core';
import { UserModel } from '../models/user.model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private baseUrl = 'api/user';

  constructor(private httpClient: HttpClient) { }

  getAll() {
    return this.httpClient.get<UserModel[]>(`${this.baseUrl}`);
  }

  getById(id: number) {
    return this.httpClient.get<UserModel>(`${this.baseUrl}/${id}`);
  }

  update(user: UserModel) {
    return this.httpClient.put(this.baseUrl + '/' + user.id, user);
  }

  delete(id: number) {
    return this.httpClient.delete(this.baseUrl + '/' + id);
  }
}
