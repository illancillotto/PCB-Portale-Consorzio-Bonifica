import { loadNasCatastoConfig } from './config';
import { persistNasCatastoRun } from './persistence';
import { runNasCatastoScan } from './scanner';

async function main() {
  const config = loadNasCatastoConfig();
  const report = await runNasCatastoScan(config);

  if (config.persistIngest) {
    const persisted = await persistNasCatastoRun(report, {
      ingestionRunId: process.env.PCB_INGESTION_RUN_ID,
    });
    report.persistence = {
      mode: 'persisted',
      ingestionRunId: persisted.ingestionRunId,
      recordsPersisted: persisted.recordsPersisted,
    };
  } else {
    report.persistence = {
      mode: 'dry-run',
      ingestionRunId: null,
      recordsPersisted: 0,
    };
  }

  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown connector error';
  process.stderr.write(`connector-nas-catasto failed: ${message}\n`);
  process.exitCode = 1;
});
