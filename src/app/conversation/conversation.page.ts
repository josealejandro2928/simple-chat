import { LoggedInUserService } from './../core/services/logged-in-user.service';
import { Socket } from 'ngx-socket-io';
import { SimpleChatService } from './../core/services/simple-chat/simple-chat.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-conversation',
  templateUrl: './conversation.page.html',
  styleUrls: ['./conversation.page.scss'],
})
export class ConversationPage implements OnInit {
  private showOptions: boolean = false;
  queryParams = null;
  chat = null;
  contactInfo = {
    name: 'Contact',
    isConnected: false,
    avatar: '../../assets/imgs/profile2.png',
    _id: Date.now(),
  };

  private messages: Array<any> = [];

  loggedInUser: any;
  _unsubscribeAll: Subject<any> = new Subject();
  textForm: FormControl = new FormControl();

  constructor(
    private simpleChatService: SimpleChatService,
    private route: ActivatedRoute,
    private socket: Socket,
    private loggedInUserService: LoggedInUserService
  ) {}

  async ngOnInit() {
    this.loggedInUser = await this.loggedInUserService.getUserLogged();
  }

  async ionViewWillEnter() {
    this.queryParams = this.route.snapshot.queryParams;
    console.log(
      'ConversationPage -> ionViewWillEnter ->  this.queryParams',
      this.queryParams
    );
    this.getChat(this.queryParams);
    ////////////////////////////////////////////////////////
    this.eventFromSocket();
  }

  eventFromSocket() {
    this._unsubscribeAll = new Subject<any>();
    this.socket
      .fromEvent('send-message')
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((data: any) => {
        let message = data.data;
        this.messages.push(message);
        let timeOut = setTimeout(() => {
          let elementDom = document.getElementById(message._id);
          elementDom.scrollIntoView({ behavior: 'smooth' });
          clearTimeout(timeOut);
        }, 50);
      });
      
    this.socket
      .fromEvent('users-changed')
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((data) => {
        let user = data['user'];
        if (data['event'] === 'left') {
          if (user._id == this.contactInfo._id) {
            this.contactInfo.isConnected = false;
          }
        } else {
          if (user._id == this.contactInfo._id) {
            this.contactInfo.isConnected = true;
          }
        }
      });
  }

  ionViewWillLeave() {
    this._unsubscribeAll.next(true);
    this._unsubscribeAll.complete();
  }

  showOptionsToggle(value?: boolean) {
    if (value !== undefined) {
      this.showOptions = value;
      return;
    }
    this.showOptions = !this.showOptions;
  }

  getChat(params) {
    this.simpleChatService.getChat(params).subscribe((data) => {
      this.messages = data.messages;
      this.chat = data.simpleChat;
      this.contactInfo = data.simpleChat.userTo;
    });
  }

  onSendMessage() {
    let msg = this.textForm.value;
    let data = {
      message: msg,
      chatId: this.chat._id,
    };
    this.textForm.reset();
    this.simpleChatService.sendMessage(data).subscribe(() => {});
  }
}
