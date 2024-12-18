import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { Observable } from 'rxjs';

import { UserEditComponent } from './user-edit.component';


@Injectable({
  providedIn: 'root'
})
export class UserEditGuard implements CanDeactivate<UserEditComponent> {
  canDeactivate(component: UserEditComponent): Observable<boolean> | Promise<boolean> | boolean {
    if (component.userForm.dirty) {
      const username = component?.userForm?.get('username')?.value || 'User';
      return confirm(`Do you want to leave without saving your changes?`);
    }
    return true;
  }
}
