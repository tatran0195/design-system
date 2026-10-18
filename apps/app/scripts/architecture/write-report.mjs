import { execFileSync } from 'node:child_process';
import { writeFile } from 'node:fs/promises';
/** Evidence lives in the repository, so its producer must honor the same
 * formatter gate instead of exempting generated reports from quality checks. */
export async function writeReport(path, report) {
  await writeFile(path, `${JSON.stringify(report, null, 2)}\n`);
  execFileSync('bun', ['x', '--no-install', 'biome', 'format', path, '--write'], { stdio: 'pipe' });
}
