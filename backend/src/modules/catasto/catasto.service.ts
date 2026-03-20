import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../core/database/database.service';
import { ParcelResponseDto } from './dto/parcel-response.dto';

interface ParcelRow {
  id: string;
  comune: string;
  foglio: string;
  particella: string;
  subalterno: string | null;
  source_system: string;
}

interface ParcelSubjectRow {
  subject_id: string;
  cuua: string;
  display_name: string | null;
  relation_type: string;
  title: string | null;
  quota: number | string | null;
}

@Injectable()
export class CatastoService {
  constructor(private readonly databaseService: DatabaseService) {}

  getPrimaryEntities() {
    return ['parcel', 'subject_parcel_relation'];
  }

  async listParcels() {
    const result = await this.databaseService.query<ParcelRow>(
      `
        SELECT id, comune, foglio, particella, subalterno, source_system
        FROM catasto.parcel
        ORDER BY comune, foglio, particella, subalterno NULLS FIRST
      `,
    );

    const items = await Promise.all(result.rows.map((parcel) => this.buildParcelResponse(parcel)));

    return {
      items,
      total: items.length,
    };
  }

  async getParcelById(id: string) {
    const result = await this.databaseService.query<ParcelRow>(
      `
        SELECT id, comune, foglio, particella, subalterno, source_system
        FROM catasto.parcel
        WHERE id = $1
      `,
      [id],
    );

    const parcel = result.rows[0];

    if (!parcel) {
      return null;
    }

    return this.buildParcelResponse(parcel);
  }

  async getParcelSubjects(id: string) {
    const parcel = await this.getParcelById(id);

    if (!parcel) {
      return null;
    }

    return parcel.subjects;
  }

  private async buildParcelResponse(parcel: ParcelRow): Promise<ParcelResponseDto> {
    const subjectsResult = await this.databaseService.query<ParcelSubjectRow>(
      `
        SELECT
          spr.subject_id,
          ms.cuua,
          current_name.display_name,
          spr.relation_type,
          spr.title,
          spr.quota
        FROM catasto.subject_parcel_relation spr
        INNER JOIN anagrafe.master_subject ms
          ON ms.id = spr.subject_id
        LEFT JOIN LATERAL (
          SELECT snh.display_name
          FROM anagrafe.subject_name_history snh
          WHERE snh.subject_id = ms.id
          ORDER BY snh.valid_from DESC NULLS LAST, snh.created_at DESC
          LIMIT 1
        ) current_name ON true
        WHERE spr.parcel_id = $1
        ORDER BY current_name.display_name NULLS LAST, ms.cuua
      `,
      [parcel.id],
    );

    return {
      id: parcel.id,
      comune: parcel.comune,
      foglio: parcel.foglio,
      particella: parcel.particella,
      subalterno: parcel.subalterno,
      sourceSystem: parcel.source_system,
      subjects: subjectsResult.rows.map((subject) => ({
        subjectId: subject.subject_id,
        cuua: subject.cuua,
        displayName: subject.display_name ?? subject.cuua,
        relationType: subject.relation_type,
        title: subject.title,
        quota: subject.quota !== null ? Number(subject.quota) : null,
      })),
    };
  }
}
