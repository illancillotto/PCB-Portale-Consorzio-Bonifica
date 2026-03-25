import { PcbDomainException } from '../errors/pcb-domain.exception';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function ensureUuidFilter(
  value: string | undefined,
  input: {
    fieldName: string;
    errorCode: string;
    message: string;
  },
) {
  if (!value) {
    return;
  }

  if (!UUID_PATTERN.test(value)) {
    throw PcbDomainException.badRequest(input.errorCode, input.message, {
      [input.fieldName]: value,
    });
  }
}

export function ensureUuidFilters(
  values: string[],
  input: {
    fieldName: string;
    errorCode: string;
    message: string;
  },
) {
  for (const value of values) {
    ensureUuidFilter(value, input);
  }
}
