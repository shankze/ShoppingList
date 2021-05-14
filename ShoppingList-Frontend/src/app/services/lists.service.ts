import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { ListItem, ShoppingList, ShoppingLists } from '../objects';

@Injectable({
  providedIn: 'root'
})
export class ListsService {

  constructor(private http:HttpClient) { }

  private endpointURL = 'https://hudzi27wa7.execute-api.us-east-1.amazonaws.com/dev/';

  shareList(email,listId):Observable<any>{
    let userName = localStorage.getItem('currentUser');
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(this.endpointURL + 'sharelist', {email,listId}, { headers })
    .pipe(
      tap(data => console.log('response: ' + JSON.stringify(data))),
      catchError(this.handleError)
    );
  }

  getListItems():Observable<ShoppingList[]>{
    let userName = localStorage.getItem('currentUser');
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<ShoppingList[]>(this.endpointURL + 'items', userName, { headers })
    .pipe(
      tap(data => console.log('response: ' + JSON.stringify(data))),
      catchError(this.handleError)
    );
  }

  addItemToList(newItem,listId):Observable<ShoppingList[]>{
    let userName = localStorage.getItem('currentUser');
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<ShoppingList[]>(this.endpointURL + 'additem', {listId,item:newItem}, { headers })
    .pipe(
      tap(data => console.log('response: ' + JSON.stringify(data))),
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
    console.log(message);
  }

}
