import { Component, OnInit } from '@angular/core';
import { SplashScreen } from '@capacitor/splash-screen';
import { PixijsComponent } from './components/pixijs/pixijs.component';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: true,
    imports: [PixijsComponent],
})
export class AppComponent implements OnInit {
  ngOnInit(): void {
    void SplashScreen.hide();
  }
}
