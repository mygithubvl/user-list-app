import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, of, throwError, BehaviorSubject, from, asyncScheduler } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';

import { IUser } from '../models/user.model';


@Injectable({
  providedIn: 'root'
})
export class UserService {
    
  // private usersUrl = 'api/users';
  private usersUrl = 'https://jsonplaceholder.typicode.com/users';
  private usersLimit = '?_limit=5';
  private users!: IUser[];
  
  private currentUsersBSubject = new BehaviorSubject<IUser[] | null>(null);
    currentUsers$ = this.currentUsersBSubject.asObservable();
  
  private selectedUserBSubject = new BehaviorSubject<IUser | null>(null);
    selectedUserChanges$ = this.selectedUserBSubject.asObservable();
  
    
  constructor(private http: HttpClient) { }

  changeSelectedUser(selectedUser: IUser | null): void {
    this.selectedUserBSubject.next(selectedUser);
  }

  populateCurrentUsers(currentUsers: IUser[] | null): void {
    this.currentUsersBSubject.next(currentUsers);
  }

  getUsers(): Observable<IUser[]> {
    
    return this.http.get<IUser[]>(`${this.usersUrl}${this.usersLimit}`)
      .pipe(
        tap( userData => console.log(JSON.stringify(userData))),
        tap( userData => {
            if (this.users && this.users.length > 0) {
              this.populateCurrentUsers(this.users);
            } else {
              this.users = userData;
            }
        }),
        catchError(this.handleError)
      );
  }

  getUser(id: number): Observable<IUser> {
    if (id === 0) {
      return of(this.initUser());
    }
    const url = `${this.usersUrl}/${id}`;
    return this.http.get<IUser>(url)
      .pipe(
        tap( userData => console.log('getUser: ' + JSON.stringify(userData))),
        catchError(this.handleError)
      );
  }  

  updateUser(user: IUser): Observable<IUser> {

    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const url = `${this.usersUrl}/${user.id}`;

    return this.http.put<IUser>(url, user, { headers: headers })
      .pipe(
        tap(() => console.log('updateUser: ' + user.id)),
        tap(userData => {
          const foundIndex = this.users.findIndex( usr => usr.id === user.id );
          if (foundIndex > -1) {
              const updatedUsr = { ...this.users[foundIndex], ...user };
              updatedUsr.updated = true;
              this.users.splice(foundIndex, 1, updatedUsr);
              this.changeSelectedUser(updatedUsr);
          }
        }),
        map(() => user),
        catchError(this.handleError)
      );
  }

  deleteUser(id: number | null): Observable<{}> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const url = `${this.usersUrl}/${id}`;
    return this.http.delete<IUser>(url, { headers: headers })
      .pipe(
        tap(userData => console.log('Deleting user: ' + id)),
        tap(userData => {
          const foundIndex = this.users.findIndex( usr => usr.id === id );
          if (foundIndex > -1) {
              this.users.splice(foundIndex, 1);
              this.changeSelectedUser(null);
          }
        }),
        catchError(this.handleError)
      );
  }

  createUser(user: IUser): Observable<IUser> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    user.id = null;
    return this.http.post<IUser>(this.usersUrl, user, { headers: headers })
      .pipe(
        tap(userData => console.log('In createUser() : ' + JSON.stringify(userData))),
        tap(userData => {
          this.users.push(userData);
          this.changeSelectedUser(userData);
        }),
        catchError(this.handleError)
      );
  }

  private handleError(err: any) {
    // in a real world app, we may send the server to some remote logging infrastructure
    // instead of just logging it to the console
    let errorMessage: string;
    if (err.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      errorMessage = `An error occurred: ${err.error.message}`;
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      errorMessage = `Backend returned code ${err.status}: ${err.body.error}`;
    }
    // console.error(err);
    return throwError(errorMessage);
  }

  private initUser(): IUser {
    return {
      id: 0,
      name: null,
      username: null,
      email: null
    };
  }
}
