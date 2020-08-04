import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { Sex, EventMemberModel } from '../models/event-member';

@Injectable({
  providedIn: 'root'
})
export class EventMemberService {

  private readonly baseUrl = 'api/EventMember';

  private sexChangesSource$ = new BehaviorSubject(Sex.Male);
  sexChanges = this.sexChangesSource$.asObservable();

  constructor(private httpClient: HttpClient) { }

  get(eventId: number) {
    const params = new HttpParams().set('eventId', eventId.toString());
    return this.httpClient.get<EventMemberModel[]>(this.baseUrl, { params });
  }

  create(eventMember: EventMemberModel) {
    return this.httpClient.post<EventMemberModel>(this.baseUrl, eventMember);
  }

  update(eventMember: EventMemberModel) {
    return this.httpClient.put(this.baseUrl + '/' + eventMember.id, eventMember);
  }

  delete(id: number) {
    return this.httpClient.delete(this.baseUrl + '/' + id);
  }

  sexChange(sex: Sex) {
    this.sexChangesSource$.next(sex);
  }
}
