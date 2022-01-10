import { LoaderService } from './../core/services/loader.service';
import { ShowToastService } from './../core/services/show-toast.service';
import { LoggedInUserService } from './../core/services/logged-in-user.service';
import { Component, OnInit } from '@angular/core';
import { countryCodes } from 'src/common/CountryCodes';
import { Platform, NavController } from '@ionic/angular';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { LoadingController } from '@ionic/angular';
import { AuthService } from '../core/services/auth.service';
@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignupPage implements OnInit {
  public countries: Array<any> = countryCodes;
  public confirmData: any = { code: '+53' };
  public logoPath = 'assets/imgs/chat.png';
  signupForm: FormGroup;

  constructor(
    private platform: Platform,
    private navCtrl: NavController,
    public loadingController: LoadingController,
    private loggedInUserService: LoggedInUserService,
    private showToast: ShowToastService,
    private loaderService: LoaderService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    if (!this.platform.is('cordova')) this.logoPath = `/${this.logoPath}`;
  }

  ngOnInit() {
    this.buildForm();
  }

  onRegister() {
    let data = { ...this.signupForm.value };
    console.log('SignupPage -> onRegister -> data', data);
    this.loaderService.show();
    this.authService.signUp(data).subscribe(
      async (data) => {
        await this.loggedInUserService.setUserLogged(data.data);
        await this.loggedInUserService.setAcountCreated();
        this.showToast.showSucces('You have signup successfully');
        await this.loaderService.hide();
        this.navCtrl.navigateRoot('enter-code');
      },
      async () => {
        await this.loaderService.hide();
      }
    );
  }

  buildForm() {
    this.signupForm = this.fb.group({
      name: [null, [Validators.required]],
      email: [null, [Validators.required, Validators.email]],
    });
  }
}
