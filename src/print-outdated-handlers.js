// @ts-nocheck - delegate handlers for printOutdated function

import {
  handleJsonOutput as delegateJsonOutput,
  handleXmlOutput as delegateXmlOutput,
  handleTableOutput as delegateTableOutput,
} from './print-outdated-utils.js';

/**
 * Handle JSON output for printOutdated function.
 * @story prompts/008.0-DEV-JSON-OUTPUT.md
 * @req REQ-HANDLER-JSON - Delegate JSON output handling
 * @param {{ rows: Array<[string, string, string, string, number|string, string]>, summary: Object, thresholds: Object, vulnMap: Map<string, object>, filterReasonMap: Map<string,string> }} options - Options for JSON output handler.
 * @returns {Object} summary object returned from filtering.
 */
export function handleJsonOutput(options) {
  return delegateJsonOutput(options);
}

/**
 * Handle XML output for printOutdated function.
 * @story prompts/009.0-DEV-XML-OUTPUT.md
 * @req REQ-HANDLER-XML - Delegate XML output handling
 * @param {{ rows: Array<any>, summary: Object, thresholds: Object, vulnMap: Map<string, object>, filterReasonMap: Map<string,string> }} options - Options for XML output handler.
 * @returns {Object} summary object returned from filtering.
 */
export function handleXmlOutput(options) {
  return delegateXmlOutput(options);
}

/**
 * Handle table output for printOutdated function.
 * @story prompts/001.0-DEV-RUN-NPM-OUTDATED.md
 * @req REQ-HANDLER-TABLE - Delegate table output handling
 * @param {{ safeRows: Array<Array>, matureRows: Array<Array>, summary: Object, prodMinAge: number, devMinAge: number, returnSummary: boolean }} options - Options for table output handler.
 * @returns {Object|undefined} summary when returnSummary is true or undefined otherwise.
 */
export function handleTableOutput(options) {
  return delegateTableOutput(options);
}