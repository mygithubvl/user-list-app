import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

// import { IUser } from 'src/app/models/user.model';
// import { UserService } from 'src/app/services/user.service';
import { Subscription } from 'rxjs';
import { IUser } from '../../models/user.model';
import { UserService } from '../../services/user.service';


@Component({
  standalone: false,
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.css']
})
export class UserDetailComponent implements OnInit {
  
  pageTitle = 'User Detail';
  errorMessage = '';
  
  // user: IUser | undefined;
  user!: IUser | null;
  sub!: Subscription;

  constructor(private route: ActivatedRoute,
    private router: Router,
    private userService: UserService) {
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  ngOnInit() {

    this.sub = this.userService.selectedUserChanges$.subscribe(
      selectedUser => this.user = selectedUser
    );

    const param = this.route.snapshot.paramMap.get('id');
    if (param) {
      const id = +param;
      this.getUser(id);
    }
  }

  getUser(id: number) {
    this.userService.getUser(id).subscribe(
      user => this.user = user,
      error => this.errorMessage = <any>error);
  }

  onClickBack(): void {
    this.router.navigate(['/users']);
  }

}
