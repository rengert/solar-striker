import { inject } from '@angular/core';
import { ApplicationService } from './application.service';
import { ObjectService } from './object.service';

export abstract class BaseService {
  protected readonly application = inject(ApplicationService);
  protected readonly object = inject(ObjectService);
}
