import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { Roles } from '../../auth/decorators/roles.decorator';
import { KeycloakAuthGuard } from '../../auth/guards/keycloak-auth.guard';
import { KeycloakRolesGuard } from '../../auth/guards/keycloak-roles.guard';
import { SearchService } from '../search.service';
import { SearchQueryDto } from '../dto/search-query.dto';
import { SearchResultDto } from '../dto/search-result.dto';

@Controller({
  path: 'search',
  version: '1',
})
@UseGuards(KeycloakAuthGuard, KeycloakRolesGuard)
@Roles('pcb-operator')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  async search(@Query() query: SearchQueryDto): Promise<{ items: SearchResultDto[]; total: number }> {
    return this.searchService.search(query.q);
  }
}
