import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { SignupInfo } from '../objects';

@Injectable({
  providedIn: 'root'
})
export class AuthorizationService {

  redirectUrl: string;
  currentUser:string;

  constructor(private http: HttpClient) { }

  private endpointURL = 'https://hudzi27wa7.execute-api.us-east-1.amazonaws.com/dev/';

  get isLoggedIn():boolean{
    if(localStorage.getItem('currentUser')){
      return true
    }
    return !!this.currentUser;
  }

  logout():Observable<any>{
    this.currentUser = null;
    localStorage.removeItem('currentUser');
    localStorage.removeItem('accessToken');
    let refreshToken = localStorage.getItem('refreshToken');
    console.log(refreshToken)
    localStorage.removeItem('refreshToken');
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    let refreshTokenObject = {refreshToken: refreshToken.toString()}
    console.log('Refresh Token:')
    console.log(refreshTokenObject)
    console.log('Calling logout...')
    return this.http.post<any>(this.endpointURL + 'logout', refreshTokenObject, { headers })
    .pipe(
      tap(data => {
        console.log('response: ' + JSON.stringify(data))
      }),
      catchError(this.handleError)
    );

  }

  persistLoginInfo(data){
    localStorage.setItem('currentUser',data["user"]);
    localStorage.setItem('accessToken',data["accessToken"]);
    localStorage.setItem('refreshToken',data["refreshToken"]);
  }

  getToken(){
    return localStorage.getItem('accessToken');
  }

  signup(signupInfo: SignupInfo): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<SignupInfo>(this.endpointURL + 'signup', signupInfo, { headers })
      .pipe(
        tap(data => console.log('response: ' + JSON.stringify(data))),
        catchError(this.handleError)
      );
  }

  login(signupInfo: SignupInfo): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<SignupInfo>(this.endpointURL +'login', signupInfo, { headers })
      .pipe(
        tap(data => console.log('response: ' + JSON.stringify(data))),
        tap(data => this.currentUser=data["user"]),
        tap(data => this.persistLoginInfo(data)),
        catchError(this.handleError)
      );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.log(error); // log to console instead
      this.log(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }

  private log(message: string) {
    //this.messageService.add(`HeroService: ${message}`);
    console.log(message);
  }

}
