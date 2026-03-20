import { Injectable } from '@nestjs/common';
import { ListSubjectsQueryDto } from './dto/list-subjects-query.dto';
import { SubjectResponseDto } from './dto/subject-response.dto';

const SUBJECTS: SubjectResponseDto[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    cuua: 'RSSMRA80A01H501Z',
    status: 'active',
    confidenceScore: 98.5,
    currentDisplayName: 'Mario Rossi',
    identifiers: [
      {
        type: 'fiscal_code',
        value: 'RSSMRA80A01H501Z',
        sourceSystem: 'bootstrap',
      },
    ],
    nameHistory: [
      {
        displayName: 'Mario Rossi',
        sourceSystem: 'bootstrap',
        validFrom: '2026-03-20T00:00:00.000Z',
        validTo: null,
      },
    ],
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    cuua: '01234560953',
    status: 'active',
    confidenceScore: 93,
    currentDisplayName: 'Azienda Agricola Delta Srl',
    identifiers: [
      {
        type: 'vat_number',
        value: '01234560953',
        sourceSystem: 'bootstrap',
      },
    ],
    nameHistory: [
      {
        displayName: 'Azienda Agricola Delta Srl',
        sourceSystem: 'bootstrap',
        validFrom: '2026-03-20T00:00:00.000Z',
        validTo: null,
      },
    ],
  },
];

@Injectable()
export class AnagraficheService {
  getDomainBoundary() {
    return {
      module: 'anagrafiche',
      entity: 'master_subject',
      businessKey: 'CUUA',
    };
  }

  listSubjects(query: ListSubjectsQueryDto) {
    const normalizedQuery = query.q?.trim().toLowerCase();
    const filtered = normalizedQuery
      ? SUBJECTS.filter(
          (subject) =>
            subject.cuua.toLowerCase().includes(normalizedQuery) ||
            subject.currentDisplayName.toLowerCase().includes(normalizedQuery) ||
            subject.identifiers.some((identifier) =>
              identifier.value.toLowerCase().includes(normalizedQuery),
            ),
        )
      : SUBJECTS;

    const offset = (query.page - 1) * query.pageSize;
    const items = filtered.slice(offset, offset + query.pageSize);

    return {
      items,
      page: query.page,
      pageSize: query.pageSize,
      total: filtered.length,
    };
  }

  getById(id: string) {
    return SUBJECTS.find((subject) => subject.id === id) ?? null;
  }

  getByCuua(cuua: string) {
    return SUBJECTS.find((subject) => subject.cuua === cuua) ?? null;
  }

  getHistory(id: string) {
    const subject = this.getById(id);

    if (!subject) {
      return null;
    }

    return {
      subjectId: id,
      nameHistory: subject.nameHistory,
    };
  }
}
