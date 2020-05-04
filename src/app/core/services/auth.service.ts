import { environment } from 'src/environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  signUpUrl = environment.apiUrl + 'auth/signup';
  confirmCodeUrl = environment.apiUrl + 'auth/confirm-account';
  resendPinUrl = environment.apiUrl + 'auth/resend-pin';
  constructor(private httpClient: HttpClient) {}

  public signUp(data): Observable<any> {
    return this.httpClient.post<any>(this.signUpUrl, data);
  }

  public confirmAccount(data): Observable<any> {
    return this.httpClient.post<any>(this.confirmCodeUrl, data);
  }

  public resendPin(data): Observable<any> {
    return this.httpClient.post<any>(this.resendPinUrl, data);
  }
  
}
