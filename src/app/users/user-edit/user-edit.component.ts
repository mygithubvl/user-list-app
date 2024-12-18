import { Component, OnInit, AfterViewInit, OnDestroy, ViewChildren, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, FormArray, Validators, FormControlName } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Observable, Subscription, fromEvent, merge } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import { GenericValidator } from '../../shared/generic-validator';
import { IUser } from '../../models/user.model';
import { UserService } from '../../services/user.service';
// import { IUser } from 'src/app/models/user.model';
// import { UserService } from 'src/app/services/user.service';

@Component({
  standalone: false,
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.css']
})
export class UserEditComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChildren(FormControlName, { read: ElementRef }) formInputElements!: ElementRef[];

  pageTitle = 'User Edit';
  errorMessage!: string;
  userForm!: FormGroup;

  user!: IUser;
  private sub!: Subscription;
  readyUpdate!: boolean;

  displayMessage: { [key: string]: string } = {};
  private validationMessages: { [key: string]: { [key: string]: string } };
  private genericValidator: GenericValidator;
  

  
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService ) {

    this.validationMessages = {
      name: {
        required:  'Name is required.'
      },
      username: {
        required:  'Username is required.',
        minlength: 'Username must be at least three characters.',
        maxlength: 'Username cannot exceed 50 characters.'
      },
      email: {
        required:  'Email is required.',
      }
    };
    this.genericValidator = new GenericValidator(this.validationMessages);
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  ngOnInit(): void {
    
    this.userForm = this.fb.group({
      name: ['', [Validators.required]],
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      email: ['', Validators.required],
      phone: '',
      website: ''
    });

    this.sub = this.route.paramMap.subscribe(
      (params: any) => {
        const id = +params.get('id');
        this.getUser(id);
      }
    );
  }  

  ngAfterViewInit(): void {

    const controlBlurs: Observable<any>[] = 
      this.formInputElements.map(
        (formControl: ElementRef) => fromEvent(formControl.nativeElement, 'blur'));

    merge(this.userForm.valueChanges, ...controlBlurs).pipe( debounceTime(900))
      .subscribe(value => {
        this.displayMessage = this.genericValidator.processMessages(this.userForm);
      });
  } 

  getUser(id: number): void {
    this.userService.getUser(id)
      .subscribe(
        (user: IUser) => this.displayUser(user),
        (error: any) => this.errorMessage = <any>error
      );
  }

  displayUser(user: IUser): void {
    if (this.userForm) {
      this.userForm.reset();
    }
    this.user = user;

    if (this.user.id === 0) {
      this.pageTitle = 'Add user';
    } else {
      this.pageTitle = `Edit user: ${this.user.name}`;
    }

    this.userForm.patchValue({
      name: this.user.name,
      username: this.user.username,
      email: this.user.email,
      phone: this.user.phone,
      website: this.user.website
    });

    console.dir(`in displayUser userForm: ${this.userForm}`);
  }

  deleteUser(): void {
    if (this.user.id === 0) {
      // if never saved, do not delete
      this.onSaveComplete();
    } else {
      if (confirm(`Confirm delete this user: ${this.user.name}?`)) {
        this.userService.deleteUser(this.user.id)
          .subscribe(
            () => this.onSaveComplete(),
            (error: any) => this.errorMessage = <any>error
          );
      }
    }
  }

  saveUser(): void {
    this.readyUpdate = true;    
  }

  onConfirmUpdate() {

    if (this.userForm.valid) {
      if (this.userForm.dirty) {
        const usr = { ...this.user, ...this.userForm.value };

        if (usr.id === 0) {
          this.userService.createUser(usr)
            .subscribe(
              () => this.onSaveComplete(),
              (error: any) => this.errorMessage = <any>error
            );
        } 
        else {
          this.userService.updateUser(usr)
            .subscribe(
              () => this.onSaveComplete(),
              (error: any) => this.errorMessage = <any>error
            );
        }
      } 
      else {
        this.onSaveComplete();
      }
    } else {
      this.errorMessage = 'Please address all validation errors.';
    }
  }

  onSaveComplete(): void {
    console.log('Save: ' + JSON.stringify(this.userForm.value));

    this.readyUpdate = false;
    this.userForm.reset();
    this.router.navigate(['/users']);
  }
}
