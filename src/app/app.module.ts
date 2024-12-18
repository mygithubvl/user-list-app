import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { AboutComponent } from './home/about.component';
import { UsersModule } from './users/users.module';

@NgModule({
  declarations: [
    AppComponent,
    AboutComponent
  ],
  bootstrap: [AppComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    RouterModule.forRoot([
      { path: 'about', component: AboutComponent },
      { path: '', redirectTo: 'about', pathMatch: 'full' },
      { path: '**', redirectTo: 'about', pathMatch: 'full' }
    ]),
    UsersModule
  ],
  
})
export class AppModule { }
