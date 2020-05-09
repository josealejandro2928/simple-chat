import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { SimpleChatService } from 'src/app/core/services/simple-chat/simple-chat.service';
import { LoggedInUserService } from 'src/app/core/services/logged-in-user.service';
import { ShowAlertService } from 'src/app/core/services/show-alert.service';
import { ShowToastService } from 'src/app/core/services/show-toast.service';
import { Subject } from 'rxjs';
import { Socket } from 'ngx-socket-io';
import { takeUntil } from 'rxjs/operators';

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
  timeInterval;

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
    this.eventFromSocket();
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
        }, 0);
      },
      () => {
        this.isLoading = false;
      },
    );
  }

  ionViewWillLeave() {
    this._unsubscribeAll.next(true);
    this._unsubscribeAll.complete();
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
  }

  initState() {
    this._unsubscribeAll = new Subject();
    this.query = {
      limit: 10,
      offset: 0,
      total: 0,
    };
    this.timeInterval = undefined;
  }

  showConversationPage(id) {
    let navigationExtrass: any = {
      chatId: id,
    };
    this.navCtrl.navigateForward('conversation', {
      queryParams: navigationExtrass,
    });
  }

  eventFromSocket() {
    this.socket
      .fromEvent('chat-update')
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((data: any) => {
        let chatId = data.chat._id;
        this.simpleChatService.getChatById(chatId).subscribe((result) => {
          let index = this.chatList.findIndex((item) => item._id == chatId);
          if (index >= 0) {
            let data = { ...result.simpleChat, notReadMessages: result.notReadMessages };
            this.chatList[index] = data;
          }
        });
      });

    this.socket
      .fromEvent('chats-update')
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((data: any) => {
        this.query = {
          limit: 10,
          offset: 0,
          total: 0,
        };
        this.getChats();
      });

    this.socket
      .fromEvent('user-typing')
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((data: any) => {
        console.log('ChatsPage -> eventFromSocket -> data', data);
        let index = this.chatList.findIndex((item) => item._id == data.chat._id);
        if (index >= 0) {
          this.chatList[index].textAction = data.msg;
        }
        this.showIsWriting(this.chatList[index]);
      });
  }

  ///////////////////////////////////////////////////////////
  showIsWriting(chat) {
    if (chat.isWriting) {
      return;
    }

    chat.isWriting = true;
    let times = 5;
    let timeInterval = setInterval(() => {
      times--;
      if (!times) {
        clearInterval(timeInterval);
        chat.isWriting = false;
      }
    }, 550);
  }
}
