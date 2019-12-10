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

  private eventChangesSource$ = new BehaviorSubject(null);
  eventChange = this.eventChangesSource$.asObservable();

  events: EventModel[];

  constructor(private httpClient: HttpClient) {
    // this.setEvent(new Date());
  }

  setEvent(date: Date) {
    this.get().subscribe(data => {
      this.events = data;
      const event = this.events.find(e => new Date(e.date).getTime() === date.getTime());
      if (event) {
        this.eventChangesSource$.next(event);
      }
    });
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
