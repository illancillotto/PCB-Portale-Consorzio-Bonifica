import type { ConnectorRunContext } from '../../shared/types';

export function createNasCatastoRunContext(): ConnectorRunContext {
  return {
    connectorName: 'connector-nas-catasto',
    sourceSystem: 'nas-catasto',
    executionMode: 'manual',
    startedAt: new Date().toISOString(),
  };
}
