import { switchMap, takeUntil } from 'rxjs/operators';
import { Component, OnDestroy } from '@angular/core';
import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { LoggedInUserService } from './core/services/logged-in-user.service';
import { Socket } from 'ngx-socket-io';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
})
export class AppComponent implements OnDestroy {
  _unsubscribeAll = new Subject<any>();
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    public loggedInUserService: LoggedInUserService,
    private socket: Socket
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(async () => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      const token = await this.loggedInUserService.getToken();
      if (token) {
        this.socket.connect();
        this.socket.emit('set-token', 'Bearer ' + token);
      }
      this.eventFromSocket();
    });
  }

  eventFromSocket() {
    this.socket
      .fromEvent('get-token')
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(async (data) => {
        console.log('AppComponent -> sendTokentoServer -> data', data);
        const token = await this.loggedInUserService.getToken();
        if (token) {
          this.socket.connect();
          this.socket.emit('set-token', 'Bearer ' + token);
        }
      });
  }

  ngOnDestroy() {
    this._unsubscribeAll.next(true);
    this._unsubscribeAll.complete();
    this.socket.disconnect();
  }
}
