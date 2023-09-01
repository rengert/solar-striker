import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { HomeScreenComponent } from './components/home-screen/home-screen.component';
import { PixijsComponent } from './components/pixijs/pixijs.component';

const routes: Routes = [
  {
    path: '',
    component: HomeScreenComponent,
  },
  {
    path: 'game',
    component: PixijsComponent,
  },
];

@NgModule({
  declarations: [
    AppComponent,
    HomeScreenComponent,
    PixijsComponent,
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes, {}),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {
}
