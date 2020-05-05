import { LoggedInUserService } from './../core/services/logged-in-user.service';
import { Socket } from 'ngx-socket-io';
import { SimpleChatService } from './../core/services/simple-chat/simple-chat.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';
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
  lastMessageId = null;

  private messages: Array<any> = [];

  loggedInUser: any;
  _unsubscribeAll: Subject<any> = new Subject();
  textForm: FormControl = new FormControl();
  isWriting = false;
  textIsWriting = '...is writing something.';
  timeInterval = undefined;

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
    this.initChat(this.queryParams);
    ////////////////////////////////////////////////////////
    this.eventFromSocket();
    this.textForm.valueChanges
      .pipe(takeUntil(this._unsubscribeAll), debounceTime(250))
      .subscribe((data) => {
        if (data && data.length > 10) {
          this.socket.emit('user-typing', { chatId: this.chat._id });
        }
      });
  }

  eventFromSocket() {
    this._unsubscribeAll = new Subject<any>();
    this.socket
      .fromEvent('send-message')
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((data: any) => {
        let message = data.data;
        this.messages.push(message);
        this.markMessageAsRead(message);
        this.scrollIntoMessage(message._id);
        if (message.action == 'received') {
          this.stopUserWriting();
        }
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
    this.socket
      .fromEvent('message-read')
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((data: any) => {
        let index = this.messages.findIndex(
          (item) => item._id.toString() == data.message._id.toString()
        );
        if (index > -1) {
          this.messages[index] = data.message;
        }
      });

    this.socket
      .fromEvent('user-typing')
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((data: any) => {
        this.showIsWriting();
      });
  }

  ionViewWillLeave() {
    this._unsubscribeAll.next(true);
    this._unsubscribeAll.complete();
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
  }

  showOptionsToggle(value?: boolean) {
    if (value !== undefined) {
      this.showOptions = value;
      return;
    }
    this.showOptions = !this.showOptions;
  }

  initChat(params) {
    this.simpleChatService.initChat(params).subscribe((data) => {
      this.messages = data.messages;
      this.chat = data.simpleChat;
      this.contactInfo = data.simpleChat.userTo;
      this.lastMessageId = data.simpleChat.lastMessage;
      if (this.lastMessageId) {
        this.scrollIntoMessage(this.lastMessageId);
      }
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

  ///////////////////////////////UTILES////////////////////
  scrollIntoMessage(_id) {
    let timeOut = setTimeout(() => {
      let elementDom = document.getElementById(_id);
      elementDom.scrollIntoView({ behavior: 'smooth' });
      clearTimeout(timeOut);
    }, 50);
  }

  markMessageAsRead(message) {
    if (message.action == 'received') {
      this.socket.emit('mark-message-as-read', {
        messageId: message._id,
        chatId: this.chat._id,
      });
    }
  }
  showIsWriting() {
    if (this.isWriting) {
      return;
    }

    this.isWriting = true;
    let counter = 0;
    let times = 5;
    this.timeInterval = setInterval(() => {
      if (counter == 0) {
        this.textIsWriting = ' is writing something.';
      } else if (counter == 1) {
        this.textIsWriting = '. is writing something.';
      } else if (counter == 2) {
        this.textIsWriting = '.. is writing something.';
      } else if (counter == 3) {
        this.textIsWriting = '... is writing something.';
      } else if (counter == 4) {
        this.textIsWriting = ' is writing something.';
        counter = 0;
        times--;
      }
      counter++;
      if (!times) {
        clearInterval(this.timeInterval);
        this.isWriting = false;
      }
    }, 350);
  }
  stopUserWriting() {
    this.isWriting = false;
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
  }
}
