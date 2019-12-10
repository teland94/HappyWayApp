import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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

  get() {
    return this.httpClient.get<EventMemberModel[]>(this.baseUrl);
  }

  downloadDocData(docUrl: string) {
    return this.httpClient.get('api/ImportData/' + this.getIdFromUrl(docUrl));
  }

  sexChange(sex: Sex) {
    this.sexChangesSource$.next(sex);
  }

  private getIdFromUrl(url: string) {
    return url.match(/[-\w]{25,}/);
  }
}
