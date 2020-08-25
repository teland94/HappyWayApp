import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {EventPlaceViewModel} from '../models/event-place.model';
import {filter, map, switchMap} from 'rxjs/operators';
import {EventPlaceViewService} from './event-place-view.service';
import '../extensions';

@Injectable({
  providedIn: 'root'
})
export class EventPlaceStoreService {

  private _eventPlaces = new BehaviorSubject<EventPlaceViewModel[]>(undefined);
  readonly eventPlaces$ = this._eventPlaces.asObservable().pipe(filter(val => val !== undefined));

  constructor(private readonly eventPlaceViewService: EventPlaceViewService) { }

  get eventPlaces() {
    return this._eventPlaces.getValue();
  }

  set eventPlaces(val: EventPlaceViewModel[]) {
    this._eventPlaces.next(val);
  }

  load() {
    return this.fetchAll().pipe(switchMap(data => {
      return this.eventPlaces$;
    }));
  }

  create(eventPlace: EventPlaceViewModel) {
    return this.eventPlaceViewService.create(eventPlace)
      .pipe(map(newEventPlace => {
        eventPlace.id = newEventPlace.id;
        this.eventPlaces = [
          ...this.eventPlaces,
          eventPlace
        ];
        return newEventPlace;
      }));
  }

  update(eventPlace: EventPlaceViewModel) {
    return this.eventPlaceViewService.update(eventPlace)
      .pipe(map(data => {
        this.eventPlaces = this.eventPlaces.replace(ep => ep.id === eventPlace.id, eventPlace);
        return data;
      }));
  }

  delete(id: number) {
    return this.eventPlaceViewService.delete(id)
      .pipe(map(data => {
        this.eventPlaces = this.eventPlaces.filter(ep => ep.id !== id);
        return data;
      }));
  }

  fetchAll() {
    return this.eventPlaceViewService.getEventPlaces()
      .pipe(map(data => {
        this.eventPlaces = data;
        return data;
      }));
  }
}
