import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Area } from '../models/area.model';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  private _jsonURL = 'assets/data';

  constructor(private readonly httpClient: HttpClient) { }

  getAreas() {
    return this.httpClient.get<Area[]>(`${this._jsonURL}/cities.json`);
  }
}
