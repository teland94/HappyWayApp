import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EventPlaceModel } from '../models/event-place.model';

@Injectable({
  providedIn: 'root'
})
export class EventPlaceService {

  private readonly baseUrl = 'api/EventPlace';

  constructor(private httpClient: HttpClient) { }

  get() {
    return this.httpClient.get<EventPlaceModel[]>(this.baseUrl);
  }

  getById(id: number) {
    return this.httpClient.get<EventPlaceModel>(`${this.baseUrl}/${id}`);
  }

  create(eventMember: EventPlaceModel) {
    return this.httpClient.post<EventPlaceModel>(this.baseUrl, eventMember);
  }

  update(eventMember: EventPlaceModel) {
    return this.httpClient.put(this.baseUrl + '/' + eventMember.id, eventMember);
  }

  delete(id: number) {
    return this.httpClient.delete(this.baseUrl + '/' + id);
  }
}
