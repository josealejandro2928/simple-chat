import { LoggedInUserService } from './../core/services/logged-in-user.service';
import { ShowToastService } from './../core/services/show-toast.service';
import { SocketIoService } from './../core/services/socket-io/socket-io.service';
import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Socket } from 'ngx-socket-io';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
})
export class TabsPage implements OnInit {
  _unsubscribeAll: Subject<any> = new Subject();
  loggedUser: any = null;
  constructor(
    private socket: Socket,
    private loggedInUserService: LoggedInUserService,
    private showToast: ShowToastService
  ) {}

  async ngOnInit() {
    const token = await this.loggedInUserService.getToken();
    this.socket.connect();
    this.socket.emit('set-token', 'Bearer ' + token);
    this.loggedUser = await this.loggedInUserService.getUserLogged();

    this._unsubscribeAll = new Subject();
    this.socket
      .fromEvent('users-changed')
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((data) => {
        let user = data['user'];
        if (user && user._id !== this.loggedUser._id)
          if (data['event'] === 'left') {
            this.showToast.showInfo('User left: ' + user.name);
          } else {
            this.showToast.showInfo('User joined: ' + user.name);
          }
      });
  }

  ionViewWillEnter() {}

  ionViewWillLeave() {}
}
