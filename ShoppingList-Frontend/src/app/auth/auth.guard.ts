import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthorizationService } from '../services/authorization.service';
//import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  
  constructor(private authService:AuthorizationService, private router: Router){}
  
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): true|UrlTree {
    console.log('AuthGuard#canActivate called');
    const url:string = state.url;
    
    return this.checkLogin(url);
  }

  checkLogin(url:string): true|UrlTree{
    if (this.authService.currentUser){
      console.log('Authguard Allow from Service');
      return true;
    }
    if(localStorage.getItem('currentUser')){
      console.log('Authguard Allow from Local Storage');
      return true;
    }
    this.authService.redirectUrl = url;
    console.log('Authguard Deny');
    return this.router.parseUrl('/login');
  }  
}
