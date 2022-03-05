import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  get sound(): boolean {
    return false;
  }
}
