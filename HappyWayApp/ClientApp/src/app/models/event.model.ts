import {EventPlaceViewModel} from "./event-place.model";

export class EventViewModel {
  id: number;
  name: string;
  date: Date;
  user: string;
  completed: boolean;
  eventPlaceId: number;
  eventPlace: EventPlaceViewModel;

  constructor(event: EventModel, eventPlaceVm: EventPlaceViewModel) {
    this.id = event.id;
    this.name = event.name;
    this.date = event.date;
    this.user = event.user;
    this.completed = event.completed;
    this.eventPlaceId = event.eventPlaceId;
    this.eventPlace = eventPlaceVm;
  }
}

export class EventModel {
  id: number;
  name: string;
  date: Date;
  user: string;
  completed: boolean;
  eventPlaceId: number;
}
