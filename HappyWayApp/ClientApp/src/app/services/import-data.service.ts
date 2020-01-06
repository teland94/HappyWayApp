import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ImportDataService {

  private readonly baseUrl = 'api/ImportData';

  constructor(private httpClient: HttpClient) { }

  downloadDocData(eventId: number, docUrl: string) {
    return this.httpClient.get(`${this.baseUrl}/${eventId}/${this.getIdFromUrl(docUrl)}`);
  }

  private getIdFromUrl(url: string) {
    return url.match(/[-\w]{25,}/);
  }
}
