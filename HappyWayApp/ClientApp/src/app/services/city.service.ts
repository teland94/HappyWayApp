import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {CityModel} from '../models/city.model';

@Injectable({
  providedIn: 'root'
})
export class CityService {

  private baseUrl = 'api/city';

  constructor(private httpClient: HttpClient) {
  }

  get(query: string) {
    const params = new HttpParams().set('query', query);
    return this.httpClient.get<CityModel[]>(this.baseUrl, { params });
  }

  getById(id: number) {
    return this.httpClient.get<CityModel>(`${this.baseUrl}/${id}`);
  }

  getCitiesById(ids: number[]) {
    const params = ids.reduce((acc, next) => acc.append('ids', next.toString()), new HttpParams());
    return this.httpClient.get<CityModel[]>(this.baseUrl + '/GetCitiesById', { params });
  }
}
