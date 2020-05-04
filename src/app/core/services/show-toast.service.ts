import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class ShowToastService {
  constructor(public toastController: ToastController) {}

  async showError(msg, time?) {
    time = time || 4000;
    const toast = await this.toastController.create({
      message: msg,
      position: 'bottom',
      duration: time,
      color: 'danger',
      showCloseButton: true,
    });
    toast.present();
  }

  async showSucces(msg, time?) {
    time = time || 3000;
    const toast = await this.toastController.create({
      message: msg,
      position: 'bottom',
      duration: time,
      color: 'success',
      showCloseButton: true,
    });
    toast.present();
  }

  async showInfo(msg, time?,color?) {
    time = time || 3000;
    color = color || 'dark'
    const toast = await this.toastController.create({
      message: msg,
      position: 'bottom',
      duration: time,
      color: 'dark',
      showCloseButton: true,
    });
    toast.present();
  }
}
