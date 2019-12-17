import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LikeModel, SaveLikeModel } from '../models/like.model';

@Injectable({
  providedIn: 'root'
})
export class LikeService {

  private readonly baseUrl = 'api/Like';

  constructor(private httpClient: HttpClient) { }

  getByMember(memberId: number) {
    return this.httpClient.get<LikeModel[]>(`${this.baseUrl}/GetByMember/${memberId}`);
  }

  getAllByMember(memberId: number) {
    return this.httpClient.get<LikeModel[]>(`${this.baseUrl}/GetAllByMember/${memberId}`);
  }

  save(likes: SaveLikeModel) {
    return this.httpClient.post(`${this.baseUrl}/Save`, likes);
  }

  saveAll(likes: SaveLikeModel[]) {
    return this.httpClient.post(`${this.baseUrl}/SaveAll`, likes);
  }
}
