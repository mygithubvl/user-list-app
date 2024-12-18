import { Component, OnInit } from '@angular/core';

import { UserService } from '../../services/user.service';
import { IUser } from '../../models/user.model';
import { Subscription } from 'rxjs';

@Component({
  standalone: false,
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {  

  _listFilter = '';
  get listFilter(): string {
    return this._listFilter;
  }
  set listFilter(value: string) {
    this._listFilter = value;
    this.filteredUsers = this.listFilter ? this.performFilter(this.listFilter) : this.users;
  }

  pageTitle = 'User List';
  errorMessage = '';
  
  private sub!: Subscription;
  selectedUser!: IUser | null;

  filteredUsers: IUser[] | null = [];
  users: IUser[] | null = [];


  constructor(private userService: UserService) { }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  onSelected(user: IUser): void {
    this.userService.changeSelectedUser(user);
  }

  ngOnInit(): void {

    this.sub = this.userService.currentUsers$.subscribe(
      users => this.users = users
    );

    this.sub = this.userService.selectedUserChanges$.subscribe(
      selectedUser => this.selectedUser = selectedUser
    );

    this.userService.getUsers().subscribe(
      (users: IUser[]) => {

        if (!this.users) {
          this.users = users;
        }
                
        if (this.selectedUser) {
          const foundIndex = users.findIndex( usr => usr.id === this.selectedUser?.id );
          if (foundIndex > -1) {
              const updatedUsr = { ...this.users[foundIndex], ...this.selectedUser };
              this.users.splice(foundIndex, 1, updatedUsr);
              // this.userService.changeSelectedUser(updatedUsr);
          }
        }        
        this.filteredUsers = this.users;
      },
      (error: any) => this.errorMessage = <any>error
    );
  }

  performFilter(filterBy: string): IUser[] {
    filterBy = filterBy.toLocaleLowerCase();
    return this.users!.filter((user: IUser) =>
    user.name?.toLocaleLowerCase().indexOf(filterBy) !== -1);
  }
}
