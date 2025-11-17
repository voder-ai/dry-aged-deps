/**
 * Tests for security linting
 * @story prompts/004.0-DEV-FILTER-VULNERABLE-VERSIONS.md
 * @req REQ-SECURITY-LINT - Detect security lint warnings on code snippets
 */

import path from 'path';
import { fileURLToPath } from 'url';
import { ESLint } from 'eslint';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('ESLint security plugin', () => {
  it('should report detect-object-injection warning', async () => {
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
