/**
 * @story prompts/dry-aged-deps-user-story-map.md
 * @req UNKNOWN - Placeholder traceability annotation
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
