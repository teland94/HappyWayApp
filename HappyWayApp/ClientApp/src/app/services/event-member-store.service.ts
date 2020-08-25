import { Injectable } from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {filter, map} from 'rxjs/operators';
import {EventMemberModel} from '../models/event-member';
import {EventMemberService} from './event-member.service';
import '../extensions';

@Injectable({
  providedIn: 'root'
})
export class EventMemberStoreService {

  private _eventMembers = new BehaviorSubject<EventMemberModel[]>(undefined);
  readonly eventMembers$ = this._eventMembers.asObservable().pipe(filter(val => val !== undefined));

  constructor(private eventMemberService: EventMemberService) { }

  get eventMembers() {
    return this._eventMembers.getValue();
  }

  set eventMembers(val: EventMemberModel[]) {
    this._eventMembers.next(val);
  }

  getByEventId(eventId: number) {
    return this.eventMembers$.pipe(map(eventMembers => {
      if (!eventMembers) { return null; }
      return eventMembers.filter(em => em.eventId === eventId);
    }));
  }

  create(eventMember: EventMemberModel) {
    return this.eventMemberService.create(eventMember)
      .pipe(map(data => {
        this.eventMembers = [
          ...this.eventMembers,
          data
        ];
        return data;
      }));
  }

  update(eventMember: EventMemberModel) {
    return this.eventMemberService.update(eventMember)
      .pipe(map(data => {
        this.eventMembers = this.eventMembers.replace(em => em.id === eventMember.id, eventMember);
        return data;
      }));
  }

  delete(id: number) {
    return this.eventMemberService.delete(id)
      .pipe(map(data => {
        this.eventMembers = this.eventMembers.filter(g => g.id !== id);
        return data;
      }));
  }

  fetchByEventId(eventId: number) {
    return this.eventMemberService.get(eventId)
      .pipe(map(eventMembers => {
        let resEventMembers = this.eventMembers ? [...this.eventMembers] : [];
        resEventMembers = resEventMembers.addOrReplaceRange(em => em.eventId === eventId, eventMembers);
        this.eventMembers = resEventMembers;
        return eventMembers;
      }));
  }
}
