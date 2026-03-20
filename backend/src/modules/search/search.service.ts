import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../core/database/database.service';
import { SearchResultDto } from './dto/search-result.dto';

interface SubjectSearchRow {
  id: string;
  cuua: string;
  display_name: string | null;
}

interface ParcelSearchRow {
  id: string;
  comune: string;
  foglio: string;
  particella: string;
  subalterno: string | null;
}

@Injectable()
export class SearchService {
  constructor(private readonly databaseService: DatabaseService) {}

  getSearchScopes() {
    return ['cuua', 'display_name', 'fiscal_code', 'vat_number', 'external_identifier', 'parcel_reference'];
  }

  async search(term: string): Promise<{ items: SearchResultDto[]; total: number }> {
    const normalizedTerm = `%${term.trim().toLowerCase()}%`;

    const [subjectsResult, parcelsResult] = await Promise.all([
      this.databaseService.query<SubjectSearchRow>(
        `
          SELECT
            ms.id,
            ms.cuua,
            current_name.display_name
          FROM anagrafe.master_subject ms
          LEFT JOIN LATERAL (
            SELECT snh.display_name
            FROM anagrafe.subject_name_history snh
            WHERE snh.subject_id = ms.id
            ORDER BY snh.valid_from DESC NULLS LAST, snh.created_at DESC
            LIMIT 1
          ) current_name ON true
          WHERE lower(ms.cuua) LIKE $1
             OR lower(COALESCE(current_name.display_name, '')) LIKE $1
             OR EXISTS (
               SELECT 1
               FROM anagrafe.subject_identifier si
               WHERE si.subject_id = ms.id
                 AND lower(si.identifier_value) LIKE $1
             )
          ORDER BY current_name.display_name NULLS LAST, ms.cuua
          LIMIT 10
        `,
        [normalizedTerm],
      ),
      this.databaseService.query<ParcelSearchRow>(
        `
          SELECT id, comune, foglio, particella, subalterno
          FROM catasto.parcel
          WHERE lower(comune) LIKE $1
             OR lower(foglio) LIKE $1
             OR lower(particella) LIKE $1
             OR lower(COALESCE(subalterno, '')) LIKE $1
             OR lower(comune || ' ' || foglio || ' ' || particella || ' ' || COALESCE(subalterno, '')) LIKE $1
          ORDER BY comune, foglio, particella
          LIMIT 10
        `,
        [normalizedTerm],
      ),
    ]);

    const subjectItems: SearchResultDto[] = subjectsResult.rows.map((row) => ({
      type: 'subject',
      id: row.id,
      title: row.display_name ?? row.cuua,
      subtitle: `CUUA ${row.cuua}`,
      route: `/subjects/${row.id}`,
    }));

    const parcelItems: SearchResultDto[] = parcelsResult.rows.map((row) => ({
      type: 'parcel',
      id: row.id,
      title: `${row.comune} · foglio ${row.foglio} · particella ${row.particella}`,
      subtitle: row.subalterno ? `Subalterno ${row.subalterno}` : 'Senza subalterno',
      route: `/parcels/${row.id}`,
    }));

    const items = [...subjectItems, ...parcelItems];

    return {
      items,
      total: items.length,
    };
  }
}
