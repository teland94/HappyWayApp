import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {catchError} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class ImportDataService {

  private readonly baseUrl = 'api/ImportData';

  constructor(private httpClient: HttpClient) { }

  downloadDocData(eventId: number, docUrl: string) {
    return this.httpClient.get(`${this.baseUrl}/${eventId}/${this.getIdFromUrl(docUrl)}`)
      .pipe(catchError(error => {
        if (error.status === 422) {
          let displayParamName;
          switch (error.paramName) {
            case 'number':
              displayParamName = 'номер участника';
              break;
            case 'name':
              displayParamName = 'имя';
              break;
            case 'phoneNumber':
              displayParamName = 'номер телефона';
              break;
          }
          throw { status: error.status, displayParamName } ;
        }
        throw error;
      }));
  }

  private getIdFromUrl(url: string) {
    return url.match(/[-\w]{25,}/);
  }
}
