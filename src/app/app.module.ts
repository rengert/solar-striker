import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { PixijsComponent } from './components/pixijs/pixijs.component';

@NgModule({
  declarations: [
    AppComponent,
    PixijsComponent,
  ],
  imports: [BrowserModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {
}
