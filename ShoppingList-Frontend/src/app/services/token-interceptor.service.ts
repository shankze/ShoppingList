import { Injectable, Injector } from '@angular/core';
import { HttpInterceptor, HttpEvent, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthorizationService } from './authorization.service';



@Injectable({
  providedIn: 'root'
})
export class TokenInterceptorService  implements HttpInterceptor{

  constructor(private injector: Injector) { }

  intercept(req, next) {
    let authService = this.injector.get(AuthorizationService)

    let tokenizedReq = req.clone({
      setHeaders:{
        Authorization: `Bearer ${authService.getToken()}`
      } 
    })
    console.log('------CALLED------')
    return next.handle(tokenizedReq)
  }
}
