import { environment } from 'src/environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SimpleChatService {
  chatInitUrl = environment.apiUrl + 'chat/init';
  chatUrlId = environment.apiUrl + 'chat/:id';
  chatUrl = environment.apiUrl + 'chat';

  constructor(private httpClient: HttpClient) {}

  public initChat(params): Observable<any> {
    if (params.chatId) {
      return this.getChatById(params.chatId);
    }
    let httpParams = new HttpParams();
    if (params.userToId) {
      httpParams = httpParams.set('userToId', params.userToId);
    }
    return this.httpClient.get<any>(this.chatInitUrl, { params: httpParams });
  }

  public getChatById(id): Observable<any> {
    return this.httpClient.get<any>(this.chatUrlId.replace(':id', id));
  }

  public sendMessage(data): Observable<any> {
    return this.httpClient.post<any>(
      this.chatUrlId.replace(':id', data.chatId),
      data
    );
  }

  public getMessages(chatId, query): Observable<any> {
    let httpParams = new HttpParams();
    for (let key in query) {
      httpParams = httpParams.set(key, query[key]);
    }
    return this.httpClient.get<any>(
      this.chatUrlId.replace(':id', chatId) + '/messages',
      { params: httpParams }
    );
  }
}
