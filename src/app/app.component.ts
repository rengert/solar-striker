import { Component } from '@angular/core';
import { PixijsComponent } from './components/pixijs/pixijs.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [PixijsComponent]
})
export class AppComponent {}
