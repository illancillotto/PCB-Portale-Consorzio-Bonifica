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
  async listSubjects(@Query() query: ListSubjectsQueryDto) {
    return this.anagraficheService.listSubjects(query);
  }

  @Get('by-cuua/:cuua')
  async getByCuua(@Param('cuua') cuua: string) {
    const subject = await this.anagraficheService.getByCuua(cuua);

    if (!subject) {
      throw new NotFoundException(`Subject not found for CUUA ${cuua}`);
    }

    return subject;
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const subject = await this.anagraficheService.getById(id);

    if (!subject) {
      throw new NotFoundException(`Subject not found for id ${id}`);
    }

    return subject;
  }

  @Get(':id/history')
  async getHistory(@Param('id') id: string) {
    const history = await this.anagraficheService.getHistory(id);

    if (!history) {
      throw new NotFoundException(`Subject history not found for id ${id}`);
    }

    return history;
  }

  @Get(':id/parcels')
  async getParcels(@Param('id') id: string) {
    const parcels = await this.anagraficheService.getParcels(id);

    if (!parcels) {
      throw new NotFoundException(`Subject parcels not found for id ${id}`);
    }

    return {
      subjectId: id,
      parcels,
    };
  }
}
