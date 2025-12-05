/**
 * Tests for security linting
 * @supports prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md REQ-AUDIT-CHECK
 */

import path from 'path';
import { fileURLToPath } from 'url';
import { ESLint } from 'eslint';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('Story 004.0-DEV-FILTER-VULNERABLE-VERSIONS: ESLint security plugin', () => {
  it('[REQ-AUDIT-CHECK] should report detect-object-injection warning', async () => {
    const eslint = new ESLint({
      overrideConfigFile: path.resolve(__dirname, '../eslint.config.js'),
    });
    const code = 'const obj = {}; console.log(obj[userInput]);';

    const results = await eslint.lintText(code, {
      filePath: path.resolve(__dirname, 'test.js'),
    });
    const messages = results[0].messages;
    const hasDetectObjectInjection = messages.some((msg) => msg.ruleId === 'security/detect-object-injection');
    expect(hasDetectObjectInjection).toBe(true);
  });
});
