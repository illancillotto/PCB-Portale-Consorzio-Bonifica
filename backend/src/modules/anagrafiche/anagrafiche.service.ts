import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../core/database/database.service';
import { ListSubjectsQueryDto } from './dto/list-subjects-query.dto';
import { SubjectParcelResponseDto } from './dto/subject-parcel-response.dto';
import { SubjectResponseDto } from './dto/subject-response.dto';

interface SubjectRow {
  id: string;
  cuua: string;
  status: string;
  confidence_score: number | string;
  current_display_name: string | null;
}

interface SubjectIdentifierRow {
  identifier_type: string;
  identifier_value: string;
  source_system: string;
}

interface SubjectNameHistoryRow {
  display_name: string;
  source_system: string;
  valid_from: Date | string | null;
  valid_to: Date | string | null;
}

interface SubjectParcelRow {
  parcel_id: string;
  comune: string;
  foglio: string;
  particella: string;
  subalterno: string | null;
  relation_type: string;
  title: string | null;
  quota: number | string | null;
}

@Injectable()
export class AnagraficheService {
  constructor(private readonly databaseService: DatabaseService) {}

  getDomainBoundary() {
    return {
      module: 'anagrafiche',
      entity: 'master_subject',
      businessKey: 'CUUA',
    };
  }

  async listSubjects(query: ListSubjectsQueryDto) {
    const offset = (query.page - 1) * query.pageSize;
    const searchTerm = query.q?.trim() ? `%${query.q.trim().toLowerCase()}%` : null;
    const filters = searchTerm
      ? [
          `WHERE lower(ms.cuua) LIKE $1
          OR lower(COALESCE(current_name.display_name, '')) LIKE $1
          OR EXISTS (
            SELECT 1
            FROM anagrafe.subject_identifier si
            WHERE si.subject_id = ms.id
              AND lower(si.identifier_value) LIKE $1
          )`,
        ]
      : [];
    const values: unknown[] = [];

    if (searchTerm) {
      values.push(searchTerm);
    }

    values.push(query.pageSize, offset);

    const pageSizeParam = searchTerm ? '$2' : '$1';
    const offsetParam = searchTerm ? '$3' : '$2';

    const subjectsResult = await this.databaseService.query<SubjectRow>(
      `
        SELECT
          ms.id,
          ms.cuua,
          ms.status,
          ms.confidence_score,
          current_name.display_name AS current_display_name
        FROM anagrafe.master_subject ms
        LEFT JOIN LATERAL (
          SELECT snh.display_name
          FROM anagrafe.subject_name_history snh
          WHERE snh.subject_id = ms.id
          ORDER BY snh.valid_from DESC NULLS LAST, snh.created_at DESC
          LIMIT 1
        ) current_name ON true
        ${filters.join('\n')}
        ORDER BY ms.created_at DESC
        LIMIT ${pageSizeParam}
        OFFSET ${offsetParam}
      `,
      values,
    );

    const countResult = await this.databaseService.query<{ total: string }>(
      `
        SELECT COUNT(*)::text AS total
        FROM anagrafe.master_subject ms
        LEFT JOIN LATERAL (
          SELECT snh.display_name
          FROM anagrafe.subject_name_history snh
          WHERE snh.subject_id = ms.id
          ORDER BY snh.valid_from DESC NULLS LAST, snh.created_at DESC
          LIMIT 1
        ) current_name ON true
        ${filters.join('\n')}
      `,
      searchTerm ? [searchTerm] : [],
    );

    const items = await Promise.all(
      subjectsResult.rows.map((subject) => this.buildSubjectResponse(subject)),
    );

    return {
      items,
      page: query.page,
      pageSize: query.pageSize,
      total: Number(countResult.rows[0]?.total ?? 0),
    };
  }

  async getById(id: string) {
    const result = await this.databaseService.query<SubjectRow>(
      `
        SELECT
          ms.id,
          ms.cuua,
          ms.status,
          ms.confidence_score,
          current_name.display_name AS current_display_name
        FROM anagrafe.master_subject ms
        LEFT JOIN LATERAL (
          SELECT snh.display_name
          FROM anagrafe.subject_name_history snh
          WHERE snh.subject_id = ms.id
          ORDER BY snh.valid_from DESC NULLS LAST, snh.created_at DESC
          LIMIT 1
        ) current_name ON true
        WHERE ms.id = $1
      `,
      [id],
    );

    const subject = result.rows[0];

    if (!subject) {
      return null;
    }

    return this.buildSubjectResponse(subject);
  }

  async getByCuua(cuua: string) {
    const result = await this.databaseService.query<SubjectRow>(
      `
        SELECT
          ms.id,
          ms.cuua,
          ms.status,
          ms.confidence_score,
          current_name.display_name AS current_display_name
        FROM anagrafe.master_subject ms
        LEFT JOIN LATERAL (
          SELECT snh.display_name
          FROM anagrafe.subject_name_history snh
          WHERE snh.subject_id = ms.id
          ORDER BY snh.valid_from DESC NULLS LAST, snh.created_at DESC
          LIMIT 1
        ) current_name ON true
        WHERE ms.cuua = $1
      `,
      [cuua],
    );

    const subject = result.rows[0];

    if (!subject) {
      return null;
    }

    return this.buildSubjectResponse(subject);
  }

  async getHistory(id: string) {
    const subject = await this.getById(id);

    if (!subject) {
      return null;
    }

    return {
      subjectId: id,
      nameHistory: subject.nameHistory,
    };
  }

  async getParcels(id: string): Promise<SubjectParcelResponseDto[] | null> {
    const subject = await this.getById(id);

    if (!subject) {
      return null;
    }

    const parcelsResult = await this.databaseService.query<SubjectParcelRow>(
      `
        SELECT
          spr.parcel_id,
          p.comune,
          p.foglio,
          p.particella,
          p.subalterno,
          spr.relation_type,
          spr.title,
          spr.quota
        FROM catasto.subject_parcel_relation spr
        INNER JOIN catasto.parcel p
          ON p.id = spr.parcel_id
        WHERE spr.subject_id = $1
        ORDER BY p.comune, p.foglio, p.particella, p.subalterno NULLS FIRST
      `,
      [id],
    );

    return parcelsResult.rows.map((parcel) => ({
      parcelId: parcel.parcel_id,
      comune: parcel.comune,
      foglio: parcel.foglio,
      particella: parcel.particella,
      subalterno: parcel.subalterno,
      relationType: parcel.relation_type,
      title: parcel.title,
      quota: parcel.quota !== null ? Number(parcel.quota) : null,
    }));
  }

  private async buildSubjectResponse(subject: SubjectRow): Promise<SubjectResponseDto> {
    const [identifiersResult, historyResult] = await Promise.all([
      this.databaseService.query<SubjectIdentifierRow>(
        `
          SELECT identifier_type, identifier_value, source_system
          FROM anagrafe.subject_identifier
          WHERE subject_id = $1
          ORDER BY created_at DESC
        `,
        [subject.id],
      ),
      this.databaseService.query<SubjectNameHistoryRow>(
        `
          SELECT display_name, source_system, valid_from, valid_to
          FROM anagrafe.subject_name_history
          WHERE subject_id = $1
          ORDER BY valid_from DESC NULLS LAST, created_at DESC
        `,
        [subject.id],
      ),
    ]);

    return {
      id: subject.id,
      cuua: subject.cuua,
      status: subject.status,
      confidenceScore: Number(subject.confidence_score),
      currentDisplayName: subject.current_display_name ?? subject.cuua,
      identifiers: identifiersResult.rows.map((identifier) => ({
        type: identifier.identifier_type,
        value: identifier.identifier_value,
        sourceSystem: identifier.source_system,
      })),
      nameHistory: historyResult.rows.map((history) => ({
        displayName: history.display_name,
        sourceSystem: history.source_system,
        validFrom: history.valid_from ? new Date(history.valid_from).toISOString() : '',
        validTo: history.valid_to ? new Date(history.valid_to).toISOString() : null,
      })),
    };
  }
}
