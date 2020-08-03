import {Injectable} from '@angular/core';
import {map, switchMap} from "rxjs/operators";
import {EventPlaceModel, EventPlaceViewModel} from "../models/event-place.model";
import {EventPlaceService} from "./event-place.service";
import {CityService} from "./city.service";

@Injectable({
  providedIn: 'root'
})
export class EventPlaceViewService {

  constructor(private readonly eventPlaceService: EventPlaceService,
              private readonly cityService: CityService) { }

  getEventPlace(id: number) {
    return this.eventPlaceService.getById(id).pipe(switchMap(eventPlace => {
      return this.cityService.getById(eventPlace.cityId).pipe(map(city => {
        return new EventPlaceViewModel(eventPlace, city);
      }));
    }));
  }

  getEventPlaces() {
    return this.eventPlaceService.get().pipe(switchMap(eventPlaces => {
      const ids = eventPlaces.map(ep => ep.cityId);
      return this.cityService.getCitiesById(ids).pipe(map(cities => {
        return eventPlaces.map(ep => {
          const city = cities.find(c => c.id === ep.cityId);
          return new EventPlaceViewModel(ep, city);
        });
      }));
    }));
  }

  create(eventPlaceVm: EventPlaceViewModel) {
    return this.eventPlaceService.create(this.getEventPlaceModel(eventPlaceVm));
  }

  update(eventPlaceVm: EventPlaceViewModel) {
    return this.eventPlaceService.update(this.getEventPlaceModel(eventPlaceVm));
  }

  delete(id: number) {
    return this.eventPlaceService.delete(id);
  }

  private getEventPlaceModel(eventPlaceVm: EventPlaceViewModel) {
    return <EventPlaceModel> {
      id: eventPlaceVm.id,
      name: eventPlaceVm.name,
      googleUrl: eventPlaceVm.googleUrl,
      facebookUrl: eventPlaceVm.facebookUrl,
      instagramUrl: eventPlaceVm.instagramUrl,
      cityId: eventPlaceVm.city.id
    }
  }
}
