import { environment } from 'src/environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SimpleChatService {
  chatUrl = environment.apiUrl + 'chat';
  chatUrlId = environment.apiUrl + 'chat/:id';

  constructor(private httpClient: HttpClient) {}

  public getChat(params): Observable<any> {
    if (params.chatId) {
      return this.getChatById(params.chatId);
    }
    let httpParams = new HttpParams();
    if (params.userToId) {
      httpParams = httpParams.set('userToId', params.userToId);
    }
    return this.httpClient.get<any>(this.chatUrl, { params: httpParams });
  }

  public getChatById(id): Observable<any> {
    return this.httpClient.get<any>(this.chatUrlId.replace(':id', id));
  }

  public sendMessage(data): Observable<any> {
    return this.httpClient.post<any>(this.chatUrl, data);
  }
}
