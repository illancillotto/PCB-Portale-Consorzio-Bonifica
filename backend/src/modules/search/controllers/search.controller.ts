import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from '../search.service';
import { SearchQueryDto } from '../dto/search-query.dto';
import { SearchResultDto } from '../dto/search-result.dto';

@Controller({
  path: 'search',
  version: '1',
})
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  async search(@Query() query: SearchQueryDto): Promise<{ items: SearchResultDto[]; total: number }> {
    return this.searchService.search(query.q);
  }
}
