import { Injectable } from '@nestjs/common';

@Injectable()
export class SearchService {
  getSearchScopes() {
    return ['cuua', 'display_name', 'fiscal_code', 'vat_number', 'external_identifier', 'parcel_reference'];
  }
}
