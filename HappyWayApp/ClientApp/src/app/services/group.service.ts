import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { GroupModel } from '../models/group.model';

@Injectable({
  providedIn: 'root'
})
export class GroupService {

  private readonly baseUrl = 'api/Group';

  constructor(private httpClient: HttpClient) { }

  get() {
    return this.httpClient.get<GroupModel[]>(this.baseUrl);
  }

  getById(id: number) {
    return this.httpClient.get<GroupModel>(`${this.baseUrl}/${id}`);
  }

  create(group: GroupModel) {
    return this.httpClient.post(this.baseUrl, group);
  }

  update(group: GroupModel) {
    return this.httpClient.put(this.baseUrl + '/' + group.id, group);
  }

  delete(id: number) {
    return this.httpClient.delete(this.baseUrl + '/' + id);
  }
}
