import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

@Injectable({
  providedIn: 'root',
})
export class LoggedInUserService {
  isConnected = false;
  constructor(private storage: Storage) {}

  async getUserLogged() {
    return this.storage.get('user');
  }

  async setUserLogged(user: any) {
    return this.storage.set('user', user);
  }

  async setToken(token) {
    return this.storage.set('token', token);
  }

  async getToken() {
    return this.storage.get('token');
  }

  async isAccountCrated() {
    return this.storage.get('status').then((status) => {
      return status || false;
    });
  }

  async setAcountCreated() {
    return this.storage.set('status', true);
  }
  setConnected(state) {
    this.isConnected = state;
    if(state){
      console.log("Socket connection established")
    }else{
      console.log("Socket connection not established")
    }
  }
  getConnectedState() {
    return this.isConnected;
  }
}
