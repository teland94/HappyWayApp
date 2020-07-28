import { CityModel } from "./city.model";

export class EventPlaceViewModel {
  id: number;
  name: string;
  googleUrl: string;
  facebookUrl: string;
  instagramUrl: string;
  city: CityModel;

  constructor(eventPlace: EventPlaceModel, city: CityModel) {
    this.id = eventPlace.id;
    this.name = eventPlace.name;
    this.googleUrl = eventPlace.googleUrl;
    this.facebookUrl = eventPlace.facebookUrl;
    this.instagramUrl = eventPlace.instagramUrl;
    this.city = city;
  }
}

export class EventPlaceModel {
  id: number;
  name: string;
  googleUrl: string;
  facebookUrl: string;
  instagramUrl: string;
  cityId: number;
}
