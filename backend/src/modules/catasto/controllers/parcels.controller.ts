import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { CatastoService } from '../catasto.service';
import { ParcelResponseDto } from '../dto/parcel-response.dto';

@Controller({
  path: 'parcels',
  version: '1',
})
export class ParcelsController {
  constructor(private readonly catastoService: CatastoService) {}

  @Get()
  async listParcels(): Promise<{ items: ParcelResponseDto[]; total: number }> {
    return this.catastoService.listParcels();
  }

  @Get(':id')
  async getParcelById(@Param('id') id: string): Promise<ParcelResponseDto> {
    const parcel = await this.catastoService.getParcelById(id);

    if (!parcel) {
      throw new NotFoundException(`Parcel not found for id ${id}`);
    }

    return parcel;
  }

  @Get(':id/subjects')
  async getParcelSubjects(@Param('id') id: string): Promise<{ parcelId: string; subjects: ParcelResponseDto['subjects'] }> {
    const subjects = await this.catastoService.getParcelSubjects(id);

    if (!subjects) {
      throw new NotFoundException(`Parcel subjects not found for id ${id}`);
    }

    return {
      parcelId: id,
      subjects,
    };
  }
}
