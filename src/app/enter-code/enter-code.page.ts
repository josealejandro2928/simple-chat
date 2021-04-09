import { LoaderService } from './../core/services/loader.service';
import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { LoggedInUserService } from '../core/services/logged-in-user.service';
import { FormControl, Validators } from '@angular/forms';
import { AuthService } from '../core/services/auth.service';
import { ShowToastService } from '../core/services/show-toast.service';
import { SocketIoService } from '../core/services/socket-io/socket-io.service';

@Component({
  selector: 'app-enter-code',
  templateUrl: './enter-code.page.html',
  styleUrls: ['./enter-code.page.scss'],
})
export class EnterCodePage implements OnInit {
  confirmationCode: string = '';
  codeForm = new FormControl(null, [
    Validators.required,
  ]);
  email: string = '';
  loggedUser: any;

  constructor(
    private navCtrl: NavController,
    private loggedInUserService: LoggedInUserService,
    private authService: AuthService,
    private showToast: ShowToastService,
    private loaderService: LoaderService,
    private socketIo: SocketIoService
  ) {}

  async ngOnInit() {
    this.loggedUser = await this.loggedInUserService.getUserLogged();
    this.email = this.loggedUser.email;
  }

  onConfirmCode() {
    this.loaderService.show();
    let code = this.codeForm.value;
    this.authService
      .confirmAccount({ email: this.loggedUser.email, pin: code })
      .subscribe(
        async (data) => {
          await this.loggedInUserService.setToken(data.token);
          await this.loggedInUserService.setUserLogged(data.data);
          this.showToast.showSucces(
            'You have confirm your account successfully'
          );
          await this.loaderService.hide();
          this.navCtrl.navigateRoot('tabs/tabs');
        },
        async () => {
          await this.loaderService.hide();
        }
      );
  }

  onResendCode() {
    this.authService
      .resendPin({ email: this.loggedUser.email, userId: this.loggedUser._id })
      .subscribe(
        async (data) => {
          this.showToast.showSucces('Your ping has resend successfully');
        },
        async () => {
          await this.loaderService.hide();
        }
      );
  }
}
