import { environment } from 'src/environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  contactsUrl = environment.apiUrl + 'person/contacts';

  constructor(private httpClient: HttpClient) {}

  public getContacts(): Observable<any> {
    return this.httpClient.get<any>(this.contactsUrl);
  }
}
