import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EventModel } from '../models/event.model';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class EventService {

  private baseUrl = 'api/event';

  constructor(private httpClient: HttpClient) {
  }

  get() {
    return this.httpClient.get<EventModel[]>(this.baseUrl);
  }

  create(event: EventModel) {
    return this.httpClient.post(this.baseUrl, event);
  }

  update(event: EventModel) {
    return this.httpClient.put(this.baseUrl + '/' + event.id, event);
  }

  delete(id: number) {
    return this.httpClient.delete(this.baseUrl + '/' + id);
  }
}
