import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from '../shared/shared.module';

//import { UsersDB } from './user-data';

import { UserListComponent } from '../users/user-list/user-list.component';
import { UserDetailComponent } from './user-details/user-detail.component';
import { UserEditGuard } from './user-edit/user-edit.guard';
import { UserEditComponent } from './user-edit/user-edit.component';

@NgModule({
  imports: [
    SharedModule,
    ReactiveFormsModule,
    RouterModule.forChild([
      { path: 'users', component: UserListComponent },
      { path: 'users/:id', component: UserDetailComponent },
      
      {
        path: 'users/:id/edit',
        canDeactivate: [UserEditGuard],
        component: UserEditComponent
      }
    ])
  ],
  declarations: [
    UserListComponent,
    UserDetailComponent,
    UserEditComponent
  ]
})
export class UsersModule { }
