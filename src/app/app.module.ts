import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { NavMenuComponent } from './nav-menu/nav-menu.component';
import { ProcessComponent } from './process/process.component';
import { SpinnerComponent } from './spinner/spinner.component';

@NgModule({
  declarations: [			
    AppComponent,
      NavMenuComponent,
      ProcessComponent,
      SpinnerComponent
   ],
  imports: [
    BrowserModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
