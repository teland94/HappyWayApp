import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EventModel } from '../models/event.model';
import { BehaviorSubject, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { getDateWithTimeZoneOffset } from '../utilities';

const CurrentEventIdKey = 'currentEventId';

@Injectable({
  providedIn: 'root'
})
export class EventService {

  private baseUrl = 'api/event';

  private eventChanges$ = new BehaviorSubject<EventModel>(null);
  eventChanges = this.eventChanges$.asObservable();

  constructor(private httpClient: HttpClient) {
  }

  get() {
    return this.httpClient.get<EventModel[]>(this.baseUrl)
      .pipe(map(events => {
        events.forEach(e => e.date = new Date(e.date));
        return events;
      }));
  }

  getEventFromStorage() {
    const eventId = localStorage.getItem(CurrentEventIdKey);
    return eventId ? this.getById(+eventId) : of(null);
  }

  getLastEvent() {
    return this.httpClient.get<EventModel>(this.baseUrl + '/GetLastEvent')
      .pipe(map(e => {
        e.date = new Date(e.date);
        return e;
      }));
  }

  getById(id: number) {
    return this.httpClient.get<EventModel>(this.baseUrl + '/' + id)
      .pipe(map(e => {
        e.date = new Date(e.date);
        return e;
      }));
  }

  create(event: EventModel) {
    event.date = getDateWithTimeZoneOffset(event.date);
    return this.httpClient.post<EventModel>(this.baseUrl, event)
      .pipe(map(e => {
        e.date = new Date(e.date);
        return e;
      }));
  }

  update(event: EventModel) {
    event.date = getDateWithTimeZoneOffset(event.date);
    return this.httpClient.put(this.baseUrl + '/' + event.id, event);
  }

  setCompleted(id: number, completed: boolean) {
    return this.httpClient.patch(this.baseUrl + '/SetCompleted/' + id, { completed });
  }

  delete(id: number) {
    return this.httpClient.delete(this.baseUrl + '/' + id);
  }

  setCurrentEvent(event: EventModel) {
    this.eventChanges$.next(event);
    if (event) {
      localStorage.setItem(CurrentEventIdKey, event.id.toString());
    } else {
      localStorage.removeItem(CurrentEventIdKey);
    }
  }
}
