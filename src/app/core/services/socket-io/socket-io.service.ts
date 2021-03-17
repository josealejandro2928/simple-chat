import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as io from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { LoggedInUserService } from '../logged-in-user.service';

@Injectable({
  providedIn: 'root',
})
export class SocketIoService {
  private url = environment.apiUrl + 'v1/connect';
  private socket: SocketIOClient.Socket;
  loggedInUser: any;

  constructor(private loggedInUserService: LoggedInUserService) {}

  public sendMessage(eventname, message) {
    this.socket.emit(eventname, message);
  }

  // HANDLER
  listen(eventname): Observable<any> {
    return Observable.create((observer) => {
      this.socket.on(eventname, (data) => {
        observer.next(data);
      });
    });
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  public _initSocket(token) {
    console.log('SocketIoService -> _initSocket -> token', token);
    this.socket = io(this.url, {
      query: {
        Authorization: 'Bearer' + ' ' + token,
      },
    }).connect();

    this.socket.emit('hanshake',{data:"Hello askdjas dasljdaspdnsad "});
  
  }
}
