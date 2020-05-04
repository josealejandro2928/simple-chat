import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class LoaderService {
  loader: any;
  isLoading = false;
  constructor(public loadingController: LoadingController) {
    // this.init();
  }

  async init() {
    this.loader = await this.loadingController.create({
      message: 'Please wait ...',
    });
  }

  async show(msg?) {
    this.isLoading = true;
    return await this.loadingController
      .create({
        message: msg || 'Please wait ...',
      })
      .then((a) => {
        a.present().then(() => {
          console.log('presented');
          if (!this.isLoading) {
            a.dismiss().then(() => console.log('abort presenting'));
          }
        });
      });
  }
  async hide() {
    this.isLoading = false;
    return await this.loadingController
      .dismiss()
      .then(() => console.log('dismissed'));
  }
}
