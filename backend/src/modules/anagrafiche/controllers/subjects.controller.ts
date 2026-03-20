import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';
import { AnagraficheService } from '../anagrafiche.service';
import { ListSubjectsQueryDto } from '../dto/list-subjects-query.dto';

@Controller({
  path: 'subjects',
  version: '1',
})
export class SubjectsController {
  constructor(private readonly anagraficheService: AnagraficheService) {}

  @Get()
  listSubjects(@Query() query: ListSubjectsQueryDto) {
    return this.anagraficheService.listSubjects(query);
  }

  @Get('by-cuua/:cuua')
  getByCuua(@Param('cuua') cuua: string) {
    const subject = this.anagraficheService.getByCuua(cuua);

    if (!subject) {
      throw new NotFoundException(`Subject not found for CUUA ${cuua}`);
    }

    return subject;
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    const subject = this.anagraficheService.getById(id);

    if (!subject) {
      throw new NotFoundException(`Subject not found for id ${id}`);
    }

    return subject;
  }

  @Get(':id/history')
  getHistory(@Param('id') id: string) {
    const history = this.anagraficheService.getHistory(id);

    if (!history) {
      throw new NotFoundException(`Subject history not found for id ${id}`);
    }

    return history;
  }
}
