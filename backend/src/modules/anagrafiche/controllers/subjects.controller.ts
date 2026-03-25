import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { Roles } from '../../auth/decorators/roles.decorator';
import { KeycloakAuthGuard } from '../../auth/guards/keycloak-auth.guard';
import { KeycloakRolesGuard } from '../../auth/guards/keycloak-roles.guard';
import { PcbDomainException } from '../../core/errors/pcb-domain.exception';
import { AnagraficheService } from '../anagrafiche.service';
import { ListSubjectsQueryDto } from '../dto/list-subjects-query.dto';

@Controller({
  path: 'subjects',
  version: '1',
})
@UseGuards(KeycloakAuthGuard, KeycloakRolesGuard)
@Roles('pcb-operator')
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
      throw PcbDomainException.notFound(
        'anagrafiche.subject_not_found_by_cuua',
        `Subject not found for CUUA ${cuua}`,
        { cuua },
      );
    }

    return subject;
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const subject = await this.anagraficheService.getById(id);

    if (!subject) {
      throw PcbDomainException.notFound(
        'anagrafiche.subject_not_found',
        `Subject not found for id ${id}`,
        { subjectId: id },
      );
    }

    return subject;
  }

  @Get(':id/history')
  async getHistory(@Param('id') id: string) {
    const history = await this.anagraficheService.getHistory(id);

    if (!history) {
      throw PcbDomainException.notFound(
        'anagrafiche.subject_history_not_found',
        `Subject history not found for id ${id}`,
        { subjectId: id },
      );
    }

    return history;
  }

  @Get(':id/parcels')
  async getParcels(@Param('id') id: string) {
    const parcels = await this.anagraficheService.getParcels(id);

    if (!parcels) {
      throw PcbDomainException.notFound(
        'anagrafiche.subject_parcels_not_found',
        `Subject parcels not found for id ${id}`,
        { subjectId: id },
      );
    }

    return {
      subjectId: id,
      parcels,
    };
  }
}
