import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
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

  get(eventId?: number) {
    let params = new HttpParams();
    if (eventId) {
      params = params.set('eventId', eventId.toString());
    }
    return this.httpClient.get<EventMemberModel[]>(this.baseUrl, { params });
  }

  downloadDocData(docUrl: string) {
    return this.httpClient.get('api/ImportData/' + this.getIdFromUrl(docUrl));
  }

  create(eventMember: EventMemberModel) {
    return this.httpClient.post(this.baseUrl, eventMember);
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

  private getIdFromUrl(url: string) {
    return url.match(/[-\w]{25,}/);
  }
}
