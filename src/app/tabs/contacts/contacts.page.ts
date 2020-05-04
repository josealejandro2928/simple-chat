import { Component, OnInit } from '@angular/core';
import { NavController, LoadingController } from '@ionic/angular';
import { LoggedInUserService } from 'src/app/core/services/logged-in-user.service';
import { ShowToastService } from 'src/app/core/services/show-toast.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { UserService } from 'src/app/core/services/user.service';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { Socket } from 'ngx-socket-io';
import { Subject } from 'rxjs';
import { NavigationExtras } from '@angular/router';

@Component({
  selector: 'app-contacts',
  templateUrl: 'contacts.page.html',
  styleUrls: ['contacts.page.scss'],
})
export class ContactsPage implements OnInit {
  contactsList: Array<any> = [];

  loggedInUser: any;
  _unsubscribeAll: Subject<any> = new Subject();

  constructor(
    private navCtrl: NavController,
    public loadingController: LoadingController,
    private loggedInUserService: LoggedInUserService,
    private loaderService: LoaderService,
    private userService: UserService,
    private socket: Socket
  ) {
    console.log('akljdhailsndas das ;dans das;dl');
  }

  ngOnInit() {
    this.loggedInUser = this.loggedInUserService.getUserLogged();
  }

  ionViewWillEnter() {
    this.userService.getContacts().subscribe((data) => {
      this.contactsList = data.data;
    });

    this._unsubscribeAll = new Subject<any>();

    this.socket
      .fromEvent('users-changed')
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((data) => {
        console.log('Entre en el refrescar de usuarios');
        this.userService.getContacts().subscribe((data) => {
          this.contactsList = data.data;
        });
      });
  }

  ionViewWillLeave() {
    console.log('Destruido el componente');
    this._unsubscribeAll.next(true);
    this._unsubscribeAll.complete();
  }

  showConversationPage(contact) {
    let navigationExtrass: any = {
      userToId: contact._id,
    };
    this.navCtrl.navigateForward('conversation', {
      queryParams: navigationExtrass,
    });
  }
}
