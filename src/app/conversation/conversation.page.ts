import { ShowToastService } from 'src/app/core/services/show-toast.service';
import { LoggedInUserService } from './../core/services/logged-in-user.service';
import { Socket } from 'ngx-socket-io';
import { SimpleChatService } from './../core/services/simple-chat/simple-chat.service';
import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { ShowAlertService } from '../core/services/show-alert.service';

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
  lastMessageReadOrSendId = null;
  scrollState = 'top'; // top|inside|bottom;

  private messages: Array<any> = [];

  loggedInUser: any;
  _unsubscribeAll: Subject<any> = new Subject();
  textForm: FormControl = new FormControl();
  isWriting = false;
  textIsWriting = '...is writing something.';
  timeInterval = undefined;
  notReadMessages = 0;
  backwardFirstMessage = undefined;
  forwardLastMessage = undefined;
  scrollDirection = 'down'; //'up' and 'down';
  lastScrollTop = 0;
  scrollignState = 'top';
  loadingMore = false;
  countForTouch = 0;
  touchIntervalTime = undefined;
  selectionState = false;
  selection = {};

  constructor(
    private simpleChatService: SimpleChatService,
    private route: ActivatedRoute,
    private socket: Socket,
    private loggedInUserService: LoggedInUserService,
    private showAlert: ShowAlertService,
    private showToast: ShowToastService,
  ) {}

  ngOnInit() {
    this.loggedInUserService.getUserLogged().then((data) => {
      this.loggedInUser = data;
    });
  }

  async ionViewWillEnter() {
    this.initState();
    this.queryParams = this.route.snapshot.queryParams;
    this.messages = [];
    this.initChat(this.queryParams);
    ////////////////////////////////////////////////////////
    this.eventFromSocket();
    this.textForm.valueChanges.pipe(takeUntil(this._unsubscribeAll), debounceTime(250)).subscribe((data) => {
      if (data && data.length > 5) {
        this.socket.emit('user-typing', { chatId: this.chat._id });
      }
    });
  }

  eventFromSocket() {
    this.socket
      .fromEvent('send-message')
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((data: any) => {
        let message = data.data;
        this.messages.push(message);
        this.scrollIntoMessage(message._id);
        if (message.action == 'received') {
          this.stopUserWriting();
        }
        this.forwardLastMessage = message;
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
        let index = this.messages.findIndex((item) => item._id.toString() == data.message._id.toString());
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
    if (this.touchIntervalTime) {
      clearInterval(this.touchIntervalTime);
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
      console.log('ConversationPage -> initChat -> data', data);

      this.chat = data.simpleChat;
      this.contactInfo = data.simpleChat.userTo;
      this.notReadMessages = data.notReadMessages || 0;
      if (data.simpleChat.lastMessageSendOrRead) {
        this.lastMessageReadOrSendId = data.simpleChat.lastMessageSendOrRead;
        this.messages = this.processingForNotReadMessage(data.messages);
      } else {
        this.messages = data.messages;
      }
      console.log('ConversationPage -> initChat -> this.messages', this.messages);
      this.lastMessageId = data.simpleChat.lastMessage;
      if (this.lastMessageReadOrSendId) {
        this.scrollIntoMessage(this.lastMessageReadOrSendId);
      }
      this.backwardFirstMessage = this.messages[0];
      this.forwardLastMessage = this.messages[Math.max(this.messages.length - 1, 0)];
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

  loadMore(query) {
    if (this.loadingMore) {
      return;
    }
    this.loadingMore = true;
    this.simpleChatService.getMessages(this.chat._id, query).subscribe(
      (data) => {
        this.backwardFirstMessage = data.backwardFirstMessage ? data.backwardFirstMessage : this.backwardFirstMessage;
        this.forwardLastMessage = data.forwardLastMessage ? data.forwardLastMessage : this.forwardLastMessage;
        if (data.action == 'backward') {
          this.messages = data.messages.concat(this.messages);
        }
        if (data.action == 'forward') {
          this.messages = this.messages.concat(data.messages);
        }
        this.loadingMore = false;
      },
      () => {
        this.loadingMore = false;
      },
    );
  }

  onScroll(event) {
    let dataScroll = {
      scrollTop: event.srcElement.scrollTop,
      scrollHeight: event.srcElement.scrollHeight,
      scrollWidth: event.srcElement.scrollWidth,
      offsetHeight: event.srcElement.offsetHeight,
      scrollThreshold: 2,
    };
    this.scrollDirection = dataScroll.scrollTop - this.lastScrollTop > 0 ? 'down' : 'up';
    this.lastScrollTop = dataScroll.scrollTop;
    if (dataScroll.scrollTop == 0) {
      this.scrollignState = 'top';
    } else if (
      Math.abs(dataScroll.scrollTop + dataScroll.offsetHeight - dataScroll.scrollHeight) < dataScroll.scrollThreshold
    ) {
      this.scrollignState = 'bottom';
    } else {
      this.scrollignState = 'inside';
    }
    if (dataScroll.scrollTop <= 100 && this.scrollDirection == 'up') {
      let query = {
        action: 'backward',
        limit: 5,
        messageId: this.backwardFirstMessage._id,
      };
      this.loadMore(query);
    }
  }

  onScrollToEnd() {
    let elementId = this.messages[this.messages.length - 1]._id;
    this.scrollIntoMessage(elementId);
  }

  onTouchStart(id) {
    if (!this.selectionState) {
      this.touchIntervalTime = setInterval(() => {
        this.countForTouch++;
        if (this.countForTouch > 5) {
          this.selectionState = true;
          this.countForTouch = 0;
          clearInterval(this.touchIntervalTime);
          this.selection[id] = true;
        }
      }, 50);
    } else {
      if (this.selection[id]) {
        delete this.selection[id];
      } else {
        this.selection[id] = true;
      }
      console.log('pepe selecciono el selection state');
    }
  }

  onTouchEnd(id) {
    if (!this.selectionState) {
      if (this.touchIntervalTime) {
        clearInterval(this.touchIntervalTime);
      }
      this.countForTouch = 0;
    } else {
      if (Object.keys(this.selection).length == 0) {
        this.selectionState = false;
      }
    }
  }

  onCancellSelection() {
    this.selectionState = false;
    this.selection = {};
  }

  onDeleteMessages() {
    this.showAlert.showAlert('Delete messages', 'Are you sure to delete these messages').then((alert) => {
      alert.onDidDismiss().then((data) => {
        if (data.data) {
        }
      });
    });
  }

  onSendToContact() {
    this.showToast.showInfo('We are working in this feature', 3000);
  }

  getSelectedElements() {
    return Object.keys(this.selection);
  }

  ///////////////////////////////UTILES////////////////////
  scrollIntoMessage(_id) {
    let timeOut = setTimeout(() => {
      let elementDom = document.getElementById(_id);
      elementDom.scrollIntoView({ behavior: 'smooth' });
      clearTimeout(timeOut);
    }, 50);
  }

  processingForNotReadMessage(messagesArray) {
    if (this.notReadMessages) {
      let indexNoRead = messagesArray.findIndex((item) => {
        return item._id.toString() == this.lastMessageReadOrSendId.toString();
      });
      indexNoRead++;
      let tempArray = messagesArray.splice(0, indexNoRead);
      tempArray.push({ message: `${this.notReadMessages} messages not read`, action: 'not-read', _id: undefined });
      tempArray = tempArray.concat(messagesArray);
      return tempArray;
    } else {
      return messagesArray;
    }
  }

  markMessageAsRead(message) {
    if (message.action == 'received' && message.status == 'unread') {
      this.socket.emit('mark-message-as-read', {
        messageId: message._id,
        chatId: this.chat._id,
      });
    }
  }

  setLastMessageReadOrSend(message) {
    if (message.action == 'received' && message.status == 'unread') {
      this.socket.emit('set-message-as-last-read-or-send', {
        messageId: message._id,
        chatId: this.chat._id,
      });
      this.lastMessageReadOrSendId = message._id;
      return;
    }
  }

  onInterceptMessage(_id) {
    let index = this.messages.findIndex((item) => item._id == _id);
    let message = index > -1 ? this.messages[index] : undefined;
    if (message) {
      this.markMessageAsRead(message);
      this.setLastMessageReadOrSend(message);
    }
  }

  initState() {
    this._unsubscribeAll = new Subject();
    this.messages = [];
    this.lastMessageId = null;
    this.lastMessageReadOrSendId = null;
    this.scrollState = 'top'; // top|inside|bottom;
    this.textForm = new FormControl();
    this.isWriting = false;
    this.textIsWriting = '...is writing something.';
    this.timeInterval = undefined;
    this.notReadMessages = 0;
    this.backwardFirstMessage = undefined;
    this.forwardLastMessage = undefined;
    this.scrollDirection = 'down'; //'up' and 'down';
    this.lastScrollTop = 0;
    this.scrollignState = 'top';
    this.loadingMore = false;
    this.countForTouch = 0;
    this.touchIntervalTime = undefined;
    this.selectionState = false;
    this.selection = {};
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
    }, 550);
  }
  stopUserWriting() {
    this.isWriting = false;
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
  }
}
