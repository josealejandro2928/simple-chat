import { ShowToastService } from './../show-toast.service';
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpHeaders,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

import { Router } from '@angular/router';

@Injectable()
export class ErrorInterceptorService implements HttpInterceptor {
  constructor(private router: Router, private showToast: ShowToastService) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = '';
        if (error.error instanceof ErrorEvent) {
          // client-side error
          errorMessage = `Error del lado del cliente: ${error.error.message}`;
          this.showToast.showError(errorMessage);
        } else {
          errorMessage = error.error;
          this.processingBackendError(error);
        }
        console.log('ErrorInterceptorService -> errorMessage', errorMessage);
        return throwError(errorMessage);
      })
    );
  }

  ///////////////////////Procesing Error////////////////////////////////
  processingBackendError(err) {
    this.errorHandle(err);
    if (err.status === 401) {
      localStorage.clear();
      this.router.navigate(['/signup']);
      return;
    }
    if (err.status === 403) {
      this.router.navigate(['/signup']);
      return;
    }
    /////////////////////////////ERRORES DECONEXION PERDIDA o NO RESPUESTA DEL API////////////////////
    if (err.status === 0) {
      this.showToast.showError('Conection failed');
      return;
    }
    if (!err.status && !err.error) {
      this.showToast.showError('Conection failed');
      return;
    }
    //////////////////////////////////////////////////////////////////////////////////////////////////
    return;
  }
  ///////////////////////////////////////////////////////

  errorHandle(error, nomenclator?, action?) {
    let alternative = nomenclator
      ? action
        ? 'Error ' + action + ' ' + nomenclator
        : 'Error ' + action
      : `Server response failed, check your connection to the network, or contact the administrators`;
    let msg = alternative;
    // console.log('ErrorInterceptorService -> errorHandle -> error', error);
    if (error.error && error.error.errors) {
      error = error.error;
      msg = error.message + '\n';

      msg =
        msg +
        error.errors.map((item, index) => {
          return ' ' + item.param + ' ' + item.msg + '\n';
        });
    }
    this.showToast.showError(msg, 6000);
  }
}
