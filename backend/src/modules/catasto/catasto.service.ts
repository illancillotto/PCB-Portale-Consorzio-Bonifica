import { Injectable } from '@nestjs/common';

@Injectable()
export class CatastoService {
  getPrimaryEntities() {
    return ['parcel', 'subject_parcel_relation'];
  }
}
