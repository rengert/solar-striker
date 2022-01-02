import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  constructor() {
  }

  get sound(): boolean {
    return false;
  }
}
