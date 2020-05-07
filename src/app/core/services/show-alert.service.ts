import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class ShowAlertService {
  constructor(public alertController: AlertController) {}

  async showAlert(header?, message?) {
    header = header || 'Alert';
    message = message || 'This is an alert message.';
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: [
        {
          text: 'No',
          handler: () => {
            alert.dismiss(false);
            return false;
          },
        },
        {
          text: 'Yes',
          handler: () => {
            alert.dismiss(true);
            return false;
          },
        },
      ],
    });

    await alert.present();
    return alert;
  }
}
