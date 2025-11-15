export type XmlError = { message: string; code?: string; details?: string };
export function escapeXml(unsafe: string): string;
export function buildXmlDeclaration(): string;
export function buildRootStart(timestamp: string): string;
export function buildRootEnd(): string;
export function buildErrorSection(error: XmlError): string;
export function buildPackagesSection(rows: any[]): string;
export function buildSummarySection(summary: { totalOutdated?: number; safeUpdates?: number; filteredByAge?: number; filteredBySecurity?: number; minAge?: number; }): string;
export function buildThresholdsSection(thresholds: { prod?: { minAge?: number; minSeverity?: string; }; dev?: { minAge?: number; minSeverity?: string; }; }): string;
