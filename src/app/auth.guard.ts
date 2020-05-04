import { LoggedInUserService } from './core/services/logged-in-user.service';
import { Injectable } from '@angular/core';
import {
  CanActivate,
  CanLoad,
  Route,
  UrlSegment,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router,
} from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate, CanLoad {
  constructor(
    private router: Router,
    private loggedInService: LoggedInUserService
  ) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    return this.loggedInService
      .getToken()
      .then((token) => {
        if (!token || token == '') {
          this.router.navigate(['/signup']);
          return false;
        } else {
          return true;
        }
      })
      .catch(() => {
        this.router.navigate(['/signup']);
        return false;
      });
  }
  canLoad(
    route: Route,
    segments: UrlSegment[]
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.loggedInService
      .getToken()
      .then((token) => {
        if (!token || token == '') {
          this.router.navigate(['/signup']);
          return false;
        } else {
          return true;
        }
      })
      .catch(() => {
        this.router.navigate(['/signup']);
        return false;
      });
  }
}
