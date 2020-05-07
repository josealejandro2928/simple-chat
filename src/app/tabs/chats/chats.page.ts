import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { SimpleChatService } from 'src/app/core/services/simple-chat/simple-chat.service';
import { LoggedInUserService } from 'src/app/core/services/logged-in-user.service';
import { ShowAlertService } from 'src/app/core/services/show-alert.service';
import { ShowToastService } from 'src/app/core/services/show-toast.service';
import { Subject } from 'rxjs';
import { Socket } from 'ngx-socket-io';

@Component({
  selector: 'app-chats',
  templateUrl: 'chats.page.html',
  styleUrls: ['chats.page.scss'],
})
export class ChatsPage {
  chatList: Array<any> = [];
  isLoading = false;

  loggedInUser: any;
  _unsubscribeAll: Subject<any> = new Subject();

  query = {
    limit: 10,
    offset: 0,
    total: 0,
  };

  constructor(
    private navCtrl: NavController,
    private simpleChatService: SimpleChatService,
    private socket: Socket,
    private loggedInUserService: LoggedInUserService,
    private showAlert: ShowAlertService,
    private showToast: ShowToastService,
  ) {}

  ionViewWillEnter() {
    this.initState();
    this.getChats();
  }

  getChats() {
    this.isLoading = true;
    this.simpleChatService.getChats(this.query).subscribe(
      (data) => {
        this.chatList = data.data;
        this.query.offset = data.count;
        this.query.total = data.total;
        setTimeout(() => {
          this.isLoading = false;
        }, 250);
      },
      () => {
        this.isLoading = false;
      },
    );
  }

  ionViewWillLeave() {}

  initState() {
    this._unsubscribeAll = new Subject();
    this.query = {
      limit: 10,
      offset: 0,
      total: 0,
    };
  }

  showConversationPage() {
    this.navCtrl.navigateForward('conversation');
  }
}
